import { useState, useEffect } from "react";
import { fetchSummary, fetchSources, runCustomQuery } from "./api.js";
import PRErrorTable from "./components/PRErrorTable.jsx";
import VelocityChart from "./components/VelocityChart.jsx";
import HotspotPanel from "./components/HotspotPanel.jsx";
import SlackSignal from "./components/SlackSignal.jsx";
import SQLConsole from "./components/SQLConsole.jsx";
import styles from "./App.module.css";

export default function App() {
  const [data, setData] = useState(null);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    Promise.all([fetchSummary(), fetchSources()])
      .then(([summary, srcs]) => {
        setData(summary);
        setSources(srcs.sources || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const refresh = () => {
    setLoading(true);
    setError(null);
    Promise.all([fetchSummary(), fetchSources()])
      .then(([summary, srcs]) => {
        setData(summary);
        setSources(srcs.sources || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoMark}>◈</span>
          <span className={styles.logoText}>DevPulse</span>
          <span className={styles.logoBadge}>powered by Coral</span>
        </div>

        <nav className={styles.nav}>
          <button
            className={`${styles.navBtn} ${activeTab === "dashboard" ? styles.navActive : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={`${styles.navBtn} ${activeTab === "sql" ? styles.navActive : ""}`}
            onClick={() => setActiveTab("sql")}
          >
            SQL Console
          </button>
        </nav>

        <div className={styles.headerRight}>
          <div className={styles.sources}>
            {sources.map((s) => (
              <span key={s.name || s} className={styles.sourceTag}>
                {s.name || s}
              </span>
            ))}
          </div>
          <button className={styles.refreshBtn} onClick={refresh} disabled={loading}>
            {loading ? "···" : "↻ Refresh"}
          </button>
        </div>
      </header>

      <main className={styles.main}>
        {activeTab === "dashboard" && (
          <>
            {loading && (
              <div className={styles.loadState}>
                <span className={styles.spinner} />
                Running cross-source Coral queries…
              </div>
            )}
            {error && (
              <div className={styles.errorBanner}>
                <strong>Error:</strong> {error}
                <button onClick={refresh} className={styles.retryBtn}>Retry</button>
              </div>
            )}
            {data && !loading && (
              <div className={styles.grid}>
                <section className={`${styles.card} ${styles.wide}`}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>PR → Error Correlation</h2>
                    <span className={styles.cardHint}>GitHub × Sentry</span>
                  </div>
                  <PRErrorTable rows={data.prErrors} />
                </section>

                <section className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>Team Velocity</h2>
                    <span className={styles.cardHint}>GitHub</span>
                  </div>
                  <VelocityChart rows={data.velocity} />
                </section>

                <section className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>Incident Hotspots</h2>
                    <span className={styles.cardHint}>Sentry × Slack</span>
                  </div>
                  <HotspotPanel rows={data.hotspots} />
                </section>

                <section className={`${styles.card} ${styles.wide}`}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>Slack Incident Signal</h2>
                    <span className={styles.cardHint}>Slack</span>
                  </div>
                  <SlackSignal rows={data.slack} />
                </section>
              </div>
            )}
          </>
        )}

        {activeTab === "sql" && (
          <SQLConsole onQuery={runCustomQuery} />
        )}
      </main>
    </div>
  );
}
