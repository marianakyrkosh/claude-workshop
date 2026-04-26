# Claude Workshop Starter Project — Design Spec

**Date:** 2026-04-26
**Based on:** kroogom monorepo (community events platform)
**Purpose:** Production-grade starter template for workshop participants building apps with Claude

## 1. Goals

- Provide a fully configured Turborepo monorepo with web (Next.js), API (NestJS), and mobile (Flutter) apps
- Use latest framework versions with patterns adapted from kroogom's battle-tested architecture
- Include one complete vertical slice (Items/Notes CRUD) as a reference pattern
- No authentication required, no AWS dependencies — local-first with `docker compose up`
- Ship all Claude skills/plugins that were used during kroogom development (minus hookify and ckm-*)
- Include architecture, system design, and coding style guide documentation
- Participants can `git clone`, `docker compose up -d`, `npm install`, `npm run dev` and start building

## 2. Tech Stack

### Versions (latest as of 2026-04-26)

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| **Monorepo** | Turborepo | latest | Pipeline orchestration |
| **Web** | Next.js | 16.x | App Router (already in claude-workshop) |
| **Web** | React | 19.x | |
| **Web** | Tailwind CSS | 4.x | New config approach (CSS-based) |
| **Web** | shadcn/ui | latest | Component library |
| **Web** | next-intl | latest | i18n (English only, extensible) |
| **Web** | @tanstack/react-query | latest | Server state |
| **Web** | react-hook-form + zod | latest | Form validation |
| **Web** | Vitest | latest | Unit tests |
| **Web** | Playwright | latest | E2E tests |
| **API** | NestJS | latest (11.x) | |
| **API** | Prisma | latest | ORM |
| **API** | PostgreSQL | 16 | Via Docker Compose |
| **API** | class-validator | latest | DTO validation |
| **API** | Swagger | latest | API docs |
| **API** | Jest | latest | Unit tests |
| **Mobile** | Flutter | latest stable | |
| **Mobile** | Riverpod | latest 2.x | State management |
| **Mobile** | GoRouter | latest | Navigation |
| **Mobile** | Dio | latest 5.x | HTTP client |
| **Mobile** | freezed + json_serializable | latest | Immutable models |
| **Tooling** | Husky | latest | Git hooks |
| **Tooling** | Prettier | latest | Code formatting |
| **Tooling** | ESLint | 9.x | Flat config |

### What's NOT included (by design)

- AWS Cognito / S3 / SNS — participants add cloud services when ready
- Authentication — example feature is fully public
- Socket.IO / WebSocket — can be added as a feature
- Image upload — Items have title + description only
- Firebase / push notifications — can be added later

## 3. Monorepo Structure

