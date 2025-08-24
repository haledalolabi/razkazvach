# Razkazvach — Backend Slice (Bite #2)

## Prereqs

- Node 20 (see `.nvmrc`), pnpm via `corepack enable`

## Setup

1. `cp .env.example .env.local` and adjust as needed (Auth, Meili, storage).
2. Install deps: `pnpm install`.
3. Start dev services: `docker compose -f docker-compose.services.yml up -d` (postgres, meili, valkey, mailpit).

## Dev

- `pnpm dev` — start Next dev server.
- `pnpm lint` / `pnpm format` — code quality.
- `pnpm typecheck` — TS types.
- `pnpm test` — unit tests.
- `pnpm e2e` — end-to-end tests.
- `pnpm db:seed` — seed database with demo stories and admin user.

### Admin login

Use magic link auth via Mailpit:

1. Visit `/auth/signin` and enter the admin email from seed (default `admin@example.com`).
2. Open [http://localhost:8025](http://localhost:8025) to read the email and click the link.
3. `/admin` now accessible for role `ADMIN`/`EDITOR`.

### Search & Storage

- MeiliSearch runs at `localhost:7700`. `/api/search` and `/search` provide basic querying.
- Uploaded assets stored under `./uploads` and served through `/api/assets/*`.

## CI

GitHub Actions runs lint → typecheck → unit → build → e2e for pushes and PRs to `main`.

## Docker (production image)

- `docker build -t razkazvach:latest .`
