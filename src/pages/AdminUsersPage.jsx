import toast from "react-hot-toast";
import AppLayout from "../components/AppLayout.jsx";
import Pagination from "../components/Pagination.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import UserTable from "../components/admin/usersPage/UserTable.jsx";
import UserStats from "../components/admin/usersPage/UserStats.jsx";
import UserFilters from "../components/admin/usersPage/UserFilters.jsx";
import DeleteUserModal from "../components/admin/usersPage/DeleteUserModal.jsx";
import { Users, Lock } from "lucide-react";
import { usePage } from "../hooks/usePage.js";
import { logError } from "../utils/logger.js";
import { getErr } from "../utils/directoryUtils.js";
import { useUser } from "../context/UserContext.jsx";
import { useNavigate } from "react-router-dom";
import { useDebouncedValue } from "../hooks/useDebouncedValue.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_PAGE_SIZE, SEARCH_DEBOUNCE_MS, scrollListIntoView } from "../utils/pagination.js";
import {
  fetchAllUsers,
  fetchUserStats,
  logoutUserByAdmin,
  softDeleteUserByAdmin,
  hardDeleteUserByAdmin,
  recoverUserByAdmin,
  updateUserRoleByAdmin,
} from "../api/adminApi.js";

const TABLE_COLUMNS =
  "minmax(180px,2fr) minmax(240px,2.3fr) 170px 120px 90px 90px";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [stats, setStats] = useState({ total: 0, active: 0, admins: 0, deleted: 0 });
  const [loading, setLoading] = useState(true);
  // Next page / new filter: keep the current rows (dimmed) instead of a skeleton.
  const [fetching, setFetching] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [searchQ, setSearchQ] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [listRefreshing, setListRefreshing] = useState(false);

  // The server searches; wait for a pause in typing before asking it.
  const search = useDebouncedValue(searchQ.trim(), SEARCH_DEBOUNCE_MS);
  // Changing the search, role or page size returns to page 1.
  const [page, setPage] = usePage(`${search}|${filterRole}|${pageSize}`);
  const tableTopRef = useRef(null);

  const navigate = useNavigate();
  const { user: currentLoggedUser, setUser } = useUser();
  const myRole = currentLoggedUser?.role;
  const isSuperAdmin = myRole === "SuperAdmin";
  const isAdmin = myRole === "Admin";
  const userEmail = currentLoggedUser?.email;
  const canManageUsers = isSuperAdmin || isAdmin;
  const [logoutTarget, setLogoutTarget] = useState(null);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);

  // Only the newest request may update the screen (fast typing / page clicks).
  const requestIdRef = useRef(0);
  const hasLoadedRef = useRef(false);
  // Read through a ref so the loader's identity only follows page/search/role.
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  const loadUsers = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    const isLatest = () => requestId === requestIdRef.current;
    try {
      const data = await fetchAllUsers({ page, limit: pageSize, search, role: filterRole });
      if (!isLatest()) return;
      // The page no longer exists (e.g. its last user was deleted): the server
      // answered with the last valid page, so move there; that reloads it.
      if (data.pagination.currentPage !== page) {
        setPage(data.pagination.currentPage);
        return;
      }
      setUsers(data.users);
      setPagination(data.pagination);
      hasLoadedRef.current = true;
    } catch (err) {
      if (!isLatest()) return;
      if (err.response?.status === 403) navigateRef.current("/directory");
      else if (err.response?.status === 401) navigateRef.current("/login");
      else if (hasLoadedRef.current) toast.error(getErr(err));
    } finally {
      if (isLatest()) {
        setLoading(false);
        setFetching(false);
        setListRefreshing(false);
      }
    }
  }, [page, pageSize, search, filterRole, setPage]);

  const loadStats = useCallback(async () => {
    try {
      setStats(await fetchUserStats());
    } catch (err) {
      logError(err);
    }
  }, []);

  // Fetch the page again whenever the page, page size, search or role changes.
  useEffect(() => {
    if (hasLoadedRef.current) setFetching(true);
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Reload button / after an action: refresh the current page and the totals.
  const refreshUsers = useCallback(async () => {
    setListRefreshing(true);
    await Promise.all([loadUsers(), loadStats()]);
  }, [loadUsers, loadStats]);

  const changePage = useCallback(
    (next) => {
      setPage(next);
      scrollListIntoView(tableTopRef.current);
    },
    [setPage],
  );

  useEffect(() => {
    const closeMenu = () => setOpenMenuId(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  const logoutUser = ({ id, email }) => {
    setOpenMenuId(null);
    setLogoutTarget({ id, email });
  };

  const confirmLogout = async () => {
    if (!logoutTarget || logoutLoading) return;
    setLogoutLoading(true);
    const isSelf = logoutTarget.id === currentLoggedUser.id;

    try {
      await logoutUserByAdmin(logoutTarget.id);
      if (isSelf) {
        setUser(null);
        navigate("/login", { replace: true });
        return;
      }
      await refreshUsers();
      toast.success(`${logoutTarget.email} logged out`);
      setLogoutTarget(null);
    } catch (err) {
      logError(err);
      toast.error(getErr(err));
    } finally {
      setLogoutLoading(false);
    }
  };

  const handleDelete = async (type) => {
    if (!deleteTarget || deleteLoading) return;
    setDeleteLoading(type);
    try {
      if (type === "soft") await softDeleteUserByAdmin(deleteTarget.id);
      else await hardDeleteUserByAdmin(deleteTarget.id);
      setDeleteTarget(null);
      await refreshUsers();
      toast.success(type === "soft" ? "User deactivated successfully" : "User deleted permanently");
    } catch (err) {
      logError(err);
      toast.error(getErr(err));
    } finally {
      setDeleteLoading(null);
    }
  };

  const recoverUser = async ({ id, email }) => {
    try {
      await recoverUserByAdmin(id);
      await refreshUsers();
      toast.success(`${email} recovered successfully`);
    } catch (err) {
      logError(err);
      toast.error(getErr(err));
    }
  };

  const changeRole = async (u, role) => {
    try {
      await updateUserRoleByAdmin(u.id, role);
      await refreshUsers();
      toast.success(`${u.email} → ${role}`);
    } catch (err) {
      logError(err);
      toast.error(getErr(err));
    }
  };

  const handleOpenMenu = (e, userId) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const menuHeight = 180;
    let top = rect.bottom + 6;
    if (top + menuHeight > window.innerHeight) top = rect.top - menuHeight - 6;
    setMenuPos({ top, left: rect.right - 160 });
    setOpenMenuId(openMenuId === userId ? null : userId);
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
              <Users size={20} aria-hidden="true" /> User Management
            </h1>
            <p style={{ fontSize: 13, color: "var(--muted)" }}>
              Manage all registered users, roles, and sessions.
            </p>
          </div>

          <UserStats stats={stats} />

          <UserFilters
            searchQ={searchQ}
            setSearchQ={setSearchQ}
            filterRole={filterRole}
            setFilterRole={setFilterRole}
            filteredCount={pagination?.totalItems ?? 0}
            totalCount={Math.max(stats.total, pagination?.totalItems ?? 0)}
            onRefresh={refreshUsers}
            listRefreshing={listRefreshing}
          />

          <div ref={tableTopRef} />
          <UserTable
            loading={loading}
            fetching={fetching}
            users={users}
            canManageUsers={canManageUsers}
            TABLE_COLUMNS={TABLE_COLUMNS}
            userEmail={userEmail}
            isSuperAdmin={isSuperAdmin}
            openMenuId={openMenuId}
            menuPos={menuPos}
            onLogout={logoutUser}
            onOpenMenu={handleOpenMenu}
            onChangeRole={changeRole}
            onRecover={recoverUser}
            onDeleteTarget={setDeleteTarget}
            onCloseMenu={() => setOpenMenuId(null)}
          />

          {!loading && (
            <Pagination
              pagination={pagination}
              onPageChange={changePage}
              onLimitChange={setPageSize}
              itemLabel="users"
            />
          )}
        </div>
      </div>

      {deleteTarget && (
        <DeleteUserModal
          user={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loadingAction={deleteLoading}
        />
      )}
      {logoutTarget && (
        <ConfirmDialog
          open={true}
          icon={<Lock size={32} aria-hidden="true" />}
          title="Log out user?"
          message={
            logoutTarget.email === userEmail
              ? "You're about to log yourself out from all devices."
              : `You're about to log out ${logoutTarget.email} from all active sessions.`
          }
          confirmLabel="Log Out"
          loadingLabel="Logging out..."
          isLoading={logoutLoading}
          confirmDanger
          onConfirm={confirmLogout}
          onCancel={() => !logoutLoading && setLogoutTarget(null)}
        />
      )}

      <style>{`
        @keyframes skpulse {
          0%,100% { opacity:0.4 }
          50% { opacity:0.8 }
        }
        @media (max-width: 700px) {
          .users-table-row { font-size: 12px; }
        }
      `}</style>
    </AppLayout>
  );
}
