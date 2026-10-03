import { describe, expect, it } from "vitest";

import {
  educationSchema,
  experienceSchema,
  languageSchema,
  linkSchema,
  mobilitySchema,
  profileSchema,
  readFormValues,
  skillSchema,
  toFieldErrors,
  toolSchema,
} from "./schemas";

const PROFILE = {
  full_name: "Elwen Coussot",
  headline: "Full-Stack Developer",
  quote: "",
  quote_author: "",
  about: "Je code en **Angular**.",
  email: "contact@elwen.dev",
  phone: "",
  location: "Herblay-sur-Seine, 95220",
  availability_title: "",
  availability_detail: "",
};

describe("profileSchema", () => {
  it("stores empty optional fields as null", () => {
    const result = profileSchema.parse(PROFILE);
    expect(result.quote).toBeNull();
    expect(result.phone).toBeNull();
  });

  it("trims text fields", () => {
    expect(profileSchema.parse({ ...PROFILE, full_name: "  Elwen  " }).full_name).toBe("Elwen");
  });

  it("reads an absent checkbox as false and 'on' as true", () => {
    expect(profileSchema.parse(PROFILE).is_available).toBe(false);
    expect(profileSchema.parse({ ...PROFILE, is_available: "on" }).is_available).toBe(true);
  });

  it("rejects a blank required field", () => {
    const result = profileSchema.safeParse({ ...PROFILE, headline: "   " });
    expect(result.success).toBe(false);
    if (!result.success) expect(toFieldErrors(result.error).headline).toBe("Champ requis.");
  });

  it("rejects a missing field", () => {
    expect(profileSchema.safeParse({ ...PROFILE, about: undefined }).success).toBe(false);
  });

  it("rejects an email the SQL check would refuse", () => {
    expect(profileSchema.safeParse({ ...PROFILE, email: "contact@elwen" }).success).toBe(false);
  });

  it("accepts a formatted phone number and rejects letters", () => {
    expect(profileSchema.safeParse({ ...PROFILE, phone: "+33 6 12 34 56 78" }).success).toBe(true);
    expect(profileSchema.safeParse({ ...PROFILE, phone: "call me" }).success).toBe(false);
  });

  it("rejects an overlong about text", () => {
    expect(profileSchema.safeParse({ ...PROFILE, about: "a".repeat(2001) }).success).toBe(false);
  });
});

const EXPERIENCE = {
  role: "Développeur full-stack",
  company: "FD Formation",
  start_date: "2025-09-01",
  end_date: "",
  location: "",
  description: "",
};

describe("experienceSchema", () => {
  it("stores an empty end date as null (ongoing)", () => {
    expect(experienceSchema.parse(EXPERIENCE).end_date).toBeNull();
  });

  it("rejects an end date before the start date on the end_date field", () => {
    const result = experienceSchema.safeParse({ ...EXPERIENCE, end_date: "2025-08-31" });
    expect(result.success).toBe(false);
    if (!result.success) expect(toFieldErrors(result.error).end_date).toBeDefined();
  });

  it("accepts an end date equal to the start date", () => {
    expect(experienceSchema.safeParse({ ...EXPERIENCE, end_date: "2025-09-01" }).success).toBe(
      true,
    );
  });

  it("rejects a malformed date", () => {
    expect(experienceSchema.safeParse({ ...EXPERIENCE, start_date: "09/2025" }).success).toBe(
      false,
    );
  });
});

const EDUCATION = {
  school: "Digital Campus",
  city: "Paris",
  degree: "Bachelor",
  details: "",
  start_year: "2024",
  end_year: "2027",
};

describe("educationSchema", () => {
  it("coerces years to numbers", () => {
    const result = educationSchema.parse(EDUCATION);
    expect(result.start_year).toBe(2024);
    expect(result.end_year).toBe(2027);
  });

  it("stores an empty start year as null (single-year entry)", () => {
    expect(educationSchema.parse({ ...EDUCATION, start_year: "" }).start_year).toBeNull();
  });

  it("rejects years outside the SQL bounds", () => {
    expect(educationSchema.safeParse({ ...EDUCATION, end_year: "1989" }).success).toBe(false);
    expect(educationSchema.safeParse({ ...EDUCATION, end_year: "2101" }).success).toBe(false);
  });

  it("rejects an end year before the start year", () => {
    const result = educationSchema.safeParse({ ...EDUCATION, end_year: "2023" });
    expect(result.success).toBe(false);
    if (!result.success) expect(toFieldErrors(result.error).end_year).toBeDefined();
  });

  it("rejects a non-integer year", () => {
    expect(educationSchema.safeParse({ ...EDUCATION, end_year: "2026.5" }).success).toBe(false);
  });
});

describe("skillSchema", () => {
  it("splits comma-separated details and drops blanks", () => {
    const result = skillSchema.parse({
      category: "development",
      label: "Frameworks",
      details: " NextJS, NestJS ,, PHP ",
    });
    expect(result.details).toEqual(["NextJS", "NestJS", "PHP"]);
  });

  it("accepts no details", () => {
    expect(skillSchema.parse({ category: "design", label: "Figma", details: "" }).details).toEqual(
      [],
    );
  });

  it("rejects a category outside the Postgres enum", () => {
    expect(skillSchema.safeParse({ category: "music", label: "x", details: "" }).success).toBe(
      false,
    );
  });
});

describe("toolSchema and mobilitySchema", () => {
  it("accept a known icon key", () => {
    expect(toolSchema.safeParse({ name: "Figma", purpose: "", icon_key: "figma" }).success).toBe(
      true,
    );
    expect(
      mobilitySchema.safeParse({ label: "Permis B", detail: "", icon_key: "car" }).success,
    ).toBe(true);
  });

  it("reject an unknown icon key", () => {
    expect(toolSchema.safeParse({ name: "x", purpose: "", icon_key: "<svg>" }).success).toBe(false);
  });
});

describe("languageSchema", () => {
  it("rejects a flag without local artwork", () => {
    expect(
      languageSchema.safeParse({ name: "Klingon", level: "A1", flag_code: "kl" }).success,
    ).toBe(false);
  });
});

describe("linkSchema", () => {
  const LINK = { platform: "github", label: "iMxSquash", url: "https://github.com/iMxSquash" };

  it("accepts an https URL", () => {
    expect(linkSchema.safeParse(LINK).success).toBe(true);
  });

  it.each(["http://github.com", "javascript:alert(1)", "github.com/iMxSquash"])(
    "rejects %s",
    (url) => {
      expect(linkSchema.safeParse({ ...LINK, url }).success).toBe(false);
    },
  );

  it("rejects a platform outside the Postgres enum", () => {
    expect(linkSchema.safeParse({ ...LINK, platform: "myspace" }).success).toBe(false);
  });
});

describe("readFormValues", () => {
  it("keeps text entries and drops files", () => {
    const formData = new FormData();
    formData.set("label", "CSS");
    formData.set("file", new File(["x"], "x.png"));
    expect(readFormValues(formData)).toEqual({ label: "CSS" });
  });
});
