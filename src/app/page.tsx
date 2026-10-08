import type { Metadata } from "next";
import { Loader } from "@/components/layout/Loader";
import { PageTransition } from "@/components/scroll/PageTransition";
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
  buildAlternates,
  buildDescription,
  buildOpenGraphBase,
  buildProfileJsonLd,
  buildTitle,
  serializeJsonLd,
} from "@/lib/cv/seo";
import { localePath } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";
import { SITE_URL } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const profile = await getProfile(locale);
  const title = buildTitle(profile, locale);
  const description = buildDescription(profile);
  // Explicit: the file convention would point the English page at the French card.
  const ogImage = localePath(locale, "/opengraph-image");
  return {
    title: { absolute: title },
    description,
    alternates: buildAlternates(locale, "/"),
    openGraph: {
      ...buildOpenGraphBase(profile, locale),
      url: localePath(locale, "/"),
      title,
      description,
      images: [ogImage],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

export default async function Home() {
  const locale = await getLocale();
  const cv = await getCv(locale);
  const today = new Date();
  return (
    <>
      <script
        type="application/ld+json"
        // Escaped by serializeJsonLd: database text can never close the tag.
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(buildProfileJsonLd(cv, today, SITE_URL, locale)),
        }}
      />
      <Loader locale={locale} />
      <WebGLBackground />
      <ScrollChrome name={cv.profile.full_name} locale={locale} />
      <PageTransition labels={getMessages(locale).nav.sectionLabels} />
      <main id="content">
        <HeroSection profile={cv.profile} locale={locale} />
        <AboutSection profile={cv.profile} locale={locale} />
        <ExperienceSection
          experiences={cv.experiences}
          education={cv.education}
          today={today}
          locale={locale}
        />
        <SkillsSection skills={cv.skills} tools={cv.tools} locale={locale} />
        <InfosSection
          profile={cv.profile}
          languages={cv.languages}
          mobility={cv.mobility}
          locale={locale}
        />
        <NextSection profile={cv.profile} links={cv.links} today={today} locale={locale} />
      </main>
    </>
  );
}
