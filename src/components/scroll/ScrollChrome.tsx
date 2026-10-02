"use client";

import { useState } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { CapsuleNav } from "./CapsuleNav";
import { NAV_SECTIONS, type SectionTheme } from "./sections";
import { SectionNav } from "./SectionNav";

interface ActiveSection {
  index: number;
  theme: SectionTheme;
}

/**
 * Fixed interface laid over the sections: tracks the section crossing the
 * middle of the viewport, so the navs highlight it and inherit its theme.
 */
export function ScrollChrome({ name }: { name: string }) {
  const [active, setActive] = useState<ActiveSection>({ index: 0, theme: "light" });

  useGSAP(() => {
    NAV_SECTIONS.forEach(({ id }, index) => {
      const section = document.getElementById(id);
      if (!section) return;
      ScrollTrigger.create({
        trigger: section,
        start: "top center",
        end: "bottom center",
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
    <div data-theme={active.theme} className="contents">
      <CapsuleNav name={name} />
      <SectionNav activeIndex={active.index} />
    </div>
  );
}
