import { describe, expect, it } from "vitest";

import { isLocale, localePath, splitLocalePath } from "./config";

describe("localePath", () => {
  it("leaves the default language unprefixed", () => {
    expect(localePath("fr", "/")).toBe("/");
    expect(localePath("fr", "/print")).toBe("/print");
  });

  it("prefixes the other languages without a trailing slash on the home page", () => {
    expect(localePath("en", "/")).toBe("/en");
    expect(localePath("en", "/print")).toBe("/en/print");
  });
});

describe("splitLocalePath", () => {
  it("reads the language prefix and returns the unprefixed path", () => {
    expect(splitLocalePath("/en")).toEqual({ locale: "en", path: "/" });
    expect(splitLocalePath("/en/print")).toEqual({ locale: "en", path: "/print" });
  });

  it("treats unprefixed paths as the default language", () => {
    expect(splitLocalePath("/print")).toEqual({ locale: "fr", path: "/print" });
  });

  it("does not mistake a path that merely starts with the code for a prefix", () => {
    expect(splitLocalePath("/enterprise")).toEqual({ locale: "fr", path: "/enterprise" });
  });
});

describe("isLocale", () => {
  it("accepts supported languages only", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("de")).toBe(false);
    expect(isLocale(null)).toBe(false);
  });
});
