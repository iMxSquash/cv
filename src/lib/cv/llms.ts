import { type Locale, localePath } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { formatLongDate, formatMonthPeriod, formatYearPeriod } from "./format";
import { PORTFOLIO_URL } from "@/lib/site";
import { buildDescription, stripKeywords } from "./seo";
import type { Cv } from "./types";

/**
 * `/llms.txt` (llmstxt.org): the whole resume as plain Markdown, so answer
 * engines that never run JavaScript can quote it with its source and date.
 */
export function buildLlmsTxt(cv: Cv, siteUrl: string, locale: Locale): string {
  const { profile } = cv;
  const t = getMessages(locale);
  const skillsByCategory = Object.entries(t.skills.categories).flatMap(([category, label]) => {
    const skills = cv.skills.filter((skill) => skill.category === category);
    return skills.length > 0
      ? [`- ${label}${t.llms.colon}${skills.map((skill) => skill.label).join(", ")}`]
      : [];
  });
  const lines = [
    `# ${profile.full_name}`,
    "",
    `> ${profile.headline}. ${buildDescription(profile)}`,
    "",
    t.llms.onlineCv(
      `${siteUrl}${localePath(locale, "/")}`,
      formatLongDate(profile.updated_at, locale),
    ),
    "",
    `## ${t.llms.about}`,
    "",
    stripKeywords(profile.about),
    "",
    `## ${t.llms.experiences}`,
    "",
    ...cv.experiences.map((job) => {
      const summary = `- ${job.role}, ${job.company} (${formatMonthPeriod(job.start_date, job.end_date, locale)}${job.location ? `, ${job.location}` : ""})`;
      return job.description ? `${summary}: ${stripKeywords(job.description)}` : summary;
    }),
    "",
    `## ${t.llms.education}`,
    "",
    ...cv.education.map(
      (entry) =>
        `- ${entry.degree}, ${entry.school}${entry.city ? ` (${entry.city})` : ""}, ${formatYearPeriod(entry.start_year, entry.end_year)}`,
    ),
    "",
    `## ${t.llms.skills}`,
    "",
    ...skillsByCategory,
    `- ${t.llms.tools}${t.llms.colon}${cv.tools.map((tool) => tool.name).join(", ")}`,
    "",
    `## ${t.llms.languages}`,
    "",
    ...cv.languages.map((language) => `- ${language.name}${t.llms.colon}${language.level}`),
    "",
    `## ${t.llms.contact}`,
    "",
    `- ${t.llms.email}${t.llms.colon}${profile.email}`,
    ...(profile.location ? [`- ${t.llms.location}${t.llms.colon}${profile.location}`] : []),
    `- [${t.footer.portfolio}](${PORTFOLIO_URL})`,
    ...cv.links.map((link) => `- [${t.linkPlatforms[link.platform]}](${link.url})`),
    "",
  ];
  return lines.join("\n");
}
