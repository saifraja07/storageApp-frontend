import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import { useUser } from "./context/UserContext";

import {
  getDirectoryItems,
  createDirectory,
  deleteDirectory,
  renameDirectory,
  getDirectoryPath,
} from "./api/directoryApi";
import {
  deleteFile,
  renameFile,
  uploadCancel,
  uploadComplete,
  uploadInitiate,
} from "./api/fileApi";
import { bulkDeleteItems } from "./api/userApi";
import { BASE_URL } from "./api/axiosInstances";
import { getExt, getErr } from "./utils/directoryUtils";
import { useIsMobile } from "./hooks/useIsMobile";
import Breadcrumbs from "./components/BreadCrumb";
import CreateFolderModal from "./components/CreateFolderModal";
import ConfirmDialog from "./components/ConfirmDialog";
import RenameModal from "./components/RenameModal";
import DeleteModal from "./components/DeleteModal";
import DetailsModal from "./components/DetailsModal";
import UploadZone from "./components/UploadZone";
import DirectoryToolbar from "./components/directory/DirectoryToolbar";
import MobileActionBar from "./components/directory/MobileActionBar";
import ToastStack from "./components/directory/ToastStack";
import ListRefreshOverlay from "./components/directory/ListRefreshOverlay";
import DirectoryGrid from "./components/directory/DirectoryGrid";

// ── Module-level cache — survives navigation (unmount/remount) ────────────
const dirCache = new Map();

// ── Upload pool — pure function, no component state needed ────────────────
function createPool(limit) {
  let active = 0;
  const queue = [];
  const next = () => {
    if (active >= limit || !queue.length) return;
    active++;
    queue.shift()().finally(() => { active--; next(); });
    next();
  };
  return (task) =>
    new Promise((res, rej) => {
      queue.push(() => task().then(res).catch(rej));
      next();
    });
}

// ── R2 XHR upload — only needs setProgressMap (passed in) ─────────────────
function uploadFileToR2({ item, fileId, uploadUrl, setProgressMap }) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", item.contentType);
    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable)
        setProgressMap((p) => ({
          ...p,
          [item.id]: (evt.loaded / evt.total) * 100,
        }));
    };
    xhr.onload = async () => {
      if (xhr.status === 200) {
        try { await uploadComplete({ fileId }); resolve(); }
        catch (e) { reject(e); }
      } else {
        try { await uploadCancel({ fileId }); } catch {}
        reject(new Error("Upload failed"));
      }
    };
    xhr.onerror = async () => {
      try { await uploadCancel({ fileId }); } catch {}
      reject(new Error("Network error"));
    };
    xhr.send(item.file);
  });
}

