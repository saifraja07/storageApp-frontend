import { useEffect, useState, useCallback, useRef } from "react";
import {
  Gift,
  Zap,
  Crown,
  Check,
  TriangleAlert,
  Package,
  Lock,
  Calendar,
  Banknote,
  PartyPopper,
} from "lucide-react";
import AppLayout from "../components/AppLayout";
import { useUser } from "../context/UserContext";
import { formatStorage } from "../utils/directoryUtils";
import { logError } from "../utils/logger";
import toast from "react-hot-toast";
import {
  createSubscription,
  getActiveSubscription,
  cancelSubscription,
  getUpdatePaymentLink,
  getPaymentHistory,
  verifySubscription,
} from "../api/subscriptionApi";

// ─── Plan catalogue ───────────────────────────────────────────────────────────
// Only 4 real Razorpay plans. Free cards are informational only.

const FREE_PLAN_MONTHLY = {
  id: "free-monthly",
  razorpayId: null,
  name: "Free",
  tagline: "Always free",
  storage: "512 MB",
  storageBytes: 0.5 * 1024 ** 3,
  price: "₹0",
  period: "/mo",
  color: "#6B7280",
  emoji: Gift,
  features: ["512 MB cloud storage", "Access from 1 device", "No size limits", "Upload limit: 20 files at a time", "Basic support"],
  isFree: true,
};

const FREE_PLAN_YEARLY = {
  id: "free-yearly",
  razorpayId: null,
  name: "Free",
  tagline: "Always free",
  storage: "512 MB",
  storageBytes: 0.5 * 1024 ** 3,
  price: "₹0",
  period: "/yr",
  color: "#6B7280",
  emoji: Gift,
  features: ["512 MB cloud storage", "Access from 1 device", "No size limits", "Upload limits: 20 files at a time", "Basic support"],
  isFree: true,
};

const PLAN_CATALOG = {
  monthly: [
    FREE_PLAN_MONTHLY,
    {
      id: "plan_T7QOKw1SWn3YA9",
      razorpayId: "plan_T7QOKw1SWn3YA9",
      name: "Pro",
      tagline: "Great for individuals",
      storage: "100 GB",
      storageBytes: 100 * 1024 ** 3,
      price: "₹169",
      period: "/mo",
      color: "#3B82F6",
      emoji: Zap,
      badge: "Most Popular",
      features: ["100 GB cloud storage", "Access from up to 3 device", "No size limits", "Priority uploads", "Email support"],
      isFree: false,
    },
    {
      id: "plan_T7QTobe7VSThyp",
      razorpayId: "plan_T7QTobe7VSThyp",
      name: "Premium",
      tagline: "For creators & teams",
      storage: "500 GB",
      storageBytes: 500 * 1024 ** 3,
      price: "₹499",
      period: "/mo",
      color: "#8B5CF6",
      emoji: Crown,
      badge: "Best Value",
      features: ["500 GB cloud storage", "Everything in Pro", "Access from up to 4 device", "Priority support", "Secure encrypted storage"],
      isFree: false,
    },
  ],
  yearly: [
    FREE_PLAN_YEARLY,
    {
      id: "plan_T7QPutFKX9ueS5",
      razorpayId: "plan_T7QPutFKX9ueS5",
      name: "Pro",
      tagline: "Great for individuals",
      storage: "100 GB",
      storageBytes: 100 * 1024 ** 3,
      price: "₹1,599",
      period: "/yr",
      color: "#3B82F6",
      emoji: Zap,
      badge: "Most Popular",
      features: ["100 GB cloud storage", "Access from up to 3 device", "No size limits", "Priority uploads", "Email support"],
      isFree: false,
    },
    {
      id: "plan_T7QV7r2nId24Vo",
      razorpayId: "plan_T7QV7r2nId24Vo",
      name: "Premium",
      tagline: "For creators & teams",
      storage: "500 GB",
      storageBytes: 500 * 1024 ** 3,
      price: "₹4,999",
      period: "/yr",
      color: "#8B5CF6",
      emoji: Crown,
      badge: "Best Value",
      features: ["500 GB cloud storage", "Everything in Pro", "Access from up to 4 device",  "Priority support", "Secure encrypted storage"],
      isFree: false,
    },
  ],
};

