# CV immersif : TODO (cv.elwen.dev)

> **Concept** : mon CV en longue page immersive au scroll, inspirée de [guillaumezhu.com](https://guillaumezhu.com) (hero WebGL, texte cinétique géant, sections pinnées, alternance crème/sombre) et adaptée à la charte de mon CV Figma (Outfit + DM Sans, violet `#9251F7` / bleu `#516CF7`).
>
> **Stack** : Next.js 16 · TypeScript · Tailwind v4 · GSAP + ScrollTrigger · Lenis · three.js · Supabase (projet `portfolio` partagé, tables `cv_*`) · Vercel
>
> **Méthode** : on construit d'abord un CV **complet, statique et accessible** rendu côté serveur (phases 1 à 3), puis on ajoute le mouvement par-dessus (phases 4 à 6). À chaque étape le site reste publiable.
>
> Cocher les cases au fil de l'eau, dans le même commit que le travail. Skills à charger : voir `CLAUDE.md`.

---

## Phase 0 : Setup du repo

- [x] Projet Next.js 16 (App Router, TS strict, Tailwind v4, ESLint, `src/`, alias `@/*`)
- [x] Dépendances : `gsap`, `@gsap/react`, `lenis`, `three` (+ `@types/three`), `@supabase/ssr`, `@supabase/supabase-js`, `zod` ; dev : `prettier`, `eslint-config-prettier`, `vitest`
- [x] Scripts `lint`, `typecheck`, `test`, `format`, `format:check` ; `.nvmrc` (Node 24) ; Prettier/ESLint/Vitest alignés sur `adobe-apps`
- [x] Headers de base dans `next.config.ts` (`frame-ancestors` elwen.dev, nosniff, HSTS, Referrer-Policy, Permissions-Policy)
- [x] `CLAUDE.md`, skills projet (`cv-scroll-choreography`, `cv-webgl-scene`, `cv-design-system`, `cv-admin-data`, `cv-a11y-perf`)
- [x] Hygiène : `README.md`, `CHANGELOG.md`, `LICENSE` (MIT, code uniquement), `SECURITY.md`, `CONTRIBUTING.md`, `.env.example`, `.github/` (CI, CodeQL, Dependabot, templates, CODEOWNERS, release.yml)
- [x] Retirer le boilerplate create-next-app (`src/app/page.tsx`, SVG de `public/`)
- [x] Commits atomiques sur la branche `chore/project-setup` + PR
- [x] Créer le repo GitHub `cv` (public), pousser, protéger `main` (PR obligatoire, CI verte, pas de force push)
- [x] Settings GitHub > Security : secret scanning + push protection, private vulnerability reporting, Dependabot alerts ; description, topics, URL du site ; squash merge uniquement, suppression des branches après merge
- [x] Secrets GitHub Actions : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (le build lit Supabase)
- [x] Projet Vercel `cv` relié au repo, env vars (Production + Preview), domaine `cv.elwen.dev` (vérifié)

## Phase 1 : Données (Supabase) · skill `cv-admin-data`

- [x] Migrations `supabase/migrations/` : `cv_profile` (singleton), `cv_experiences`, `cv_education`, `cv_skills`, `cv_tools`, `cv_languages`, `cv_links`, `cv_mobility` (schéma dans la skill)
- [x] RLS sur chaque table (lecture publique des lignes `visible`, écriture `authenticated`, écritures `anon` révoquées) + trigger `updated_at` ; enums Postgres pour les ensembles fermés ; testé avec la clé anon (lecture OK, écriture refusée, lignes masquées invisibles)
- [x] Bucket `cv-assets` (png/webp/jpeg/avif, 5 Mo, pas de SVG) + policies (pas de listing public)
- [x] Migration de seed avec le contenu du CV Figma tel quel (décision : dates mises à jour plus tard via l'admin ; téléphone non publié)
- [x] `get_advisors` (security + performance) sans alerte sur les objets `cv_*`
- [x] Types générés dans `src/lib/database.types.ts`
- [x] `src/lib/supabase/` : env validées (fail fast), client public (anon, sans cookies) ; le client serveur `@supabase/ssr` arrive avec l'admin (phase 8)
- [x] Retirer `--passWithNoTests` du script `test` dès le premier test écrit
- [x] `getCv()` dans `src/lib/cv/queries.ts` (requêtes parallèles, objet typé `Cv`) + tests des fonctions pures (parsing `**mot-clé**`, calcul « Actuel », formatage des dates FR)

## Phase 2 : Fondations visuelles · skill `cv-design-system`

- [x] Tokens Figma en CSS custom properties + `@theme` Tailwind (`globals.css`), source unique (la WebGL lira les variables CSS, pas de miroir TS)
- [x] Polices Outfit + DM Sans via `next/font/google` (`font-display` / `font-sans`)
- [x] Échelle typographique fluide (`clamp`, basée sur `vmin` pour les display) + utilitaires `title-section`, `title-card`, `section-shell`
- [x] Thèmes de section `data-theme="light|dark"` (fond et texte peints par la règle de base) + variable `--interface-color`
- [x] Composants de base : `Badge`, `Card`, `SkillChip`, `CvIcon` (`@tabler/icons-react`), drapeaux SVG locaux
- [x] Focus visible et skip link stylés pour les deux thèmes (axe : 0 violation WCAG 2.2 AA)

## Phase 3 : CV statique complet (SSR, sans animation) · skill `cv-a11y-perf`

> À la fin de cette phase, le site est déjà un bon CV en ligne : complet, rapide, accessible, indexable.

- [x] `layout.tsx` : `lang="fr"`, polices, metadata de base, `<main id="content">`, skip link
- [x] Sections dans l'ordre du storyboard (`hero`, `manifesto`, `experiences`, `skills`, `infos`, `next`), chacune un composant serveur qui reçoit ses données en props (première version posée en phase 2 pour valider le design system)
- [x] Footer : email, LinkedIn, GitHub, FreeCodeCamp, mentions légales (le bouton « Télécharger le CV (PDF) » arrive avec `/print` en phase 7, pour ne pas publier un lien mort)
- [x] Page `/mentions-legales` (éditeur, hébergeur Vercel, données Supabase)
- [x] `export const revalidate = 86400` (badge « Actuel » à jour) + `not-found.tsx` (vrai 404)
- [x] Vérification protocole `cv-a11y-perf` (1440×900, 700×450, 390×844, clavier, sans JS)

## Phase 4 : Moteur de scroll · skill `cv-scroll-choreography`

- [x] `SmoothScroll` : Lenis unique piloté par `gsap.ticker`, désactivé en reduced motion, ancres `#id` interceptées par un écouteur délégué (pas de contexte React)
- [x] `ScrollTrigger.refresh()` après `document.fonts.ready` et images du hero ; `ignoreMobileResize`
- [x] Nav latérale « scroll indicator » (barres 12/28/48 px, `aria-current`, ancres via Lenis, hash conservé)
- [x] Capsule nav en haut (masquée au scroll vers le bas, visible vers le haut)
- [x] Bascule de thème crème/sombre au passage des sections
- [x] Vérifier : aucun ScrollTrigger orphelin après fast refresh / navigation

## Phase 5 : Scène WebGL · skill `cv-webgl-scene`

- [x] `src/webgl/Experience.ts` : renderer unique, canvas fixe `aria-hidden`, branché sur `gsap.ticker`, resize via `ResizeObserver`, `dispose()` complet (le canvas est créé et retiré par `Experience` : un canvas dont le contexte a été perdu ne se réutilise pas)
- [x] Chargement `next/dynamic` (`ssr: false`) après premier paint ; fallback CSS si pas de WebGL2 / contexte perdu
- [x] Shader « mesh gradient » du hero (couleurs lues dans les variables CSS de `globals.css`, grain anti-banding, luminance plafonnée pour le contraste du texte)
- [x] Monogramme 3D : logo du portfolio modélisé dans Blender (MCP `blender`, biseau arrondi, lettres « EC » extrudées depuis l'espace négatif du SVG), exporté en `public/models/monogram.glb` compressé (meshopt, 46 Ko), source `design/3d/monogram.blend` ; chargé via `GLTFLoader`, suivi du pointeur
- [x] Pause du rendu hors champ / onglet caché ; reduced motion = une frame figée
- [ ] Mesures : 60 fps M1 (à mesurer sur la machine), chunk WebGL < 200 Ko gzip (163 Ko ✓), `renderer.info.memory` revient à 0 au démontage (✓ hors LUT BRDF interne de three.js, libérée avec le contexte)

## Phase 6 : Sections animées (une PR par section)

- [x] **Loader** : monogramme qui se dessine, 1 fois par session, < 1,5 s, `role="status"` (CSS pur déclenché par un script inline avant le premier paint ; jamais sans JS ni en reduced motion)
- [x] **Hero** : bloc encadré arrondi, gradient WebGL, nom géant, monogramme 3D ; au scroll, texte qui s'écarte et monogramme qui se centre (pin sticky 3 vh, 2 vh sous 900 px ; sans pin ni JS en reduced motion via la variante `pinned:`). Le monogramme reste derrière le texte (canvas unique en arrière-plan) : le texte s'écarte avant qu'ils se croisent
- [x] **Manifesto** : citation en texte horizontal géant avec ondulation des lettres (pin sticky 4 vh, 2,5 vh sous 900 px ; lettres `aria-hidden` + phrase en `sr-only`) ; « À propos » révélé mot à mot (scrub d'opacité), mots-clés en accent
- [x] **Expériences & éducation** : phrases de trajectoire (`buildTrajectory`, une étape par rôle/diplôme distinct, ordre chronologique) + panneaux gradient CSS latéraux (pattern « I bridge »), puis cartes détail avec badge « Actuel » qui montent en stagger (pin sticky 8 vh, 5 vh sous 900 px ; trajectoire `aria-hidden` car redondante avec les cartes, absente en reduced motion). Cartes laissées sur fond sombre (le storyboard prévoyait « sombre puis crème »), à rediscuter
- [x] **Compétences & tools** : titre + sous-titre qui bascule Design / Développement / Outils, pile de cartes face cachée qui se retournent (flip 3D) puis s'envolent, tools en fin de pile (pin sticky 6 vh, à partir de 900 px de large : variante `pinned-wide:` + `MOTION_OK_WIDE`) ; grille sous 900 px et en reduced motion. Mêmes `<ul>` par catégorie dans les deux modes
- [x] **Infos** : bento langues + mobilité + disponibilité (disponibilité large + langues, mobilité pleine largeur), apparition en stagger (`ScrollTrigger.batch`, une fois). Section laissée sombre (alternance avec Compétences en crème)
- [x] **Next / contact** : phrase sur chemin courbe (`textPath`, dégradé primaire) qui avance au scroll jusqu'au centre (pin sticky 3 vh, 2 vh sous 900 px ; copie `aria-hidden`, vrai `<h2>` en `sr-only`) + orbe WebGL (sphère fresnel, même renderer) qui la suit comme un point final, puis CTA et footer. Stage transparent seulement si la WebGL est prête ; sans mouvement, titre statique et pas d'orbe
- [x] Pour chaque section : protocole `cv-a11y-perf` complet (dont reduced motion et 700×450) : 1440×900, 700×450, 390×844, reduced motion et sans JS vérifiés (contenu complet, aucun pin, aucun débordement horizontal) ; Tab sur toute la page sans focus perdu ni masqué ; 23 ScrollTriggers avant et après 3 allers-retours `/` ↔ `/mentions-legales` (heap snapshot), un seul canvas. Restent à mesurer sur vraie machine : 60 fps et CPU x4 (phase 11)

## Phase 7 : Version A4 imprimable · skill `cv-design-system`

- [x] Route `/print` fidèle à la maquette Figma (sidebar + colonne principale), mêmes données `getCv()` (petits textes passés en `Gray/Dark`, mots-clés et compétences en `Primary/Dark` / `Secondary/Dark` pour le contraste AA ; avatar et logos remplacés par des icônes tant qu'ils ne sont pas uploadés, phase 8)
- [x] `@page A4`, feuille de 210 × 297 mm (cotes internes en points, l'unité du Figma A4), `print-color-adjust: exact`, tient sur une page (PDF Chromium : 1 page A4), `noindex`
- [x] Bouton « Télécharger le CV (PDF) » dans le footer → `/print` + `window.print()` (une fois les polices chargées, puis bouton « Imprimer ou enregistrer en PDF ») ; vérifié dans Chromium (1440×900, 700×450, 390×844, sans JS, clavier, axe 0 violation)
- [ ] Tester l'impression dans Safari et Firefox, et depuis l'iframe du portfolio (phase 12)

## Phase 8 : Backoffice `/admin` · skill `cv-admin-data`

- [x] Client serveur `@supabase/ssr` (`src/lib/supabase/server.ts`)
- [x] `src/proxy.ts` (matcher `/admin/:path*`) + `requireAdminPage` / `requireAdminAction` (modèle `adobe-apps`)
- [x] `/admin/login` (même compte Supabase que le portfolio, erreur générique)
- [x] Schémas Zod `src/lib/cv/schemas.ts` alignés sur les contraintes SQL + tests Vitest (icônes et drapeaux limités aux clés locales)
- [x] Pages : Profil, Expériences, Éducation, Compétences, Tools, Langues, Liens, Mobilité (liste, formulaire, ↑↓, toggle `visible`, suppression confirmée) ; parcours vérifié avec des lignes de test masquées (création, upload, rejet d'un SVG renommé, remplacement, ↑↓, visibilité, suppression, 700×450, 390 px)
- [x] Upload avatar/logos : MIME + magic bytes, 5 Mo, nom régénéré, suppression de l'ancien fichier (envoi direct au bucket par URL signée, le corps des Server Actions étant limité à 1 Mo)
- [ ] Uploader l'avatar et les logos (FD Formation, Digital Campus, Lycée Montesquieu) via l'admin (export depuis le Figma). Affichage prêt : logos sur les cartes de `/` et `/print` (à la place des icônes), avatar en haut à gauche du hero, dans le footer et en tête de la sidebar `/print`
- [x] `revalidatePath("/", "layout")` après chaque écriture (`/`, `/print`, mentions légales) ; lien « Voir le site »
- [x] `/admin` en `noindex` (le sitemap arrive en phase 9 : ne pas l'y ajouter) + `frame-ancestors 'self'` sur `/admin`
- [x] Skill `check-security` (Invariants elwen.dev) déroulée sur l'admin, findings corrigés (réglages Supabase Auth durcis)

## Phase 9 : SEO & GEO · skill utilisateur `seo-geo-boost`

- [x] Metadata : title (~55 car.), description (~155 car.), canonical `https://cv.elwen.dev`, Open Graph + Twitter Card
- [x] Image OG 1200×630 générée (`opengraph-image.tsx`) aux couleurs du CV
- [x] JSON-LD `ProfilePage` + `Person` (`jobTitle`, `alumniOf`, `knowsAbout`, `sameAs` LinkedIn/GitHub, `worksFor`)
- [x] `sitemap.ts`, `robots.ts` (bloque `/admin`, `/print`), `llms.txt`
- [x] Date de mise à jour visible (depuis `cv_profile.updated_at`)
- [ ] Rich Results Test sans erreur

## Phase 10 : Sécurité

- [x] CSP complète avec nonce (proxy Next 16) : `default-src 'self'`, `script-src 'self' 'nonce-…' 'strict-dynamic'`, `img-src` Supabase, `connect-src` Supabase, `frame-ancestors` inchangé (désormais dans la CSP du proxy, pas dans `next.config.ts`) ; nonce passé au script inline du loader via `InlineScript` ; pages rendues par requête (`connection()` dans le layout), données mises en cache (`unstable_cache`, tag `cv`) ; `'wasm-unsafe-eval'` pour le décodeur du monogramme
- [x] Vérifier qu'aucune clé `service_role` n'existe dans le repo ni dans Vercel pour ce projet (historique git et 3 variables Vercel contrôlés)
- [ ] `npm audit --omit=dev` propre ; CodeQL vert
- [ ] Skill `check-security` complète avant la mise en prod

## Phase 11 : Accessibilité & performance finales · skill `cv-a11y-perf`

- [ ] Lighthouse mobile : Perf ≥ 90, A11y = 100, Best Practices ≥ 95, SEO = 100
  - Mesuré en local (`next start`, preset mobile, serveur à chaud) : Perf 93, A11y 96, Best Practices 100, SEO 100 ; TBT 30 ms, CLS 0, LCP simulé 3,1 s (observé sans throttling : 50 ms). Manifeste corrigé (mots non révélés en `--text-muted` au lieu d'une opacité 0.15). Reste 1 contraste signalé sur le sous-titre du hero : faux positif probable (texte clair sur le dégradé/canvas WebGL, que Lighthouse ne résout pas, il retient le fond crème du body). À re-mesurer sur le déploiement Vercel (LCP et A11y)
- [ ] axe DevTools sans violation ; VoiceOver macOS + iOS sur tout le parcours
- [ ] Core Web Vitals : LCP < 2,5 s, INP < 200 ms, CLS < 0,1 (Vercel Speed Insights une fois en ligne)
- [ ] Test sur vrais appareils : iPhone Safari, Android Chrome, MacBook trackpad (inertie Lenis)

## Phase 12 : Intégration au portfolio

- [ ] Skill utilisateur `portfolio-embed-check` sur `cv.elwen.dev` : verdict « prêt pour le mode iframe »
- [ ] Ajouter le projet dans le backoffice du portfolio (`projects` : `display_mode = 'iframe'`, `url = https://cv.elwen.dev`, logo, taille de fenêtre par défaut)
- [ ] Tester dans le vrai portfolio : ouverture, resize continu, minimize/restore, mode iOS plein écran, impression PDF depuis l'iframe
- [ ] (Optionnel) Menus de la barre macOS du portfolio via le canal `postMessage` `elwen-os` (miroir de `../adobe-apps/src/lib/portfolio-channel.ts`) : « Fichier > Télécharger en PDF », « Aller à > section »
- [ ] (Optionnel, à décider) Faire lire les notes CV du portfolio depuis les tables `cv_*` pour n'avoir qu'une source de contenu

## Phase 13 : Mise en prod

- [ ] `CHANGELOG.md` à jour, tag `v1.0.0`, release GitHub
- [ ] Social preview GitHub 1280×640
- [ ] Lien vers `cv.elwen.dev` depuis LinkedIn / GitHub profile

## Version anglaise (i18n FR/EN)

- [x] Colonnes `*_en` nullables dans `cv_*` (repli sur le français si vide) et traductions initiales (migration `20261005090000_add_english_translations.sql`)
- [x] Routage sans lib : `/` en français, `/en` en anglais (le proxy réécrit `/en/...` vers la route sans préfixe et pose l'en-tête `x-locale`) ; admin jamais accessible sous un préfixe
- [x] Libellés d'interface dans `src/lib/i18n/messages.ts` (typé : une clé manquante dans une langue casse le typecheck), données localisées par `localizeCv`
- [x] SEO : `lang`, hreflang + canonical par langue, sitemap avec alternates, JSON-LD, llms.txt et image Open Graph par langue
- [x] Page imprimable, mentions légales, 404 et sélecteur de langue (lien FR/EN dans la capsule, pas de détection ni de redirection automatique)
- [x] Champs `*_en` dans le backoffice `/admin` (profil et chaque liste traduite), vides = repli sur le français
- [x] Relire les traductions anglaises (rédigées à partir du texte français)

## Hors périmètre v1 (à rediscuter plus tard)

- Lettre de motivation (le kit Figma en contient une)
- Section projets (déjà couverte par le portfolio)
