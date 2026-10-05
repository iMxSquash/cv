export type SectionTheme = "light" | "dark";

/**
 * `id`s of the <section>s rendered by src/components/sections/, in storyboard
 * order (which is also the DOM order). Labels live in the i18n messages.
 */
export const NAV_SECTION_IDS = [
  "hero",
  "manifesto",
  "experiences",
  "skills",
  "infos",
  "next",
] as const;
export type NavSectionId = (typeof NAV_SECTION_IDS)[number];
