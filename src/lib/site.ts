// Production origin by default: canonical URLs, sitemap and JSON-LD must never
// point to a preview deployment, even when the variable is missing (CI build).
const DEFAULT_SITE_URL = "https://cv.elwen.dev";

/** Canonical origin of the site, without trailing slash. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL).replace(/\/$/, "");