```
claude-workshop/
├── apps/
│   ├── api/                          # NestJS backend
│   │   ├── src/
│   │   │   ├── main.ts               # Bootstrap, global pipes/versioning
│   │   │   ├── app.module.ts          # Root module
│   │   │   ├── config/
│   │   │   │   └── configuration.ts   # Typed config factory
│   │   │   ├── common/
│   │   │   │   ├── dto/
│   │   │   │   │   ├── pagination.dto.ts
│   │   │   │   │   └── paginated-response.dto.ts
│   │   │   │   └── filters/           # Exception filters
│   │   │   ├── prisma/
│   │   │   │   ├── prisma.module.ts
│   │   │   │   ├── prisma.service.ts
│   │   │   │   └── schema.prisma
│   │   │   ├── items/                 # Example feature module
│   │   │   │   ├── items.module.ts
│   │   │   │   ├── items.controller.ts
│   │   │   │   ├── items.service.ts
│   │   │   │   ├── items.service.spec.ts
│   │   │   │   ├── items.controller.spec.ts
│   │   │   │   └── dto/
│   │   │   │       ├── create-item.dto.ts
│   │   │   │       └── update-item.dto.ts
│   │   │   └── health/
│   │   │       ├── health.module.ts
│   │   │       └── health.controller.ts
│   │   ├── test/                      # E2E test setup
│   │   ├── .claude/
│   │   │   └── CLAUDE.md              # API-specific patterns
│   │   ├── nest-cli.json
│   │   ├── tsconfig.json
│   │   ├── tsconfig.build.json
│   │   ├── package.json
│   │   └── .eslintrc.js
│   │
│   ├── web/                           # Next.js frontend
│   │   ├── app/
│   │   │   ├── [locale]/
│   │   │   │   ├── page.tsx           # Home page
│   │   │   │   ├── items/
│   │   │   │   │   ├── page.tsx       # Items list
│   │   │   │   │   ├── new/
│   │   │   │   │   │   └── page.tsx   # Create item
│   │   │   │   │   └── [id]/
│   │   │   │   │       ├── page.tsx   # Item detail
│   │   │   │   │       └── edit/
│   │   │   │   │           └── page.tsx # Edit item
│   │   │   │   └── layout.tsx
│   │   │   ├── layout.tsx             # Root layout
│   │   │   └── providers.tsx          # Query provider
│   │   ├── components/
│   │   │   ├── ui/                    # shadcn/ui components
│   │   │   ├── items/                 # Item cards, forms
│   │   │   └── layout/               # Header, navigation
│   │   ├── hooks/
│   │   │   └── use-items.ts           # React Query hooks
│   │   ├── config/
│   │   │   └── env.ts                 # Environment config
│   │   ├── lib/
│   │   │   └── utils.ts              # Utility functions (cn, etc.)
│   │   ├── locales/
│   │   │   └── en/                    # English translations
│   │   │       ├── common.json
│   │   │       └── items.json
│   │   ├── e2e/                       # Playwright tests
│   │   │   └── items.spec.ts
│   │   ├── __tests__/                 # Vitest tests
│   │   │   └── items-list.test.tsx
│   │   ├── .claude/
│   │   │   └── CLAUDE.md              # Web-specific patterns
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts         # Or CSS-based config for Tailwind 4
│   │   ├── vitest.config.ts
│   │   ├── playwright.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── mobile/                        # Flutter app
│       ├── lib/
│       │   ├── main.dart              # Entry, ProviderScope
│       │   ├── core/
│       │   │   ├── env/
│       │   │   │   └── env.dart       # --dart-define config
│       │   │   ├── network/
│       │   │   │   ├── api_client.dart
│       │   │   │   └── api_exception.dart
│       │   │   ├── routing/
│       │   │   │   ├── app_routes.dart
│       │   │   │   └── app_router.dart
│       │   │   ├── theme/
│       │   │   │   ├── app_colors.dart
│       │   │   │   ├── app_typography.dart
│       │   │   │   └── app_theme.dart
│       │   │   ├── l10n/
│       │   │   │   ├── app_en.arb      # English strings
│       │   │   │   └── generated/      # (gitignored)
│       │   │   └── widgets/            # Shared reusable widgets
│       │   ├── models/
│       │   │   ├── item.dart           # Freezed model
│       │   │   └── pagination.dart
│       │   └── features/
│       │       ├── home/
│       │       │   └── presentation/
│       │       │       └── home_screen.dart
│       │       └── items/
│       │           ├── data/
│       │           │   └── items_repository.dart
│       │           ├── providers/
│       │           │   └── items_provider.dart
│       │           └── presentation/
│       │               ├── items_screen.dart
│       │               ├── item_detail_screen.dart
│       │               ├── create_item_screen.dart
│       │               └── widgets/
│       │                   └── item_card.dart
│       ├── test/
│       │   └── features/items/
│       │       └── items_screen_test.dart
│       ├── .claude/
│       │   └── CLAUDE.md               # Mobile-specific patterns
│       ├── pubspec.yaml
│       ├── analysis_options.yaml
│       └── .env.example
│
├── packages/
│   ├── types/                          # Shared TypeScript types
│   │   ├── src/
│   │   │   └── index.ts               # Domain enums + types
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── ui/                             # Shared React components
│   │   ├── src/
│   │   │   └── index.tsx
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── eslint-config/                  # Shared ESLint configs
│   │   ├── base.js
│   │   ├── next.js
│   │   ├── react-internal.js
│   │   └── package.json
│   └── typescript-config/              # Shared tsconfig
│       ├── base.json
│       ├── nextjs.json
│       └── package.json
│
├── .claude/
│   ├── CLAUDE.md                       # Root monorepo guide
│   ├── settings.json                   # Plugins + hooks
│   ├── skills/                         # 19 custom skills
│   │   ├── build-feature/SKILL.md
│   │   ├── commit-and-pr/SKILL.md
│   │   ├── jira-ticket/SKILL.md
│   │   ├── design-plan/SKILL.md
│   │   ├── feature-branch/SKILL.md
│   │   ├── implement/SKILL.md
│   │   ├── checkpoint/SKILL.md
│   │   ├── unit-test/SKILL.md
│   │   ├── integration-test/SKILL.md
│   │   ├── review/SKILL.md
│   │   ├── capture-learnings/SKILL.md
│   │   ├── address-pr-comments/SKILL.md
│   │   ├── verify-pr-comment/SKILL.md
│   │   ├── generate-mock/SKILL.md
│   │   ├── implement-mock/SKILL.md
│   │   ├── fix-audit-item/SKILL.md
│   │   ├── flutter-audit/SKILL.md
│   │   │   └── references/             # Audit reference files
│   │   ├── fullstack-audit/SKILL.md
│   │   │   └── references/             # Audit reference files
│   │   └── devops-cicd/SKILL.md
│   ├── mocks/                          # UI mock storage
│   │   └── INDEX.md
│   ├── workitems/                      # Feature planning workspace
│   │   ├── feedback/                   # Change requests land here
│   │   ├── planning/                   # Checklists
│   │   ├── development/                # Design docs + learnings
│   │   └── archive/                    # Completed work
│   └── references/                     # Architecture docs for skills
│
├── .agents/
│   └── skills/
│       ├── shadcn/                     # shadcn UI skill
│       └── ui-ux-pro-max/              # UI/UX design skill
│
├── docs/
│   ├── architecture.md                 # System architecture overview
│   ├── system-design.md                # Tech decisions & rationale
│   └── coding-style-guide.md           # Cross-app conventions
│
├── .github/
│   └── workflows/
│       └── ci.yml                      # Lint + test + typecheck
│
├── docker-compose.yml                  # Local PostgreSQL
├── turbo.json                          # Turborepo pipeline config
├── package.json                        # Root workspace config
├── .prettierrc                         # Prettier config
├── .nvmrc                              # Node version
├── .gitignore                          # Comprehensive ignores
├── CLAUDE.md                           # Points to .claude/CLAUDE.md
└── README.md                           # Workshop getting started guide
```

