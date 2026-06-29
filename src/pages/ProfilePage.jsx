import AppLayout from "../components/AppLayout";
import { useUser } from "../context/UserContext";
import { Link } from "react-router-dom";
import { formatStorage } from "../utils/directoryUtils";

export default function ProfilePage() {
  const { user } = useUser();
  const used = user?.usedStorageInBytes || 0;
  const max = user?.maxStorageInBytes || 1;
  const pct = Math.min((used / max) * 100, 100);

  return (
    <AppLayout>
      <div style={{ padding: "24px", maxWidth: 640, margin: "0 auto" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>
          Profile
        </h1>

        {/* Avatar card */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: 28,
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              flexShrink: 0,
              overflow: "hidden",
              border: "3px solid rgba(59,130,246,0.3)",
            }}
          >
            {user?.picture ? (
              <img
                src={user.picture}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              "👤"
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 4 }}>
              {user?.name || "User"}
            </div>
            <div style={{ color: "var(--muted)", fontSize: 14 }}>
              {user?.email}
            </div>
            <div style={{ marginTop: 8 }}>
              <span
                style={{
                  background: "rgba(59,130,246,0.15)",
                  color: "#93C5FD",
                  padding: "3px 10px",
                  borderRadius: 100,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                Personal Account
              </span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            marginBottom: 20,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "14px 24px",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <h3 style={{ fontSize: 14, fontWeight: 600 }}>
              Account Information
            </h3>
          </div>
          <div style={{ padding: "4px 24px" }}>
            {[
              ["User Name", user?.name || "—"],
              ["Email", user?.email || "—"],
              [
                "Member Since",
                user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—",
              ],
              ["Account Type", "Personal"],
               ["Account ID", user?.id || "—"],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 0",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <span style={{ fontSize: 13, color: "var(--muted)" }}>
                  {label}
                </span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Storage summary */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 24,
          }}
        >
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
            Storage
          </h3>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 13,
              marginBottom: 8,
            }}
          >
            <span style={{ color: "var(--muted)" }}>
              {formatStorage(used)} used
            </span>
            <span style={{ color: "var(--muted)" }}>
              {formatStorage(max)} total
            </span>
          </div>
          <div
            style={{
              height: 6,
              background: "rgba(255,255,255,0.08)",
              borderRadius: 3,
              overflow: "hidden",
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: `${pct}%`,
                height: "100%",
                background: pct >= 90 ? "#EF4444" : "var(--primary)",
                borderRadius: 3,
              }}
            />
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            {Math.round(pct)}% of storage used
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
