import Modal from "./Modal";
import { formatStorage, getExt } from "../utils/directoryUtils";

export default function SelectionPropertiesModal({
  items,
  breadcrumbs,
  onClose,
}) {
  const files = items.filter((item) => !item.isDirectory);
  const folders = items.filter((item) => item.isDirectory);
  const totalSize = items.reduce((total, item) => {
    const size = Number(item.size ?? item.totalSize ?? item.totalSizeInBytes);
    return total + (Number.isFinite(size) && size > 0 ? size : 0);
  }, 0);

  const typeCounts = files.reduce((counts, file) => {
    const ext = getExt(file.name);
    const type = ext ? ext.toUpperCase() : "Other";
    counts.set(type, (counts.get(type) || 0) + 1);
    return counts;
  }, new Map());
  const types = [...typeCounts]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([type, count]) => `${type} (${count})`)
    .join(", ");
  const location = ["My Drive", ...(breadcrumbs || []).map((crumb) => crumb.name)]
    .filter(Boolean)
    .join(" / ");

  const rows = [
    ["Files", String(files.length)],
    ["Folders", String(folders.length)],
    ["Types", types || "—"],
    ["Location", location],
    ["Total size", formatStorage(totalSize)],
  ];

  return (
    <Modal title="Properties" onClose={onClose}>
      <div style={{ marginTop: -4 }}>
        <div
          style={{
            fontSize: 22,
            lineHeight: 1.3,
            fontWeight: 700,
            color: "var(--text)",
          }}
        >
          {items.length} item{items.length === 1 ? "" : "s"}
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>
          Selected in this location
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        {rows.map(([label, value]) => (
          <div
            key={label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 20,
              padding: "10px 0",
              borderTop: "1px solid var(--surface-tint)",
            }}
          >
            <span
              style={{
                flexShrink: 0,
                fontSize: 13,
                color: "var(--muted)",
              }}
            >
              {label}
            </span>
            <span
              style={{
                minWidth: 0,
                maxWidth: "68%",
                fontSize: 13,
                fontWeight: 500,
                color: "var(--text)",
                textAlign: "right",
                overflowWrap: "anywhere",
              }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onClose}
        style={{
          width: "100%",
          marginTop: 16,
          padding: "9px 12px",
          background: "var(--surface-hover)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          color: "var(--text)",
          fontSize: 13,
          cursor: "pointer",
          fontFamily: "Inter,sans-serif",
        }}
      >
        Close
      </button>
    </Modal>
  );
}
