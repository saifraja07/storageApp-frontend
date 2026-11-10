import { useState } from "react";
import { fmtDate, fmtMethod } from "../../utils/subscriptionUtils";
import { CANCELLABLE_STATUSES, describePlan } from "../../utils/planState";
import { getPaymentHistory } from "../../api/subscriptionApi";
import Spin from "./Spin";
import StatusBadge from "./StatusBadge";
import PaymentHistory from "./PaymentHistory";

export default function BillingDashboard({ subscription, onUpdatePayment, onCancel, cancelLoading, showToast }) {
  const [payments, setPayments] = useState(null);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  const { status, currentEnd, lastChargedAt, paymentMethod } = subscription;
  const info = describePlan(subscription);

  const showCancelBtn = CANCELLABLE_STATUSES.includes(status);
  const showUpdatePaymentBtn = ["active", "authenticated", "pending", "paused"].includes(status);

  // One date, labelled for what it actually means in this state
  const dateLabel = {
    active: "Renews on", pending: "Access until", paused: "Access until",
    cancelled: "Access until", authenticated: "Activation",
    halted: "Ended on", expired: "Ended on",
  }[status] ?? "Billing until";
  const dateValue = status === "authenticated" && !currentEnd ? "In progress" : fmtDate(currentEnd);

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
    { label: "Plan", value: info ? info.name : "—" },
    { label: "Billing", value: info ? info.cycleLabel : "—" },
    { label: "Price", value: info ? info.priceLabel : "—" },
    { label: dateLabel, value: dateValue },
    { label: "Last Payment", value: lastChargedAt ? fmtDate(lastChargedAt) : "—" },
    { label: "Payment Method", value: fmtMethod(paymentMethod) },
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
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{info ? `${info.name} plan` : "Your plan"}</span>
        <StatusBadge status={status} />
      </div>

      {/* Details grid */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1px", background: "var(--border)" }}>
        {gridItems.map((item) => (
          <div key={item.label} style={{ background: "var(--surface)", padding: "12px 16px", flex: "1 1 150px" }}>
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
            {actionBtn(cancelLoading ? "Cancelling…" : "Cancel plan", onCancel, false, cancelLoading, true)}
          </div>
        )}
      </div>

      {/* Payment History */}
      <PaymentHistory visible={showHistory} loading={paymentsLoading} payments={payments} />
    </div>
  );
}