// Map razorpayId → plan object (all tabs)
const ALL_PLANS = [...PLAN_CATALOG.monthly, ...PLAN_CATALOG.yearly];
const PLAN_BY_ID = Object.fromEntries(
  ALL_PLANS.filter((p) => p.razorpayId).map((p) => [p.razorpayId, p])
);

// ─── Razorpay SDK loader ──────────────────────────────────────────────────────

let sdkPromise = null;
function loadRazorpaySDK() {
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve) => {
    if (typeof window.Razorpay !== "undefined") { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.id = "razorpay-script";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
  return sdkPromise;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function fmtAmount(amount) {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

// ─── Toast (new UI style) ─────────────────────────────────────────────────────

// ─── Loading Overlay (new UI style) ──────────────────────────────────────────

function PaymentOverlay({ phase }) {
  const messages = {
    creating: "Creating your subscription…",
    verifying: "Verifying your payment…",
    activating: "Activating your storage — please don't close this page.",
  };
  return (
    <div role="status" style={{
      position: "fixed", inset: 0, zIndex: 99,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(11,18,32,0.85)", backdropFilter: "blur(4px)",
    }}>
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 16, padding: "32px 40px", maxWidth: 360,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
      }}>
        <div style={{
          width: 40, height: 40,
          border: "3px solid rgba(59,130,246,0.25)", borderTopColor: "#3B82F6",
          borderRadius: "50%", animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{ fontSize: 14, color: "var(--text)", textAlign: "center", fontWeight: 500, lineHeight: 1.5 }}>
          {messages[phase]}
        </p>
      </div>
    </div>
  );
}

// ─── Spinner (inline) ─────────────────────────────────────────────────────────

function Spin({ size = 14 }) {
  return (
    <span style={{
      display: "inline-block", width: size, height: size,
      border: `2px solid rgba(255,255,255,0.25)`, borderTopColor: "#fff",
      borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0,
    }} />
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const map = {
    active:        { bg: "rgba(52,211,153,0.15)",  text: "#34D399"  },
    authenticated: { bg: "rgba(56,189,248,0.15)",  text: "#7DD3FC"  },
    pending:       { bg: "rgba(245,158,11,0.15)",  text: "#FCD34D"  },
    paused:        { bg: "rgba(234,179,8,0.15)",   text: "#FDE047"  },
    cancelled:     { bg: "rgba(249,115,22,0.15)",  text: "#FB923C"  },
    halted:        { bg: "rgba(239,68,68,0.15)",   text: "#FCA5A5"  },
    expired:       { bg: "rgba(239,68,68,0.15)",   text: "#FCA5A5"  },
    created:       { bg: "rgba(148,163,184,0.15)", text: "#94A3B8"  },
  };
  const c = map[status] || map.created;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600,
      background: c.bg, color: c.text, textTransform: "capitalize",
    }}>{status}</span>
  );
}

// ─── State Banner ─────────────────────────────────────────────────────────────

