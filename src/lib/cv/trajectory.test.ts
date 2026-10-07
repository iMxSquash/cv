import { describe, expect, it } from "vitest";

import { buildTrajectory } from "./trajectory";

describe("buildTrajectory", () => {
  const experience = (
    role: string,
    start_date: string,
    end_date: string | null = null,
    company = "Acme",
  ) => ({ role, company, start_date, end_date });
  const education = (degree: string, start_year: number | null, end_year: number) => ({
    degree,
    school: "École",
    start_year,
    end_year,
  });

  it("merges experiences and education from the most recent step", () => {
    expect(
      buildTrajectory(
        [
          experience("Développeur", "2024-06-01", "2025-09-01"),
          experience("Graphiste", "2020-11-01"),
        ],
        [education("Bachelor", 2023, 2026)],
      ),
    ).toEqual([
      { label: "Développeur", start: 2024, end: 2025, organizations: ["Acme"] },
      { label: "Bachelor", start: 2023, end: 2026, organizations: ["École"] },
      { label: "Graphiste", start: 2020, end: null, organizations: ["Acme"] },
    ]);
  });

  it("keeps a degree without a start year dated by its end year", () => {
    expect(buildTrajectory([], [education("Baccalauréat", null, 2023)])).toEqual([
      { label: "Baccalauréat", start: null, end: 2023, organizations: ["École"] },
    ]);
  });

  it("orders steps starting the same year by end, an ongoing one first", () => {
    expect(
      buildTrajectory(
        [experience("Alternance", "2023-09-01")],
        [education("Bachelor", 2023, 2026), education("Baccalauréat", null, 2023)],
      ).map((step) => step.label),
    ).toEqual(["Alternance", "Bachelor", "Baccalauréat"]);
  });

  it("spans a repeated role over all its entries and names each company, most recent first", () => {
    expect(
      buildTrajectory(
        [
          experience("Développeur", "2025-09-01", "2028-09-01", "FD Formation"),
          experience("Développeur", "2024-06-01", "2025-09-01", "EStack"),
        ],
        [],
      ),
    ).toEqual([
      {
        label: "Développeur",
        start: 2024,
        end: 2028,
        organizations: ["FD Formation", "EStack"],
      },
    ]);
  });

  it("keeps a repeated role open while one of its entries is ongoing", () => {
    expect(
      buildTrajectory(
        [
          experience("Développeur", "2024-06-01", "2025-09-01"),
          experience("Développeur", "2025-09-01"),
        ],
        [],
      )[0]?.end,
    ).toBeNull();
  });

  it("returns no step without any entry", () => {
    expect(buildTrajectory([], [])).toEqual([]);
  });
});
