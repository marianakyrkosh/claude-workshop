# Claude Workshop Starter

A full-stack monorepo template for building apps with Claude Code. Web (Next.js 16), API (NestJS + Prisma + PostgreSQL), and mobile (Flutter) — all wired together with one example feature (Items CRUD) and a curated set of Claude skills.

## What you get

- **Three apps in one repo** sharing types and following the same conventions
- **One worked feature** — `Item { id, title, description, createdAt, updatedAt }` — implemented end-to-end on web, API, and mobile so you have a reference pattern
- **shadcn/ui + Tailwind 4** with a custom theme on web
- **Riverpod + GoRouter + Dio + Freezed** with theme tokens on mobile
- **i18n on day one** — next-intl for web, ARB files for mobile (English shipped; adding a locale is a copy-paste)
- **Claude Code config** — 19 custom skills, 5 personas, plugin-enabled, per-app guides
- **Local-first** — `docker compose up`, no cloud accounts required
- **CI** — GitHub Actions runs lint, typecheck, and unit tests on every PR

## Prerequisites

- **Node.js 22.12.0+** (pinned via `.nvmrc` and `engines`) — `nvm use` picks up the exact version
- **Docker** — for local PostgreSQL
- **Flutter SDK** (latest stable) — only needed if you're working on `apps/mobile`
- **Claude Code** — install from https://claude.com/claude-code
- **GitHub CLI** (`gh`) — for the PR-related skills (`/open-pr`, `/address-pr-comments`)

## Quick start

```bash
# 1. Clone, install
git clone <your-fork-url> claude-workshop
cd claude-workshop
nvm use
npm install

# 2. Copy the personal Claude permissions template
cp .claude/settings.local.json.example .claude/settings.local.json

# 3. Start PostgreSQL
docker compose up -d

# 4. Set up the API
cd apps/api
cp .env.example .env
npx prisma migrate dev
cd ../..

# 5. Run web + API together
npm run dev
```

That's it. Open:

- Web: http://localhost:3000
- API: http://localhost:3001/v1
- Swagger: http://localhost:3001/docs (non-production only)

## Mobile (optional)

```bash
cd apps/mobile
cp .env.example .env
flutter pub get
dart run build_runner build --delete-conflicting-outputs
flutter run --dart-define-from-file=.env
```

> iOS simulator uses `localhost:3001` (default). Android emulators need `API_BASE_URL=http://10.0.2.2:3001/v1` because `localhost` resolves to the device.

## Project layout

```
claude-workshop/
├── apps/
│   ├── api/                   NestJS + Prisma + PostgreSQL
│   ├── web/                   Next.js 16 + Tailwind 4 + shadcn/ui
│   └── mobile/                Flutter + Riverpod + GoRouter
├── packages/
│   ├── types/                 Shared TS types and pagination contract
│   ├── ui/                    Shared React components
│   ├── eslint-config/         Flat-config ESLint presets
│   └── typescript-config/     Base + Next.js tsconfigs
├── .claude/
│   ├── CLAUDE.md              Root monorepo guide (loaded automatically)
│   ├── README.md              How to use the Claude config
│   ├── settings.json          Plugins + hooks + MCP servers
│   ├── settings.local.json.example   Personal permission template
│   ├── personas/              tech-lead, backend-engineer, etc.
│   ├── skills/                19 custom slash commands
│   └── workitems/             Active feature artifacts (filled during /feature-flow)
├── docs/
│   ├── architecture.md        How the apps fit together
│   ├── system-design.md       Why the stack was chosen
│   └── coding-style-guide.md  Conventions across all three apps
├── .github/workflows/ci.yml   Lint + typecheck + tests on every PR
├── docker-compose.yml         Local PostgreSQL
└── turbo.json                 Turborepo task graph
```

Each app has its own `.claude/CLAUDE.md` describing its specific patterns. Read those when you start working in a particular app.

## Working with Claude Code

Open Claude Code from the repo root. The recommended workflow is `/feature-flow` — it walks you through the full lifecycle:

```
/feature-flow Add tags to items
```

That runs (with user gates at the right points):

1. `/parse-ticket` — turn the description into a structured change request
2. `/plan-feature` — produce design + checklist + learnings scaffold
3. `/branch-start` — cut a `feature/<slug>` branch
4. `/implement-feature` — walk the checklist
5. `/unit-tests` and `/integration-tests` — cover new behavior
6. `/pre-pr-review` — self-review before pushing
7. `/archive-feature` — move artifacts to archive
8. `/open-pr` — push and open a PR

Once a PR exists, `/address-pr-comments <PR#>` handles reviewer feedback. You can also start a recurring loop with `/loop 5m /address-pr-comments <PR#>` so feedback gets handled as it arrives.

See `.claude/README.md` for the full skill catalog and the order to use them when running individually.

## Personas

Reference a persona by name in your prompt to nudge the answer toward a specific role:

> *"Acting as the **tech-lead** persona, review this design and tell me what's getting deferred."*

Available: `tech-lead`, `backend-engineer`, `frontend-engineer`, `mobile-engineer`, `code-reviewer`. Each one is documented in `.claude/personas/`.

## Available Claude skills

| Command | Use |
|---------|-----|
| `/feature-flow` | Orchestrator — runs the full lifecycle below |
| `/parse-ticket` | Turn raw requirements into a change request |
| `/plan-feature` | Produce design + checklist + learnings scaffold |
| `/branch-start` | Cut a feature branch from main |
| `/implement-feature` | Walk the checklist |
| `/quick-commit` | Local checkpoint commit during implementation |
| `/unit-tests` | Add/update unit tests |
| `/integration-tests` | Add/update e2e tests |
| `/pre-pr-review` | Self-review before opening a PR |
| `/open-pr` | Push and open a PR |
| `/address-pr-comments` | Reply to and resolve PR review comments |
| `/verify-pr-comment` | Evaluate one PR comment for project fit |
| `/archive-feature` | Move feature artifacts to archive |
| `/generate-mock` | Create an indexed HTML UI mock |
| `/implement-mock` | Convert a mock into Next.js code |
| `/fullstack-audit` | Production audit for Next.js + NestJS + Prisma |
| `/flutter-audit` | Production audit for Flutter mobile apps |
| `/fix-audit-item` | Cycle through audit findings one at a time |
| `/devops-cicd` | AWS CDK + Fargate + GitHub Actions deployment guide |

Plus shadcn and ui-ux-pro-max as third-party reference skills under `.agents/skills/`.

## Common commands

From repo root:

```bash
npm run dev            # web + API together (Turborepo)
npm run lint           # lint web + api + packages (Node workspaces)
npm run build          # build web + api + packages
npm run test           # unit tests for web + api + packages
npm run format         # Prettier across the repo
```

> Mobile isn't an npm workspace — run `flutter analyze` and `flutter test` from `apps/mobile` separately.

API-specific (from `apps/api`):

```bash
npx prisma migrate dev --name <change>   # new migration
npx prisma generate                       # regenerate the client
npx prisma studio                         # browse the DB
npm run test:e2e                          # e2e config (no specs by default)
```

Web-specific (from `apps/web`):

```bash
npx vitest                # unit tests in watch mode
npx playwright test       # e2e (requires API running)
npx shadcn@latest add <component>   # add a shadcn primitive
```

Mobile-specific (from `apps/mobile`):

```bash
flutter analyze           # 0 errors / 0 warnings expected
flutter test              # widget tests
flutter gen-l10n          # regenerate AppLocalizations after editing app_en.arb
dart run build_runner build --delete-conflicting-outputs   # after model changes
```

## Adding a new feature

If you want the deliberate path: run `/feature-flow <description>` and follow the prompts.

If you want the manual path:

1. Add the model to `apps/api/prisma/schema.prisma`, run `npx prisma migrate dev`
2. Update `packages/types/src/index.ts` if a new shared shape is needed
3. Create the API module under `apps/api/src/<feature>/` mirroring the Items module
4. Add React Query hooks under `apps/web/hooks/use-<feature>.ts` and pages under `apps/web/app/[locale]/<feature>/`
5. Add the Flutter feature folder under `apps/mobile/lib/features/<feature>/` mirroring the Items feature
6. Add new strings to `apps/web/locales/en/<feature>.json` and `apps/mobile/lib/core/l10n/app_en.arb`
7. Write tests at every layer
8. Open a PR

Each app's `.claude/CLAUDE.md` has a more detailed "How to add a new \<thing\>" section.

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — how the apps fit together and where each extension point lands
- [`docs/system-design.md`](docs/system-design.md) — why the stack was chosen and what's intentionally not here
- [`docs/coding-style-guide.md`](docs/coding-style-guide.md) — conventions across all three apps
- [`.claude/README.md`](.claude/README.md) — Claude config setup and skill order
- [`.claude/CLAUDE.md`](.claude/CLAUDE.md) — root monorepo guide (loaded by Claude Code automatically)
- App-specific guides in `apps/<app>/.claude/CLAUDE.md`

## Troubleshooting

- **Port 3001 already in use:** `lsof -ti:3001 | xargs kill -9`
- **Web shows "Failed to fetch" on items page:** API isn't running; `cd apps/api && npm run dev` in a separate terminal, or `npm run dev` from root
- **Prisma "table not found":** run `npx prisma migrate dev` in `apps/api`
- **Flutter on Android emulator can't reach API:** set `API_BASE_URL=http://10.0.2.2:3001/v1` in `apps/mobile/.env`
- **`/address-pr-comments` says "Unknown command":** restart Claude Code so the workshop's `.claude/skills/` are picked up

## License

MIT — fork it, adapt it, ship it.