function StateBanner({ subscription }) {
  const { status, currentEnd } = subscription;
  const endDate = fmtDate(currentEnd);

  const banners = {
    created: {
      color: "#94A3B8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.2)",
      text: <><strong>Subscription created.</strong> Complete checkout to activate your premium storage.</>,
    },
    active: {
      color: "#34D399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.2)",
      text: <><strong>Premium storage is active.</strong> Next renewal: <strong>{endDate}</strong></>,
    },
    authenticated: {
      color: "#7DD3FC", bg: "rgba(56,189,248,0.08)", border: "rgba(56,189,248,0.2)",
      text: <><strong>Payment mandate registered.</strong> Waiting for first charge — premium will activate automatically.</>,
    },
    pending: {
      color: "#FCD34D", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)",
      text: <><strong>Renewal payment failed.</strong> Razorpay is retrying. Premium remains active until <strong>{endDate}</strong>.</>,
    },
    paused: {
      color: "#FDE047", bg: "rgba(234,179,8,0.08)", border: "rgba(234,179,8,0.2)",
      text: <><strong>AutoPay paused.</strong> Premium remains active until <strong>{endDate}</strong>. Resume before then to avoid downgrade.</>,
    },
    cancelled: {
      color: "#FB923C", bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.2)",
      text: <><strong>Auto-renewal cancelled.</strong> Premium access until <strong>{endDate}</strong>. No further charges.</>,
    },
    halted: {
      color: "#FCA5A5", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)",
      text: <><strong>Subscription halted.</strong> All retries failed — premium storage has expired. Choose a plan to continue.</>,
    },
    expired: {
      color: "#FCA5A5", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)",
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

// ─── Billing Dashboard ────────────────────────────────────────────────────────

function BillingDashboard({ subscription, premiumActive, onUpdatePayment, onCancel, cancelLoading, showToast }) {
  const [payments, setPayments] = useState(null);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  const { status, currentEnd, lastChargedAt, paymentMethod } = subscription;
  const planObj = PLAN_BY_ID[subscription.planId];
  const planName = planObj ? `${planObj.name} (${planObj.storage})` : subscription.planId;

  const showCancelBtn       = ["active", "authenticated"].includes(status);
  const showUpdatePaymentBtn = ["active", "authenticated", "pending", "paused", "cancelled"].includes(status);

  const renewalLabel = {
    active: "Next Renewal", pending: "Premium Until", paused: "Premium Until",
    cancelled: "Premium Until", authenticated: "First Charge",
    halted: "Halted On", expired: "Expired On",
  }[status] ?? "Billing Until";

  async function handleLoadHistory() {
    if (payments !== null) { setShowHistory((v) => !v); return; }
    setPaymentsLoading(true);
    setShowHistory(true);
    try {
      const data = await getPaymentHistory(subscription.subscriptionId);
      setPayments(data.payments);
    } catch (err) {
      showToast("error", err?.response?.data?.error || "Failed to load payment history.");
      setShowHistory(false);
    } finally {
      setPaymentsLoading(false);
    }
  }

  async function handleUpdatePayment() {
    setUpdateLoading(true);
    try {
      const data = await onUpdatePayment(subscription.subscriptionId);
      if (data?.updateUrl) window.open(data.updateUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      showToast("error", err?.response?.data?.error || "Could not open payment update page.");
    } finally {
      setUpdateLoading(false);
    }
  }

  const gridItems = [
    { label: "Plan",           value: planName },
    { label: "Premium Access", value: premiumActive
        ? <span style={{ color: "#34D399", fontWeight: 600 }}>Active until {fmtDate(currentEnd)}</span>
        : <span style={{ color: "#FCA5A5", fontWeight: 600 }}>Expired</span> },
    { label: renewalLabel,     value: fmtDate(currentEnd) },
    { label: "Last Payment",   value: lastChargedAt ? fmtDate(lastChargedAt) : "—" },
    { label: "Payment Method", value: paymentMethod ?? "—" },
  ];

  const actionBtn = (label, onClick, disabled, loading, danger = false) => (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled || loading ? 0.6 : 1,
        fontFamily: "Inter,sans-serif", transition: "background 0.15s",
        background: danger ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.06)",
        border: `1px solid ${danger ? "rgba(239,68,68,0.3)" : "var(--border)"}`,
        color: danger ? "#FCA5A5" : "var(--text)",
      }}
    >
      {loading && <Spin size={12} />}
      {label}
    </button>
  );

  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 14, marginBottom: 28, overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 20px", borderBottom: "1px solid var(--border)",
      }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Current Subscription</span>
        <StatusBadge status={status} />
      </div>

      {/* Details grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "1px", background: "var(--border)" }}>
        {gridItems.map((item) => (
          <div key={item.label} style={{ background: "var(--surface)", padding: "12px 16px" }}>
            <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.4 }}>{item.label}</p>
            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "14px 20px", borderTop: "1px solid var(--border)" }}>
        {showUpdatePaymentBtn && actionBtn("Update Payment Method", handleUpdatePayment, false, updateLoading)}
        {actionBtn(showHistory ? "Hide History" : "Payment History", handleLoadHistory, false, paymentsLoading)}
        {showCancelBtn && (
          <div style={{ marginLeft: "auto" }}>
            {actionBtn(cancelLoading ? "Cancelling…" : "Cancel Subscription", onCancel, false, cancelLoading, true)}
          </div>
        )}
      </div>

      {/* Payment History */}
      {showHistory && (
        <div style={{ borderTop: "1px solid var(--border)" }}>
          {paymentsLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "28px 0" }}>
              <Spin size={20} />
            </div>
          ) : payments && payments.length === 0 ? (
            <p style={{ padding: "24px 20px", fontSize: 13, color: "var(--muted)", textAlign: "center" }}>No payments found.</p>
          ) : payments ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 480 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["Date", "Amount", "Method", "Status", "Invoice"].map((h) => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p, idx) => (
                    <tr key={p.invoiceId ?? idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding: "10px 16px", color: "var(--text)" }}>{fmtDate(p.createdAt)}</td>
                      <td style={{ padding: "10px 16px", fontWeight: 600, color: "var(--text)" }}>{fmtAmount(p.amount)}</td>
                      <td style={{ padding: "10px 16px", color: "var(--muted)", textTransform: "capitalize" }}>{p.paymentMethod ?? "—"}</td>
                      <td style={{ padding: "10px 16px" }}>
                        <span style={{
                          padding: "2px 8px", borderRadius: 100, fontSize: 11, fontWeight: 600,
                          background: p.status === "captured" ? "rgba(52,211,153,0.15)" : "rgba(239,68,68,0.15)",
                          color: p.status === "captured" ? "#34D399" : "#FCA5A5",
                        }}>
                          {p.status === "captured" ? "paid" : p.status}
                        </span>
                      </td>
                      <td style={{ padding: "10px 16px" }}>
                        {p.invoiceUrl ? (
                          <a
                            href={p.invoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: 12, color: "var(--primary)", fontWeight: 500, textDecoration: "none" }}
                          >
                            Download
                          </a>
                        ) : <span style={{ color: "var(--muted)", fontSize: 12 }}>—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

