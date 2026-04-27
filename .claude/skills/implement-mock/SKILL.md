---
description: Convert an indexed HTML mock into Workshop frontend code
argument-hint: [mock-index (e.g. 001)]
---

# Implement Mock

Turn an HTML mock into a real React component or page in `apps/web`.

## Input

- Required: 3-digit index from `.claude/mocks/INDEX.md`
- The mock file: `.claude/mocks/[index]-*.html`

## Process

1. Resolve the file path from `INDEX.md`. If the index isn't found, stop with: `Mock index [###] not found in .claude/mocks/INDEX.md`.
2. Read the mock HTML.
3. Convert to a `.tsx` file in the appropriate location:
   - Reusable component → `apps/web/components/<feature>/`
   - shadcn primitive → `apps/web/components/ui/` (rare — usually use `npx shadcn add`)
   - Page-level → `apps/web/app/[locale]/<route>/page.tsx`
4. Replace Tailwind utility classes verbatim where possible. Convert any inline styles to Tailwind tokens.
5. Replace placeholder text with `useTranslations()` calls and add the keys to `apps/web/locales/en/<namespace>.json`.
6. Replace placeholder data with props or React Query hooks.
7. Reuse existing shadcn/ui components instead of rebuilding (`Button`, `Card`, `Input`, etc.).
8. Update `INDEX.md`: change Status to `Implemented`, fill in the Target column with the new file path.

## Guardrails

- TypeScript only. Strict types — no `any`.
- Server component by default. Add `'use client'` only when the component uses state, effects, or browser APIs.
- Locale-aware Link from `@/i18n/navigation` for any internal navigation.
- Don't fabricate API endpoints — hook into existing ones or stop and ask.
