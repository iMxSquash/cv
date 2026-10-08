"use client";

import type { ReactNode } from "react";
import {
  claimOrb,
  placeOrb,
  restingOrbRadius,
  setShape,
  splitRadius,
} from "@/components/scroll/orbDirector";
import { useScrollMotion } from "@/components/scroll/useScrollMotion";
import { findPin, gsap, pinnedScrub, ScrollTrigger } from "@/lib/gsap";
import type { BlobShape } from "@/webgl/scrollProgress";
import { ORB_LANE } from "./orbLane";

/** Timeline units: a step fades in, holds, then fades out. */
const STEP = { in: 1, hold: 1, out: 1 };
/** Timeline units before the first step: the orb stretches into the side panels (or, without WebGL, they slide in). */
const FORM = 2.5;
/**
 * Within FORM (0..1): the orb glides to the middle of the screen, widens into
 * one full-width bar there, then the bar splits into the two panels.
 */
const CENTER_END = 0.25;
const BAR_END = 0.55;
/** How far off screen the side panels wait, in % of their width. */
const VISUAL_OFFSET_PERCENT = 150;
/** Vertical drift of the side panels once formed, in % of their height: they start level and centered, then part ways. */
const VISUAL_DRIFT_PERCENT = 30;

/**
 * The panels are centered by `top-1/2` and a -50% translation, which GSAP owns
 * once it animates them (it resets the CSS `translate` property): the drift is
 * offset from it.
 */
const CENTERED_PERCENT = -50;

/** Side panels: index 0 (left) moves outwards to the left and drifts up, the right one mirrors it (down). */
const mirrored = (value: number) => (index: number) => (index === 0 ? -value : value);

const formEase = gsap.parseEase("power2.inOut");

const between = (value: number, [from, to]: readonly [number, number]) =>
  gsap.utils.clamp(0, 1, gsap.utils.normalize(from, to, value));

const lerpBox = (from: BlobShape, to: BlobShape, progress: number): BlobShape => {
  const { interpolate } = gsap.utils;
  return {
    x: interpolate(from.x, to.x, progress),
    y: interpolate(from.y, to.y, progress),
    halfWidth: interpolate(from.halfWidth, to.halfWidth, progress),
    halfHeight: interpolate(from.halfHeight, to.halfHeight, progress),
    corner: interpolate(from.corner, to.corner, progress),
  };
};

const applyBox = (shape: BlobShape, box: BlobShape) =>
  setShape(shape, box.x, box.y, box.halfWidth, box.halfHeight, box.corner);

/** The journey steps follow one another while the side panels slide in, drift and slide out. */
function animateJourney(pin: Element, visuals: HTMLElement[]): gsap.core.Timeline {
  const steps = gsap.utils.toArray<HTMLElement>("[data-trajectory-step]");
  const stepLength = STEP.in + STEP.hold + STEP.out;
  const journeyEnd = FORM + steps.length * stepLength;
  const offscreen = mirrored(VISUAL_OFFSET_PERCENT);

  const timeline = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: pinnedScrub(pin) });
  timeline
    .fromTo(visuals, { xPercent: offscreen }, { xPercent: 0, duration: FORM }, 0)
    .fromTo(
      visuals,
      { yPercent: CENTERED_PERCENT },
      {
        yPercent: (index: number) => CENTERED_PERCENT + mirrored(VISUAL_DRIFT_PERCENT)(index),
        duration: journeyEnd + STEP.out - FORM,
      },
      FORM,
    )
    .to(visuals, { xPercent: offscreen, duration: STEP.out }, journeyEnd);
  steps.forEach((step, index) => {
    const start = FORM + index * stepLength;
    timeline
      .fromTo(
        step,
        { yPercent: 40, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: STEP.in },
        start,
      )
      .to(step, { yPercent: -40, autoAlpha: 0, duration: STEP.out }, start + STEP.in + STEP.hold);
  });
  return timeline;
}

/**
 * The orb, arriving at the end of its lane, glides to the middle of the screen
 * and widens there into a full-width bar that
 * splits into the two side panels; then it is the panels, wherever the
 * timeline moves them. While they slide in (CSS fallback), the orb aims at
 * their resting place instead.
 */
