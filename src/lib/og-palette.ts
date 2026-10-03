/*
 * ImageResponse cannot read CSS custom properties: the Open Graph image uses
 * these copies of the globals.css tokens (dark section theme). Keyed by token
 * name so og-palette.test.ts fails as soon as one drifts from the stylesheet.
 */
export const OG_PALETTE = {
  "--palette-primary-darkest": "#170f2e",
  "--palette-primary-lightest": "#f8f2fc",
  "--palette-primary-light": "#c9a8fb",
  "--palette-gray-light": "#acb1c3",
  "--palette-primary": "#9251f7",
  "--palette-secondary": "#516cf7",
  "--palette-info": "#22c3f1",
  "--palette-success": "#4ac06f",
} as const;
