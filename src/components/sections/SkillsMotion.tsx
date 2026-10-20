"use client";

import type { ReactNode } from "react";
import {
  claimOrb,
  holdOrbOnScreen,
  measureAnchor,
  placeOrbOnAnchor,
} from "@/components/scroll/orbDirector";
import { useScrollMotion } from "@/components/scroll/useScrollMotion";
import { getLenis } from "@/components/scroll/lenisInstance";
import { findPin, gsap, MOTION_OK_NARROW, MOTION_OK_WIDE, ScrollTrigger } from "@/lib/gsap";
import { scrollProgress } from "@/webgl/scrollProgress";
import { WHEEL_STEP_DEG } from "./skillsWheel";

/** Opacity lost per step away from the center line: the wheel fades out beyond ~3 steps. */
const FADE_PER_STEP = 0.3;
/** Extra scale of the item on the center line. */
const FOCUS_ZOOM = 0.2;
/** The orb relaxes to its round shape (seconds per unit of morph), then takes the next logo. */
const MORPH = { release: 0.25, take: 0.7 };
/**
 * Ratchet: every `scrollPerStep` px scrolled is one click (a new gesture, after `idleMs` of stillness or a
 * change of direction, clicks at once), the wheel catching up with the last click in `duration` s.
 */
const RATCHET = { scrollPerStep: 250, idleMs: 150, duration: 0.25, ease: "power3.out" };
/** Pixels in a wheel "line" (Firefox reports lines). */
const LINE_PX = 16;
/** Viewport heights before the pin from which the ratchet is in charge: the first click leads to the first step. */
const ENTRY_SCREENS = 0.1;
/** A touch swipe longer than this (px) is a gesture. */
const SWIPE_PX = 40;
/** Under this distance, in steps, from a step the page counts as resting on it. */
const AT_STEP = 0.02;
/** Delay (ms) after which a page left between two steps (scrollbar, drag) is pulled onto the nearest one. */
const STRAY_MS = 150;
/** Keys that click the wheel, and the direction of each (Space goes back with Shift). */
const KEY_DIRECTIONS: Partial<Record<string, 1 | -1>> = {
  ArrowDown: 1,
  PageDown: 1,
  ArrowUp: -1,
  PageUp: -1,
};

/** Turns the wheel to a (fractional) step and lights up the items near the center line. */
function turnWheel(wheel: HTMLElement, items: HTMLElement[], position: number): void {
  gsap.set(wheel, { rotation: -position * WHEEL_STEP_DEG });
  items.forEach((item, index) => {
    const gap = Math.abs(index - position);
    item.style.setProperty("--visible", String(Math.max(0, 1 - (gap - 1) * FADE_PER_STEP)));
    item.style.setProperty("--zoom", String(1 + FOCUS_ZOOM * Math.max(0, 1 - gap)));
  });
}

/** Loads every logo up front (same-origin or CORS-enabled, so WebGL may read it). */
function preloadLogos(items: HTMLElement[], onLoad: () => void): Map<string, HTMLImageElement> {
  const images = new Map<string, HTMLImageElement>();
  items.forEach((item) => {
    const url = item.dataset.logoUrl;
    if (!url || images.has(url)) return;
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.addEventListener("load", onLoad);
    image.src = url;
    images.set(url, image);
  });
  return images;
}

/**
 * Skills choreography (from 900 px wide): every skill and tool sits on one
 * wheel that clicks as the page is scrolled (a click per `scrollPerStep` px, or
 * per key or swipe), the page scrolling to each step. The still orb facing it
 * melts into the logo of the item on the center line. Smaller screens keep the
 * grid, reduced motion keeps the grid alone.
 */
