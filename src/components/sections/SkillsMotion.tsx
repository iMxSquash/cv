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
import { LOGO_CONTENT_SHARE } from "@/webgl/logoField";
import { scrollProgress } from "@/webgl/scrollProgress";
import { WHEEL_STEP_DEG } from "./skillsWheel";

/** Opacity lost per step away from the center line: the wheel fades out beyond ~3 steps. */
const FADE_PER_STEP = 0.3;
/** Extra scale of the item on the center line. */
const FOCUS_ZOOM = 0.2;
/** Share of the orb's diameter a logo spans once the orb has taken its shape. */
const LOGO_FIT = 0.9;
/** One morph of the orb, from its shape to the next (a logo, or the round orb for an item without one). */
const MORPH = { duration: 0.8, ease: "power2.inOut" };
/**
 * Ratchet: every `scrollPerStep` px scrolled is one click (a new gesture, after `idleMs` of stillness or a
 * change of direction, clicks at once), the wheel catching up with the last click in `duration` s.
 */
const RATCHET = { scrollPerStep: 250, idleMs: 150, duration: 0.25, ease: "power3.out" };
/** Pixels in a wheel "line" (Firefox reports lines). */
const LINE_PX = 16;
/** Viewport heights before the pin from which the ratchet is in charge: the first click leads to the first step. */
const ENTRY_SCREENS = 0.1;
/** Scroll (px) past either end of the wheel from which the orb gets its round shape back. */
const RELEASE_PX = 40;
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
    let morph: gsap.core.Tween | null = null;
    // Undefined when no shape is waiting for the running morph to end.
    let queued: HTMLImageElement | null | undefined;

    const logoOf = (step: number) => {
      const url = items[step].dataset.logoUrl;
      const image = url ? images.get(url) : undefined;
      return image?.complete && image.naturalWidth > 0 ? image : null;
    };

    // A morph is never interrupted: the orb goes on from its shape to the last one asked for, shape to shape.
    const runQueuedMorph = () => {
      if (queued === undefined) return;
      const next = queued;
      queued = undefined;
      if (next === logo.to) return;
      logo.from = logo.to;
      logo.to = next;
      logo.mix = 0;
      morph = gsap.to(logo, {
        mix: 1,
        duration: MORPH.duration,
        ease: MORPH.ease,
        onComplete: () => {
          morph = null;
          // At rest only one shape is left; none at all hands the orb back to the plain metaball field.
          logo.from = logo.to;
          runQueuedMorph();
        },
      });
    };
    // The orb belongs to this section only while it is on screen: elsewhere it is posed by the other sections, and
    // a logo state left on it would draw their shapes as the one circle of the logo's box.
    let isEngaged = false;
    const morphTo = (image: HTMLImageElement | null) => {
      queued = image;
      if (!morph) runQueuedMorph();
    };
    /** The orb takes the logo of `step`, or its round shape while the section is off screen. */
    const showLogo = (step: number) => morphTo(isEngaged ? logoOf(step) : null);
    /** Leaving upward, the sections above pose the orb at once: no time to morph back. */
    const resetOrb = () => {
      isEngaged = false;
      morph?.kill();
      morph = null;
      queued = undefined;
      logo.from = null;
      logo.to = null;
      logo.mix = 0;
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

    // Just past either end of the wheel, the orb takes its round shape back; coming back, the logo in front.
    const engage = (isOn: boolean) => {
      isEngaged = isOn;
      showLogo(shown);
    };
    const release = ScrollTrigger.create({
      start: () => trigger.start - RELEASE_PX,
      end: () => trigger.end + RELEASE_PX,
      onEnter: () => engage(true),
      onEnterBack: () => engage(true),
      onLeave: () => engage(false),
      onLeaveBack: resetOrb,
    });
    if (release.isActive) engage(true);

    // Capture phase on the window: ahead of Lenis's own wheel listener.
    window.addEventListener("wheel", onWheel, { capture: true, passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });

    const stopOrb = claimOrb({ trigger: pin, start: "top center" }, (orb) => {
      const box = measureAnchor(blob);
      holdOrbOnScreen(orb, box.x, box.y, box.radius);
      // The logo's field is drawn in a square around the orb, sized so that the logo spans `LOGO_FIT` of it.
      logo.x = box.x;
      logo.y = box.y;
      logo.halfSize = (box.radius * LOGO_FIT) / LOGO_CONTENT_SHARE;
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
      release.kill();
      trigger.kill();
      resetOrb();
      gsap.set(wheel, { clearProps: "transform" });
    };
  }, MOTION_OK_WIDE);

  return (
    <div ref={narrowRoot}>
      <div ref={root}>{children}</div>
    </div>
  );
}
