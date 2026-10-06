"use client";

import type { ReactNode } from "react";
import {
  claimOrb,
  holdOrbOnScreen,
  placeOrb,
  restingOrbRadius,
} from "@/components/scroll/orbDirector";
import { useScrollMotion } from "@/components/scroll/useScrollMotion";
import { findPin, gsap, ScrollTrigger } from "@/lib/gsap";

/** Gap between the end of the sentence and the orb trailing it, in viewBox units. */
const ORB_GAP = 50;

/** Pin progress at which the sentence is settled; the rest of the pin closes the page. */
const SENTENCE_END = 0.82;
/** Within the closing stretch (0..1): the sentence lifts and the orb drops to the card, then the card opens. */
const LIFT_FROM = 0.3;
const LIFT_TO = 0.55;
/** The card opens once the orb has settled in its center. */
const REVEAL_FROM = 0.6;
/** The grown orb overshoots the card's corners by this much, so no gap shows. */
const COVER_MARGIN = 1.1;
/** Corner radius of the footer card, in px (matches the footer's `rounded-[18px]`). */
const CARD_RADIUS = 18;
/** The footer card takes pointer events once this much of it is open. */
const INTERACTIVE_FROM = 0.4;

const progressBetween = (value: number, from: number, to: number) =>
  gsap.utils.clamp(0, 1, gsap.utils.normalize(from, to, value));

/**
 * Closing choreography: the title advances along a curve until it settles,
 * the WebGL orb (arriving from the section above) trailing it like a full stop. Then the sentence lifts out of
 * the way while the orb drops to the center of the footer card, which opens
 * as a circle growing from that point. Without motion the title stays a plain
 * heading, there is no orb and the footer simply follows in the flow.
 */
export function NextMotion({ children }: { children: ReactNode }) {
  const root = useScrollMotion((element) => {
    const pin = findPin(element);
    const stage = pin?.firstElementChild;
    const svg = element.querySelector<SVGSVGElement>("[data-next-curve]");
    const path = svg?.querySelector("path");
    const text = svg?.querySelector("text");
    const textPath = text?.querySelector("textPath");
    const footer = element.querySelector<HTMLElement>("#contact");
    if (!pin || !stage || !svg || !path || !text || !textPath || !footer) return;

    const length = path.getTotalLength();
    const curvePoint = new DOMPoint();
    // Measured with the font loaded, on every refresh.
    let textLength = 0;
    let liftUnits = 0;
    let closing = 0;
    let travel = 0;
    let offset = length;
    // Where the orb goes, in CSS px; locked while it grows into the card.
    let orbX = 0;
    let orbY = 0;
    let orbRadius = 0;
    let isOrbLocked = false;
    let writtenOffset = Number.NaN;
    let writtenLift = Number.NaN;

    const measure = () => {
      textLength = text.getComputedTextLength();
      const stageBox = stage.getBoundingClientRect();
      const footerTop = footer.getBoundingClientRect().top - stageBox.top;
      // Centers the sentence in the area left above the card, in viewBox units.
      const scale = Math.abs(svg.getScreenCTM()?.d ?? 1);
      liftUnits = (footerTop / 2 - stageBox.height / 2) / scale;
    };

    // Reads layout first, then writes (and only on change): one layout per frame at most.
    const place = () => {
      const head = path.getPointAtLength(Math.min(offset + textLength + ORB_GAP, length));
      curvePoint.x = head.x;
      curvePoint.y = head.y;
      const screen = curvePoint.matrixTransform(svg.getScreenCTM() ?? undefined);
      let x = screen.x;
      let y = screen.y;
      if (travel > 0) {
        const box = footer.getBoundingClientRect();
        x = gsap.utils.interpolate(x, box.left + box.width / 2, travel);
        y = gsap.utils.interpolate(y, box.top + box.height / 2, travel);
      }
      orbX = x;
      orbY = y;
      if (offset !== writtenOffset) {
        writtenOffset = offset;
        textPath.setAttribute("startOffset", String(offset));
      }
    };

    // The card is the orb itself growing: the sphere is scaled up until it covers the card, the canvas is
    // cut to the card's shape, and the content is uncovered by a circle as wide as the sphere.
    let canvas: HTMLElement | null = null;
    let reveal = 0;
    let writtenClip = "";
    // Also runs on the ticker: the WebGL background mounts after the first paint, possibly after a jump to the footer.
    const syncCanvasClip = () => {
      canvas ??= document.querySelector<HTMLElement>("[data-webgl-canvas]");
      if (!canvas || (reveal === 0 && writtenClip === "")) return;
      const box = footer.getBoundingClientRect();
      const clip =
        reveal > 0
          ? `inset(${box.top}px ${window.innerWidth - box.right}px ${window.innerHeight - box.bottom}px ${box.left}px round ${CARD_RADIUS}px)`
          : "";
      if (clip === writtenClip) return;
      writtenClip = clip;
      canvas.style.clipPath = clip;
    };
    gsap.ticker.add(syncCanvasClip);

    const openCard = (progress: number) => {
      reveal = progress;
      const box = footer.getBoundingClientRect();
      const restingRadius = restingOrbRadius();
      const radius = gsap.utils.interpolate(
        restingRadius,
        Math.hypot(box.width / 2, box.height / 2) * COVER_MARGIN,
        reveal,
      );
      orbRadius = radius;
      isOrbLocked = reveal > 0;
      footer.style.clipPath = `circle(${radius}px at 50% 50%)`;
      footer.style.visibility = reveal > 0 ? "visible" : "hidden";
      footer.style.pointerEvents = reveal > INTERACTIVE_FROM ? "auto" : "none";
    };

    const update = (progress: number) => {
      const sentence = progressBetween(progress, 0, SENTENCE_END);
      closing = progressBetween(progress, SENTENCE_END, 1);
      offset = gsap.utils.interpolate(length, (length - textLength) / 2, sentence);
      travel = progressBetween(closing, LIFT_FROM, LIFT_TO);
      const lift = liftUnits * travel;
      if (lift !== writtenLift) {
        writtenLift = lift;
        gsap.set(text, { y: lift });
      }
      place();
      openCard(progressBetween(closing, REVEAL_FROM, 1));
    };

    // Created first, so the orb trigger below places everything with the updated state.
    ScrollTrigger.create({
      trigger: pin,
      start: "top top",
      end: "bottom bottom",
      onRefresh: (self) => {
        measure();
        update(self.progress);
      },
      onUpdate: (self) => update(self.progress),
    });
    // Follows the stage while it scrolls in and out, beyond the pin itself.
    ScrollTrigger.create({ trigger: pin, start: "top bottom", end: "bottom top", onUpdate: place });
    const releaseOrb = claimOrb({ trigger: pin, start: "top center" }, (orb) => {
      // Locked, it covers the card: exactly at its center, however wide.
      if (isOrbLocked) placeOrb(orb, orbX, orbY, orbRadius);
      else holdOrbOnScreen(orb, orbX, orbY, orbRadius);
      orb.isLocked = isOrbLocked;
    });
    return () => {
      releaseOrb();
      footer.style.clipPath = "";
      footer.style.visibility = "";
      footer.style.pointerEvents = "";
      gsap.ticker.remove(syncCanvasClip);
      if (canvas) canvas.style.clipPath = "";
      gsap.set(text, { clearProps: "transform" });
    };
  });

  return <div ref={root}>{children}</div>;
}
