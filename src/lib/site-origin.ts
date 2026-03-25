/**
 * Canonical site origin for absolute URLs (short links, emails).
 * Set NEXT_PUBLIC_APP_URL in production (e.g. https://linkhexa.com).
 */
export function getSiteOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit?.trim()) {
    return explicit.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "http://localhost:3000";
}
