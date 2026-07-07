import { useState, useRef, useEffect, useCallback, memo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Folder,
  CreditCard,
  Settings,
  Users,
  ChartColumn,
  Menu,
  User,
  ChevronDown,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { logoutUser } from "../api/userApi";
import { formatStorage } from "../utils/directoryUtils";
import { logError } from "../utils/logger";

// ── NavLink — memoized so it only re-renders when active state changes ────
const NavLink = memo(function NavLink({ item, active }) {
  return (
    <Link
      to={item.href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 9,
        padding: "8px 10px",
        borderRadius: 7,
        textDecoration: "none",
        background: active ? "rgba(59,130,246,0.15)" : "transparent",
        color: active ? "#93C5FD" : "var(--muted)",
        fontSize: 13,
        fontWeight: 500,
        transition: "all 0.12s",
      }}
      onMouseOver={(e) => {
        if (!active) {
          e.currentTarget.style.background = "var(--surface-hover)";
          e.currentTarget.style.color = "var(--text)";
        }
      }}
      onMouseOut={(e) => {
        if (!active) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "var(--muted)";
        }
      }}
    >
      <span style={{ fontSize: 15, display: "flex" }}>
        <item.icon size={15} aria-hidden="true" />
      </span>
      {item.label}
    </Link>
  );
});

// ── StorageWidget — memoized, only re-renders when storage values change ──
const StorageWidget = memo(function StorageWidget({ used, max }) {
  const pct = Math.min((used / (max || 1)) * 100, 100);
  const storageColor =
    pct >= 90 ? "#EF4444" : pct >= 70 ? "#F59E0B" : "var(--primary)";
  return (
    <div
      style={{
        marginTop: "auto",
        padding: "14px 10px",
        background: "rgba(255,255,255,0.04)",
        borderRadius: 9,
        border: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 7,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--muted)",
            letterSpacing: 0.3,
          }}
        >
          STORAGE
        </span>
        <span style={{ fontSize: 10, color: "var(--muted)" }}>
          {Math.round(pct)}%
        </span>
      </div>
      <div
        style={{
          height: 4,
          background: "rgba(255,255,255,0.07)",
          borderRadius: 2,
          overflow: "hidden",
          marginBottom: 7,
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: storageColor,
            borderRadius: 2,
            transition: "width 0.4s",
          }}
        />
      </div>
      <div style={{ fontSize: 11, color: "var(--muted)" }}>
        {formatStorage(used)}{" "}
        <span style={{ color: "rgba(255,255,255,0.18)" }}>/</span>{" "}
        {formatStorage(max)}
      </div>
    </div>
  );
});

const NAV_ITEMS = [
  { label: "My Drive", icon: Folder, href: "/directory" },
  { label: "Subscription", icon: CreditCard, href: "/subscription" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

const ADMIN_ITEMS = [
  { label: "Users", icon: Users, href: "/admin/users" },
  { label: "Plans", icon: ChartColumn, href: "/admin/plans" },
];

// ── Page title lookup (computed once, not inside render) ──────────────────
function getPageTitle(pathname) {
  if (pathname.startsWith("/admin/users")) return "User Management";
  if (pathname.startsWith("/admin/plans")) return "Plan Management";
  if (pathname.startsWith("/subscription")) return "Subscription";
  if (pathname.startsWith("/settings")) return "Settings";
  if (pathname.startsWith("/profile")) return "Profile";
  return "My Drive";
}
function getNavBreadcrumb(pathname) {
  if (pathname === "/directory") return "";
  if (pathname.startsWith("/admin")) return " · Admin";
  if (pathname.startsWith("/subscription")) return " · Billing";
  return " · Account";
}

// ── SidebarContent — extracted outside AppLayout so React never sees a new
// component type on re-render (avoids full subtree unmount/remount) ────────
const SidebarContent = memo(function SidebarContent({
  isActive,
  showAdmin,
  adminLabel,
  used,
  max,
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "18px 10px",
      }}
    >
      {/* Logo */}
      <Link
        to="/directory"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          marginBottom: 24,
          textDecoration: "none",
          padding: "0 8px",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            background: "var(--primary)",
            borderRadius: 7,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 15,
            flexShrink: 0,
          }}
        >
          ☁️
        </div>
        <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>
          Haadi Cloud
        </span>
      </Link>

      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} />
        ))}
        {showAdmin && (
          <>
            <div
              style={{
                margin: "10px 0 6px",
                padding: "0 10px",
                fontSize: 10,
                fontWeight: 700,
                color: "rgba(255,255,255,0.25)",
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              {adminLabel}
            </div>
            {ADMIN_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={isActive(item.href)}
              />
            ))}
          </>
        )}
      </nav>

      <StorageWidget used={used} max={max} />
    </div>
  );
});

