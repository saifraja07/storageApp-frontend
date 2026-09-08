import { formatStorage } from "../../utils/directoryUtils";
import { PLAN_BY_ID } from "../../config/plans";

export default function StorageBar({ user, activeSubscription, premiumActive }) {
  const used = user?.usedStorageInBytes || 0;
  const max = user?.maxStorageInBytes || 1 * 1024 ** 3;
  const pct = Math.min((used / max) * 100, 100);
  const storageColor = pct >= 90 ? "#EF4444" : pct >= 70 ? "#F59E0B" : "var(--primary)";

  // Determine current plan display name
  let currentPlanName = "Free";
  let currentPlanColor = "#6B7280";
  if (premiumActive && activeSubscription) {
    const p = PLAN_BY_ID[activeSubscription.planId];
    if (p) { currentPlanName = p.name; currentPlanColor = p.color; }
  }

  return (
    <div style={{
      background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)",
      borderRadius: 14, padding: "18px 22px", marginBottom: 28,
      display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap",
    }}>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 }}>
          Storage Usage
        </div>
        <div style={{ height: 6, background: "var(--surface-tint-strong)", borderRadius: 3, overflow: "hidden", marginBottom: 8 }}>
          <div style={{ width: `${pct}%`, height: "100%", background: storageColor, borderRadius: 3, transition: "width 0.5s" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
          <span style={{ color: "var(--text)" }}>
            <strong>{formatStorage(used)}</strong>
            <span style={{ color: "var(--muted)" }}> of {formatStorage(max)} used</span>
          </span>
          <span style={{ color: "var(--muted)", fontSize: 12 }}>
            {formatStorage(max - used)} remaining
          </span>
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>Current Plan</div>
        <span style={{
          fontSize: 13, fontWeight: 700, color: "#fff",
          background: currentPlanColor, padding: "4px 14px", borderRadius: 20,
          display: "inline-block",
        }}>{currentPlanName}</span>
      </div>
    </div>
  );
}
