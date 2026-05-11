#!/usr/bin/env node
// fetch-clockify.js — fetches time entries for a date range and outputs JSON
// Usage: node fetch-clockify.js <start-date> <end-date>
// Example: node fetch-clockify.js 2026-05-04 2026-05-10
// Config file: ~/.clockify.json

import { readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";

const [, , startArg, endArg] = process.argv;

if (!startArg || !endArg) {
    console.error("Usage: node fetch-clockify.js <start-date> <end-date>");
    console.error("Example: node fetch-clockify.js 2026-05-04 2026-05-10");
    process.exit(1);
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
if (!DATE_RE.test(startArg) || !DATE_RE.test(endArg)) {
    console.error("Dates must be in YYYY-MM-DD format");
    process.exit(1);
}

// Load config
const configPath = join(homedir(), ".clockify.json");
let config;
try {
    config = JSON.parse(readFileSync(configPath, "utf8"));
} catch {
    console.error(`Cannot read config: ${configPath}`);
    console.error("Create it from the template at assets/config-template.json");
    process.exit(1);
}

const { apiKey, workspaceId, userId, projectId } = config;

for (const [key, val] of Object.entries({ apiKey, workspaceId, userId, projectId })) {
    if (!val || val.startsWith("YOUR_")) {
        console.error(`Config field "${key}" is not set in ~/.clockify.json`);
        process.exit(1);
    }
}

// Parse ISO 8601 duration PT#H#M#S -> seconds
function parseDuration(iso) {
    if (!iso) return 0;
    const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!m) return 0;
    return (parseInt(m[1] || 0) * 3600) + (parseInt(m[2] || 0) * 60) + parseInt(m[3] || 0);
}

// Fetch all time entries with pagination
async function fetchAllEntries() {
    const start = `${startArg}T00:00:00Z`;
    const end = `${endArg}T23:59:59Z`;
    const pageSize = 200;
    let page = 1;
    const all = [];

    while (true) {
        const params = new URLSearchParams({
            start,
            end,
            "page-size": pageSize,
            page,
        });
        const url = `https://api.clockify.me/api/v1/workspaces/${workspaceId}/user/${userId}/time-entries?${params}`;

        const res = await fetch(url, {
            headers: { "X-Api-Key": apiKey },
        });

        if (!res.ok) {
            const body = await res.text();
            console.error(`Clockify API error ${res.status}: ${body}`);
            process.exit(1);
        }

        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) break;
        all.push(...data);
        if (data.length < pageSize) break;
        page++;
    }

    return all;
}

// Group by description and sum durations
function aggregate(entries) {
    const map = new Map();

    for (const entry of entries) {
        const desc = (entry.description || "(no description)").trim();
        const seconds = parseDuration(entry.timeInterval?.duration);
        map.set(desc, (map.get(desc) || 0) + seconds);
    }

    return Array.from(map.entries())
        .map(([description, totalSeconds]) => ({
            description,
            totalMinutes: Math.round(totalSeconds / 60),
        }))
        .sort((a, b) => b.totalMinutes - a.totalMinutes);
}

const entries = await fetchAllEntries();
const result = aggregate(entries);
console.log(JSON.stringify(result, null, 2));
