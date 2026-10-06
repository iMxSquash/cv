"use client";

import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { NAV_SECTION_IDS } from "./sections";

/** Semantic tokens that differ between the light and dark themes (see globals.css). */
const THEME_TOKENS = [
  "--surface",
  "--surface-raised",
  "--text",
  "--text-muted",
  "--accent-text",
  "--accent-display",
  "--focus-ring",
  "--interface-color",
] as const;

const SCRUB_ATTRIBUTE = "data-theme-scrub";
const TRANSITION_SECONDS = 0.7;

type ThemeColors = Record<(typeof THEME_TOKENS)[number], string>;

/** GSAP interpolates `rgb()` strings in custom properties, not hex ones. */
function toRgb(color: string): string {
  const [red, green, blue] = gsap.utils.splitColor(color.trim());
  return `rgb(${red}, ${green}, ${blue})`;
}

function readThemeColors(section: HTMLElement): ThemeColors {
  const styles = getComputedStyle(section);
  return Object.fromEntries(
    THEME_TOKENS.map((token) => [token, toRgb(styles.getPropertyValue(token))]),
  ) as ThemeColors;
}

/**
 * One page-wide background instead of one painted block per section: when a
 * section crosses the middle of the viewport, the colors of the root morph to
 * its theme, so the surface and the text shift together with no hard edge.
 *
 * Without motion the attribute is never set and every section keeps painting
 * its own theme (see the `data-theme-scrub` rule in globals.css).
 */
export function usePageTheme(): void {
  useGSAP(() => {
    gsap.matchMedia().add(MOTION_OK, () => {
      const root = document.documentElement;
      const sections = NAV_SECTION_IDS.flatMap((id) => {
        const section = document.getElementById(id);
        return section ? [section] : [];
      });
      // Resolved from the sections themselves, before the attribute hands the tokens over to the root.
      const colors = sections.map(readThemeColors);

      root.setAttribute(SCRUB_ATTRIBUTE, "");
      let isFirstToggle = true;

      sections.forEach((section, index) => {
        ScrollTrigger.create({
          trigger: section,
          start: "top center",
          end: "bottom center",
          onToggle: (self) => {
            if (!self.isActive) return;
            gsap.to(root, {
              ...colors[index],
              duration: isFirstToggle ? 0 : TRANSITION_SECONDS,
              ease: "power2.inOut",
              overwrite: "auto",
            });
            isFirstToggle = false;
          },
        });
      });

      return () => {
        root.removeAttribute(SCRUB_ATTRIBUTE);
        gsap.set(root, { clearProps: THEME_TOKENS.join(",") });
      };
    });
  });
}
