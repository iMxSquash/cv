import type { Metadata } from "next";
import { Loader } from "@/components/layout/Loader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ScrollChrome } from "@/components/scroll/ScrollChrome";
import { AboutSection } from "@/components/sections/AboutSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { InfosSection } from "@/components/sections/InfosSection";
import { NextSection } from "@/components/sections/NextSection";
import { SkillsSection } from "@/components/sections/SkillsSection";
import { WebGLBackground } from "@/components/webgl/WebGLBackground";
import { getCv, getProfile } from "@/lib/cv/queries";
import {
  buildDescription,
  buildOpenGraphBase,
  buildProfileJsonLd,
  buildTitle,
  serializeJsonLd,
} from "@/lib/cv/seo";
import { SITE_URL } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  const title = buildTitle(profile);
  const description = buildDescription(profile);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "/" },
    openGraph: { ...buildOpenGraphBase(profile), url: "/", title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function Home() {
  const cv = await getCv();
  const today = new Date();
  return (
    <>
      <script
        type="application/ld+json"
        // Escaped by serializeJsonLd: database text can never close the tag.
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(buildProfileJsonLd(cv, today, SITE_URL)),
        }}
      />
      <Loader />
      <WebGLBackground />
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
