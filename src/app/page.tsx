import { AboutSection } from "@/components/sections/AboutSection";
import { ContactFooter } from "@/components/sections/ContactFooter";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { InfosSection } from "@/components/sections/InfosSection";
import { SkillsSection } from "@/components/sections/SkillsSection";
import { getCv } from "@/lib/cv/queries";

export default async function Home() {
  const cv = await getCv();
  const today = new Date();
  return (
    <>
      <main id="content">
        <HeroSection profile={cv.profile} />
        <AboutSection profile={cv.profile} />
        <ExperienceSection experiences={cv.experiences} education={cv.education} today={today} />
        <SkillsSection skills={cv.skills} tools={cv.tools} />
        <InfosSection profile={cv.profile} languages={cv.languages} mobility={cv.mobility} />
      </main>
      <ContactFooter profile={cv.profile} links={cv.links} />
    </>
  );
}
