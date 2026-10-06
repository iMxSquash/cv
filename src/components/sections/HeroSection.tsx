import { Fragment } from "react";
import type { Profile } from "@/lib/cv/types";
import type { Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { PinnedStage } from "@/components/scroll/PinnedStage";
import { AssetImage } from "@/components/ui/AssetImage";
import { HeroMotion } from "./HeroMotion";

export function HeroSection({ profile, locale }: { profile: Profile; locale: Locale }) {
  const words = profile.full_name.split(" ");
  return (
    <section
      id="hero"
      aria-label={getMessages(locale).hero.label}
      data-theme="dark"
      // Transparent: the fixed WebGL canvas behind the page shows through the frame.
      className="relative bg-transparent"
    >
      <HeroMotion>
        <PinnedStage
          screens={3}
          mobileScreens={2}
          // Always clipped: the frame's spread shadow must not spill over the next section.
          stageClassName="flex min-h-dvh flex-col overflow-hidden p-2 md:p-4"
        >
          {/* The huge spread shadow paints the page surface around the rounded frame, over the canvas. */}
          <div
            data-hero-frame
            className="flex flex-1 flex-col overflow-hidden rounded-[clamp(1rem,3vmin,2rem)] shadow-[0_0_0_100vmax_var(--surface)]"
          >
            <div
              data-theme="dark"
              data-theme-solid=""
              className="relative isolate flex flex-1 flex-col justify-center bg-transparent px-6 md:px-12"
            >
              <div
                aria-hidden="true"
                className="hero-gradient-fallback absolute inset-0 -z-10 transition-opacity duration-700 in-data-[webgl=ready]:opacity-0"
              />
              {profile.avatar_url && (
                <AssetImage
                  src={profile.avatar_url}
                  // Below the centered top capsule on narrow screens, in the corner from md up.
                  className="absolute top-16 left-4 size-12 rounded-full md:top-8 md:left-8 md:size-16"
                />
              )}
              <h1 className="title-display">
                {words.map((word, index) => (
                  <Fragment key={index}>
                    <span data-hero-word className="inline-block">
                      {word}
                    </span>{" "}
                  </Fragment>
                ))}
              </h1>
              <p
                data-hero-headline
                className="mt-6 font-display text-display-l text-accent-display"
              >
                {profile.headline}
              </p>
            </div>
          </div>
        </PinnedStage>
      </HeroMotion>
    </section>
  );
}
