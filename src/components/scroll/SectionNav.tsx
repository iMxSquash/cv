"use client";

import { useState } from "react";
import type { Messages } from "@/lib/i18n/messages";
import { NAV_SECTION_IDS } from "./sections";

/** Bar length in px by distance to the active bar: active, neighbor, others. */
const ACTIVE_BAR_WIDTHS_PX = [32, 22, 16] as const;
/** Bar length in px by distance to the hovered bar (dock effect): hovered, neighbor, next, others. */
const HOVER_BAR_WIDTHS_PX = [48, 36, 26, 16] as const;
const MAX_BAR_WIDTH_PX = HOVER_BAR_WIDTHS_PX[0];

function getBarWidth(widths: readonly number[], distance: number): number {
  return widths[Math.min(distance, widths.length - 1)];
}

/** The hover magnifies on top of the active emphasis, it never shrinks it. */
function getBarScale(index: number, activeIndex: number, hoveredIndex: number | null): number {
  const activeWidth = getBarWidth(ACTIVE_BAR_WIDTHS_PX, Math.abs(index - activeIndex));
  const hoverWidth =
    hoveredIndex === null ? 0 : getBarWidth(HOVER_BAR_WIDTHS_PX, Math.abs(index - hoveredIndex));
  return Math.max(activeWidth, hoverWidth) / MAX_BAR_WIDTH_PX;
}

/**
 * Top-right "scroll indicator": one bar per section. The active bar fills with
 * the scroll progress of its section (`--progress`, set by ScrollChrome) and is longer, as are its neighbors a bit
 * less; hovering a bar magnifies it and its neighbors further (dock effect).
 */
export function SectionNav({
  activeIndex,
  labels,
}: {
  activeIndex: number;
  labels: Messages["nav"];
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <nav
      aria-label={labels.sections}
      className="fixed top-6 right-6 z-40 hidden text-(--interface-color) transition-colors duration-300 md:block"
    >
      <ol onPointerLeave={() => setHoveredIndex(null)} onBlur={() => setHoveredIndex(null)}>
        {NAV_SECTION_IDS.map((id, index) => (
          <li key={id}>
            <a
              href={`#${id}`}
              aria-current={index === activeIndex ? "location" : undefined}
              onPointerEnter={() => setHoveredIndex(index)}
              onFocus={() => setHoveredIndex(index)}
              className="group relative flex h-9 w-14 items-center justify-end"
            >
              <span className="pointer-events-none absolute right-full mr-2 rounded-full bg-surface px-3 py-1 text-caption whitespace-nowrap opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                {labels.sectionLabels[id]}
              </span>
              <span
                aria-hidden="true"
                className="relative h-0.5 w-12 origin-right overflow-hidden rounded-full transition-transform duration-300 ease-out"
                style={{ transform: `scaleX(${getBarScale(index, activeIndex, hoveredIndex)})` }}
              >
                <span className="absolute inset-0 bg-current opacity-30" />
                <span
                  data-section-fill={id}
                  className="absolute inset-0 origin-left scale-x-(--progress,0) bg-current"
                />
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
