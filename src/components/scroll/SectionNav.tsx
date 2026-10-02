import { NAV_SECTIONS } from "./sections";

/** Bar length in px by distance to the active section: active, neighbor, others. */
const BAR_WIDTHS_PX = [48, 28, 12] as const;
const MAX_BAR_WIDTH_PX = BAR_WIDTHS_PX[0];

function getBarScale(index: number, activeIndex: number): number {
  const distance = Math.min(Math.abs(index - activeIndex), BAR_WIDTHS_PX.length - 1);
  return BAR_WIDTHS_PX[distance] / MAX_BAR_WIDTH_PX;
}

/** Side "scroll indicator": one bar per section, the current one stretched. */
export function SectionNav({ activeIndex }: { activeIndex: number }) {
  return (
    <nav
      aria-label="Sections"
      className="fixed top-1/2 right-1 z-40 hidden -translate-y-1/2 text-(--interface-color) transition-colors duration-300 md:block"
    >
      <ol>
        {NAV_SECTIONS.map((section, index) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              aria-current={index === activeIndex ? "location" : undefined}
              className="group relative flex h-11 w-14 items-center justify-end"
            >
              <span className="pointer-events-none absolute right-full mr-2 rounded-full bg-surface px-3 py-1 text-caption whitespace-nowrap opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                {section.label}
              </span>
              <span
                aria-hidden="true"
                className="h-0.5 w-12 origin-right rounded-full bg-current transition-transform duration-300"
                style={{ transform: `scaleX(${getBarScale(index, activeIndex)})` }}
              />
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
