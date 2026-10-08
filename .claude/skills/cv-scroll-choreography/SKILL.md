---
name: cv-scroll-choreography
description: Chorégraphie au scroll du CV (cv.elwen.dev) avec GSAP, ScrollTrigger et Lenis. Storyboard section par section adapté de guillaumezhu.com, setup Lenis + ticker GSAP, patterns de pin/scrub/texte cinétique, navigation de sections, nettoyage, reduced motion. À charger avant tout code qui anime quelque chose au scroll, qui crée un ScrollTrigger, qui touche Lenis ou la navigation entre sections.
---

# Chorégraphie au scroll

Référence visuelle : [guillaumezhu.com](https://guillaumezhu.com) (page ~35 écrans, sections pinnées, alternance fonds crème/sombre, texte cinétique géant). On reprend **la grammaire de mouvement**, pas le contenu : chaque section du CV Figma devient une « scène ».

## Storyboard (ordre des sections = ordre du DOM)

Hauteurs indicatives en écrans (`vh`) de scroll, à ajuster au ressenti. Chaque section a un `id` stable (ancres + nav).

| #   | `id`          | Contenu CV (Supabase)                      | Mise en scène                                                                                                                                                                                                                                                    | Fond              |
| --- | ------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| 0   | (loader)      | initiales                                  | Loader une fois par session (`sessionStorage`), monogramme qui se dessine, sortie en masque. Jamais bloquant > 1,5 s, `role="status"`.                                                                                                                           | sombre            |
| 1   | `hero`        | nom, titre, photo                          | Bloc arrondi encadré (inset 8 à 16 px), gradient WebGL animé, nom géant en Outfit, **monogramme 3D** devant le texte qui tourne avec le pointeur. Au scroll : le texte s'écarte, le monogramme grossit et centre (≈ 3 vh, pin).                                  | gradient          |
| 2   | `manifesto`   | citation + « À propos »                    | Citation « People ignore design that ignore people. » en **texte horizontal géant** qui défile au scroll avec ondulation des lettres (pin ≈ 4 vh). Puis le paragraphe « À propos » révélé mot à mot (opacité 0.15 vers 1, scrub), mots-clés en couleur primaire. | crème             |
| 3   | `experiences` | expériences (3) + éducation (2)            | Phrases de trajectoire centrées, une par étape (« Graphiste bénévole. », « Concepteur & développeur. »…), visuels gradient qui glissent de chaque côté (pattern « I bridge »). Puis cartes détail (entreprise, dates, mode, badge « Actuel »). Pin ≈ 8 à 10 vh.  | sombre puis crème |
| 4   | `skills`      | compétences Design / Développement + Tools | Pattern « Toolkit » : titre + sous-titre qui bascule (« Design » / « Développement »), **pile de cartes** qui se retournent une à une (flip 3D CSS), une carte par compétence, couleur par catégorie. Les Tools ferment la pile. Pin ≈ 5 vh.                     | sombre            |
| 5   | `infos`       | langues, mobilité, disponibilité           | Bento compact (drapeaux, permis, Navigo, télétravail), apparition en stagger. Pas de pin : respiration avant la fin.                                                                                                                                             | crème             |
| 6   | `next`        | CTA disponibilité + contact + liens        | Phrase sur un **chemin courbe** (SVG `textPath`) en dégradé primaire, qui avance au scroll, orbe qui suit ; puis footer contact (email, LinkedIn, GitHub, FreeCodeCamp, PDF).                                                                                    | sombre            |

Barre de nav latérale (pattern `scroll-indicator`) : une barre par section, la barre active s'allonge (12 → 28 → 48 px), `<nav aria-label>` avec de vrais `<a href="#id">` et `aria-current="location"`. Menu capsule en haut (glass léger) qui se cache au scroll vers le bas, réapparaît vers le haut.

Transitions de thème : quand une section franchit le milieu de l'écran (ScrollTrigger `onToggle`, dans `ScrollChrome`), son `data-theme` est recopié sur l'UI fixe (nav latérale, capsule), qui hérite ainsi de tous les tokens du thème (`--interface-color`, `--surface`, `--focus-ring`…) et transitionne en CSS. Le curseur (s'il arrive) suit le même principe.

## Transition de page en vague

Un clic sur un lien `#section` (nav, hors section courante) joue `PageTransition` au lieu du scroll animé de Lenis. `SmoothScroll` appelle `runPageTransition` (`transitionRunner.ts`, registre comme `orbDirector`), qui lui prête `lock` / `jump` / `unlock` (Lenis `stop`, `scrollTo` immédiat forcé, `start`). Séquence (une seule timeline GSAP) : l'orbe sort de l'écran par le coin bas droit (`sendOrbTo` vers un point hors champ, formes en retard échelonné, effet liquide) ; une vague naît de ce point hors champ, rien n'apparaît avant elle. Elle est faite du dégradé de l'orbe lui-même : au départ, la scène dessine l'orbe gonflée en un cercle géant (`scrollProgress.coverRequest`, `Experience.captureCover`, taille de dégradé `uGradientSize`) et la copie dans un canvas 2D de l'overlay, que `clip-path: path()` (`waveShape.ts`) découpe en vague ; le saut de scroll se fait sous le recouvrement et l'orbe est téléportée hors champ en haut à gauche (`teleportOrbTo`) ; le nom de la section s'écrit ; la deuxième vague (`path(evenodd)`, rectangle moins le disque ondulé) révèle la section, et l'orbe est relâchée (`releaseOrb`) quand la vague approche du coin haut gauche. L'overlay est `aria-hidden`, la cible reçoit le focus ; pas de transition en reduced motion. Les clics pendant la transition sont ignorés (`isPageTransitionRunning`).

## Setup (une seule fois, dans `src/components/scroll/SmoothScroll.tsx`)

```tsx
"use client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect } from "react";

gsap.registerPlugin(ScrollTrigger);

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const lenis = new Lenis({ autoRaf: false });
      lenis.on("scroll", ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      return () => {
        gsap.ticker.remove(tick);
        lenis.destroy();
      };
    });
    return () => mm.revert();
  }, []);
  return children;
}
```

- **Une seule instance Lenis**, créée dans `SmoothScroll`. Jamais `new Lenis()` ailleurs. Pas de contexte React : les ancres passent par l'écouteur délégué ci-dessous ; n'en ajouter un que si un composant doit appeler `scrollTo` hors d'un lien.
- `gsap.ticker` est l'unique boucle : la scène three.js s'y abonne aussi (voir `cv-webgl-scene`).
- `ScrollTrigger.config({ ignoreMobileResize: true })` ; `ScrollTrigger.refresh()` après `document.fonts.ready` et le chargement des images du hero.
- Ancres : un écouteur `click` délégué sur `document` (dans `SmoothScroll`) intercepte tout `<a href="#id">` : `lenis.scrollTo`, `pushState` du hash, focus sur la cible. Aucun `onClick` à câbler sur les liens. Sans Lenis (reduced motion), comportement natif. Au chargement, `ScrollTrigger.refresh()` après polices + `load`, puis re-saut vers le hash.

## Patterns

**Toujours** dans un composant client avec `useGSAP` (`@gsap/react`, déjà installé) ou `gsap.context` + `revert()` au démontage, et **scopé** au ref de la section :

```tsx
useGSAP(
  () => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=400%",
            pin: true,
            scrub: true,
          },
        })
        .to(".manifesto__track", { xPercent: -100, ease: "none" });
    });
  },
  { scope: root },
);
```

- **Pin** : préférer un wrapper de hauteur explicite (`.section__pin-height`) + `position: sticky` quand c'est suffisant ; `pin: true` seulement si sticky ne marche pas (transforms parents). Ne jamais pinner un élément dont un parent a un `transform`.
- **Texte cinétique** : découpage en lettres côté serveur (spans `aria-hidden`) + texte complet dans un `<span class="sr-only">` ; jamais de SplitText sur du contenu sans alternative lisible. GSAP SplitText est gratuit depuis 3.13 et accepte `aria: "auto"`, utilisable si plus simple.
- **Ondulation des lettres** : `y` et `rotation` par lettre = fonction sinus de (index, progression) dans un `onUpdate`, en `quickSetter` (pas de tween par lettre par frame).
- **Révélation mot à mot** : `scrub: true`, `stagger` sur l'opacité, pas sur la couleur (repaint).
- **Cartes flip** : `rotationY` 0 → 180 avec `transform-style: preserve-3d` et `backface-visibility: hidden` ; le texte de la face arrière reste dans le DOM.
- **textPath** : animer `startOffset` (attribut SVG) via un objet proxy et `onUpdate`, pas de lib en plus.
- N'animer que `transform` et `opacity` (voir `gsap-performance`). Pas de `filter: blur` animé sur de grandes surfaces.
- `will-change` uniquement pendant l'animation active.

## Reduced motion

`gsap.matchMedia()` avec deux branches : `no-preference` (tout) et `reduce` (aucun pin, aucun scrub, sections en flux normal, simples fondus ≤ 200 ms ou rien). Le texte cinétique s'affiche en une ligne statique lisible, la pile de cartes devient une grille. Tester les deux branches à chaque section (voir `cv-a11y-perf`).

## Responsive et iframe

- Breakpoints via `mm.add({ isDesktop: "(min-width: 900px)", isMobile: "(max-width: 899px)" }, ...)` : sur mobile, pins plus courts (diviser les durées par ~2), cartes en carrousel horizontal ou grille.
- Fenêtre du portfolio à 700×450 : les pins doivent rester lisibles avec 450 px de haut (textes en `clamp()` basé sur `min(vw, vh)`).
- Resize continu dans le portfolio : ScrollTrigger se rafraîchit seul ; debouncer tout calcul maison.

## Checklist avant de terminer une section

- [ ] Contenu complet lisible JS désactivé et en reduced motion
- [ ] `useGSAP`/`context` scopé, aucun trigger orphelin après navigation (`ScrollTrigger.getAll().length` stable)
- [ ] 60 fps sur la section (Performance panel, CPU x4 throttle acceptable à 30 fps)
- [ ] 700×450, 390×844, 1440×900 vérifiés via Playwright
- [ ] Ancre `#id` fonctionnelle depuis la nav et en URL directe
