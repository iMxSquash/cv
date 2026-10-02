export type SectionTheme = "light" | "dark";

export interface NavSection {
  /** `id` of the <section> rendered by the matching component in src/components/sections/. */
  id: string;
  label: string;
}

/** Storyboard order, which is also the DOM order. */
export const NAV_SECTIONS: readonly NavSection[] = [
  { id: "hero", label: "Présentation" },
  { id: "manifesto", label: "À propos" },
  { id: "experiences", label: "Parcours" },
  { id: "skills", label: "Compétences" },
  { id: "infos", label: "Infos pratiques" },
  { id: "next", label: "Disponibilité" },
];
