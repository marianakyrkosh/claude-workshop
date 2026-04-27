---
description: Parse a feature description into a structured change request
argument-hint: [feature description or ticket text]
---

# Parse Ticket

Turn raw requirements into a normalized change request that the rest of the feature workflow can build on.

## Stack context

- Web: Next.js 16 (App Router), Tailwind CSS 4, shadcn/ui, next-intl, React Query
- API: NestJS, Prisma, PostgreSQL
- Mobile: Flutter, Riverpod, GoRouter, Dio, Freezed
- Routes versioned under `/v1`
- Monorepo (Turborepo): `apps/api`, `apps/web`, `apps/mobile`, `packages/*`

## Output

Write to `.claude/workitems/feedback/REQUEST-[slug].md`. Create the directory if missing.

## Figma context

If the description includes a Figma URL (`figma.com/design/...?node-id=...`), extract the `fileKey` and `nodeId` and call the Figma MCP `get_design_context` (or `get_screenshot`) to enrich the request. Embed key visual notes — layout, components, states — directly in the change request so later phases don't have to re-fetch.

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
