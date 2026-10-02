import { Color } from "three";

/** Design tokens used by the scene, read from globals.css (the single source of colors). */
export interface Palette {
  primary: Color;
  primaryDark: Color;
  primaryDarkest: Color;
  primaryLighter: Color;
  secondary: Color;
  info: Color;
}

function readToken(styles: CSSStyleDeclaration, name: string): Color {
  const value = styles.getPropertyValue(name).trim();
  if (!value) throw new Error(`Missing CSS token ${name} in globals.css`);
  return new Color(value);
}

export function readPalette(root: Element = document.documentElement): Palette {
  const styles = getComputedStyle(root);
  return {
    primary: readToken(styles, "--palette-primary"),
    primaryDark: readToken(styles, "--palette-primary-dark"),
    primaryDarkest: readToken(styles, "--palette-primary-darkest"),
    primaryLighter: readToken(styles, "--palette-primary-lighter"),
    secondary: readToken(styles, "--palette-secondary"),
    info: readToken(styles, "--palette-info"),
  };
}
