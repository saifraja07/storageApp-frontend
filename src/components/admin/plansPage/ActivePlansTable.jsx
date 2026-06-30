import { memo } from "react";
import { SkeletonRow } from "../../SkeletonLoading";
import { formatStorage, formatDate } from "../../../utils/directoryUtils.js";
import StatusBadge from "./StatusBadge";

const TABLE_COLUMNS = "minmax(170px,1.8fr) minmax(200px,2fr) 100px 110px 180px 140px";

const ActivePlansTable = memo(function ActivePlansTable({ loading, plans }) {
  return (
    <div style={{ overflowX: "auto", overflowY: "visible" }}>
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          minWidth: "max-content",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: TABLE_COLUMNS,
            padding: "10px 16px",
            borderBottom: "1px solid var(--border)",
            fontSize: 11,
            fontWeight: 600,
            color: "var(--muted)",
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          <span>User</span>
          <span>Email</span>
          <span>Plan</span>
          <span>Status</span>
          <span>Storage Used</span>
          <span>Renewal / Expiry</span>
        </div>

        {/* Loading */}
        {loading && [...Array(4)].map((_, i) => <SkeletonRow key={i} />)}

        {/* Empty state */}
        {!loading && plans.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--muted)" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>👑</div>
            <div style={{ fontWeight: 600, color: "var(--text)" }}>No premium users</div>
          </div>
        )}

        {/* Rows */}
        {!loading &&
          plans.map((p) => {
            const pct =
              p.maxStorageInBytes > 0
                ? Math.min((p.usedStorageInBytes / p.maxStorageInBytes) * 100, 100)
                : 0;
            return (
              <div
                key={p.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: TABLE_COLUMNS,
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--border)",
                  alignItems: "center",
                  transition: "background 0.1s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "var(--surface-hover)")}
                onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {/* User */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: "rgba(139,92,246,0.15)",
                      border: "1px solid rgba(139,92,246,0.25)",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      overflow: "hidden",
                    }}
                  >
                    {p.picture ? (
                      <img
                        src={p.picture}
                        alt={p.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      "👤"
                    )}
                  </div>
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
                    {p.name}
                  </div>
                </div>

                {/* Email */}
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    paddingRight: 12,
                  }}
                >
                  {p.email}
                </div>

                {/* Plan */}
                <div style={{ fontSize: 12, color: "var(--text)", fontWeight: 600 }}>
                  {p.planName} <span style={{ color: "var(--muted)", fontWeight: 400 }}>· {p.cycle}</span>
                </div>

                {/* Status */}
                <div>
                  <StatusBadge status={p.status} />
                </div>

                {/* Storage used */}
                <div style={{ fontSize: 12, color: "var(--muted)" }}>
                  {formatStorage(p.usedStorageInBytes)}{" "}
                  <span style={{ opacity: 0.6 }}>({Math.round(pct)}%)</span>
                </div>

                {/* Renewal date */}
                <div style={{ fontSize: 12, color: "var(--text)" }}>{formatDate(p.renewalDate)}</div>
              </div>
            );
          })}
      </div>
    </div>
  );
});

export default ActivePlansTable;
