"use client";

import type { ReactNode } from "react";
import { useScrollMotion } from "@/components/scroll/useScrollMotion";
import { findPin, gsap, pinnedScrub } from "@/lib/gsap";
import { scrollProgress } from "@/webgl/scrollProgress";

/** How far each half of the name travels outwards, in % of its own width. */
const WORD_SPREAD_PERCENT = 60;

/**
 * Hero choreography. While the pinned stage scrolls by, the name splits
 * apart and fades while the WebGL monogram grows to the center. In flow,
 * without any motion, under reduced motion.
 */
export function HeroMotion({ children }: { children: ReactNode }) {
  const root = useScrollMotion((element) => {
    const pin = findPin(element);
    if (!pin) return;
    const words = gsap.utils.toArray<HTMLElement>("[data-hero-word]");
    const half = (words.length - 1) / 2;
    gsap
      .timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          ...pinnedScrub(pin),
          onUpdate: (self) => {
            scrollProgress.hero = self.progress;
          },
        },
      })
      .to("[data-hero-headline]", { yPercent: 60, opacity: 0, duration: 0.3 }, 0)
      .to(
        words,
        {
          xPercent: (index: number) => Math.sign(index - half) * WORD_SPREAD_PERCENT,
          opacity: 0,
          duration: 0.6,
        },
        0,
      )
      // Holds the centered monogram alone on screen until the pin releases.
      .set({}, {}, 1);
    return () => {
      scrollProgress.hero = 0;
    };
  });

  return <div ref={root}>{children}</div>;
}
