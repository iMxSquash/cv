import { InlineScript } from "@/components/ui/InlineScript";

const LOADER_ID = "loader";
const SEEN_KEY = "cv:loader-seen";

/** The portfolio's "EC" logo (../portfolio/public/logo.svg, 277.51 x 175.08). */
const MONOGRAM_PATHS = [
  "M131.48 101.89L129.73 87.54C123.43 135.34 97.17 163.52 63.02 168.25V81.06C72.48 84.04 84.38 107.67 86.83 127.1H88.58V31.69H86.83C84.38 51.12 72.48 74.76 63.02 77.73V6.65C96.46 9.8 117.47 25.56 129.73 72.65L131.48 66.27C136.2 35.51 153.21 11.31 178.5 0H0V175.08H212.56C168.84 175.08 138.11 144.94 131.48 101.9V101.89Z",
  "M255.77 0C270.49 5.32 277.51 11.73 277.51 11.73V0H255.77Z",
  "M212.56 175.08H277.51V139.62C270.06 160.52 243.81 175.08 212.56 175.08Z",
  "M243.55 103.82C241.62 80.71 226.22 3.85 193.13 3.85C181.23 3.85 173.87 15.76 173.87 34.49C173.87 96.64 214.84 132.36 249.85 132.36C261.35 132.36 273.12 129.27 277.51 122.73V11.73L245.3 103.82H243.55Z",
];

/*
 * Runs while the HTML is parsed, before the first paint. If sessionStorage is
 * blocked the loader never plays, rather than on every visit.
 */
const PLAY_SCRIPT = `(function(){try{if(sessionStorage.getItem("${SEEN_KEY}")||matchMedia("(prefers-reduced-motion: reduce)").matches)return;sessionStorage.setItem("${SEEN_KEY}","1")}catch(e){return}document.getElementById("${LOADER_ID}").dataset.state="play"})()`;

/**
 * Intro screen drawing the monogram, animated in CSS so it never waits for the
 * JS bundle. Plays on the first full load of the session only, never without JS
 * or under reduced motion: hidden until the play script sets data-state.
 */
export function Loader() {
  return (
    <>
      <div
        id={LOADER_ID}
        role="status"
        data-theme="dark"
        className="fixed inset-0 z-60 hidden place-items-center data-[state=play]:grid data-[state=play]:animate-loader-exit"
        suppressHydrationWarning
      >
        <span className="sr-only">Chargement du CV</span>
        {/* Padded viewBox: the outline stroke straddles the logo's edges. */}
        <svg
          viewBox="-4 -4 286 184"
          aria-hidden="true"
          className="loader__monogram w-[clamp(6rem,22vmin,11rem)] overflow-visible"
        >
          {MONOGRAM_PATHS.map((d) => (
            <path key={d} d={d} pathLength={1} />
          ))}
        </svg>
      </div>
      <InlineScript html={PLAY_SCRIPT} />
    </>
  );
}
