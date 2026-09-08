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
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
  return sdkPromise;
}

function openRazorpayCheckout({ subscriptionId, plan, onSuccess, onDismiss, onFail }) {
  if (typeof window.Razorpay === "undefined") {
    onFail("Payment SDK failed to load. Please refresh and try again.");
    return;
  }

  const rzp = new window.Razorpay({
    key:             import.meta.env.VITE_RAZORPAY_KEY_ID,
    name:            "Storage App",
    description:     `${plan.name} Plan — ${plan.storage} Storage`,
    subscription_id: subscriptionId,
    theme:           { color: "#3B82F6" },

    handler(response) {
      onSuccess(response);
    },

    modal: {
      ondismiss:    onDismiss,
      escape:       false,
      backdropclose: false,
    },
  });

  rzp.on("payment.failed", (response) => {
    onFail(response.error?.description ?? "Payment failed. Please try again.");
  });

  rzp.open();
}

export { loadRazorpaySDK, openRazorpayCheckout };
