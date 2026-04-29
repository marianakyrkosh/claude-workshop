---
description: Parse a feature description into a structured change request
argument-hint: [feature description | ticket text | path/to/sprint.md[#N]]
---

# Parse Ticket

Turn raw requirements into a normalized change request that the rest of the feature workflow can build on.

## Input

The argument can be any of:

- **Free-text feature description or ticket body** — used as-is.
- **A path to a Markdown file** (typically a sprint backlog like `docs/sprints/sprint1.md`) — read the file and treat its contents as the ticket source. If the file lists more than one feature (multiple `## N. Title` headings), ask the user which one to parse before continuing.
- **A path with an item selector** — e.g. `docs/sprints/sprint1.md#1` or `docs/sprints/sprint1.md#item-subtitle`. Pick that specific item:
  - `#N` (numeric) selects the Nth top-level item heading (`## N. Title` or `## N) Title`).
  - `#slug` (text) matches the item's heading slug case-insensitively (e.g. `item-subtitle` matches `## 1. Item subtitle`).
- **A path to a non-Markdown file or a missing path** — fall back to treating the argument as free-text and warn the user.

The sprint/source file is **read-only input** — never modify it during parsing. If the source already contains structured sections (Scope, Acceptance criteria, Out of scope, etc.), reuse and refine them in the output rather than discarding them.

Before writing the change request, derive the kebab-case slug from the resolved item's title and echo back the resolved title in 1–2 lines so the user can confirm the right item was picked.

## Stack context

- Web: Next.js 16 (App Router), Tailwind CSS 4, shadcn/ui, next-intl, React Query
- API: NestJS, Prisma, PostgreSQL
- Mobile: Flutter, Riverpod, GoRouter, Dio, Freezed
- Routes versioned under `/v1`
- Monorepo (Turborepo): `apps/api`, `apps/web`, `apps/mobile`, `packages/*`

## Output

Write to `.claude/workitems/feedback/REQUEST-[slug].md`. Create the directory if missing.

## Figma context (optional)

The Figma MCP is available if you've configured it (see `settings.json`). If the description happens to include a Figma URL (`figma.com/design/...?node-id=...`) and the MCP is reachable, extract the `fileKey` and `nodeId` and call `get_design_context` (or `get_screenshot`) to enrich the request. Embed key visual notes — layout, components, states — directly in the change request.

If there's no Figma URL or the MCP isn't configured, skip this step entirely. The workflow doesn't depend on Figma.

## Required sections

- **Summary** — one or two sentences of intent
- **In scope / Out of scope** — explicit boundaries
- **Impacted layers** — `apps/api`, `apps/web`, `apps/mobile`, `packages/types`, DB schema
- **API contract impact** — new/changed routes, request/response shapes, breaking changes
- **Data model impact** — Prisma schema changes, migrations needed
- **i18n impact** — new strings to add to `apps/web/locales/en/*.json` and `apps/mobile/lib/core/l10n/app_en.arb`
- **Test plan** — which layers get unit, integration, and e2e coverage
- **Risks & assumptions** — anything that might block, anything assumed
- **Open questions** — items that need clarification
- **Acceptance criteria** — checklist of observable outcomes

## Style

Concrete and concise. Prefer bullet points over prose. Reference specific files when known.

## Examples

```bash
/parse-ticket Add bulk delete for items
/parse-ticket docs/sprints/sprint1.md           # prompt to pick an item if multiple
/parse-ticket docs/sprints/sprint1.md#1         # the first item in the sprint file
/parse-ticket docs/sprints/sprint1.md#item-subtitle
```