function stretchOrbIntoPanels(
  pin: Element,
  timeline: gsap.core.Timeline,
  [left, right]: HTMLElement[],
): () => void {
  let corner = 0;
  ScrollTrigger.create({
    trigger: pin,
    onRefresh: () => {
      corner = parseFloat(getComputedStyle(left).borderTopLeftRadius);
    },
  });

  const panelBox = (panel: HTMLElement, isResting: boolean): BlobShape => {
    const rect = panel.getBoundingClientRect();
    const shift = isResting
      ? (Number(gsap.getProperty(panel, "xPercent")) / 100) * panel.offsetWidth
      : 0;
    return {
      x: rect.left + rect.width / 2 - shift,
      y: rect.top + rect.height / 2,
      halfWidth: rect.width / 2,
      halfHeight: rect.height / 2,
      corner,
    };
  };

  return claimOrb({ trigger: pin, start: "top top" }, (orb) => {
    const form = Math.min(timeline.time() / FORM, 1);
    const isForming = form < 1;
    const leftBox = panelBox(left, isForming);
    const rightBox = panelBox(right, isForming);
    const [first, second, ...others] = orb.shapes;
    if (form >= BAR_END) {
      for (const shape of others) setShape(shape, leftBox.x, leftBox.y, 0, 0, 0);
    }
    if (!isForming) {
      applyBox(first, leftBox);
      applyBox(second, rightBox);
      return;
    }
    const bar: BlobShape = {
      x: (leftBox.x - leftBox.halfWidth + rightBox.x + rightBox.halfWidth) / 2,
      y: window.innerHeight / 2,
      halfWidth: (rightBox.x + rightBox.halfWidth - (leftBox.x - leftBox.halfWidth)) / 2,
      halfHeight: leftBox.halfHeight,
      corner,
    };
    if (form >= BAR_END) {
      const split = formEase(between(form, [BAR_END, 1]));
      applyBox(first, lerpBox(bar, leftBox, split));
      applyBox(second, lerpBox(bar, rightBox, split));
      return;
    }
    const radius = restingOrbRadius();
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    if (form < CENTER_END) {
      const glide = formEase(between(form, [0, CENTER_END]));
      const { interpolate } = gsap.utils;
      placeOrb(
        orb,
        interpolate(ORB_LANE.x * window.innerWidth, centerX, glide),
        interpolate(ORB_LANE.toY * window.innerHeight, centerY, glide),
        radius,
      );
      return;
    }
    // Two stacked circles carry the orb into the bar, the six others melt away into them.
    const widen = formEase(between(form, [CENTER_END, BAR_END]));
    const dropRadius = splitRadius(radius, orb.shapes.length);
    const drop: BlobShape = {
      x: centerX,
      y: centerY,
      halfWidth: dropRadius,
      halfHeight: dropRadius,
      corner: dropRadius,
    };
    const melted: BlobShape = { ...drop, halfWidth: 0, halfHeight: 0, corner: 0 };
    for (const shape of others) applyBox(shape, lerpBox(drop, melted, widen));
    applyBox(first, lerpBox(drop, bar, widen));
    applyBox(second, lerpBox(drop, bar, widen));
  });
}

/**
 * Experiences choreography: the pinned journey, framed by the panels the orb
 * stretches into, then the detail cards rise into view. Without motion the
 * journey is not rendered and the cards are static.
 */
export function ExperienceMotion({ children }: { children: ReactNode }) {
  const root = useScrollMotion((element) => {
    const pin = findPin(element);
    const visuals = gsap.utils.toArray<HTMLElement>("[data-trajectory-visual]");
    let releaseOrb: (() => void) | undefined;
    if (pin) {
      const timeline = animateJourney(pin, visuals);
      if (visuals.length === 2) releaseOrb = stretchOrbIntoPanels(pin, timeline, visuals);
    }

    const cards = gsap.utils.toArray<HTMLElement>("[data-experience-cards] > li");
    gsap.set(cards, { y: 40, opacity: 0 });
    ScrollTrigger.batch(cards, {
      start: "top 90%",
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out", stagger: 0.1 }),
    });
    return releaseOrb;
  });

  return <div ref={root}>{children}</div>;
}
