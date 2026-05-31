import styles from "./SlackSignal.module.css";

export default function SlackSignal({ rows = [] }) {
  if (!rows.length)
    return (
      <p className={styles.empty}>
        No data — ensure Slack source is connected.
      </p>
    );

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Channel</th>
            <th>Members</th>
            <th>Topic</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td>
                <span className={styles.user}>#{row.channel_name}</span>
              </td>
              <td className={styles.mono}>{Number(row.num_members ?? 0)}</td>
              <td className={styles.mono}>{row.topic || "—"}</td>
              <td className={styles.mono}>{row.purpose || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
