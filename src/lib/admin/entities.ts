import type { Tables } from "@/lib/database.types";

/** The list pages of /admin (the profile singleton has its own form). */
export const ADMIN_ENTITIES = {
  experiences: {
    table: "cv_experiences",
    title: "Expériences",
    createLabel: "Nouvelle expérience",
  },
  education: { table: "cv_education", title: "Éducation", createLabel: "Nouvelle formation" },
  skills: { table: "cv_skills", title: "Compétences", createLabel: "Nouvelle compétence" },
  tools: { table: "cv_tools", title: "Outils", createLabel: "Nouvel outil" },
  languages: { table: "cv_languages", title: "Langues", createLabel: "Nouvelle langue" },
  links: { table: "cv_links", title: "Liens", createLabel: "Nouveau lien" },
  mobility: { table: "cv_mobility", title: "Mobilité", createLabel: "Nouvelle mobilité" },
} as const;

export type EntitySlug = keyof typeof ADMIN_ENTITIES;

export type EntityTable = (typeof ADMIN_ENTITIES)[EntitySlug]["table"];

export type EntityRow<K extends EntitySlug> = Tables<(typeof ADMIN_ENTITIES)[K]["table"]>;

export const ENTITY_SLUGS = Object.keys(ADMIN_ENTITIES) as EntitySlug[];

export function parseEntity(value: string): EntitySlug | null {
  return ENTITY_SLUGS.find((slug) => slug === value) ?? null;
}
