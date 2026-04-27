# Workshop Starter — Root Guide

This is the top-level Claude guide for the Workshop Starter monorepo. Use it for cross-app rules and shared standards.

App-specific guides:

- `apps/api/.claude/CLAUDE.md` — NestJS API
- `apps/web/.claude/CLAUDE.md` — Next.js 16 web app
- `apps/mobile/.claude/CLAUDE.md` — Flutter mobile app

When the local guide and this root guide disagree on implementation details, the local guide wins. When they disagree on cross-cutting policy (i18n, contract sync, security), this root guide wins.

## Layout

| Path | Stack | Role |
|------|-------|------|
| `apps/web` | Next.js 16, React 19, Tailwind 4, shadcn/ui, next-intl, React Query | Web frontend |
| `apps/api` | NestJS, Prisma, PostgreSQL | Backend (serves web + mobile) |
| `apps/mobile` | Flutter, Riverpod, GoRouter, Dio, Freezed | Native mobile (iOS + Android) |
| `packages/types` | TypeScript | Shared domain types |
| `packages/ui` | React | Shared React components |
| `packages/eslint-config` | ESLint flat config | Shared lint rules |
| `packages/typescript-config` | TS configs | Shared tsconfig |

## Example feature: Items

The starter ships with one full vertical slice — Items (CRUD with title + description) — implemented in all three apps. Use it as a reference pattern when adding your own features. No auth, no image upload, no AWS — keep that surface area small until the workshop participant chooses to grow it.

## Shared engineering standards

1. TypeScript on web/api, Dart on mobile. No `any`/`dynamic` unless temporarily justified.
2. Small, composable modules over large files.
3. Naming consistent across web, api, and mobile for domain entities.
4. Never commit secrets. `.env` files are gitignored — `.env.example` documents required keys.
5. Don't log sensitive auth payloads, tokens, or PII.
6. Keep user-facing behavior backward-compatible unless the change is intentional and documented in the PR.
7. **No hardcoded visual values in feature code.** Use theme tokens — `AppColors`/`AppTypography`/`AppSpacing` on mobile, Tailwind tokens and CSS variables on web. If a token doesn't exist, add it before using a literal.

## Cross-app contract rules

1. Backend routes are versioned (`/v1`); web hooks and mobile repositories must match.
2. DTO and response shape changes ship in the same PR as their consumers.
3. Enum changes propagate: Prisma schema → `packages/types` → mobile Dart models.
4. Pagination contract is identical everywhere: `{ data: T[], meta: { total, page, limit, totalPages } }`.

## Data and persistence

1. Prisma migrations are the only way to change schema. Never edit production tables manually.
2. Multi-step writes use `$transaction`.
3. Add indexes for query-heavy access patterns up front, not after the fact.

## DRY and component reuse

1. Check `apps/web/components/ui/`, `apps/web/components/<feature>/`, `apps/mobile/lib/core/widgets/`, and `packages/ui/` before building a new widget or component.
2. Web buttons go through `Button` from `components/ui/button.tsx`. Mobile uses themed `ElevatedButton` (or `AppCard`/`AppTextField` from `core/widgets/`).
3. If a component doesn't exist, create it as a shared widget first, then use it from the feature.

## i18n

1. The starter ships with English. Adding a new locale (e.g. `uk`) means adding `apps/web/locales/uk/*.json`, `apps/mobile/lib/core/l10n/app_uk.arb`, and the locale code to `apps/web/i18n/config.ts`.
2. Every user-visible string lives in a translation file. No hardcoded English in feature code.
3. Web: `useTranslations('namespace')` in client components, `getTranslations('namespace')` in server components.
4. Mobile: `AppLocalizations.of(context)!`. Run `flutter gen-l10n` after editing ARB files.

## Quality gates

Before merging:

1. Lint passes
2. Type check passes
3. Tests for affected areas pass
4. Build succeeds
5. New behavior documented (PR body, code comments only where the why isn't obvious)

### Commands

From root:

```bash
npm run dev       # web + api dev servers
npm run lint      # all workspaces
npm run build     # production build for all
npm run test      # unit tests for all
```

From `apps/api`:

```bash
npm run dev                          # nest start --watch
npm run test                         # jest
npx prisma migrate dev --name <name> # create migration
npx prisma generate                  # regenerate client
```

From `apps/web`:

```bash
npm run dev          # next dev
npx vitest run       # unit tests
npx playwright test  # e2e
```

From `apps/mobile`:

```bash
flutter run --dart-define-from-file=.env
flutter test
flutter analyze
dart run build_runner build --delete-conflicting-outputs
```

## PR expectations

- Conventional Commit title: `feat(scope): ...`, `fix(scope): ...`
- Body: what changed and why
- Impacted apps listed (api / web / mobile / packages/*)
- Test evidence — commands run and outcome
- Breaking changes called out with migration notes
- Screenshots for visible UI changes

## Workflow

- Lint and format before every commit
- One feature per branch
- Resolve review threads only after replying or fixing
- Use `/feature-flow` to drive the full lifecycle, or invoke individual skills (`/parse-ticket`, `/plan-feature`, `/branch-start`, `/implement-feature`, `/quick-commit`, `/unit-tests`, `/integration-tests`, `/pre-pr-review`, `/open-pr`, `/address-pr-comments`, `/archive-feature`)

## Extension points

When you outgrow the starter, here's where to plug in:

| Need | Where it goes |
|------|---------------|
| Authentication | `apps/api/src/auth/` module + JWT guard, `apps/web/lib/auth-context.tsx`, mobile `core/auth/` |
| File upload | API: `multer` + S3 client; Web: form helper; Mobile: `image_picker` + Dio multipart |
| Real-time | API: `@nestjs/websockets`; Web: `socket.io-client`; Mobile: `socket_io_client` |
| Push notifications | API: AWS SNS or Firebase; Mobile: `firebase_messaging` |
| Multiple locales | Add files to `locales/<code>/` and `app_<code>.arb`; add code to `apps/web/i18n/config.ts` |
| CDN / cloud images | Add `S3Service` in api/common, replace `next/image` config |
