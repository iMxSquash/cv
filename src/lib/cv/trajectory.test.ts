import { describe, expect, it } from "vitest";

import { buildTrajectory } from "./trajectory";

describe("buildTrajectory", () => {
  const experience = (role: string, start_date: string, end_date: string | null = null) => ({
    role,
    start_date,
    end_date,
  });
  const education = (degree: string, start_year: number | null, end_year: number) => ({
    degree,
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
      { year: 2024, label: "Développeur" },
      { year: 2023, label: "Bachelor" },
      { year: 2020, label: "Graphiste" },
    ]);
  });

  it("dates a degree without a start year by its end year", () => {
    expect(buildTrajectory([], [education("Baccalauréat", null, 2023)])).toEqual([
      { year: 2023, label: "Baccalauréat" },
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

  it("keeps a repeated role once, at its first year", () => {
    expect(
      buildTrajectory(
        [
          experience("Développeur", "2025-09-01"),
          experience("Développeur", "2024-06-01", "2025-09-01"),
        ],
        [],
      ),
    ).toEqual([{ year: 2024, label: "Développeur" }]);
  });

  it("returns no step without any entry", () => {
    expect(buildTrajectory([], [])).toEqual([]);
  });
});
