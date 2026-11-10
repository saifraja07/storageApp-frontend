// ─── Razorpay SDK loader & checkout opener ────────────────────────────────────

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
    // Don't cache a failure: a dropped connection must not disable checkout until a full reload
    script.onerror = () => { script.remove(); sdkPromise = null; resolve(false); };
    document.body.appendChild(script);
  });
  return sdkPromise;
}

function openRazorpayCheckout({ subscriptionId, plan, onSuccess, onDismiss, onFail }) {
  if (typeof window.Razorpay === "undefined") {
    onFail("Payment SDK failed to load. Please refresh and try again.");
    return;
  }

  // Once the payment handler has fired the checkout is "settled": closing the modal
  // afterwards must never be reported as "Payment cancelled".
  let settled = false;

  const rzp = new window.Razorpay({
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    name: "Haadi Storage App",
    description: `${plan.name} Plan — ${plan.storage} Storage`,
    subscription_id: subscriptionId,
    theme: { color: "#3B82F6" },

    handler(response) {
      settled = true;
      onSuccess(response);
    },

    modal: {
      ondismiss() { if (!settled) onDismiss(); },
      escape: false,
      backdropclose: false,
    },
  });

  rzp.on("payment.failed", (response) => {
    onFail(response.error?.description ?? "Payment failed. Please try again.");
  });

  rzp.open();
}

export { loadRazorpaySDK, openRazorpayCheckout };
