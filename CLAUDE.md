@AGENTS.md

# cv : CV immersif d'Elwen Coussot (cv.elwen.dev)

Le CV d'Elwen sous forme de **longue page immersive au scroll** (GSAP + ScrollTrigger + Lenis + three.js), inspirée de [guillaumezhu.com](https://guillaumezhu.com) et adaptée au contenu et à la charte du CV Figma. Le site est :

- **public** sur `https://cv.elwen.dev` (SEO complet, indexable) ;
- **embarqué en iframe** dans le portfolio macOS (`elwen.dev`, repo `../portfolio`) comme une app ;
- **éditable via un backoffice** `/admin` (Supabase, **même projet que le portfolio**).

Roadmap : `TODO.md`, en phases avec cases à cocher. **Cocher les cases au fur et à mesure**, dans le même commit que le travail correspondant.

## Stack (décisions actées, ne pas rediscuter)

- **Next.js 16 (App Router) + TypeScript strict + Tailwind v4**, un seul déploiement Vercel
- **GSAP + ScrollTrigger** (chorégraphie) ; **Lenis** (smooth scroll, une seule instance pilotée par le ticker GSAP)
- **three.js vanilla** (pas de React Three Fiber) : **un seul renderer / un seul canvas** fixe en arrière-plan pour toute la page
- **Supabase** (projet `portfolio`, ref `pxfauyqwldigcxjfynzz`) : tables préfixées `cv_*`, bucket `cv-assets`, même compte Auth que le portfolio, inscriptions désactivées
- Polices de la maquette Figma : **Outfit** (titres) + **DM Sans** (texte) via `next/font/google`
- Contenu en français ; code, commentaires, commits en anglais

## Points non négociables

