import { SiteFooter } from "@/components/layout/SiteFooter";
import { PinnedStage } from "@/components/scroll/PinnedStage";
import type { Link, Profile } from "@/lib/cv/types";
import type { Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { NextMotion } from "./NextMotion";

/** The sentence travels along this curve (viewBox units); both ends overshoot the frame. */
const CURVE = "M -100 380 C 200 80, 500 520, 1100 160";

interface NextSectionProps {
  profile: Profile;
  links: Link[];
  today: Date;
  locale: Locale;
}

export function NextSection({ profile, links, today, locale }: NextSectionProps) {
  const t = getMessages(locale).next;
  const title = profile.availability_title ?? t.fallbackTitle;
  return (
    <section
      id="next"
      aria-labelledby="next-title"
      data-theme="dark"
      // Pinned with WebGL running, the canvas paints the stage: the dark surface plus the orb. flow-root keeps the footer margin inside.
      className="flow-root pinned:in-data-[webgl=ready]:bg-transparent"
    >
      <NextMotion>
        <PinnedStage
          screens={5}
          mobileScreens={4.5}
          stageClassName="pinned:grid pinned:place-items-center"
        >
          <h2 id="next-title" className="section-shell pb-0 title-display pinned:sr-only">
            {title}
          </h2>
          {/* Visual copy of the title on a curve: the heading above is what assistive technologies read. */}
          <svg
            data-next-curve
            aria-hidden="true"
            viewBox="0 0 1000 500"
            className="hidden size-full pinned:block"
          >
            <defs>
              <linearGradient id="next-gradient" gradientUnits="userSpaceOnUse" x1="0" x2="1000">
                <stop offset="0" style={{ stopColor: "var(--palette-primary-light)" }} />
                <stop offset="0.5" style={{ stopColor: "var(--palette-primary)" }} />
                <stop offset="1" style={{ stopColor: "var(--palette-secondary-light)" }} />
              </linearGradient>
            </defs>
            <path id="next-curve" d={CURVE} fill="none" />
            <text className="font-display font-medium" fontSize="72" fill="url(#next-gradient)">
              <textPath href="#next-curve" startOffset="100%">
                {title}
              </textPath>
            </text>
          </svg>
          <SiteFooter profile={profile} links={links} today={today} locale={locale} />
        </PinnedStage>
      </NextMotion>
    </section>
  );
}
