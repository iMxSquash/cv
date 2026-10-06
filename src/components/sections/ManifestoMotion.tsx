"use client";

import type { ReactNode } from "react";
import {
  claimOrb,
  measureAnchor,
  placeOrb,
  restingOrbRadius,
  setShape,
  splitRadius,
} from "@/components/scroll/orbDirector";
import { useScrollMotion } from "@/components/scroll/useScrollMotion";
import { findPin, gsap, ScrollTrigger } from "@/lib/gsap";
import type { OrbState } from "@/webgl/scrollProgress";
import { ORB_LANE } from "./orbLane";

/** Letter wave travelling along the quote. */
const WAVE = {
  /** Phase step between neighbouring letters (rad). */
  spread: 0.45,
  /** Crests passing a letter over the whole pin. */
  cycles: 8,
  heightPercent: 14,
  tiltDegrees: 6,
};
/**
 * Words of the about text wait in the muted text color (AA contrast, unlike a
 * low opacity) and settle on the full text color when their turn comes.
 */
const DIMMED_WORD_COLOR = "var(--text-muted)";
const LIT_WORD_COLOR = "var(--text)";

/**
 * Pin progress milestones of the opening: the orb splits in two three times,
 * the eight drops spin back together, then the merged orb swells over the
 * first word and a lining circle opens in its middle, hollowing it out until
 * it is gone: the word shows through that very circle. The rest of the pin is
 * the line itself.
 */
const SPLITS: ReadonlyArray<readonly [number, number]> = [
  [0, 0.06],
  [0.06, 0.12],
  [0.12, 0.18],
];
const GATHER = [0.18, 0.28] as const;
const REVEAL = [0.28, 0.34] as const;
/** How far apart each split pushes the drops, in orb radii. */
const SPLIT_DISTANCE = 1.6;
/** Turns of the whole pattern while it splits, then while it gathers. */
const TURNS = { splitting: 0.25, gathering: 1 };
/** Once the rest of the line is on its way: the opening quote mark and the author's name rise into view. */
const LATE_REVEAL = [REVEAL[1] + 0.01, REVEAL[1] + 0.05] as const;
/** Distance the late elements rise from, in px. */
const LATE_RISE = 40;
/** Pin progress over which the first word's wave fades in, once the line has picked it up. */
const WAVE_RAMP = 0.03;
/** Within REVEAL (0..1): the orb swells over the word, then its lining opens. */
const SWELL = [0, 0.45] as const;
const LINING = [0.3, 1] as const;
/** The swollen orb overshoots the farthest viewport corner by this much, so it covers the whole screen. */
const COVER_MARGIN = 1.02;
/** Share of the about text scroll over which the orb leaves the full stop for its lane. */
const LANE_BLEND = 0.35;

const splitEase = gsap.parseEase("power2.inOut");
const gatherEase = gsap.parseEase("power2.in");
const swellEase = gsap.parseEase("power3.out");
const liningEase = gsap.parseEase("power2.inOut");

const between = (value: number, [from, to]: readonly [number, number]) =>
  gsap.utils.clamp(0, 1, gsap.utils.normalize(from, to, value));

/**
 * The eight drops of the opening. Drop `index` reads its bits as the side it
 * takes at each split: left or right, then up or down, then a turn of ±22.5°
 * around the center, which lays the eight of them evenly on a ring.
 */
function poseSplitting(
  orb: OrbState,
  progress: number,
  centerX: number,
  centerY: number,
  radius: number,
): void {
  const [first, second, third] = SPLITS.map((range) => splitEase(between(progress, range)));
  const gather = gatherEase(between(progress, GATHER));
  const spin =
    2 *
    Math.PI *
    (TURNS.splitting * between(progress, [0, SPLITS[2][1]]) + TURNS.gathering * gather);
  const spread = radius * SPLIT_DISTANCE * (1 - gather);
  const dropRadius = splitRadius(radius, orb.shapes.length);
  orb.shapes.forEach((shape, index) => {
    const side = (bit: number) => ((index >> bit) & 1 ? 1 : -1);
    const x = side(0) * first;
    const y = side(1) * second;
    const angle = side(2) * (Math.PI / 8) * third + spin;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    setShape(
      shape,
      centerX + (x * cos - y * sin) * spread,
      centerY + (x * sin + y * cos) * spread,
      dropRadius,
      dropRadius,
      dropRadius,
    );
  });
}

/**
 * Radius of the lining circle at reveal progress `reveal` (0..1): it uncovers
 * the word and hollows the orb alike, until it reaches the orb's own edge.
 */
function liningRadius(reveal: number, coverRadius: number): number {
  return liningEase(between(reveal, LINING)) * coverRadius;
}

/**
 * The merged orb swells until it covers the whole screen, then its lining
 * hollows it out from the center. Locked: the hole must match the word's own
 * reveal circle exactly.
 */
