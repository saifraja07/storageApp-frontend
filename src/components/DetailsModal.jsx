import Modal from "./Modal";
import {
  getExt,
  getFileEmoji,
  formatSize,
  formatDate,
} from "../utils/directoryUtils";

export default function DetailsModal({ item, breadcrumbs, onClose }) {
  const ext = getExt(item.name);
  const emoji = item.isDirectory ? "📁" : getFileEmoji(ext);
  const folderSize = item.size ?? item.totalSize ?? item.totalSizeInBytes;

  const pathParts = [
    "My Drive",
    ...(breadcrumbs || []).map((c) => c.name),
    item.name,
  ];

  const rows = item.isDirectory
    ? [
        ["Type", "Folder"],
        ["Name", item.name],
        ...(folderSize ? [["Size", formatSize(folderSize)]] : []),
        ["Created", formatDate(item.createdAt)],
        ["Modified", formatDate(item.updatedAt)],
      ]
    : [
        ["Type", ext.toUpperCase() + " File"],
        ["Name", item.name],
        ["Size", formatSize(item.size)],
        ["Created", formatDate(item.createdAt)],
        ["Modified", formatDate(item.updatedAt)],
      ];

  return (
    <Modal title="Details" onClose={onClose}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "12px 0 20px",
          borderBottom: "1px solid var(--border)",
          marginBottom: 16,
        }}
      >
        <span style={{ fontSize: 40 }}>{emoji}</span>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: 15,
              color: "var(--text)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {item.name}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>
            {item.isDirectory
              ? "Folder"
              : ext.toUpperCase() + " · " + formatSize(item.size)}
          </div>
        </div>
      </div>

      {rows.map(([label, value]) => (
        <div
          key={label}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "9px 0",
            borderBottom: "1px solid var(--surface-tint)",
          }}
        >
          <span style={{ fontSize: 13, color: "var(--muted)" }}>{label}</span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "var(--text)",
              maxWidth: 220,
              textAlign: "right",
              wordBreak: "break-all",
            }}
          >
            {String(value)}
          </span>
        </div>
      ))}

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          padding: "9px 0",
          borderBottom: "1px solid var(--surface-tint)",
        }}
      >
        <span
          style={{
            fontSize: 13,
            color: "var(--muted)",
            flexShrink: 0,
          }}
        >
          Path
        </span>

        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--text)",
            textAlign: "right",
            flex: 1,
            minWidth: 0,
            overflowWrap: "anywhere",
            lineHeight: 1.5,
          }}
        >
          {pathParts.join("/")}
        </span>
      </div>

      <button
        onClick={onClose}
        style={{
          width: "100%",
          marginTop: 20,
          padding: "10px",
          background: "var(--surface-hover)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          color: "var(--text)",
          fontSize: 14,
          cursor: "pointer",
          fontFamily: "Inter,sans-serif",
        }}
      >
        Close
      </button>
    </Modal>
  );
}
