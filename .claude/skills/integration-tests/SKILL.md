---
description: Add e2e or integration tests for cross-layer flows
argument-hint: [feature name or flow]
---

# Integration Tests

Verify that layers cooperate correctly. Lighter than full system tests but heavier than unit tests.

## By app

### apps/api (Jest + Supertest)

- Place under `apps/api/test/` with `*.e2e-spec.ts`
- Run against an in-memory or local Postgres database
- Cover full request → response cycles, including validation errors, 404s, and pagination

```bash
cd apps/api && npm run test:e2e
```

### apps/web (Playwright)

- Place under `apps/web/e2e/` with `*.spec.ts`
- Cover the user-visible flow: navigate → interact → assert
- Use accessible selectors (getByRole, getByLabel) — avoid CSS selectors
- Requires the API to be running separately (`npm run dev` from root before running e2e)

```bash
cd apps/web && npx playwright test
```

### apps/mobile (Flutter integration_test)

- Place under `apps/mobile/integration_test/`
- Cover end-to-end flows like create → list → detail → edit
- Run on a connected device or simulator

```bash
cd apps/mobile && flutter test integration_test/
```

## Focus areas for the Items example

- API: full CRUD with pagination + validation rejection
- Web: navigate to /items, create one, edit it, delete it, see it gone
- Mobile: same flow on a device — including the confirmation dialog before delete

## Style

- Each test should describe a real user goal
- Reset state between tests (fresh DB, cleared cache)
- Keep selectors stable — prefer roles and labels over class names
