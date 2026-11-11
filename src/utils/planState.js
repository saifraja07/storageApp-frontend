import { PLAN_BY_ID } from "../config/plans";
import { fmtDate, fmtMethod, daysUntil } from "./subscriptionUtils";

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

/**
 * What the billing card says for a running subscription: one headline, one
 * supporting line, and how worrying it is. Everything else on the card follows
 * from this, so it can never contradict itself.
 *
 * `tone`: green = fine, blue = in progress, amber = needs attention, orange = ending.
 * `ending`: the plan will drop to Free on `endDate` without the user doing anything.
 */
export function getBillingSummary(subscription) {
  const info = describePlan(subscription);
  const name = info?.name ?? "paid";
  const endDate = fmtDate(subscription.currentEnd);
  const price = info ? info.priceLabel : null;
  const method = subscription.paymentMethod ? fmtMethod(subscription.paymentMethod) : null;
  const days = daysUntil(subscription.currentEnd);

  switch (subscription.status) {
    case "active":
      return {
        tone: "green", label: "Active", ending: false, days,
        headline: `Renews on ${endDate}`,
        detail: `${price ?? "Your plan price"} is charged automatically${method ? ` via ${method}` : ""}.`,
      };
    case "authenticated":
      return {
        tone: "blue", label: "Activating", ending: false, days,
        headline: "Activating your plan…",
        detail: "Payment received. This takes a few minutes — you don't need to pay again.",
      };
    case "pending":
      return {
        tone: "amber", label: "Payment failed", ending: false, days,
        headline: "We couldn't renew your plan",
        detail: `We'll retry automatically. You keep ${name} until ${endDate} — update your payment method to avoid losing it.`,
      };
    case "paused":
      return {
        tone: "amber", label: "Paused", ending: true, days,
        headline: `Auto-renewal is paused`,
        detail: `You keep ${name} until ${endDate}, then move to Free.`,
      };
    case "cancelled":
      return {
        tone: "orange", label: "Cancelling", ending: true, days,
        headline: `Ends on ${endDate}`,
        detail: `You keep ${name} until then and won't be charged again.`,
      };
    default:
      return { tone: "amber", label: subscription.status, ending: false, days, headline: "Your plan", detail: "" };
  }
}
