import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Database, TriangleAlert } from "lucide-react";
import toast from "react-hot-toast";
import AppLayout from "../components/AppLayout";
import ReloadButton from "../components/ReloadButton";
import R2AccountCard from "../components/admin/storagePage/R2AccountCard";
import R2UsageSkeleton from "../components/admin/storagePage/R2UsageSkeleton";
import { latestSync } from "../components/admin/storagePage/r2UsageUtils";
import { fetchR2Usage, refreshR2Usage } from "../api/adminApi";
import { formatDate, getErr } from "../utils/directoryUtils";

function extractAccounts(result) {
  const payload = result?.data ?? result;
  return payload?.accounts ?? null;
}

export default function AdminR2UsagePage() {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");

  // Shared by the initial load and the retry button.
  const load = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError("");
      const accs = extractAccounts(await fetchR2Usage());
      if (!accs) throw new Error("Unexpected response from server.");
      setAccounts(accs);
    } catch (err) {
      if (err.response?.status === 403) navigate("/directory");
      else if (err.response?.status === 401) navigate("/login");
      else setLoadError(getErr(err));
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRefresh() {
    if (refreshing) return;
    try {
      setRefreshing(true);
      const accs = extractAccounts(await refreshR2Usage());
      if (!accs) throw new Error("Unexpected response from server.");
      setAccounts(accs);

      const allHealthy = Object.values(accs).every((account) => account.status === "healthy");
      if (allHealthy) toast.success("R2 storage usage refreshed");
      else toast.error("Some accounts couldn't be refreshed");
    } catch (err) {
      if (err.response?.status === 403) navigate("/directory");
      else if (err.response?.status === 401) navigate("/login");
      else toast.error(getErr(err));
    } finally {
      setRefreshing(false);
    }
  }

  const lastSynced = latestSync(accounts);

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 20,
    alignItems: "start",
  };

  return (
    <AppLayout>
      <div style={{ padding: "24px 24px", minWidth: 0 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "var(--text)",
                marginBottom: 4,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Database size={20} aria-hidden="true" /> R2 Storage Usage
            </h1>
            <p style={{ fontSize: 13, color: "var(--muted)" }}>
              Free-tier consumption for Cloudflare R2 account.
            </p>
          </div>

          {/* Toolbar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            <div style={{ fontSize: 12, color: "var(--muted)" }} aria-live="polite">
              Last synced: {lastSynced ? formatDate(lastSynced) : "—"}
            </div>
            <ReloadButton
              onClick={handleRefresh}
              loading={refreshing}
              disabled={loading}
              label="Refresh R2 usage"
              style={{ marginLeft: "auto" }}
            />
          </div>

          {/* Body */}
          {loading && (
            <div style={gridStyle}>
              <R2UsageSkeleton />
            </div>
          )}

          {!loading && loadError && !accounts && (
            <div
              role="alert"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "40px 24px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
              }}
            >
              <TriangleAlert size={28} color="#EF4444" aria-hidden="true" />
              <div style={{ fontWeight: 600, color: "var(--text)", fontSize: 14 }}>
                Couldn&apos;t load R2 storage usage
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", maxWidth: 420 }}>
                {loadError}
              </div>
              <button
                type="button"
                onClick={load}
                style={{
                  marginTop: 6,
                  padding: "8px 14px",
                  background: "#3B82F6",
                  border: "none",
                  borderRadius: 8,
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Try again
              </button>
            </div>
          )}

          {!loading && accounts && Object.keys(accounts).length === 0 && (
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "40px 24px",
                textAlign: "center",
                fontSize: 13,
                color: "var(--muted)",
              }}
            >
              No R2 accounts are being monitored.
            </div>
          )}

          {!loading && accounts && Object.keys(accounts).length > 0 && (
            <div style={gridStyle}>
              {Object.entries(accounts).map(([key, account]) => (
                <R2AccountCard key={key} account={account} refreshing={refreshing} />
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes skpulse {
          0%,100% { opacity:0.4 }
          50% { opacity:0.8 }
        }
      `}</style>
    </AppLayout>
  );
}
