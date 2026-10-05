import type { MetadataRoute } from "next";
import { getProfile } from "@/lib/cv/queries";
import { buildAlternates } from "@/lib/cv/seo";
import { DEFAULT_LOCALE, LOCALES, localePath } from "@/lib/i18n/config";
import { SITE_URL } from "@/lib/site";

// Same daily refresh as the pages; /admin writes revalidate it immediately.
export const revalidate = 86400;

// /print and /admin are noindex and blocked in robots.ts: never listed here.
// Every page exists in each language, and each entry lists all of them.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const profile = await getProfile(DEFAULT_LOCALE);
  const pages = [
    { path: "/", lastModified: profile.updated_at, priority: 1 },
    { path: "/mentions-legales", lastModified: undefined, priority: 0.1 },
  ];
  return pages.flatMap(({ path, lastModified, priority }) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}${localePath(locale, path)}`,
      lastModified,
      priority,
      alternates: {
        languages: Object.fromEntries(
          Object.entries(buildAlternates(locale, path).languages).map(([tag, href]) => [
            tag,
            `${SITE_URL}${href}`,
          ]),
        ),
      },
    })),
  );
}
