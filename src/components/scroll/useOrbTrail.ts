"use client";

import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";
import { claimOrb, placeOrbOnAnchor } from "./orbDirector";

/**
 * The orb lands on every followed OrbAnchor in turn, as the full stop of its
 * heading. An anchor on a pinned stage claims the orb when its pin reaches the
 * middle of the viewport, any other one as it rises past three quarters of it.
 */
export function useOrbTrail(): void {
  useGSAP(() => {
    gsap.matchMedia().add(MOTION_OK, () => {
      const releases = gsap.utils
        .toArray<HTMLElement>("[data-orb-anchor][data-orb-follow]")
        .map((anchor) => {
          const pin = anchor.closest("[data-pin]");
          return claimOrb(
            { trigger: pin ?? anchor, start: pin ? "top center" : "top 75%" },
            (orb) => placeOrbOnAnchor(orb, anchor),
          );
        });
      return () => releases.forEach((release) => release());
    });
  });
}
