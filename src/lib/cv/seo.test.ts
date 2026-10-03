import { describe, expect, it } from "vitest";

import {
  buildDescription,
  buildProfileJsonLd,
  serializeJsonLd,
  stripKeywords,
  truncateAtWord,
} from "./seo";

describe("stripKeywords", () => {
  it("keeps the keyword text without its markup", () => {
    expect(stripKeywords("Je code en **Angular** et **NestJS**.")).toBe(
      "Je code en Angular et NestJS.",
    );
  });
});

describe("truncateAtWord", () => {
  it("returns short text unchanged, whitespace collapsed", () => {
    expect(truncateAtWord("  Bonjour\n  le   monde ", 50)).toBe("Bonjour le monde");
  });

  it("cuts at the last full word and ends with an ellipsis within the limit", () => {
    const result = truncateAtWord("Curieux, rigoureux et passionné par le web", 25);
    expect(result).toBe("Curieux, rigoureux et…");
    expect(result.length).toBeLessThanOrEqual(25);
  });

  it("drops trailing punctuation before the ellipsis", () => {
    expect(truncateAtWord("Curieux, rigoureux, passionné", 21)).toBe("Curieux, rigoureux…");
  });

  it("hard-cuts a single word longer than the limit", () => {
    expect(truncateAtWord("anticonstitutionnellement", 10)).toBe("anticonst…");
  });
});

describe("buildDescription", () => {
  it("is the about text without markup, at most 155 characters", () => {
    const about = `Je suis **développeur**. ${"Texte long. ".repeat(30)}`;
    const description = buildDescription({ about });
    expect(description.startsWith("Je suis développeur.")).toBe(true);
    expect(description.length).toBeLessThanOrEqual(155);
  });
});

describe("buildProfileJsonLd", () => {
  const SITE = "https://cv.example.dev";
  const TODAY = new Date("2026-10-03T12:00:00Z");
  const cv = {
    profile: {
      full_name: "Ada Lovelace",
      headline: "Full-Stack Developer",
      about: "Je code en **TypeScript**.",
      email: "ada@example.dev",
      avatar_url: null,
      location: null,
      updated_at: "2026-10-01T14:41:08Z",
    },
    experiences: [
      { company: "Ancienne", start_date: "2020-01-01", end_date: "2021-01-01" },
      { company: "Actuelle", start_date: "2025-09-01", end_date: null },
    ],
    education: [{ school: "Digital Campus", city: "Paris" }],
    skills: [{ label: "React" }],
    tools: [{ name: "Figma" }],
    languages: [{ name: "Anglais" }],
    links: [{ url: "https://github.com/ada" }],
  };

  it("describes the owner as the main entity of a profile page", () => {
    const jsonLd = buildProfileJsonLd(cv, TODAY, SITE);
    expect(jsonLd).toMatchObject({
      "@type": "ProfilePage",
      url: `${SITE}/`,
      dateModified: "2026-10-01T14:41:08Z",
      mainEntity: {
        "@type": "Person",
        name: "Ada Lovelace",
        jobTitle: "Full-Stack Developer",
        description: "Je code en TypeScript.",
        email: "mailto:ada@example.dev",
        alumniOf: [
          { "@type": "EducationalOrganization", name: "Digital Campus", address: "Paris" },
        ],
        knowsAbout: ["React", "Figma"],
        knowsLanguage: ["Anglais"],
        sameAs: ["https://github.com/ada"],
      },
    });
  });

  it("names the employer only while a job is ongoing", () => {
    expect(buildProfileJsonLd(cv, TODAY, SITE).mainEntity.worksFor).toEqual({
      "@type": "Organization",
      name: "Actuelle",
    });
    const pastOnly = { ...cv, experiences: [cv.experiences[0]] };
    expect(buildProfileJsonLd(pastOnly, TODAY, SITE).mainEntity.worksFor).toBeUndefined();
  });

  it("omits empty optional fields from the serialized output", () => {
    const serialized = serializeJsonLd(buildProfileJsonLd(cv, TODAY, SITE));
    expect(serialized).not.toContain("image");
    expect(serialized).not.toContain("homeLocation");
  });
});

describe("serializeJsonLd", () => {
  it("escapes < so stored text cannot close the script tag", () => {
    expect(serializeJsonLd({ name: "</script><script>alert(1)</script>" })).not.toContain("<");
  });
});
