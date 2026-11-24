import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate, useBlocker } from "react-router-dom";
import { Trash2 } from "lucide-react";
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
import {
  DEFAULT_PAGE_SIZE,
  SEARCH_DEBOUNCE_MS,
  scrollListIntoView,
} from "./utils/pagination";
import { bulkDeleteItems } from "./api/userApi";
import { BASE_URL } from "./api/axiosInstances";
import { getErr, formatStorage } from "./utils/directoryUtils";
import { useDebouncedValue } from "./hooks/useDebouncedValue";
import { usePage } from "./hooks/usePage";
import { useIsMobile } from "./hooks/useIsMobile";
import toast from "react-hot-toast";
import AppLayout from "./components/AppLayout";
import Breadcrumbs from "./components/BreadCrumb";
import CreateFolderModal from "./components/CreateFolderModal";
import ConfirmDialog from "./components/ConfirmDialog";
import RenameModal from "./components/RenameModal";
import DeleteModal from "./components/DeleteModal";
import DetailsModal from "./components/DetailsModal";
import UploadZone from "./components/UploadZone";
import SelectionPropertiesModal from "./components/SelectionPropertiesModal";
import UploadProgressBar from "./components/UploadProgressBar";
import DirectoryToolbar from "./components/directory/DirectoryToolbar";
import MobileActionBar from "./components/directory/MobileActionBar";
import DirectoryGrid from "./components/directory/DirectoryGrid";
import Pagination from "./components/Pagination";
import * as uploadManager from "./utils/uploadManager";

// ── Module-level cache — survives navigation (unmount/remount) ────────────
// One entry per directory *page*: the key carries everything that changes what
// the server returns (directory, page, page size, search, sort).
const dirCache = new Map();
const MAX_CACHE_ENTRIES = 100;

function pageCacheKey({ userId, dirId, page, limit, search, sortBy, sortDir }) {
  return `${userId}:${dirId || "root"}|p${page}|l${limit}|s${search}|b${sortBy || ""}|d${sortBy ? sortDir : ""}`;
}

function cacheSet(key, entry) {
  // Oldest entry goes first (Map keeps insertion order) so the cache can't grow forever.
  if (dirCache.size >= MAX_CACHE_ENTRIES) dirCache.delete(dirCache.keys().next().value);
  dirCache.set(key, entry);
}

// ── Invalidate every cached page (any page/sort/search) of one directory ──
function invalidateDir(userId, dirId) {
  const prefix = `${userId}:${dirId || "root"}|`;
  for (const key of dirCache.keys()) {
    if (key.startsWith(prefix)) dirCache.delete(key);
  }
}

// ── Invalidate a directory's cache plus every ancestor up to root ────────
function invalidateDirAndAncestors(userId, targetDirId, breadcrumbs) {
  if (!userId) return;
  invalidateDir(userId, "root");
  invalidateDir(userId, targetDirId);
  (breadcrumbs || []).forEach((crumb) => {
    const id = crumb?._id || crumb?.id;
    if (id) invalidateDir(userId, id);
  });
}

// ── Upload pool — pure function, no component state needed ────────────────
function createPool(limit) {
  let active = 0;
  const queue = [];
  const next = () => {
    if (active >= limit || !queue.length) return;
    active++;
    queue
      .shift()()
      .finally(() => {
        active--;
        next();
      });
    next();
  };
  return (task) =>
    new Promise((res, rej) => {
      queue.push(() => task().then(res).catch(rej));
      next();
    });
}