## 4. Example Feature: Items/Notes

### Data Model (Prisma)

```prisma
model Item {
  id          String   @id @default(cuid())
  title       String
  description String?
  createdAt   DateTime @default(now()) @db.Timestamptz
  updatedAt   DateTime @updatedAt @db.Timestamptz
}
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/items` | GET | List items (paginated) |
| `/v1/items/:id` | GET | Get item by ID |
| `/v1/items` | POST | Create item |
| `/v1/items/:id` | PATCH | Update item |
| `/v1/items/:id` | DELETE | Delete item |
| `/v1/health` | GET | Health check |

All endpoints are public (no auth guard). Validation via class-validator DTOs.

### Web Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Landing page with link to items |
| `/items` | Items list | Paginated list with create button |
| `/items/new` | Create item | Form with title + description |
| `/items/[id]` | Item detail | View with edit/delete actions |
| `/items/[id]/edit` | Edit item | Pre-filled form |

React Query hooks in `hooks/use-items.ts`. shadcn/ui components for cards, forms, buttons.

### Mobile Screens

| Route | Screen | Description |
|-------|--------|-------------|
| `/home` | HomeScreen | Landing with nav to items |
| `/items` | ItemsScreen | List with FAB to create |
| `/items/:id` | ItemDetailScreen | View with edit/delete |
| `/items/create` | CreateItemScreen | Form |
| `/items/:id/edit` | EditItemScreen | Pre-filled form |

