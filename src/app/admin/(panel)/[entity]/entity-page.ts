import { notFound } from "next/navigation";
import { z } from "zod";

import { type EntitySlug, parseEntity } from "@/lib/admin/entities";
import type { FormState } from "@/lib/admin/form-state";

import {
  saveEducation,
  saveExperience,
  saveLanguage,
  saveLink,
  saveMobility,
  saveSkill,
  saveTool,
} from "../save-actions";

export const SAVE_ACTIONS: Record<
  EntitySlug,
  (id: string | null, previous: FormState, formData: FormData) => Promise<FormState>
> = {
  experiences: saveExperience,
  education: saveEducation,
  skills: saveSkill,
  tools: saveTool,
  languages: saveLanguage,
  links: saveLink,
  mobility: saveMobility,
};

export function entityOrNotFound(value: string): EntitySlug {
  return parseEntity(value) ?? notFound();
}

/** Malformed ids would reach Postgres as a uuid cast error: answer 404 instead. */
export function idOrNotFound(value: string): string {
  return z.uuid().safeParse(value).success ? value : notFound();
}
