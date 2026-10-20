"use client";

import type { ReactNode } from "react";
import { claimOrb, holdOrbOnScreen, placeOrb } from "@/components/scroll/orbDirector";
import { useScrollMotion } from "@/components/scroll/useScrollMotion";
import { findPin, gsap, ScrollTrigger } from "@/lib/gsap";
import { VIEW } from "./nextCurve";

/** The orb ends the sentence as its full stop: radius, and gap after the last letter, in viewBox units. */
const DOT_RADIUS = 12;
const DOT_GAP = 10;
/** Under this radius in px the orb is not drawn at all. */
const MIN_ORB_RADIUS = 1;

/** Pin progress at which the sentence is settled; the rest of the pin closes the page. */
const SENTENCE_END = 0.82;
/** Within the sentence (0..1): typing stops here and the orb pops in as the full stop... */
const TYPING_END = 0.7;
/** ...until here, where the camera pulls back to frame the whole sentence. */
const ZOOM_START = 0.75;
/** Share of the view the whole sentence fills once the camera has pulled back. */
const FIT_SHARE = 0.85;
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
 * Closing choreography: the title is typed letter by letter along a curve, a
 * camera keeping the last letter centered in the view until it pulls back to frame the sentence.
 * The WebGL orb stays out until the sentence is typed, then pops in as its full stop. Then the sentence lifts out of
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
    const letters = text ? Array.from(text.querySelectorAll("tspan")) : [];
    const lift = svg?.querySelector("[data-next-lift]");
    const camera = svg?.querySelector("[data-next-camera]");
    const footer = element.querySelector<HTMLElement>("#contact");
    if (
      !pin ||
      !stage ||
      !svg ||
      !path ||
      !text ||
      !lift ||
      !camera ||
      !footer ||
      letters.length === 0
    )
      return;

    const length = path.getTotalLength();
    const curvePoint = new DOMPoint();
    // Measured with the font loaded, on every refresh: length along the curve at the end of each letter count.
    let advances = [0];
    let liftUnits = 0;
    let closing = 0;
    let travel = 0;
    // Letters typed so far, fractional: the last one is still being written, the camera is inside it.
    let typed = 0;
    // The orb pops in as the full stop once the sentence is typed, like the letters do; the pull-back share done is 0..1.
    let isStopShown = false;
    let settle = 0;
    // The orb's radius as the full stop, in CSS px (0 while hidden); the card takes over once locked.
    let dotRadius = 0;
    let fitScale = 1;
    const fitShift = new DOMPoint();
    // Camera in viewBox units, applied by hand to the orb's target (which ignores the lift of the text).
    let cameraScale = 1;
    const cameraShift = new DOMPoint();
    // Where the orb goes, in CSS px; locked while it grows into the card.
    let orbX = 0;
    let orbY = 0;
    let orbRadius = 0;
    let isOrbLocked = false;
    let writtenShown = letters.length;
    let writtenLift = Number.NaN;

    const measure = () => {
      let utf16Length = 0;
      advances = [
        0,
        ...letters.map((letter) =>
          text.getSubStringLength(0, (utf16Length += letter.textContent?.length ?? 0)),
        ),
      ];
      const box = text.getBBox();
      fitScale = Math.min(
        1,
        (VIEW.width * FIT_SHARE) / box.width,
        (VIEW.height * FIT_SHARE) / box.height,
      );
      fitShift.x = VIEW.width / 2 - fitScale * (box.x + box.width / 2);
      fitShift.y = VIEW.height / 2 - fitScale * (box.y + box.height / 2);
      const stageBox = stage.getBoundingClientRect();
      const footerTop = footer.getBoundingClientRect().top - stageBox.top;
      // Centers the sentence in the area left above the card, in viewBox units.
      const scale = Math.abs(svg.getScreenCTM()?.d ?? 1);
      liftUnits = (footerTop / 2 - stageBox.height / 2) / scale;
    };

    /** Length along the curve of the letter being written. */
    const headLength = () => {
      const written = Math.min(Math.floor(typed), letters.length - 1);
      return gsap.utils.interpolate(advances[written], advances[written + 1], typed - written);
    };

    // Reads layout first, then writes (and only on change): one layout per frame at most.
    const place = () => {
      const ctm = svg.getScreenCTM();
      let x = 0;
      let y = 0;
      if (isStopShown && ctm) {
        // The full stop sits right after the last letter, on the baseline.
        const along = Math.min(advances[letters.length] + DOT_GAP + DOT_RADIUS, length);
        const stop = path.getPointAtLength(along);
        const ahead = path.getPointAtLength(Math.min(along + 1, length));
        const step = Math.hypot(ahead.x - stop.x, ahead.y - stop.y) || 1;
        curvePoint.x =
          cameraScale * (stop.x + ((ahead.y - stop.y) / step) * DOT_RADIUS) + cameraShift.x;
        curvePoint.y =
          cameraScale * (stop.y - ((ahead.x - stop.x) / step) * DOT_RADIUS) + cameraShift.y;
        const screen = curvePoint.matrixTransform(ctm);
        x = screen.x;
        y = screen.y;
        dotRadius = DOT_RADIUS * cameraScale * Math.abs(ctm.a);
      } else {
        // Out of sight until the sentence is typed: the orb is gone when the section above ends.
        dotRadius = 0;
      }
      if (travel > 0) {
        const box = footer.getBoundingClientRect();
        x = gsap.utils.interpolate(x, box.left + box.width / 2, travel);
        y = gsap.utils.interpolate(y, box.top + box.height / 2, travel);
      }
      orbX = x;
      orbY = y;
    };

    // Keeps the letter being written at the center of the view, then pulls back to frame the sentence.
    const moveCamera = () => {
      const head = path.getPointAtLength(Math.min(headLength(), length));
      cameraScale = gsap.utils.interpolate(1, fitScale, settle);
      cameraShift.x = gsap.utils.interpolate(VIEW.width / 2 - head.x, fitShift.x, settle);
      cameraShift.y = gsap.utils.interpolate(VIEW.height / 2 - head.y, fitShift.y, settle);
      camera.setAttribute(
        "transform",
        `translate(${cameraShift.x} ${cameraShift.y}) scale(${cameraScale})`,
      );
    };

    const showTypedLetters = () => {
      const shown = Math.ceil(typed);
      if (shown === writtenShown) return;
      const [from, to] = shown < writtenShown ? [shown, writtenShown] : [writtenShown, shown];
      for (let index = from; index < to; index++) {
        letters[index].setAttribute("fill-opacity", shown > index ? "1" : "0");
      }
      writtenShown = shown;
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
      const radius = gsap.utils.interpolate(
        dotRadius,
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
      typed = letters.length * progressBetween(sentence, 0, TYPING_END);
      isStopShown = sentence >= TYPING_END;
      settle = progressBetween(sentence, ZOOM_START, 1);
      travel = progressBetween(closing, LIFT_FROM, LIFT_TO);
      const liftY = liftUnits * travel;
      if (liftY !== writtenLift) {
        writtenLift = liftY;
        gsap.set(lift, { y: liftY });
      }
      showTypedLetters();
      moveCamera();
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
      const radius = isOrbLocked ? orbRadius : dotRadius;
      if (radius < MIN_ORB_RADIUS) {
        orb.isVisible = false;
        return;
      }
      // Locked, it covers the card: exactly at its center, however wide.
      if (isOrbLocked) placeOrb(orb, orbX, orbY, radius);
      else holdOrbOnScreen(orb, orbX, orbY, radius);
      // Never eased: the full stop must stay glued to the sentence, and pops in where it belongs.
      orb.isLocked = true;
    });
    return () => {
      releaseOrb();
      footer.style.clipPath = "";
      footer.style.visibility = "";
      footer.style.pointerEvents = "";
      gsap.ticker.remove(syncCanvasClip);
      if (canvas) canvas.style.clipPath = "";
      gsap.set(lift, { clearProps: "transform" });
      camera.removeAttribute("transform");
      letters.forEach((letter) => letter.removeAttribute("fill-opacity"));
    };
  });

  return <div ref={root}>{children}</div>;
}
