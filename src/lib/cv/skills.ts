import type { Skill } from "./types";

/** Skills shown on the website, its structured data and llms.txt: soft skills are printed only. */
export function getSiteSkills<T extends Pick<Skill, "category">>(skills: T[]): T[] {
  return skills.filter((skill) => skill.category !== "soft");
}