Riverpod providers + Dio repository. Freezed model for `Item`.

### Testing

| Layer | Framework | Test File | What It Tests |
|-------|-----------|-----------|---------------|
| API unit | Jest | `items.service.spec.ts` | CRUD operations, validation, not-found |
| API unit | Jest | `items.controller.spec.ts` | Route metadata, controller wiring |
| Web unit | Vitest | `__tests__/items-list.test.tsx` | Items list render states (loading, data, empty) |
| Web e2e | Playwright | `e2e/items.spec.ts` | Full CRUD flow in browser |
| Mobile | Flutter test | `items_screen_test.dart` | Widget rendering, basic interactions |

## 5. Configuration Details

### Root `package.json`

```json
{
  "name": "claude-workshop",
  "private": true,
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "format": "prettier --write \"**/*.{ts,tsx,md}\"",
    "prepare": "husky install"
  },
  "workspaces": ["apps/*", "packages/*"],
  "engines": {
    "node": ">=22.12.0",
    "npm": ">=10.0.0"
  }
}
```

### `turbo.json`

Same pipeline as kroogom but with `test` added:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "lint": {},
    "test": {},
    "dev": {
      "dependsOn": ["^build"],
      "cache": false,
      "persistent": true
    }
  }
}
```

### `.prettierrc`

Match kroogom exactly:

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 120,
  "tabWidth": 2,
  "useTabs": false,
  "semi": false,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "auto"
}
```

### `.nvmrc`

```
22.12.0
```

### `docker-compose.yml`

```yaml
services:
  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: workshop
      POSTGRES_PASSWORD: workshop
      POSTGRES_DB: workshop
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### `.github/workflows/ci.yml`

Adapted from kroogom's CI — triggers on PRs to main:

- **API job:** lint + Jest tests + typecheck
- **Web job:** lint + Vitest + typecheck
- **Audit job:** `npm audit --audit-level=critical`

## 6. CLAUDE.md Files

### Root `.claude/CLAUDE.md`

Adapted from kroogom's root CLAUDE.md. Key changes:
- Replace "Kroogom" with "Workshop Project" throughout
- Replace domain entities (Event, RSVP, Group, etc.) with Items
- Remove Cognito/S3/SNS architecture sections
- Remove sprint tracking, roadmap references, Figma references
- Keep: monorepo overview table, shared engineering standards, cross-app API contract rules, data persistence rules, DRY component reuse, i18n rules (English only, extensible), quality gates, commands, PR expectations, workflow preferences, change planning guidance
- Add: "Extension Points" section documenting where to add auth, cloud services, real-time, etc.
- Update versions to latest (Next.js 16, NestJS latest, etc.)

### `apps/api/.claude/CLAUDE.md`

Adapted from kroogom's API CLAUDE.md:
- Replace domain modules table with Items + Health only
- Remove Cognito JWT guard pattern (no auth)
- Remove WebSocket/Chat, Push Notification sections
- Keep: source structure pattern, Prisma patterns (adapted), implementation rules, configuration/env, testing patterns
- Keep the NestJS module pattern as the template for adding new modules
- Add: "How to Add a New Module" section as a tutorial reference

### `apps/web/.claude/CLAUDE.md`

Adapted from kroogom's Web CLAUDE.md:
- Replace domain features with Items only
- Remove Cognito auth section
- Keep: project structure, implementation rules, API integration pattern (React Query), i18n setup, design system section, testing section
- Update for Next.js 16 / Tailwind 4 specifics
- Add: "How to Add a New Page" section as a tutorial reference

### `apps/mobile/.claude/CLAUDE.md`

Adapted from kroogom's Mobile CLAUDE.md:
- Replace features with Items only
- Remove Cognito auth, image upload, search, bookmarks sections
- Keep: stack overview, project structure, implementation rules (freezed, Riverpod plain providers, GoRouter, Dio), API integration, quality gates, naming conventions, common pitfalls (relevant ones)
- Add: "How to Add a New Feature" section as a tutorial reference

## 7. Documentation

### `docs/architecture.md`

System architecture document covering:
- **Monorepo layout** — what each app/package does and how they relate
- **Data flow** — how web/mobile talk to the API, how the API talks to the database
- **API contract** — versioning, shared types, DTO validation
- **Shared packages** — purpose of types, ui, eslint-config, typescript-config
- **Extension points** — where to add auth, cloud services, real-time features, file upload

### `docs/system-design.md`

Technical decisions document covering:
- **Why this stack** — rationale for each technology choice (Turborepo, Next.js, NestJS, Flutter, Prisma, etc.)
- **Why monorepo** — benefits for full-stack development with Claude
- **Local-first development** — Docker Compose for database, no cloud dependencies
- **Infrastructure options** — brief overview of deployment paths (AWS, Vercel, Railway, etc.)
- **Scaling considerations** — when to add caching, connection pooling, CDN
- **Authentication options** — how to add auth (Cognito, NextAuth, Clerk, etc.) — extension guide

### `docs/coding-style-guide.md`

Cross-app conventions drawn from kroogom's patterns:
- **Naming** — files, classes, variables, enums, folders across all three apps
- **File organization** — feature-first for mobile, colocation for web, module-based for API
- **TypeScript rules** — no `any`, strict mode, import ordering
- **Dart rules** — import order (dart: → package: → relative), freezed conventions
- **Component/widget patterns** — reuse before creating, shared locations
- **API module pattern** — controller → service → DTO → spec (with example)
- **Testing conventions** — what to test, naming, mocking patterns
- **Git workflow** — branch naming, commit messages (Conventional Commits), PR structure
- **Design tokens** — no hardcoded visual values, theme-first approach

## 8. Claude Skills & Plugins

### `settings.json`

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "<PR creation hook — same as kroogom, triggers /loop for /address-pr-comments>"
          }
        ]
      }
    ]
  },
  "enabledPlugins": {
    "typescript-lsp@claude-plugins-official": true,
    "security-guidance@claude-plugins-official": true,
    "commit-commands@claude-plugins-official": true,
    "pr-review-toolkit@claude-plugins-official": true,
    "frontend-design@claude-plugins-official": true,
    "feature-dev@claude-plugins-official": true,
    "figma@claude-plugins-official": true,
    "superpowers@claude-plugins-official": true
  }
}
```

