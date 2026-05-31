import styles from "./PRErrorTable.module.css";

function riskColor(errors) {
  if (errors === 0) return "low";
  if (errors < 50) return "medium";
  return "high";
}

export default function PRErrorTable({ rows = [] }) {
  if (!rows.length)
    return (
      <p className={styles.empty}>
        No data — ensure GitHub and Sentry sources are connected.
      </p>
    );

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>PR</th>
            <th>Author</th>
            <th>Merged</th>
            <th>Errors (3d after)</th>
            <th>Risk</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const errors = Number(row.errors_next_3_days ?? 0);
            const risk = riskColor(errors);
            return (
              <tr key={row.pr_number}>
                <td>
                  <span className={styles.prNum}>#{row.pr_number}</span>{" "}
                  <span className={styles.prTitle}>{row.pr_title}</span>
                </td>
                <td className={styles.author}>{row.author}</td>
                <td className={styles.mono}>
                  {row.created_date?.slice(0, 10) ?? "—"}
                </td>
                <td className={styles.mono}>
                  {Number(row.total_changes ?? 0).toLocaleString()}
                </td>
                <td>
                  <span className={`${styles.badge} ${styles[risk]}`}>
                    {risk}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
