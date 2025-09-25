# Razkazvach — Stripe Paywall & Audio (Bite #3)

## Prereqs

- Node 20 (see `.nvmrc`), pnpm via `corepack enable`

## Setup

1. `cp .env.example .env.local` and adjust as needed. See `.env.example` for auth, Meili and storage vars.
2. Install deps: `pnpm install`.
3. Start dev services (Postgres, Valkey/Redis, Meili, Mailpit, etc.): `docker compose -f docker-compose.services.yml up -d`.
4. Run migrations and seed: `pnpm dlx prisma migrate dev --name init_core` then `pnpm db:seed`. Apply new migrations via `pnpm dlx prisma migrate dev` when schema changes.
5. Configure `.env.local` (see `.env.example`) with Stripe price IDs, ElevenLabs credentials and Redis connection.

## Dev

- `pnpm dev` — start Next dev server.
- `pnpm worker:tts` — start the ElevenLabs queue worker (BullMQ + Valkey).
- `pnpm lint` / `pnpm format` — code quality.
- `pnpm typecheck` — TS types.
- `pnpm test` — unit tests (webhook handler, queue job, access guard, etc.).
- `pnpm e2e` — end-to-end tests (builds and runs the app; requires Postgres + Redis running).
- `pnpm db:seed` — seed database with admin user and demo stories.

Mailpit captures magic link emails at [http://localhost:8025](http://localhost:8025).

## Stripe subscriptions

- `/api/pay/checkout` creates a Stripe Checkout session for the selected plan (monthly / semiannual / annual). A user must be signed in.
- `/api/pay/webhook` processes Stripe webhooks and keeps `Subscription` rows up-to-date. Run `stripe listen --forward-to http://localhost:3000/api/pay/webhook` in development and copy the signing secret to `STRIPE_WEBHOOK_SECRET`.
- Successful checkout sets the subscription to `active`. Updates/cancelations are idempotent thanks to `WebhookReceipt`.

## Paywall & Premium access

- Story APIs and the SSR reader (`/prikazki/[slug]`) rely on helpers in `lib/entitlements.ts` to enforce free-rotation or premium access.
- Non-premium users hitting a non-free story are redirected to `/paywall`, which offers upgrade plans and posts to `/api/pay/checkout`.
- After payment, Stripe redirects to `/pay/success`; cancelations go to `/pay/cancel`.

## ElevenLabs audio queue

- Publishing a story triggers a BullMQ job (`tts` queue) via Valkey/Redis.
- The worker (`pnpm worker:tts`) generates audio through ElevenLabs, stores it via the storage adapter, and upserts `AudioAsset` rows. Logs are emitted for observability.
- Audio files are served via `/api/assets/...` and rendered in the reader when available.

## Webhooks & queue

- `WebhookReceipt` keeps Stripe webhooks idempotent and auditable.
- Queue retries are exponential with logging. Jobs are safe to retry.

## Testing

- Unit coverage includes the Stripe webhook handler, queue job, and access guard helpers.
- E2E coverage verifies paywall redirects for non-premium readers (requires seeded story & running services).

## Manual QA checklist

1. `docker compose -f docker-compose.services.yml up -d`
2. `pnpm dev` (web) and `pnpm worker:tts` (queue) in separate terminals.
3. Sign in, publish a story and confirm `[tts]` logs show job completion; audio player appears in the reader.
4. Visit the story while signed out (or with a fresh user) → redirected to `/paywall`.
5. Start a Stripe Checkout session from `/paywall`, complete payment via Stripe test card, confirm webhook updates subscription to `active`, and the story loads without paywall.

Uploaded files are stored under `./uploads` and served via `/api/assets/*`.

Type safety: NextAuth uses JWT strategy with module augmentation (`types/next-auth.d.ts`).

## CI

GitHub Actions runs lint → typecheck → unit → build → e2e for pushes and PRs to `main`.

## Docker (production image)

- `docker build -t razkazvach:latest .`
