import { Toaster, ToastBar, toast } from "react-hot-toast";
import { X } from "lucide-react";

const POSITION = "top-center";

// ── Toast theme (moved here from main.jsx, values unchanged) ──────────────
const TOAST_OPTIONS = {
  duration: 3500,
  style: {
    background: "var(--surface-hover)",
    border: "1px solid var(--border)",
    color: "var(--text)",
    borderRadius: 8,
    fontSize: 13,
    boxShadow: "0 8px 24px var(--shadow-color)",
  },
  success: {
    style: {
      background: "var(--surface-hover)",
      border: "1px solid rgba(52,211,153,0.35)",
      color: "var(--text)",
    },
    iconTheme: { primary: "#34D399", secondary: "var(--surface-hover)" },
  },
  error: {
    style: {
      background: "var(--surface-hover)",
      border: "1px solid rgba(239,68,68,0.35)",
      color: "var(--text)",
    },
    iconTheme: { primary: "#EF4444", secondary: "var(--surface-hover)" },
  },
};

// ── App-wide toaster: every toast gets a dismiss (×) button ───────────────
// Loading toasts are left without one so an in-progress action can't be
// hidden before its success/error result replaces it.
export default function AppToaster() {
  return (
    <Toaster position={POSITION} toastOptions={TOAST_OPTIONS}>
      {(t) => (
        <ToastBar toast={t} position={POSITION}>
          {({ icon, message }) => (
            <>
              {icon}
              {message}
              {t.type !== "loading" && (
                <button
                  type="button"
                  onClick={() => toast.dismiss(t.id)}
                  aria-label="Dismiss notification"
                  title="Dismiss"
                  className={[
                    "ml-1 inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center",
                    "rounded-md bg-transparent text-(--muted) transition-colors",
                    "hover:bg-(--surface-tint-strong) hover:text-(--text)",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary)",
                  ].join(" ")}
                >
                  <X size={14} aria-hidden="true" />
                </button>
              )}
            </>
          )}
        </ToastBar>
      )}
    </Toaster>
  );
}
