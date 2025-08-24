# Razkazvach — Backend slice (Bite #2)

## Prereqs

- Node 20 (see `.nvmrc`), pnpm via `corepack enable`

## Setup

1. `cp .env.example .env.local` and adjust as needed. Key vars:
   - `AUTH_SECRET`, `EMAIL_FROM`, `EMAIL_SERVER`
   - `MEILI_HOST`, `MEILI_API_KEY`, `MEILI_INDEX_STORIES`
   - `ASSETS_DIR`, `ASSETS_PUBLIC_BASE`
2. Install deps: `pnpm install`.
3. Start dev services (postgres, meili, valkey, mailpit):
   `docker compose -f docker-compose.services.yml up -d`.
4. Run migrations and seed:
   `pnpm dlx prisma migrate dev --name init_core` and `pnpm db:seed`.

## Dev

- `pnpm dev` — start Next dev server.
- `pnpm lint` / `pnpm format` — code quality.
- `pnpm typecheck` — TS types.
- `pnpm test` — unit tests.
- `pnpm e2e` — end-to-end tests (builds and runs the app).
- `pnpm db:seed` — seed DB with demo stories and admin user.

## CI

GitHub Actions runs lint → typecheck → unit → build → e2e for pushes and PRs to `main`.

## Docker (production image)

- `docker build -t razkazvach:latest .`

## Auth & Admin

- Visit `/auth/signin` and submit your email. For dev, open Mailpit at `http://localhost:8025` to grab the magic link.
- The seeded admin email is `admin@example.com` (change via `SEED_ADMIN_EMAIL`).
- Admin pages under `/admin` require `ADMIN` or `EDITOR` role.

## Search & Storage

- MeiliSearch runs on `http://localhost:7700` (see `docker-compose.services.yml`).
- Local assets are written under `./uploads` and served via `/api/assets/*`.
