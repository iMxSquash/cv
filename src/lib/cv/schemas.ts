import { z } from "zod";

import { ICON_KEYS } from "@/components/icons/CvIcon";
import { FLAG_CODES } from "@/components/icons/Flag";
import { Constants } from "@/lib/database.types";

/*
 * Server-side validation of the /admin forms. Every rule mirrors a constraint
 * of the `cv_*` tables (supabase/migrations), which stay the last line of
 * defense; length caps only exist here, to keep the layout sane.
 */

const SHORT_TEXT_MAX = 120;
const MEDIUM_TEXT_MAX = 300;
const LONG_TEXT_MAX = 2000;
const SKILL_DETAILS_MAX = 10;
export const YEAR_MIN = 1990;
export const YEAR_MAX = 2100;

const REQUIRED = "Champ requis.";
const tooLong = (max: number) => `${max} caractères maximum.`;

const requiredText = (max = SHORT_TEXT_MAX) =>
  z.string({ error: REQUIRED }).trim().min(1, REQUIRED).max(max, tooLong(max));

/** Empty input means "not set": stored as null, never as an empty string. */
const optionalText = (max = SHORT_TEXT_MAX) =>
  z
    .string({ error: REQUIRED })
    .trim()
    .max(max, tooLong(max))
    .transform((value) => value || null);

/** An unchecked checkbox is absent from the FormData. */
const checkbox = z.literal("on").optional().transform(Boolean);

// Same pattern as the CHECK constraint on `cv_profile.email`.
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/i;
const PHONE_PATTERN = /^\+?[0-9][0-9 .-]{5,19}$/;

const sqlDate = z.iso.date("Date invalide.");

const year = z.coerce
  .number({ error: "Année invalide." })
  .int("Année invalide.")
  .min(YEAR_MIN, `Année entre ${YEAR_MIN} et ${YEAR_MAX}.`)
  .max(YEAR_MAX, `Année entre ${YEAR_MIN} et ${YEAR_MAX}.`);

const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);

export const profileSchema = z.object({
  full_name: requiredText(),
  headline: requiredText(),
  quote: optionalText(MEDIUM_TEXT_MAX),
  quote_author: optionalText(),
  about: requiredText(LONG_TEXT_MAX),
  email: requiredText().regex(EMAIL_PATTERN, "Adresse e-mail invalide."),
  phone: optionalText().refine(
    (value) => value === null || PHONE_PATTERN.test(value),
    "Numéro invalide (chiffres, espaces, points, tirets, + initial).",
  ),
  location: optionalText(),
  availability_title: optionalText(),
  availability_detail: optionalText(MEDIUM_TEXT_MAX),
  is_available: checkbox,
});

export const experienceSchema = z
  .object({
    role: requiredText(),
    company: requiredText(),
    start_date: sqlDate,
    end_date: z.preprocess(emptyToUndefined, sqlDate.optional()).transform((v) => v ?? null),
    location: optionalText(),
    description: optionalText(LONG_TEXT_MAX),
    visible: checkbox,
  })
  .refine((value) => value.end_date === null || value.end_date >= value.start_date, {
    path: ["end_date"],
    error: "La fin doit suivre le début.",
  });

export const educationSchema = z
  .object({
    school: requiredText(),
    city: optionalText(),
    degree: requiredText(),
    details: optionalText(MEDIUM_TEXT_MAX),
    start_year: z.preprocess(emptyToUndefined, year.optional()).transform((v) => v ?? null),
    end_year: year,
    visible: checkbox,
  })
  .refine((value) => value.start_year === null || value.end_year >= value.start_year, {
    path: ["end_year"],
    error: "L'année de fin doit suivre l'année de début.",
  });

export const skillSchema = z.object({
  category: z.enum(Constants.public.Enums.cv_skill_category, { error: "Catégorie inconnue." }),
  label: requiredText(),
  // Typed as a comma-separated list in a single field.
  details: z
    .string({ error: REQUIRED })
    .transform((value) =>
      value
        .split(",")
        .map((detail) => detail.trim())
        .filter(Boolean),
    )
    .pipe(
      z
        .array(z.string().max(SHORT_TEXT_MAX, tooLong(SHORT_TEXT_MAX)))
        .max(SKILL_DETAILS_MAX, `${SKILL_DETAILS_MAX} précisions maximum.`),
    ),
  visible: checkbox,
});

export const toolSchema = z.object({
  name: requiredText(),
  purpose: optionalText(),
  icon_key: z.enum(ICON_KEYS, { error: "Icône inconnue." }),
  visible: checkbox,
});

export const languageSchema = z.object({
  name: requiredText(),
  level: requiredText(),
  flag_code: z.enum(FLAG_CODES, { error: "Drapeau inconnu." }),
  visible: checkbox,
});

export const linkSchema = z.object({
  platform: z.enum(Constants.public.Enums.cv_link_platform, { error: "Plateforme inconnue." }),
  label: requiredText(),
  // Same rule as the CHECK constraint on `cv_links.url`: https only.
  url: requiredText(MEDIUM_TEXT_MAX).pipe(
    z.url({ protocol: /^https$/, error: "Adresse https:// complète attendue." }),
  ),
  visible: checkbox,
});

export const mobilitySchema = z.object({
  label: requiredText(),
  detail: optionalText(),
  icon_key: z.enum(ICON_KEYS, { error: "Icône inconnue." }),
  visible: checkbox,
});

export type FieldErrors = Partial<Record<string, string>>;

/** First message per field, keyed by field name, for `aria-describedby` error lines. */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const fieldErrors: FieldErrors = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "");
    fieldErrors[field] ??= issue.message;
  }
  return fieldErrors;
}

/** Text entries of a submitted form; files never travel through Server Actions here. */
export function readFormValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [name, value] of formData) {
    if (typeof value === "string") values[name] = value;
  }
  return values;
}
