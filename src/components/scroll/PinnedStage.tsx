import type { CSSProperties, ReactNode } from "react";

// Full class strings, so Tailwind finds every variant in the source.
const ALWAYS_CLASSES = {
  wrapper: "pinned:h-(--pin-height-mobile) pinned:min-[900px]:h-(--pin-height)",
  stage: "pinned:sticky pinned:top-0 pinned:h-dvh pinned:overflow-hidden",
};
const WIDE_ONLY_CLASSES = {
  wrapper: "pinned-wide:h-(--pin-height)",
  stage: "pinned-wide:sticky pinned-wide:top-0 pinned-wide:h-dvh pinned-wide:overflow-hidden",
};

interface PinnedStageProps {
  /** Scroll length of the pin, in viewport heights, from 900 px wide. */
  screens: number;
  /** Shorter pin below 900 px wide; omitted, the scene is only pinned from 900 px wide. */
  mobileScreens?: number;
  className?: string;
  stageClassName?: string;
  children: ReactNode;
}

/**
 * Scroll-pinned scene: a tall wrapper (its height reserved in CSS from the
 * first paint, no layout shift) around a sticky full-viewport stage. Motion
 * components find it with `findPin` and scrub over it with `pinnedScrub`.
 * Under reduced motion or without JS, the `pinned:` variant leaves both in flow.
 * Pair `mobileScreens` with MOTION_OK and the `pinned:` variant, its absence
 * with MOTION_OK_WIDE and `pinned-wide:`.
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
    ...(mobileScreens !== undefined && { "--pin-height-mobile": `${mobileScreens * 100}svh` }),
  } as CSSProperties;
  const classes = mobileScreens === undefined ? WIDE_ONLY_CLASSES : ALWAYS_CLASSES;
  return (
    <div data-pin style={style} className={`${classes.wrapper} ${className}`}>
      <div className={`${classes.stage} ${stageClassName}`}>{children}</div>
    </div>
  );
}
