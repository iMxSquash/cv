import type { Enums } from "@/lib/database.types";
import type { Locale } from "./config";

export interface Messages {
  skipLink: string;
  /** Screen reader hint after a link that opens a new tab. */
  newTab: string;
  loading: string;
  /** Wraps a quotation with the typographic marks of the language. */
  quote: (text: string) => string;
  openEnd: string;
  seo: {
    titleSuffix: string;
  };
  nav: {
    main: string;
    sections: string;
    contact: string;
    /** Short name and accessible label of this language, shown on the link that switches to it. */
    languageCode: string;
    languageLabel: string;
    sectionLabels: Record<
      "hero" | "manifesto" | "experiences" | "skills" | "infos" | "next",
      string
    >;
  };
  hero: { label: string };
  about: { title: string };
  experiences: { title: string; education: string; current: string };
  skills: { title: string; tools: string; categories: Record<Enums<"cv_skill_category">, string> };
  infos: { title: string; languages: string; mobility: string };
  next: { fallbackTitle: string; writeEmail: string };
  footer: {
    contact: string;
    downloadPdf: string;
    updatedOn: string;
    legal: string;
  };
  linkPlatforms: Record<Enums<"cv_link_platform">, string>;
  notFound: { title: string; text: string; back: string };
  print: {
    title: string;
    description: (name: string) => string;
    back: string;
    printButton: string;
    articleLabel: (name: string) => string;
    email: string;
    phone: string;
    address: string;
    socials: string;
    languages: string;
    mobility: string;
    tools: string;
  };
  llms: {
    /** Colon before a value: French typography puts a space before it. */
    colon: string;
    onlineCv: (url: string, date: string) => string;
    about: string;
    experiences: string;
    education: string;
    skills: string;
    tools: string;
    languages: string;
    contact: string;
    email: string;
    location: string;
  };
}

const fr: Messages = {
  skipLink: "Aller au contenu",
  newTab: "(nouvel onglet)",
  loading: "Chargement du CV",
  // Non-breaking spaces keep the guillemets on the first and last words.
  quote: (text) => `«\u00A0${text}\u00A0»`,
  openEnd: "aujourd'hui",
  seo: {
    titleSuffix: "CV",
  },
  nav: {
    main: "Principale",
    sections: "Sections",
    contact: "Contact",
    languageCode: "FR",
    languageLabel: "Lire ce CV en français",
    sectionLabels: {
      hero: "Présentation",
      manifesto: "À propos",
      experiences: "Parcours",
      skills: "Compétences",
      infos: "Infos pratiques",
      next: "Disponibilité",
    },
  },
  hero: { label: "Présentation" },
  about: { title: "À propos" },
  experiences: { title: "Expériences", education: "Éducation", current: "Actuel" },
  skills: {
    title: "Compétences",
    tools: "Outils",
    categories: { design: "Design", development: "Développement" },
  },
  infos: { title: "Infos pratiques", languages: "Langues", mobility: "Mobilité" },
  next: { fallbackTitle: "Me contacter", writeEmail: "Écrire un email" },
  footer: {
    contact: "Contact",
    downloadPdf: "Télécharger le CV (PDF)",
    updatedOn: "Mis à jour le",
    legal: "Mentions légales",
  },
  linkPlatforms: {
    linkedin: "LinkedIn",
    github: "GitHub",
    freecodecamp: "FreeCodeCamp",
    website: "Site web",
    other: "Lien",
  },
  notFound: {
    title: "Page introuvable",
    text: "Cette page n'existe pas ou a été déplacée.",
    back: "Retour au CV",
  },
  print: {
    title: "CV imprimable",
    description: (name) => `Version A4 imprimable du CV de ${name}.`,
    back: "Retour au CV",
    printButton: "Imprimer ou enregistrer en PDF",
    articleLabel: (name) => `CV de ${name}`,
    email: "Email",
    phone: "Téléphone",
    address: "Adresse",
    socials: "Réseaux sociaux",
    languages: "Langues",
    mobility: "Mobilité et disponibilité",
    tools: "Outils",
  },
  llms: {
    colon: " : ",
    onlineCv: (url, date) => `CV en ligne : ${url} (mis à jour le ${date}).`,
    about: "À propos",
    experiences: "Expériences",
    education: "Formation",
    skills: "Compétences",
    tools: "Outils",
    languages: "Langues",
    contact: "Contact",
    email: "E-mail",
    location: "Localisation",
  },
};

const en: Messages = {
  skipLink: "Skip to content",
  newTab: "(new tab)",
  loading: "Loading the resume",
  quote: (text) => `“${text}”`,
  openEnd: "present",
  seo: {
    titleSuffix: "Resume",
  },
  nav: {
    main: "Main",
    sections: "Sections",
    contact: "Contact",
    languageCode: "EN",
    languageLabel: "Read this resume in English",
    sectionLabels: {
      hero: "Introduction",
      manifesto: "About",
      experiences: "Journey",
      skills: "Skills",
      infos: "Practical info",
      next: "Availability",
    },
  },
  hero: { label: "Introduction" },
  about: { title: "About" },
  experiences: { title: "Experience", education: "Education", current: "Current" },
  skills: {
    title: "Skills",
    tools: "Tools",
    categories: { design: "Design", development: "Development" },
  },
  infos: { title: "Practical info", languages: "Languages", mobility: "Mobility" },
  next: { fallbackTitle: "Get in touch", writeEmail: "Send an email" },
  footer: {
    contact: "Contact",
    downloadPdf: "Download the resume (PDF)",
    updatedOn: "Updated on",
    legal: "Legal notice",
  },
  linkPlatforms: {
    linkedin: "LinkedIn",
    github: "GitHub",
    freecodecamp: "FreeCodeCamp",
    website: "Website",
    other: "Link",
  },
  notFound: {
    title: "Page not found",
    text: "This page does not exist or has been moved.",
    back: "Back to the resume",
  },
  print: {
    title: "Printable resume",
    description: (name) => `Printable A4 version of ${name}'s resume.`,
    back: "Back to the resume",
    printButton: "Print or save as PDF",
    articleLabel: (name) => `Resume of ${name}`,
    email: "Email",
    phone: "Phone",
    address: "Address",
    socials: "Social networks",
    languages: "Languages",
    mobility: "Mobility and availability",
    tools: "Tools",
  },
  llms: {
    colon: ": ",
    onlineCv: (url, date) => `Online resume: ${url} (updated on ${date}).`,
    about: "About",
    experiences: "Experience",
    education: "Education",
    skills: "Skills",
    tools: "Tools",
    languages: "Languages",
    contact: "Contact",
    email: "Email",
    location: "Location",
  },
};

const MESSAGES: Record<Locale, Messages> = { fr, en };

export function getMessages(locale: Locale): Messages {
  return MESSAGES[locale];
}
