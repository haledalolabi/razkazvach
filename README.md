# Razkazvach — Foundation (Bite #2)

## Prereqs

- Node 20 (see `.nvmrc`), pnpm via `corepack enable`

## Setup

1. `cp .env.example .env.local` and adjust as needed. See `.env.example` for auth, Meili and storage vars.
2. Install deps: `pnpm install`.
3. Start dev services (Postgres, Meili, Mailpit, etc.): `docker compose -f docker-compose.services.yml up -d`.
4. Run migrations and seed: `pnpm dlx prisma migrate dev --name init_core` then `pnpm db:seed`.

## Dev

- `pnpm dev` — start Next dev server.
- `pnpm lint` / `pnpm format` — code quality.
- `pnpm typecheck` — TS types.
- `pnpm test` — unit tests.
- `pnpm e2e` — end-to-end tests (builds and runs the app).
- `pnpm db:seed` — seed database with admin user and demo stories.

Mailpit captures magic link emails at [http://localhost:8025](http://localhost:8025).

Admin routes (`/admin`) require `ADMIN` or `EDITOR` role and redirect unauthenticated users to `/auth/signin`.

Uploaded files are stored under `./uploads` and served via `/api/assets/*`.

Type safety: NextAuth uses JWT strategy with module augmentation (`types/next-auth.d.ts`).

## CI

GitHub Actions runs lint → typecheck → unit → build → e2e for pushes and PRs to `main`.

## Docker (production image)

- `docker build -t razkazvach:latest .`
