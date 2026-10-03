import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { OG_PALETTE } from "./og-palette";

const stylesheet = readFileSync(join(__dirname, "../app/globals.css"), "utf8");

describe("OG_PALETTE", () => {
  it.each(Object.entries(OG_PALETTE))("mirrors %s from globals.css", (token, value) => {
    expect(stylesheet).toMatch(new RegExp(`${token}:\\s*${value};`, "i"));
  });
});