export default function AppLayout({
  children,
  fileInputRef,
  handleFileSelect,
}) {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const used = user?.usedStorageInBytes || 0;
  const max = user?.maxStorageInBytes || 1;

  const isSuperAdmin = user?.role === "SuperAdmin";
  const isAdmin = user?.role === "Admin";
  const isManager = user?.role === "Manager";
  const showAdmin = isSuperAdmin || isAdmin || isManager;

  // Close user menu on outside click
  useEffect(() => {
    function h(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setUserMenuOpen(false);
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = useCallback(async () => {
    try {
      await logoutUser();
      setUser(null);
      navigate("/login");
    } catch (e) {
      logError(e);
    }
  }, [setUser, navigate]);

  const isActive = useCallback(
    (href) =>
      href === "/directory"
        ? location.pathname.startsWith("/directory")
        : location.pathname === href,
    [location.pathname],
  );

  const adminLabel = isSuperAdmin
    ? "Super Admin"
    : isAdmin
      ? "Admin"
      : "Manager";
  const pageTitle = getPageTitle(location.pathname);
  const navBreadcrumb = getNavBreadcrumb(location.pathname);

  const sidebarProps = { isActive, showAdmin, adminLabel, used, max };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--bg)",
        fontFamily: "Inter,sans-serif",
        color: "var(--text)",
      }}
    >
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            zIndex: 40,
          }}
          className="mobile-overlay"
        />
      )}

      {/* Sidebar desktop */}
      <aside
        className="desktop-sidebar"
        style={{
          width: 210,
          flexShrink: 0,
          borderRight: "1px solid var(--border)",
          background: "var(--surface)",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* Sidebar mobile drawer */}
      <aside
        className="mobile-drawer"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: 230,
          background: "var(--surface)",
          borderRight: "1px solid var(--border)",
          zIndex: 50,
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.22s ease",
          overflowY: "auto",
        }}
      >
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* Main */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          overflowX: "auto",
        }}
      >
        {/* Top Nav */}
        <header
          style={{
            height: 58,
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            gap: 12,
            background: "var(--surface)",
            position: "sticky",
            top: 0,
            zIndex: 30,
            minWidth: 0,
          }}
        >
          <button
            onClick={() => setSidebarOpen((p) => !p)}
            className="mobile-menu-btn"
            style={{
              display: "none",
              background: "none",
              border: "none",
              color: "var(--muted)",
              cursor: "pointer",
              fontSize: 20,
              padding: 4,
              flexShrink: 0,
            }}
          >
            <Menu size={20} aria-hidden="true" />
          </button>

          <div className="nav-page-title" style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}
            >
              {pageTitle}
            </div>
            <div
              className="nav-breadcrumb"
              style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}
            >
              Haadi Cloud{navBreadcrumb}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginLeft: "auto",
              flexShrink: 0,
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />

            {/* User info + avatar */}
            <div ref={userMenuRef} style={{ position: "relative" }}>
              <button
                onClick={() => setUserMenuOpen((p) => !p)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid var(--border)",
                  borderRadius: 9,
                  padding: "5px 10px 5px 6px",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "var(--surface-hover)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.04)")
                }
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    border: "2px solid var(--border)",
                    background: "var(--surface-hover)",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {user?.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      loading="lazy"
                    />
                  ) : (
                    <User size={14} aria-hidden="true" />
                  )}
                </div>
                <div
                  className="nav-user-info"
                  style={{ textAlign: "left", minWidth: 0 }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--text)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: 130,
                    }}
                  >
                    {user?.name || "User"}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--muted)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: 130,
                    }}
                  >
                    {user?.email || ""}
                  </div>
                </div>
                <span
                  style={{ fontSize: 10, color: "var(--muted)", marginLeft: 2, display: "flex" }}
                >
                  <ChevronDown size={12} aria-hidden="true" />
                </span>
              </button>

              {userMenuOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 8px)",
                    width: 230,
                    background: "#1a2433",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    overflow: "hidden",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
                    zIndex: 200,
                  }}
                >
                  <div
                    style={{
                      padding: "13px 16px",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <div
                      style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}
                    >
                      {user?.name || "User"}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--muted)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {user?.email || ""}
                    </div>
                    {user?.role && (
                      <div
                        style={{
                          marginTop: 5,
                          display: "inline-block",
                          fontSize: 10,
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: 10,
                          background:
                            user.role === "Admin"
                              ? "rgba(239,68,68,0.15)"
                              : user.role === "Manager"
                                ? "rgba(245,158,11,0.15)"
                                : "rgba(59,130,246,0.12)",
                          color:
                            user.role === "Admin"
                              ? "#F87171"
                              : user.role === "Manager"
                                ? "#FCD34D"
                                : "#93C5FD",
                        }}
                      >
                        {user.role}
                      </div>
                    )}
                  </div>
                  {[
                    ["Profile", "/profile"],
                    ["Settings", "/settings"],
                    ["Subscription", "/subscription"],
                  ].map(([label, href]) => (
                    <Link
                      key={href}
                      to={href}
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: "block",
                        padding: "9px 16px",
                        fontSize: 13,
                        color: "var(--text)",
                        textDecoration: "none",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.background =
                          "var(--surface-hover)")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      {label}
                    </Link>
                  ))}
                  <div style={{ borderTop: "1px solid var(--border)" }}>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: "100%",
                        padding: "9px 16px",
                        background: "none",
                        border: "none",
                        color: "#F87171",
                        fontSize: 13,
                        textAlign: "left",
                        cursor: "pointer",
                        fontFamily: "Inter,sans-serif",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(239,68,68,0.08)")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.background = "none")
                      }
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main style={{ flex: 1, overflowX: "auto", overflowY: "auto" }}>
          <div style={{ minWidth: 320 }}>{children}</div>
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-drawer { display: none !important; }
          .mobile-overlay { display: none !important; }
        }
        @media (max-width: 520px) {
          .nav-user-info { display: none !important; }
          .nav-breadcrumb { display: none !important; }
        }
      `}</style>
    </div>
  );
}
