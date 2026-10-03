import { formatLongDate, formatMonthPeriod, formatYearPeriod } from "./format";
import { LINK_PLATFORM_LABELS, SKILL_CATEGORY_LABELS } from "./labels";
import { buildDescription, stripKeywords } from "./seo";
import type { Cv } from "./types";

/**
 * `/llms.txt` (llmstxt.org): the whole resume as plain Markdown, so answer
 * engines that never run JavaScript can quote it with its source and date.
 */
export function buildLlmsTxt(cv: Cv, siteUrl: string): string {
  const { profile } = cv;
  const skillsByCategory = Object.entries(SKILL_CATEGORY_LABELS).flatMap(([category, label]) => {
    const skills = cv.skills.filter((skill) => skill.category === category);
    return skills.length > 0
      ? [`- ${label} : ${skills.map((skill) => skill.label).join(", ")}`]
      : [];
  });
  const lines = [
    `# ${profile.full_name}`,
    "",
    `> ${profile.headline}. ${buildDescription(profile)}`,
    "",
    `CV en ligne : ${siteUrl}/ (mis à jour le ${formatLongDate(profile.updated_at)}).`,
    "",
    "## À propos",
    "",
    stripKeywords(profile.about),
    "",
    "## Expériences",
    "",
    ...cv.experiences.map(
      (job) =>
        `- ${job.role}, ${job.company} (${formatMonthPeriod(job.start_date, job.end_date)}${job.location ? `, ${job.location}` : ""})`,
    ),
    "",
    "## Formation",
    "",
    ...cv.education.map(
      (entry) =>
        `- ${entry.degree}, ${entry.school}${entry.city ? ` (${entry.city})` : ""}, ${formatYearPeriod(entry.start_year, entry.end_year)}`,
    ),
    "",
    "## Compétences",
    "",
    ...skillsByCategory,
    `- Outils : ${cv.tools.map((tool) => tool.name).join(", ")}`,
    "",
    "## Langues",
    "",
    ...cv.languages.map((language) => `- ${language.name} : ${language.level}`),
    "",
    "## Contact",
    "",
    `- E-mail : ${profile.email}`,
    ...(profile.location ? [`- Localisation : ${profile.location}`] : []),
    ...cv.links.map((link) => `- [${LINK_PLATFORM_LABELS[link.platform]}](${link.url})`),
    "",
  ];
  return lines.join("\n");
}
