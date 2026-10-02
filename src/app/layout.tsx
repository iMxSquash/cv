import type { Metadata } from "next";
import { DM_Sans, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap" });

// Every page is static: a daily rebuild keeps date-based content (the "Actuel"
// badge) accurate even when the resume is not edited.
export const revalidate = 86400;

export const metadata: Metadata = {
  title: {
    default: "Elwen Coussot, développeur full-stack",
    template: "%s · Elwen Coussot",
  },
  description: "CV d'Elwen Coussot, développeur full-stack.",
};

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
        {children}
      </body>
    </html>
  );
}
