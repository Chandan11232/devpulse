import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import styles from "./VelocityChart.module.css";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipUser}>{label}</p>
      <p>
        Language: <strong>{d?.language}</strong>
      </p>
      <p>
        Total Commits: <strong>{d?.total_commits}</strong>
      </p>
      <p>
        Open Issues: <strong>{d?.open_issues}</strong>
      </p>
      <p>
        Full Name:{" "}
        <strong className={styles.monoSubtext}>{d?.full_name}</strong>
      </p>
    </div>
  );
};

export default function VelocityChart({ rows = [] }) {
  if (!rows.length)
    return (
      <p className={styles.empty}>
        No data — ensure GitHub source is connected.
      </p>
    );

  const data = rows.map((r) => ({
    ...r,
    total_commits: Number(r.total_commits ?? 0),
    open_issues: Number(r.open_issues ?? 0),
  }));

  const maxCommits = Math.max(...data.map((d) => d.total_commits), 1);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={data}
        margin={{ top: 12, right: 8, left: -20, bottom: 0 }}
      >
        <XAxis
          dataKey="name"
          tick={{
            fill: "#6b6b78",
            fontSize: 10,
            fontFamily: "DM Mono, monospace",
          }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{
            fill: "#6b6b78",
            fontSize: 11,
            fontFamily: "DM Mono, monospace",
          }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
        />

        {/* Primary Bar: Commits */}
        <Bar dataKey="total_commits" radius={[3, 3, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={index}
              fill={
                entry.total_commits === maxCommits ? "var(--accent)" : "#3b3b44"
              }
            />
          ))}
        </Bar>

        {/* Secondary Bar: Open Issues to add a professional data depth */}
        <Bar dataKey="open_issues" fill="var(--red)" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
