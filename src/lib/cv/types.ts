import type { Tables } from "@/lib/database.types";

export type Profile = Tables<"cv_profile">;
export type Experience = Tables<"cv_experiences">;
export type Education = Tables<"cv_education">;
export type Skill = Tables<"cv_skills">;
export type Tool = Tables<"cv_tools">;
export type Language = Tables<"cv_languages">;
export type Link = Tables<"cv_links">;
export type MobilityItem = Tables<"cv_mobility">;

export interface Cv {
  profile: Profile;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  tools: Tool[];
  languages: Language[];
  links: Link[];
  mobility: MobilityItem[];
}
