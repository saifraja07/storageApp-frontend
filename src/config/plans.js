import { Gift, Zap, Crown } from "lucide-react";

// ─── Plan catalogue ───────────────────────────────────────────────────────────
// Only 4 real Razorpay plans. Free cards are informational only.

const FREE_PLAN_MONTHLY = {
  id: "free-monthly",
  razorpayId: null,
  name: "Free",
  tagline: "Always free",
  storage: "512 MB",
  storageBytes: 0.5 * 1024 ** 3,
  price: "₹0",
  period: "/mo",
  color: "#6B7280",
  emoji: Gift,
  features: ["512 MB cloud storage", "Access from 1 device", "No size limits", "Upload limit: 20 files at a time", "Basic support"],
  isFree: true,
};

const FREE_PLAN_YEARLY = {
  id: "free-yearly",
  razorpayId: null,
  name: "Free",
  tagline: "Always free",
  storage: "512 MB",
  storageBytes: 0.5 * 1024 ** 3,
  price: "₹0",
  period: "/yr",
  color: "#6B7280",
  emoji: Gift,
  features: ["512 MB cloud storage", "Access from 1 device", "No size limits", "Upload limits: 20 files at a time", "Basic support"],
  isFree: true,
};

const PLAN_CATALOG = {
  monthly: [
    FREE_PLAN_MONTHLY,
    {
      id: "plan_T7QOKw1SWn3YA9",
      razorpayId: "plan_T7QOKw1SWn3YA9",
      name: "Pro",
      tagline: "Great for individuals",
      storage: "100 GB",
      storageBytes: 100 * 1024 ** 3,
      price: "₹169",
      period: "/mo",
      color: "#3B82F6",
      emoji: Zap,
      badge: "Most Popular",
      features: ["100 GB cloud storage", "Access from up to 3 device", "No size limits", "Priority uploads", "Email support"],
      isFree: false,
    },
    {
      id: "plan_T7QTobe7VSThyp",
      razorpayId: "plan_T7QTobe7VSThyp",
      name: "Premium",
      tagline: "For creators & teams",
      storage: "500 GB",
      storageBytes: 500 * 1024 ** 3,
      price: "₹499",
      period: "/mo",
      color: "var(--status-purple-text)",
      emoji: Crown,
      badge: "Best Value",
      features: ["500 GB cloud storage", "Everything in Pro", "Access from up to 4 device", "Priority support", "Secure encrypted storage"],
      isFree: false,
    },
  ],
  yearly: [
    FREE_PLAN_YEARLY,
    {
      id: "plan_T7QPutFKX9ueS5",
      razorpayId: "plan_T7QPutFKX9ueS5",
      name: "Pro",
      tagline: "Great for individuals",
      storage: "100 GB",
      storageBytes: 100 * 1024 ** 3,
      price: "₹1,599",
      period: "/yr",
      color: "#3B82F6",
      emoji: Zap,
      badge: "Most Popular",
      features: ["100 GB cloud storage", "Access from up to 3 device", "No size limits", "Priority uploads", "Email support"],
      isFree: false,
    },
    {
      id: "plan_T7QV7r2nId24Vo",
      razorpayId: "plan_T7QV7r2nId24Vo",
      name: "Premium",
      tagline: "For creators & teams",
      storage: "500 GB",
      storageBytes: 500 * 1024 ** 3,
      price: "₹4,999",
      period: "/yr",
      color: "var(--status-purple-text)",
      emoji: Crown,
      badge: "Best Value",
      features: ["500 GB cloud storage", "Everything in Pro", "Access from up to 4 device",  "Priority support", "Secure encrypted storage"],
      isFree: false,
    },
  ],
};

// Map razorpayId → plan object (all tabs)
const ALL_PLANS = [...PLAN_CATALOG.monthly, ...PLAN_CATALOG.yearly];
const PLAN_BY_ID = Object.fromEntries(
  ALL_PLANS.filter((p) => p.razorpayId).map((p) => [p.razorpayId, p])
);

export {
  FREE_PLAN_MONTHLY,
  FREE_PLAN_YEARLY,
  PLAN_CATALOG,
  ALL_PLANS,
  PLAN_BY_ID,
};
