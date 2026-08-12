// ── formatters ────────────────────────────────────────────────────────────────
export function formatStorage(bytes) {
  if (!bytes || bytes <= 0) return "0 KB";
  if (bytes >= 1024 ** 4) return (bytes / 1024 ** 4).toFixed(2) + " TB";
  if (bytes >= 1024 ** 3) return (bytes / 1024 ** 3).toFixed(2) + " GB";
  if (bytes >= 1024 ** 2) return (bytes / 1024 ** 2).toFixed(1) + " MB";
  return (bytes / 1024).toFixed(0) + " KB";
}

export function formatSize(bytes) {
  if (!bytes) return "—";
  if (bytes >= 1024 ** 3) return (bytes / 1024 ** 3).toFixed(2) + " GB";
  if (bytes >= 1024 ** 2) return (bytes / 1024 ** 2).toFixed(1) + " MB";
  return (bytes / 1024).toFixed(0) + " KB";
}

export function formatSpeed(bytesPerSec) {
  if (!bytesPerSec || bytesPerSec <= 0) return "";
  if (bytesPerSec >= 1024 ** 3) return (bytesPerSec / 1024 ** 3).toFixed(1) + " GB/s";
  if (bytesPerSec >= 1024 ** 2) return (bytesPerSec / 1024 ** 2).toFixed(1) + " MB/s";
  if (bytesPerSec >= 1024) return (bytesPerSec / 1024).toFixed(0) + " KB/s";
  return Math.round(bytesPerSec) + " B/s";
}

export function getFolderMeta(item) {
  const count = item.fileCount ?? item.itemCount ?? item.itemsCount ?? 0;
  const size = item.size ?? item.totalSize ?? item.totalSizeInBytes;
  return size ? `${formatSize(size)}` : "0 kb";
}

export function formatDate(d) {
  if (!d) return "—";

  return new Date(d).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// Defined at module level — created once, not on every call
const FILE_EMOJI_MAP = {
    pdf: "📄",
    png: "🖼️", jpg: "🖼️", jpeg: "🖼️", gif: "🖼️", webp: "🖼️",
    mp4: "🎬", mov: "🎬", avi: "🎬",
    zip: "📦", rar: "📦", "7z": "📦",
    js: "⚡", jsx: "⚛️", ts: "⚡", tsx: "⚛️",
    html: "🌐", css: "🎨",
    py: "🐍", java: "☕",
    doc: "📝", docx: "📝", txt: "📝",
    mp3: "🎵", wav: "🎵",
    xls: "📊", xlsx: "📊", csv: "📊",
    ppt: "📽️", pptx: "📽️",
};

export function getFileEmoji(ext) {
  return FILE_EMOJI_MAP[ext] || "📄";
}

export function getExt(name) {
  if (!name || !name.includes(".")) return "";
  return name.split(".").pop().toLowerCase();
}

export function getErr(err) {
  return (
    err?.response?.data?.error ||
    err?.response?.data?.message ||
    err?.message ||
    "Something went wrong"
  );
}

// ── shared input style ────────────────────────────────────────────────────────
export function inputStyle() {
  return {
    width: "100%",
    padding: "10px 14px",
    background: "var(--surface-tint)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    color: "var(--text)",
    fontSize: 14,
    outline: "none",
    fontFamily: "Inter,sans-serif",
    marginBottom: 16,
  };
}
