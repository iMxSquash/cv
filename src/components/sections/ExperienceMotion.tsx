"use client";

import type { ReactNode } from "react";
import { useScrollMotion } from "@/components/scroll/useScrollMotion";
import { findPin, gsap, pinnedScrub, ScrollTrigger } from "@/lib/gsap";

/** Timeline units: a step fades in, holds, then fades out. */
const STEP = { in: 1, hold: 1, out: 1 };
/** How far off screen the side panels wait, in % of their width. */
const VISUAL_OFFSET_PERCENT = 150;
/** Vertical drift of the side panels over the whole journey, in % of their height. */
const VISUAL_DRIFT_PERCENT = 30;

/**
 * The panels are centered by `top-1/2` and a -50% translation, which GSAP owns
 * once it animates them (it resets the CSS `translate` property): the drift is
 * offset from it.
 */
const CENTERED_PERCENT = -50;

/** Side panels: index 0 (left) moves outwards to the left and drifts up, the right one mirrors it. */
const mirrored = (value: number) => (index: number) => (index === 0 ? -value : value);

/** The journey steps follow one another while the side panels slide in, drift and slide out. */
function animateJourney(pin: Element): void {
  const steps = gsap.utils.toArray<HTMLElement>("[data-trajectory-step]");
  const visuals = gsap.utils.toArray<HTMLElement>("[data-trajectory-visual]");
  const stepLength = STEP.in + STEP.hold + STEP.out;
  const journeyEnd = STEP.in + steps.length * stepLength;
  const offscreen = mirrored(VISUAL_OFFSET_PERCENT);

  const timeline = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: pinnedScrub(pin) });
  timeline
    .fromTo(visuals, { xPercent: offscreen }, { xPercent: 0, duration: STEP.in }, 0)
    .fromTo(
      visuals,
      { yPercent: (index: number) => CENTERED_PERCENT + mirrored(-VISUAL_DRIFT_PERCENT)(index) },
      {
        yPercent: (index: number) => CENTERED_PERCENT + mirrored(VISUAL_DRIFT_PERCENT)(index),
        duration: journeyEnd + STEP.out,
      },
      0,
    )
    .to(visuals, { xPercent: offscreen, duration: STEP.out }, journeyEnd);
  steps.forEach((step, index) => {
    const start = STEP.in + index * stepLength;
    timeline
      .fromTo(
        step,
        { yPercent: 40, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: STEP.in },
        start,
      )
      .to(step, { yPercent: -40, autoAlpha: 0, duration: STEP.out }, start + STEP.in + STEP.hold);
  });
}

/**
 * Experiences choreography: the pinned journey, then the detail cards rise
 * into view. Without motion the journey is not rendered and the cards are static.
 */
export function ExperienceMotion({ children }: { children: ReactNode }) {
  const root = useScrollMotion((element) => {
    const pin = findPin(element);
    if (pin) animateJourney(pin);

    const cards = gsap.utils.toArray<HTMLElement>("[data-experience-cards] > li");
    gsap.set(cards, { y: 40, opacity: 0 });
    ScrollTrigger.batch(cards, {
      start: "top 90%",
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out", stagger: 0.1 }),
    });
  });

  return <div ref={root}>{children}</div>;
}
