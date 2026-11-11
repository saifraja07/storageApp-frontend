import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { TriangleAlert, PartyPopper } from "lucide-react";
import toast from "react-hot-toast";
import { useUser } from "../context/UserContext";
import { logError } from "../utils/logger";
import { fmtDate, getVisibleSubscription } from "../utils/subscriptionUtils";
import { PLAN_BY_ID } from "../config/plans";
import {
  PENDING_TTL,
  PENDING_POLL_MS,
  TERMINAL_STATUSES,
  readPending,
  writePending,
  removePending,
} from "../utils/pendingActivation";
import { loadRazorpaySDK, openRazorpayCheckout } from "../services/razorpayService";
import {
  createSubscription,
  getActiveSubscription,
  cancelSubscription,
  getUpdatePaymentLink,
  verifySubscription,
} from "../api/subscriptionApi";

export default function useSubscription() {
  const { user, refreshUser } = useUser();
  const [mode, setMode] = useState("monthly");
  const [loadingId, setLoadingId] = useState(null);
  const [overlayPhase, setOverlayPhase] = useState(null);
  const [activeSubscription, setActiveSubscription] = useState(null);
  // What ended last (when there is no current plan) — drives the "your plan ended" notice
  const [endedSubscription, setEndedSubscription] = useState(null);
  const [premiumActive, setPremiumActive] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [subLoading, setSubLoading] = useState(true);
  const [subError, setSubError] = useState(false);
  const [pending, setPending] = useState(() => readPending(user?._id));
  const mounted = useRef(true);
  const modeSynced = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const showToast = useCallback((type, message) => {
    if (type === "success") return toast.success(message);
    if (type === "error") return toast.error(message);
    return toast(message, {
      icon: <TriangleAlert size={16} color="var(--status-amber-text)" aria-hidden="true" />,
      style: {
        background: "var(--surface-hover)",
        border: "1px solid rgba(245,158,11,0.35)",
        color: "var(--text)",
      },
    });
  }, []);

  const savePending = useCallback((p) => {
    const record = { ...p, userId: user?._id, at: Date.now() };
    writePending(record);
    setPending(record);
  }, [user?._id]);

  const clearPending = useCallback(() => {
    removePending();
    setPending(null);
  }, []);

  const refreshSubscription = useCallback(async () => {
    try {
      const data = await getActiveSubscription();
      // An unfinished checkout isn't a subscription as far as the user is concerned
      const subscription = getVisibleSubscription(data.subscription);
      if (mounted.current) {
        setActiveSubscription(subscription);
        setEndedSubscription(subscription ? null : (data.ended ?? null));
        setPremiumActive(subscription ? (data.isPremiumActive ?? false) : false);
        setSubError(false);
      }
      return { ...data, subscription };
    } catch (err) {
      logError("refreshSubscription failed:", err);
      if (mounted.current) setSubError(true);
      return null;
    }
  }, []);

  // Retry button after a failed load
  const retryLoadSubscription = useCallback(async () => {
    setSubLoading(true);
    await refreshSubscription();
    if (mounted.current) setSubLoading(false);
  }, [refreshSubscription]);

  // Coming back to this tab (after paying, updating a card, or acting elsewhere)
  // shows the truth straight away instead of a stale plan. Throttled.
  const lastFocusRefresh = useRef(0);
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastFocusRefresh.current < 10_000) return;
      lastFocusRefresh.current = Date.now();
      refreshSubscription();
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refreshSubscription]);

  // Fetch subscription + preload Razorpay SDK on mount
  useEffect(() => {
    loadRazorpaySDK();
    refreshSubscription().finally(() => { if (mounted.current) setSubLoading(false); });
  }, [refreshSubscription]);

  // What the page shows: the real subscription, or — right after paying, before the
  // webhook has activated it — a placeholder in the "activating" state, so every
  // card/banner reuses the same states and no second checkout can be started.
  const shownSubscription = useMemo(() => {
    if (!pending) return activeSubscription;
    if (activeSubscription?.subscriptionId === pending.subscriptionId) return activeSubscription;
    if (premiumActive) return activeSubscription; // already on a paid plan: real data wins
    return {
      subscriptionId: pending.subscriptionId,
      planId: pending.planId,
      status: "authenticated",
      currentEnd: null,
      pendingOnly: true,
    };
  }, [pending, activeSubscription, premiumActive]);

  // The real subscription arrived (e.g. found after a reload) → stop waiting.
  // While the checkout flow itself is running (overlayPhase) it reports the result.
  useEffect(() => {
    if (!pending || overlayPhase) return;
    const sub = activeSubscription;
    if (sub?.subscriptionId === pending.subscriptionId && TERMINAL_STATUSES.has(sub.status)) {
      clearPending();
      if (sub.status === "active") {
        toast.success("Your plan is now active!");
        if (refreshUser) refreshUser(); // storage quota in the sidebar/header
      }
    }
  }, [pending, activeSubscription, overlayPhase, clearPending, refreshUser]);

  // While waiting, keep checking in the background (also covers "took longer than 30s")
  useEffect(() => {
    if (!pending || overlayPhase) return;
    const id = setInterval(() => {
      if (Date.now() - pending.at > PENDING_TTL) { clearPending(); return; }
      refreshSubscription();
    }, PENDING_POLL_MS);
    return () => clearInterval(id);
  }, [pending, overlayPhase, refreshSubscription, clearPending]);

  // Open on the billing tab the user's current plan lives on (once, after the first load)
  useEffect(() => {
    if (modeSynced.current || !activeSubscription) return;
    const cycle = PLAN_BY_ID[activeSubscription.planId]?.cycle;
    if (cycle) {
      modeSynced.current = true;
      setMode(cycle);
    }
  }, [activeSubscription]);

  // ── Polling after checkout ──────────────────────────────────────────────────
  // Waits for THIS checkout's subscription to settle. Matching on the id matters:
  // an older, cancelled-but-still-paid subscription is also returned by the API
  // and must not be mistaken for the one that was just paid for.
  const pollForActivation = useCallback(async (subscriptionId) => {
    const POLL_INTERVAL = 2000;
    const POLL_TIMEOUT = 30000;
    const start = Date.now();

    return new Promise((resolve) => {
      async function tick() {
        if (!mounted.current) { resolve("unmounted"); return; }
        try {
          const data = await getActiveSubscription();
          const sub = data.subscription;
          if (sub?.subscriptionId === subscriptionId && TERMINAL_STATUSES.has(sub.status)) { resolve(sub.status); return; }
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

    if (shownSubscription?.pendingOnly) {
      showToast("warning", "Your payment is still being activated. You don't need to pay again.");
      return;
    }
    if (premiumActive || activeSubscription?.status === "authenticated") {
      showToast(
        "warning",
        activeSubscription?.status === "cancelled"
          ? `Your current plan stays active until ${fmtDate(activeSubscription.currentEnd)}. You can choose a new plan after that.`
          : "You already have an active plan. Cancel it first to switch."
      );
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
      showToast("error", err?.response?.data?.error || "Failed to create subscription. Please try again.");
      if (err?.response?.status === 409) refreshSubscription(); // state changed under us — show the truth
      return;
    }

    openRazorpayCheckout({
      subscriptionId,
      plan,
      async onSuccess(response) {
        // The money has moved. From here our webhook is the source of truth, so remember
        // this payment until the plan shows up — even across a reload.
        savePending({ subscriptionId, planId: plan.razorpayId });
        setOverlayPhase("verifying");
        try {
          await verifySubscription({
            razorpay_subscription_id: response.razorpay_subscription_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
        } catch (err) {
          const status = err?.response?.status;
          if ([400, 403, 404].includes(status)) {
            // The server actually rejected this payment — it will not activate.
            clearPending();
            setOverlayPhase(null);
            showToast("error", err?.response?.data?.error || "Payment verification failed. Please contact support.");
            return;
          }
          // Network blip / server error: the payment itself is fine and the webhook will
          // still activate the plan, so keep waiting instead of reporting a failure.
          showToast("warning", "We couldn't confirm your payment instantly — still checking, please don't pay again.");
        }

        setOverlayPhase("activating");
        const outcome = await pollForActivation(subscriptionId);
        const freshData = await refreshSubscription();
        // Refresh user so storage quota in sidebar/header updates
        if (refreshUser) await refreshUser();
        setOverlayPhase(null);

        const freshEnd = freshData?.subscription?.currentEnd;
        // "timeout" / "unmounted": keep waiting in the background (page or after a reload)
        if (outcome !== "timeout" && outcome !== "unmounted") clearPending();
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
            showToast("warning", "Payment received. Activation is taking a little longer — we'll keep checking and update this page automatically.");
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
      // Show the new state at once; the refresh below confirms it with the server.
      setActiveSubscription((sub) =>
        sub ? { ...sub, status: "cancelled", cancelAtPeriodEnd: true, cancelledAt: new Date().toISOString() } : sub,
      );
      showToast("success", "Plan cancelled. You keep access until the end of your billing period.");
      // Refresh immediately so UI reflects new state without needing a page reload
      await refreshSubscription();
    } catch (err) {
      showToast("error", err?.response?.data?.error || "Failed to cancel subscription.");
      refreshSubscription(); // the plan may have changed elsewhere (another tab) — show the truth
    } finally {
      setCancelLoading(false);
    }
  }

  async function handleUpdatePayment(subscriptionId) {
    return getUpdatePaymentLink(subscriptionId);
  }

  return {
    user,
    mode,
    setMode,
    loadingId,
    overlayPhase,
    activeSubscription: shownSubscription,
    endedSubscription,
    activationPending: !!shownSubscription?.pendingOnly,
    premiumActive,
    cancelLoading,
    showCancelModal,
    setShowCancelModal,
    subLoading,
    subError,
    retryLoadSubscription,
    showToast,
    refreshSubscription,
    pollForActivation,
    handleSelect,
    handleCancelPlan,
    confirmCancelPlan,
    handleUpdatePayment,
  };
}
