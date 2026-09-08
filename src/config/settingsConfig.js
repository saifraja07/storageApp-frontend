// ─── Settings page configuration ──────────────────────────────────────────────

const VALID_TABS = ["profile", "security", "storage"];
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const SETTINGS_TABS = [
  { id: "profile", label: "Profile" },
  { id: "security", label: "Security" },
  { id: "storage", label: "Storage" },
];

export { VALID_TABS, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE, SETTINGS_TABS };
