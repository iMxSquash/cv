"use client";

import { type ReactNode, useEffect } from "react";
import { useScrollMotion } from "@/components/scroll/useScrollMotion";
import { gsap } from "@/lib/gsap";

/** Measured at this size, then scaled linearly to the container width. */
const FIT_PROBE_PX = 100;

/**
 * Footer choreography: the content fades up, the glow rises as the footer
 * scrolls in. The giant name is fitted to the width with or without motion.
 */
export function FooterMotion({ children }: { children: ReactNode }) {
  const root = useScrollMotion((el) => {
    gsap.from("[data-footer-content]", {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 85%", once: true },
    });
    gsap.fromTo(
      "[data-footer-glow]",
      { yPercent: 35, opacity: 0.3 },
      {
        yPercent: 0,
        opacity: 1,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom bottom", scrub: true },
      },
    );
  });

  useEffect(() => {
    const container = root.current?.querySelector<HTMLElement>("[data-footer-stage]");
    const name = container?.querySelector<HTMLElement>("[data-footer-name]");
    if (!container || !name) return;

    const fit = () => {
      name.style.fontSize = `${FIT_PROBE_PX}px`;
      const probeWidth = name.getBoundingClientRect().width;
      if (probeWidth === 0) return;
      const { paddingLeft, paddingRight } = getComputedStyle(container);
      const available = container.clientWidth - parseFloat(paddingLeft) - parseFloat(paddingRight);
      name.style.fontSize = `${(available / probeWidth) * FIT_PROBE_PX}px`;
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(container);
    // The probe is only right once the display font is in.
    void document.fonts.ready.then(fit);
    return () => observer.disconnect();
  }, [root]);

  return <div ref={root}>{children}</div>;
}
