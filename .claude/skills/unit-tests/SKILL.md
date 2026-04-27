---
description: Add or update unit tests for changed code
argument-hint: [target file or feature slug]
---

# Unit Tests

Cover behavior at the unit level. Aim for tests that explain intent — not tests that mirror the implementation.

## By app

### apps/api (Jest)

- Service specs colocated next to the service: `*.service.spec.ts`
- Mock `PrismaService` with jest.fn() for each method used
- Cover both success paths and error paths (NotFoundException, validation failures)
- Controller specs: `*.controller.spec.ts` — mock the service, assert it's called with the right args

```bash
cd apps/api && npm run test
```

### apps/web (Vitest)

- Component tests under `__tests__/` or colocated as `*.test.tsx`
- Cover render states: loading, error, empty, populated
- Use `@testing-library/react` queries (getByRole, getByLabelText) — avoid testid soup
- Wrap with QueryClientProvider when the component uses React Query
- Wrap with NextIntlClientProvider when the component uses translations

```bash
cd apps/web && npx vitest run
```

### apps/mobile (Flutter)

- Widget tests under `test/` mirroring `lib/` structure
- Cover provider state transitions using `ProviderContainer`
- Cover repository methods by mocking Dio
- Cover freezed model JSON round-trips
- Pump the widget tree with `MaterialApp` + localization delegates when testing screens

```bash
cd apps/mobile && flutter test
```

After freezed model changes:
```bash
cd apps/mobile && dart run build_runner build --delete-conflicting-outputs
```

## Style

- One behavior per test
- Descriptive test names: "returns 404 when item does not exist", not "test getItem"
- Avoid testing framework internals — test what your code does, not what NestJS/React/Flutter does
