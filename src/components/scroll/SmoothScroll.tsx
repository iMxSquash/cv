"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import type { ReactNode } from "react";
import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { isPageTransitionRunning, runPageTransition } from "./transitionRunner";

/** Resolves once late layout shifts (web fonts, images) have landed. */
function whenLoaded(): Promise<unknown> {
  const pageLoad =
    document.readyState === "complete"
      ? Promise.resolve()
      : new Promise((resolve) => window.addEventListener("load", resolve, { once: true }));
  return Promise.all([document.fonts.ready, pageLoad]);
}

/** A target pinned over a scene (the footer) only exists once the page is scrolled to its end. */
function scrollToAnchor(
  lenis: Lenis,
  target: HTMLElement,
  options?: Parameters<Lenis["scrollTo"]>[1],
): void {
  lenis.scrollTo(target.hasAttribute("data-scroll-end") ? lenis.limit : target, options);
}

/**
 * Same-page anchors scroll through Lenis, keep the hash in the URL and move
 * focus to the target, as a native anchor jump would.
 */
function handleAnchorClicks(lenis: Lenis): () => void {
  const onClick = (event: MouseEvent) => {
    const isPlainClick =
      event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
    const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
    const target = anchor && document.getElementById(anchor.hash.slice(1));
    if (!isPlainClick || !anchor || !target) return;
    event.preventDefault();
    if (isPageTransitionRunning()) return;
    window.history.pushState(null, "", anchor.hash);
    // Section changes play the wave transition, which jumps while the page is covered.
    const isTransitioning = runPageTransition(target, {
      lock: () => lenis.stop(),
      jump: () => scrollToAnchor(lenis, target, { immediate: true, force: true }),
      unlock: () => lenis.start(),
    });
    if (!isTransitioning) scrollToAnchor(lenis, target);
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  };
  document.addEventListener("click", onClick);
  return () => document.removeEventListener("click", onClick);
}

/**
 * The single Lenis instance of the page, driven by gsap.ticker (the only
 * animation loop, shared with the WebGL scene). Not created under
 * prefers-reduced-motion: the browser scrolls and follows anchors natively.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  useGSAP(() => {
    let isMounted = true;
    let lenis: Lenis | null = null;

    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const instance = new Lenis({ autoRaf: false });
      instance.on("scroll", ScrollTrigger.update);
      const tick = (time: number) => instance.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      const removeAnchorHandler = handleAnchorClicks(instance);
      lenis = instance;
      return () => {
        removeAnchorHandler();
        gsap.ticker.remove(tick);
        instance.destroy();
        lenis = null;
      };
    });

    void whenLoaded().then(() => {
      if (!isMounted) return;
      ScrollTrigger.refresh();
      // The browser jumped to the URL hash before pins existed: land on it again.
      const hashTarget =
        window.location.hash && document.getElementById(window.location.hash.slice(1));
      if (lenis && hashTarget) scrollToAnchor(lenis, hashTarget, { immediate: true });
    });

    // The matchMedia is reverted by the useGSAP context.
    return () => {
      isMounted = false;
    };
  });

  return children;
}