**Excluded plugins:** hookify, all ckm-* skills
**Changed from kroogom:** superpowers enabled (was disabled)

### Custom Skills (19 total)

All skills copied from kroogom with these adaptations:
- Replace "Kroogom" references with generic project references
- Replace domain-specific examples (events, RSVPs, groups) with Items examples
- Update file paths to match workshop project structure
- Keep the workflow/process structure identical

| Skill | Purpose | Adaptations Needed |
|-------|---------|-------------------|
| `build-feature` | End-to-end feature lifecycle | Remove Figma phase, update sprint file references to generic |
| `commit-and-pr` | Finalize branch + open PR | Minimal — mostly generic already |
| `jira-ticket` | Create change request | Replace "Kroogom" stack context, keep structure |
| `design-plan` | Implementation plan from change request | Update input paths, keep structure |
| `feature-branch` | Create feature branch | No changes needed — fully generic |
| `implement` | Execute planned work | Update i18n reference (en only), keep iteration loop |
| `checkpoint` | Quick progress commit | No changes needed — fully generic |
| `unit-test` | Generate unit tests | Update test framework references for latest versions |
| `integration-test` | Generate e2e tests | Update domain flow examples to Items |
| `review` | Pre-PR quality review | Remove domain-specific checks (RSVPs, bookmarks), keep security/contract checks |
| `capture-learnings` | Archive completed work | No changes needed — generic archival |
| `address-pr-comments` | Handle PR feedback | Minimal changes — mostly generic |
| `verify-pr-comment` | Evaluate PR comments | No changes needed — fully generic |
| `generate-mock` | Create HTML UI mocks | Update target references to workshop structure |
| `implement-mock` | Convert mock to code | Update target paths |
| `fix-audit-item` | Fix audit findings | Update audit file path reference |
| `flutter-audit` | Flutter production audit | No changes — generic audit skill |
| `fullstack-audit` | Full-stack production audit | No changes — generic audit skill |
| `devops-cicd` | DevOps/CI-CD setup | No changes — generic infrastructure skill |

