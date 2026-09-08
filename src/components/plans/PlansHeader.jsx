export default function PlansHeader({ activeSubscription }) {
  return (
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
            {activeSubscription ? "Billing & Plans" : "Choose Your Plan"}
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted)", maxWidth: 480 }}>
            Manage your storage subscription. Upgrades take effect immediately after payment.
          </p>
        </div>
  );
}
