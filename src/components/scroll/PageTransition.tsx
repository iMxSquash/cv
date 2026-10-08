"use client";

import { useRef } from "react";
import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";
import type { Messages } from "@/lib/i18n/messages";
import { releaseOrb, restingOrbRadius, sendOrbTo, teleportOrbTo } from "./orbDirector";
import { registerPageTransition, type TransitionControls } from "./transitionRunner";
import type { NavSectionId } from "./sections";
import { scrollProgress } from "@/webgl/scrollProgress";
import { coverClip, createWaveOrigin, revealClip } from "./waveShape";

/** Time the orb gets to reach its corner before the first wave rises from it, in s. */
const ORB_LEAD_SECONDS = 0.45;
const COVER_SECONDS = 0.8;
const REVEAL_SECONDS = 0.9;
const TITLE_IN_SECONDS = 0.6;
const TITLE_HOLD_SECONDS = 0.35;
const TITLE_OUT_SECONDS = 0.35;
/** How far the word sits out of its clip, in % of its height: enough to hide the descenders too. */
const TITLE_HIDDEN_PERCENT = 135;
/** The cover's gradient is sized on this share of the short viewport side: a few bands across the screen. */
const COVER_GRADIENT_SIZE = 0.45;
/** The orb leaves its corner this long after the reveal starts: the wave must have reached the top-left first. */
const REVEAL_ORB_DELAY_SECONDS = 0.45;
/** The reveal starts this long before the title has fully left, so the two overlap. */
const REVEAL_OVERLAP_SECONDS = 0.15;
/** Phases of the ripples: the cover and the reveal never undulate the same way. */
const COVER_SEED = 1;
const REVEAL_SEED = 4.2;

/**
 * Section change by anchor: the orb flows out of the screen past the
 * bottom-right corner, a wave made of its own gradient grows from there and
 * covers the page, the section's name is spelled out, then a second wave
 * sweeps the cover away to show the section while the orb flows in from the
 * top-left corner. Purely decorative
 * (`aria-hidden`): the navs still work as plain anchors, and the target gets
 * focus. Not played under prefers-reduced-motion.
 */
export function PageTransition({ labels }: { labels: Messages["nav"]["sectionLabels"] }) {
  const overlay = useRef<HTMLDivElement>(null);
  const snapshot = useRef<HTMLCanvasElement>(null);
  const title = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    gsap.matchMedia().add(MOTION_OK, () => {
      const cover = overlay.current;
      const word = title.current;
      const paint = snapshot.current;
      if (!cover || !word || !paint) return;

      let isRunning = false;
      const hideCover = () =>
        gsap.set(cover, { visibility: "hidden", pointerEvents: "none", clipPath: "none" });
      let timeline: gsap.core.Timeline | null = null;

      const run = (sectionId: NavSectionId, controls: TransitionControls) => {
        isRunning = true;

        const { clientWidth: width, clientHeight: height } = cover;
        const orbRadius = restingOrbRadius();
        const origin = createWaveOrigin(width, height, orbRadius);
        const waves = { cover: 0, reveal: 0 };

        word.textContent = labels[sectionId];

        const finish = () => {
          // Frees the snapshot's pixels.
          paint.width = 0;
          hideCover();
          controls.unlock();
          isRunning = false;
          timeline = null;
        };

        timeline = gsap
          .timeline({ onComplete: finish })
          .call(() => {
            controls.lock();
            gsap.set(cover, {
              visibility: "visible",
              pointerEvents: "auto",
              clipPath: coverClip(origin, 0, COVER_SEED),
            });
            gsap.set(word, { yPercent: TITLE_HIDDEN_PERCENT });
            scrollProgress.coverRequest = {
              canvas: paint,
              x: origin.x,
              y: origin.y,
              radius: origin.endRadius,
              gradientSize: Math.min(width, height) * COVER_GRADIENT_SIZE,
            };
            sendOrbTo(origin.x, origin.y);
          })
          .to(
            waves,
            {
              cover: 1,
              duration: COVER_SECONDS,
              ease: "power2.in",
              onUpdate: () => {
                cover.style.clipPath = coverClip(origin, waves.cover, COVER_SEED);
              },
            },
            ORB_LEAD_SECONDS,
          )
          .call(() => {
            // The page is hidden: change section, and park the orb where it will come from.
            controls.jump();
            cover.style.clipPath = "none";
            teleportOrbTo(-orbRadius, -orbRadius);
          })
          .to(word, { yPercent: 0, duration: TITLE_IN_SECONDS, ease: "expo.out" })
          .to(
            word,
            { yPercent: -TITLE_HIDDEN_PERCENT, duration: TITLE_OUT_SECONDS, ease: "power2.in" },
            `+=${TITLE_HOLD_SECONDS}`,
          )
          .to(
            waves,
            {
              reveal: 1,
              duration: REVEAL_SECONDS,
              ease: "power2.inOut",
              onUpdate: () => {
                cover.style.clipPath = revealClip(origin, width, height, waves.reveal, REVEAL_SEED);
              },
            },
            `-=${REVEAL_OVERLAP_SECONDS}`,
          )
          .call(releaseOrb, undefined, `<+=${REVEAL_ORB_DELAY_SECONDS}`);
      };

      const unregister = registerPageTransition(run);
      return () => {
        unregister();
        timeline?.kill();
        timeline = null;
        if (isRunning) {
          releaseOrb();
          hideCover();
        }
      };
    });
  });

  return (
    <div
      ref={overlay}
      aria-hidden="true"
      data-theme="dark"
      className="orb-surface pointer-events-none invisible fixed inset-0 z-50 grid place-items-center overflow-hidden px-6"
    >
      {/* The orb's own gradient, drawn by the WebGL scene; the CSS surface only stands in without it. */}
      <canvas ref={snapshot} className="absolute inset-0 size-full" />
      {/* Clips the word while it slides in and out; the padding keeps descenders. */}
      <span className="relative block overflow-hidden pb-[0.15em] text-center">
        <span ref={title} className="title-display block text-balance" />
      </span>
    </div>
  );
}
