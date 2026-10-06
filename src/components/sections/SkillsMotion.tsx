"use client";

import type { ReactNode } from "react";
import { claimOrb, holdOrbOnScreen, measureAnchor } from "@/components/scroll/orbDirector";
import { useScrollMotion } from "@/components/scroll/useScrollMotion";
import { findPin, gsap, MOTION_OK, MOTION_OK_WIDE, pinnedScrub, ScrollTrigger } from "@/lib/gsap";
import { scrollProgress } from "@/webgl/scrollProgress";

/** Timeline units per card: it flips face up, then leaves for the next one. */
const CARD = { flip: 0.4, pause: 0.5, leave: 0.3 };
/** Depth of the 3D flip, in px. */
const PERSPECTIVE = 1200;
/** Cards drawn at once under the top one; deeper cards stay hidden (no layer, no paint) until their turn. */
const VISIBLE_DEPTH = 3;
/** Slight tilt of each card in the deck, in degrees, so the pile reads as a pile. */
const DECK_TILTS = [-3, 2, -1, 3, -2];
/** Narrow screens: the deck is a plain grid, the cloud follows the block crossing the middle of the viewport. */
const MOTION_OK_NARROW = `${MOTION_OK} and (max-width: 899px)`;
/** Pin progress between which the orb is burst into the cloud; outside, it is the title's full stop. */
const SPREAD = [0.03, 0.95] as const;

interface Formation {
  /** 1 grid, 2 wave, 3 torus: the order of the skill groups in the page. */
  shape: number;
  isSpread: boolean;
}

/**
 * The orb, full stop of the title, bursts into a cloud of dots that takes the
 * form of the skill group on screen (grid, wave, torus), then gathers back.
 */
function claimSkillsOrb(pin: Element, anchor: Element, formation: () => Formation): () => void {
  return claimOrb({ trigger: pin, start: "top center" }, (orb) => {
    const { shape, isSpread } = formation();
    const stop = measureAnchor(anchor);
    // Burst, the orb shrinks away into its cloud.
    holdOrbOnScreen(orb, stop.x, stop.y, isSpread ? 0 : stop.radius);
    const { particles } = scrollProgress;
    particles.originX = stop.x;
    particles.originY = stop.y;
    particles.shape = shape;
    particles.gather = isSpread ? 0 : 1;
  });
}

/** Formation of each skill group, by its order in the page. */
function shapeOfGroups(element: HTMLElement): Map<string | undefined, number> {
  const blocks = gsap.utils.toArray<HTMLElement>("[data-skills-block]", element);
  return new Map(blocks.map((block, index) => [block.dataset.group, index + 1]));
}

/**
 * Skills choreography (from 900 px wide): a face-down deck where each card
 * flips over, then flies off to reveal the next one, while the subtitle follows
 * the group of the card on top, and so does the orb's cloud of dots. Smaller
 * screens keep the grid, the cloud following the list in the middle of the
 * viewport; reduced motion keeps the grid alone.
 */
export function SkillsMotion({ children }: { children: ReactNode }) {
  const narrowRoot = useScrollMotion((element) => {
    const pin = findPin(element);
    const anchor = element.querySelector("#skills-title [data-orb-anchor]");
    if (!pin || !anchor) return;
    const blocks = gsap.utils.toArray<HTMLElement>("[data-skills-block]", element);
    const shapes = shapeOfGroups(element);
    const lists = ScrollTrigger.create({
      trigger: element.querySelector("[data-skills-deck]") ?? pin,
      start: "top center",
      end: "bottom center",
    });
    return claimSkillsOrb(pin, anchor, () => {
      const middle = window.innerHeight / 2;
      const current = blocks.findLast((block) => block.getBoundingClientRect().top <= middle);
      return {
        shape: shapes.get((current ?? blocks[0])?.dataset.group) ?? 1,
        isSpread: lists.isActive,
      };
    });
  }, MOTION_OK_NARROW);

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

    const anchor = element.querySelector("#skills-title [data-orb-anchor]");
    if (!anchor) return;
    const shapes = shapeOfGroups(element);
    return claimSkillsOrb(pin, anchor, () => {
      const onTop =
        cards[gsap.utils.clamp(0, cards.length - 1, Math.floor(timeline.time() / cardLength))];
      const progress = timeline.scrollTrigger?.progress ?? 0;
      return {
        shape: shapes.get(onTop.dataset.group) ?? 1,
        isSpread: progress > SPREAD[0] && progress < SPREAD[1],
      };
    });
  }, MOTION_OK_WIDE);

  return (
    <div ref={narrowRoot}>
      <div ref={root}>{children}</div>
    </div>
  );
}
