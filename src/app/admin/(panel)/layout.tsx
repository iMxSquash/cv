import { AdminNav } from "@/components/admin/AdminNav";
import { SECONDARY_BUTTON_CLASS } from "@/components/admin/styles";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { requireAdminPage } from "@/lib/admin/auth";

import { logout } from "./actions";

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  const { user } = await requireAdminPage();

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-3">
        <AdminNav />
        <div className="flex flex-wrap items-center gap-2">
          <ExternalLink href="/" className={SECONDARY_BUTTON_CLASS}>
            Voir le site
          </ExternalLink>
          <form action={logout}>
            <button type="submit" className={SECONDARY_BUTTON_CLASS}>
              Déconnexion
              <span className="sr-only"> de {user.email}</span>
            </button>
          </form>
        </div>
      </header>
      <main id="content" className="px-6 py-10 md:px-12">
        {children}
      </main>
    </>
  );
}
