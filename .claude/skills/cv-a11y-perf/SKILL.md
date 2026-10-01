---
name: cv-a11y-perf
description: Accessibilité (WCAG 2.2 AA) et performance (Core Web Vitals) d'une page immersive au scroll pour le CV (cv.elwen.dev), plus le protocole de vérification Playwright à dérouler avant de considérer une section terminée. À charger après avoir codé ou modifié une section, avant une PR, et pour tout travail sur le chargement, les polices, les images, le focus ou la navigation clavier.
---

# Accessibilité & performance d'une page immersive

Une page « à la guillaumezhu.com » est facile à rendre inaccessible et lourde. Ces règles sont la contrepartie non négociable des effets.

## Structure sémantique

- Un seul `<h1>` (le nom), un `<h2>` par section, `<h3>` pour les cartes. Ordre du DOM = ordre de lecture = ordre visuel.
- Landmarks : `<header>` (capsule nav), `<main id="content">`, `<nav aria-label="Sections">` (scroll indicator), `<footer>`. **Skip link** « Aller au contenu » premier élément focusable.
- Expériences et éducation : `<ol>` avec `<article>` par entrée ; dates en `<time datetime="2025-09">`.
- Compétences : listes `<ul>` par catégorie, même si l'affichage est une pile de cartes.
- Texte cinétique découpé en lettres : spans `aria-hidden="true"` + texte complet en `.sr-only`. Le lecteur d'écran lit la phrase une fois, normalement.
- Canvas WebGL et décors : `aria-hidden="true"`. Images de logos : `alt` = nom de l'entreprise/école ; images purement décoratives : `alt=""`.
- `<html lang="fr">`, `<title>` et meta description uniques.

## Mouvement

- `prefers-reduced-motion: reduce` = aucune animation déclenchée par le scroll, pas de smooth scroll, pas de pin. Contenu intégral visible. Tester systématiquement (Playwright `emulateMedia({ reducedMotion: "reduce" })`).
- Rien ne clignote plus de 3 fois par seconde. Le gradient animé reste lent.
- Aucune information ne dépend d'une animation (ex. la face arrière d'une carte flip est aussi lisible sans flip).
- Pas de scroll-jacking qui empêche d'atteindre un contenu : clavier (Espace, PageDown, flèches, Tab) et molette parcourent toute la page, y compris les sections pinnées.

## Clavier & focus

- Tout élément interactif est un `<a>` ou `<button>` natif ; cibles ≥ 44×44 px.
- Focus visible personnalisé (`:focus-visible`, contraste ≥ 3:1 sur fonds crème ET sombre), jamais `outline: none` seul.
- Quand le focus atterrit dans une section pinnée, elle doit être scrollée à l'écran (Lenis peut décaler : vérifier `scrollIntoView` / `lenis.scrollTo` sur `focusin` si besoin).
- Nav des sections : `aria-current="location"` sur la section active.
- Loader : `role="status"`, ne piège pas le focus, ne dure pas plus de 1,5 s, ne réapparaît pas dans la session.

## Contraste

Voir le tableau mesuré dans `cv-design-system`. Rappels : `Primary/Default` (#9251F7) échoue en petit texte sur crème et sur sombre ; aucun texte blanc sur la zone cyan du gradient. Le texte sur le gradient animé est vérifié sur plusieurs frames.

## Performance (cibles : LCP < 2,5 s, INP < 200 ms, CLS < 0,1 en mobile 4G)

- **LCP = le nom du hero (texte)**, rendu en HTML serveur avec la police préchargée : il ne dépend ni de JS ni de WebGL. Le canvas apparaît en fondu par-dessus le fallback CSS.
- WebGL et code d'animation lourd chargés en `next/dynamic` après le premier paint. GSAP core + ScrollTrigger + Lenis dans le bundle initial acceptés (petits).
- Polices : `next/font` (auto-hébergées, `display: swap`), 2 familles max, poids limités à ceux utilisés.
- Images : `next/image`, dimensions explicites, `priority` uniquement sur la photo du hero si elle est au-dessus de la ligne de flottaison, AVIF/WebP.
- **CLS** : les sections pinnées ont une hauteur réservée en CSS dès le SSR (wrapper `--pin-height`), pas calculée en JS après coup. Le loader est en overlay `fixed` (pas de décalage).
- **INP** : pas de travail lourd dans les handlers ; `pointermove` du monogramme écrit dans une variable lue par la boucle de rendu.
- Budget JS initial : < 170 Ko gzip hors chunk WebGL. Mesurer avec `next build` (sortie de taille des routes).

## Protocole de vérification (avant de cocher une section dans `TODO.md`)

Via le MCP Playwright, sur `npm run dev` :

1. **1440×900** : scroll complet de la section, captures à 0 %, 50 %, 100 % de sa progression ; console sans erreur ni warning.
2. **700×450** (fenêtre portfolio) et **390×844** (mobile) : mêmes captures, aucun débordement horizontal (`document.documentElement.scrollWidth <= innerWidth`).
3. **Reduced motion** : `emulateMedia({ reducedMotion: "reduce" })`, recharger, tout le contenu est visible sans scroll animé.
4. **Clavier** : Tab depuis le haut de page, le focus est visible et ne se perd jamais derrière une section pinnée.
5. **Sans JS** (optionnel en dev, obligatoire avant prod) : le contenu du CV est lisible.
6. **Fuites** : après navigation `/` vers `/print` puis retour, `ScrollTrigger.getAll().length` revient à la même valeur.

Avant mise en prod, en plus : Lighthouse mobile (Performance ≥ 90, Accessibilité = 100, Best Practices ≥ 95, SEO = 100), axe DevTools sans violation, test VoiceOver sur Safari macOS et iOS.
