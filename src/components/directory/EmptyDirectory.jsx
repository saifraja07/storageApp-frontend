import { memo } from "react";

const EmptyDirectory = memo(function EmptyDirectory({ searchQuery }) {
  const q = searchQuery.trim();
  return (
    <div
      className="px-5 py-[60px] md:py-7"
      style={{ textAlign: "center", color: "var(--muted)" }}
    >
      <div style={{ fontSize: 48, marginBottom: 14 }}>{q ? "🔍" : "📂"}</div>
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: "var(--text)" }}>
        {q ? "No results found" : "This folder is empty"}
      </div>
      <div style={{ fontSize: 13, marginBottom: 24 }}>
        {q
          ? `Nothing matches "${searchQuery}"`
          : "Upload files or create a folder to see some data."}
      </div>
    </div>
  );
});

export default EmptyDirectory;
