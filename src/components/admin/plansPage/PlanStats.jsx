import { memo } from "react";
import { User, Crown, IndianRupee, TrendingUp, Wallet, CalendarDays } from "lucide-react";
import { SkeletonCard } from "../../SkeletonLoading";
import { formatINR } from "./money";

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
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  const cancelling = summary.cancellingUsers ?? 0;
  const paying = summary.payingSubscribers ?? 0;
  const failing = summary.pastDueUsers ?? 0;
  const expiring = summary.expiringSoon ?? 0;

  // Revenue = money actually received (a cancelled customer's payment still counts).
  // MRR = what customers who will renew bring in per month.
  const cards = [
    { label: "Total Users", value: (summary.totalUsers ?? 0).toLocaleString(), icon: User, color: "#3B82F6" },
    {
      label: "Premium Users",
      value: (summary.premiumUsers ?? 0).toLocaleString(),
      hint: [`${paying} paying`, cancelling > 0 && `${cancelling} cancelling`].filter(Boolean).join(" · "),
      icon: Crown,
      color: "var(--status-purple-text)",
    },
    {
      label: "Revenue This Month",
      value: formatINR(summary.revenueThisMonth),
      hint: `${formatINR(summary.revenueLastMonth)} last month`,
      icon: IndianRupee,
      color: "#10B981",
    },
    { label: "Revenue This Year", value: formatINR(summary.revenueThisYear), icon: CalendarDays, color: "#8B5CF6" },
    {
      label: "Lifetime Revenue",
      value: formatINR(summary.lifetimeRevenue),
      hint: (summary.refundedTotal ?? 0) > 0 ? `after ${formatINR(summary.refundedTotal)} refunded` : undefined,
      icon: Wallet,
      color: "#F59E0B",
    },
    {
      label: "Active Premium (MRR)",
      value: formatINR(summary.mrr),
      hint: "per month, renewing only",
      icon: TrendingUp,
      color: "#06B6D4",
    },
  ];

  // Only things that need a look — shown when non-zero, otherwise nothing.
  const alerts = [
    failing > 0 && { text: `${failing} payment${failing === 1 ? "" : "s"} failing`, color: "var(--status-amber-text)", bg: "rgba(245,158,11,0.12)" },
    expiring > 0 && { text: `${expiring} plan${expiring === 1 ? "" : "s"} ending within 7 days`, color: "var(--status-orange-text)", bg: "rgba(249,115,22,0.12)" },
  ].filter(Boolean);

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12,
          marginBottom: alerts.length ? 12 : 24,
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
            {s.hint && (
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4, opacity: 0.8 }}>{s.hint}</div>
            )}
          </div>
        ))}
      </div>
      {alerts.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
          {alerts.map((a) => (
            <span key={a.text} style={{ padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, color: a.color, background: a.bg }}>
              {a.text}
            </span>
          ))}
        </div>
      )}
    </>
  );
});

export default PlanStats;
