---
description: Audit the workshop project for production readiness — outputs a prioritized findings list
---

# Production Audit

Walk the codebase as a senior reviewer would and produce a Markdown checklist of issues organized by domain and severity. The audit identifies problems — it does not propose fixes (the developer chooses the right fix in context).

## Scope

This workshop project is a Turborepo monorepo with three apps:

- `apps/api` (NestJS, Prisma, PostgreSQL)
- `apps/web` (Next.js 16, Tailwind 4, shadcn/ui)
- `apps/mobile` (Flutter, Riverpod, GoRouter, Dio)

Focus the audit on what's actually present. Don't ding the project for missing things that are intentionally out of scope (auth, AWS, multiple locales).

## How to run

### Phase 1 — Read the project

- Top-level: `package.json`, `turbo.json`, `docker-compose.yml`
- Root and per-app `.claude/CLAUDE.md`
- API: `prisma/schema.prisma`, `src/main.ts`, `src/app.module.ts`, all module specs
- Web: `next.config.ts`, `app/[locale]/layout.tsx`, providers, hooks
- Mobile: `pubspec.yaml`, `lib/main.dart`, the items feature

### Phase 2 — Audit by domain

| Domain | What to check |
|--------|---------------|
| Architecture | Module boundaries, single responsibility, no circular deps |
| Code quality | TypeScript/Dart strictness, dead code, unused deps |
| Security | No secrets in code, no PII in logs, no unsafe input flow, CORS sanity |
| Performance | N+1 queries, missing indexes, bundle size red flags |
| Database | Schema design, migration cleanliness, query patterns |
| API contract | DTO validation, error shapes, versioning consistency |
| Frontend | Server vs client components correct, locale-aware routing, accessibility basics |
| Mobile | Provider invalidation, error mapping, hardcoded values |
| DevOps | docker-compose works, env example up to date, CI passes |
| Tests | Coverage of critical paths, deterministic assertions |

### Phase 3 — Cross-cutting

- Type alignment across `packages/types` ↔ Prisma ↔ Dart models
- i18n coverage: every user-visible string in en JSON and `app_en.arb`
- Pagination contract identical across api, web hooks, and mobile repository
- Error path: an API 404 reaches the user as a localized message, not a stack trace

## Output

Write the report to `.claude/skills/production-audit/outputs/audit-YYYY-MM-DD.md` (use today's date; if a file already exists, suffix `-2`, `-3`, etc.).

```markdown
# Production Audit Report

**Project**: Workshop Starter
**Audited**: YYYY-MM-DD

## Summary

[2–3 sentences. Overall health and biggest risks.]

| Category | Critical | High | Medium | Low |
|----------|---------:|-----:|-------:|----:|
| Architecture & code quality | 0 | 0 | 0 | 0 |
| Security | 0 | 0 | 0 | 0 |
| Performance | 0 | 0 | 0 | 0 |
| Database | 0 | 0 | 0 | 0 |
| API contract | 0 | 0 | 0 | 0 |
| Frontend | 0 | 0 | 0 | 0 |
| Mobile | 0 | 0 | 0 | 0 |
| DevOps | 0 | 0 | 0 | 0 |
| Tests | 0 | 0 | 0 | 0 |
| **Total** | **0** | **0** | **0** | **0** |

## Architecture & code quality

### Critical
- [ ] **#1 [Short title]** ❌ OPEN — [What's wrong + production consequence in 2 sentences]. Found in: `path/to/file:line`

[continue with other domains and severities]

## Next steps

[Top 5 items to fix first, ordered by risk×effort.]
```

## Severity definitions

- **Critical** — will cause outages, data loss, or security breaches in production
- **High** — significant risk under real traffic
- **Medium** — best practice issue that becomes painful at scale
- **Low** — nice to have, fix while passing through

## Rules

- Findings describe problems, never fixes. No code suggestions.
- Every finding cites a file and line.
- 2–3 sentences max per finding. If longer, split.
- Number findings sequentially across the entire report (#1, #2, ...).
- If a domain is clean, write "No issues found" — don't pad.
