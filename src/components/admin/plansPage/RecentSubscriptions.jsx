import { memo } from "react";
import { SkeletonRow } from "../../SkeletonLoading.jsx";
import { formatDate } from "../../../utils/directoryUtils.js";
import StatusBadge from "./StatusBadge";

const TABLE_COLUMNS = "minmax(160px,2fr) 110px 110px 130px";

const RecentSubscriptions = memo(function RecentSubscriptions({ loading, subscriptions }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "14px 18px",
          borderBottom: "1px solid var(--border)",
          fontSize: 14,
          fontWeight: 600,
          color: "var(--text)",
        }}
      >
        🕓 Recent Subscriptions
      </div>

      <div style={{ overflowX: "auto" }}>
        <div style={{ minWidth: "max-content" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: TABLE_COLUMNS,
              padding: "10px 18px",
              borderBottom: "1px solid var(--border)",
              fontSize: 11,
              fontWeight: 600,
              color: "var(--muted)",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            <span>User</span>
            <span>Plan</span>
            <span>Status</span>
            <span>Created</span>
          </div>

          {loading && [...Array(4)].map((_, i) => <SkeletonRow key={i} />)}

          {!loading && subscriptions.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 18px", color: "var(--muted)" }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
              <div style={{ fontWeight: 600, color: "var(--text)", fontSize: 13 }}>
                No subscriptions
              </div>
            </div>
          )}

          {!loading &&
            subscriptions.map((s) => (
              <div
                key={s.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: TABLE_COLUMNS,
                  padding: "11px 18px",
                  borderBottom: "1px solid var(--border)",
                  alignItems: "center",
                  transition: "background 0.1s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "var(--surface-hover)")}
                onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
              >
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
                    {s.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--muted)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {s.email}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "var(--text)", fontWeight: 600 }}>
                  {s.planName} <span style={{ color: "var(--muted)", fontWeight: 400 }}>· {s.cycle}</span>
                </div>
                <div>
                  <StatusBadge status={s.status} />
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>{formatDate(s.createdAt)}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
});

export default RecentSubscriptions;
