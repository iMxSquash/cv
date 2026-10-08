---
name: cv-design-system
description: Design system du CV (cv.elwen.dev) issu de la maquette Figma « Supa Resume » d'Elwen. Tokens couleurs/typo/ombres, échelle typographique web, thèmes crème/sombre par section, composants récurrents (badges, cartes, capsule nav), et version A4 imprimable fidèle au Figma. À charger avant de styler un composant, d'ajouter une couleur ou une police, ou de travailler sur la version imprimable/PDF.
---

# Design system

Source : Figma `0xFIzZIyxruyvJlxDVLimS`, node `316:11498` (CV A4). Relire la maquette via le MCP Figma (`get_screenshot`, `get_design_context`) en cas de doute sur un détail.

## Écart assumé avec le Figma : palette « aurore » (web)

Bleu nuit, menthe et périwinkle, reprise du fluid mesh gradient preset 5 (tedious-illuminate-877120.framer.app). Valeurs de `globals.css` (source de vérité, `/print`, l'image OG et le gradient du hero suivent) : `Primary/Default` #4CC9A4 (menthe, 1.86:1 sur ivoire : jamais en texte sur clair, en thème clair `--accent-display` prend `Primary/Dark`), `Primary/Dark` #0E6555 (6.30:1 sur ivoire), `Primary/Darkest` #050B1F (fond sombre et base du hero), `Primary/Lighter` #D6F3EA, `Primary/Lightest` #F1F4F2 (jamais de blanc pur), `--palette-primary-light` #6FD0C8 (10.74:1 sur sombre), `Secondary/Default` #6F7FC4 (périwinkle, halo du hero), `--palette-secondary-dark` #3E4C93 (7.42:1), `Status/Info` #6FD0C8 (frange cyan), gris teintés bleu nuit. `Status/Success` reste vert. Le tableau ci-dessous garde les valeurs Figma d'origine : recalculer toute paire avant usage.

## Tokens Figma (valeurs exactes extraites)

| Token Figma         | Valeur                                                                 | Usage web                                          |
| ------------------- | ---------------------------------------------------------------------- | -------------------------------------------------- |
| `Primary/Default`   | `#9251F7`                                                              | accent principal (mots-clés, nav active, CTA)      |
| `Primary/Dark`      | `#5531A7`                                                              | texte accent sur fond clair (contraste AA)         |
| `Primary/Darkest`   | `#170F2E`                                                              | **fond sombre** des sections « dark »              |
| `Primary/Lighter`   | `#EFE2F9`                                                              | badges (« Actuel »)                                |
| `Primary/Lightest`  | `#F8F2FC`                                                              | **fond crème/clair** des sections « light »        |
| `Secondary/Default` | `#516CF7`                                                              | 2e couleur du gradient                             |
| `Secondary/Light`   | `#95AAFB`                                                              | gradient, survols                                  |
| `Secondary/Lighter` | `#E1E7FE`                                                              | surfaces secondaires                               |
| `Status/Info`       | `#22C3F1`                                                              | 3e couleur du gradient (touche froide)             |
| `Status/Success`    | `#4AC06F`                                                              | indicateur « disponible »                          |
| `Gray/Darker`       | `#2E2E48`                                                              | texte principal sur clair                          |
| `Gray/Dark`         | `#47516B`                                                              | texte secondaire sur clair                         |
| `Gray/Default`      | `#79819A`                                                              | métadonnées (dates, lieux) : vérifier le contraste |
| `Gray/Light`        | `#ACB1C3`                                                              | bordures, séparateurs                              |
| `Gray/Lightest`     | `#E2E6EE`                                                              | bordures légères                                   |
| `Gray/Lightest 2`   | `#F7F9FC`                                                              | cartes sur fond clair                              |
| `Social/Linkedin`   | `#0077B5`                                                              | icône LinkedIn uniquement                          |
| `Shadow/sm`         | `0 2px 8px #0000000F`                                                  |                                                    |
| `Elevation/Light`   | `inset 0 1px 1px #0000000A, 0 6px 24px #0000000A, 0 1px 4px #0000000D` | cartes                                             |
| `Blur/Large`        | blur 64                                                                | halos de fond                                      |

**Contrastes mesurés (WCAG 2.2, seuil 4.5:1 texte normal, 3:1 texte large ≥ 24 px ou 18.66 px gras)** :

| Paire                                        | Ratio | Verdict                                                                                                                            |
| -------------------------------------------- | ----- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `Gray/Default` #79819A sur `#F8F2FC`         | 3.52  | texte large uniquement ; petit texte en `Gray/Dark` (7.19)                                                                         |
| `Primary/Default` #9251F7 sur `#F8F2FC`      | 4.03  | **échoue en petit texte** : mots-clés du paragraphe en `Primary/Dark` #5531A7 (8.01), `Primary/Default` réservé aux titres/display |
| `Primary/Default` #9251F7 sur `#170F2E`      | 4.14  | idem sur fond sombre : petit texte accent en `Secondary/Light` ou une teinte primaire éclaircie, à mesurer                         |
| `Primary/Dark` sur `Primary/Lighter` (badge) | 7.10  | OK                                                                                                                                 |
| `#F8F2FC` sur `#170F2E`                      | 16.69 | OK                                                                                                                                 |
| blanc sur `Status/Info` #22C3F1              | 2.07  | **échoue** : aucun texte blanc sur la zone cyan du gradient                                                                        |

Toute nouvelle paire texte/fond est mesurée avant d'être utilisée.

## Mise en œuvre

- Tokens en **CSS custom properties** dans `src/app/globals.css`, exposés à Tailwind v4 via `@theme` (`--color-primary`, `--color-surface-dark`…). Jamais une couleur hexadécimale dans un composant.
- **Source unique = `globals.css`** : palette brute en `--palette-*` sur `:root`, variables sémantiques (`--surface`, `--surface-raised`, `--text`, `--text-muted`, `--accent-text`, `--accent-display`, `--focus-ring`, `--interface-color`) redéfinies par `[data-theme="light|dark"]`, puis exposées à Tailwind via `@theme inline` (`bg-surface`, `text-accent`, `text-display-xl`…). La scène WebGL (phase 5) lira ces variables au montage (`getComputedStyle`) : **pas de miroir TS**.
- Couleurs hors Figma, ajoutées pour le contraste : `--palette-primary-light` #C9A8FB (texte accent sur sombre, 9.16:1), `--palette-surface-dark-raised` #231942 (cartes sur sombre, 14.81:1 avec le texte) et `--palette-secondary-dark` #3A4FD0 (petit texte bleu sur clair, 6.20:1 sur `Gray/Lightest 2`, compétences « Développement » de `/print`).
- Thèmes de section via `data-theme="light|dark"` sur chaque `<section>` (la règle de base `[data-theme]` peint fond et texte, aucune classe à ajouter) ; `--interface-color` donne la couleur de l'UI fixe (nav) pour la section à l'écran, branché en phase 4.
- Icônes : `@tabler/icons-react` (même bibliothèque que le portfolio) via `CvIcon` (`src/components/icons/CvIcon.tsx`), clé → composant ; drapeaux en SVG locaux (`Flag.tsx`).

## Typographie

- **Outfit** (titres, nom, phrases géantes) et **DM Sans** (texte, métadonnées), via `next/font/google`, `display: "swap"`, sous-ensemble `latin`, exposées à Tailwind en `--font-display` (`font-display`) et `--font-sans` (police par défaut).
- Utilitaires partagés dans `globals.css` : `section-shell` (padding de section), `title-section` (titre de section, display L), `title-card` (titre de carte).
- Le Figma est en échelle A4 (titres 16 px) : sur le web, échelle fluide en `clamp()` :
  - display XL (nom hero, phrases cinétiques) : `clamp(3rem, 14vmin, 14rem)`, `letter-spacing: -0.025em`, line-height 0.9
  - display L (titres de section) : `clamp(2.25rem, 8vmin, 6rem)`
  - H3 (cartes) : `clamp(1.25rem, 2vw, 1.75rem)` Outfit Medium
  - body : 1rem à 1.125rem DM Sans, line-height 1.5
  - caption : 0.875rem, jamais en dessous de 12 px rendu
- Dimensionner les textes des sections pinnées sur `min(vw, vh)` pour tenir dans 700×450.

## Composants récurrents (reprendre l'esprit du Figma)

- **Badge** (« Actuel », « Travail à distance ») : pill `Primary/Lighter` + texte `Primary/Dark`.
- **Carte expérience/éducation** : logo carré arrondi, rôle en `Gray/Default`, entreprise en Outfit, dates + lieu à droite (empilés en mobile). Fond `Gray/Lightest 2`, `Elevation/Light`.
- **Puce compétence** : texte `Primary` centré, détail secondaire (`+ Tailwind`) en caption.
- **Capsule nav** : pill translucide (backdrop-blur léger), liens en DM Sans.
- **Icônes** : tools et réseaux via `CvIcon` (Tabler), choisis dans l'admin par une clé (`icon_key`) ; jamais de SVG uploadé.
- Drapeaux langues : emoji drapeau ou SVG local, toujours accompagnés du nom de la langue en texte.

## Version A4 imprimable (`/print`)

- Route dédiée qui reproduit **fidèlement la maquette Figma** (sidebar gauche avec photo, contact, réseaux, langues, mobilité ; colonne droite À propos, Expériences, Éducation, Compétences, Tools) à partir des **mêmes données Supabase**.
- `@page { size: A4; margin: 0 }` (dans `src/app/print/print.css`, importé par la seule route `/print`), feuille de 210 × 297 mm, `print-color-adjust: exact`, aucune animation, aucune WebGL, `noindex`.
- Cotes internes en **points** : le Figma A4 mesure 594 × 842, soit 1 px Figma ≈ 1 pt. Les styles de texte Figma sont des tokens `text-print-*` (`h1` 16 pt, `h2` 12 pt, `h3` 9 pt, `body-1` 8 pt, `body-2` 7 pt, `caption-1` 6 pt, `caption-2` 5 pt) ; les halos de la sidebar sont la classe `print-halos` de `print.css` (dégradés radiaux, imprimés pareil partout, contrairement aux `filter: blur`).
- Écarts assumés avec le Figma pour le contraste AA : `Gray/Default` → `Gray/Dark` pour les libellés et `Gray/Darker` pour les valeurs ; mots-clés et titre en `Primary/Dark` au lieu du dégradé ; compétences en `Primary/Dark` / `Secondary/Dark`.
- Composants : `src/components/print/` (`PrintSidebar`, `PrintContent` en frise verticale, `PrintControls` qui lance `window.print()` une fois `document.fonts.ready`). La feuille garde sa taille physique : une fenêtre étroite la fait défiler horizontalement dans `<main>`, jamais la page.
- Bouton « Télécharger le CV (PDF) » dans le footer de la page principale : ouvre `/print` qui déclenche `window.print()` (l'utilisateur choisit « Enregistrer en PDF »). Pas de génération PDF serveur (pas de Chromium headless : coût et surface d'attaque injustifiés).
- Vérifier que le rendu tient sur **une seule page A4** avec le contenu actuel ; si le contenu déborde, réduire l'échelle via une variable plutôt que tronquer.
