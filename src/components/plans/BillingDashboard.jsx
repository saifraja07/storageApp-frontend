import { useState } from "react";
import { PLAN_BY_ID } from "../../config/plans";
import { fmtDate } from "../../utils/subscriptionUtils";
import { getPaymentHistory } from "../../api/subscriptionApi";
import Spin from "./Spin";
import StatusBadge from "./StatusBadge";
import PaymentHistory from "./PaymentHistory";

export default function BillingDashboard({ subscription, premiumActive, onUpdatePayment, onCancel, cancelLoading, showToast }) {
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
        ? <span style={{ color: "var(--status-green-text)", fontWeight: 600 }}>Active until {fmtDate(currentEnd)}</span>
        : <span style={{ color: "var(--status-red-text)", fontWeight: 600 }}>Expired</span> },
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
        background: danger ? "rgba(239,68,68,0.12)" : "var(--surface-tint-strong)",
        border: `1px solid ${danger ? "rgba(239,68,68,0.3)" : "var(--border)"}`,
        color: danger ? "var(--status-red-text)" : "var(--text)",
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
      <PaymentHistory visible={showHistory} loading={paymentsLoading} payments={payments} />
    </div>
  );
}
