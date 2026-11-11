import { useState } from "react";
import { X } from "lucide-react";
import { PLAN_BY_ID } from "../../config/plans";
import { fmtDate } from "../../utils/subscriptionUtils";

// Shown when a paid plan has ended and nothing replaced it, so the user is told
// why they're on Free instead of just finding their storage smaller. Dismissable;
// the dismissal is remembered per ended plan.
const KEY = (id) => `endedPlanBanner:${id}`;
const MAX_AGE_DAYS = 60; // after that it's old news

function wasDismissed(id) {
  try { return localStorage.getItem(KEY(id)) === "1"; } catch { return false; }
}

const REASON_TEXT = {
  cancelled: (name, date) => <>Your <strong>{name}</strong> plan ended on {date}, as you cancelled it. You&apos;re on the Free plan now.</>,
  halted: (name, date) => <>Your <strong>{name}</strong> plan ended on {date} because a payment didn&apos;t go through. You&apos;re on the Free plan now.</>,
};
const DEFAULT_TEXT = (name, date) => <>Your <strong>{name}</strong> plan ended on {date}. You&apos;re on the Free plan now.</>;

export default function EndedPlanBanner({ ended, onChoosePlan }) {
  const [hidden, setHidden] = useState(() => !ended || wasDismissed(ended.subscriptionId));

  if (!ended || hidden) return null;
  if (ended.endedAt && Date.now() - new Date(ended.endedAt).getTime() > MAX_AGE_DAYS * 86_400_000) return null;

  const name = PLAN_BY_ID[ended.planId]?.name ?? "paid";
  const text = (REASON_TEXT[ended.reason] ?? DEFAULT_TEXT)(name, fmtDate(ended.endedAt));

  function dismiss() {
    try { localStorage.setItem(KEY(ended.subscriptionId), "1"); } catch { /* private mode: just hide it */ }
    setHidden(true);
  }

  return (
    <div role="status" className="epb">
      <style>{`
        .epb{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:12px 14px 12px 16px;border-radius:12px;margin-bottom:20px;
          background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.22);animation:epb-in .3s ease both}
        .epb p{flex:1 1 240px;margin:0;font-size:13px;line-height:1.55;color:var(--text)}
        .epb-cta{padding:7px 14px;border-radius:8px;border:none;background:var(--primary);color:#fff;font-size:13px;font-weight:600;font-family:inherit;cursor:pointer;transition:background .15s}
        .epb-cta:hover{background:var(--primary-hover)}
        .epb-x{display:flex;background:none;border:none;color:var(--muted);cursor:pointer;padding:4px;border-radius:6px}
        .epb-x:hover{color:var(--text);background:var(--surface-tint-strong)}
        .epb-cta:focus-visible,.epb-x:focus-visible{outline:2px solid var(--primary);outline-offset:2px}
        @keyframes epb-in{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
        @media (prefers-reduced-motion:reduce){.epb{animation:none}}
      `}</style>
      <p>{text}</p>
      <button type="button" className="epb-cta" onClick={onChoosePlan}>Choose a plan</button>
      <button type="button" className="epb-x" onClick={dismiss} aria-label="Dismiss"><X size={16} aria-hidden="true" /></button>
    </div>
  );
}
