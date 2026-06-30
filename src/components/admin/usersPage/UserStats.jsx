import { memo } from "react";

const UserStats = memo(function UserStats({ stats }) {
  const cards = [
    { label: "Total Users", value: stats.total, icon: "👤", color: "#3B82F6" },
    { label: "Online Now",  value: stats.active, icon: "🟢", color: "#10B981" },
    { label: "Admins",      value: stats.admins, icon: "🛡️", color: "#F59E0B" },
    { label: "Deleted",     value: stats.deleted, icon: "🗑️", color: "#EF4444" },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: 12,
        marginBottom: 24,
      }}
    >
      {cards.map((s) => (
        <div
          key={s.label}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "14px 16px",
          }}
        >
          <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>
            {s.value}
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
});

export default UserStats;