export function SkillsMotion({ children }: { children: ReactNode }) {
  const narrowRoot = useScrollMotion((element) => {
    const pin = findPin(element);
    const anchor = element.querySelector("#skills-title [data-orb-anchor]");
    if (!pin || !anchor) return;
    return claimOrb({ trigger: pin, start: "top center" }, (orb) => placeOrbOnAnchor(orb, anchor));
  }, MOTION_OK_NARROW);

  const root = useScrollMotion((element) => {
    const pin = findPin(element);
    const wheel = element.querySelector<HTMLElement>("[data-skills-wheel]");
    const blob = element.querySelector<HTMLElement>("[data-skills-blob]");
    const items = gsap.utils.toArray<HTMLElement>("[data-wheel-item]", element);
    if (!pin || !wheel || !blob || items.length === 0) return;

    const { logo } = scrollProgress.orb;
    const lastStep = items.length - 1;
    let shown = -1;
    let morph: gsap.core.Timeline | null = null;
    let aspect = 1;

    const showLogo = (step: number) => {
      const url = items[step].dataset.logoUrl;
      const image = url ? images.get(url) : undefined;
      const next = image?.complete && image.naturalWidth > 0 ? image : null;
      morph?.kill();
      morph = gsap.timeline();
      if (logo.mix > 0)
        morph.to(logo, { mix: 0, duration: MORPH.release * logo.mix, ease: "power2.in" });
      morph.call(() => {
        logo.image = next;
        if (next) aspect = next.naturalWidth / next.naturalHeight;
      });
      if (next) morph.to(logo, { mix: 1, duration: MORPH.take, ease: "power3.out" });
    };

    const images = preloadLogos(items, () => {
      if (shown >= 0) showLogo(shown);
    });

    const follow = (position: number) => {
      turnWheel(wheel, items, position);
      const step = Math.round(position);
      if (step === shown) return;
      shown = step;
      showLogo(step);
    };
    follow(0);

    let isMoving = false;
    let strayTimer: number | undefined;
    let target = 0;
    const pull = { scroll: 0 };
    const scrollOfStep = (step: number) =>
      trigger.start + (step / lastStep) * (trigger.end - trigger.start);
    const positionNow = () => trigger.progress * lastStep;
    /** The step the page is on, or null when it sits between two (scrollbar, drag, gliding in). */
    const restingStep = (): number | null => {
      const position = positionNow();
      return Math.abs(position - Math.round(position)) > AT_STEP ? null : Math.round(position);
    };
    // Drops a glide of Lenis still running (from before the pin, or before the ratchet took over).
    const stopGlide = () => getLenis()?.scrollTo(window.scrollY, { immediate: true, force: true });
    /** The ratchet takes over this far before the pin (`ENTRY_SCREENS` of viewport heights), as step -1. */
    const entryStart = () => trigger.start - ENTRY_SCREENS * window.innerHeight;

    /** The page scrolls to `step` (retargeted on every click), the wheel follows the scroll. */
    const stepTo = (step: number) => {
      target = Math.min(lastStep, Math.max(0, step));
      isMoving = true;
      stopGlide();
      pull.scroll = window.scrollY;
      gsap.to(pull, {
        scroll: scrollOfStep(target),
        duration: RATCHET.duration,
        ease: RATCHET.ease,
        overwrite: true,
        onUpdate: () => window.scrollTo(0, pull.scroll),
        onComplete: () => {
          isMoving = false;
        },
      });
    };

    /**
     * The step the page rests on (or is heading to): -1 in the entry zone before the pin, where a click
     * leads to the first step. Null when it is not the ratchet's turn: out of the pin, or gliding in.
     */
    const currentStep = (): number | null => {
      const scroll = window.scrollY;
      if (scroll < entryStart() || scroll > trigger.end + 1) return null;
      if (isMoving) return target;
      if (scroll < trigger.start - 1) return -1;
      return restingStep();
    };
    const isEdge = (step: number, direction: number) =>
      (direction < 0 && step <= 0) || (direction > 0 && step === lastStep);

    const gesture = { direction: 0, time: 0, scrolled: 0, isLeaving: false, isWaiting: false };
    /** Starts (or, from the entry zone, resumes) a gesture: the first event clicks at once. */
    const arm = (direction: number) => {
      const step = currentStep();
      gesture.direction = direction;
      gesture.scrolled = direction * (RATCHET.scrollPerStep - 1);
      // A gesture that starts on an edge, outward, belongs to the page for its whole length.
      gesture.isLeaving = step === null || isEdge(step, direction);
      gesture.isWaiting = step === null;
    };
    const onWheel = (event: WheelEvent) => {
      const direction = Math.sign(event.deltaY);
      if (event.ctrlKey || direction === 0) return;
      const now = performance.now();
      const isNew = now - gesture.time > RATCHET.idleMs || direction !== gesture.direction;
      gesture.time = now;
      // A gesture that started far away takes over as soon as it reaches the entry zone.
      if (isNew || (gesture.isWaiting && currentStep() !== null)) arm(direction);
      if (gesture.isLeaving) return;
      // Lenis never sees these events: nothing scrolls on its own.
      event.preventDefault();
      event.stopImmediatePropagation();
      gesture.scrolled += event.deltaMode === 1 ? event.deltaY * LINE_PX : event.deltaY;
      const clicks = Math.trunc(gesture.scrolled / RATCHET.scrollPerStep);
      if (clicks === 0) return;
      gesture.scrolled -= clicks * RATCHET.scrollPerStep;
      const step = currentStep();
      if (step === null) return;
      // Pushing one more click against an edge hands the rest of the gesture to the page: a gesture that
      // runs on past the edge (repeated swipes merge into one) would otherwise never get out.
      if (isEdge(step, direction)) {
        gesture.isLeaving = true;
        return;
      }
      stepTo(step + clicks);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const direction =
        KEY_DIRECTIONS[event.key] ?? (event.key === " " ? (event.shiftKey ? -1 : 1) : 0);
      const isField =
        event.target instanceof HTMLElement &&
        event.target.closest("input, textarea, select, button, a, [contenteditable]");
      if (direction === 0 || isField) return;
      const step = currentStep();
      if (step === null || isEdge(step, direction)) return;
      event.preventDefault();
      stepTo(step + direction);
    };

    let swipeStart: number | null = null;
    const onTouchStart = (event: TouchEvent) => {
      swipeStart = event.touches[0].clientY;
    };
    const onTouchMove = (event: TouchEvent) => {
      if (swipeStart === null) return;
      const distance = swipeStart - event.touches[0].clientY;
      const direction = Math.sign(distance);
      const step = currentStep();
      if (step === null || isEdge(step, direction)) return;
      event.preventDefault();
      if (Math.abs(distance) < SWIPE_PX || isMoving) return;
      swipeStart = null;
      stepTo(step + direction);
    };

    // Native scroll for the length of the pin: Lenis's glide is lag.
    const setNativeScroll = (isOn: boolean) => {
      const lenis = getLenis();
      if (!lenis) return;
      lenis.options.smoothWheel = !isOn;
      if (isOn) stopGlide();
    };

    const trigger = ScrollTrigger.create({
      trigger: pin,
      start: "top top",
      end: "bottom bottom",
      onToggle: (self) => setNativeScroll(self.isActive),
      onUpdate: (self) => {
        follow(self.progress * lastStep);
        // A page left between two steps (scrollbar, drag) is pulled onto the nearest one.
        window.clearTimeout(strayTimer);
        strayTimer = window.setTimeout(() => {
          if (!isMoving && restingStep() === null) stepTo(Math.round(positionNow()));
        }, STRAY_MS);
      },
    });
    setNativeScroll(trigger.isActive);
    // Capture phase on the window: ahead of Lenis's own wheel listener.
    window.addEventListener("wheel", onWheel, { capture: true, passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });

    const stopOrb = claimOrb({ trigger: pin, start: "top center" }, (orb) => {
      const box = measureAnchor(blob);
      holdOrbOnScreen(orb, box.x, box.y, box.radius);
      // The logo is drawn in the blob's box, fitted by its aspect ratio.
      logo.x = box.x;
      logo.y = box.y;
      logo.halfWidth = aspect >= 1 ? box.radius : box.radius * aspect;
      logo.halfHeight = aspect >= 1 ? box.radius / aspect : box.radius;
    });

    return () => {
      stopOrb();
      setNativeScroll(false);
      window.clearTimeout(strayTimer);
      gsap.killTweensOf(pull);
      window.removeEventListener("wheel", onWheel, { capture: true });
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      trigger.kill();
      morph?.kill();
      gsap.killTweensOf(logo);
      logo.image = null;
      logo.mix = 0;
      gsap.set(wheel, { clearProps: "transform" });
    };
  }, MOTION_OK_WIDE);

  return (
    <div ref={narrowRoot}>
      <div ref={root}>{children}</div>
    </div>
  );
}
