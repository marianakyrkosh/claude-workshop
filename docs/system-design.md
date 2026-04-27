# System design

Why the workshop starter is shaped the way it is. If you're going to outgrow these defaults, knowing what they were chosen *for* helps you replace them deliberately.

## Goals that drove the choices

1. **Three platforms in one repo.** Web, API, and mobile — workshop participants should see a real cross-platform contract, not a toy single app.
2. **Local-first.** No cloud account required. `docker compose up`, `npm run dev`, `flutter run` and you're going.
3. **Modern but boring.** Use the current canonical version of each tool. Don't introduce experimental patterns participants would have to unlearn.
4. **One worked example.** Items CRUD shows the pattern across all three layers without dragging in auth, payments, or images.
5. **Claude Code first-class.** The repo ships with skills, CLAUDE.md guides, and personas so participants experience the workshop's full Claude workflow.

## Why each tool

### Turborepo

A monorepo lets web, API, and mobile share types and ship contract changes atomically. Turborepo gives us task orchestration (`turbo run dev` boots both web and api with one command) and caching without forcing us into a heavier solution like Nx.

### Next.js 16 (App Router)

The current default for full-stack React. Server components keep the bundle small, the App Router maps cleanly to RESTful routes, and the framework's i18n story lines up with `next-intl`. The trade-off: Next.js 16 has breaking changes from earlier versions, so the `apps/web/AGENTS.md` file warns Claude not to assume training-data Next.js.

### React Query

We need server-state caching, optimistic updates, and clean invalidation. React Query gives us all of that with one hook per resource. Server actions could replace some of it later, but workshops benefit from the explicit `useQuery`/`useMutation` mental model.

### shadcn/ui (Radix Slot)

Copy-paste components instead of an opaque dependency. Participants own every component in `components/ui/` and can edit them freely. We use the Radix Slot variant of `Button` so `asChild` composes cleanly with `Link`. The shadcn skill is included for component management.

### Tailwind 4 + design tokens

Tailwind 4 ships theme tokens via CSS variables. The starter defines a primary blue (#5669FF-ish in OKLCH) and the standard semantic tokens (`text-destructive`, `text-muted-foreground`, etc.). The "no hardcoded visual values" rule is the difference between a starter that scales and one that turns into a hairball.

### NestJS + Prisma + PostgreSQL

NestJS gives us a controller/service/DTO split that's identical to what production teams use, plus class-validator at the boundary. Prisma is the cleanest TypeScript ORM and migration tool. PostgreSQL is what we deploy to anyway.

The trade-off: NestJS has more ceremony than Express. For a workshop, the ceremony is the point — participants learn module boundaries from day one.

### Flutter (Riverpod, GoRouter, Dio, Freezed)

The current canonical Flutter stack for non-trivial apps. Riverpod plain providers (no `@riverpod` annotation) are simpler to teach. GoRouter handles deep links and navigation declaratively. Dio gives us interceptors for error mapping. Freezed eliminates a class of bugs around model equality and JSON parsing.

### next-intl + Flutter `flutter_localizations`

Both apps ship with English only but the i18n plumbing is in place. Adding a second locale is a rename + a JSON file. Participants who never need it pay zero runtime cost.

### Testing: Vitest + Playwright + Jest + Flutter test

Vitest is fast, ESM-friendly, and matches the modern Vite/Next ecosystem. Playwright is the obvious e2e choice for web. Jest is what NestJS scaffolds with — keeping it avoids a different test runner per app. Flutter's built-in test framework is good enough that swapping it would be ceremony for ceremony's sake.

## What's intentionally not here

| Missing | Why |
|---------|-----|
| Authentication | Adds significant scope and ties the starter to one identity provider. The Items feature works without users. |
| AWS / cloud services | A workshop participant on a fresh laptop should not need cloud credentials. |
| Image upload | Brings in storage choices (S3, Cloudinary, etc.) — out of scope. |
| Multiple locales | One language proves the pattern; adding more is a copy + register. |
| Real-time | WebSockets are a week of their own. Patterns (a `chat` module, a Socket.IO gateway) can plug in cleanly when needed. |
| Push notifications | Requires APNs/FCM keys — workshop friction we don't want. |
| CI for mobile | Flutter CI requires Xcode/Android SDK runners. Not worth the complexity at this scale. |

The `extension points` table in `architecture.md` shows where each one lands when you decide to add it.

## Local-first development

PostgreSQL runs in Docker. The API binds to `localhost:3001`. The web app binds to `localhost:3000` and proxies to the API via `NEXT_PUBLIC_API_URL`. Mobile uses `--dart-define-from-file=.env` to set `API_BASE_URL` — `localhost:3001` works for the iOS simulator, Android emulators need `10.0.2.2:3001` (documented in the README).

No part of the starter assumes a specific cloud provider. When you deploy, the `/devops-cicd` skill walks through a low-cost AWS setup (Fargate Spot, ephemeral staging, no NAT Gateway).

## Scaling considerations

The starter is sized for "one team, one feature at a time, ship to production by the end of the week." Things that hold up at that scale and start to strain at higher scale:

- **Single PostgreSQL instance.** Fine to ~1k req/s. Add read replicas + PgBouncer when reads dominate.
- **No background job queue.** Fine until you need to send emails or process uploads. Add BullMQ or a managed queue.
- **No caching layer.** Add Redis when you have read-heavy hot paths.
- **No CDN.** `next/image` handles asset delivery in dev; add CloudFront or Vercel for production assets.
- **Single locale.** Two locales is a copy. Five locales is a translation pipeline — consider Lokalise / Phrase.

The point is not that the starter handles all of these. The point is that the surface area is small enough that adding any of them is a localized change.

## Authentication: how to add it later

The cleanest plug-in pattern when you need auth:

1. **Identity provider** — pick one (Cognito, Auth0, Clerk, Firebase Auth, NextAuth, custom). They all expose a JWT in the end.
2. **API** — add `apps/api/src/auth/` with a `JwtAuthGuard` that validates the token. Apply at the controller class level; opt out of guards on public routes via a `@Public()` decorator.
3. **Web** — wrap `app/[locale]/layout.tsx` with an auth context provider. Read the JWT from a cookie or local storage. Pass it as `Authorization: Bearer <token>` in `fetchJson`.
4. **Mobile** — add `lib/core/auth/` with `flutter_secure_storage` for the token, an `AuthInterceptor` that injects the bearer header, and an `AuthNotifier` for sign-in/out state.

The starter's existing pattern (controller → service → DTO; React Query hooks; Riverpod providers) doesn't change — you're just gating access.
