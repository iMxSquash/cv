"use client";

import type { ReactNode } from "react";
import { useScrollMotion } from "@/components/scroll/useScrollMotion";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/** The bento tiles rise into view one after the other; static without motion. */
export function InfosMotion({ children }: { children: ReactNode }) {
  const root = useScrollMotion(() => {
    const tiles = gsap.utils.toArray<HTMLElement>("[data-infos-grid] > *");
    gsap.set(tiles, { y: 40, opacity: 0 });
    ScrollTrigger.batch(tiles, {
      start: "top 90%",
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out", stagger: 0.1 }),
    });
  });

  return <div ref={root}>{children}</div>;
}
