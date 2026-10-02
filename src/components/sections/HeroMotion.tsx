"use client";

import { type ReactNode, useRef } from "react";
import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";
import { scrollProgress } from "@/webgl/scrollProgress";

/** How far each half of the name travels outwards, in % of its own width. */
const WORD_SPREAD_PERCENT = 60;

/**
 * Sticky stage of the hero. While the tall section scrolls by, the name splits
 * apart and fades while the WebGL monogram grows to the center. In flow,
 * without any motion, under reduced motion.
 */
export function HeroMotion({ children }: { children: ReactNode }) {
  const stage = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const words = gsap.utils.toArray<HTMLElement>("[data-hero-word]");
        const half = (words.length - 1) / 2;
        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: stage.current?.parentElement,
              start: "top top",
              end: "bottom bottom",
              scrub: true,
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
    },
    { scope: stage },
  );

  return (
    <div
      ref={stage}
      className="flex min-h-dvh flex-col overflow-hidden p-2 md:p-4 pinned:sticky pinned:top-0 pinned:h-dvh"
    >
      {children}
    </div>
  );
}
