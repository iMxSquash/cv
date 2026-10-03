/** A fresh unpredictable value per request: it is what makes an injected script unable to run. */
export function createNonce(): string {
  return Buffer.from(crypto.randomUUID()).toString("base64");
}

// This app lives in an iframe inside the portfolio (elwen.dev): never remove
// these ancestors and never add X-Frame-Options (SAMEORIGIN would block
// elwen.dev, which is a different origin).
const EMBED_ANCESTORS = "'self' https://elwen.dev https://www.elwen.dev";

interface CspOptions {
  nonce: string;
  isDev: boolean;
  supabaseUrl: string;
  /** The backoffice is never framed by another origin (clickjacking). */
  isAdmin: boolean;
}

/**
 * Content-Security-Policy sent by the proxy on every page. It is the only CSP
 * of the app, `frame-ancestors` included: a header set by the proxy replaces
 * the one from next.config.ts, it does not add to it.
 */
export function buildCsp({ nonce, isDev, supabaseUrl, isAdmin }: CspOptions): string {
  const supabaseOrigin = new URL(supabaseUrl).origin;
  const directives = [
    "default-src 'self'",
    // wasm-unsafe-eval: the compressed monogram model is decoded by WebAssembly
    // (it compiles wasm only, JS eval stays blocked). React rebuilds server
    // stack traces with eval in development only.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'wasm-unsafe-eval'${isDev ? " 'unsafe-eval'" : ""}`,
    // Next injects <style> tags; development HMR does so without a nonce.
    `style-src 'self' ${isDev ? "'unsafe-inline'" : `'nonce-${nonce}'`}`,
    // The components set style="" attributes (CSS variables, transforms): an
    // attribute cannot carry a nonce, and it cannot run script.
    "style-src-attr 'unsafe-inline'",
    `img-src 'self' data: blob: ${supabaseOrigin}`,
    `connect-src 'self' ${supabaseOrigin}`,
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    `frame-ancestors ${isAdmin ? "'self'" : EMBED_ANCESTORS}`,
  ];
  if (!isDev) directives.push("upgrade-insecure-requests");
  return directives.join("; ");
}
