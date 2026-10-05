# cv

[![CI](https://github.com/iMxSquash/cv/actions/workflows/ci.yml/badge.svg)](https://github.com/iMxSquash/cv/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

Elwen Coussot's resume as an immersive scroll-driven website, editable from a backoffice: [cv.elwen.dev](https://cv.elwen.dev). It is also embedded as an app in the [elwen.dev](https://elwen.dev) portfolio.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router), TypeScript (strict), Tailwind CSS v4
- [GSAP](https://gsap.com) + ScrollTrigger, [Lenis](https://lenis.darkroom.engineering) smooth scroll, [three.js](https://threejs.org)
- [Supabase](https://supabase.com) (Postgres + Auth + Storage), shared with the portfolio project
- [Zod](https://zod.dev) for server-side validation, [Vitest](https://vitest.dev) for tests
- Deployed on [Vercel](https://vercel.com)

## Prerequisites

- Node.js 24 (see `.nvmrc`)
- Access to the `portfolio` Supabase project (public URL and anon key)

## Installation

```bash
git clone https://github.com/iMxSquash/cv.git
cd cv
npm install
cp .env.example .env.local   # then fill in the Supabase values
npm run dev                  # http://localhost:3000
```

## Scripts

| Script                 | Description                    |
| ---------------------- | ------------------------------ |
| `npm run dev`          | Start the development server   |
| `npm run build`        | Production build               |
| `npm run start`        | Serve the production build     |
| `npm run lint`         | ESLint                         |
| `npm run typecheck`    | TypeScript type checking       |
| `npm test`             | Vitest test suite              |
| `npm run format`       | Format the codebase (Prettier) |
| `npm run format:check` | Check formatting (used in CI)  |

## Project structure

Target layout, built progressively (see `TODO.md`):

```
src/
  app/            routes: / (resume), /print (A4 version), /admin (backoffice),
                  plus SEO files (sitemap, robots, llms.txt, Open Graph image)
  assets/fonts/   static TTF fonts for the generated Open Graph image (OFL)
  components/     React components (sections, scroll, webgl mount, ui)
  lib/            Supabase clients, data queries, Zod schemas, theme tokens
  webgl/          framework-free three.js scene (renderer, shaders)
public/models/    compressed glTF models loaded by the scene
design/3d/        Blender sources of the models (regenerate the .glb from them)
supabase/
  migrations/     versioned SQL migrations (cv_* tables, RLS, cv-assets bucket)
.claude/skills/   project skills used by Claude Code during development
```

The roadmap lives in [`TODO.md`](./TODO.md); development conventions in [`CLAUDE.md`](./CLAUDE.md).

## Architecture notes

- **Content first**: the whole resume is server-rendered semantic HTML. Animations (GSAP, Lenis) and the WebGL scene are progressive enhancements: under `prefers-reduced-motion` animations are off and the scene renders a single still frame; without WebGL 2 the hero keeps a CSS gradient.
- **Single animation loop**: `gsap.ticker` drives Lenis and the three.js renderer.
- **Shared Supabase project**: this app only owns `cv_*` tables and the `cv-assets` bucket. Row Level Security is enabled on every table.
- **Content Security Policy**: `src/proxy.ts` sends a per-request nonce CSP (`src/lib/security/csp.ts`) on every page: scripts run only through the nonce (`strict-dynamic`), images and network calls are limited to the site and the Supabase origin. The nonce forces dynamic rendering, so the root layout calls `connection()` and the resume reads are cached with `unstable_cache` (tag `cv`, dropped by `/admin` writes) instead of the HTML. Inline scripts must read the nonce from the `x-nonce` request header.
- **Embeddable**: the CSP's `frame-ancestors` allows the elwen.dev portfolio to load the site in an iframe. `/admin` gets `frame-ancestors 'self'` (never framed cross-origin). A header set by the proxy replaces one from `next.config.ts`, so this directive lives only in the proxy.
- **Backoffice `/admin`**: sign-in with the portfolio's Supabase account (sign-ups must stay disabled in Supabase Auth). `src/proxy.ts` refreshes the session and redirects anonymous visitors, but it is only a first gate: every page and Server Action re-checks the user with `getUser()` (`src/lib/admin/auth.ts`), then validates its input with the Zod schemas of `src/lib/cv/schemas.ts`, which mirror the SQL constraints. Each write drops the cached resume data, so every public page shows it on the next request.
- **Languages**: `/` is French and `/en` is English, with no i18n library. `src/proxy.ts` rewrites `/en/...` to the unprefixed route and sets the `x-locale` request header (read by `getLocale()` in `src/lib/i18n/server.ts`); `/en/admin` is never served. UI labels live in the typed dictionary `src/lib/i18n/messages.ts`; resume text comes from the `*_en` columns of the `cv_*` tables, applied by `localizeCv` (`src/lib/cv/localize.ts`) with a fallback to French when empty. The `/admin` forms edit each `*_en` field next to its French one (an empty one stores null).
- **SEO and GEO**: titles, descriptions, Open Graph image, JSON-LD (`src/lib/cv/seo.ts`) and `/llms.txt` (`src/lib/cv/llms.ts`) are all derived from the Supabase content at render time, never hardcoded. `NEXT_PUBLIC_SITE_URL` sets the canonical origin (production URL when unset).
- **Uploads**: the browser sends images straight to the `cv-assets` bucket through a one-shot signed URL (Server Action bodies are capped at 1 MB); the save action then checks the stored file's magic bytes (PNG, JPEG, WebP, AVIF; never SVG), and replaced or rejected files are removed from the bucket.

## Deployment

Vercel project linked to this repository, with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `NEXT_PUBLIC_SITE_URL` set for Production and Preview, and the `cv.elwen.dev` domain. Every push to `main` deploys to production; pull requests get preview deployments.

## License

The source code is released under the [MIT License](./LICENSE). The resume content, photos and personal branding are not covered by this license.
