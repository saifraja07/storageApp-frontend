import { memo } from "react";

const UserStatus = memo(function UserStatus({ isDeleted, isLoggedIn }) {
  const color = isDeleted ? "var(--status-red-text-strong)" : isLoggedIn ? "var(--status-green-text)" : "#6B7280";
  const label = isDeleted ? "Deleted" : isLoggedIn ? "Online" : "Offline";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        paddingRight: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12,
          color,
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: color,
            flexShrink: 0,
          }}
        />
        {label}
      </div>
    </div>
  );
});

export default UserStatus;
