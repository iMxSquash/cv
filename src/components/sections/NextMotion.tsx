"use client";

import type { ReactNode } from "react";
import { useScrollMotion } from "@/components/scroll/useScrollMotion";
import { findPin, gsap, pinnedScrub, ScrollTrigger } from "@/lib/gsap";
import { scrollProgress } from "@/webgl/scrollProgress";

/** Gap between the end of the sentence and the orb trailing it, in viewBox units. */
const ORB_GAP = 50;

/**
 * Closing choreography: the title advances along a curve until it settles in
 * the middle, the WebGL orb trailing it like a full stop. Without motion the title stays a plain
 * heading and there is no orb.
 */
export function NextMotion({ children }: { children: ReactNode }) {
  const root = useScrollMotion((element) => {
    const pin = findPin(element);
    const svg = element.querySelector<SVGSVGElement>("[data-next-curve]");
    const path = svg?.querySelector("path");
    const text = svg?.querySelector("text");
    const textPath = text?.querySelector("textPath");
    if (!pin || !svg || !path || !text || !textPath) return;

    const length = path.getTotalLength();
    const offset = { value: length };
    // Measured with the font loaded, on every refresh (see the tween below).
    let textLength = 0;
    let writtenOffset = Number.NaN;
    const curvePoint = new DOMPoint();
    const { orb } = scrollProgress;
    // Reads layout first, then writes (and only on change): one layout per frame at most.
    const place = () => {
      const point = path.getPointAtLength(Math.min(offset.value + textLength + ORB_GAP, length));
      curvePoint.x = point.x;
      curvePoint.y = point.y;
      const screen = curvePoint.matrixTransform(svg.getScreenCTM() ?? undefined);
      orb.x = (screen.x / window.innerWidth) * 2 - 1;
      orb.y = 1 - (screen.y / window.innerHeight) * 2;
      if (offset.value === writtenOffset) return;
      writtenOffset = offset.value;
      textPath.setAttribute("startOffset", String(offset.value));
    };

    // From beyond the end of the curve until the sentence is centered on it.
    gsap.fromTo(
      offset,
      { value: length },
      {
        value: () => {
          textLength = text.getComputedTextLength();
          return (length - textLength) / 2;
        },
        ease: "none",
        scrollTrigger: { ...pinnedScrub(pin), invalidateOnRefresh: true },
      },
    );
    // Created after the tween's trigger, so it places everything with the updated offset.
    ScrollTrigger.create({
      trigger: pin,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => {
        orb.isVisible = self.isActive;
      },
      onUpdate: place,
    });
    return () => {
      orb.isVisible = false;
    };
  });

  return <div ref={root}>{children}</div>;
}
