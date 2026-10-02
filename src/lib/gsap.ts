"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);
// Mobile browsers resize the viewport when the address bar slides: refreshing
// on every such resize would make pinned sections jump.
ScrollTrigger.config({ ignoreMobileResize: true });

/** Media query of every scroll animation; the CSS `pinned:` variant mirrors it. */
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

/** The tall wrapper of the PinnedStage inside `root`, if any. */
export function findPin(root: Element): HTMLElement | null {
  return root.querySelector<HTMLElement>("[data-pin]");
}

/** Scrubs a timeline over the whole pin of a PinnedStage (see `findPin`). */
export function pinnedScrub(trigger: Element): ScrollTrigger.Vars {
  return { trigger, start: "top top", end: "bottom bottom", scrub: true };
}

export { gsap, ScrollTrigger, useGSAP };
