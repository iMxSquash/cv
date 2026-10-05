import type { ReactNode } from "react";
import { ExternalLink } from "@/components/ui/ExternalLink";
import type { Locale } from "@/lib/i18n/config";

export const LINK_CLASS = "font-medium text-accent underline underline-offset-4";

interface LegalContext {
  locale: Locale;
  name: string;
  email: ReactNode;
}

interface LegalCopy {
  title: string;
  description: (name: string) => string;
  back: string;
  blocks: { title: string; paragraphs: (context: LegalContext) => ReactNode[] }[];
}

function siteLink(locale: Locale, host: string): ReactNode {
  return (
    <ExternalLink href={`https://${host}`} className={LINK_CLASS} locale={locale}>
      {host}
    </ExternalLink>
  );
}

const fr: LegalCopy = {
  title: "Mentions légales",
  description: (name) =>
    `Éditeur, hébergement et données du CV en ligne de ${name} (cv.elwen.dev).`,
  back: "Retour au CV",
  blocks: [
    {
      title: "Éditeur",
      paragraphs: ({ name, email }) => [
        <>
          Ce site est édité à titre personnel et non professionnel par {name}, également directeur
          de la publication. Contact : {email}.
        </>,
      ],
    },
    {
      title: "Hébergement",
      paragraphs: ({ locale }) => [
        <>
          Le site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723,
          États-Unis ({siteLink(locale, "vercel.com")}).
        </>,
        <>
          Le contenu du CV est stocké par Supabase Inc. ({siteLink(locale, "supabase.com")}), sur
          des serveurs situés à Paris (région AWS eu-west-3).
        </>,
      ],
    },
    {
      title: "Données personnelles",
      paragraphs: ({ name, email }) => [
        <>
          Les seules données personnelles publiées sont celles de {name}, présentes dans le CV. Le
          site ne collecte aucune donnée sur ses visiteurs : pas de formulaire, pas de compte, pas
          de cookie de suivi ni d&apos;outil de mesure d&apos;audience tiers.
        </>,
        <>Pour toute demande concernant ces informations, écrire à {email}.</>,
      ],
    },
    {
      title: "Propriété intellectuelle",
      paragraphs: ({ name }) => [
        <>
          Le code source du site est publié sous licence MIT. Le contenu du CV, les photos et
          l&apos;identité visuelle restent la propriété de {name} et ne peuvent être réutilisés sans
          autorisation.
        </>,
      ],
    },
  ],
};

const en: LegalCopy = {
  title: "Legal notice",
  description: (name) => `Publisher, hosting and data of ${name}'s online resume (cv.elwen.dev).`,
  back: "Back to the resume",
  blocks: [
    {
      title: "Publisher",
      paragraphs: ({ name, email }) => [
        <>
          This website is published as a personal, non-professional project by {name}, who is also
          the publication director. Contact: {email}.
        </>,
      ],
    },
    {
      title: "Hosting",
      paragraphs: ({ locale }) => [
        <>
          The website is hosted by Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, United
          States ({siteLink(locale, "vercel.com")}).
        </>,
        <>
          The resume content is stored by Supabase Inc. ({siteLink(locale, "supabase.com")}), on
          servers located in Paris (AWS region eu-west-3).
        </>,
      ],
    },
    {
      title: "Personal data",
      paragraphs: ({ name, email }) => [
        <>
          The only personal data published is {name}&apos;s own, as it appears in the resume. The
          website collects no data about its visitors: no form, no account, no tracking cookie and
          no third-party analytics tool.
        </>,
        <>For any request about this information, write to {email}.</>,
      ],
    },
    {
      title: "Intellectual property",
      paragraphs: ({ name }) => [
        <>
          The source code of the website is published under the MIT licence. The resume content,
          photos and visual identity remain the property of {name} and may not be reused without
          permission.
        </>,
      ],
    },
  ],
};

const COPY: Record<Locale, LegalCopy> = { fr, en };

export function getLegalCopy(locale: Locale): LegalCopy {
  return COPY[locale];
}
