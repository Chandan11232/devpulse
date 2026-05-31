# DevPulse — Developer Health Dashboard powered by Coral

> Built for WeMakeDevs × Coral "Pirates of the Coral-bean" Hackathon

DevPulse is a cross-source developer intelligence dashboard. It uses **Coral** to join GitHub, Sentry, and Slack data in a single SQL query — surfacing insights like which PRs caused the most post-merge errors, which engineers ship the most, and which Slack channels are full of incident signals.

## Features

- **PR → Error Correlation** — GitHub × Sentry cross-join: which pull requests correlated with the most errors in the 3 days after merging?
- **Team Velocity** — GitHub: PRs merged, issues closed, avg PR cycle time, lines changed per engineer
- **Incident Hotspots** — Sentry × Slack CROSS JOIN: which projects have the most fatal errors AND the most Slack responders?
- **Slack Incident Signal** — Slack: who is sending the most incident-related messages?
- **Live SQL Console** — run any Coral SQL query against your live sources from the browser

## Coral features used

| Feature | How |
|---|---|
| SQL interface | All 4 dashboard queries + custom console |
| Cross-source JOINs | GitHub × Sentry, Sentry × Slack |
| Schema learning | `coral.tables` introspection in SQL console |
| Caching | Coral's built-in caching speeds up repeated dashboard loads |
| MCP integration | `.cursor/mcp.json` wires Coral to Claude Code / Cursor |

## Setup

### 1. Install Coral & connect sources

```bash
chmod +x setup-coral.sh && ./setup-coral.sh
```

Or manually:

```bash
brew install withcoral/tap/coral
coral source add --interactive github
coral source add --interactive sentry
coral source add --interactive slack
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and fill in:

| Variable | Where to get it |
|---|---|
| `GITHUB_ORG` | Your GitHub org name (e.g. `acme-corp`) |
| `GITHUB_TOKEN` | GitHub PAT or `gh auth token` |
| `SENTRY_ORG` | Your Sentry org slug |
| `SENTRY_TOKEN` | Sentry internal integration token |
| `SLACK_TOKEN` | Slack bot/user OAuth token |
| `SLACK_INCIDENT_CHANNEL` | Channel name without `#` (default: `incidents`) |
| `LOOKBACK_DAYS` | Days of history to query (default: `30`) |

### 3. Start the backend

```bash
cd backend && npm install && npm run dev
```

### 4. Start the frontend

```bash
cd frontend && npm install && npm run dev
```

Open http://localhost:5173

### 5. (Optional) MCP integration for Claude Code / Cursor

```bash
claude mcp add --scope user coral -- coral mcp-stdio
```

Or just open the project in Cursor — `.cursor/mcp.json` is already configured.

## Project structure

```
devpulse/
├── backend/
│   ├── server.js       ← Express API; runs Coral CLI via child_process
│   ├── queries.js      ← All Coral SQL queries (edit vars at top)
│   ├── parser.js       ← Coral JSON output parser
│   └── .env.example
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── api.js
│       └── components/
│           ├── PRErrorTable.jsx
│           ├── VelocityChart.jsx
│           ├── HotspotPanel.jsx
│           ├── SlackSignal.jsx
│           └── SQLConsole.jsx
├── setup-coral.sh
└── .cursor/mcp.json    ← MCP config for Claude Code / Cursor
```

## Architecture

```
Browser → Vite Dev Server → Express (backend/server.js)
                                   ↓
                            execAsync("coral sql ...")
                                   ↓
                         Coral CLI (local, cached)
                         /         |         \
                    GitHub API  Sentry API  Slack API
```

Coral handles auth, pagination, and rate limits for every source. The backend simply shells out to `coral sql` and streams back JSON results. All credentials stay local — they never leave your machine.
