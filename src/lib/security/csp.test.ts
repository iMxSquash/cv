import { describe, expect, it } from "vitest";

import { buildCsp, createNonce } from "./csp";

const SUPABASE_URL = "https://abcdefgh.supabase.co";
const BASE = { nonce: "TEST_NONCE", isDev: false, supabaseUrl: SUPABASE_URL, isAdmin: false };

function directive(csp: string, name: string): string[] {
  const found = csp.split("; ").find((part) => part.startsWith(`${name} `) || part === name);
  return found ? found.split(" ").slice(1) : [];
}

describe("createNonce", () => {
  it("returns a different base64 value on every call", () => {
    const first = createNonce();
    const second = createNonce();

    expect(first).not.toBe(second);
    expect(first).toMatch(/^[A-Za-z0-9+/]+=*$/);
  });
});

describe("buildCsp", () => {
  it("allows scripts only through the nonce, plus WebAssembly, in production", () => {
    const scripts = directive(buildCsp(BASE), "script-src");

    expect(scripts).toEqual([
      "'self'",
      "'nonce-TEST_NONCE'",
      "'strict-dynamic'",
      "'wasm-unsafe-eval'",
    ]);
  });

  it("never allows unsafe-inline or unsafe-eval for scripts in production", () => {
    const csp = buildCsp(BASE);

    expect(directive(csp, "script-src")).not.toContain("'unsafe-inline'");
    expect(directive(csp, "script-src")).not.toContain("'unsafe-eval'");
  });

  it("adds unsafe-eval for scripts in development only", () => {
    const scripts = directive(buildCsp({ ...BASE, isDev: true }), "script-src");

    expect(scripts).toContain("'unsafe-eval'");
  });

  it("limits images and network calls to the site and the Supabase origin", () => {
    const csp = buildCsp(BASE);

    expect(directive(csp, "connect-src")).toEqual(["'self'", SUPABASE_URL]);
    expect(directive(csp, "img-src")).toEqual(["'self'", "data:", "blob:", SUPABASE_URL]);
  });

  it("reduces a Supabase URL with a path to its origin", () => {
    const csp = buildCsp({ ...BASE, supabaseUrl: `${SUPABASE_URL}/rest/v1/` });

    expect(directive(csp, "connect-src")).toEqual(["'self'", SUPABASE_URL]);
  });

  it("keeps style elements on the nonce and allows only style attributes inline", () => {
    const csp = buildCsp(BASE);

    expect(directive(csp, "style-src")).toEqual(["'self'", "'nonce-TEST_NONCE'"]);
    expect(directive(csp, "style-src-attr")).toEqual(["'unsafe-inline'"]);
  });

  it("closes plugins, base tag and form targets", () => {
    const csp = buildCsp(BASE);

    expect(directive(csp, "object-src")).toEqual(["'none'"]);
    expect(directive(csp, "base-uri")).toEqual(["'self'"]);
    expect(directive(csp, "form-action")).toEqual(["'self'"]);
  });

  it("upgrades insecure requests in production but not in development", () => {
    expect(buildCsp(BASE)).toContain("upgrade-insecure-requests");
    expect(buildCsp({ ...BASE, isDev: true })).not.toContain("upgrade-insecure-requests");
  });

  it("lets the portfolio embed public pages in an iframe", () => {
    expect(directive(buildCsp(BASE), "frame-ancestors")).toEqual([
      "'self'",
      "https://elwen.dev",
      "https://www.elwen.dev",
    ]);
  });

  it("forbids any cross-origin frame on the admin", () => {
    const csp = buildCsp({ ...BASE, isAdmin: true });

    expect(directive(csp, "frame-ancestors")).toEqual(["'self'"]);
  });
});
