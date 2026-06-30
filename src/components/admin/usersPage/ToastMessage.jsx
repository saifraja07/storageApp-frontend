import { memo } from "react";

const ToastMessage = memo(function ToastMessage({ message }) {
  if (!message) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 70,
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(16,185,129,0.15)",
        border: "1px solid rgba(16,185,129,0.3)",
        borderRadius: 8,
        padding: "10px 20px",
        fontSize: 13,
        color: "#34D399",
        zIndex: 500,
        whiteSpace: "nowrap",
      }}
    >
      ✓ {message}
    </div>
  );
});

export default ToastMessage;
