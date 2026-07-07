import { memo } from "react";
import { User, Crown, IndianRupee, TrendingUp } from "lucide-react";
import { SkeletonCard } from "../../SkeletonLoading";

function formatINR(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

const PlanStats = memo(function PlanStats({ summary, loading }) {
  if (loading) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {[...Array(4)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  const cards = [
    { label: "Total Users", value: (summary.totalUsers ?? 0).toLocaleString(), icon: User, color: "#3B82F6" },
    { label: "Premium Users", value: (summary.premiumUsers ?? 0).toLocaleString(), icon: Crown, color: "#8B5CF6" },
    { label: "Monthly Revenue", value: formatINR(summary.monthlyRevenue), icon: IndianRupee, color: "#10B981" },
    { label: "Yearly Revenue", value: formatINR(summary.yearlyRevenue), icon: TrendingUp, color: "#F59E0B" },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
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
          <div style={{ fontSize: 20, marginBottom: 6, color: s.color }}>
            <s.icon size={20} aria-hidden="true" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: s.color, wordBreak: "break-word" }}>
            {s.value}
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
});

export default PlanStats;
