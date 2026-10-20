import { SiteFooter } from "@/components/layout/SiteFooter";
import { PinnedStage } from "@/components/scroll/PinnedStage";
import type { Link, Profile } from "@/lib/cv/types";
import type { Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { NextMotion } from "./NextMotion";
import { CURVE, CURVE_X, VIEW } from "./nextCurve";

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
      // Pinned with WebGL running, the transparent canvas behind shows the orb over the page surface. flow-root keeps the footer margin inside.
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
            viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
            className="hidden size-full pinned:block"
          >
            <defs>
              <linearGradient
                id="next-gradient"
                gradientUnits="userSpaceOnUse"
                x1={CURVE_X.start}
                x2={CURVE_X.end}
              >
                <stop offset="0" style={{ stopColor: "var(--palette-primary-light)" }} />
                <stop offset="0.5" style={{ stopColor: "var(--palette-primary)" }} />
                <stop offset="1" style={{ stopColor: "var(--palette-secondary-light)" }} />
              </linearGradient>
            </defs>
            <g data-next-lift>
              <g data-next-camera>
                <path id="next-curve" d={CURVE} fill="none" />
                <text
                  className="font-display font-medium"
                  fontSize="140"
                  fill="url(#next-gradient)"
                >
                  <textPath href="#next-curve">
                    {Array.from(title).map((letter, index) => (
                      <tspan key={index}>{letter}</tspan>
                    ))}
                  </textPath>
                </text>
              </g>
            </g>
          </svg>
          <SiteFooter profile={profile} links={links} today={today} locale={locale} />
        </PinnedStage>
      </NextMotion>
    </section>
  );
}
