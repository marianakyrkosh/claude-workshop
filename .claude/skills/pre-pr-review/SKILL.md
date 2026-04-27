---
description: Self-review changes for correctness and risk before opening a PR
argument-hint: [feature name or scope (optional)]
---

# Pre-PR Review

Walk the diff with fresh eyes. Catch issues here so reviewers can focus on design instead of nits.

## Priorities (top first)

1. Correctness — does this actually do what the change request says?
2. Behavior regressions — did anything else change unintentionally?
3. Cross-layer contract — API DTO, web types, mobile freezed models all agree?
4. Validation & guards — DTO validation present, error handling explicit, no silent failures
5. Test coverage — is the new behavior actually exercised?
6. Security/privacy — no secrets logged, no PII in error messages, no unsafe input passed through

## Workshop-specific checks

- API: routes still under `/v1`, DTOs use class-validator, services don't leak Prisma details to controllers
- Web: server vs client components are correct, locale-aware Link used for nav, no hardcoded user-facing strings
- Mobile: freezed models match the API response shape, providers invalidate correctly after mutations, no hardcoded visual values
- Shared: types in `packages/types` mirror Prisma enums when applicable
- i18n: every new user-visible string exists in `apps/web/locales/en/*.json` and `apps/mobile/lib/core/l10n/app_en.arb`

## Output

If issues exist, list them in severity order with a one-line fix per item. If clean, say so and list any residual risks or test gaps the reviewer should know about.

## Run before output

```bash
# Pick the apps your change touches
cd apps/api && npm run lint && npm run test
cd apps/web && npx eslint . && npx vitest run
cd apps/mobile && flutter analyze && flutter test
```
