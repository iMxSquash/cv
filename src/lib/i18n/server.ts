import { headers } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_HEADER, type Locale, isLocale } from "./config";

/** Locale of the current request, set by the proxy; French when the proxy did not run. */
export async function getLocale(): Promise<Locale> {
  const value = (await headers()).get(LOCALE_HEADER);
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
