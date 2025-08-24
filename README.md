# Razkazvach — Backend Slice (Bite #2)

## Prereqs

- Node 20 (see `.nvmrc`), pnpm via `corepack enable`

## Setup

1. `cp .env.example .env.local` and adjust as needed.
2. Install deps: `pnpm install`.
3. Start dev services: `docker compose -f docker-compose.services.yml up -d`.
   - Includes Postgres, Valkey, MeiliSearch and Mailpit (dev SMTP UI at http://localhost:8025).
4. Run migrations: `pnpm dlx prisma migrate dev --name init_core`.
5. Seed data & admin user: `pnpm db:seed`.

## Dev

- `pnpm dev` — start Next dev server.
- `pnpm lint` / `pnpm format` — code quality.
- `pnpm typecheck` — TS types.
- `pnpm test` — unit tests.
- `pnpm e2e` — end-to-end tests (builds and runs the app).
- `pnpm db:seed` — seed the database.

## CI

GitHub Actions runs lint → typecheck → unit → build → e2e for pushes and PRs to `main`.

## Docker (production image)

- `docker build -t razkazvach:latest .`

## Auth & Admin

- Visit `/auth/signin`, enter your email, then open Mailpit at http://localhost:8025 and click the magic link.
- The seed script boots an admin user `admin@example.com`.
- Admin routes under `/admin` require role `ADMIN` or `EDITOR`.

## Storage

Uploaded assets are stored under `./uploads` by the local storage adapter and served via `/api/assets/*`.
