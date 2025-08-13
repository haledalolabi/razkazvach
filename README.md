# Razkazvach

## Setup

1. Copy `.env.example` to `.env.local` and update values.
2. Install dependencies with `pnpm install`.
3. Generate Prisma client: `pnpm prisma:generate`.
4. Run migrations: `pnpm prisma:migrate`.
5. Seed database: `pnpm prisma:seed`.
6. Start dev server: `pnpm dev`.

## Health Endpoints

Each endpoint expects `x-health-secret: $HEALTH_SECRET` header in non-development environments.

- `/api/health`
- `/api/health/db`
- `/api/health/redis`
- `/api/health/search`
- `/api/health/email?to=you@example.com`
- `/api/health/stripe`
- `/api/health/storage`

See [docs/env.md](./docs/env.md) for required environment variables.
