import { ArrowDown, ArrowUp, FolderPlus } from "lucide-react";

export default function UploadZone({
  isMobile,
  isDragOver,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onUploadClick,
  onCreateDir,
}) {
  const dragProps = isMobile
    ? {}
    : { onDragEnter, onDragLeave, onDragOver, onDrop };

  return (
    <div
      {...dragProps}
      style={{
        border: `2px dashed ${isDragOver ? "#3B82F6" : "rgba(255,255,255,0.15)"}`,
        borderRadius: 14,
        padding: "28px 20px",
        textAlign: "center",
        background: isDragOver
          ? "rgba(59,130,246,0.08)"
          : "rgba(255,255,255,0.02)",
        transition: "all 0.15s",
        marginBottom: 20,
        cursor: "default",
      }}
    >
      <div
        style={{
          fontSize: 32,
          marginBottom: 10,
          display: "flex",
          justifyContent: "center",
        }}
      >
        {isDragOver ? (
          <ArrowDown size={32} aria-hidden="true" />
        ) : (
          <ArrowUp size={32} aria-hidden="true" />
        )}
      </div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: isDragOver ? "#93C5FD" : "var(--text)",
          marginBottom: 6,
        }}
      >
        {isDragOver
          ? "Drop files to upload"
          : "Upload Files or Create Directory"}
      </div>
      <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 20 }}>
        {isDragOver
          ? "Release to start uploading"
          : isMobile
            ? "Tap a button below to get started"
            : "Drag and drop files here, or use the buttons below"}
      </div>
      <div
        style={{
          display: "flex",
          gap: 10,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={onUploadClick}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "10px 20px",
            background: "#3B82F6",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "Inter,sans-serif",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#2563EB")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#3B82F6")}
        >
          <ArrowUp size={16} aria-hidden="true" /> Upload Files
        </button>
        <button
          onClick={onCreateDir}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "10px 20px",
            background: "#059669",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "Inter,sans-serif",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#047857")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#059669")}
        >
          <FolderPlus size={16} aria-hidden="true" /> Create Directory
        </button>
      </div>
    </div>
  );
}
