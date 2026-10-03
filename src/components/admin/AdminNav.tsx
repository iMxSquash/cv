"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";

import { ADMIN_ENTITIES, ENTITY_SLUGS } from "@/lib/admin/entities";

const LINKS = [
  { href: "/admin/profil", label: "Profil" },
  ...ENTITY_SLUGS.map((slug) => ({ href: `/admin/${slug}`, label: ADMIN_ENTITIES[slug].title })),
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Sections du CV">
      <ul className="flex flex-wrap gap-1">
        {LINKS.map(({ href, label }) => {
          const isCurrent = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <NextLink
                href={href}
                aria-current={isCurrent ? "page" : undefined}
                className="inline-flex min-h-11 items-center rounded-full px-3 font-medium text-text-muted hover:text-text aria-[current=page]:bg-badge aria-[current=page]:text-badge-text"
              >
                {label}
              </NextLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
