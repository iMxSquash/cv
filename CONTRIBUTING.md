# Contributing

This repository is my personal resume website. Bug reports (accessibility, rendering, performance) are very welcome; feature contributions are not expected.

## Setup

See the [README](./README.md#installation) for installation and available scripts.

## Workflow

1. Create a branch from `main`, named `type/short-description` (e.g. `feat/hero-section`, `fix/pin-overlap`).
2. Follow the code style already in use and the rules in [`CLAUDE.md`](./CLAUDE.md) (non-negotiable points: server-rendered content, single animation loop, reduced motion support, no SVG uploads).
3. Commit using [Conventional Commits](https://www.conventionalcommits.org/): `type(scope): description`, in English, imperative present tense, lowercase, no trailing period, 72 characters max.
4. Open a pull request against `main` using the PR template. CI must be green before merging (squash and merge).

## Testing and linting

- `npm run lint`: ESLint
- `npm run typecheck`: TypeScript
- `npm test`: Vitest
- `npm run format:check`: Prettier
- `npm run build`: production build

## Reporting bugs and ideas

Use the issue templates (bug report or feature request). Security issues: see [SECURITY.md](./SECURITY.md), never a public issue.
