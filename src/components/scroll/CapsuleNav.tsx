"use client";

import { useRef } from "react";
import { LocaleSwitch } from "@/components/ui/LocaleSwitch";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import type { Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

/** Below this scroll offset the capsule stays visible whatever the direction. */
const REVEAL_ZONE_PX = 80;

const LINK_CLASS = "inline-flex min-h-11 items-center rounded-full px-4 font-medium";

/** Top pill menu: slides away while scrolling down, comes back on the way up or on keyboard focus. */
export function CapsuleNav({ name, locale }: { name: string; locale: Locale }) {
  const t = getMessages(locale);
  const root = useRef<HTMLElement>(null);

  // Written straight to the DOM: this runs on every scroll frame and must not re-render React.
  useGSAP(() => {
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const isHidden = self.direction === 1 && self.scroll() > REVEAL_ZONE_PX;
        root.current?.toggleAttribute("data-hidden", isHidden);
      },
    });
  });

  return (
    <header
      ref={root}
      className="fixed inset-x-0 top-6 z-40 mx-auto w-fit rounded-full bg-surface/80 p-1 text-(--interface-color) shadow-sm backdrop-blur-md transition-[translate,background-color,color] duration-300 data-hidden:not-focus-within:-translate-y-[calc(100%+1.5rem)]"
    >
      <nav aria-label={t.nav.main} className="flex items-center gap-1">
        <a href="#hero" className={`${LINK_CLASS} font-display`}>
          {name}
        </a>
        <a href="#contact" className={`${LINK_CLASS} text-accent`}>
          {t.nav.contact}
        </a>
        <LocaleSwitch locale={locale} path="/" className={LINK_CLASS} />
      </nav>
    </header>
  );
}
