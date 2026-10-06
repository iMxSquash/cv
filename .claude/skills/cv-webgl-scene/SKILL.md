---
name: cv-webgl-scene
description: Scène three.js du CV (cv.elwen.dev) en vanilla three.js. Architecture renderer unique + canvas fixe, gradient animé en shader, grain, monogramme 3D extrudé, liaison avec GSAP/ScrollTrigger, budgets GPU, dispose, fallback sans WebGL. À charger avant tout code qui importe three, écrit un shader GLSL, ou ajoute un effet visuel 3D.
---

# Scène WebGL

## Architecture (décision actée)

- **three.js vanilla**, pas de React Three Fiber : une seule scène continue derrière toute la page, pilotée par le scroll, sans réconciliation React. React ne fait que monter/démonter.
- **Un seul `WebGLRenderer`, un seul `<canvas>`** en `position: fixed; inset: 0; z-index: 0; pointer-events: none`, `aria-hidden="true"`. Le DOM du CV est au-dessus. Jamais un canvas par section (limite de contextes WebGL, coût mémoire).
- Code dans `src/webgl/` (aucun import React) :

```
src/webgl/
  Experience.ts        // owns renderer, camera, clock; mount(canvas) / dispose()
  scenes/HeroGradient.ts   // fullscreen plane + gradient shader
  scenes/Monogram.ts       // extruded 3D initials
  shaders/*.glsl.ts        // GLSL as exported template strings (no loader plugin)
  uniforms.ts              // shared uniforms: uTime, uScroll, uPointer, uTheme
```

- Montage : `src/components/webgl/WebGLBackground.tsx` charge `WebGLCanvas.tsx` en `next/dynamic` avec `ssr: false` (après le premier paint, pour ne pas pénaliser le LCP). `WebGLCanvas` rend un conteneur fixe `aria-hidden` ; **`Experience` crée son propre `<canvas>` dedans et le retire au `dispose()`** : un canvas dont le contexte a été perdu par `forceContextLoss()` ne peut plus accueillir de renderer (remontage Strict Mode, fast refresh).
- `<html data-webgl="ready">` est posé à la première frame : le canvas apparaît en fondu et le fallback CSS du hero (`hero-gradient-fallback`) s'efface (variante Tailwind `in-data-[webgl=ready]:`).
- **Boucle** : `gsap.ticker.add(experience.render)`, jamais de `requestAnimationFrame` propre ni `renderer.setAnimationLoop`.
- **Scroll vers WebGL** : les ScrollTriggers des sections écrivent dans des uniforms ou propriétés (`gsap.to(uniforms.uProgress, { value: 1, scrollTrigger })`). La scène ne lit jamais `window.scrollY` elle-même.

## Effets prévus (adaptés de la référence)

1. **Gradient animé du hero** : plan plein écran, shader fragment de type « mesh gradient » (bruit simplex 2D/3D qui déforme des UV, mélange de 3 à 4 couleurs). Couleurs = tokens du design system (primaire `#9251F7`, secondaire `#516CF7`, info `#22C3F1`, une touche chaude possible), lues au montage dans les variables CSS de `globals.css` (`src/webgl/palette.ts`, `getComputedStyle`, pas de miroir TS) et passées en uniforms (jamais en dur dans le GLSL). Grain léger (bruit hash) pour casser le banding.
2. **Monogramme 3D** : le logo existant du portfolio (`../portfolio/public/logo.svg`), modélisé dans **Blender** (voir « Pipeline Blender » ci-dessous) et chargé en `.glb` avec `GLTFLoader`. Matériau `MeshPhysicalMaterial` léger (transmission désactivée sur mobile) ou matcap pour le coût. Rotation douce vers le pointeur (lerp), grossit et se centre au scroll du hero.
3. **Visuels gradient des phrases de trajectoire** (section `experiences`) : de préférence en **CSS** (gradients + grain SVG) plutôt qu'en WebGL ; WebGL seulement si l'effet l'exige.
4. **Orbe protagoniste** : **metaballs 2D** sur un plan plein écran (`scenes/Blob.ts`, `shaders/blob.glsl.ts`), présentes de la fin du hero au footer. Jusqu'à 8 formes (`BLOB_SHAPES`), chacune un rectangle arrondi en px CSS (un cercle quand ses demi-tailles valent son rayon de coin) ; chaque forme ajoute un champ `(s / (s + d))²` (d sa distance signée, s son rayon de coin), seuil à 1 : les formes fusionnent comme des gouttes. Des cercles empilés de rayon `r / sqrt(n)` forment exactement un cercle de rayon r (`splitRadius`), donc les écarter divise l'orbe à aire constante. Pour un cercle seul, `z = sqrt(1 - 1/champ)` est la hauteur exacte d'une sphère : même rendu verre/fresnel que l'ancienne sphère 3D. `panel` (0..1) fond ce rendu vers le dégradé plat des panneaux d'expériences ; `hole` (centre, rayon) découpe un cercle dans l'orbe. Le canvas est **transparent** (`alpha: true`, clear alpha 0) : la surface de la page (`<html>`, fondue par `usePageTheme`) se voit partout où rien n'est dessiné ; le gradient du hero ne peint que le cadre (`scrollProgress.heroFrame`, SDF de rectangle arrondi). Gradient et blob utilisent `CustomBlending` pour rester dans la passe opaque, ordonnés par `renderOrder` (gradient, monogramme, blob). Côté DOM, `src/components/scroll/orbDirector.ts` décide qui pose l'orbe : chaque section la revendique (`claimOrb`) à partir d'un point de scroll, la dernière revendication passée gagne, et sa pose (formes, `panel`, `isLocked`, `isVisible`) est écrite à chaque frame sur le ticker. Les `OrbAnchor` (points finaux en dégradé CSS) sont ses points d'atterrissage, suivis par `useOrbTrail` sauf `isFollowed={false}`. Le blob lisse ses formes (`FOLLOW_SPEED`), sauf verrouillé ou réapparaissant (saut direct). Sans mouvement ni WebGL : pas d'orbe, les `OrbAnchor` et les panneaux CSS restent visibles.

