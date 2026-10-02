import type { Profile } from "@/lib/cv/types";

export function HeroSection({ profile }: { profile: Profile }) {
  return (
    // Transparent: the WebGL gradient (fixed canvas behind the page) shows through.
    <section
      id="hero"
      aria-label="Présentation"
      data-theme="dark"
      className="section-shell relative isolate flex min-h-dvh flex-col justify-center bg-transparent"
    >
      <div
        aria-hidden="true"
        className="hero-gradient-fallback absolute inset-0 -z-10 transition-opacity duration-700 in-data-[webgl=ready]:opacity-0"
      />
      <h1 className="title-display">{profile.full_name}</h1>
      <p className="mt-6 font-display text-display-l text-accent-display">{profile.headline}</p>
    </section>
  );
}
