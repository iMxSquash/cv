import type { Metadata } from "next";
import { DM_Sans, Outfit } from "next/font/google";
import { connection } from "next/server";
import { SmoothScroll } from "@/components/scroll/SmoothScroll";
import { getProfile } from "@/lib/cv/queries";
import { buildOpenGraphBase } from "@/lib/cv/seo";
import { LANGUAGE_TAGS } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap" });

/** Site-wide defaults; each indexable page sets its own description and canonical URL. */
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const profile = await getProfile(locale);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: profile.full_name, template: `%s · ${profile.full_name}` },
    authors: [{ name: profile.full_name, url: SITE_URL }],
    creator: profile.full_name,
    openGraph: buildOpenGraphBase(profile, locale),
    twitter: { card: "summary_large_image" },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // The CSP nonce is per request: a statically prerendered page would ship
  // scripts without it and the browser would block them all.
  await connection();
  const locale = await getLocale();
  return (
    <html
      lang={LANGUAGE_TAGS[locale]}
      data-theme="light"
      className={`${outfit.variable} ${dmSans.variable}`}
    >
      <body className="text-body antialiased">
        <a
          href="#content"
          className="sr-only z-50 rounded-full bg-surface-raised font-medium text-accent shadow-elevation focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:px-5 focus:py-3"
        >
          {getMessages(locale).skipLink}
        </a>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
