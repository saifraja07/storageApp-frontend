import { Check } from "lucide-react";
import Spin from "./Spin";
import { getPlanCardState } from "../../utils/planState";

export default function PlanCard({ plan, subscription, premiumActive, locked, onSelect, onDowngrade, loadingId }) {
  const { highlight, badge, cta } = getPlanCardState({ plan, subscription, premiumActive, locked });

  // `loadingId` starts as null and the Free plan's razorpayId is null too, so a bare
  // `loadingId === plan.razorpayId` was true on the Free card (a spinner that never stopped).
  const isLoading = !!loadingId && loadingId === plan.razorpayId;
  const ctaDisabled = cta.disabled || !!loadingId;

  function handleClick() {
    if (ctaDisabled) return;
    if (cta.action === "checkout") onSelect(plan);
    else if (cta.action === "downgrade") onDowngrade();
  }

  return (
    <div style={{
      background: highlight ? `color-mix(in srgb, ${plan.color} 5%, transparent)` : "var(--surface)",
      border: `1px solid ${highlight ? `color-mix(in srgb, ${plan.color} 33%, transparent)` : "var(--border)"}`,
      borderRadius: 16, padding: "22px 20px",
      position: "relative", display: "flex", flexDirection: "column",
      boxShadow: highlight ? `0 0 0 1px color-mix(in srgb, ${plan.color} 20%, transparent)` : "none",
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

      {/* Card status label (Current plan, Paused, Ends 12 Dec, etc.) */}
      {badge && (
        <div style={{
          position: "absolute", top: 14, right: 16,
          fontSize: 10, fontWeight: 700, color: plan.color,
          background: `color-mix(in srgb, ${plan.color} 14%, transparent)`,
          padding: "2px 8px", borderRadius: 100,
        }}>{badge}</div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `color-mix(in srgb, ${plan.color} 13%, transparent)`,
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
        onClick={handleClick}
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
        {cta.label}
      </button>
    </div>
  );
}
