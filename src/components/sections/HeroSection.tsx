import type { Profile } from "@/lib/cv/types";

export function HeroSection({ profile }: { profile: Profile }) {
  return (
    <section id="hero" aria-label="Présentation" data-theme="light" className="section-shell">
      <h1 className="font-display text-display-xl font-medium">{profile.full_name}</h1>
      <p className="mt-6 font-display text-display-l text-accent-display">{profile.headline}</p>
    </section>
  );
}