### External Skills (2)

| Skill | Source | Purpose |
|-------|--------|---------|
| `shadcn` | `.agents/skills/shadcn/` | shadcn/ui component management |
| `ui-ux-pro-max` | `.agents/skills/ui-ux-pro-max/` | UI/UX design intelligence |

These need to be symlinked or copied from the kroogom project.

### MCP Servers

```json
{
  "enabledMcpjsonServers": ["context7"],
  "enableAllProjectMcpServers": true
}
```

## 9. CI/CD

### `.github/workflows/ci.yml`

```yaml
name: CI
on:
  pull_request:
    branches: [main]

jobs:
  api:
    runs-on: ubuntu-latest
    steps:
      - Checkout, setup Node 22, install deps
      - Run: cd apps/api && npm run lint
      - Run: cd apps/api && npm run test
      - Run: cd apps/api && npx tsc --noEmit

  web:
    runs-on: ubuntu-latest
    steps:
      - Checkout, setup Node 22, install deps
      - Run: cd apps/web && npm run lint
      - Run: cd apps/web && npm run test
      - Run: cd apps/web && npx tsc --noEmit

  audit:
    runs-on: ubuntu-latest
    steps:
      - Checkout, install deps
      - Run: npm audit --audit-level=critical
```

## 10. What Gets Removed from claude-workshop

The existing claude-workshop repo has a standalone Next.js 16 app. This will be **restructured** into the monorepo format:

1. Move existing web app files into `apps/web/`
2. Recreate root as Turborepo workspace
3. Add `apps/api/` (NestJS) from scratch
4. Add `apps/mobile/` (Flutter) from scratch
5. Add `packages/` (types, ui, eslint-config, typescript-config)
6. Replace root `package.json`, `tsconfig.json` with monorepo versions
7. Add docker-compose.yml, turbo.json, .claude/ directory tree
8. Keep existing `.prettierrc.json` content (adapt format to match kroogom's `.prettierrc`)
9. Keep existing `AGENTS.md` for Next.js 16 guidance

## 11. Implementation Order

Recommended build sequence:

1. **Root monorepo setup** — package.json, turbo.json, .prettierrc, .nvmrc, .gitignore, docker-compose.yml
2. **Shared packages** — types, typescript-config, eslint-config, ui
3. **API app** — NestJS scaffold, Prisma schema, Items module, Health module, tests
4. **Web app** — restructure existing Next.js into monorepo, add shadcn/ui, next-intl, React Query, Items pages, tests
5. **Mobile app** — Flutter scaffold, core layer, Items feature, tests
6. **Claude configuration** — .claude/ directory, CLAUDE.md files (root + per-app), settings.json, all skills
7. **External skills** — .agents/skills/ with shadcn + ui-ux-pro-max
8. **Documentation** — docs/architecture.md, docs/system-design.md, docs/coding-style-guide.md
9. **CI/CD** — .github/workflows/ci.yml
10. **README** — Workshop getting started guide with step-by-step setup instructions

## 12. Starter README Outline

```markdown
# Claude Workshop Starter

A full-stack monorepo template for building apps with Claude.

## Quick Start

1. Clone the repo
2. `nvm use` (Node 22.12.0)
3. `docker compose up -d` (PostgreSQL)
4. `npm install`
5. `cd apps/api && npx prisma migrate dev` (database setup)
6. `npm run dev` (starts web + API)
7. Open http://localhost:3000

## Mobile

1. `cd apps/mobile`
2. Copy `.env.example` to `.env`
3. `flutter pub get`
4. `dart run build_runner build`
5. `flutter run --dart-define-from-file=.env`

## Project Structure
[brief overview]

## Claude Skills
[list of available /slash commands]

## Adding a New Feature
[pointer to docs + CLAUDE.md files]
```
