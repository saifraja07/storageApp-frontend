// Cloudflare R2 bills in decimal units (1 GB = 1,000,000,000 bytes), so these
// helpers deliberately differ from formatStorage() in directoryUtils.js, which
// uses binary (1024-based) units. Using it here would show the 10 GB
// allowance as "9.31 GB".
export function formatDecimalBytes(bytes) {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n <= 0) return "0 KB";
  if (n >= 1e12) return `${trim(n / 1e12)} TB`;
  if (n >= 1e9) return `${trim(n / 1e9)} GB`;
  if (n >= 1e6) return `${trim(n / 1e6)} MB`;
  return `${trim(n / 1e3)} KB`;
}

function trim(value) {
  return Number(value.toFixed(2)).toString();
}

export function formatCount(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n.toLocaleString("en-US") : "—";
}

export function storagePercent(storage) {
  const pct = Number(storage?.percentage);
  if (Number.isFinite(pct)) return Math.max(0, Math.min(pct, 100));
  const used = Number(storage?.usedBytes);
  const allowance = Number(storage?.allowanceBytes);
  if (!Number.isFinite(used) || !(allowance > 0)) return 0;
  return Math.max(0, Math.min((used / allowance) * 100, 100));
}

export function barColor(pct) {
  if (pct >= 90) return "#EF4444";
  if (pct >= 70) return "#F59E0B";
  return "#3B82F6";
}

// Latest valid lastSyncedAt across the accounts, or null.
export function latestSync(accounts) {
  let latest = null;
  for (const account of Object.values(accounts || {})) {
    const t = account?.lastSyncedAt ? new Date(account.lastSyncedAt).getTime() : NaN;
    if (Number.isFinite(t) && (latest === null || t > latest)) latest = t;
  }
  return latest === null ? null : new Date(latest).toISOString();
}
