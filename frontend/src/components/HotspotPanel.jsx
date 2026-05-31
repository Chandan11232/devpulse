import styles from "./HotspotPanel.module.css";

export default function HotspotPanel({ rows = [] }) {
  if (!rows.length)
    return (
      <p className={styles.empty}>
        No data — ensure Sentry source is connected.
      </p>
    );

  const sorted = [...rows].sort(
    (a, b) => Number(b.occurrences) - Number(a.occurrences),
  );

  return (
    <div className={styles.list}>
      {sorted.map((row, i) => {
        const occurrences = Number(row.occurrences ?? 0);
        const maxOccurrences = Number(sorted[0]?.occurrences ?? 1);
        const barWidth = Math.max(4, (occurrences / maxOccurrences) * 100);

        return (
          <div key={i} className={styles.row}>
            <div className={styles.meta}>
              <span className={styles.project}>{row.issue_title}</span>
              <span className={`${styles.level} ${styles[row.level] || ""}`}>
                {row.level}
              </span>
            </div>
            <div className={styles.barTrack}>
              <div className={styles.bar} style={{ width: `${barWidth}%` }} />
            </div>
            <div className={styles.stats}>
              <span>{occurrences.toLocaleString()} occurrences</span>
              <span>{row.user_count ?? 0} users affected</span>
              <span>{row.status}</span>
              <span>{row.project}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
