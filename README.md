# clockify-weekly-report-skill

A GitHub Copilot skill that fetches your time entries from Clockify and generates a concise spoken-language summary for weekly team calls — output in **Russian and English**.

## What it produces

A short bullet-point speech ready to read aloud at a standup or weekly sync. Each bullet covers one task or feature: what was done and the current status. No raw commit messages, no time numbers — just natural language.

**Example output:**
```
**RU**
• CA Location Sources Import — Реализовал полный пайплайн импорта данных, настроил валидацию и загрузку в базу. В работе.
• Bug #42 (Checkout form) — Исправил баг с валидацией, внёс правки после ревью. Ожидает финального ревью.

---

**EN**
• CA Location Sources Import — Built the full data import pipeline with validation and DB loading. In progress.
• Bug #42 (Checkout form) — Fixed validation bug, applied review feedback. Awaiting final review.
```

---

## Prerequisites

- **Node.js 18+** — verify with `node --version`
- A **Clockify account** with time entries logged

---

## Setup: `~/.clockify.json`

Create the config file by copying the template:

```bash
cp ~/.copilot/skills/weekly-report/assets/config-template.json ~/.clockify.json
```

Then fill in your values:

```json
{
  "apiKey": "...",
  "workspaceId": "...",
  "userId": "...",
  "projectId": "..."
}
```

### Where to find each value

| Field | Where to find it |
|---|---|
| `apiKey` | Clockify → top-right avatar → **Profile Settings** → **API** → copy the key |
| `workspaceId` | Look at the URL when logged in: `app.clockify.me/.../<workspaceId>/...` — it's the long ID segment |
| `userId` | Same **Profile Settings** page — your user ID is shown under your name |
| `projectId` | Open your project in Clockify — the ID is in the URL, or use the [Clockify API](https://clockify.me/developers-api) (`GET /workspaces/{id}/projects`) |

> **Note:** The API key is a plain string — paste it as-is, no encoding needed.

---

## Usage

### GitHub Copilot Chat (VS Code / JetBrains / Web)

Once the skill is installed at `~/.copilot/skills/weekly-report/SKILL.md`, invoke it in chat:

```
/weekly-report 2026-05-04 2026-05-11
```

Copilot will run the fetch script, group your time entries, and output the bilingual report.

### GitHub Copilot in VS Code — Agent mode

Open the Copilot Chat panel, switch to **Agent** mode, and type:

```
@workspace /weekly-report 2026-05-04 2026-05-11
```

Or just describe what you want — the skill's description includes trigger phrases in both English and Russian, so Copilot will pick it up automatically:

> *"what did I do this week"* / *"что я сделал на этой неделе"* / *"подготовь спич для командного колла"*

### JetBrains IDEs (IntelliJ, WebStorm, Rider, etc.)

Open the GitHub Copilot Chat panel and use the same slash command:

```
/weekly-report 2026-05-04 2026-05-11
```

### Running the fetch script directly (CLI)

```bash
node ~/.copilot/skills/weekly-report/scripts/fetch-clockify.js 2026-05-04 2026-05-11
```

Outputs a raw JSON array of aggregated time entries — useful for debugging or building your own report format.

---

## Skill file location

The skill is defined in [`SKILL.md`](./SKILL.md). Copilot reads it from `~/.copilot/skills/weekly-report/SKILL.md` automatically when the skills directory is configured.
