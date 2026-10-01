---
name: cv-design-system
description: Design system du CV (cv.elwen.dev) issu de la maquette Figma « Supa Resume » d'Elwen. Tokens couleurs/typo/ombres, échelle typographique web, thèmes crème/sombre par section, composants récurrents (badges, cartes, capsule nav), et version A4 imprimable fidèle au Figma. À charger avant de styler un composant, d'ajouter une couleur ou une police, ou de travailler sur la version imprimable/PDF.
---

# Design system

Source : Figma `0xFIzZIyxruyvJlxDVLimS`, node `316:11498` (CV A4). Relire la maquette via le MCP Figma (`get_screenshot`, `get_design_context`) en cas de doute sur un détail.

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
- Les mêmes valeurs sont exportées en TS (`src/lib/theme.ts`) pour les uniforms WebGL : **une seule définition**, l'autre est dérivée (ex. lire les variables CSS au montage, ou générer le CSS depuis le TS ; choisir une approche et s'y tenir).
- Thèmes de section via `data-theme="light|dark"` sur chaque `<section>` ; la nav lit `--current-interface-color`.

## Typographie

- **Outfit** (titres, nom, phrases géantes) et **DM Sans** (texte, métadonnées), via `next/font/google`, `display: "swap"`, sous-ensemble `latin`, variables CSS `--font-display` / `--font-body`.
- Le Figma est en échelle A4 (titres 16 px) : sur le web, échelle fluide en `clamp()` :
  - display XL (nom hero, phrases cinétiques) : `clamp(4rem, 14vw, 14rem)`, `letter-spacing: -0.025em`, line-height 0.9
  - display L (titres de section) : `clamp(2.5rem, 7vw, 6rem)`
  - H3 (cartes) : `clamp(1.25rem, 2vw, 1.75rem)` Outfit Medium
  - body : 1rem à 1.125rem DM Sans, line-height 1.5
  - caption : 0.875rem, jamais en dessous de 12 px rendu
- Dimensionner les textes des sections pinnées sur `min(vw, vh)` pour tenir dans 700×450.

## Composants récurrents (reprendre l'esprit du Figma)

- **Badge** (« Actuel », « Travail à distance ») : pill `Primary/Lighter` + texte `Primary/Dark`.
- **Carte expérience/éducation** : logo carré arrondi, rôle en `Gray/Default`, entreprise en Outfit, dates + lieu à droite (empilés en mobile). Fond `Gray/Lightest 2`, `Elevation/Light`.
- **Puce compétence** : texte `Primary` centré, détail secondaire (`+ Tailwind`) en caption.
- **Capsule nav** : pill translucide (backdrop-blur léger), liens en DM Sans.
- **Icônes** : tools et réseaux en composants SVG locaux (`src/components/icons/`), choisis dans l'admin par une clé (`icon_key`) ; jamais de SVG uploadé.
- Drapeaux langues : emoji drapeau ou SVG local, toujours accompagnés du nom de la langue en texte.

## Version A4 imprimable (`/print`)

- Route dédiée qui reproduit **fidèlement la maquette Figma** (sidebar gauche avec photo, contact, réseaux, langues, mobilité ; colonne droite À propos, Expériences, Éducation, Compétences, Tools) à partir des **mêmes données Supabase**.
- `@page { size: A4; margin: 0 }`, mise en page en `mm`, `print-color-adjust: exact`, aucune animation, aucune WebGL, `noindex`.
- Bouton « Télécharger le CV (PDF) » dans le footer de la page principale : ouvre `/print` qui déclenche `window.print()` (l'utilisateur choisit « Enregistrer en PDF »). Pas de génération PDF serveur (pas de Chromium headless : coût et surface d'attaque injustifiés).
- Vérifier que le rendu tient sur **une seule page A4** avec le contenu actuel ; si le contenu déborde, réduire l'échelle via une variable plutôt que tronquer.
