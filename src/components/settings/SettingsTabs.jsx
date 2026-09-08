import { SETTINGS_TABS } from "../../config/settingsConfig";

export default function SettingsTabs({ activeTab, onTabClick }) {
  return (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 4,
            marginBottom: 28,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: 4,
            width: "fit-content",
          }}
        >
          {SETTINGS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabClick(tab.id)}
              style={{
                padding: "7px 18px",
                borderRadius: 7,
                border: "none",
                fontSize: 13,
                fontWeight: 600,
                background:
                  activeTab === tab.id
                    ? "var(--primary)"
                    : "transparent",
                color:
                  activeTab === tab.id
                    ? "#fff"
                    : "var(--muted)",
                cursor: "pointer",
                fontFamily: "Inter,sans-serif",
                transition: "all 0.15s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
  );
}
