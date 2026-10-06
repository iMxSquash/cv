"use client";

import type { ReactNode } from "react";
import { claimOrb, placeOrb, restingOrbRadius } from "@/components/scroll/orbDirector";
import { useScrollMotion } from "@/components/scroll/useScrollMotion";
import { findPin, gsap, pinnedScrub, ScrollTrigger } from "@/lib/gsap";
import { HERO_COLLAPSE, scrollProgress } from "@/webgl/scrollProgress";

/** How far each half of the name travels outwards, in % of its own width. */
const WORD_SPREAD_PERCENT = 60;

/** The frame shrinks to this scale over the pin, leaving the page surface around it. */
const FRAME_END_SCALE = 0.92;

/**
 * Hero choreography. While the pinned stage scrolls by, the name splits
 * apart and fades while the frame shrinks and the WebGL monogram grows to the
 * center, then collapses into the orb that will travel down the page. In flow,
 * without any motion, under reduced motion.
 */
export function HeroMotion({ children }: { children: ReactNode }) {
  const root = useScrollMotion((element) => {
    const pin = findPin(element);
    const frame = element.querySelector<HTMLElement>("[data-hero-frame]");
    if (!pin || !frame) return;
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
      .to(frame, { scale: FRAME_END_SCALE, duration: 1 }, 0)
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
      // Holds the orb alone on screen until the pin releases.
      .set({}, {}, 1);

    // The gradient only paints the frame. Created after the timeline: it reads the frame once scaled.
    const measureFrame = () => {
      const box = frame.getBoundingClientRect();
      const scale = frame.offsetWidth > 0 ? box.width / frame.offsetWidth : 1;
      scrollProgress.heroFrame = {
        left: box.left,
        top: box.top,
        right: box.right,
        bottom: box.bottom,
        radius: parseFloat(getComputedStyle(frame).borderTopLeftRadius) * scale,
      };
    };
    ScrollTrigger.create({
      trigger: element,
      start: "top bottom",
      end: "bottom top",
      onRefresh: measureFrame,
      onUpdate: measureFrame,
    });

    // The orb grows at the center while the monogram shrinks into it, then floats there until the next section takes it.
    const releaseOrb = claimOrb({ trigger: pin, start: "top top" }, (orb) => {
      const growth = gsap.utils.clamp(
        0,
        1,
        gsap.utils.normalize(HERO_COLLAPSE.from, HERO_COLLAPSE.to, scrollProgress.hero),
      );
      orb.isVisible = growth > 0;
      // Smoothstep, the monogram's own easing.
      const size = growth * growth * (3 - 2 * growth);
      // In step with the monogram while it collapses.
      orb.isLocked = scrollProgress.hero < 1;
      placeOrb(orb, window.innerWidth / 2, window.innerHeight / 2, size * restingOrbRadius());
    });

    return () => {
      releaseOrb();
      scrollProgress.hero = 0;
      scrollProgress.heroFrame = null;
    };
  });

  return <div ref={root}>{children}</div>;
}
