export const DISPLAY_COUNTRIES = ["CN", "US", "JP", "SG", "GB", "DE", "FR", "OTHER"];

export function normalizeCountry(country) {
  const code = typeof country === "string" ? country.trim().toUpperCase() : "";
  return DISPLAY_COUNTRIES.includes(code) ? code : "OTHER";
}

export function isAllowedOrigin(origin, configuredOrigin = "") {
  if (!origin) return false;

  const configured = configuredOrigin
    .split(",")
    .map((value) => value.trim().replace(/\/$/, ""))
    .filter(Boolean);

  if (configured.includes(origin)) return true;
  return /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}

export function emptyCounts() {
  return Object.fromEntries(DISPLAY_COUNTRIES.map((country) => [country, 0]));
}
