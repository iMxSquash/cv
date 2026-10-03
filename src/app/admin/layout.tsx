import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s · Admin CV" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return children;
}
