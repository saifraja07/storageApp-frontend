import AppLayout from "../components/AppLayout";
import { PLAN_CATALOG } from "../config/plans";
import useSubscription from "../hooks/useSubscription";
import {
  BillingDashboard,
  BillingToggle,
  CancelConfirmModal,
  PaymentOverlay,
  PlanCard,
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
    premiumActive,
    cancelLoading,
    showCancelModal,
    setShowCancelModal,
    subLoading,
    showToast,
    handleSelect,
    handleCancelPlan,
    confirmCancelPlan,
    handleUpdatePayment,
  } = useSubscription();

  const plans = PLAN_CATALOG[mode];

  return (
    <AppLayout>
      {overlayPhase && <PaymentOverlay phase={overlayPhase} />}
      {showCancelModal && (
        <CancelConfirmModal
          endDate={activeSubscription?.currentEnd ? new Date(activeSubscription.currentEnd).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : null}
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

        {/* State banner */}
        {!subLoading && activeSubscription && (
          <SubscriptionBanner subscription={activeSubscription} />
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

        <BillingToggle mode={mode} onModeChange={setMode} />

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

        <PlansFAQ />

        <p style={{ marginTop: 20, fontSize: 11, color: "var(--muted)", textAlign: "center" }}>
          Payments are processed securely by Razorpay. Subscriptions auto-renew each billing cycle and can be cancelled at any time.
        </p>
      </div>
    </AppLayout>
  );
}
