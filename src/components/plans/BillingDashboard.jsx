import { useState } from "react";
import { TriangleAlert } from "lucide-react";
import { getMyPayments } from "../../api/subscriptionApi";
import { CANCELLABLE_STATUSES, describePlan, getBillingSummary } from "../../utils/planState";
import { fmtDate, fmtDaysLeft } from "../../utils/subscriptionUtils";
import { FREE_STORAGE_BYTES } from "../../config/plans";
import { formatStorage } from "../../utils/directoryUtils";
import Spin from "./Spin";
import PaymentHistory from "./PaymentHistory";

const TONES = {
  green: { text: "var(--status-green-text)", bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.3)" },
  blue: { text: "var(--status-blue-text)", bg: "rgba(56,189,248,0.12)", border: "rgba(56,189,248,0.3)" },
  amber: { text: "var(--status-amber-text)", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)" },
  orange: { text: "var(--status-orange-text)", bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.3)" },
};

// The user's current plan: what it is, what happens next, and only the actions
// that make sense right now. Everything it says comes from getBillingSummary.
export default function BillingDashboard({
  subscription, usedBytes = 0, onUpdatePayment, onCancel, cancelLoading, showToast,
}) {
  const [payments, setPayments] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  const { status, currentEnd } = subscription;
  const info = describePlan(subscription);
  const summary = getBillingSummary(subscription);
  const tone = TONES[summary.tone];
  const PlanIcon = info?.plan.emoji;
  const planColor = info?.plan.color ?? "var(--primary)";

  const canCancel = CANCELLABLE_STATUSES.includes(status);
  const canUpdatePayment = ["active", "authenticated", "pending", "paused"].includes(status);
  const needsPaymentFix = status === "pending";

  // The plan will end by itself and the user stores more than Free allows.
  const overBytes = summary.ending ? Math.max(0, usedBytes - FREE_STORAGE_BYTES) : 0;

  // Progress through the paid period, only while it's counting down to an end.
  const showCountdown = summary.ending || status === "pending";
  const totalDays = info?.plan.cycle === "yearly" ? 365 : 30;
  const progress = Math.min(100, Math.max(0, ((totalDays - summary.days) / totalDays) * 100));

  async function loadHistory() {
    setHistoryLoading(true);
    setHistoryError(false);
    try {
      const data = await getMyPayments();
      setPayments(data.payments ?? []);
    } catch {
      setHistoryError(true);
    } finally {
      setHistoryLoading(false);
    }
  }

  function toggleHistory() {
    const next = !historyOpen;
    setHistoryOpen(next);
    if (next && payments === null && !historyLoading) loadHistory();
  }

  async function handleUpdatePayment() {
    // Open the tab right now (inside the click) so pop-up blockers allow it,
    // then point it at Razorpay once the link arrives.
    const tab = window.open("about:blank", "_blank");
    setUpdateLoading(true);
    try {
      const data = await onUpdatePayment(subscription.subscriptionId);
      if (!data?.updateUrl) throw new Error("no link");
      if (tab) { tab.opener = null; tab.location.href = data.updateUrl; }
      else window.location.assign(data.updateUrl);
    } catch (err) {
      tab?.close();
      showToast("error", err?.response?.data?.error || "Couldn't open the payment page. Please try again.");
    } finally {
      setUpdateLoading(false);
    }
  }

  return (
    <section className="bd-card" aria-label="Your plan" style={{ ["--accent"]: planColor }}>
      <style>{CSS}</style>

      {/* Header: which plan, and its state */}
      <header className="bd-head">
        <div className="bd-plan">
          <span className="bd-icon" aria-hidden="true">{PlanIcon && <PlanIcon size={18} />}</span>
          <div style={{ minWidth: 0 }}>
            <div className="bd-plan-name">{info ? `${info.name} plan` : "Your plan"}</div>
            {info && <div className="bd-plan-sub">{info.cycleLabel} · {info.priceLabel}</div>}
          </div>
        </div>
        <span className="bd-chip" style={{ color: tone.text, background: tone.bg, borderColor: tone.border }}>
          <span className="bd-dot" style={{ background: tone.text }} aria-hidden="true" />
          {summary.label}
        </span>
      </header>

      {/* What's happening next */}
      <div className="bd-body" aria-live="polite">
        <h2 className="bd-headline">{summary.headline}</h2>
        <p className="bd-detail">{summary.detail}</p>

        {showCountdown && currentEnd && (
          <div className="bd-countdown">
            <div className="bd-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)} aria-label="Time used in this billing period">
              <div className="bd-bar-fill" style={{ width: `${progress}%`, background: tone.text }} />
            </div>
            <span className="bd-days" style={{ color: tone.text }}>{fmtDaysLeft(summary.days)}</span>
          </div>
        )}

        {/* Only when it matters: the plan is ending and files won't fit on Free */}
        {overBytes > 0 && (
          <div className="bd-alert" role="alert">
            <TriangleAlert size={16} aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} />
            <p>
              You&apos;re using <strong>{formatStorage(usedBytes)}</strong>, but Free includes {formatStorage(FREE_STORAGE_BYTES)}.
              After <strong>{fmtDate(currentEnd)}</strong>, your oldest files beyond that limit are permanently deleted.
              Free up at least <strong>{formatStorage(overBytes)}</strong> before then.
            </p>
          </div>
        )}
      </div>

      {/* Actions: only what applies right now */}
      <div className="bd-actions">
        {canUpdatePayment && (
          <button type="button" className={`bd-btn ${needsPaymentFix ? "bd-btn-primary" : ""}`} onClick={handleUpdatePayment} disabled={updateLoading}>
            {updateLoading && <Spin size={12} />}
            Update payment method
          </button>
        )}
        <button type="button" className="bd-btn" onClick={toggleHistory} aria-expanded={historyOpen}>
          {historyOpen ? "Hide payment history" : "Payment history"}
        </button>
        {canCancel && (
          <button type="button" className="bd-cancel" onClick={onCancel} disabled={cancelLoading}>
            {cancelLoading ? "Cancelling…" : "Cancel plan"}
          </button>
        )}
      </div>

      {/* History */}
      {historyOpen && (
        <div className="bd-history">
          {historyError ? (
            <div className="bd-error">
              <span>Couldn&apos;t load your payments.</span>
              <button type="button" className="bd-btn" onClick={loadHistory}>Try again</button>
            </div>
          ) : (
            <PaymentHistory visible loading={historyLoading} payments={payments} />
          )}
        </div>
      )}
    </section>
  );
}

