import { fmtDate } from "../../utils/subscriptionUtils";

export default function SubscriptionBanner({ subscription }) {
  const { status, currentEnd } = subscription;
  const endDate = fmtDate(currentEnd);

  const banners = {
    created: {
      color: "#94A3B8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.2)",
      text: <><strong>Subscription created.</strong> Complete checkout to activate your premium storage.</>,
    },
    active: {
      color: "var(--status-green-text)", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.2)",
      text: <><strong>Premium storage is active.</strong> Next renewal: <strong>{endDate}</strong></>,
    },
    authenticated: {
      color: "var(--status-blue-text)", bg: "rgba(56,189,248,0.08)", border: "rgba(56,189,248,0.2)",
      text: <><strong>Payment mandate registered.</strong> Waiting for first charge — premium will activate automatically.</>,
    },
    pending: {
      color: "var(--status-amber-text)", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)",
      text: <><strong>Renewal payment failed.</strong> Razorpay is retrying. Premium remains active until <strong>{endDate}</strong>.</>,
    },
    paused: {
      color: "var(--status-amber-text)", bg: "rgba(234,179,8,0.08)", border: "rgba(234,179,8,0.2)",
      text: <><strong>AutoPay paused.</strong> Premium remains active until <strong>{endDate}</strong>. Resume before then to avoid downgrade.</>,
    },
    cancelled: {
      color: "var(--status-orange-text)", bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.2)",
      text: <><strong>Auto-renewal cancelled.</strong> Premium access until <strong>{endDate}</strong>. No further charges.</>,
    },
    halted: {
      color: "var(--status-red-text)", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)",
      text: <><strong>Subscription halted.</strong> All retries failed — premium storage has expired. Choose a plan to continue.</>,
    },
    expired: {
      color: "var(--status-red-text)", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)",
      text: <><strong>Subscription expired.</strong> Choose a plan to restore premium storage.</>,
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
