"use client";

import { useRef } from "react";
import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { Experience } from "@/webgl/Experience";

/**
 * The page's single WebGL canvas, fixed behind the content. Purely decorative:
 * without WebGL 2 (or after a context loss) the hero keeps its CSS gradient.
 */
export default function WebGLCanvas() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const element = container.current;
    if (!element) return;
    const root = document.documentElement;

    // Recreated when the motion preference changes: animated loop or single frames.
    const mm = gsap.matchMedia();
    const conditions = {
      isStatic: "(prefers-reduced-motion: reduce)",
      isAnimated: MOTION_OK,
    };
    mm.add(conditions, (context) => {
      let experience: Experience | null = null;
      const teardown = () => {
        experience?.dispose();
        experience = null;
        root.removeAttribute("data-webgl");
      };
      try {
        experience = new Experience(element, {
          isStatic: Boolean(context.conditions?.isStatic),
          // Matched by the `in-data-[webgl=ready]:` classes: CSS fallbacks hide, the canvas fades in.
          onReady: () => root.setAttribute("data-webgl", "ready"),
          onContextLost: teardown,
        });
      } catch (error) {
        console.warn("[webgl] WebGL 2 unavailable, keeping the CSS fallback", error);
        return;
      }
      ScrollTrigger.create({
        trigger: "#hero",
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => experience?.setActive(self.isActive),
      });
      return teardown;
    });
  });

  return (
    <div
      ref={container}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 size-full opacity-0 transition-opacity duration-700 in-data-[webgl=ready]:opacity-100"
    />
  );
}