const CSS = `
.bd-card{background:var(--surface);border:1px solid var(--border);border-left:3px solid var(--accent);border-radius:14px;margin-bottom:28px;overflow:hidden;animation:bd-in .3s ease both}
.bd-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:16px 20px 0}
.bd-plan{display:flex;align-items:center;gap:12px;min-width:0}
.bd-icon{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--accent);background:color-mix(in srgb,var(--accent) 14%,transparent)}
.bd-plan-name{font-size:15px;font-weight:700;color:var(--text)}
.bd-plan-sub{font-size:12px;color:var(--muted);margin-top:1px}
.bd-chip{display:inline-flex;align-items:center;gap:6px;padding:4px 11px;border-radius:100px;font-size:12px;font-weight:600;border:1px solid;white-space:nowrap}
.bd-dot{width:6px;height:6px;border-radius:50%}
.bd-body{padding:16px 20px 4px}
.bd-headline{font-size:20px;font-weight:700;color:var(--text);margin:0 0 4px;line-height:1.3}
.bd-detail{font-size:13px;color:var(--muted);line-height:1.55;margin:0;max-width:560px}
.bd-countdown{display:flex;align-items:center;gap:12px;margin-top:14px;max-width:420px}
.bd-bar{flex:1;height:6px;border-radius:3px;background:var(--surface-tint-strong);overflow:hidden}
.bd-bar-fill{height:100%;border-radius:3px;transition:width .6s ease}
.bd-days{font-size:12px;font-weight:600;white-space:nowrap}
.bd-alert{display:flex;gap:10px;margin-top:16px;padding:12px 14px;border-radius:10px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.25);color:var(--status-red-text)}
.bd-alert p{margin:0;font-size:13px;line-height:1.55;color:var(--text)}
.bd-actions{display:flex;align-items:center;flex-wrap:wrap;gap:8px;padding:16px 20px 18px}
.bd-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:8px 14px;border-radius:8px;font-size:13px;font-weight:500;font-family:inherit;cursor:pointer;background:var(--surface-tint-strong);border:1px solid var(--border);color:var(--text);transition:background .15s,border-color .15s,transform .1s}
.bd-btn:hover:not(:disabled){background:var(--surface-hover);border-color:var(--accent)}
.bd-btn:active:not(:disabled){transform:scale(.98)}
.bd-btn:disabled{opacity:.6;cursor:not-allowed}
.bd-btn-primary{background:var(--primary);border-color:var(--primary);color:#fff;font-weight:600}
.bd-btn-primary:hover:not(:disabled){background:var(--primary-hover);border-color:var(--primary-hover)}
.bd-cancel{margin-left:auto;background:none;border:none;padding:8px 4px;font-size:13px;font-family:inherit;color:var(--muted);cursor:pointer;text-decoration:underline;text-underline-offset:3px;transition:color .15s}
.bd-cancel:hover:not(:disabled){color:var(--status-red-text-strong)}
.bd-cancel:disabled{opacity:.6;cursor:wait}
.bd-btn:focus-visible,.bd-cancel:focus-visible{outline:2px solid var(--primary);outline-offset:2px}
.bd-history{border-top:1px solid var(--border);animation:bd-in .25s ease both}
.bd-error{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:18px 20px;font-size:13px;color:var(--muted)}
@keyframes bd-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@media (max-width:560px){
  .bd-head,.bd-body{padding-left:16px;padding-right:16px}
  .bd-actions{padding:14px 16px 16px}
  .bd-actions .bd-btn{flex:1 1 100%}
  .bd-cancel{margin:4px auto 0}
  .bd-headline{font-size:18px}
}
@media (prefers-reduced-motion:reduce){.bd-card,.bd-history{animation:none}.bd-bar-fill,.bd-btn{transition:none}}
`;
