import { memo } from "react";

const UserSkeleton = memo(function UserSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 16px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.07)",
              flexShrink: 0,
              animation: "skpulse 1.4s ease-in-out infinite",
            }}
          />
          <div
            style={{
              flex: 1,
              height: 10,
              background: "rgba(255,255,255,0.07)",
              borderRadius: 4,
              animation: "skpulse 1.4s ease-in-out infinite",
            }}
          />
        </div>
      ))}
    </>
  );
});

export default UserSkeleton;
