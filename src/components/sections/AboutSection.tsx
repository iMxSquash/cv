import { Fragment } from "react";
import { parseKeywords } from "@/lib/cv/format";
import type { Profile } from "@/lib/cv/types";
import type { Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { PinnedStage } from "@/components/scroll/PinnedStage";
import { ManifestoMotion } from "./ManifestoMotion";

/** One span per letter, grouped by word so the static layout only wraps between words. */
function KineticLetters({ text }: { text: string }) {
  return text.split(" ").map((word, wordIndex) => (
    <Fragment key={wordIndex}>
      {wordIndex > 0 && " "}
      <span className="inline-block whitespace-nowrap">
        {Array.from(word, (letter, letterIndex) => (
          <span key={letterIndex} data-manifesto-letter className="inline-block">
            {letter}
          </span>
        ))}
      </span>
    </Fragment>
  ));
}

/** One span per word, revealed one after the other on scroll. */
function RevealWords({ text }: { text: string }) {
  return text.split(/(\s+)/).map((part, index) =>
    part.trim() === "" ? (
      part
    ) : (
      <span key={index} data-manifesto-word>
        {part}
      </span>
    ),
  );
}

export function AboutSection({ profile, locale }: { profile: Profile; locale: Locale }) {
  const t = getMessages(locale);
  const quote = profile.quote && t.quote(profile.quote);
  return (
    // The fixed canvas still shows below the shrinking hero frame: a band of page surface covers it.
    <section
      id="manifesto"
      aria-labelledby="manifesto-title"
      data-theme="light"
      className="relative isolate before:absolute before:inset-x-0 before:top-0 before:-z-10 before:h-dvh before:bg-surface"
    >
      <ManifestoMotion>
        {quote && (
          <PinnedStage
            screens={4}
            mobileScreens={2.5}
            stageClassName="pinned:flex pinned:flex-col pinned:justify-center"
          >
            <figure className="section-shell pb-0">
              <blockquote
                data-manifesto-track
                className="title-section pinned:text-[clamp(5rem,30vmin,22rem)] pinned:leading-none pinned:whitespace-nowrap"
              >
                <span className="sr-only">{quote}</span>
                <span aria-hidden="true">
                  <KineticLetters text={quote} />
                </span>
              </blockquote>
              {profile.quote_author && (
                <figcaption className="mt-4 text-text-muted pinned:absolute pinned:bottom-16">
                  {profile.quote_author}
                </figcaption>
              )}
            </figure>
          </PinnedStage>
        )}
        <div className="section-shell">
          <h2 id="manifesto-title" className="title-card">
            {t.about.title}
          </h2>
          <p data-manifesto-about className="mt-4 max-w-3xl">
            {parseKeywords(profile.about).map((segment, index) =>
              segment.isKeyword ? (
                <strong key={index} className="font-medium text-accent">
                  <RevealWords text={segment.text} />
                </strong>
              ) : (
                <RevealWords key={index} text={segment.text} />
              ),
            )}
          </p>
        </div>
      </ManifestoMotion>
    </section>
  );
}
