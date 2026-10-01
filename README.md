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
  app/            routes: / (resume), /print (A4 version), /admin (backoffice)
  components/     React components (sections, scroll, webgl mount, ui)
  lib/            Supabase clients, data queries, Zod schemas, theme tokens
  webgl/          framework-free three.js scene (renderer, shaders)
supabase/
  migrations/     versioned SQL migrations (cv_* tables, RLS, cv-assets bucket)
.claude/skills/   project skills used by Claude Code during development
```

The roadmap lives in [`TODO.md`](./TODO.md); development conventions in [`CLAUDE.md`](./CLAUDE.md).

## Architecture notes

- **Content first**: the whole resume is server-rendered semantic HTML. Animations (GSAP, Lenis) and the WebGL scene are progressive enhancements, disabled under `prefers-reduced-motion`.
- **Single animation loop**: `gsap.ticker` drives Lenis and the three.js renderer.
- **Shared Supabase project**: this app only owns `cv_*` tables and the `cv-assets` bucket. Row Level Security is enabled on every table.
- **Embeddable**: `frame-ancestors` allows the elwen.dev portfolio to load the site in an iframe.

## Deployment

Vercel project linked to this repository, with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `NEXT_PUBLIC_SITE_URL` set for Production and Preview, and the `cv.elwen.dev` domain. Every push to `main` deploys to production; pull requests get preview deployments.

## License

The source code is released under the [MIT License](./LICENSE). The resume content, photos and personal branding are not covered by this license.
