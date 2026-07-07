import { Link } from "react-router-dom";
import { House } from "lucide-react";

export default function Breadcrumbs({ breadcrumbs }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        marginBottom: 14,
        flexWrap: "wrap",
      }}
    >
      <Link
        to="/directory"
        style={{
          fontSize: 13,
          color: "var(--muted)",
          textDecoration: "none",
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
        onMouseOver={(e) => (e.currentTarget.style.color = "var(--text)")}
        onMouseOut={(e) => (e.currentTarget.style.color = "var(--muted)")}
      >
        <House size={14} className="inline mr-1" aria-hidden="true" />
        My Drive
      </Link>

      {breadcrumbs.map((crumb, i) => (
        <span
          key={crumb._id || i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span
            style={{
              color: "rgba(255,255,255,0.18)",
              fontSize: 13,
            }}
          >
            ›
          </span>

          {i === breadcrumbs.length - 1 ? (
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text)",
              }}
            >
              {crumb.name}
            </span>
          ) : (
            <Link
              to={`/directory/${crumb._id}`}
              style={{
                fontSize: 13,
                color: "var(--muted)",
                textDecoration: "none",
                fontWeight: 500,
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.color = "var(--text)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.color = "var(--muted)")
              }
            >
              {crumb.name}
            </Link>
          )}
        </span>
      ))}
    </div>
  );
}