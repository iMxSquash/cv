import { cache } from "react";
import type { Cv, Profile } from "@/lib/cv/types";
import { createPublicClient } from "@/lib/supabase/public";

/**
 * Loads the profile alone, for metadata and pages that do not render the resume.
 * Cached per render: layout, page and their metadata share one query.
 */
export const getProfile = cache(async (): Promise<Profile> => {
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
});

/** Loads the whole resume in parallel; every list is ordered by `sort_order`. Cached per render. */
export const getCv = cache(async (): Promise<Cv> => {
  const supabase = createPublicClient();
  try {
    const [profile, experiences, education, skills, tools, languages, links, mobility] =
      await Promise.all([
        supabase.from("cv_profile").select("*").single().throwOnError(),
        supabase.from("cv_experiences").select("*").order("sort_order").throwOnError(),
        supabase.from("cv_education").select("*").order("sort_order").throwOnError(),
        supabase.from("cv_skills").select("*").order("category").order("sort_order").throwOnError(),
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
});
