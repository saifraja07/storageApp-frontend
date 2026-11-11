import AppLayout from "../components/AppLayout";
import { PLAN_CATALOG } from "../config/plans";
import useSubscription from "../hooks/useSubscription";
import { describePlan } from "../utils/planState";
import { fmtDate } from "../utils/subscriptionUtils";
import {
  BillingDashboard,
  BillingHistory,
  BillingToggle,
  CancelConfirmModal,
  EndedPlanBanner,
  PaymentOverlay,
  PlanCard,
  PlanChangeNote,
  PlansFAQ,
  PlansHeader,
  Spin,
  StorageBar,
  SubscriptionBanner,
} from "../components/plans";

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PlansPage() {
  const {
    user,
    mode,
    setMode,
    loadingId,
    overlayPhase,
    activeSubscription,
    endedSubscription,
    activationPending,
    premiumActive,
    cancelLoading,
    showCancelModal,
    setShowCancelModal,
    subLoading,
    subError,
    retryLoadSubscription,
    showToast,
    handleSelect,
    handleCancelPlan,
    confirmCancelPlan,
    handleUpdatePayment,
  } = useSubscription();

  const plans = PLAN_CATALOG[mode];
  // Until we know the user's real subscription, no card may claim to be (or offer to be) anything
  const locked = subLoading || subError;

  function scrollToPlans() {
    document.getElementById("plan-cards")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <AppLayout>
      {overlayPhase && <PaymentOverlay phase={overlayPhase} />}
      {showCancelModal && (
        <CancelConfirmModal
          endDate={activeSubscription?.currentEnd ? fmtDate(activeSubscription.currentEnd) : null}
          planName={describePlan(activeSubscription)?.name}
          usedBytes={user?.usedStorageInBytes ?? 0}
          onConfirm={confirmCancelPlan}
          onClose={() => !cancelLoading && setShowCancelModal(false)}
          loading={cancelLoading}
        />
      )}

      <div style={{ padding: "28px 24px", maxWidth: 1100, margin: "0 auto" }}>

        <PlansHeader activeSubscription={activeSubscription} />

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

        {/* Couldn't load — don't let a paying user look like they're on Free */}
        {subError && !subLoading && (
          <div role="alert" style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
            padding: "12px 16px", borderRadius: 10, marginBottom: 20,
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
          }}>
            <span style={{ fontSize: 13, color: "var(--text)" }}>We couldn&apos;t load your subscription.</span>
            <button
              onClick={retryLoadSubscription}
              style={{
                padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                background: "var(--surface-tint-strong)", border: "1px solid var(--border)", color: "var(--text)",
                fontFamily: "Inter,sans-serif",
              }}
            >Retry</button>
          </div>
        )}

        {/* Right after paying, before the plan exists */}
        {!subLoading && activeSubscription && (
          <SubscriptionBanner subscription={activeSubscription} />
        )}

        {/* A plan ended and nothing replaced it: say why they're on Free */}
        {!subLoading && !subError && !activeSubscription && endedSubscription && (
          <EndedPlanBanner key={endedSubscription.subscriptionId} ended={endedSubscription} onChoosePlan={scrollToPlans} />
        )}

        {/* Billing dashboard */}
        {!subLoading && activeSubscription && !activationPending && (
          <BillingDashboard
            subscription={activeSubscription}
            usedBytes={user?.usedStorageInBytes ?? 0}
            onUpdatePayment={handleUpdatePayment}
            onCancel={handleCancelPlan}
            cancelLoading={cancelLoading}
            showToast={showToast}
          />
        )}

        {/* No current plan (never subscribed, or it ended) — past receipts stay reachable */}
        {!subLoading && !subError && !activeSubscription && <BillingHistory />}

        <div id="plan-cards" style={{ scrollMarginTop: 16 }}>
          <BillingToggle mode={mode} onModeChange={setMode} />
        </div>

        {!locked && activeSubscription && premiumActive && (
          <PlanChangeNote subscription={activeSubscription} />
        )}

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
              subscription={activeSubscription}
              premiumActive={premiumActive}
              locked={locked}
              onSelect={handleSelect}
              onDowngrade={handleCancelPlan}
              loadingId={loadingId}
            />
          ))}
        </div>

        <PlansFAQ />

        <p style={{ marginTop: 20, fontSize: 11, color: "var(--muted)", textAlign: "center" }}>
          Payments are processed securely by Razorpay. Subscriptions auto-renew each billing cycle and can be cancelled at any time.
        </p>
      </div>
    </AppLayout>
  );
}
