/*
 * ImageResponse cannot read CSS custom properties: the Open Graph image uses
 * these copies of the globals.css tokens (dark section theme). Keyed by token
 * name so og-palette.test.ts fails as soon as one drifts from the stylesheet.
 */
export const OG_PALETTE = {
  "--palette-primary-darkest": "#050b1f",
  "--palette-primary-lightest": "#f1f4f2",
  "--palette-primary-light": "#6fd0c8",
  "--palette-gray-light": "#aeb5c9",
  "--palette-primary": "#4cc9a4",
  "--palette-secondary": "#6f7fc4",
  "--palette-info": "#6fd0c8",
  "--palette-success": "#4ac06f",
} as const;
