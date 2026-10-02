import type { Metadata } from "next";
import NextLink from "next/link";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { getProfile } from "@/lib/cv/queries";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Éditeur, hébergement et données du CV en ligne d'Elwen Coussot (cv.elwen.dev).",
};

const LINK_CLASS = "font-medium text-accent underline underline-offset-4";

function LegalBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="title-card">{title}</h2>
      <div className="mt-3 grid max-w-3xl gap-3">{children}</div>
    </section>
  );
}

export default async function LegalNoticePage() {
  const profile = await getProfile();
  const email = (
    <a href={`mailto:${profile.email}`} className={LINK_CLASS}>
      {profile.email}
    </a>
  );
  return (
    <main id="content" className="section-shell">
      <NextLink href="/" className={`inline-flex min-h-11 items-center ${LINK_CLASS}`}>
        Retour au CV
      </NextLink>
      <h1 className="mt-8 title-section">Mentions légales</h1>

      <LegalBlock title="Éditeur">
        <p>
          Ce site est édité à titre personnel et non professionnel par {profile.full_name},
          également directeur de la publication. Contact : {email}.
        </p>
      </LegalBlock>

      <LegalBlock title="Hébergement">
        <p>
          Le site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723,
          États-Unis (
          <ExternalLink href="https://vercel.com" className={LINK_CLASS}>
            vercel.com
          </ExternalLink>
          ).
        </p>
        <p>
          Le contenu du CV est stocké par Supabase Inc. (
          <ExternalLink href="https://supabase.com" className={LINK_CLASS}>
            supabase.com
          </ExternalLink>
          ), sur des serveurs situés à Paris (région AWS eu-west-3).
        </p>
      </LegalBlock>

      <LegalBlock title="Données personnelles">
        <p>
          Les seules données personnelles publiées sont celles de {profile.full_name}, présentes
          dans le CV. Le site ne collecte aucune donnée sur ses visiteurs : pas de formulaire, pas
          de compte, pas de cookie de suivi ni d&apos;outil de mesure d&apos;audience tiers.
        </p>
        <p>Pour toute demande concernant ces informations, écrire à {email}.</p>
      </LegalBlock>

      <LegalBlock title="Propriété intellectuelle">
        <p>
          Le code source du site est publié sous licence MIT. Le contenu du CV, les photos et
          l&apos;identité visuelle restent la propriété de {profile.full_name} et ne peuvent être
          réutilisés sans autorisation.
        </p>
      </LegalBlock>
    </main>
  );
}
