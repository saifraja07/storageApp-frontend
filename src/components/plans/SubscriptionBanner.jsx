import { PLAN_BY_ID } from "../../config/plans";

// A banner is only for what the billing card can't say on its own: right after
// paying, before the plan exists yet. Every other state (failed payment, paused,
// cancelling…) is explained once, on the billing card itself.
export default function SubscriptionBanner({ subscription }) {
  if (subscription.status !== "authenticated") return null;

  const planName = PLAN_BY_ID[subscription.planId]?.name ?? "paid";

  return (
    <div role="status" style={{
      display: "flex", alignItems: "flex-start", gap: 10,
      padding: "12px 16px", borderRadius: 10, marginBottom: 20,
      background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)",
    }}>
      <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1, color: "var(--status-blue-text)" }}>●</span>
      <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6, margin: 0 }}>
        <strong>Payment received.</strong> We&apos;re activating your {planName} plan — this can take a few minutes. You don&apos;t need to pay again.
      </p>
    </div>
  );
}
