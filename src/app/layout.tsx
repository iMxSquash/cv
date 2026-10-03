import type { Metadata } from "next";
import { DM_Sans, Outfit } from "next/font/google";
import { SmoothScroll } from "@/components/scroll/SmoothScroll";
import { getProfile } from "@/lib/cv/queries";
import { buildOpenGraphBase } from "@/lib/cv/seo";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap" });

// Every page is static: a daily rebuild keeps date-based content (the "Actuel"
// badge) accurate even when the resume is not edited.
export const revalidate = 86400;

/** Site-wide defaults; each indexable page sets its own description and canonical URL. */
export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: profile.full_name, template: `%s · ${profile.full_name}` },
    authors: [{ name: profile.full_name, url: SITE_URL }],
    creator: profile.full_name,
    openGraph: buildOpenGraphBase(profile),
    twitter: { card: "summary_large_image" },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" data-theme="light" className={`${outfit.variable} ${dmSans.variable}`}>
      <body className="text-body antialiased">
        <a
          href="#content"
          className="sr-only z-50 rounded-full bg-surface-raised font-medium text-accent shadow-elevation focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:px-5 focus:py-3"
        >
          Aller au contenu
        </a>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
