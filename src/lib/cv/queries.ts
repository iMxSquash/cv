import type { Cv } from "@/lib/cv/types";
import { createPublicClient } from "@/lib/supabase/public";

/** Loads the whole resume in parallel; every list is ordered by `sort_order`. */
export async function getCv(): Promise<Cv> {
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
}
