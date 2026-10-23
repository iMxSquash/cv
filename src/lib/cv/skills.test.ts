import { describe, expect, it } from "vitest";

import { getSiteSkills } from "./skills";
import type { Skill } from "./types";

const skill = (category: Skill["category"], label: string): Skill => ({
  id: label,
  category,
  label,
  details: [],
  logo_url: null,
  sort_order: 0,
  visible: true,
  created_at: "2026-10-23T00:00:00Z",
});

describe("getSiteSkills", () => {
  it("keeps technical skills and drops the print-only soft skills", () => {
    const skills = [
      skill("development", "React"),
      skill("soft", "Rigueur"),
      skill("design", "Figma"),
    ];

    expect(getSiteSkills(skills).map((entry) => entry.label)).toEqual(["React", "Figma"]);
  });
});
