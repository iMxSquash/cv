import { CvIcon } from "@/components/icons/CvIcon";
import type { Profile } from "@/lib/cv/types";

const FALLBACK_TITLE = "Me contacter";

export function NextSection({ profile }: { profile: Profile }) {
  return (
    <section id="next" aria-labelledby="next-title" data-theme="dark" className="section-shell">
      <h2 id="next-title" className="title-display">
        {profile.availability_title ?? FALLBACK_TITLE}
      </h2>
      {profile.availability_detail && (
        <p className="mt-6 max-w-2xl text-text-muted">{profile.availability_detail}</p>
      )}
      <a
        href={`mailto:${profile.email}`}
        className="mt-10 inline-flex min-h-11 items-center gap-2 rounded-full bg-accent-display px-6 py-3 font-medium text-surface"
      >
        <CvIcon name="mail" />
        Écrire un email
      </a>
    </section>
  );
}