export default function DirectoryView() {
  const { dirId } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useUser();
  const isMobile = useIsMobile();

  // ── state ──────────────────────────────────────────────────────────────────
  const [directoriesList, setDirectoriesList] = useState([]);
  const [filesList, setFilesList] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  // ── toast system ───────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [listRefreshing, setListRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [isDragOver, setIsDragOver] = useState(false);
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem("viewMode") || "grid";
  });

  // ── per-item loading ───────────────────────────────────────────────────────
  const [loadingItems, setLoadingItems] = useState(new Set());
  const addLoadingItem = useCallback(
    (id) => setLoadingItems((s) => new Set([...s, String(id)])),
    [],
  );
  const dropLoadingItem = useCallback(
    (id) =>
      setLoadingItems((s) => {
        const n = new Set(s);
        n.delete(String(id));
        return n;
      }),
    [],
  );

  const [renameLoading, setRenameLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  const [showCreateDir, setShowCreateDir] = useState(false);
  const [newDirname, setNewDirname] = useState("New Folder");

  const [showRename, setShowRename] = useState(false);
  const [renameTarget, setRenameTarget] = useState({ type: null, id: null, value: "" });

  const [deleteItem, setDeleteItem] = useState(null);
  const [detailsItem, setDetailsItem] = useState(null);

  const [progressMap, setProgressMap] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [bulkConfirm, setBulkConfirm] = useState(false);

  const fileInputRef = useRef(null);
  const dragCounter = useRef(0);
  const processUploadRef = useRef(null);
  const cacheKey = `${user?.id}:${dirId || "root"}`;

  // ── load directory ─────────────────────────────────────────────────────────
  const loadDirectory = useCallback(
    async (opts = {}) => {
      if (!opts.force && dirCache.has(cacheKey)) {
        const { directories, files, breadcrumbs: bc } = dirCache.get(cacheKey);
        setDirectoriesList(directories);
        setFilesList(files);
        setBreadcrumbs(bc || []);
        setLoading(false);
        return;
      } else if (opts.silent) {
        setListRefreshing(true);
      } else {
        setLoading(true);
      }
      try {
        const [data, pathData] = await Promise.all([
          getDirectoryItems(dirId),
          dirId ? getDirectoryPath(dirId) : Promise.resolve(null),
        ]);
        const dirs = [...data.directories].reverse();
        const files = [...data.files].reverse();
        const bc = pathData ? [...pathData.path, pathData.current] : [];
        dirCache.set(cacheKey, { directories: dirs, files, breadcrumbs: bc });
        setDirectoriesList(dirs);
        setFilesList(files);
        setBreadcrumbs(bc);
      } catch (err) {
        addToast(getErr(err), "error");
      } finally {
        setLoading(false);
        setListRefreshing(false);
      }
    },
    [cacheKey, dirId, addToast],
  );
  
const previousUserId = useRef();

useEffect(() => {
  if (!user) {
    dirCache.clear();
    previousUserId.current = undefined;
    return;
  }

  if (previousUserId.current !== user.id) {
    dirCache.clear();
    previousUserId.current = user.id;
  }
  loadDirectory();
  setSelectedItems([]);
  setSelectionMode(false);
}, [dirId, user?.id, loadDirectory]);

  useEffect(() => {
    localStorage.setItem("viewMode", viewMode);
  }, [viewMode]);

  // ── drag & drop (desktop only) ─────────────────────────────────────────────
  const onDragEnter = useCallback((e) => {
    if (isMobile) return;
    e.preventDefault();
    dragCounter.current++;
    if (e.dataTransfer.types.includes("Files")) setIsDragOver(true);
  }, [isMobile]);
  const onDragLeave = useCallback((e) => {
    if (isMobile) return;
    e.preventDefault();
    if (--dragCounter.current === 0) setIsDragOver(false);
  }, [isMobile]);
  const onDragOver = useCallback((e) => {
    if (isMobile) return;
    e.preventDefault();
  }, [isMobile]);
  const onDrop = useCallback(async (e) => {
    if (isMobile) return;
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) await processUploadRef.current(files);
  }, [isMobile]);

  // ── upload ─────────────────────────────────────────────────────────────────
  async function processUpload(files) {
    try {
      const pool = createPool(3);
      const tempItems = files.map((file) => ({
        file,
        id: `temp-${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size,
        contentType: file.type,
      }));
      setFilesList((prev) => [...tempItems, ...prev]);
      tempItems.forEach((f) => setProgressMap((p) => ({ ...p, [f.id]: 0 })));

      const failedIds = [];
      const results = await Promise.allSettled(
        tempItems.map((item) =>
          pool(async () => {
            try {
              const data = await uploadInitiate({
                name: item.name,
                size: item.size,
                contentType: item.contentType,
                parentDirId: dirId,
              });
              await uploadFileToR2({
                item,
                fileId: data.fileId,
                uploadUrl: data.signedUrl,
                setProgressMap,
              });
            } catch (err) {
              failedIds.push(item.id);
              throw err;
            }
          }),
        ),
      );

      const succeeded = results.filter((r) => r.status === "fulfilled");
      const failed = results.filter((r) => r.status === "rejected");

      if (failedIds.length) {
        setFilesList((prev) => prev.filter((f) => !failedIds.includes(f.id)));
        setProgressMap((prev) => {
          const next = { ...prev };
          failedIds.forEach((id) => delete next[id]);
          return next;
        });
      }

      if (failed.length) {
        const firstError = failed[0].reason;
        addToast(
          firstError?.response?.data?.message ||
            firstError?.response?.data?.error ||
            firstError?.message ||
            `${failed.length} file${failed.length > 1 ? "s" : ""} failed to upload`,
          "error"
        );
      }

      if (succeeded.length) {
        await Promise.all([
          loadDirectory({ force: true, silent: true }),
          refreshUser(),
        ]);
        addToast(
          `${succeeded.length} file${succeeded.length > 1 ? "s" : ""} uploaded successfully`,
          "success"
        );
      }
    } catch (err) {
      addToast(err.message || "Upload failed", "error");
    }
  }

  processUploadRef.current = processUpload;

  const handleFileSelect = useCallback(async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    e.target.value = "";
    await processUploadRef.current(files);
  }, []);

  // ── CRUD actions ───────────────────────────────────────────────────────────
  async function confirmDelete(item) {
    const itemId = String(item.id || item._id);
    setDeleteItem(null);
    addLoadingItem(itemId);
    try {
      if (item.isDirectory) await deleteDirectory(itemId);
      else await deleteFile(itemId);
      if (item.isDirectory)
        setDirectoriesList((prev) => prev.filter((d) => String(d._id || d.id) !== itemId));
      else
        setFilesList((prev) => prev.filter((f) => String(f._id || f.id) !== itemId));
      await refreshUser();
      dirCache.delete(cacheKey);
      addToast(`"${item.name}" ${item.isDirectory ? "folder" : "file"} deleted`, "success");
    } catch (err) {
      addToast(getErr(err), "error");
      loadDirectory({ force: true, silent: true });
    } finally {
      dropLoadingItem(itemId);
    }
  }

  async function handleCreateDirectory(e) {
    e.preventDefault();
    setCreateLoading(true);
    try {
      await createDirectory(dirId, newDirname);
      const name = newDirname;
      setNewDirname("New Folder");
      setShowCreateDir(false);
      dirCache.delete(cacheKey);
      loadDirectory({ force: true, silent: true });
      addToast(`"${name}" folder created`, "success");
    } catch (err) {
      addToast(getErr(err), "error");
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleRenameSubmit(e) {
    e.preventDefault();
    setRenameLoading(true);
    try {
      if (renameTarget.type === "file") await renameFile(renameTarget.id, renameTarget.value);
      else await renameDirectory(renameTarget.id, renameTarget.value);
      setShowRename(false);
      dirCache.delete(cacheKey);
      loadDirectory({ force: true, silent: true });
      addToast(`Renamed to "${renameTarget.value}"`, "success");
    } catch (err) {
      addToast(getErr(err), "error");
    } finally {
      setRenameLoading(false);
    }
  }

  async function handleBulkDelete() {
    if (!selectedItems.length) return;
    const count = selectedItems.length;
    setBulkLoading(true);
    selectedItems.forEach((i) => addLoadingItem(String(i.id || i._id)));
    try {
      await bulkDeleteItems({
        fileIds: selectedItems.filter((i) => !i.isDirectory).map((i) => i.id || i._id),
        directoryIds: selectedItems.filter((i) => i.isDirectory).map((i) => i.id || i._id),
      });
      setSelectionMode(false);
      setSelectedItems([]);
      dirCache.delete(cacheKey);
      await Promise.all([
        loadDirectory({ force: true, silent: true }),
        refreshUser(),
      ]);
      addToast(`${count} item${count !== 1 ? "s" : ""} deleted`, "success");
    } catch (err) {
      addToast(getErr(err), "error");
    } finally {
      setBulkLoading(false);
      selectedItems.forEach((i) => dropLoadingItem(String(i.id || i._id)));
    }
  }

  // ── selection ──────────────────────────────────────────────────────────────
  const selectedIds = useMemo(
    () => new Set(selectedItems.map((i) => String(i._id || i.id))),
    [selectedItems],
  );

  const toggleSelect = useCallback((item) => {
    setSelectedItems((prev) => {
      const exists = prev.some(
        (i) => String(i._id || i.id) === String(item._id || item.id),
      );
      return exists
        ? prev.filter((i) => String(i._id || i.id) !== String(item._id || item.id))
        : [...prev, item];
    });
  }, []);

  const handleItemClick = useCallback((item) => {
    if (selectionMode) {
      toggleSelect(item);
      return;
    }
    if (item.isDirectory) navigate(`/directory/${item._id || item.id}`);
    else window.open(`${BASE_URL}/file/${item._id || item.id}`, "_blank");
  }, [selectionMode, toggleSelect, navigate]);

  const openRename = useCallback((item) => {
    setRenameTarget({
      type: item.isDirectory ? "directory" : "file",
      id: item._id || item.id,
      value: item.name,
    });
    setShowRename(true);
  }, []);

  // ── sort ───────────────────────────────────────────────────────────────────
  function handleSort(field, direction) {
    if (direction) {
      setSortDir(direction);
    } else if (sortBy === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
    if (field && field !== sortBy) setSortBy(field);
  }

  // ── derived data ───────────────────────────────────────────────────────────
  const realItems = useMemo(() => [
    ...directoriesList.map((d) => ({ ...d, isDirectory: true })),
    ...filesList.map((f) => ({ ...f, isDirectory: false })),
  ], [directoriesList, filesList]);

  const q = searchQuery.trim().toLowerCase();

  const sorted = useMemo(() => {
    const filtered = q
      ? realItems.filter((i) => i.name?.toLowerCase().includes(q))
      : realItems;
    return [...filtered].sort((a, b) => {
      if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
      let av, bv;
      if (sortBy === "name") {
        av = (a.name || "").toLowerCase();
        bv = (b.name || "").toLowerCase();
      } else if (sortBy === "date") {
        av = new Date(a.updatedAt || a.createdAt || 0);
        bv = new Date(b.updatedAt || b.createdAt || 0);
      } else if (sortBy === "size") {
        av = a.size || 0;
        bv = b.size || 0;
      } else if (sortBy === "type") {
        av = getExt(a.name);
        bv = getExt(b.name);
      } else {
        av = "";
        bv = "";
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [realItems, q, sortBy, sortDir]);

  const totalItems = useMemo(
    () => directoriesList.length + filesList.filter((f) => !f.id?.startsWith("temp-")).length,
    [directoriesList, filesList]
  );

  const itemProps = useMemo(() => ({
    selectionMode,
    selectedIds,
    toggleSelect,
    handleItemClick,
    openRename,
    setDeleteItem,
    setDetailsItem,
    loadingItems,
    progressMap,
  }), [selectionMode, selectedIds, toggleSelect, handleItemClick, openRename, setDeleteItem, setDetailsItem, loadingItems, progressMap]);

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <AppLayout fileInputRef={fileInputRef} handleFileSelect={handleFileSelect}>
      <div
        style={{
          minWidth: 0,
          padding: "20px 24px",
          paddingBottom: isMobile
            ? "calc(88px + env(safe-area-inset-bottom, 0px))"
            : "20px",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", minWidth: 0 }}>

          <ToastStack toasts={toasts} onRemove={removeToast} />

          {/* Upload zone — desktop only */}
          {!isMobile && (
            <UploadZone
              isMobile={isMobile}
              isDragOver={isDragOver}
              onDragEnter={onDragEnter}
              onDragLeave={onDragLeave}
              onDragOver={onDragOver}
              onDrop={onDrop}
              onUploadClick={() => fileInputRef.current?.click()}
              onCreateDir={() => setShowCreateDir(true)}
            />
          )}

          {/* Mobile bottom action bar */}
          {isMobile && (
            <MobileActionBar
              onUploadClick={() => fileInputRef.current?.click()}
              onCreateDir={() => setShowCreateDir(true)}
            />
          )}

          <DirectoryToolbar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortBy={sortBy}
            sortDir={sortDir}
            onSort={handleSort}
            viewMode={viewMode}
            setViewMode={setViewMode}
            selectionMode={selectionMode}
            setSelectionMode={setSelectionMode}
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
            directoriesList={directoriesList}
            filesList={filesList}
            realItems={realItems}
            bulkLoading={bulkLoading}
            onBulkConfirm={() => setBulkConfirm(true)}
          />

          <Breadcrumbs breadcrumbs={breadcrumbs} />

          {/* File list area */}
          <div style={{ position: "relative", minHeight: loading ? undefined : 60 }}>
            <ListRefreshOverlay visible={listRefreshing} />

            <DirectoryGrid
              loading={loading}
              viewMode={viewMode}
              sorted={sorted}
              totalItems={totalItems}
              searchQuery={searchQuery}
              q={q}
              itemProps={itemProps}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateFolderModal
        showCreateDir={showCreateDir}
        setShowCreateDir={setShowCreateDir}
        newDirname={newDirname}
        setNewDirname={setNewDirname}
        handleCreateDirectory={handleCreateDirectory}
        isLoading={createLoading}
      />
      <RenameModal
        showRename={showRename}
        renameType={renameTarget.type}
        renameValue={renameTarget.value}
        setRenameValue={(val) => setRenameTarget((prev) => ({ ...prev, value: val }))}
        handleRenameSubmit={handleRenameSubmit}
        setShowRename={setShowRename}
        isLoading={renameLoading}
      />
      <DeleteModal
        deleteItem={deleteItem}
        setDeleteItem={setDeleteItem}
        confirmDelete={confirmDelete}
      />
      {detailsItem && (
        <DetailsModal item={detailsItem} onClose={() => setDetailsItem(null)} />
      )}

      <ConfirmDialog
        open={bulkConfirm}
        icon="🗑️"
        title={`Delete ${selectedItems.length} item${selectedItems.length !== 1 ? "s" : ""}?`}
        message="This will permanently delete the selected files and folders. This cannot be undone."
        confirmLabel="Delete"
        confirmDanger
        onConfirm={() => { setBulkConfirm(false); handleBulkDelete(); }}
        onCancel={() => setBulkConfirm(false)}
      />

      <style>{`
        @keyframes skpulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes slideInDown { from { opacity:0; transform:translateY(-10px) } to { opacity:1; transform:translateY(0) } }
        @media (max-width: 500px) { .hide-xs { display: none !important; } }
        @media (max-width: 700px) { .hide-sm { display: none !important; } }
        .btn-spinner {
          display: inline-block;
          width: 12px; height: 12px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }
      `}</style>
    </AppLayout>
  );
}
