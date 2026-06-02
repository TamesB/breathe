/**
 * URL Supabase sends users back to after magic link / OAuth.
 *
 * Prefer VITE_SITE_URL (set on Vercel to your production domain) so redirects
 * never fall back to the Supabase dashboard "Site URL" (often localhost).
 * Otherwise uses the current browser origin (fine for local dev).
 */
export function getAuthRedirectUrl(): string {
  const configured = import.meta.env.VITE_SITE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "";
}
