import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Elwen Coussot, développeur full-stack",
  description: "CV d'Elwen Coussot, développeur full-stack.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
