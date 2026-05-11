---
name: weekly-report
description: "Generate weekly team call report from Clockify time entries. Use when: creating standup speech, weekly status update, sprint summary, team call, what did I do this week, отчёт за неделю, что я сделал, краткий спич, командный колл, итоги недели."
argument-hint: "<start-date> <end-date>  (e.g. 2026-05-04 2026-05-10)"
---

# Weekly Report from Clockify

Generates a concise bullet-point speech for a weekly team call from your Clockify time entries.
Output is in **Russian first, then English**.

## When to Use
- You need to prepare a brief speech for a weekly/daily team call
- You want a summary of tasks worked on during a given week
- Invoke with: `/weekly-report 2026-05-04 2026-05-10`

## Prerequisites

1. **Config file** `~/.clockify.json` must exist and be filled in.
   Copy the template from [assets/config-template.json](./assets/config-template.json):
   ```json
   {
     "apiKey": "...",
     "workspaceId": "...",
     "userId": "...",
     "projectId": "..."
   }
   ```
   - `apiKey`: Clockify → Profile Settings → API
   - `workspaceId`: visible in the URL `app.clockify.me/.../<workspaceId>/...`
   - `userId`: Clockify → Profile Settings → your user ID
   - `projectId`: the ID of the target project (URL or API)

2. **Node.js 18+** must be installed (`node --version`).

## Procedure

### Step 1 — Get dates
If the user did not provide `<start-date>` and `<end-date>` as arguments, ask for the date range (YYYY-MM-DD format).

### Step 2 — Fetch time entries
Run the script:
```bash
node ~/.copilot/skills/weekly-report/scripts/fetch-clockify.js <start-date> <end-date>
```
The script reads `~/.clockify.json`, calls the Clockify API, and outputs a JSON array:
```json
[
  { "description": "Task name", "totalMinutes": 120 },
  ...
]
```
If the script fails, show the error message and ask the user to check their `~/.clockify.json`.

### Step 3 — Generate the report
Using the JSON output:
- Format each entry as a bullet point: **task description** — ~X h (round `totalMinutes` to nearest 0.5 h, e.g. 75 min → ~1.5 h, 50 min → ~1 h)
- Skip entries with less than 15 minutes total
- Sort bullets by time descending (already sorted by script)
- Do NOT group into sections — flat list only

### Step 4 — Output both languages
Output the result twice, separated by a divider:

```
**RU**
• <task> — ~X ч
• <task> — ~X ч

---

**EN**
• <task> — ~X h
• <task> — ~X h
```

Keep each bullet concise — one line, no sub-bullets.
Do not add any commentary, headers beyond RU/EN, or meta text.