// ── R2 XHR upload — reports byte-level progress to the upload manager ─────
function uploadFileToR2({ item, fileId, uploadUrl }) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", item.contentType);
    uploadManager.registerXhr(item.id, xhr, fileId);
    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable)
        uploadManager.updateItemProgress(item.id, evt.loaded);
    };
    xhr.onload = async () => {
      if (xhr.status === 200) {
        try {
          await uploadComplete({ fileId });
          resolve();
        } catch (e) {
          reject(e);
        }
      } else {
        try {
          await uploadCancel({ fileId });
        } catch {
          // best-effort cleanup; the original error is reported below
        }
        reject(new Error("Upload failed"));
      }
    };
    xhr.onerror = async () => {
      try {
        await uploadCancel({ fileId });
      } catch {
        // best-effort cleanup; the original error is reported below
      }
      reject(new Error("Network error"));
    };
    xhr.onabort = () => reject(new Error("Upload cancelled"));
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

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [listRefreshing, setListRefreshing] = useState(false);
  // Next page / new sort / new search in the same directory: keep the current
  // items (dimmed) instead of flashing the skeleton.
  const [fetching, setFetching] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sortBy, setSortBy] = useState(null);
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
  const [renameTarget, setRenameTarget] = useState({
    type: null,
    id: null,
    value: "",
  });

  const [deleteItem, setDeleteItem] = useState(null);
  const [detailsItem, setDetailsItem] = useState(null);
  const [showSelectionProperties, setShowSelectionProperties] = useState(false);

  const [selectedItems, setSelectedItems] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [bulkConfirm, setBulkConfirm] = useState(false);

  const fileInputRef = useRef(null);
  const dragCounter = useRef(0);
  const processUploadRef = useRef(null);
  const listTopRef = useRef(null);

  // ── pagination state ───────────────────────────────────────────────────────
  // The server does the searching, sorting and paging. Search waits for a pause
  // in typing; opening another directory, searching, sorting or changing the
  // page size all start again from page 1.
  const search = useDebouncedValue(searchQuery.trim(), SEARCH_DEBOUNCE_MS);
  const [page, setPage] = usePage(
    `${dirId || "root"}|${search}|${pageSize}|${sortBy || ""}|${sortBy ? sortDir : ""}`,
  );
  const query = {
    userId: user?.id,
    dirId,
    page,
    limit: pageSize,
    search,
    sortBy,
    sortDir,
  };
  const cacheKey = pageCacheKey(query);
  // Always the view that is on screen right now (see loadDirectory).
  const queryRef = useRef(query);
  queryRef.current = query;

  // ── stale-closure guard ────────────────────────────────────────────────────
  const dirIdRef = useRef(dirId);
  useEffect(() => {
    dirIdRef.current = dirId;
  }, [dirId]);

  // ── load directory ─────────────────────────────────────────────────────────
  const requestIdRef = useRef(0); // only the newest request may update the screen
  const loadedDirRef = useRef(null); // directory whose items are on screen
  const breadcrumbsRef = useRef([]);
  breadcrumbsRef.current = breadcrumbs;

  const loadDirectory = useCallback(
    async (opts = {}) => {
      // Read the live view rather than a closure: this is also called when a
      // long upload finishes, by which time the user may be on another page.
      const q = queryRef.current;
      const dirKey = q.dirId || "root";
      const key = pageCacheKey(q);
      const requestId = ++requestIdRef.current;
      const isLatest = () => requestId === requestIdRef.current;

      const show = (entry) => {
        setDirectoriesList(entry.directories);
        setFilesList(entry.files);
        setPagination(entry.pagination);
        setBreadcrumbs(entry.breadcrumbs);
        loadedDirRef.current = dirKey;
      };

      const cached = !opts.force && dirCache.get(key);
      if (cached) {
        show(cached);
        setLoading(false);
        setFetching(false);
        setListRefreshing(false); // a refresh this page request superseded must not leave the spinner on
        return;
      }
      if (opts.silent) setListRefreshing(true);
      else if (loadedDirRef.current === dirKey) setFetching(true);
      else setLoading(true);

      try {
        // Breadcrumbs belong to the directory, not the page: fetch them when
        // entering a directory (or on an explicit refresh), not per page.
        const needPath = Boolean(q.dirId) && (opts.force || loadedDirRef.current !== dirKey);
        const [data, pathData] = await Promise.all([
          getDirectoryItems(q.dirId, q),
          needPath ? getDirectoryPath(q.dirId) : Promise.resolve(null),
        ]);
        if (!isLatest()) return;

        const bc = !q.dirId
          ? []
          : pathData
            ? [...pathData.path, pathData.current]
            : breadcrumbsRef.current;
        const entry = {
          directories: data.directories,
          files: data.files,
          pagination: data.pagination,
          breadcrumbs: bc,
        };
        // The server moves an out-of-range page (e.g. after deleting the last
        // item on the last page) to the last valid one: cache and show it as that.
        const actualPage = entry.pagination.currentPage;
        cacheSet(pageCacheKey({ ...q, page: actualPage }), entry);
        show(entry);
        if (actualPage !== q.page) setPage(actualPage);
      } catch (err) {
        if (isLatest()) toast.error(getErr(err));
      } finally {
        if (isLatest()) {
          setLoading(false);
          setFetching(false);
          setListRefreshing(false);
        }
      }
    },
    [setPage],
  );

  const previousUserId = useRef();

  const hasUser = Boolean(user);
  const userId = user?.id;

  useEffect(() => {
    if (!hasUser) {
      dirCache.clear();
      previousUserId.current = undefined;
      return;
    }

    if (previousUserId.current !== userId) {
      dirCache.clear();
      previousUserId.current = userId;
    }
    loadDirectory();
    setSelectedItems([]);
    setSelectionMode(false);
  }, [cacheKey, hasUser, userId, loadDirectory]);

  useEffect(() => {
    localStorage.setItem("viewMode", viewMode);
  }, [viewMode]);

  // ── react to a global "Cancel All" from the upload progress card ──────────
  useEffect(() => {
    return uploadManager.subscribeCancel((cancelledIds) => {
      setFilesList((prev) => prev.filter((f) => !cancelledIds.includes(f.id)));
    });
  }, []);

  // ── drag & drop (desktop only) ─────────────────────────────────────────────
  const onDragEnter = useCallback(
    (e) => {
      if (isMobile) return;
      e.preventDefault();
      dragCounter.current++;
      if (e.dataTransfer.types.includes("Files")) setIsDragOver(true);
    },
    [isMobile],
  );
  const onDragLeave = useCallback(
    (e) => {
      if (isMobile) return;
      e.preventDefault();
      if (--dragCounter.current === 0) setIsDragOver(false);
    },
    [isMobile],
  );
  const onDragOver = useCallback(
    (e) => {
      if (isMobile) return;
      e.preventDefault();
    },
    [isMobile],
  );
  const onDrop = useCallback(
    async (e) => {
      if (isMobile) return;
      e.preventDefault();
      dragCounter.current = 0;
      setIsDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length) await processUploadRef.current(files);
    },
    [isMobile],
  );

  // ── upload ─────────────────────────────────────────────────────────────────
  async function processUpload(files) {
    const uploadDirId = dirId;
    const uploadBreadcrumbs = breadcrumbs;
    const isStillHere = () => dirIdRef.current === uploadDirId;

    // ── client-side quota pre-check ──────────────────────────────────────
    const totalBytes = files.reduce((sum, f) => sum + (f.size || 0), 0);
    const used = user?.usedStorageInBytes ?? 0;
    const max = user?.maxStorageInBytes;
    if (typeof max === "number" && used + totalBytes > max) {
      const available = Math.max(max - used, 0);
      // Upload feedback lives entirely in the global upload card now —
      // no react-hot-toast for upload-related messages.
      uploadManager.flashError(
        `Not enough storage: needs ${formatStorage(totalBytes)}, only ${formatStorage(available)} available`,
      );
      return;
    }

    try {
      const pool = createPool(5);
      const tempItems = uploadManager.beginBatch(files, uploadDirId);
      if (isStillHere()) {
        setFilesList((prev) => [...tempItems, ...prev]);
      }

      const failedIds = [];
      const results = await Promise.allSettled(
        tempItems.map((item) =>
          pool(async () => {
            if (uploadManager.isCancelled(item.id)) {
              failedIds.push(item.id);
              throw new Error("Upload cancelled");
            }
            try {
              const data = await uploadInitiate({
                name: item.name,
                size: item.size,
                contentType: item.contentType,
                parentDirId: uploadDirId,
              });
              if (uploadManager.isCancelled(item.id)) {
                try {
                  await uploadCancel({ fileId: data.fileId });
                } catch {
                  // best-effort cleanup; the original error is reported below
                }
                throw new Error("Upload cancelled");
              }
              await uploadFileToR2({
                item,
                fileId: data.fileId,
                uploadUrl: data.signedUrl,
              });
              uploadManager.markItemDone(item.id);
            } catch (err) {
              failedIds.push(item.id);
              uploadManager.markItemFailed(item.id);
              throw err;
            }
          }),
        ),
      );

      const succeeded = results.filter((r) => r.status === "fulfilled");

      if (failedIds.length && isStillHere()) {
        setFilesList((prev) => prev.filter((f) => !failedIds.includes(f.id)));
      }

      // Failures and cancellations are both surfaced via the global upload
      // card itself (markItemFailed / flashError) — no toast here.

      if (succeeded.length) {
        // Uploading changes this directory's size and every ancestor's
        // size (up to root), so all of their caches must be invalidated —
        // not just the current one. We reuse the breadcrumbs captured at
        // upload start instead of re-fetching the path.
        invalidateDirAndAncestors(user?.id, uploadDirId, uploadBreadcrumbs);
        if (isStillHere()) {
          await Promise.all([
            loadDirectory({ force: true, silent: true }),
            refreshUser(),
          ]);
        } else {
          await refreshUser();
        }
      }
    } catch (err) {
      uploadManager.flashError(err.message || "Upload failed");
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
    const actionDirId = dirId;
    const actionBreadcrumbs = breadcrumbs;
    setDeleteItem(null);
    addLoadingItem(itemId);
    try {
      if (item.isDirectory) await deleteDirectory(itemId);
      else await deleteFile(itemId);
      // Deleting a file or folder changes the size of this directory and
      // every ancestor up to root — invalidate all of their caches so the
      // next visit reloads fresh sizes, without refetching them now.
      invalidateDirAndAncestors(user?.id, actionDirId, actionBreadcrumbs);
      if (dirIdRef.current === actionDirId) {
        if (item.isDirectory)
          setDirectoriesList((prev) =>
            prev.filter((d) => String(d._id || d.id) !== itemId),
          );
        else
          setFilesList((prev) =>
            prev.filter((f) => String(f._id || f.id) !== itemId),
          );
      }
      // Refill the page from the server (and move back a page if it emptied).
      await Promise.all([
        refreshUser(),
        dirIdRef.current === actionDirId
          ? loadDirectory({ force: true, silent: true })
          : null,
      ]);
      toast.success(`"${item.name}" has been deleted`);
    } catch (err) {
      toast.error(getErr(err));
      if (dirIdRef.current === actionDirId)
        loadDirectory({ force: true, silent: true });
    } finally {
      dropLoadingItem(itemId);
    }
  }

  async function handleCreateDirectory(e) {
    e.preventDefault();
    const actionDirId = dirId;
    setCreateLoading(true);
    try {
      await createDirectory(dirId, newDirname);
      const name = newDirname;
      setNewDirname("New Folder");
      setShowCreateDir(false);
      invalidateDir(user?.id, actionDirId);
      if (dirIdRef.current === actionDirId)
        loadDirectory({ force: true, silent: true });
      toast.success(`"${name}" folder created`);
    } catch (err) {
      toast.error(getErr(err));
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleRenameSubmit(e) {
    e.preventDefault();
    const actionDirId = dirId;
    setRenameLoading(true);
    try {
      if (renameTarget.type === "file")
        await renameFile(renameTarget.id, renameTarget.value);
      else await renameDirectory(renameTarget.id, renameTarget.value);
      setShowRename(false);
      invalidateDir(user?.id, actionDirId);
      if (dirIdRef.current === actionDirId)
        loadDirectory({ force: true, silent: true });
      toast.success(`Renamed to "${renameTarget.value}"`);
    } catch (err) {
      toast.error(getErr(err));
    } finally {
      setRenameLoading(false);
    }
  }

  async function handleBulkDelete() {
    if (!selectedItems.length) return;
    const count = selectedItems.length;
    const actionDirId = dirId;
    const actionBreadcrumbs = breadcrumbs;
    setBulkLoading(true);
    selectedItems.forEach((i) => addLoadingItem(String(i.id || i._id)));
    try {
      await bulkDeleteItems({
        fileIds: selectedItems
          .filter((i) => !i.isDirectory)
          .map((i) => i.id || i._id),
        directoryIds: selectedItems
          .filter((i) => i.isDirectory)
          .map((i) => i.id || i._id),
      });
      setSelectionMode(false);
      setSelectedItems([]);
      // Bulk delete changes sizes the same way single delete does —
      // invalidate this directory's cache and every ancestor's up to root.
      invalidateDirAndAncestors(user?.id, actionDirId, actionBreadcrumbs);
      if (dirIdRef.current === actionDirId) {
        await Promise.all([
          loadDirectory({ force: true, silent: true }),
          refreshUser(),
        ]);
      } else {
        await refreshUser();
      }
      toast.success(`${count} item${count !== 1 ? "s" : ""} deleted`);
    } catch (err) {
      toast.error(getErr(err));
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

  // Latest selection, readable from stable callbacks without re-creating them.
  const selectedItemsRef = useRef(selectedItems);
  useEffect(() => {
    selectedItemsRef.current = selectedItems;
  }, [selectedItems]);

  const toggleSelect = useCallback((item) => {
    const id = String(item._id || item.id);
    const prev = selectedItemsRef.current;
    const exists = prev.some((i) => String(i._id || i.id) === id);
    const next = exists
      ? prev.filter((i) => String(i._id || i.id) !== id)
      : [...prev, item];
    selectedItemsRef.current = next;
    setSelectedItems(next);
    // Deselecting the last selected item leaves selection mode.
    if (exists && next.length === 0) setSelectionMode(false);
  }, []);

  // Right-click (desktop) / long-press (touch): enter selection mode with this
  // item selected. Never toggles — repeating the gesture on a selected item
  // keeps it selected.
  const selectViaGesture = useCallback((item) => {
    const id = String(item._id || item.id);
    setSelectionMode(true);
    setSelectedItems((prev) =>
      prev.some((i) => String(i._id || i.id) === id) ? prev : [...prev, item],
    );
  }, []);

  const exitSelection = useCallback(() => {
    selectedItemsRef.current = [];
    setSelectionMode(false);
    setSelectedItems([]);
  }, []);

  const handleRefresh = useCallback(
    () => loadDirectory({ force: true, silent: true }),
    [loadDirectory],
  );

  // Back/Forward (POP) while selecting: stay on the page, leave selection mode.
  // Normal navigation (links, folders, breadcrumbs = PUSH) and Back with
  // selection OFF are never blocked.
  const blocker = useBlocker(
    useCallback(
      ({ historyAction }) => selectionMode && historyAction === "POP",
      [selectionMode],
    ),
  );
  useEffect(() => {
    if (blocker.state === "blocked") {
      blocker.reset();
      exitSelection();
    }
  }, [blocker, exitSelection]);

  const handleItemClick = useCallback(
    (item) => {
      if (selectionMode) {
        toggleSelect(item);
        return;
      }
      if (item.isDirectory) navigate(`/directory/${item._id || item.id}`);
      else
        window.open(
          `${BASE_URL}/files/${item._id || item.id}`,
          "_blank",
          "noopener,noreferrer",
        );
    },
    [selectionMode, toggleSelect, navigate],
  );

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
    if (field === null) {
      setSortBy(null);
      setSortDir("asc");
      return;
    }

    if (direction) {
      setSortDir(direction);
      return;
    }

    if (sortBy === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  }

  // ── derived data ───────────────────────────────────────────────────────────
  const realItems = useMemo(
    () => [
      ...directoriesList.map((d) => ({ ...d, isDirectory: true })),
      ...filesList.map((f) => ({ ...f, isDirectory: false })),
    ],
    [directoriesList, filesList],
  );

  const selectAllItems = useCallback(() => {
    // Match the existing toolbar's Select All behavior: select real items in
    // the current directory, excluding temporary uploads.
    const selectableItems = realItems.filter(
      (item) => !(typeof item.id === "string" && item.id.startsWith("temp-")),
    );
    if (!selectableItems.length) return;

    selectedItemsRef.current = selectableItems;
    setSelectedItems(selectableItems);
    setSelectionMode(true);
  }, [realItems]);

  // ── directory keyboard shortcuts ──────────────────────────────────────────
  const anyModalOpen =
    bulkConfirm || showCreateDir || showRename || !!deleteItem || !!detailsItem || showSelectionProperties;


  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.defaultPrevented) return;

      const target = e.target;
      const isTextEntry =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) ||
          target.getAttribute("role") === "textbox");

      // Leave shortcuts alone while typing or while an application dialog is active.
      if (isTextEntry || anyModalOpen) return;

      // Alt + Enter opens Properties for the current selection.
      if (e.altKey) {
        if (
          e.key === "Enter" &&
          !e.repeat &&
          selectionMode &&
          selectedItemsRef.current.length > 0
        ) {
          e.preventDefault();
          setShowSelectionProperties(true);
        }
        return;
      }

      // Ctrl/Cmd + A selects all non-temporary items in this directory.
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
        if (!realItems.length) return;
        e.preventDefault();
        selectAllItems();
        return;
      }

      if (e.repeat) return;

      // Escape exits selection mode and clears the current selection.
      if (e.key === "Escape" && selectionMode) {
        exitSelection();
        return;
      }

      // Delete opens the existing bulk-delete confirmation.
      if (
        e.key === "Delete" &&
        selectionMode &&
        selectedItemsRef.current.length
      ) {
        e.preventDefault();
        if (!bulkLoading) setBulkConfirm(true);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [
    anyModalOpen,
    bulkLoading,
    exitSelection,
    realItems,
    selectAllItems,
    selectionMode,
  ]);


  // Everything matching in this directory (all pages), from the server.
  const totalItems = pagination?.totalItems ?? 0;

  const changePage = useCallback(
    (next) => {
      setPage(next);
      scrollListIntoView(listTopRef.current);
    },
    [setPage],
  );

  const itemProps = useMemo(
    () => ({
      selectionMode,
      selectedIds,
      toggleSelect,
      handleItemClick,
      openRename,
      setDeleteItem,
      setDetailsItem,
      loadingItems,
      onGestureSelect: selectViaGesture,
    }),
    [
      selectionMode,
      selectedIds,
      toggleSelect,
      handleItemClick,
      openRename,
      setDeleteItem,
      setDetailsItem,
      loadingItems,
      selectViaGesture,
    ],
  );

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <AppLayout
      fileInputRef={fileInputRef}
      handleFileSelect={handleFileSelect}
      disableSidebarSwipe={selectionMode}
    >
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
          {/* Upload zone — desktop only */}
          {!isMobile && (
            <>
              <UploadProgressBar />
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
            </>
          )}

          {/* Mobile bottom action bar */}
          {isMobile && (
            <>
              <MobileActionBar
                onUploadClick={() => fileInputRef.current?.click()}
                onCreateDir={() => setShowCreateDir(true)}
              />
              <UploadProgressBar />
            </>
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
            onProperties={() => setShowSelectionProperties(true)}
            loading={loading}
            listRefreshing={listRefreshing}
            onRefresh={handleRefresh}
            onCancelSelection={exitSelection}
          />

          <Breadcrumbs breadcrumbs={breadcrumbs} />

          {/* File list area */}
          <div
            ref={listTopRef}
            style={{
              position: "relative",
              minHeight: loading ? undefined : 60,
            }}
          >

            <DirectoryGrid
              loading={loading}
              fetching={fetching}
              viewMode={viewMode}
              items={realItems}
              totalItems={totalItems}
              searchQuery={search}
              itemProps={itemProps}
            />
          </div>

          {!loading && (
            <Pagination
              pagination={pagination}
              onPageChange={changePage}
              onLimitChange={setPageSize}
              itemLabel="items"
            />
          )}
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
        setRenameValue={(val) =>
          setRenameTarget((prev) => ({ ...prev, value: val }))
        }
        handleRenameSubmit={handleRenameSubmit}
        setShowRename={setShowRename}
        isLoading={renameLoading}
      />
      <DeleteModal
        deleteItem={deleteItem}
        setDeleteItem={setDeleteItem}
        confirmDelete={confirmDelete}
      />
      {showSelectionProperties && selectedItems.length > 0 && (
        <SelectionPropertiesModal
          items={selectedItems}
          breadcrumbs={breadcrumbs}
          onClose={() => setShowSelectionProperties(false)}
        />
      )}
      {detailsItem && (
        <DetailsModal
          item={detailsItem}
          breadcrumbs={breadcrumbs}
          onClose={() => setDetailsItem(null)}
        />
      )}

      <ConfirmDialog
        open={bulkConfirm}
        icon={<Trash2 size={32} aria-hidden="true" />}
        title={`Delete ${selectedItems.length} item${selectedItems.length !== 1 ? "s" : ""}?`}
        message="This will permanently delete the selected files and folders. This cannot be undone."
        confirmLabel="Delete"
        confirmDanger
        onConfirm={() => {
          setBulkConfirm(false);
          handleBulkDelete();
        }}
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
