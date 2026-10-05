import type { Locale } from "@/lib/i18n/config";
import type { Cv, Profile } from "./types";

/** The `*_en` value when the locale is English and it is filled, else the base (French) value. */
function pick<T extends string | null>(
  locale: Locale,
  base: T,
  english: string | null,
): T | string {
  return locale === "en" && english ? english : base;
}

export function localizeProfile(profile: Profile, locale: Locale): Profile {
  return {
    ...profile,
    about: pick(locale, profile.about, profile.about_en),
    availability_title: pick(locale, profile.availability_title, profile.availability_title_en),
    availability_detail: pick(locale, profile.availability_detail, profile.availability_detail_en),
  };
}

/**
 * Same resume with the text fields of `locale` in place of the base ones, so
 * components never deal with translations. A missing translation falls back to French.
 */
export function localizeCv(cv: Cv, locale: Locale): Cv {
  return {
    ...cv,
    profile: localizeProfile(cv.profile, locale),
    experiences: cv.experiences.map((entry) => ({
      ...entry,
      role: pick(locale, entry.role, entry.role_en),
      location: pick(locale, entry.location, entry.location_en),
    })),
    education: cv.education.map((entry) => ({
      ...entry,
      degree: pick(locale, entry.degree, entry.degree_en),
      details: pick(locale, entry.details, entry.details_en),
    })),
    tools: cv.tools.map((tool) => ({
      ...tool,
      purpose: pick(locale, tool.purpose, tool.purpose_en),
    })),
    languages: cv.languages.map((language) => ({
      ...language,
      name: pick(locale, language.name, language.name_en),
      level: pick(locale, language.level, language.level_en),
    })),
    mobility: cv.mobility.map((item) => ({
      ...item,
      label: pick(locale, item.label, item.label_en),
      detail: pick(locale, item.detail, item.detail_en),
    })),
  };
}
