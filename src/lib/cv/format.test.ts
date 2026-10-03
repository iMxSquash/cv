import { describe, expect, it } from "vitest";

import { formatLongDate, formatMonthYear, isOngoing, parseKeywords } from "./format";

describe("parseKeywords", () => {
  it("splits plain text and **keywords** in order", () => {
    expect(parseKeywords("Je code en **Angular** et **NestJS**.")).toEqual([
      { text: "Je code en ", isKeyword: false },
      { text: "Angular", isKeyword: true },
      { text: " et ", isKeyword: false },
      { text: "NestJS", isKeyword: true },
      { text: ".", isKeyword: false },
    ]);
  });

  it("returns a single plain segment when there is no markup", () => {
    expect(parseKeywords("Aucun mot-clé")).toEqual([{ text: "Aucun mot-clé", isKeyword: false }]);
  });

  it("returns no segment for an empty string", () => {
    expect(parseKeywords("")).toEqual([]);
  });

  it("keeps unbalanced markers as plain text", () => {
    expect(parseKeywords("un **mot seul")).toEqual([{ text: "un **mot seul", isKeyword: false }]);
  });

  it("keeps HTML as literal text", () => {
    expect(parseKeywords("**<img src=x onerror=alert(1)>**")).toEqual([
      { text: "<img src=x onerror=alert(1)>", isKeyword: true },
    ]);
  });
});

describe("isOngoing", () => {
  const today = new Date("2026-10-01T12:00:00Z");

  it("is true for an open-ended period that has started", () => {
    expect(isOngoing("2025-09-01", null, today)).toBe(true);
  });

  it("is true while today is before the end date", () => {
    expect(isOngoing("2025-09-01", "2027-09-01", today)).toBe(true);
  });

  it("is false once the end date has passed", () => {
    expect(isOngoing("2025-09-01", "2026-09-01", today)).toBe(false);
  });

  it("is false for a period that has not started yet", () => {
    expect(isOngoing("2026-11-01", null, today)).toBe(false);
  });
});

describe("formatMonthYear", () => {
  it("formats SQL dates in French without timezone shift", () => {
    expect(formatMonthYear("2025-09-01")).toBe("sept. 2025");
    expect(formatMonthYear("2024-06-01")).toBe("juin 2024");
  });
});

describe("formatLongDate", () => {
  it("formats a timestamp as a French long date", () => {
    expect(formatLongDate("2026-10-01T14:41:08.780105+00:00")).toBe("1 octobre 2026");
  });

  it("uses the Paris day, not the UTC one", () => {
    expect(formatLongDate("2026-09-30T23:30:00Z")).toBe("1 octobre 2026");
  });
});
