import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChartColumn } from "lucide-react";
import AppLayout from "../components/AppLayout";
import { useUser } from "../context/UserContext";
import { fetchPlansDashboard } from "../api/adminApi";
import { getErr } from "../utils/directoryUtils";
import toast from "react-hot-toast";
import PlanStats from "../components/admin/plansPage/PlanStats";
import PlansSearchBar from "../components/admin/plansPage/PlansSearchBar";
import ActivePlansTable from "../components/admin/plansPage/ActivePlansTable";
import StorageAlerts from "../components/admin/plansPage/StorageAlerts";
import RecentSubscriptions from "../components/admin/plansPage/RecentSubscriptions";

const EMPTY_DASHBOARD = {
  summary: {
    totalUsers: 0,
    premiumUsers: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
  },
  activePlans: [],
  storageAlerts: [],
  recentSubscriptions: [],
};

export default function AdminPlansPage() {
  const { user } = useUser();
  const navigate = useNavigate();

  const [data, setData] = useState(EMPTY_DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState("");

  useEffect(() => {
    if (
      user &&
      user.role !== "SuperAdmin" &&
      user.role !== "Admin" &&
      user.role !== "Manager"
    ) {
      navigate("/directory");
    }
  }, [user, navigate]);

  async function loadDashboard() {
    try {
      setLoading(true);
      const result = await fetchPlansDashboard();
      setData(result);
    } catch (err) {
      if (err.response?.status === 403) navigate("/directory");
      else if (err.response?.status === 401) navigate("/login");
      else toast.error(getErr(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const filteredPlans = data.activePlans.filter((p) => {
    if (!searchQ) return true;
    const q = searchQ.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q)
    );
  });

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
              <ChartColumn size={20} aria-hidden="true" /> Plan Management
            </h1>
            <p style={{ fontSize: 13, color: "var(--muted)" }}>
              Monitor subscriptions, revenue, and storage usage across all
              users.
            </p>
          </div>

          {/* Summary cards */}
          <PlanStats summary={data.summary} loading={loading} />

          {/* Active plans */}
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--text)",
                marginBottom: 12,
              }}
            >
              Active Plans
            </div>
            <PlansSearchBar
              searchQ={searchQ}
              setSearchQ={setSearchQ}
              filteredCount={filteredPlans.length}
              totalCount={data.activePlans.length}
            />
            <ActivePlansTable loading={loading} plans={filteredPlans} />
          </div>

          {/* Storage alerts + recent subscriptions */}
          <div
            className="plans-bottom-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr 1fr",
              gap: 20,
              alignItems: "start",
            }}
          >
            <StorageAlerts loading={loading} users={data.storageAlerts} />
            <RecentSubscriptions
              loading={loading}
              subscriptions={data.recentSubscriptions}
            />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .plans-bottom-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </AppLayout>
  );
}
