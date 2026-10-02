import { Fragment } from "react";
import type { Profile } from "@/lib/cv/types";
import { HeroMotion } from "./HeroMotion";

export function HeroSection({ profile }: { profile: Profile }) {
  const words = profile.full_name.split(" ");
  return (
    // Transparent: the WebGL gradient (fixed canvas behind the page) shows through the frame.
    <section
      id="hero"
      aria-label="Présentation"
      data-theme="dark"
      className="relative bg-transparent pinned:h-[200svh] pinned:min-[900px]:h-[300svh]"
    >
      <HeroMotion>
        {/* The huge spread shadow paints the page surface around the rounded frame, over the canvas. */}
        <div className="relative isolate flex flex-1 flex-col justify-center overflow-hidden rounded-[clamp(1rem,3vmin,2rem)] px-6 shadow-[0_0_0_100vmax_var(--surface)] md:px-12">
          <div
            aria-hidden="true"
            className="hero-gradient-fallback absolute inset-0 -z-10 transition-opacity duration-700 in-data-[webgl=ready]:opacity-0"
          />
          <h1 className="title-display">
            {words.map((word, index) => (
              <Fragment key={index}>
                <span data-hero-word className="inline-block">
                  {word}
                </span>{" "}
              </Fragment>
            ))}
          </h1>
          <p data-hero-headline className="mt-6 font-display text-display-l text-accent-display">
            {profile.headline}
          </p>
        </div>
      </HeroMotion>
    </section>
  );
}
