import { PLAN_BY_ID } from "../config/plans";
import { fmtDate } from "./subscriptionUtils";

// ─── Plan card state ──────────────────────────────────────────────────────────
// Decides what every plan card says and does for the user's current subscription,
// in one place, so the cards can never disagree with each other.

// Statuses the backend lets the user cancel (mirrors cancelSubscription).
export const CANCELLABLE_STATUSES = ["active", "authenticated", "pending"];

const BADGE_BY_STATUS = {
  active: "Current plan",
  authenticated: "Current plan",
  pending: "Payment failed",
  paused: "Paused",
};

/**
 * @param {object}  args
 * @param {object}  args.plan           a plan from PLAN_CATALOG
 * @param {object?} args.subscription   the VISIBLE subscription (see getVisibleSubscription)
 * @param {boolean} args.premiumActive  paid time remaining, as reported by the API
 * @param {boolean} args.locked         subscription still loading, or failed to load
 * @returns {{ highlight: boolean, badge: string|null, cta: { label: string, disabled: boolean, action: "checkout"|"downgrade"|null } }}
 */
export function getPlanCardState({ plan, subscription, premiumActive, locked = false }) {
  const status = subscription?.status;
  const endDate = fmtDate(subscription?.currentEnd);

  const hasPaidTime = !!subscription && !!premiumActive;
  // Paid, but the first charge hasn't gone through yet.
  const activating = status === "authenticated" && !premiumActive;
  // Something is already in place, so another checkout must not be started.
  const busy = hasPaidTime || activating;

  const isMine = !plan.isFree && !!subscription && subscription.planId === plan.razorpayId;
  const cta = (label, disabled = true, action = null) => ({ label, disabled, action });

  // ── Free card ───────────────────────────────────────────────────────────────
  if (plan.isFree) {
    if (locked) return { highlight: false, badge: null, cta: cta("Free plan") };
    if (!busy) return { highlight: false, badge: "Current plan", cta: cta("Current plan") };
    if (activating) return { highlight: false, badge: null, cta: cta("Free plan") };
    if (CANCELLABLE_STATUSES.includes(status)) {
      return { highlight: false, badge: null, cta: cta("Downgrade to Free", false, "downgrade") };
    }
    return { highlight: false, badge: null, cta: cta(`Free from ${endDate}`) }; // cancelled / paused
  }

  // ── Paid cards ──────────────────────────────────────────────────────────────
  if (locked) return { highlight: false, badge: null, cta: cta(`Upgrade to ${plan.name}`) };

  if (isMine && hasPaidTime) {
    const badge = status === "cancelled" ? `Ends ${endDate}` : BADGE_BY_STATUS[status] ?? "Current plan";
    return { highlight: true, badge, cta: cta("Current plan") };
  }
  if (isMine && activating) {
    return { highlight: true, badge: "Activating", cta: cta("Activating…") };
  }
  if (busy) {
    // Switching plans mid-term isn't supported: a plan change has to wait for the
    // current one to end (Razorpay can't update UPI-paid subscriptions in place).
    if (activating) return { highlight: false, badge: null, cta: cta("Activation in progress") };
    const endsOnItsOwn = status === "cancelled" || status === "paused";
    return {
      highlight: false,
      badge: null,
      cta: cta(endsOnItsOwn ? `Available from ${endDate}` : "Cancel current plan to switch"),
    };
  }
  return { highlight: false, badge: null, cta: cta(`Upgrade to ${plan.name}`, false, "checkout") };
}

/** Display info for a subscription's plan, or null when the plan id is unknown. */
export function describePlan(subscription) {
  const plan = subscription ? PLAN_BY_ID[subscription.planId] : null;
  if (!plan) return null;
  return {
    plan,
    name: plan.name,
    cycleLabel: plan.cycle === "yearly" ? "Yearly" : "Monthly",
    priceLabel: `${plan.price}${plan.period}`,
  };
}
