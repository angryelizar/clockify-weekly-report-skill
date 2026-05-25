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

### Step 3 — Synthesize the report

The raw time entries contain multi-line technical commit-style descriptions. **Do not** copy them verbatim. Instead:

1. **Group strictly by task/ticket**. Build one bullet per unique task/ticket (for example: `#1146`, `#1200`, `#1122`).
2. **Never mix tasks in one bullet**. If one raw entry mentions several tasks, split its content across the corresponding task bullets.
3. **Do not create generic mixed bullets** like "coordination", "misc", or "other" if the work can be mapped to known tasks.
4. If a task has no explicit ID but clearly represents one coherent initiative, keep it as one separate named task bullet.
5. Merge all fragments that belong to the same task into that task's single bullet.
6. When the user asks for "strictly by tasks", prioritize task separation over thematic grouping.
7. **Summarize** the work done in natural, spoken language — as if you're telling a teammate what you did. Each bullet should be 1–3 sentences: what the task was, what you did, and where it stands now (if clear from the data).
8. **Skip** entries with less than 15 minutes total.
9. **Sort** by total time descending.

#### Style guide for each bullet:
- Start with the task name or ticket reference if present (e.g. `Task #1137`, `Bug #1142`)
- Follow with a short natural-language summary of what was accomplished
- End with current status if inferable (e.g. "ready for review", "in progress", "merged")
- Do NOT use technical jargon or copy raw commit messages — write as spoken speech
- Do NOT include time spent
- Exactly one task/ticket per bullet; no cross-task aggregation

#### Example of good output:
```
• User Authentication (#42) — Добавил поддержку OAuth2, покрыл тестами. После ревью внёс правки. Готово к мержу.
```

### Step 4 — Output both languages
Output the result twice, separated by a divider. Write each bullet naturally in the target language — do NOT translate word-for-word.

```
**RU**
• <Название задачи (#номер)> — <что сделал, статус>

---

**EN**
• <Task name (#number)> — <what was done, status>
```

Do not add any commentary, headers beyond RU/EN, or meta text.
