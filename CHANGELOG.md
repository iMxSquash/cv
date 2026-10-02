# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

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
- Daily revalidation of the static pages so the "Actuel" badge stays accurate.
- Scroll engine: a single Lenis smooth scroll driven by the GSAP ticker (native scroll under reduced motion), with trigger refresh once fonts and images are loaded.
- Side section navigation (scroll indicator) and a top capsule menu that hides while scrolling down; both follow the light or dark theme of the section on screen.
- WebGL background scene (three.js, single renderer on the GSAP ticker, lazy-loaded after first paint): animated mesh gradient in the hero with a luminance cap that keeps the text contrast, and a 3D "EC" monogram modelled in Blender that turns towards the pointer. Static frame under reduced motion, CSS gradient fallback without WebGL 2 or after a context loss.
- Intro loader that draws the "EC" monogram then wipes away, in pure CSS (1.4 s), played once per session and never without JS or under reduced motion.
- Pinned hero scene: a rounded frame over the WebGL gradient where the name splits apart and fades while the 3D monogram grows to the center. Stays in flow, without pin, under reduced motion or without JS.
