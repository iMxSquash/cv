"use client";

import type { ReactNode } from "react";
import { useScrollMotion } from "@/components/scroll/useScrollMotion";
import { findPin, gsap, pinnedScrub } from "@/lib/gsap";

/** Letter wave travelling along the quote. */
const WAVE = {
  /** Phase step between neighbouring letters (rad). */
  spread: 0.45,
  /** Crests passing a letter over the whole pin. */
  cycles: 6,
  heightPercent: 14,
  tiltDegrees: 6,
};
/**
 * Words of the about text wait in the muted text color (AA contrast, unlike a
 * low opacity) and settle on the full text color when their turn comes.
 */
const DIMMED_WORD_COLOR = "var(--text-muted)";
const LIT_WORD_COLOR = "var(--text)";

/**
 * Manifesto choreography: the quote crosses the pinned stage as one giant line
 * whose letters ripple, then the about text lights up word by word. Without
 * motion, both read as plain static text.
 */
export function ManifestoMotion({ children }: { children: ReactNode }) {
  const root = useScrollMotion((element) => {
    const pin = findPin(element);
    const track = pin?.querySelector<HTMLElement>("[data-manifesto-track]");
    if (pin && track) {
      const letters = gsap.utils.toArray<HTMLElement>("[data-manifesto-letter]");
      const setters = letters.map((letter) => ({
        y: gsap.quickSetter(letter, "yPercent"),
        rotation: gsap.quickSetter(letter, "rotation", "deg"),
      }));
      const ripple = (progress: number) => {
        const phase = progress * WAVE.cycles * Math.PI * 2;
        setters.forEach(({ y, rotation }, index) => {
          const angle = index * WAVE.spread - phase;
          y(Math.sin(angle) * WAVE.heightPercent);
          rotation(Math.cos(angle) * WAVE.tiltDegrees);
        });
      };
      // The line enters from the right edge and stops once its end is in view.
      gsap.fromTo(
        track,
        { x: () => track.clientWidth },
        {
          x: () => track.clientWidth - track.scrollWidth,
          ease: "none",
          scrollTrigger: {
            ...pinnedScrub(pin),
            invalidateOnRefresh: true,
            onUpdate: (self) => ripple(self.progress),
            // Own layers while rippling: the huge line is composited, not repainted, every frame.
            onToggle: (self) =>
              gsap.set(letters, { willChange: self.isActive ? "transform" : "auto" }),
          },
        },
      );
    }

    gsap.fromTo(
      "[data-manifesto-word]",
      { color: DIMMED_WORD_COLOR },
      {
        color: LIT_WORD_COLOR,
        ease: "none",
        stagger: 0.1,
        scrollTrigger: {
          trigger: "[data-manifesto-about]",
          start: "top 80%",
          end: "bottom 50%",
          scrub: true,
        },
      },
    );
  });

  return <div ref={root}>{children}</div>;
}
