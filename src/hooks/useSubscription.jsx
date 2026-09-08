import { useEffect, useState, useCallback, useRef } from "react";
import { TriangleAlert, PartyPopper } from "lucide-react";
import toast from "react-hot-toast";
import { useUser } from "../context/UserContext";
import { logError } from "../utils/logger";
import { fmtDate } from "../utils/subscriptionUtils";
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
  const [premiumActive, setPremiumActive] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [subLoading, setSubLoading] = useState(true);
  const mounted = useRef(true);

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

  return {
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
    refreshSubscription,
    pollForActivation,
    handleSelect,
    handleCancelPlan,
    confirmCancelPlan,
    handleUpdatePayment,
  };
}
