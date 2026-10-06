"use client";

import type { ReactNode } from "react";
import { claimOrb, placeOrb } from "@/components/scroll/orbDirector";
import { useScrollMotion } from "@/components/scroll/useScrollMotion";
import { findPin, gsap, pinnedScrub, ScrollTrigger } from "@/lib/gsap";

/** Center of the rings in their viewBox, and the orb's radius as a share of the drawn rings' width. */
const RINGS_CENTER = "500 500";
const ORB_SHARE = 0.12;
/** Turns of the outermost ring over the pin; each inner ring turns the other way, a little faster. */
const RING_TURN_DEGREES = 90;
const RING_TURN_STEP = 30;
/** Timeline units (the pin is 1): the rings open around the orb, then widen and fade as the pin releases. */
const RINGS_IN = 0.2;
const RINGS_OUT = 0.2;

/**
 * Rings of text turning around the orb, in the middle of the screen: they open
 * from a smaller size, spin in alternate directions and widen out of view.
 */
function turnRings(pin: Element, svg: SVGSVGElement): () => void {
  const rings = gsap.utils.toArray<SVGGElement>("[data-infos-ring]", svg);
  const timeline = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: pinnedScrub(pin) });
  timeline.fromTo(
    svg,
    { scale: 0.6, autoAlpha: 0 },
    { scale: 1, autoAlpha: 1, duration: RINGS_IN, ease: "power2.out" },
    0,
  );
  rings.forEach((ring, index) => {
    const direction = index % 2 === 0 ? 1 : -1;
    timeline.fromTo(
      ring,
      { rotation: 0 },
      {
        rotation: direction * (RING_TURN_DEGREES + index * RING_TURN_STEP),
        svgOrigin: RINGS_CENTER,
        duration: 1,
      },
      0,
    );
  });
  timeline.to(
    svg,
    { scale: 1.4, autoAlpha: 0, duration: RINGS_OUT, ease: "power2.in" },
    1 - RINGS_OUT,
  );

  // The orb sits in the middle of the rings, growing with them but not widening out with them.
  return claimOrb({ trigger: pin, start: "top center" }, (orb) => {
    const box = svg.getBoundingClientRect();
    const scale = Math.min(Number(gsap.getProperty(svg, "scale")), 1);
    placeOrb(
      orb,
      box.left + box.width / 2,
      box.top + box.height / 2,
      svg.clientWidth * ORB_SHARE * scale,
    );
  });
}

/**
 * Infos choreography: the rings scene, then the bento tiles rise into view one
 * after the other. Static without motion, and without the rings.
 */
export function InfosMotion({ children }: { children: ReactNode }) {
  const root = useScrollMotion((element) => {
    const pin = findPin(element);
    const svg = element.querySelector<SVGSVGElement>("[data-infos-rings]");
    const releaseOrb = pin && svg ? turnRings(pin, svg) : undefined;

    const tiles = gsap.utils.toArray<HTMLElement>("[data-infos-grid] > *");
    gsap.set(tiles, { y: 40, opacity: 0 });
    ScrollTrigger.batch(tiles, {
      start: "top 90%",
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out", stagger: 0.1 }),
    });
    return releaseOrb;
  });

  return <div ref={root}>{children}</div>;
}
