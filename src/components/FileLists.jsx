import { memo, useCallback, useSyncExternalStore } from "react";
import { Folder, Check, Upload } from "lucide-react";
import { BASE_URL } from "../api/axiosInstances";
import {
  formatDate,
  formatSize,
  getExt,
  getFileEmoji,
  getFolderMeta,
} from "../utils/directoryUtils";
import { subscribeItem, getItemProgress } from "../utils/uploadManager";
import ThreeDotMenu from "./ThreeDotMenu";

// ── Live progress for a single temp (uploading) item ───────────────────────
function useItemProgress(id, active) {
  const subscribeFn = useCallback(
    (cb) => (active ? subscribeItem(id, cb) : () => {}),
    [id, active],
  );
  const getSnap = useCallback(
    () => (active ? getItemProgress(id) : 0),
    [id, active],
  );
  return useSyncExternalStore(subscribeFn, getSnap);
}

// ── Inline spinner component ──────────────────────────────────────────────
function ItemSpinner() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.45)",
        borderRadius: "inherit",
        zIndex: 10,
        backdropFilter: "blur(2px)",
      }}
    >
      <div
        style={{
          width: 22,
          height: 22,
          border: "2.5px solid rgba(255,255,255,0.25)",
          borderTopColor: "#fff",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
        }}
      />
    </div>
  );
}

// ── File Row (list) ───────────────────────────────────────────────────────
export const FileRow = memo(function FileRow({
  item,
  selectedIds,
  setDetailsItem,
  setDeleteItem,
  openRename,
  handleItemClick,
  toggleSelect,
  selectionMode,
  loadingItems,
}) {
  const ext = getExt(item.name);
  const emoji = item.isDirectory ? "📁" : getFileEmoji(ext);
  const selected = selectedIds?.has(String(item._id || item.id)) ?? false;
  const isLoading = loadingItems?.has(String(item._id || item.id));
  const isUploading =
    typeof item.id === "string" && item.id.startsWith("temp-");
  const uploadPct = useItemProgress(item.id, isUploading);
  const disabled = isLoading || isUploading;

  return (
    <div
      onClick={() => !disabled && handleItemClick(item)}
      onContextMenu={(e) => {
        if (isUploading) e.preventDefault();
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        borderBottom: "1px solid var(--border)",
        cursor: isUploading ? "progress" : isLoading ? "default" : "pointer",
        background: selected ? "rgba(59,130,246,0.08)" : "transparent",
        transition: "background 0.1s",
        position: "relative",
        opacity: isLoading ? 0.7 : isUploading ? 0.6 : 1,
      }}
      onMouseOver={(e) =>
        !selected &&
        !isLoading &&
        !isUploading &&
        (e.currentTarget.style.background = "var(--surface-hover)")
      }
      onMouseOut={(e) =>
        !selected &&
        (e.currentTarget.style.background = selected
          ? "rgba(59,130,246,0.08)"
          : "transparent")
      }
    >
      {/* Inline spinner overlay for this row */}
      {isLoading && <ItemSpinner />}

      {/* Upload progress bar at bottom of row */}
      {isUploading && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            background: "rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${uploadPct}%`,
              background: uploadPct >= 100 ? "#10B981" : "var(--primary)",
              transition: "width 0.2s ease",
              boxShadow:
                uploadPct >= 100 ? "none" : "0 0 6px rgba(59,130,246,0.5)",
            }}
          />
        </div>
      )}

      {selectionMode && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) toggleSelect(item);
          }}
          style={{
            width: 16,
            height: 16,
            borderRadius: 3,
            flexShrink: 0,
            border: `2px solid ${selected ? "var(--primary)" : "rgba(255,255,255,0.3)"}`,
            background: selected ? "var(--primary)" : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 9,
            color: "#fff",
          }}
        >
          {selected && <Check size={11} aria-hidden="true" />}
        </div>
      )}
      <span style={{ fontSize: 17, flexShrink: 0 }}>{emoji}</span>
      <span
        style={{
          flex: 1,
          fontSize: 13,
          fontWeight: 500,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          color: isUploading ? "var(--muted)" : "var(--text)",
        }}
      >
        {item.name}
        {isUploading && (
          <span
            style={{
              marginLeft: 8,
              fontSize: 11,
              color: uploadPct >= 100 ? "#10B981" : "var(--primary)",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            {uploadPct >= 100 ? (
              <>
                <Check size={11} aria-hidden="true" /> Done
              </>
            ) : (
              `${Math.round(uploadPct)}%`
            )}
          </span>
        )}
      </span>
      <span
        style={{
          fontSize: 11,
          color: "var(--muted)",
          flexShrink: 0,
          minWidth: 55,
          textAlign: "right",
        }}
        className="hide-xs"
      >
        {item.isDirectory ? getFolderMeta(item) : formatSize(item.size)}
      </span>
      <span
        style={{
          fontSize: 11,
          color: "var(--muted)",
          flexShrink: 0,
          minWidth: 90,
          textAlign: "right",
        }}
        className="hide-sm"
      >
        {formatDate(item.updatedAt || item.createdAt)}
      </span>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ flexShrink: 0, visibility: disabled ? "hidden" : "visible" }}
      >
        {!isUploading && (
          <ThreeDotMenu
            item={item}
            onRename={() => openRename(item)}
            onDelete={() => setDeleteItem(item)}
            onDetails={() => setDetailsItem(item)}
            onDownload={() => {
              const a = document.createElement("a");
              a.href = `${BASE_URL}/file/${item._id || item.id}?action=download`;
              a.download = item.name || "";
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }}
          />
        )}
      </div>
    </div>
  );
});

