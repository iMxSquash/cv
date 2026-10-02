"use client";

import type { ReactNode } from "react";
import { useScrollMotion } from "@/components/scroll/useScrollMotion";
import { findPin, gsap, MOTION_OK_WIDE, pinnedScrub } from "@/lib/gsap";

/** Timeline units per card: it flips face up, then leaves for the next one. */
const CARD = { flip: 0.4, pause: 0.5, leave: 0.3 };
/** Depth of the 3D flip, in px. */
const PERSPECTIVE = 1200;
/** Cards drawn at once under the top one; deeper cards stay hidden (no layer, no paint) until their turn. */
const VISIBLE_DEPTH = 3;
/** Slight tilt of each card in the deck, in degrees, so the pile reads as a pile. */
const DECK_TILTS = [-3, 2, -1, 3, -2];

/**
 * Skills choreography (from 900 px wide): a face-down deck where each card
 * flips over, then flies off to reveal the next one, while the subtitle follows
 * the group of the card on top. Smaller screens and reduced motion keep the grid.
 */
export function SkillsMotion({ children }: { children: ReactNode }) {
  const root = useScrollMotion((element) => {
    const pin = findPin(element);
    const cards = gsap.utils.toArray<HTMLElement>("[data-skills-card]");
    if (!pin || cards.length === 0) return;
    const subtitles = gsap.utils.toArray<HTMLElement>("[data-skills-subtitle]");
    const subtitleByGroup = new Map(
      subtitles.map((subtitle) => [subtitle.dataset.group, subtitle]),
    );
    const subtitleOf = (card: HTMLElement) => subtitleByGroup.get(card.dataset.group) ?? null;

    gsap.set(cards, {
      rotationY: 180,
      rotation: (index: number) => DECK_TILTS[index % DECK_TILTS.length],
      transformPerspective: PERSPECTIVE,
      // The first card lies on top of the pile.
      zIndex: (index: number) => cards.length - index,
      autoAlpha: (index: number) => (index < VISIBLE_DEPTH ? 1 : 0),
    });
    gsap.set(subtitles, { autoAlpha: 0 });
    gsap.set(subtitleOf(cards[0]), { autoAlpha: 1 });

    const timeline = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: pinnedScrub(pin) });
    const cardLength = CARD.flip + CARD.pause + CARD.leave;
    cards.forEach((card, index) => {
      const start = index * cardLength;
      timeline.to(card, { rotationY: 0, rotation: 0, duration: CARD.flip }, start);
      // The last card stays face up until the pin releases.
      if (index < cards.length - 1) {
        const leave = start + CARD.flip + CARD.pause;
        timeline.to(
          card,
          { xPercent: -130, rotation: -15, autoAlpha: 0, duration: CARD.leave },
          leave,
        );
        const next = cards[index + VISIBLE_DEPTH];
        if (next) timeline.set(next, { autoAlpha: 1 }, leave);
      }
      const previous = cards[index - 1];
      if (previous && previous.dataset.group !== card.dataset.group) {
        timeline
          .to(subtitleOf(previous), { yPercent: -60, autoAlpha: 0, duration: CARD.flip }, start)
          .fromTo(
            subtitleOf(card),
            { yPercent: 60 },
            { yPercent: 0, autoAlpha: 1, duration: CARD.flip },
            start,
          );
      }
    });
  }, MOTION_OK_WIDE);

  return <div ref={root}>{children}</div>;
}
