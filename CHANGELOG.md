# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Gradient footer: a drifting arch of layered CSS gradients rises behind a giant name fitted to the page width, the contact block fades up on scroll and links get a slide-through underline. No WebGL, static under reduced motion.
- English version of the resume at `/en` (home, printable A4 page, legal notice, 404, `llms.txt`, Open Graph image), with nullable `*_en` columns in the `cv_*` tables that fall back to French, a typed message dictionary, hreflang alternates in metadata and sitemap and a FR/EN link in the top capsule. The `/admin` forms edit the English fields next to the French ones.
- Per-request nonce Content-Security-Policy set by the proxy (scripts via nonce and `strict-dynamic`, images and network limited to the site and Supabase), with unit tests.

- Next.js 16 project setup with TypeScript, Tailwind v4, ESLint, Prettier and Vitest.
- GSAP, Lenis, three.js, Supabase and Zod dependencies.
- Baseline security headers, including `frame-ancestors` for the elwen.dev portfolio embed.
- Project documentation, Claude Code skills, roadmap (`TODO.md`) and GitHub repository templates.
- Supabase schema for the resume (`cv_*` tables with row level security, `cv-assets` storage bucket) and initial content seeded from the Figma resume.
- Typed public Supabase client and `getCv()` loader; the home page now renders the profile from the database.
- Formatting helpers for the about text keywords and French date ranges, with unit tests.
- Design system from the Figma resume: color tokens with light and dark section themes, Outfit and DM Sans fonts, fluid type scale, skip link and focus styles.
- Base UI components (badge, card, skill chip, icons, flags) and a first server-rendered version of every resume section.
- Closing "next" section with an email call to action, and a site footer with contact links and a legal notice link.
- Legal notice page (`/mentions-legales`) and a custom 404 page.
- Machine-readable `<time>` dates on experiences and education.
- Scroll engine: a single Lenis smooth scroll driven by the GSAP ticker (native scroll under reduced motion), with trigger refresh once fonts and images are loaded.
- Side section navigation (scroll indicator) and a top capsule menu that hides while scrolling down; both follow the light or dark theme of the section on screen.
- WebGL background scene (three.js, single renderer on the GSAP ticker, lazy-loaded after first paint): animated mesh gradient in the hero with a luminance cap that keeps the text contrast, and a 3D "EC" monogram modelled in Blender that turns towards the pointer. Static frame under reduced motion, CSS gradient fallback without WebGL 2 or after a context loss.
- Intro loader that draws the "EC" monogram then wipes away, in pure CSS (1.4 s), played once per session and never without JS or under reduced motion.
- Pinned hero scene: a rounded frame over the WebGL gradient where the name splits apart and fades while the 3D monogram grows to the center. Stays in flow, without pin, under reduced motion or without JS.
- Manifesto scene: the quote crosses a pinned stage as one giant rippling line, then the about text lights up word by word as it scrolls into view.
- Experiences scene: the journey told one step at a time (roles and degrees in chronological order) between two gradient panels, then the detail cards rise into view.
- Skills scene (from 900 px wide): a face-down deck where each skill card flips over then flies off, tools closing the pile, while the subtitle follows the current category. Smaller screens and reduced motion keep the grid.
- Infos bento (availability, languages, mobility) whose tiles rise into view one after the other.
- Closing scene: the availability sentence travels along a gradient curve until it settles in the middle, trailed by a glowing WebGL orb, before the email call to action and the footer.
- Printable A4 version (`/print`, not indexed) laid out as the Figma resume from the same data, exactly one page, and a "Télécharger le CV (PDF)" button in the footer that opens it with the print dialog.
- Backoffice (`/admin`, not indexed, never framed cross-origin): Supabase sign-in, one page per resume entity (profile, experiences, education, skills, tools, languages, links, mobility) with create and edit forms, reordering, visibility toggle and confirmed deletion. Server-side validation with Zod schemas mirroring the database constraints.
- Avatar and logo uploads (PNG, JPEG, WebP or AVIF, 5 MB, checked by magic bytes): logos on the experience and education cards of the resume and the A4 version, avatar in the hero corner, the footer and the A4 sidebar, once uploaded.
- SEO and GEO: page metadata, canonical URLs, Open Graph and Twitter cards generated from the Supabase profile, a 1200×630 Open Graph image, `ProfilePage` + `Person` JSON-LD, `sitemap.xml`, `robots.txt` (blocks `/admin` and `/print`, allows AI crawlers), a Markdown `/llms.txt` of the whole resume, and the last update date in the footer.

### Changed

- Pages are rendered per request (required by the nonce CSP); the resume reads are cached with the `cv` tag and dropped by every `/admin` write, with a daily expiry as a safety net. The "Actuel" badge is now always current.
