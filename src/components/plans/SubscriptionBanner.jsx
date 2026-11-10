import { PLAN_BY_ID } from "../../config/plans";
import { fmtDate } from "../../utils/subscriptionUtils";

// Only states that need the user's attention get a banner. A plain active plan
// is the normal case — the billing card below already says everything.
export default function SubscriptionBanner({ subscription }) {
  const { status, currentEnd } = subscription;
  const endDate = fmtDate(currentEnd);
  const planName = PLAN_BY_ID[subscription.planId]?.name ?? "paid";

  const banners = {
    authenticated: {
      color: "var(--status-blue-text)", bg: "rgba(56,189,248,0.08)", border: "rgba(56,189,248,0.2)",
      text: <><strong>Payment received.</strong> We&apos;re activating your {planName} plan — this can take a few minutes. You don&apos;t need to pay again.</>,
    },
    pending: {
      color: "var(--status-amber-text)", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)",
      text: <><strong>We couldn&apos;t process your last payment.</strong> We&apos;ll retry automatically. Your plan stays active until <strong>{endDate}</strong> — update your payment method to avoid losing it.</>,
    },
    paused: {
      color: "var(--status-amber-text)", bg: "rgba(234,179,8,0.08)", border: "rgba(234,179,8,0.2)",
      text: <><strong>Auto-renewal is paused.</strong> Your plan stays active until <strong>{endDate}</strong>.</>,
    },
    cancelled: {
      color: "var(--status-orange-text)", bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.2)",
      text: <><strong>Your plan is cancelled.</strong> You keep {planName} until <strong>{endDate}</strong>, then move to the Free plan. You won&apos;t be charged again.</>,
    },
    halted: {
      color: "var(--status-red-text)", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)",
      text: <><strong>Your plan has expired.</strong> Choose a plan to get your storage back.</>,
    },
    expired: {
      color: "var(--status-red-text)", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)",
      text: <><strong>Your plan has expired.</strong> Choose a plan to get your storage back.</>,
    },
  };

  const b = banners[status];
  if (!b) return null;

  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 10,
      padding: "12px 16px", borderRadius: 10, marginBottom: 20,
      background: b.bg, border: `1px solid ${b.border}`,
    }}>
      <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1, color: b.color }}>●</span>
      <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6 }}>{b.text}</p>
    </div>
  );
}
