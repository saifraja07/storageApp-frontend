import { useEffect, useState } from "react";
import { getMyPayments } from "../../api/subscriptionApi";
import PaymentHistory from "./PaymentHistory";

// Billing history for someone with no current plan (it expired, or ended after
// being cancelled). Their receipts must stay reachable, as on any billing page.
// Renders nothing for a user who has never paid, or if it can't load.
export default function BillingHistory() {
  const [payments, setPayments] = useState(null);

  useEffect(() => {
    let alive = true;
    getMyPayments()
      .then((data) => alive && setPayments(data.payments ?? []))
      .catch(() => alive && setPayments([]));
    return () => { alive = false; };
  }, []);

  if (!payments || payments.length === 0) return null;

  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 14, marginBottom: 28, overflow: "hidden",
    }}>
      <div style={{ padding: "16px 20px" }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Billing history</span>
      </div>
      <PaymentHistory visible loading={false} payments={payments} />
    </div>
  );
}
