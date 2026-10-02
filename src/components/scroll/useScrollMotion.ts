"use client";

import { type RefObject, useRef } from "react";
import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";

type MotionSetup = (root: HTMLDivElement) => void | (() => void);

/**
 * Runs a section's scroll choreography only when motion is allowed, scoped to
 * the returned ref: selector strings resolve inside it, and every tween and
 * ScrollTrigger is reverted on unmount or when the motion preference changes.
 */
export function useScrollMotion(
  setup: MotionSetup,
  query: string = MOTION_OK,
): RefObject<HTMLDivElement | null> {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      gsap.matchMedia().add(query, () => {
        if (root.current) return setup(root.current);
      });
    },
    { scope: root },
  );
  return root;
}