// ── File Card (grid) ──────────────────────────────────────────────────────
export const FileCard = memo(function FileCard({
  item,
  selectedIds,
  setDetailsItem,
  setDeleteItem,
  openRename,
  handleItemClick,
  toggleSelect,
  selectionMode,
  loadingItems,
}) {
  const ext = getExt(item.name);
  const emoji = item.isDirectory ? "📁" : getFileEmoji(ext);
  const selected = selectedIds?.has(String(item._id || item.id)) ?? false;
  const isLoading = loadingItems?.has(String(item._id || item.id));
  const isUploading =
    typeof item.id === "string" && item.id.startsWith("temp-");
  const uploadPct = useItemProgress(item.id, isUploading);
  const disabled = isLoading || isUploading;

  return (
    <div
      onClick={() => !disabled && handleItemClick(item)}
      onContextMenu={(e) => {
        if (isUploading) e.preventDefault();
      }}
      style={{
        background: selected ? "rgba(59,130,246,0.12)" : "var(--surface)",
        border: `1px solid ${selected ? "rgba(59,130,246,0.45)" : isUploading ? "rgba(59,130,246,0.3)" : "var(--border)"}`,
        borderRadius: 10,
        padding: isUploading ? "30px 12px 12px" : "14px 12px 12px",
        cursor: isUploading ? "progress" : isLoading ? "default" : "pointer",
        transition: "all 0.15s",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        opacity: isLoading ? 0.75 : isUploading ? 0.6 : 1,
      }}
      onMouseOver={(e) =>
        !selected &&
        !isLoading &&
        !isUploading &&
        ((e.currentTarget.style.background = "var(--surface-hover)"),
        (e.currentTarget.style.borderColor = "rgba(255,255,255,0.13)"))
      }
      onMouseOut={(e) =>
        !selected &&
        ((e.currentTarget.style.background = "var(--surface)"),
        (e.currentTarget.style.borderColor = isUploading
          ? "rgba(59,130,246,0.3)"
          : "var(--border)"))
      }
    >
      {/* Inline spinner overlay for this card */}
      {isLoading && <ItemSpinner />}

      {/* Upload progress bar at bottom of card */}
      {isUploading && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            background: "rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${uploadPct}%`,
              background: uploadPct >= 100 ? "#10B981" : "var(--primary)",
              transition: "width 0.2s ease",
              boxShadow:
                uploadPct >= 100 ? "none" : "0 0 8px rgba(59,130,246,0.5)",
            }}
          />
        </div>
      )}

      {selectionMode && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) toggleSelect(item);
          }}
          style={{
            position: "absolute",
            top: 9,
            left: 9,
            width: 18,
            height: 18,
            borderRadius: 4,
            border: `2px solid ${selected ? "var(--primary)" : "rgba(255,255,255,0.3)"}`,
            background: selected ? "var(--primary)" : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            color: "#fff",
            zIndex: 2,
          }}
        >
          {selected && <Check size={13} aria-hidden="true" />}
        </div>
      )}
      <div
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 20,
          visibility: disabled ? "hidden" : "visible",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {!isUploading && (
          <ThreeDotMenu
            item={item}
            onRename={() => openRename(item)}
            onDelete={() => setDeleteItem(item)}
            onDetails={() => setDetailsItem(item)}
            onDownload={() => {
              const a = document.createElement("a");
              a.href = `${BASE_URL}/file/${item._id || item.id}?action=download`;
              a.download = item.name || "";
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }}
          />
        )}
      </div>
      <div
        style={{
          fontSize: 30,
          marginBottom: 10,
          paddingRight: 20,
          opacity: isUploading ? 0.5 : 1,
          display: "flex",
        }}
      >
        {isUploading ? <Upload size={22} aria-hidden="true" /> : emoji}
      </div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: isUploading ? "var(--muted)" : "var(--text)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          marginBottom: 3,
        }}
      >
        {item.name}
      </div>
      <div
        style={{
          fontSize: 11,
          color: uploadPct >= 100 ? "#10B981" : "var(--primary)",
          fontWeight: isUploading ? 600 : 400,
        }}
      >
        {isUploading ? (
          uploadPct >= 100 ? (
            "Uploaded"
          ) : (
            `Uploading ${Math.round(uploadPct)}%`
          )
        ) : (
          <span style={{ color: "var(--muted)" }}>
            {item.isDirectory ? getFolderMeta(item) : formatSize(item.size)}
          </span>
        )}
      </div>
    </div>
  );
});
