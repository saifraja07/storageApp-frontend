export default function PlansFAQ() {
  return (
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 14, padding: "20px 24px",
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>
            Frequently asked questions
          </div>
          {[
            ["Can I cancel at any time?",
              "Yes — cancel from the billing dashboard. You keep premium access until the end of the current billing period. No hidden fees."],
            ["What happens to my files if I downgrade?",
              "If your usage exceeds 512 MB after downgrading, your oldest files will be deleted to bring you within the free limit. Download anything important first."],
            ["When does my storage upgrade?",
              "Storage upgrades automatically within seconds of a successful payment — confirmed by our webhook from Razorpay. No manual action needed."],
            ["Is my payment secure?",
              "Payments are processed entirely by Razorpay. We never store your card details. All connections are encrypted."],
          ].map(([q, a]) => (
            <div key={q} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid var(--surface-tint)" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>{q}</div>
              <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>{a}</div>
            </div>
          ))}
        </div>
  );
}
