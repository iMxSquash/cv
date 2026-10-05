import { describe, expect, it } from "vitest";

import { localizeCv } from "./localize";
import type { Cv } from "./types";

const ROW = { id: "1", created_at: "2026-01-01T00:00:00Z", sort_order: 0, visible: true };

const cv: Cv = {
  profile: {
    id: 1,
    full_name: "Ada Lovelace",
    headline: "Full-Stack Developer",
    about: "Je code.",
    about_en: "I code.",
    email: "ada@example.dev",
    phone: null,
    location: "Paris",
    avatar_url: null,
    quote: null,
    quote_author: null,
    availability_title: "Recherche d'alternance",
    availability_title_en: null,
    availability_detail: null,
    availability_detail_en: null,
    is_available: true,
    updated_at: "2026-10-01T14:41:08Z",
  },
  experiences: [
    {
      ...ROW,
      role: "Développeuse",
      role_en: "Developer",
      company: "Analytical Engines",
      start_date: "2025-09-01",
      end_date: null,
      location: "Travail à distance",
      location_en: "",
      description: null,
      logo_url: null,
    },
  ],
  education: [],
  skills: [],
  tools: [],
  languages: [
    { ...ROW, name: "Anglais", name_en: "English", level: "B2", level_en: null, flag_code: "gb" },
  ],
  links: [],
  mobility: [],
};

describe("localizeCv", () => {
  it("returns the French resume untouched", () => {
    expect(localizeCv(cv, "fr")).toEqual(cv);
  });

  it("swaps in the English text where a translation exists", () => {
    const english = localizeCv(cv, "en");
    expect(english.profile.about).toBe("I code.");
    expect(english.experiences[0].role).toBe("Developer");
    expect(english.languages[0].name).toBe("English");
  });

  it("falls back to French for a missing or empty translation", () => {
    const english = localizeCv(cv, "en");
    expect(english.profile.availability_title).toBe("Recherche d'alternance");
    expect(english.experiences[0].location).toBe("Travail à distance");
    expect(english.languages[0].level).toBe("B2");
  });

  it("keeps fields that have no translation", () => {
    expect(localizeCv(cv, "en").experiences[0].company).toBe("Analytical Engines");
  });

  it("does not mutate its input", () => {
    localizeCv(cv, "en");
    expect(cv.profile.about).toBe("Je code.");
  });
});
