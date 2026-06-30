import { memo } from "react";
import { formatStorage } from "../../../utils/directoryUtils.js";

const UserStorageBar = memo(function UserStorageBar({ usedStorageInBytes, maxStorageInBytes }) {
  const storePct =
    maxStorageInBytes > 0
      ? Math.min((usedStorageInBytes / maxStorageInBytes) * 100, 100)
      : 0;
  const storeColor =
    storePct >= 90 ? "#EF4444" : storePct >= 70 ? "#F59E0B" : "#3B82F6";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 5,
        paddingRight: 20,
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: "var(--muted)",
        }}
      >
        <span>{formatStorage(usedStorageInBytes)}</span>
        <span>{Math.round(storePct)}%</span>
      </div>

      <div
        style={{
          height: 6,
          borderRadius: 999,
          background: "rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${storePct}%`,
            height: "100%",
            background: storeColor,
            borderRadius: 999,
          }}
        />
      </div>

      <div style={{ fontSize: 10, color: "var(--muted)" }}>
        of {formatStorage(maxStorageInBytes)}
      </div>
    </div>
  );
});

export default UserStorageBar;
