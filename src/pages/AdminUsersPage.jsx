import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchAllUsers,
  logoutUserByAdmin,
  softDeleteUserByAdmin,
  hardDeleteUserByAdmin,
  recoverUserByAdmin,
  updateUserRoleByAdmin,
} from "../api/adminApi.js";
import { useUser } from "../context/UserContext.jsx";
import AppLayout from "../components/AppLayout.jsx";
import { getErr } from "../utils/directoryUtils.js";
import ToastMessage from "../components/admin/usersPage/ToastMessage.jsx";
import UserStats from "../components/admin/usersPage/UserStats.jsx";
import UserFilters from "../components/admin/usersPage/UserFilters.jsx";
import UserTable from "../components/admin/usersPage/UserTable.jsx";
import DeleteUserModal from "../components/admin/usersPage/DeleteUserModal.jsx";

const TABLE_COLUMNS = "minmax(180px,2fr) minmax(240px,2.3fr) 170px 120px 90px 90px";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [searchQ, setSearchQ] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [toast, setToast] = useState("");
  const [listRefreshing, setListRefreshing] = useState(false);

  const navigate = useNavigate();
  const { user: currentLoggedUser } = useUser();
  const myRole = currentLoggedUser?.role;
  const isSuperAdmin = myRole === "SuperAdmin";
  const isAdmin = myRole === "Admin";
  const userEmail = currentLoggedUser?.email;
  const canManageUsers = isSuperAdmin || isAdmin;

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => setToast(""), 3000);
  };

  async function fetchUsers() {
    try {
      setLoading(true);
      const data = await fetchAllUsers();
      setUsers(data);
    } catch (err) {
      if (err.response?.status === 403) navigate("/directory");
      else if (err.response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
    }
  }

  async function refreshUsers() {
    try {
      setListRefreshing(true);
      const data = await fetchAllUsers();
      setUsers(data);
      showToast("Users refreshed");
    } catch (err) {
      showToast(getErr(err));
    } finally {
      setListRefreshing(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const closeMenu = () => setOpenMenuId(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  const logoutUser = async ({ id, email }) => {
    if (!confirm(`You're about to logout ${email === userEmail ? "yourself!" : email}`)) return;
    try {
      await logoutUserByAdmin(id);
      await refreshUsers();
      showToast(`${email} logged out`);
    } catch (err) {
      console.error(err);
      showToast(getErr(err));
    }
  };

  const handleDelete = async (type) => {
    try {
      if (type === "soft") await softDeleteUserByAdmin(deleteTarget.id);
      else await hardDeleteUserByAdmin(deleteTarget.id);
      setDeleteTarget(null);
      await refreshUsers();
      showToast("User deleted");
    } catch (err) {
      console.error(err);
      showToast(getErr(err));
    }
  };

  const recoverUser = async ({ id, email }) => {
    try {
      await recoverUserByAdmin(id);
      await refreshUsers();
      showToast(`${email} recovered`);
    } catch (err) {
      console.error(err);
      showToast(getErr(err));
    }
  };

  const changeRole = async (u, role) => {
    try {
      await updateUserRoleByAdmin(u.id, role);
      await refreshUsers();
      showToast(`${u.email} → ${role}`);
    } catch (err) {
      console.error(err);
      showToast(getErr(err));
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

  const filtered = users.filter((u) => {
    const matchQ =
      !searchQ ||
      u.name?.toLowerCase().includes(searchQ.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQ.toLowerCase());
    const matchRole = filterRole === "all" || u.role === filterRole;
    return matchQ && matchRole;
  });

  const stats = {
    total:   users.length,
    active:  users.filter((u) => !u.isDeleted && u.isLoggedIn).length,
    admins:  users.filter((u) => u.role === "Admin").length,
    deleted: users.filter((u) => u.isDeleted).length,
  };

  return (
    <AppLayout>
      <div style={{ padding: "24px 24px", minWidth: 0 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>

          <ToastMessage message={toast} />

          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
              👥 User Management
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
            filteredCount={filtered.length}
            totalCount={users.length}
            onRefresh={refreshUsers}
            listRefreshing={listRefreshing}
          />

          <UserTable
            loading={loading}
            filtered={filtered}
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
        </div>
      </div>

      {deleteTarget && (
        <DeleteUserModal
          user={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
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
