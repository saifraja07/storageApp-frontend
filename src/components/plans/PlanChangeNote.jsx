import { Info } from "lucide-react";
import { describePlan } from "../../utils/planState";
import { fmtDate } from "../../utils/subscriptionUtils";

// Explains why the other plans are greyed out while a plan is running, and what to do.
// Plans can't be switched mid-term yet, so a change has to wait for the current one to end.
export default function PlanChangeNote({ subscription }) {
  const name = describePlan(subscription)?.name ?? "current";
  const endDate = fmtDate(subscription.currentEnd);
  const endsOnItsOwn = subscription.status === "cancelled" || subscription.status === "paused";

  const text = endsOnItsOwn
    ? `Your ${name} plan runs until ${endDate}. You can choose a new plan from that day.`
    : `Want a different plan? Cancel your current plan above — you keep ${name} until ${endDate}, then you can choose a new one.`;

  return (
    <p style={{
      display: "flex", alignItems: "flex-start", gap: 8,
      fontSize: 12, color: "var(--muted)", lineHeight: 1.5, marginBottom: 18,
    }}>
      <Info size={14} aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} />
      {text}
    </p>
  );
}
