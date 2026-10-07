"use client";

import { useRef, useState } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { CapsuleNav } from "./CapsuleNav";
import type { Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { NAV_SECTION_IDS, type SectionTheme } from "./sections";
import { SectionNav } from "./SectionNav";
import { useOrbTrail } from "./useOrbTrail";
import { usePageTheme } from "./usePageTheme";

interface ActiveSection {
  index: number;
  theme: SectionTheme;
}

/**
 * Fixed interface laid over the sections: tracks the section crossing the
 * middle of the viewport, so the navs highlight it and inherit its theme, and
 * feeds each section's scroll progress to its bar in the section nav.
 */
export function ScrollChrome({ name, locale }: { name: string; locale: Locale }) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<ActiveSection>({ index: 0, theme: "light" });

  usePageTheme();
  useOrbTrail();

  useGSAP(() => {
    NAV_SECTION_IDS.forEach((id, index) => {
      const section = document.getElementById(id);
      if (!section) return;
      const fill = root.current?.querySelector<HTMLElement>(`[data-section-fill="${id}"]`);
      ScrollTrigger.create({
        trigger: section,
        start: "top center",
        end: "bottom center",
        onUpdate: (self) => fill?.style.setProperty("--progress", String(self.progress)),
        onToggle: (self) => {
          if (!self.isActive) return;
          setActive({ index, theme: section.dataset.theme === "dark" ? "dark" : "light" });
        },
      });
    });
  });

  // `contents`: the wrapper has no box, so the [data-theme] base rule paints
  // nothing; the navs only inherit the theme tokens.
  return (
    <div ref={root} data-theme={active.theme} className="contents">
      <CapsuleNav name={name} locale={locale} />
      <SectionNav activeIndex={active.index} labels={getMessages(locale).nav} />
    </div>
  );
}
