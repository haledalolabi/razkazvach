# Razkazvach — Foundation (Bite #1)

## Prereqs

- Node 20 (see `.nvmrc`), pnpm via `corepack enable`

## Setup

1. `cp .env.example .env.local` and adjust as needed.
2. Install deps: `pnpm install`.
3. (Optional) Start dev services: `docker compose -f docker-compose.services.yml up -d`.

## Dev

- `pnpm dev` — start Next dev server.
- `pnpm lint` / `pnpm format` — code quality.
- `pnpm typecheck` — TS types.
- `pnpm test` — unit tests.
- `pnpm e2e` — end-to-end tests (builds and runs the app).

## CI

GitHub Actions runs lint → typecheck → unit → build → e2e for pushes and PRs to `main`.

## Docker (production image)

- `docker build -t razkazvach:latest .`
