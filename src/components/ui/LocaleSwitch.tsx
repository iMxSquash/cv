import { LOCALES, type Locale, localePath } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

/**
 * Link to the same page in the other language. A plain anchor on purpose: the
 * `<html lang>` of the root layout only updates on a full document load.
 */
export function LocaleSwitch({
  locale,
  path,
  className,
}: {
  locale: Locale;
  /** Locale-free path of the current page ("/", "/print"...). */
  path: string;
  className: string;
}) {
  const target = LOCALES.find((candidate) => candidate !== locale) ?? locale;
  const { languageCode, languageLabel } = getMessages(target).nav;
  return (
    <a
      href={localePath(target, path)}
      hrefLang={target}
      lang={target}
      aria-label={languageLabel}
      className={className}
    >
      {languageCode}
    </a>
  );
}
