import { SiteFooter } from "@/components/layout/SiteFooter";
import { ScrollChrome } from "@/components/scroll/ScrollChrome";
import { AboutSection } from "@/components/sections/AboutSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { InfosSection } from "@/components/sections/InfosSection";
import { NextSection } from "@/components/sections/NextSection";
import { SkillsSection } from "@/components/sections/SkillsSection";
import { getCv } from "@/lib/cv/queries";

export default async function Home() {
  const cv = await getCv();
  const today = new Date();
  return (
    <>
      <ScrollChrome name={cv.profile.full_name} />
      <main id="content">
        <HeroSection profile={cv.profile} />
        <AboutSection profile={cv.profile} />
        <ExperienceSection experiences={cv.experiences} education={cv.education} today={today} />
        <SkillsSection skills={cv.skills} tools={cv.tools} />
        <InfosSection profile={cv.profile} languages={cv.languages} mobility={cv.mobility} />
        <NextSection profile={cv.profile} />
      </main>
      <SiteFooter profile={cv.profile} links={cv.links} today={today} />
    </>
  );
}
