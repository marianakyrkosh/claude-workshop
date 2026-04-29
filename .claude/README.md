# Claude Configuration

This directory holds the workshop's Claude Code setup: shared settings, custom skills, CLAUDE.md guides, and the working directories used during a feature lifecycle.

## Contents

```
.claude/
├── CLAUDE.md                       Root monorepo guide (loaded automatically)
├── settings.json                   Shared config — plugins, hooks, MCP servers
├── settings.local.json.example     Personal permission allow list (copy to settings.local.json)
├── personas/                       Role-based answer perspectives (tech-lead, backend-engineer, etc.)
├── skills/                         Custom slash commands
├── workitems/                      Feature lifecycle artifacts
│   ├── feedback/                   Change requests (REQUEST-<slug>.md)
│   ├── planning/                   Checklists (<slug>-checklist.md)
│   ├── development/                Design docs + learnings (<slug>-design.md, <slug>-learnings.md)
│   └── archive/                    Completed work moved here by /archive-feature
├── mocks/                          Indexed HTML UI mocks
│   └── INDEX.md                    Mock registry
└── references/                     Static reference material
```

## First-time setup

1. Copy `settings.local.json.example` to `settings.local.json` to pre-approve common commands:
   ```bash
   cp .claude/settings.local.json.example .claude/settings.local.json
   ```
2. Install MCP-server prerequisites (see [`MCP servers`](#mcp-servers) below).
3. Restart Claude Code so the plugins, hooks, and MCP servers from `settings.json` and `.mcp.json` load.

## MCP servers

The repo ships a project-scoped `/.mcp.json` so every participant gets the same toolset. Prerequisites per server:

| Server | What it does | Prerequisites |
|---|---|---|
| `shadcn` | Browse/add shadcn UI primitives via the official `shadcn` CLI | Node.js (already required for the monorepo) |
| `aws-documentation` | Look up AWS service docs without leaving Claude | [`uv`](https://docs.astral.sh/uv/) (`brew install uv` or `curl -LsSf https://astral.sh/uv/install.sh \| sh`); `uvx` runs `awslabs.aws-documentation-mcp-server` on demand |
| `playwright` | Drive Playwright for end-to-end browser automation | Run `npx playwright install` once so the bundled browsers are available |
| `figma` | Talk to the Figma Dev Mode MCP server | Figma desktop app installed and **running** with the file open; the server listens on `http://127.0.0.1:3845/sse` |

If a participant doesn't run Figma, the Figma server simply fails to connect — the rest keep working. If `uv`/`uvx` is missing, the AWS docs server is the only one that won't start.

The trust list in `settings.json` (`enabledMcpjsonServers`) already covers all four, so they auto-start without per-server prompts.

## Slash commands at a glance

The recommended path is `/feature-flow <description>` — it runs everything below in the right order. Use the individual skills when you want manual control.

### Build a feature (the main path)

When running individually, follow this order:

| # | Command | When | Output |
|---|---------|------|--------|
| 1 | `/parse-ticket <description>` | You have a feature idea or ticket | `.claude/workitems/feedback/REQUEST-<slug>.md` |
| 2 | `/plan-feature <slug>` | Change request is approved | `<slug>-design.md`, `<slug>-checklist.md`, `<slug>-learnings.md` under `workitems/` |
| 3 | `/branch-start [slug]` | Plan is approved | `feature/<slug>` branch pushed with upstream |
| 4 | `/implement-feature [slug]` | Branch is ready | Code changes; checklist items marked `[x]` |
| 5 | `/quick-commit [note]` | Anywhere during step 4 | Local checkpoint commit (not pushed) |
| 6 | `/unit-tests [target]` | After implementing each layer | Specs covering new behavior |
| 7 | `/integration-tests [feature]` | When the feature spans multiple layers | E2E specs |
| 8 | `/pre-pr-review [scope]` | Before opening a PR | List of issues to fix (or "clean") |
| 9 | `/archive-feature [slug]` | After review is clean | Workitems moved to `archive/` |
| 10 | `/open-pr [title]` | Branch is ready to merge | PR created against `main` |
| 11 | `/address-pr-comments <PR#>` | Each time review comments arrive | Replies posted, threads resolved, fixes pushed |
| 12 | `/verify-pr-comment <text>` | When a single comment needs deeper analysis | accept / partial / reject decision with rationale |

### UI mocking

| Command | When | Output |
|---------|------|--------|
| `/generate-mock <description>` | Need to align on visuals before coding | Indexed HTML mock under `.claude/mocks/` |
| `/implement-mock <index>` | Mock is approved | Mock converted to real `.tsx` in `apps/web` |

Run `generate-mock` before `plan-feature` if the design isn't settled. Run `implement-mock` during `implement-feature` for the UI piece.

### Audits and infra

These don't fit the feature flow — run them when you need them.

| Command | When |
|---------|------|
| `/fullstack-audit` | Before going live; produces a prioritized findings list for the API + web stack |
| `/flutter-audit` | Before submitting to App Store / Play Store; mobile-specific findings |
| `/fix-audit-item [#N]` | Cycle through audit findings one at a time |
| `/devops-cicd` | Setting up AWS infrastructure, CI/CD pipelines, monitoring |

### Orchestrator

| Command | What it does |
|---------|--------------|
| `/feature-flow <description>` | Runs steps 1 → 11 above with user gates at the right points |

## Plugin-provided commands

The plugins in `settings.json` add more commands automatically. The most useful:

- `/security-review` — security audit of pending changes
- `/code-review` — review the diff against project standards
- `/init` — bootstrap a CLAUDE.md from scratch
- `/insights` — usage analytics for your sessions

Run `/help` to see the full list at any time.

## Personas

Reference a persona by name in your prompt to nudge the answer toward a specific role. See `personas/README.md` for details.

| Persona | When to use |
|---------|-------------|
| `tech-lead` | Direction, scope, tradeoffs |
| `backend-engineer` | NestJS / Prisma / DTO / contracts |
| `frontend-engineer` | Next.js / React Query / shadcn / next-intl |
| `mobile-engineer` | Flutter / Riverpod / GoRouter / theme tokens |
| `code-reviewer` | Pre-push review, second pair of eyes |

Example: *"Acting as the **tech-lead** persona, review this design doc and tell me what's getting deferred."*

## Conventions

- One feature per branch. Each invocation of `/feature-flow` (or the manual chain) produces one PR.
- The slug stays consistent across all artifacts (`<slug>-design.md`, `feature/<slug>` branch, etc.).
- Workitems are temporary — they live in `feedback/`, `planning/`, `development/` only while the feature is active. `/archive-feature` moves them to `archive/` once shipped.
- Mocks are persistent — they stay in `mocks/` until you choose to archive them, since multiple features can reference the same mock.

## Where to look when something doesn't fit

- Cross-app contract questions → root `.claude/CLAUDE.md`
- API patterns → `apps/api/.claude/CLAUDE.md`
- Web patterns → `apps/web/.claude/CLAUDE.md` (and `apps/web/AGENTS.md` for Next.js 16 specifics)
- Mobile patterns → `apps/mobile/.claude/CLAUDE.md`
