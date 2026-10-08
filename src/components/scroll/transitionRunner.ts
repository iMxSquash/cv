import { NAV_SECTION_IDS, type NavSectionId } from "./sections";

/** What the scroll engine lends the transition: freeze the page, jump to the target, thaw it. */
export interface TransitionControls {
  lock: () => void;
  jump: () => void;
  unlock: () => void;
}

type TransitionRunner = (sectionId: NavSectionId, controls: TransitionControls) => void;

let runner: TransitionRunner | null = null;
let isBusy = false;

/** Registered by <PageTransition> while motion is allowed; returns the unregister function. */
export function registerPageTransition(run: TransitionRunner): () => void {
  runner = run;
  return () => {
    if (runner !== run) return;
    runner = null;
    isBusy = false;
  };
}

/** A transition is playing: further anchor clicks are swallowed until it ends. */
export function isPageTransitionRunning(): boolean {
  return isBusy;
}

function isNavSectionId(id: string): id is NavSectionId {
  return (NAV_SECTION_IDS as readonly string[]).includes(id);
}

/** The section crossing the middle of the viewport: jumping to it needs no ceremony. */
function isCrossingViewportMiddle(section: Element): boolean {
  const { top, bottom } = section.getBoundingClientRect();
  const middle = window.innerHeight / 2;
  return top <= middle && bottom > middle;
}

/**
 * Plays the wave transition towards `target` when it is a section other than
 * the current one. Returns false when there is nothing to play (no transition
 * registered, another kind of target): the caller then scrolls by itself.
 */
export function runPageTransition(target: Element, controls: TransitionControls): boolean {
  if (!runner || !isNavSectionId(target.id) || isCrossingViewportMiddle(target)) return false;
  isBusy = true;
  runner(target.id, {
    ...controls,
    unlock: () => {
      isBusy = false;
      controls.unlock();
    },
  });
  return true;
}
