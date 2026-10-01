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
