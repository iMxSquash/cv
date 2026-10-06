import { Fragment } from "react";
import { parseKeywords } from "@/lib/cv/format";
import type { Profile } from "@/lib/cv/types";
import type { Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { PinnedStage } from "@/components/scroll/PinnedStage";
import { OrbAnchor } from "@/components/ui/OrbAnchor";
import { ManifestoMotion } from "./ManifestoMotion";

/**
 * One span per letter, grouped by word so the static layout only wraps between
 * words. The first word is where the orb bursts open before the rest of the
 * line comes in; its opening quote mark is flagged apart, to come later. The
 * last full stop is where the orb shows up again, rippling with the letters.
 */
function KineticLetters({ text }: { text: string }) {
  // Indexed by code point, like the letters.
  const characters = Array.from(text);
  const periodIndex = characters.lastIndexOf(".");
  const wordStart = Math.max(
    characters.findIndex((character) => /[\p{L}\p{N}]/u.test(character)),
    0,
  );
  let offset = 0;
  return text.split(" ").map((word, wordIndex) => {
    const letters = Array.from(word);
    const wordOffset = offset;
    offset += letters.length + 1;
    return (
      <Fragment key={wordIndex}>
        {wordIndex > 0 && " "}
        <span
          data-manifesto-first-word={wordIndex === 0 ? "" : undefined}
          className="inline-block whitespace-nowrap"
        >
          {letters.map((letter, letterIndex) => (
            <span
              key={letterIndex}
              data-manifesto-letter
              data-manifesto-opening={wordOffset + letterIndex < wordStart ? "" : undefined}
              className="inline-block"
            >
              {wordOffset + letterIndex === periodIndex ? <OrbAnchor isFollowed={false} /> : letter}
            </span>
          ))}
        </span>
      </Fragment>
    );
  });
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
    <section id="manifesto" aria-labelledby="manifesto-title" data-theme="light">
      <ManifestoMotion>
        {quote && (
          <PinnedStage
            screens={6}
            mobileScreens={4}
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
                <figcaption
                  data-manifesto-author
                  className="mt-4 text-text-muted pinned:absolute pinned:bottom-16"
                >
                  {profile.quote_author}
                </figcaption>
              )}
            </figure>
          </PinnedStage>
        )}
        <div data-manifesto-about-block className="section-shell">
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
