import type { Enums } from "@/lib/database.types";

// Typed by the Postgres enums: a new value fails the typecheck until it gets a label.
export const SKILL_CATEGORY_LABELS: Record<Enums<"cv_skill_category">, string> = {
  design: "Design",
  development: "Développement",
};

export const LINK_PLATFORM_LABELS: Record<Enums<"cv_link_platform">, string> = {
  linkedin: "LinkedIn",
  github: "GitHub",
  freecodecamp: "FreeCodeCamp",
  website: "Site web",
  other: "Lien",
};
