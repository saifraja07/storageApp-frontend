import { memo } from "react";
import { TriangleAlert } from "lucide-react";
import { formatDate } from "../../../utils/directoryUtils.js";
import {
  barColor,
  formatCount,
  formatDecimalBytes,
  storagePercent,
} from "./r2UsageUtils.js";

const STATUS_STYLES = {
  healthy: { label: "Healthy", color: "var(--status-green-text)", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.3)" },
  stale: { label: "Stale", color: "var(--status-amber-text)", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)" },
  unconfigured: { label: "Not configured", color: "var(--muted)", bg: "var(--surface-tint)", border: "var(--border)" },
  error: { label: "Error", color: "var(--status-red-text)", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)" },
};

function StatusPill({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.healthy;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 0.3,
        whiteSpace: "nowrap",
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
      }}
    >
      {s.label}
    </span>
  );
}

function Notice({ tone, children }) {
  const tones = {
    amber: { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.3)", color: "var(--status-amber-text)" },
    red: { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.3)", color: "var(--status-red-text)" },
  };
  const t = tones[tone];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        padding: "10px 12px",
        marginBottom: 16,
        borderRadius: 8,
        fontSize: 12,
        lineHeight: 1.5,
        background: t.bg,
        border: `1px solid ${t.border}`,
        color: t.color,
      }}
    >
      <TriangleAlert size={14} style={{ marginTop: 2, flexShrink: 0 }} aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

function OperationMetric({ title, metric }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 11, color: "var(--muted)" }}>{title}</div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: "var(--text)",
          margin: "4px 0 6px",
          wordBreak: "break-word",
        }}
      >
        {formatCount(metric?.used)}
      </div>
      <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.6 }}>
        of {formatCount(metric?.allowance)} this month
        <br />
        {formatCount(metric?.remaining)} remaining
      </div>
    </div>
  );
}

const R2AccountCard = memo(function R2AccountCard({ account, refreshing }) {
  const { label, status, storage, operations, lastSyncedAt, error } = account;
  const message = error?.message;
  const hasData = Boolean(storage && operations);
  const pct = storagePercent(storage);
  const color = barColor(pct);

  return (
    <section
      aria-label={label}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "16px 18px",
        opacity: refreshing ? 0.6 : 1,
        transition: "opacity 0.2s",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{label}</h2>
        <StatusPill status={status} />
      </header>

      {status === "stale" && (
        <Notice tone="amber">
          Couldn&apos;t refresh from Cloudflare. Showing data from {formatDate(lastSyncedAt)}.
        </Notice>
      )}

      {!hasData ? (
        <Notice tone="red">
          {message || "Usage for this account is unavailable right now. Try refreshing."}
        </Notice>
      ) : (
        <>
          {/* Storage */}
          <div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>Storage usage</div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: 8,
                margin: "4px 0 10px",
              }}
            >
              <span style={{ fontSize: 24, fontWeight: 700, color: "var(--text)" }}>
                {formatDecimalBytes(storage.usedBytes)}
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, color }}>{Math.round(pct)}%</span>
            </div>

            <div
              role="progressbar"
              aria-label={`${label} storage used`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(pct)}
              style={{
                height: 6,
                borderRadius: 999,
                background: "var(--surface-tint-strong)",
                overflow: "hidden",
                marginBottom: 8,
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

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
                flexWrap: "wrap",
                fontSize: 11,
                color: "var(--muted)",
              }}
            >
              <span>of {formatDecimalBytes(storage.allowanceBytes)} free-tier reference</span>
              <span>{formatDecimalBytes(storage.remainingBytes)} remaining</span>
            </div>
          </div>

          {/* Operations */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginTop: 20,
              paddingTop: 18,
              borderTop: "1px solid var(--border)",
            }}
          >
            <OperationMetric title="Class A operations" metric={operations.classA} />
            <OperationMetric title="Class B operations" metric={operations.classB} />
          </div>
        </>
      )}
    </section>
  );
});

export default R2AccountCard;
