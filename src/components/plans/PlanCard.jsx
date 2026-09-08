import { Check } from "lucide-react";
import Spin from "./Spin";

export default function PlanCard({ plan, activeSubscription, premiumActive, onSelect, loadingId }) {
  const isCurrentPaid = !plan.isFree && activeSubscription?.planId === plan.razorpayId;

  // Free card shows "Current Plan" when user has no active paid subscription
  const isFreeCurrentPlan = plan.isFree && !premiumActive &&
    (!activeSubscription || !["active", "authenticated", "pending", "paused"].includes(activeSubscription?.status));

  const isCurrent = isCurrentPaid && premiumActive;
  const isDowngrade = plan.isFree && premiumActive;
  const isLoading = loadingId === plan.razorpayId;
  const isBlocked = premiumActive && !plan.isFree && !isCurrentPaid;

  // Determine badge text on the card (not top badge — that's plan.badge)
  let cardStatusLabel = null;
  if (isFreeCurrentPlan)  cardStatusLabel = { text: "Current Plan", color: "#6B7280" };
  if (isCurrent) {
    const labels = {
      active:        "Current Plan",
      pending:       "Renewal Pending",
      paused:        "Paused",
      cancelled:     "Auto-renew Off",
      authenticated: "Awaiting Payment",
    };
    cardStatusLabel = { text: labels[activeSubscription.status] || "Current Plan", color: plan.color };
  }

  // CTA label
  let ctaLabel = `Upgrade to ${plan.name}`;
  if (plan.isFree)       ctaLabel = isDowngrade ? "Downgrade" : "Current Plan";
  if (isCurrent)         ctaLabel = cardStatusLabel?.text || "Current Plan";
  if (isBlocked)         ctaLabel = "Not Available";

  const ctaDisabled = plan.isFree || isCurrent || isBlocked || !!loadingId;

  return (
    <div style={{
      background: isCurrent ? `${plan.color}0D` : "var(--surface)",
      border: `1px solid ${isCurrent ? `${plan.color}55` : "var(--border)"}`,
      borderRadius: 16, padding: "22px 20px",
      position: "relative", display: "flex", flexDirection: "column",
      boxShadow: isCurrent ? `0 0 0 1px ${plan.color}33` : "none",
      transition: "border-color 0.15s",
    }}>
      {/* Top badge (Most Popular / Best Value) */}
      {plan.badge && (
        <div style={{
          position: "absolute", top: -10, right: 16,
          background: plan.color, color: "#fff",
          fontSize: 10, fontWeight: 700, padding: "3px 10px",
          borderRadius: 10, letterSpacing: 0.4,
        }}>{plan.badge}</div>
      )}

      {/* Card status label (Current Plan, Paused, etc.) */}
      {cardStatusLabel && (
        <div style={{
          position: "absolute", top: 14, right: 16,
          fontSize: 10, fontWeight: 700, color: cardStatusLabel.color,
          background: `${cardStatusLabel.color}22`,
          padding: "2px 8px", borderRadius: 100,
        }}>{cardStatusLabel.text}</div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `${plan.color}22`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
        }}><plan.emoji size={18} aria-hidden="true" /></div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{plan.name}</div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>{plan.tagline}</div>
        </div>
      </div>

      {/* Price */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
        <span style={{ fontSize: 30, fontWeight: 800, color: plan.color }}>{plan.price}</span>
        <span style={{ fontSize: 12, color: "var(--muted)" }}>{plan.period}</span>
      </div>
      <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 18 }}>{plan.storage} storage</div>

      {/* Features */}
      <ul style={{ flex: 1, marginBottom: 20, listStyle: "none" }}>
        {plan.features.map((f) => (
          <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8, fontSize: 13, color: "var(--text)" }}>
            <span style={{ color: plan.color, fontWeight: 700, flexShrink: 0, marginTop: 1, display: "flex" }}>
              <Check size={14} aria-hidden="true" />
            </span>
            {f}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        disabled={ctaDisabled}
        onClick={() => !ctaDisabled && onSelect(plan)}
        style={{
          width: "100%", padding: "11px 0",
          background: ctaDisabled ? "var(--surface-tint-strong)" : plan.color,
          color: ctaDisabled ? "var(--muted)" : "#fff",
          border: ctaDisabled ? "1px solid var(--border)" : "none",
          borderRadius: 9, fontSize: 13, fontWeight: 700,
          cursor: ctaDisabled ? "not-allowed" : "pointer",
          fontFamily: "Inter,sans-serif",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          transition: "opacity 0.15s",
        }}
        onMouseOver={(e) => { if (!ctaDisabled) e.currentTarget.style.opacity = "0.88"; }}
        onMouseOut={(e) => { e.currentTarget.style.opacity = "1"; }}
      >
        {isLoading && <Spin />}
        {ctaLabel}
      </button>
    </div>
  );
}
