import { unstable_cache } from "next/cache";
import { cache } from "react";
import { localizeCv, localizeProfile } from "@/lib/cv/localize";
import type { Cv, Profile } from "@/lib/cv/types";
import type { Locale } from "@/lib/i18n/config";
import { createPublicClient } from "@/lib/supabase/public";

/** Tag of every cached resume read: `/admin` writes invalidate it (`revalidateCv`). */
export const CV_CACHE_TAG = "cv";

// Pages render per request (nonce CSP), so the data is cached instead of the
// HTML. The daily expiry is a safety net for rows edited outside `/admin`.
const CACHE_OPTIONS = { tags: [CV_CACHE_TAG], revalidate: 86400 };

/** Raw profile row, every language: cached per render so layout, page and metadata share one query. */
const getRawProfile = cache(
  unstable_cache(
    async (): Promise<Profile> => {
      try {
        const { data } = await createPublicClient()
          .from("cv_profile")
          .select("*")
          .single()
          .throwOnError();
        return data;
      } catch (error) {
        throw new Error("Failed to load the resume profile from Supabase", { cause: error });
      }
    },
    ["cv-profile"],
    CACHE_OPTIONS,
  ),
);

/** Loads the whole resume in parallel; every list is ordered by `sort_order`. Cached per render. */
const getRawCv = cache(
  unstable_cache(
    async (): Promise<Cv> => {
      const supabase = createPublicClient();
      try {
        const [profile, experiences, education, skills, tools, languages, links, mobility] =
          await Promise.all([
            supabase.from("cv_profile").select("*").single().throwOnError(),
            supabase.from("cv_experiences").select("*").order("sort_order").throwOnError(),
            supabase.from("cv_education").select("*").order("sort_order").throwOnError(),
            supabase
              .from("cv_skills")
              .select("*")
              .order("category")
              .order("sort_order")
              .throwOnError(),
            supabase.from("cv_tools").select("*").order("sort_order").throwOnError(),
            supabase.from("cv_languages").select("*").order("sort_order").throwOnError(),
            supabase.from("cv_links").select("*").order("sort_order").throwOnError(),
            supabase.from("cv_mobility").select("*").order("sort_order").throwOnError(),
          ]);
        return {
          profile: profile.data,
          experiences: experiences.data,
          education: education.data,
          skills: skills.data,
          tools: tools.data,
          languages: languages.data,
          links: links.data,
          mobility: mobility.data,
        };
      } catch (error) {
        throw new Error("Failed to load the resume from Supabase", { cause: error });
      }
    },
    ["cv-resume"],
    CACHE_OPTIONS,
  ),
);

/** The profile alone, for metadata and pages that do not render the resume. */
export async function getProfile(locale: Locale): Promise<Profile> {
  const profile = await getRawProfile();
  return localizeProfile(profile, locale);
}

/** The whole resume in `locale`; text without a translation stays in French. */
export async function getCv(locale: Locale): Promise<Cv> {
  return localizeCv(await getRawCv(), locale);
}
