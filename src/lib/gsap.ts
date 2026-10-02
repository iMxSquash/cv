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

/** Scrubs a timeline over the whole pin of a PinnedStage (`[data-pin]`). */
export function pinnedScrub(trigger: Element): ScrollTrigger.Vars {
  return { trigger, start: "top top", end: "bottom bottom", scrub: true };
}

export { gsap, ScrollTrigger, useGSAP };
