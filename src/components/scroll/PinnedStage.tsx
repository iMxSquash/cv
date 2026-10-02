import type { CSSProperties, ReactNode } from "react";

interface PinnedStageProps {
  /** Scroll length of the pin, in viewport heights, from 900 px wide. */
  screens: number;
  /** Shorter pin below 900 px wide. */
  mobileScreens: number;
  className?: string;
  stageClassName?: string;
  children: ReactNode;
}

/**
 * Scroll-pinned scene: a tall wrapper (its height reserved in CSS from the
 * first paint, no layout shift) around a sticky full-viewport stage. Motion
 * components find it with `[data-pin]` and scrub over it with `pinnedScrub`.
 * Under reduced motion or without JS, the `pinned:` variant leaves both in flow.
 */
export function PinnedStage({
  screens,
  mobileScreens,
  className = "",
  stageClassName = "",
  children,
}: PinnedStageProps) {
  // svh: the page height must not change when a mobile address bar slides.
  const style = {
    "--pin-height": `${screens * 100}svh`,
    "--pin-height-mobile": `${mobileScreens * 100}svh`,
  } as CSSProperties;
  return (
    <div
      data-pin
      style={style}
      className={`pinned:h-(--pin-height-mobile) pinned:min-[900px]:h-(--pin-height) ${className}`}
    >
      <div
        className={`pinned:sticky pinned:top-0 pinned:h-dvh pinned:overflow-hidden ${stageClassName}`}
      >
        {children}
      </div>
    </div>
  );
}