Ne pas ajouter d'effet qui n'est pas dans cette liste sans le proposer d'abord (YAGNI).

## Pipeline Blender (MCP `blender`)

Blender sert **uniquement aux objets 3D modélisés** (aujourd'hui : le monogramme). Le gradient, le grain et l'orbe restent des shaders en code : Blender n'apporte rien à un effet procédural plein écran.

Pourquoi Blender plutôt que `ExtrudeGeometry` au runtime : biseaux arrondis propres (le côté brillant du logo de la référence), topologie maîtrisée, possibilité de baker l'éclairage ou une matcap, et pas de `SVGLoader` ni de calcul de géométrie dans le bundle client.

1. Avant tout script : `get_addon_status` (version) puis `get_scene_info` (scène existante), conformément aux instructions du MCP.
2. Importer `../portfolio/public/logo.svg` (courbes), le logo est dessiné en négatif (lettres en creux dans un bloc) : vérifier visuellement quelle forme extruder et me montrer le résultat avant d'aller plus loin.
3. Extrusion + biseau arrondi, application des modificateurs, origine centrée, échelle ~1 unité de large, normales propres. Pas de géométrie inutile (decimate si besoin) : viser < 10 k triangles.
4. Matériau simple (le vrai rendu est fait en three.js) ; si une matcap ou une texture bakée est utilisée, 512 px max en WebP/KTX2.
5. `get_viewport_screenshot` pour valider, puis export **glTF binaire** (`.glb`, Y up, modificateurs appliqués, sans caméras ni lumières) vers `public/models/monogram.glb`, compressé (meshopt ou Draco ; meshopt évite de charger un décodeur WASM). Cible < 50 Ko.
6. Source `.blend` versionnée dans `design/3d/monogram.blend` (régénérer le `.glb` depuis elle, jamais retoucher le `.glb` à la main).
7. Fallback (pas de WebGL, reduced motion) : le même logo en SVG inline dans le DOM.

Si un autre objet 3D est envisagé plus tard (ex. icônes 3D des tools), le proposer d'abord et suivre le même pipeline.

## Budgets et performances

- `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))` ; sur `pointer: coarse` plafonner à 1.5.
- `antialias: false` pour le plan plein écran (inutile), `powerPreference: "high-performance"`.
- **Pause** : ne pas rendre quand `document.hidden`, ni quand aucune section WebGL n'est visible (flag mis par ScrollTrigger). Le ticker reste, la fonction `render` retourne tôt.
- Resize : `ResizeObserver` sur le canvas, debounce 100 ms, met à jour caméra + `setSize(w, h, false)`.
- Géométries/matériaux créés une fois, réutilisés. Pas d'allocation (`new Vector3`) dans la boucle de rendu.
- Bundle : `import { WebGLRenderer, ... } from "three"` (tree-shaking), loaders depuis `three/examples/jsm/...` uniquement si utilisés. Mesurer le chunk WebGL (< 200 Ko gzip visé).
- Cible : 60 fps sur MacBook Air M1, 30+ fps sur iPhone récent.

## Dispose (obligatoire)

`Experience.dispose()` : `geometry.dispose()`, `material.dispose()`, textures, `renderer.dispose()`, `renderer.forceContextLoss()`, retrait du ticker et des observers. Appelé au démontage du composant (fast refresh compris). Vérifier dans `renderer.info.memory` que les compteurs reviennent à 0.

## Fallbacks

- **Pas de WebGL** (test `canvas.getContext("webgl2")`) ou erreur de contexte : ne pas monter la scène ; le hero affiche un **dégradé CSS statique** équivalent (mêmes tokens) et le monogramme en SVG.
- **`prefers-reduced-motion: reduce`** : rendre une seule frame (gradient figé, monogramme statique), pas de boucle.
- `webglcontextlost` : écouter, arrêter le rendu, basculer sur le fallback CSS.

## Accessibilité

Le canvas est décoratif : `aria-hidden="true"`, aucun texte uniquement dans la WebGL. Le contraste du texte posé sur le gradient animé doit rester ≥ 4.5:1 sur **toutes** les couleurs du gradient. Mise en œuvre : le shader plafonne la luminance relative (WCAG, espace linéaire) à `MAX_GRADIENT_LUMINANCE` = 0.11 (`HeroGradient.ts`), ce qui garantit 5.8:1 pour le nom et 3.2:1 pour le sous-titre display ; le fallback CSS applique le même plafond (`color-mix(in srgb-linear, …, black)`). Vérifier sur plusieurs frames (luminance max mesurée sur captures, texte masqué).
