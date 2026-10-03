import { describe, expect, it } from "vitest";

import { buildLlmsTxt } from "./llms";
import type { Cv } from "./types";

const ROW = { id: "1", created_at: "2026-01-01T00:00:00Z", sort_order: 0, visible: true };

const cv: Cv = {
  profile: {
    id: 1,
    full_name: "Ada Lovelace",
    headline: "Full-Stack Developer",
    about: "Je code en **TypeScript**.",
    email: "ada@example.dev",
    phone: null,
    location: "Paris, 75001",
    avatar_url: null,
    quote: null,
    quote_author: null,
    availability_title: null,
    availability_detail: null,
    is_available: false,
    updated_at: "2026-10-01T14:41:08Z",
  },
  experiences: [
    {
      ...ROW,
      role: "Développeuse",
      company: "Analytical Engines",
      start_date: "2025-09-01",
      end_date: null,
      location: "Paris",
      description: null,
      logo_url: null,
    },
  ],
  education: [
    {
      ...ROW,
      school: "Digital Campus",
      city: "Paris",
      degree: "Bachelor",
      details: null,
      start_year: 2023,
      end_year: 2026,
      logo_url: null,
    },
  ],
  skills: [{ ...ROW, category: "development", label: "React", details: [] }],
  tools: [{ ...ROW, name: "Figma", purpose: null, icon_key: "figma" }],
  languages: [{ ...ROW, name: "Anglais", level: "B2", flag_code: "gb" }],
  links: [{ ...ROW, platform: "github", label: "ada", url: "https://github.com/ada" }],
  mobility: [],
};

describe("buildLlmsTxt", () => {
  const text = buildLlmsTxt(cv, "https://cv.example.dev");

  it("opens with the name as title and the headline as summary", () => {
    expect(
      text.startsWith("# Ada Lovelace\n\n> Full-Stack Developer. Je code en TypeScript."),
    ).toBe(true);
  });

  it("states the source URL and the last update date", () => {
    expect(text).toContain("CV en ligne : https://cv.example.dev/ (mis à jour le 1 octobre 2026).");
  });

  it("lists every resume entry as plain text", () => {
    expect(text).toContain("- Développeuse, Analytical Engines (sept. 2025 – aujourd'hui, Paris)");
    expect(text).toContain("- Bachelor, Digital Campus (Paris), 2023 – 2026");
    expect(text).toContain("- Développement : React");
    expect(text).toContain("- Anglais : B2");
    expect(text).toContain("- [GitHub](https://github.com/ada)");
  });

  it("skips a skill category without skills", () => {
    expect(text).not.toContain("- Design :");
  });
});
