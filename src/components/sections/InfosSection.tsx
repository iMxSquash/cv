import { CvIcon } from "@/components/icons/CvIcon";
import { Flag } from "@/components/icons/Flag";
import { PinnedStage } from "@/components/scroll/PinnedStage";
import { Card } from "@/components/ui/Card";
import { OrbAnchor } from "@/components/ui/OrbAnchor";
import type { Language, MobilityItem, Profile } from "@/lib/cv/types";
import type { Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { InfosMotion } from "./InfosMotion";

/** Rings of the infos scene, outermost first, in viewBox units (the viewBox is 1000 wide). */
const RINGS = [
  { radius: 430, fontSize: 40 },
  { radius: 330, fontSize: 34 },
  { radius: 230, fontSize: 28 },
];
/** Average advance of an uppercase character with the rings' letter spacing, in em: sizes the repetitions. */
const CHARACTER_EM = 0.7;
const SEPARATOR = " \u2022 ";

/** Circle starting on the left, drawn clockwise: text set on it reads over the top. */
const circlePath = (radius: number) =>
  `M ${500 - radius} 500 a ${radius} ${radius} 0 1 1 ${2 * radius} 0 a ${radius} ${radius} 0 1 1 ${-2 * radius} 0`;

/**
 * The infos told on three rings of text turning around the orb (languages,
 * mobility, availability). They only restate the cards below, so they are
 * decorative: hidden from assistive technologies, and not rendered at all when
 * nothing is pinned. A gradient disc stands in for the orb without WebGL.
 */
function InfosRings({ texts }: { texts: string[][] }) {
  const rings = texts
    .map((items, index) => ({ items, ...RINGS[index] }))
    .filter(({ items }) => items.length > 0);
  if (rings.length === 0) return null;
  return (
    <div aria-hidden="true" className="hidden pinned:block">
      <PinnedStage screens={2.5} mobileScreens={2} stageClassName="grid place-items-center">
        <svg data-infos-rings viewBox="0 0 1000 1000" className="size-[min(90vw,90svh)]">
          <defs>
            <linearGradient id="infos-orb-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" style={{ stopColor: "var(--palette-primary)" }} />
              <stop offset="1" style={{ stopColor: "var(--palette-secondary)" }} />
            </linearGradient>
          </defs>
          <circle
            cx="500"
            cy="500"
            r="120"
            fill="url(#infos-orb-gradient)"
            className="in-data-[webgl=ready]:invisible"
          />
          {rings.map(({ items, radius, fontSize }, index) => {
            const circumference = 2 * Math.PI * radius;
            const phrase = items.join(SEPARATOR) + SEPARATOR;
            const repeats = Math.max(
              1,
              Math.round(circumference / (phrase.length * fontSize * CHARACTER_EM)),
            );
            return (
              <g key={index} data-infos-ring>
                <path id={`infos-ring-${index}`} d={circlePath(radius)} fill="none" />
                <text
                  className="font-display font-medium tracking-[0.08em] uppercase"
                  fontSize={fontSize}
                  fill="currentColor"
                >
                  {/* Stretched to the exact circumference, so the loop closes on itself. */}
                  <textPath
                    href={`#infos-ring-${index}`}
                    textLength={circumference}
                    lengthAdjust="spacing"
                  >
                    {Array.from({ length: repeats }, (_, repeat) =>
                      items.map((item, itemIndex) => (
                        <tspan key={`${repeat}-${itemIndex}`}>
                          {item}
                          <tspan className="fill-accent">{SEPARATOR}</tspan>
                        </tspan>
                      )),
                    )}
                  </textPath>
                </text>
              </g>
            );
          })}
        </svg>
      </PinnedStage>
    </div>
  );
}

interface InfosSectionProps {
  profile: Profile;
  languages: Language[];
  mobility: MobilityItem[];
  locale: Locale;
}

export function InfosSection({ profile, languages, mobility, locale }: InfosSectionProps) {
  const t = getMessages(locale).infos;
  return (
    <section id="infos" aria-labelledby="infos-title" data-theme="dark" className="section-shell">
      <InfosMotion>
        <InfosRings
          texts={[
            languages.map((language) => `${language.name} ${language.level}`),
            mobility.map((item) => item.label),
            profile.availability_title ? [profile.availability_title] : [],
          ]}
        />
        <h2 id="infos-title" className="title-section">
          {t.title}
          <OrbAnchor />
        </h2>
        <div data-infos-grid className="mt-10 grid gap-4 md:grid-cols-3">
          {profile.availability_title && (
            <Card className="md:col-span-2">
              <h3 className="flex items-center gap-2 title-card">
                {profile.is_available && (
                  <span aria-hidden="true" className="size-2.5 rounded-full bg-success" />
                )}
                {profile.availability_title}
              </h3>
              {profile.availability_detail && (
                <p className="mt-2 text-text-muted">{profile.availability_detail}</p>
              )}
            </Card>
          )}
          <Card>
            <h3 className="title-card">{t.languages}</h3>
            <ul className="mt-3 grid gap-2">
              {languages.map((language) => (
                <li key={language.id} className="flex items-center gap-3">
                  <Flag code={language.flag_code} />
                  <span>
                    {language.name} <span className="text-text-muted">({language.level})</span>
                  </span>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="md:col-span-3">
            <h3 className="title-card">{t.mobility}</h3>
            <ul className="mt-3 grid gap-2 md:grid-cols-3">
              {mobility.map((item) => (
                <li key={item.id} className="flex items-center gap-3">
                  <CvIcon name={item.icon_key} className="size-5 shrink-0 text-accent" />
                  <span>
                    {item.label}
                    {item.detail && <span className="text-text-muted"> ({item.detail})</span>}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </InfosMotion>
    </section>
  );
}
