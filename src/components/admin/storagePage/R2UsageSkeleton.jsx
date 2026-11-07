import { memo } from "react";

const bar = (width, height, strong = true) => ({
  width,
  height,
  borderRadius: 4,
  background: strong ? "var(--surface-tint-strong)" : "var(--surface-tint)",
  animation: "skpulse 1.4s ease-in-out infinite",
});

function OpsSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={bar(90, 10)} />
      <div style={bar(110, 22)} />
      <div style={bar(120, 8, false)} />
    </div>
  );
}

// Mirrors the final R2AccountCard layout so nothing jumps when data arrives.
const R2UsageSkeleton = memo(function R2UsageSkeleton() {
  return (
    <>
      {[0, 1].map((i) => (
        <div
          key={i}
          aria-hidden="true"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "16px 18px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <div style={bar(120, 14)} />
            <div style={{ ...bar(60, 20), borderRadius: 20 }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={bar(100, 10)} />
            <div style={bar(90, 26)} />
            <div style={{ ...bar("100%", 6), borderRadius: 999, marginTop: 4 }} />
            <div style={bar(160, 8, false)} />
          </div>

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
            <OpsSkeleton />
            <OpsSkeleton />
          </div>
        </div>
      ))}
    </>
  );
});

export default R2UsageSkeleton;
