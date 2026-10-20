// Production origin by default: canonical URLs, sitemap and JSON-LD must never
// point to a preview deployment, even when the variable is missing (CI build).
const DEFAULT_SITE_URL = "https://cv.elwen.dev";

/** Canonical origin of the site, without trailing slash. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL).replace(/\/$/, "");

/**
 * Apex site this one is a subdomain of. Its `Person` entity (`#person`) is the
 * one this resume describes: sharing the `@id` lets engines merge both sites
 * into a single identity instead of two competing ones.
 */
export const PORTFOLIO_URL = "https://elwen.dev";
