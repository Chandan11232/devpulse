import { useState } from "react";
import styles from "./SQLConsole.module.css";

const EXAMPLE_QUERIES = [
  {
    label: "PR → Error correlation",
    sql: `SELECT p.title, p.user_login, COUNT(e.id) AS errors
FROM github.pulls p
LEFT JOIN sentry.events e
  ON e.date_received BETWEEN p.merged_at AND p.merged_at + INTERVAL '3 days'
WHERE p.org = 'YOUR_ORG' AND p.state = 'closed'
GROUP BY p.title, p.user_login
ORDER BY errors DESC
LIMIT 10`,
  },
  {
    label: "Fatal Sentry issues",
    sql: `SELECT title, culprit, times_seen, first_seen, last_seen
FROM sentry.issues
WHERE organization_slug = 'YOUR_SENTRY_ORG'
  AND level = 'fatal'
ORDER BY times_seen DESC
LIMIT 20`,
  },
  {
    label: "Coral schema catalog",
    sql: `SELECT schema_name, table_name, description
FROM coral.tables
ORDER BY schema_name, table_name`,
  },
  {
    label: "Slack incident messages",
    sql: `SELECT user, text, ts
FROM slack.messages
WHERE channel_name = 'incidents'
  AND (LOWER(text) LIKE '%error%' OR LOWER(text) LIKE '%down%')
ORDER BY ts DESC
LIMIT 25`,
  },
];

export default function SQLConsole({ onQuery }) {
  const [sql, setSql] = useState(EXAMPLE_QUERIES[0].sql);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!sql.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await onQuery(sql);
      setResult(res.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = result?.length ? Object.keys(result[0]) : [];

  return (
    <div className={styles.console}>
      <div className={styles.topBar}>
        <span className={styles.label}>Coral SQL Console</span>
        <div className={styles.examples}>
          {EXAMPLE_QUERIES.map((q) => (
            <button key={q.label} className={styles.exampleBtn} onClick={() => setSql(q.sql)}>
              {q.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.editorWrap}>
        <textarea
          className={styles.editor}
          value={sql}
          onChange={(e) => setSql(e.target.value)}
          spellCheck={false}
          rows={10}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              run();
            }
          }}
        />
        <button className={styles.runBtn} onClick={run} disabled={loading}>
          {loading ? "Running…" : "▶ Run  ⌘↵"}
        </button>
      </div>

      {error && (
        <div className={styles.errorBox}>
          <span className={styles.errorLabel}>Error</span>
          <pre>{error}</pre>
        </div>
      )}

      {result && !error && (
        <div className={styles.resultWrap}>
          <div className={styles.resultMeta}>
            {result.length} row{result.length !== 1 ? "s" : ""}
          </div>
          {result.length === 0 ? (
            <p className={styles.noRows}>Query returned no rows.</p>
          ) : (
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    {columns.map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.map((row, i) => (
                    <tr key={i}>
                      {columns.map((col) => (
                        <td key={col}>{String(row[col] ?? "")}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
