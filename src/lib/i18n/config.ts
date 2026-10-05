export const LOCALES = ["fr", "en"] as const;
export type Locale = (typeof LOCALES)[number];

/** Served without a path prefix: `/` is French, `/en` is English. */
export const DEFAULT_LOCALE: Locale = "fr";

/** Request header set by the proxy, which is the only place a locale is read from the URL. */
export const LOCALE_HEADER = "x-locale";

/** BCP 47 tag used for `<html lang>`, `Intl` formatting and schema.org `inLanguage`. */
export const LANGUAGE_TAGS: Record<Locale, string> = { fr: "fr-FR", en: "en-GB" };

/** Open Graph `og:locale` values (underscore form). */
export const OPEN_GRAPH_LOCALES: Record<Locale, string> = { fr: "fr_FR", en: "en_GB" };

export function isLocale(value: string | null | undefined): value is Locale {
  return LOCALES.some((locale) => locale === value);
}

/** Public path of `path` ("/", "/print"...) in `locale`: no prefix for the default locale. */
export function localePath(locale: Locale, path: string): string {
  if (locale === DEFAULT_LOCALE) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/** Splits a URL path into its locale prefix (if any) and the path without it. */
export function splitLocalePath(pathname: string): { locale: Locale; path: string } {
  for (const locale of LOCALES) {
    if (locale === DEFAULT_LOCALE) continue;
    if (pathname === `/${locale}`) return { locale, path: "/" };
    if (pathname.startsWith(`/${locale}/`))
      return { locale, path: pathname.slice(locale.length + 1) };
  }
  return { locale: DEFAULT_LOCALE, path: pathname };
}
