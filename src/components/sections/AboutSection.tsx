import { parseKeywords } from "@/lib/cv/format";
import type { Profile } from "@/lib/cv/types";

export function AboutSection({ profile }: { profile: Profile }) {
  return (
    <section
      id="manifesto"
      aria-labelledby="manifesto-title"
      data-theme="light"
      className="section-shell"
    >
      {profile.quote && (
        <figure className="mb-16">
          <blockquote className="title-section">« {profile.quote} »</blockquote>
          {profile.quote_author && (
            <figcaption className="mt-4 text-text-muted">{profile.quote_author}</figcaption>
          )}
        </figure>
      )}
      <h2 id="manifesto-title" className="title-card">
        À propos
      </h2>
      <p className="mt-4 max-w-3xl">
        {parseKeywords(profile.about).map((segment, index) =>
          segment.isKeyword ? (
            <strong key={index} className="font-medium text-accent">
              {segment.text}
            </strong>
          ) : (
            segment.text
          ),
        )}
      </p>
    </section>
  );
}