function poseSwell(
  orb: OrbState,
  progress: number,
  centerX: number,
  centerY: number,
  radius: number,
  coverRadius: number,
): void {
  const reveal = between(progress, REVEAL);
  const outer = gsap.utils.interpolate(radius, coverRadius, swellEase(between(reveal, SWELL)));
  const hole = liningRadius(reveal, coverRadius);
  orb.isVisible = hole < outer;
  orb.isLocked = true;
  placeOrb(orb, centerX, centerY, outer);
  orb.hole.x = centerX;
  orb.hole.y = centerY;
  orb.hole.radius = hole;
}

/** Horizontal layout offset of an element from the page, transforms left out. */
function offsetFromPage(element: HTMLElement): number {
  let offset = 0;
  for (let node: Element | null = element; node instanceof HTMLElement; node = node.offsetParent) {
    offset += node.offsetLeft;
  }
  return offset;
}

const isOnScreen = ({ x, y, radius }: { x: number; y: number; radius: number }) =>
  x + radius > 0 &&
  x - radius < window.innerWidth &&
  y + radius > 0 &&
  y - radius < window.innerHeight;

/**
 * Manifesto choreography. The orb left by the hero splits, gathers back while
 * spinning and swells over the first word of the quote, then a lining circle
 * hollows it out and uncovers the word. The rest of the line then rides in from the right at a
 * constant speed (the opening quote mark and the author's name rise in as it
 * comes), picks that word up, which only then starts rippling with it, and the
 * whole line travels until its end is in view. The orb is not seen in
 * between: it shows up again as the line's full stop, then drifts down the
 * right of the about text, which lights up word by word. Without motion, both
 * read as plain static text.
 */