// ─── Plan Card ────────────────────────────────────────────────────────────────

function PlanCard({ plan, activeSubscription, premiumActive, onSelect, loadingId }) {
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
          background: ctaDisabled ? "rgba(255,255,255,0.06)" : plan.color,
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

// ─── Storage Bar ──────────────────────────────────────────────────────────────

function StorageBar({ user, activeSubscription, premiumActive }) {
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
        <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden", marginBottom: 8 }}>
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


// ─── Cancel Confirm Modal ──────────────────────────────────────────────────────

function CancelConfirmModal({ plan, endDate, onConfirm, onClose, loading }) {
  const consequences = [
    { icon: Package, text: `Storage drops to 500 MB (Free tier) at end of billing period.` },
    { icon: Lock, text: "Files exceeding free tier limit will become inaccessible (deleted)." },
    { icon: Calendar, text: `Premium access continues until your billing period ends${endDate ? ` (${endDate})` : ""}.` },
    { icon: Banknote, text: "No refund for the current billing period — you keep access until it ends." },
  ];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16,
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#0f1d32", border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: 18, padding: "28px 24px", maxWidth: 440, width: "100%",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
            <TriangleAlert size={22} aria-hidden="true" />
          </div>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: "#FCA5A5", marginBottom: 4 }}>Cancel Subscription?</h3>
            <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>
              Before you proceed, here's what happens when you cancel your current plan:
            </p>
          </div>
        </div>

        {/* Consequences list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {consequences.map((c, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 10, padding: "10px 12px",
            }}>
              <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1, display: "flex" }}>
                <c.icon size={16} aria-hidden="true" />
              </span>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>{c.text}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              flex: 1, padding: "11px 16px", borderRadius: 10, fontSize: 14, fontWeight: 600,
              background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)",
              color: "var(--text)", cursor: "pointer",
            }}
          >Keep My Plan</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1, padding: "11px 16px", borderRadius: 10, fontSize: 14, fontWeight: 600,
              background: loading ? "rgba(239,68,68,0.4)" : "rgba(239,68,68,0.85)",
              border: "1px solid rgba(239,68,68,0.5)",
              color: "#fff", cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {loading ? (
              <>
                <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                Cancelling…
              </>
            ) : "Yes, Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PlansPage() {
  const { user, refreshUser } = useUser();
  const [mode, setMode] = useState("monthly");
  const [loadingId, setLoadingId] = useState(null);
  const [overlayPhase, setOverlayPhase] = useState(null);
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [premiumActive, setPremiumActive] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [subLoading, setSubLoading] = useState(true);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const plans = PLAN_CATALOG[mode];

  const showToast = useCallback((type, message) => {
    if (type === "success") return toast.success(message);
    if (type === "error") return toast.error(message);
    return toast(message, {
      icon: <TriangleAlert size={16} color="#FCD34D" aria-hidden="true" />,
      style: {
        background: "#1F2937",
        border: "1px solid rgba(245,158,11,0.35)",
        color: "#F9FAFB",
      },
    });
  }, []);

  const refreshSubscription = useCallback(async () => {
    try {
      const data = await getActiveSubscription();
      if (mounted.current) {
        setActiveSubscription(data.subscription);
        setPremiumActive(data.isPremiumActive ?? false);
      }
      return data;
    } catch (err) {
      logError("refreshSubscription failed:", err);
      return null;
    }
  }, []);

  // Fetch subscription + preload Razorpay SDK on mount
  useEffect(() => {
    loadRazorpaySDK();
    refreshSubscription().finally(() => { if (mounted.current) setSubLoading(false); });
  }, [refreshSubscription]);

  // ── Polling after checkout ──────────────────────────────────────────────────
  const pollForActivation = useCallback(async () => {
    const POLL_INTERVAL = 2000;
    const POLL_TIMEOUT  = 30000;
    const TERMINAL = new Set(["active", "pending", "paused", "cancelled", "halted", "expired"]);
    const start = Date.now();

    return new Promise((resolve) => {
      async function tick() {
        if (!mounted.current) { resolve("unmounted"); return; }
        try {
          const data = await getActiveSubscription();
          const sub = data.subscription;
          if (sub && TERMINAL.has(sub.status)) { resolve(sub.status); return; }
          if (Date.now() - start >= POLL_TIMEOUT) { resolve("timeout"); return; }
          setTimeout(tick, POLL_INTERVAL);
        } catch {
          if (Date.now() - start >= POLL_TIMEOUT) { resolve("timeout"); return; }
          setTimeout(tick, POLL_INTERVAL);
        }
      }
      setTimeout(tick, POLL_INTERVAL);
    });
  }, []);

  // ── Checkout handler ────────────────────────────────────────────────────────
  async function handleSelect(plan) {
    if (plan.isFree || loadingId) return;

    if (premiumActive) {
      showToast("warning", "You already have active premium storage. Cancel your current plan first to switch.");
      return;
    }

    setLoadingId(plan.razorpayId);
    setOverlayPhase("creating");

    const sdkReady = await loadRazorpaySDK();
    if (!sdkReady) {
      setOverlayPhase(null); setLoadingId(null);
      showToast("error", "Payment SDK failed to load. Please refresh and try again.");
      return;
    }

    let subscriptionId;
    try {
      const data = await createSubscription(plan.razorpayId);
      subscriptionId = data.subscriptionId;
      setOverlayPhase(null); setLoadingId(null);
    } catch (err) {
      setOverlayPhase(null); setLoadingId(null);
      const msg = err?.response?.status === 409
        ? "You already have an active subscription."
        : (err?.response?.data?.error || "Failed to create subscription. Please try again.");
      showToast("error", msg);
      return;
    }

    openRazorpayCheckout({
      subscriptionId,
      plan,
      async onSuccess(response) {
        setOverlayPhase("verifying");
        try {
          await verifySubscription({
            razorpay_subscription_id: response.razorpay_subscription_id,
            razorpay_payment_id:      response.razorpay_payment_id,
            razorpay_signature:       response.razorpay_signature,
          });
        } catch (err) {
          setOverlayPhase(null);
          showToast("error", err?.response?.data?.error || "Payment verification failed. Please contact support.");
          return;
        }

        setOverlayPhase("activating");
        const outcome = await pollForActivation();
        const freshData = await refreshSubscription();
        // Refresh user so storage quota in sidebar/header updates
        if (refreshUser) await refreshUser();
        setOverlayPhase(null);

        const freshEnd = freshData?.subscription?.currentEnd;
        switch (outcome) {
          case "active":
            showToast(
              "success",
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <PartyPopper size={14} aria-hidden="true" /> Premium storage activated successfully!
              </span>
            );
            break;
          case "pending":
            showToast("warning", `Payment received. Renewal is pending. Premium active until ${fmtDate(freshEnd)}.`);
            break;
          case "halted":
            showToast("error", "Subscription halted. Premium could not be activated. Please contact support.");
            break;
          case "timeout":
            showToast("warning", "Payment received. Activation is taking longer than expected — please refresh in a few moments.");
            break;
          default:
            break;
        }
      },
      onDismiss() {
        showToast("warning", "Payment cancelled. You can try again whenever you're ready.");
        refreshSubscription();
      },
      onFail(message) {
        showToast("error", message);
        refreshSubscription();
      },
    });
  }

  function handleCancelPlan() {
    if (!activeSubscription) return;
    setShowCancelModal(true);
  }

  async function confirmCancelPlan() {
    if (!activeSubscription) return;
    setCancelLoading(true);
    try {
      await cancelSubscription(activeSubscription.subscriptionId);
      setShowCancelModal(false);
      showToast("success", "Subscription cancelled. You keep premium access until the end of your billing period.");
      // Refresh immediately so UI reflects new state without needing a page reload
      await refreshSubscription();
    } catch (err) {
      showToast("error", err?.response?.data?.error || "Failed to cancel subscription.");
    } finally {
      setCancelLoading(false);
    }
  }

  async function handleUpdatePayment(subscriptionId) {
    return getUpdatePaymentLink(subscriptionId);
  }

  return (
    <AppLayout>
      {overlayPhase && <PaymentOverlay phase={overlayPhase} />}
      {showCancelModal && (
        <CancelConfirmModal
          plan={activeSubscription ? (PLAN_BY_ID[activeSubscription.planId]?.name || activeSubscription.planId) : null}
          endDate={activeSubscription?.currentEnd ? new Date(activeSubscription.currentEnd).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : null}
          onConfirm={confirmCancelPlan}
          onClose={() => !cancelLoading && setShowCancelModal(false)}
          loading={cancelLoading}
        />
      )}

      <div style={{ padding: "28px 24px", maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
            {activeSubscription ? "Billing & Plans" : "Choose Your Plan"}
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted)", maxWidth: 480 }}>
            Manage your storage subscription. Upgrades take effect immediately after payment.
          </p>
        </div>

        {/* Storage bar */}
        <StorageBar user={user} activeSubscription={activeSubscription} premiumActive={premiumActive} />

        {/* Subscription loading skeleton */}
        {subLoading && (
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 14, padding: 24, marginBottom: 28,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          }}>
            <Spin size={16} />
            <span style={{ fontSize: 13, color: "var(--muted)" }}>Loading subscription…</span>
          </div>
        )}

        {/* State banner */}
        {!subLoading && activeSubscription && (
          <StateBanner subscription={activeSubscription} />
        )}

        {/* Billing dashboard */}
        {!subLoading && activeSubscription && (
          <BillingDashboard
            subscription={activeSubscription}
            premiumActive={premiumActive}
            onUpdatePayment={handleUpdatePayment}
            onCancel={handleCancelPlan}
            cancelLoading={cancelLoading}
            showToast={showToast}
          />
        )}

        {/* Billing cycle toggle */}
        <div style={{
          display: "inline-flex", gap: 4, marginBottom: 24,
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 10, padding: 4,
        }}>
          {["monthly", "yearly"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                padding: "7px 18px", borderRadius: 7, border: "none",
                fontSize: 13, fontWeight: 600, fontFamily: "Inter,sans-serif",
                background: mode === m ? "var(--primary)" : "transparent",
                color: mode === m ? "#fff" : "var(--muted)",
                cursor: "pointer", transition: "all 0.15s",
              }}
            >
              {m === "yearly" ? (
                <span>Yearly <span style={{ fontSize: 10, color: mode === "yearly" ? "rgba(255,255,255,0.7)" : "var(--primary)", marginLeft: 4 }}>(2 months off)</span></span>
              ) : "Monthly"}
            </button>
          ))}
        </div>

        {/* Plan cards — 2 column on desktop (Free + Pro + Premium = 3 per tab) */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
          gap: 18, marginBottom: 36,
        }}>
          {plans.map((plan) => (
            <PlanCard
              key={`${mode}-${plan.id}`}
              plan={plan}
              activeSubscription={activeSubscription}
              premiumActive={premiumActive}
              onSelect={handleSelect}
              loadingId={loadingId}
            />
          ))}
        </div>

        {/* FAQ */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 14, padding: "20px 24px",
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>
            Frequently asked questions
          </div>
          {[
            ["Can I cancel at any time?",
              "Yes — cancel from the billing dashboard. You keep premium access until the end of the current billing period. No hidden fees."],
            ["What happens to my files if I downgrade?",
              "If your usage exceeds 1 GB after downgrading, your oldest files will be deleted to bring you within the free limit. Download anything important first."],
            ["When does my storage upgrade?",
              "Storage upgrades automatically within seconds of a successful payment — confirmed by our webhook from Razorpay. No manual action needed."],
            ["Is my payment secure?",
              "Payments are processed entirely by Razorpay. We never store your card details. All connections are encrypted."],
          ].map(([q, a]) => (
            <div key={q} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>{q}</div>
              <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>{a}</div>
            </div>
          ))}
        </div>

        <p style={{ marginTop: 20, fontSize: 11, color: "var(--muted)", textAlign: "center" }}>
          Payments are processed securely by Razorpay. Subscriptions auto-renew each billing cycle and can be cancelled at any time.
        </p>
      </div>
    </AppLayout>
  );
}

// ─── Razorpay checkout opener ─────────────────────────────────────────────────

function openRazorpayCheckout({ subscriptionId, plan, onSuccess, onDismiss, onFail }) {
  if (typeof window.Razorpay === "undefined") {
    onFail("Payment SDK failed to load. Please refresh and try again.");
    return;
  }

  const rzp = new window.Razorpay({
    key:             import.meta.env.VITE_RAZORPAY_KEY_ID,
    name:            "Storage App",
    description:     `${plan.name} Plan — ${plan.storage} Storage`,
    subscription_id: subscriptionId,
    theme:           { color: "#3B82F6" },

    handler(response) {
      onSuccess(response);
    },

    modal: {
      ondismiss:    onDismiss,
      escape:       false,
      backdropclose: false,
    },
  });

  rzp.on("payment.failed", (response) => {
    onFail(response.error?.description ?? "Payment failed. Please try again.");
  });

  rzp.open();
}
