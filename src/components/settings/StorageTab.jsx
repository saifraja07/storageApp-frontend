import Section from "./Section";
import { formatStorage } from "../../utils/directoryUtils";

export default function StorageTab({ used, max, pct, storageColor }) {
  return (
    <>
            <Section title="Storage Usage">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  marginBottom: 12,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      marginBottom: 4,
                    }}
                  >
                    {formatStorage(used)}
                  </div>

                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--muted)",
                    }}
                  >
                    of {formatStorage(max)} used
                  </div>
                </div>

                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: storageColor,
                  }}
                >
                  {Math.round(pct)}%
                </div>
              </div>

              <div
                style={{
                  height: 8,
                  background: "var(--surface-tint-strong)",
                  borderRadius: 4,
                  overflow: "hidden",
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    background: storageColor,
                    borderRadius: 4,
                    transition: "width 0.5s",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                {[
                  ["Used", formatStorage(used), storageColor],
                  [
                    "Available",
                    formatStorage(max - used),
                    "var(--status-green-text)",
                  ],
                  ["Total", formatStorage(max), "var(--muted)"],
                ].map(([label, value, color]) => (
                  <div
                    key={label}
                    style={{
                      flex: 1,
                      minWidth: 100,
                      background: "var(--surface-tint)",
                      borderRadius: 8,
                      padding: "12px 16px",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--muted)",
                        marginBottom: 4,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      {label}
                    </div>

                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color,
                      }}
                    >
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Storage Plan">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 16px",
                  background: "rgba(59,130,246,0.08)",
                  border:
                    "1px solid rgba(59,130,246,0.2)",
                  borderRadius: 10,
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 14,
                      marginBottom: 2,
                    }}
                  >
                    Personal Plan
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--muted)",
                    }}
                  >
                    {formatStorage(max)} total storage
                  </div>
                </div>

                <span
                  style={{
                    background: "rgba(59,130,246,0.2)",
                    color: "var(--status-blue-text)",
                    padding: "4px 12px",
                    borderRadius: 100,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  Active
                </span>
              </div>
            </Section>
    </>
  );
}
