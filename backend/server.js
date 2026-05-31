import express from "express";
import cors from "cors";
import "dotenv/config";
import { exec } from "child_process";
import { promisify } from "util";
import { coralQueries } from "./queries.js";
import { parseCoralOutput } from "./parser.js";
import * as Sentry from "@sentry/node";
Sentry.init({
  dsn: "https://acd271e752910ab2be3d8a94aaefd8c7@o4511485313613824.ingest.us.sentry.io/4511485331570688",
});

const execAsync = promisify(exec);
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());

async function runCoralSQL(sql) {
  const escaped = sql.replace(/"/g, '\\"');
  const { stdout, stderr } = await execAsync(
    `coral sql "${escaped}" --format json`,
    {
      timeout: 30000,
    },
  );
  if (stderr && !stdout) throw new Error(stderr);
  return parseCoralOutput(stdout);
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/sources", async (req, res) => {
  try {
    const { stdout } = await execAsync("coral source list");
    const lines = stdout.trim().split("\n").slice(2);
    const sources = lines
      .filter((l) => l.trim())
      .map((l) => ({ name: l.trim().split(/\s+/)[0] }));
    res.json({ sources });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/pr-error-correlation", async (req, res) => {
  try {
    const rows = await runCoralSQL(coralQueries.prErrorCorrelation);
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/team-velocity", async (req, res) => {
  try {
    const rows = await runCoralSQL(coralQueries.teamVelocity);
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/incident-hotspots", async (req, res) => {
  try {
    const rows = await runCoralSQL(coralQueries.incidentHotspots);
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/slack-signal", async (req, res) => {
  try {
    const rows = await runCoralSQL(coralQueries.slackSignal);
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/summary", async (req, res) => {
  try {
    const [prErrors, velocity, hotspots, slack] = await Promise.allSettled([
      runCoralSQL(coralQueries.prErrorCorrelation),
      runCoralSQL(coralQueries.teamVelocity),
      runCoralSQL(coralQueries.incidentHotspots),
      runCoralSQL(coralQueries.slackSignal),
    ]);

    res.json({
      prErrors: prErrors.status === "fulfilled" ? prErrors.value : [],
      velocity: velocity.status === "fulfilled" ? velocity.value : [],
      hotspots: hotspots.status === "fulfilled" ? hotspots.value : [],
      slack: slack.status === "fulfilled" ? slack.value : [],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/query", async (req, res) => {
  const { sql } = req.body;
  if (!sql) return res.status(400).json({ error: "sql is required" });

  const lower = sql.toLowerCase().trim();
  const forbidden = [
    "insert",
    "update",
    "delete",
    "drop",
    "create",
    "alter",
    "truncate",
  ];
  if (forbidden.some((kw) => lower.startsWith(kw))) {
    return res.status(400).json({ error: "Only SELECT queries are permitted" });
  }

  try {
    const rows = await runCoralSQL(sql);
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`DevPulse backend running on http://localhost:${PORT}`);
});
