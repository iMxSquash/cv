"use client";

import { type ReactNode, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/** Only where hovering exists and motion is welcome: no effect on touch screens or under reduced motion. */
const MAGNETIC_MEDIA =
  "(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)";
/** Share of the pointer's offset from the center that the child follows. */
const PULL = 0.08;

/**
 * Magnetic hover: the child leans towards the pointer while it is over the
 * (slightly larger) area, then springs back. The area, not the child, receives
 * the pointer, so the child never runs away from it.
 */
export function Magnetic({ children }: { children: ReactNode }) {
  const area = useRef<HTMLSpanElement>(null);
  const content = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      gsap.matchMedia().add(MAGNETIC_MEDIA, () => {
        const areaElement = area.current;
        const contentElement = content.current;
        if (!areaElement || !contentElement) return;

        let moveX: (value: number) => void;
        let moveY: (value: number) => void;

        const onEnter = () => {
          gsap.killTweensOf(contentElement);
          const options = { duration: 0.4, ease: "power3" };
          moveX = gsap.quickTo(contentElement, "x", options);
          moveY = gsap.quickTo(contentElement, "y", options);
        };
        const onMove = (event: PointerEvent) => {
          const box = areaElement.getBoundingClientRect();
          moveX((event.clientX - (box.left + box.width / 2)) * PULL);
          moveY((event.clientY - (box.top + box.height / 2)) * PULL);
        };
        const onLeave = () => {
          gsap.to(contentElement, {
            x: 0,
            y: 0,
            duration: 0.7,
            ease: "elastic.out(1, 0.8)",
            overwrite: true,
          });
        };

        areaElement.addEventListener("pointerenter", onEnter);
        areaElement.addEventListener("pointermove", onMove);
        areaElement.addEventListener("pointerleave", onLeave);
        return () => {
          areaElement.removeEventListener("pointerenter", onEnter);
          areaElement.removeEventListener("pointermove", onMove);
          areaElement.removeEventListener("pointerleave", onLeave);
          gsap.set(contentElement, { clearProps: "transform" });
        };
      });
    },
    { scope: area },
  );

  return (
    <span ref={area} className="-m-3 inline-flex p-3">
      <span ref={content} className="inline-flex">
        {children}
      </span>
    </span>
  );
}
