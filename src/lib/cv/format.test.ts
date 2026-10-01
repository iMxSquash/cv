import { describe, expect, it } from "vitest";

import { formatMonthYear, formatPeriod, formatYearRange, isOngoing, parseKeywords } from "./format";

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

describe("formatPeriod", () => {
  it("joins start and end dates", () => {
    expect(formatPeriod("2025-09-01", "2026-09-01")).toBe("sept. 2025 – sept. 2026");
  });

  it("ends with today for an ongoing period", () => {
    expect(formatPeriod("2025-09-01", null)).toBe("sept. 2025 – aujourd'hui");
  });
});

describe("formatYearRange", () => {
  it("joins two different years", () => {
    expect(formatYearRange(2023, 2026)).toBe("2023 – 2026");
  });

  it("shows a single year when the start is missing or equal", () => {
    expect(formatYearRange(null, 2023)).toBe("2023");
    expect(formatYearRange(2023, 2023)).toBe("2023");
  });
});
