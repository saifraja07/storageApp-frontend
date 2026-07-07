import { memo } from "react";
import { TriangleAlert, CircleCheck, User } from "lucide-react";
import { SkeletonCard } from "../../SkeletonLoading.jsx";
import { formatStorage } from "../../../utils/directoryUtils.js";

const StorageAlerts = memo(function StorageAlerts({ loading, users }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "16px 18px",
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
        <TriangleAlert size={15} aria-hidden="true" /> highest Storage-used Users
      </div>

      {loading && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
          }}
        >
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!loading && users.length === 0 && (
        <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--muted)" }}>
          <div style={{ fontSize: 30, marginBottom: 10, display: "flex", justifyContent: "center" }}>
            <CircleCheck size={30} aria-hidden="true" />
          </div>
          <div style={{ fontWeight: 600, color: "var(--text)", fontSize: 13 }}>
            No users near storage limit
          </div>
        </div>
      )}

      {!loading && users.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
          }}
        >
          {users.map((u) => {
            const pct = Math.round(u.percentUsed);
            const color = pct >= 90 ? "#EF4444" : pct >= 75 ? "#F59E0B" : "#3B82F6";
            return (
              <div
                key={u.id}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: "12px 14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "rgba(59,130,246,0.15)",
                      border: "1px solid rgba(59,130,246,0.25)",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      overflow: "hidden",
                    }}
                  >
                    {u.picture ? (
                      <img
                        src={u.picture}
                        alt={u.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <User size={14} aria-hidden="true" />
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--text)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {u.name}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>
                      {formatStorage(u.usedStorageInBytes)} used
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    height: 6,
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.08)",
                    overflow: "hidden",
                    marginBottom: 6,
                  }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: "100%",
                      background: color,
                      borderRadius: 999,
                      transition: "width 0.4s",
                    }}
                  />
                </div>

                <div style={{ fontSize: 11, color, fontWeight: 600, textAlign: "right" }}>
                  {pct}% used
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

export default StorageAlerts;
