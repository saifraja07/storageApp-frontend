import { lazy, Suspense, memo } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { useUser } from "./context/UserContext";
import "./App.css";

// ── Lazy-loaded routes (code split per route) ─────────────────────────────
const DirectoryView = lazy(() => import("./DirectoryView"));
const Register = lazy(() => import("./Register"));
const Login = lazy(() => import("./Login"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const PlansPage = lazy(() => import("./pages/PlansPage"));
const AdminPlansPage = lazy(() => import("./pages/AdminPlansPage"));
const AdminUsersPage = lazy(() => import("./pages/AdminUsersPage"));

const PageSpinner = ({ message = "Loading…" }) => (
  <div
    style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
    }}
  >
    <div
      style={{
        width: 36,
        height: 36,
        border: "3px solid rgba(59,130,246,0.3)",
        borderTopColor: "var(--primary)",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }}
    />

    <p
      style={{
        color: "var(--muted)",
        fontSize: 14,
        fontWeight: 500,
        letterSpacing: "0.01em",
      }}
    >
      {message}
    </p>

    <style>{`
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `}</style>
  </div>
);

// ── Route guards (memoized to avoid re-renders on unrelated state changes) ─
const PublicRoute = memo(function PublicRoute({ children }) {
  const { user, loading } = useUser();
  if (loading) return <PageSpinner message="Checking Authentication…" />;
  if (user) return <Navigate to="/directory" replace />;
  return children;
});

const PrivateRoute = memo(function PrivateRoute({ children }) {
  const { user, loading } = useUser();
  if (loading) return <PageSpinner message="Checking Authentication…" />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
});

const AdminRoute = memo(function AdminRoute({ children }) {
  const { user, loading } = useUser();
  if (loading) return <PageSpinner message="Checking Authentication…" />;
  if (!user) return <Navigate to="/login" replace />;
  if (
    user.role !== "SuperAdmin" &&
    user.role !== "Admin" &&
    user.role !== "Manager"
  )
    return <Navigate to="/directory" replace />;
  return children;
});

// ── Router (defined once outside component to avoid recreation) ───────────
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<PageSpinner />}>
        <LandingPage />
      </Suspense>
    ),
  },
  {
    path: "/directory",
    element: (
      <PrivateRoute>
        <Suspense fallback={<PageSpinner />}>
          <DirectoryView />
        </Suspense>
      </PrivateRoute>
    ),
  },
  {
    path: "/directory/:dirId",
    element: (
      <PrivateRoute>
        <Suspense fallback={<PageSpinner />}>
          <DirectoryView />
        </Suspense>
      </PrivateRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicRoute>
        <Suspense fallback={<PageSpinner />}>
          <Register />
        </Suspense>
      </PublicRoute>
    ),
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Suspense fallback={<PageSpinner />}>
          <Login />
        </Suspense>
      </PublicRoute>
    ),
  },
  {
    path: "/settings",
    element: (
      <PrivateRoute>
        <Suspense fallback={<PageSpinner />}>
          <SettingsPage />
        </Suspense>
      </PrivateRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <PrivateRoute>
        <Suspense fallback={<PageSpinner />}>
          <ProfilePage />
        </Suspense>
      </PrivateRoute>
    ),
  },
  {
    path: "/subscription",
    element: (
      <PrivateRoute>
        <Suspense fallback={<PageSpinner />}>
          <PlansPage />
        </Suspense>
      </PrivateRoute>
    ),
  },
  {
    path: "/admin/users",
    element: (
      <AdminRoute>
        <Suspense fallback={<PageSpinner />}>
          <AdminUsersPage />
        </Suspense>
      </AdminRoute>
    ),
  },
  {
    path: "/admin/plans",
    element: (
      <AdminRoute>
        <Suspense fallback={<PageSpinner />}>
          <AdminPlansPage />
        </Suspense>
      </AdminRoute>
    ),
  },
  {
    path: "/privacy",
    element: (
      <Suspense fallback={<PageSpinner />}>
        <PrivacyPage />
      </Suspense>
    ),
  },
  {
    path: "/terms",
    element: (
      <Suspense fallback={<PageSpinner />}>
        <TermsPage />
      </Suspense>
    ),
  },
  {
    path: "*",
    element: (
      <Suspense fallback={<PageSpinner />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