export function ManifestoMotion({ children }: { children: ReactNode }) {
  const root = useScrollMotion((element) => {
    const pin = findPin(element);
    const track = pin?.querySelector<HTMLElement>("[data-manifesto-track]");
    const firstWord = track?.querySelector<HTMLElement>("[data-manifesto-first-word]");
    let releaseOrb: (() => void) | undefined;
    if (pin && track && firstWord) {
      const letters = gsap.utils.toArray<HTMLElement>("[data-manifesto-letter]");
      const restLetters = letters.filter((letter) => !firstWord.contains(letter));
      const openingLetters = letters.filter((letter) => "manifestoOpening" in letter.dataset);
      const wordLetters = letters.filter(
        (letter) => firstWord.contains(letter) && !openingLetters.includes(letter),
      );
      const firstWordLetter = wordLetters[0] ?? firstWord;
      const lastWordLetter = wordLetters[wordLetters.length - 1] ?? firstWord;
      const lastLetter = letters[letters.length - 1];
      const author = element.querySelector<HTMLElement>("[data-manifesto-author]");
      const lateElements = author ? [...openingLetters, author] : openingLetters;
      const setters = letters.map((letter) => ({
        isFirstWord: firstWord.contains(letter),
        y: gsap.quickSetter(letter, "yPercent"),
        rotation: gsap.quickSetter(letter, "rotation", "deg"),
      }));
      const lateSetters = lateElements.map((late) => ({
        opacity: gsap.quickSetter(late, "opacity"),
        y: gsap.quickSetter(late, "y", "px"),
      }));
      const restSetters = restLetters.map((letter) => gsap.quickSetter(letter, "x", "px"));
      const setTrackX = gsap.quickSetter(track, "x", "px");

      // Layout offsets ignore transforms: measured on every refresh, whatever the line's current state.
      let startX = 0;
      let lineDistance = 0;
      let arrivalDistance = 0;
      let embarkAt = REVEAL[1];
      // The reveal circle, in the first word's own box (quote mark included), grows as wide as the swollen orb.
      const mask = { x: 0, y: 0, radius: 0 };
      const measure = () => {
        const trackOffset = offsetFromPage(track);
        const wordLeft = offsetFromPage(firstWordLetter);
        const wordRight = offsetFromPage(lastWordLetter) + lastWordLetter.offsetWidth;
        const wordCenter = (wordLeft + wordRight) / 2 - trackOffset;
        mask.x = (wordLeft + wordRight) / 2 - offsetFromPage(firstWord);
        mask.y = firstWord.offsetHeight / 2;
        // From the word's center on the pinned stage (horizontally centered by startX) to the farthest corner.
        const stageTop = pin.firstElementChild?.getBoundingClientRect().top ?? 0;
        const centerY = firstWord.getBoundingClientRect().top - stageTop + mask.y;
        mask.radius =
          Math.hypot(window.innerWidth / 2, Math.max(centerY, window.innerHeight - centerY)) *
          COVER_MARGIN;
        const lineEnd = offsetFromPage(lastLetter) - trackOffset + lastLetter.offsetWidth;
        const trackLeft = track.getBoundingClientRect().left - Number(gsap.getProperty(track, "x"));
        startX = window.innerWidth / 2 - trackLeft - wordCenter;
        lineDistance = Math.max(startX - (track.clientWidth - lineEnd), 0);
        // The rest of the line waits just past the right edge of the viewport.
        const restStart = restLetters[0]
          ? offsetFromPage(restLetters[0]) - trackOffset
          : wordCenter;
        arrivalDistance = Math.max(window.innerWidth - (trackLeft + startX + restStart), 0);
        const travelDistance = arrivalDistance + lineDistance;
        embarkAt =
          REVEAL[1] +
          (travelDistance > 0 ? ((1 - REVEAL[1]) * arrivalDistance) / travelDistance : 0);
      };

      let writtenClip = "";
      const render = (progress: number) => {
        const phase = progress * WAVE.cycles * Math.PI * 2;
        // The first word holds still until the line picks it up, then the wave rises in it.
        const firstWordWave = between(progress, [embarkAt, embarkAt + WAVE_RAMP]);
        setters.forEach(({ isFirstWord, y, rotation }, index) => {
          const angle = index * WAVE.spread - phase;
          const amplitude = isFirstWord ? firstWordWave : 1;
          y(Math.sin(angle) * WAVE.heightPercent * amplitude);
          rotation(Math.cos(angle) * WAVE.tiltDegrees * amplitude);
        });
        const reveal = between(progress, REVEAL);
        const clip =
          reveal >= 1
            ? ""
            : `circle(${liningRadius(reveal, mask.radius)}px at ${mask.x}px ${mask.y}px)`;
        if (clip !== writtenClip) {
          writtenClip = clip;
          firstWord.style.clipPath = clip;
        }
        const late = between(progress, LATE_REVEAL);
        lateSetters.forEach(({ opacity, y }) => {
          opacity(late);
          y((1 - late) * LATE_RISE);
        });
        // One constant speed: the rest of the line arrives, then carries the first word with it.
        const travel = between(progress, [REVEAL[1], 1]) * (arrivalDistance + lineDistance);
        const restX = Math.max(arrivalDistance - travel, 0);
        restSetters.forEach((setX) => setX(restX));
        setTrackX(startX - Math.max(travel - arrivalDistance, 0));
      };

      const line = ScrollTrigger.create({
        trigger: pin,
        start: "top top",
        end: "bottom bottom",
        onRefresh: (self) => {
          measure();
          render(self.progress);
        },
        onUpdate: (self) => render(self.progress),
        // Own layers while rippling: the huge line is composited, not repainted, every frame.
        onToggle: (self) => gsap.set(letters, { willChange: self.isActive ? "transform" : "auto" }),
      });

      const aboutBlock = element.querySelector("[data-manifesto-about-block]");
      const lane = aboutBlock
        ? ScrollTrigger.create({ trigger: aboutBlock, start: "top bottom", end: "bottom top" })
        : null;
      const period = track.querySelector("[data-orb-anchor]");

      releaseOrb = claimOrb({ trigger: pin, start: "top top" }, (orb) => {
        const radius = restingOrbRadius();
        if (line.progress < REVEAL[1]) {
          const left = firstWordLetter.getBoundingClientRect().left;
          const right = lastWordLetter.getBoundingClientRect().right;
          const word = firstWord.getBoundingClientRect();
          const centerX = (left + right) / 2;
          const centerY = word.top + word.height / 2;
          if (line.progress < REVEAL[0]) {
            poseSplitting(orb, line.progress, centerX, centerY, radius);
          } else {
            poseSwell(orb, line.progress, centerX, centerY, radius, mask.radius);
          }
          return;
        }
        if (!period) {
          orb.isVisible = false;
          return;
        }
        const stop = measureAnchor(period);
        const laneProgress = lane?.progress ?? 0;
        if (laneProgress === 0) {
          // Glued to the rippling full stop, and only there.
          orb.isVisible = isOnScreen(stop);
          orb.isLocked = true;
          placeOrb(orb, stop.x, stop.y, stop.radius);
          return;
        }
        const { interpolate } = gsap.utils;
        const blend = splitEase(between(laneProgress, [0, LANE_BLEND]));
        const laneY = interpolate(ORB_LANE.fromY, ORB_LANE.toY, laneProgress) * window.innerHeight;
        placeOrb(
          orb,
          interpolate(stop.x, ORB_LANE.x * window.innerWidth, blend),
          interpolate(stop.y, laneY, blend),
          interpolate(stop.radius, radius, blend),
        );
      });
    }

    gsap.fromTo(
      "[data-manifesto-word]",
      { color: DIMMED_WORD_COLOR },
      {
        color: LIT_WORD_COLOR,
        ease: "none",
        stagger: 0.1,
        scrollTrigger: {
          trigger: "[data-manifesto-about]",
          start: "top 80%",
          end: "bottom 50%",
          scrub: true,
        },
      },
    );
    return () => {
      releaseOrb?.();
      // Written by quick setters, outside the context's reach.
      if (firstWord) firstWord.style.clipPath = "";
      gsap.set("[data-manifesto-letter], [data-manifesto-author]", {
        clearProps: "transform,opacity",
      });
    };
  });

  return <div ref={root}>{children}</div>;
}