- **Le contenu est du HTML rendu côté serveur, la WebGL n'est qu'un décor.** Tout le CV (textes, dates, liens) existe dans le DOM sémantique, lisible sans JS, sans WebGL et avec `prefers-reduced-motion`. Le canvas est `aria-hidden="true"` et ne porte jamais d'information exclusive.
- **`frame-ancestors 'self' https://elwen.dev https://www.elwen.dev`** dans `next.config.ts` : condition d'existence de l'embed. Jamais de `X-Frame-Options`.
- **Une seule boucle d'animation** : `gsap.ticker` pilote Lenis ET le rendu three.js. Pas de `requestAnimationFrame` concurrent.
- **Tout ScrollTrigger / tween est nettoyé** (`useGSAP` ou `gsap.context().revert()`), toute ressource three.js est `dispose()`. Zéro fuite au démontage (fast refresh, navigation).
- **`prefers-reduced-motion`** : pas de smooth scroll, pas de pin long, pas de scrub ; contenu statique complet. Géré via `gsap.matchMedia()`, jamais en dupliquant les composants.
- **Contenu géré dans Supabase uniquement** (rien en dur dans les composants, sauf libellés d'interface). RLS sur toutes les tables `cv_*`.
- **Admin** : proxy (`src/proxy.ts`) **+** re-vérification `supabase.auth.getUser()` dans chaque Server Action ; validation serveur de chaque entrée ; `revalidatePath("/")` après chaque écriture.
- **Upload** : png/webp/jpeg/avif uniquement, **SVG refusé** (XSS stockée), MIME + magic bytes vérifiés côté serveur, nom de fichier régénéré.
- **Vie privée** : tout ce qui est stocké dans une table `cv_*` est lisible publiquement via l'API (la RLS filtre des lignes, pas des colonnes). Ne jamais y stocker une donnée « masquée » : téléphone non publié = champ vide ; adresse limitée à ville + code postal.
- Utilisable dès **~700×450** (fenêtre du portfolio), mobile dès 360 px ; liens sortants en `target="_blank" rel="noopener noreferrer"`.

## Skills : à charger AVANT de coder la partie concernée

**Projet** (`.claude/skills/`) :

| Skill                    | Quand                                                                                                |
| ------------------------ | ---------------------------------------------------------------------------------------------------- |
| `cv-scroll-choreography` | Tout ce qui bouge au scroll : Lenis, ScrollTrigger, pins, scrub, storyboard des sections, nav scroll |
| `cv-webgl-scene`         | Tout code three.js : renderer, shaders (gradient, grain), monogramme 3D, perfs GPU, fallback         |
| `cv-design-system`       | Tokens Figma, typo, couleurs, thèmes crème/sombre par section, composants, version A4 imprimable     |
| `cv-admin-data`          | Schéma `cv_*`, RLS, migrations, `/admin`, Server Actions, uploads, revalidation                      |
| `cv-a11y-perf`           | Accessibilité d'une page immersive, budgets Core Web Vitals, protocole de vérification Playwright    |

**Utilisateur** (`~/.claude/skills/`) :

| Skill                                                           | Quand                                                                    |
| --------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `gsap-core`, `gsap-framer-scroll-animation`, `gsap-performance` | Référence API GSAP officielle, en complément de `cv-scroll-choreography` |
| `implement_lenis_scroll`                                        | Mise en place initiale de Lenis                                          |
| `portfolio-embed-check`                                         | Avant chaque mise en prod : valider l'embed dans le portfolio            |
| `seo-geo-boost`                                                 | Metadata, JSON-LD `Person`/`ProfilePage`, sitemap, robots, llms.txt      |
| `accessibility`                                                 | Audit WCAG 2.2 AA en fin de phase                                        |

**Sécurité** : la skill `check-security` du portfolio (`../portfolio/.claude/skills/check-security/`) contient la section « Invariants elwen.dev » qui couvre AUSSI ce repo. La dérouler avant chaque merge touchant admin/auth/Supabase/uploads et avant chaque mise en prod.

## Outils disponibles

- **MCP Supabase** : inspecter le schéma (`list_tables`), appliquer les migrations versionnées de `supabase/migrations/` (jamais de SQL ad hoc non versionné), générer les types (`generate_typescript_types` vers `src/lib/database.types.ts`), lancer `get_advisors` après chaque migration.
- **MCP Figma** : maquette de référence du CV (fichier `0xFIzZIyxruyvJlxDVLimS`, node `316:11498`). Variables déjà extraites dans `cv-design-system`.
- **MCP Blender** : modéliser les objets 3D (aujourd'hui uniquement le monogramme), exportés en `.glb` compressé dans `public/models/`, source `.blend` dans `design/3d/`. Pipeline dans `cv-webgl-scene`. Les effets procéduraux (gradient, grain, orbe) restent des shaders en code.
- **MCP Playwright** : vérifier chaque section dans un vrai navigateur (scroll, reduced motion, 700×450, mobile) avant de considérer une tâche terminée.

## Rappels pièges (détails dans les skills)

- Lenis dans une iframe : fonctionne, mais le scroll se fait dans le document de l'iframe ; ne jamais toucher `window.top`.
- `ScrollTrigger.refresh()` après chargement des polices et des images, sinon les positions de pin sont fausses.
- Safari iOS : `100dvh`, barre d'adresse qui change la hauteur ; `ScrollTrigger.config({ ignoreMobileResize: true })`.
- three.js : `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))`, pause du rendu quand l'onglet est caché ou la section hors champ.
- Le contenu en iframe est crédité au sous-domaine : SEO complet sur `cv.elwen.dev`, pas sur le portfolio.

## Git

- Branche principale `main`, jamais de commit direct ; branches `type/description-courte` (`feat/hero-section`)
- Conventional Commits en anglais, impératif, < 72 caractères ; un commit = un changement logique
- PR obligatoire vers `main`, CI verte requise, squash and merge
- **Jamais de `Co-Authored-By` ni de mention d'IA** dans les commits, PR ou le code
