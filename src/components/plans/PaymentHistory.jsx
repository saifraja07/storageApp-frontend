import Spin from "./Spin";
import { fmtDate, fmtAmount } from "../../utils/subscriptionUtils";

export default function PaymentHistory({ visible, loading, payments }) {
  if (!visible) return null;

  return (
        <div style={{ borderTop: "1px solid var(--border)" }}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "28px 0" }}>
              <Spin size={20} />
            </div>
          ) : payments && payments.length === 0 ? (
            <p style={{ padding: "24px 20px", fontSize: 13, color: "var(--muted)", textAlign: "center" }}>No payments found.</p>
          ) : payments ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 480 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["Date", "Amount", "Method", "Status", "Invoice"].map((h) => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p, idx) => (
                    <tr key={p.invoiceId ?? idx} style={{ borderBottom: "1px solid var(--surface-tint)" }}>
                      <td style={{ padding: "10px 16px", color: "var(--text)" }}>{fmtDate(p.createdAt)}</td>
                      <td style={{ padding: "10px 16px", fontWeight: 600, color: "var(--text)" }}>{fmtAmount(p.amount)}</td>
                      <td style={{ padding: "10px 16px", color: "var(--muted)", textTransform: "capitalize" }}>{p.paymentMethod ?? "—"}</td>
                      <td style={{ padding: "10px 16px" }}>
                        <span style={{
                          padding: "2px 8px", borderRadius: 100, fontSize: 11, fontWeight: 600,
                          background: p.status === "captured" ? "rgba(52,211,153,0.15)" : "rgba(239,68,68,0.15)",
                          color: p.status === "captured" ? "var(--status-green-text)" : "var(--status-red-text)",
                        }}>
                          {p.status === "captured" ? "paid" : p.status}
                        </span>
                      </td>
                      <td style={{ padding: "10px 16px" }}>
                        {p.invoiceUrl ? (
                          <a
                            href={p.invoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: 12, color: "var(--primary)", fontWeight: 500, textDecoration: "none" }}
                          >
                            Download
                          </a>
                        ) : <span style={{ color: "var(--muted)", fontSize: 12 }}>—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
  );
}
