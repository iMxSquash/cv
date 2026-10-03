import { isOngoing, parseKeywords } from "./format";
import type { Education, Experience, Language, Link, Profile, Skill, Tool } from "./types";

// Search engines cut meta descriptions around 155-160 characters.
const DESCRIPTION_MAX = 155;

/** The `about` text without its `**keyword**` markup. */
export function stripKeywords(text: string): string {
  return parseKeywords(text)
    .map((segment) => segment.text)
    .join("");
}

/** Collapses whitespace and cuts at the last full word before `max`, with an ellipsis. */
export function truncateAtWord(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const words = lastSpace > 0 ? cut.slice(0, lastSpace) : cut;
  return `${words.replace(/[\s,;:.!?]+$/, "")}…`;
}

export function buildTitle(profile: Pick<Profile, "full_name" | "headline">): string {
  return `${profile.full_name}, ${profile.headline} · CV`;
}

/**
 * Open Graph fields shared by every page. Next replaces a parent `openGraph`
 * object instead of merging it, so pages spread this before their own fields.
 */
export function buildOpenGraphBase(profile: Pick<Profile, "full_name">) {
  return { type: "profile", locale: "fr_FR", siteName: profile.full_name } as const;
}

export function buildDescription(profile: Pick<Profile, "about">): string {
  return truncateAtWord(stripKeywords(profile.about), DESCRIPTION_MAX);
}

interface JsonLdSource {
  profile: Pick<
    Profile,
    "full_name" | "headline" | "about" | "email" | "avatar_url" | "location" | "updated_at"
  >;
  experiences: Pick<Experience, "company" | "start_date" | "end_date">[];
  education: Pick<Education, "school" | "city">[];
  skills: Pick<Skill, "label">[];
  tools: Pick<Tool, "name">[];
  languages: Pick<Language, "name">[];
  links: Pick<Link, "url">[];
}

/**
 * schema.org `ProfilePage` whose main entity is the resume owner. Only facts
 * rendered on the page go in here (Google penalizes markup describing hidden content).
 */
export function buildProfileJsonLd(cv: JsonLdSource, today: Date, siteUrl: string) {
  const { profile } = cv;
  const currentJob = cv.experiences.find((job) => isOngoing(job.start_date, job.end_date, today));
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${siteUrl}/`,
    url: `${siteUrl}/`,
    name: buildTitle(profile),
    inLanguage: "fr-FR",
    dateModified: profile.updated_at,
    mainEntity: {
      "@type": "Person",
      "@id": `${siteUrl}/#person`,
      name: profile.full_name,
      jobTitle: profile.headline,
      description: buildDescription(profile),
      url: `${siteUrl}/`,
      email: `mailto:${profile.email}`,
      image: profile.avatar_url ?? undefined,
      homeLocation: profile.location ? { "@type": "Place", name: profile.location } : undefined,
      worksFor: currentJob ? { "@type": "Organization", name: currentJob.company } : undefined,
      alumniOf: cv.education.map((entry) => ({
        "@type": "EducationalOrganization",
        name: entry.school,
        address: entry.city ?? undefined,
      })),
      knowsAbout: [...cv.skills.map((skill) => skill.label), ...cv.tools.map((tool) => tool.name)],
      knowsLanguage: cv.languages.map((language) => language.name),
      sameAs: cv.links.map((link) => link.url),
    },
  };
}

/** JSON for an inline `<script type="application/ld+json">`: `<` is escaped so content can never close the tag. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
