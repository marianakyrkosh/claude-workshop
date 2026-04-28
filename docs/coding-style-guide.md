# Coding style guide

Conventions that span all three apps. Local guides (`apps/<app>/.claude/CLAUDE.md`) get the last word on app-specific details.

## Languages

- **TypeScript strict mode** in `apps/api`, `apps/web`, and `packages/*`. No `any` unless explicitly justified with a comment.
- **Dart strict mode** in `apps/mobile`. No `dynamic` unless you're at the JSON parsing boundary.

## Naming

| What | Convention |
|------|-----------|
| TypeScript files | `kebab-case.ts` for utilities, `PascalCase.tsx` for React components, `<feature>.<role>.ts` for NestJS files (e.g. `items.service.ts`) |
| Dart files | `snake_case.dart` |
| Classes / types | `PascalCase` |
| Variables / functions | `camelCase` |
| Constants | `UPPER_SNAKE` for true compile-time constants, `camelCase` for everything else (Dart and TS) |
| React Query keys | `['<feature>', ...args]` (e.g. `['items', page, limit]`) |
| Riverpod providers | `<name>Provider` (e.g. `itemsProvider`) |
| Routes | `AppRoutes.<name>` constants (Dart), `/<feature>` (Next.js) |
| Translation keys | `nested.json.path.in.locale.file` |

## File organization

### apps/api

```
src/<feature>/
  <feature>.module.ts
  <feature>.controller.ts
  <feature>.service.ts
  <feature>.controller.spec.ts
  <feature>.service.spec.ts
  dto/
    create-<feature>.dto.ts
    update-<feature>.dto.ts
```

Thin controllers — they parse DTOs, call the service, return what the service returns. Business logic lives in the service. DTOs use class-validator; required fields use `!:` (e.g. `title!: string`) so TS strict mode is happy and class-validator handles the runtime check.

### apps/web

Server components by default in `app/[locale]/`. Client components opt in with `'use client'` at the top. Reusable hooks go in `hooks/use-<feature>.ts`. Reusable components in `components/<feature>/`. shadcn primitives in `components/ui/`. Don't put feature-specific components under `components/ui/`.

### apps/mobile

Feature-first. Each feature owns:

```
lib/features/<name>/
  data/<name>_repository.dart
  providers/<name>_provider.dart
  presentation/
    <name>_screen.dart
    <name>_detail_screen.dart
    create_<name>_screen.dart
    edit_<name>_screen.dart
```

Shared widgets used by more than one feature go in `lib/core/widgets/`, not in a feature folder.

## TypeScript rules

- Strict mode on; no `any` unless commented
- Imports: external first, then alias (`@/...`), then relative — Prettier doesn't sort, but keep the groups separated by a blank line for readability
- Use `import type` for type-only imports
- Don't re-export everything through `index.ts` barrel files in feature folders — barrels make tree-shaking sad

## Dart rules

- Import order: `dart:` → `package:` → relative
- Single quotes for strings (`prefer_single_quotes`)
- Trailing commas everywhere (`require_trailing_commas`)
- `const` constructors and declarations whenever possible
- Sort `child:` properties last in widgets (`sort_child_properties_last`)
- All collected by `analysis_options.yaml` — `flutter analyze` enforces

## React component patterns

- Server component until proven otherwise. Adding `'use client'` is a deliberate choice, not a default.
- Always handle the four states: `loading`, `error`, `empty`, `populated`. Even if "empty" is a one-line message.
- Use accessible queries in tests (`getByRole`, `getByLabelText`) — selectors should mirror what users perceive.
- Forms use controlled inputs for simple cases. For anything with cross-field validation, install `react-hook-form` + `@hookform/resolvers` + `zod` (`npm install --workspace=apps/web ...`) and layer them on top of the shadcn primitives.
- Keep `onError` handlers explicit — silent failures are a code smell.

## Flutter widget patterns

- `ConsumerWidget` for read-only screens, `ConsumerStatefulWidget` when local state matters.
- `AsyncValue.when` is the standard way to render loading/error/data — don't reinvent.
- Dispose controllers in `dispose()`. The linter usually catches misses.
- Check `context.mounted` after every `await` before touching the UI.
- Use `core/widgets/AppCard`, `core/widgets/AppTextField` — don't rebuild equivalents per feature.

## API module pattern

The Items module is the reference shape. To add a new module:

1. Add the model to `apps/api/prisma/schema.prisma`
2. `npx prisma migrate dev --name add-<feature>` (creates a migration)
3. `npx prisma generate` (regenerates the client; usually automatic)
4. Create `apps/api/src/<feature>/` with the file layout above
5. Register the module in `app.module.ts`
6. Add Swagger decorators (`@ApiTags`, `@ApiOperation`)
7. Write the service and controller specs

Cross-app contract changes? Update `packages/types` first, then the API, then web hooks, then mobile models — in that order, in the same PR.

## Testing conventions

| Layer | Framework | Lives at | What to cover |
|-------|-----------|----------|---------------|
| API unit | Jest | `<feature>.<role>.spec.ts` colocated | Service: success + error paths. Controller: routing + DI |
| API e2e | Jest + Supertest | `apps/api/test/*.e2e-spec.ts` | Full request/response cycle |
| Web unit | Vitest | `apps/web/__tests__/` or colocated `*.test.tsx` | Render states; React Query hook logic |
| Web e2e | Playwright | `apps/web/e2e/*.spec.ts` | User flows end-to-end |
| Mobile unit/widget | Flutter test | `apps/mobile/test/` mirroring `lib/` | Widget rendering, provider transitions, repository methods |
| Mobile integration | Flutter integration_test | `apps/mobile/integration_test/` | Full user flows on device |

Test names describe behavior, not implementation. "returns 404 when item does not exist" beats "test getItem".

## Git workflow

- One feature per branch. Branch name: `feature/<kebab-slug>` (e.g. `feature/add-bulk-delete`).
- Branch from updated `main`. Never branch from another feature branch.
- Conventional Commits: `feat(scope): ...`, `fix(scope): ...`, `chore(scope): ...`, `docs(scope): ...`. Scope is the touched area (`api`, `web`, `mobile`, `items`, `i18n`, ...).
- Commit body explains *why*, not *what* — the diff already says what.
- Co-author tag stays on Claude-assisted commits.

## Pull requests

- Title: conventional commit form, under 70 chars.
- Body: Summary (bullets), Test plan (checklist), notes on breaking changes / migrations / screenshots for UI.
- Use `/pre-pr-review` before opening; address findings before pushing.
- Use `/address-pr-comments <PR#>` (or the `/loop` cron) to handle Copilot/reviewer feedback.

## Design tokens — no exceptions

The single rule that prevents the most pain at scale:

- **Web**: Tailwind tokens (`bg-primary`, `text-destructive`, `text-muted-foreground`, `border-border`, etc.) and the CSS variables in `apps/web/app/globals.css`. No `text-red-500`, no `bg-#5669FF`, no inline styles with magic pixel values.
- **Mobile**: `AppColors`, `AppTypography`, `AppSpacing`, `AppRadius`, `AppSizes` from `lib/core/theme/`. No `Color(0xFF...)` or `EdgeInsets.all(16)` — use the token.

If a token doesn't exist, add it to the theme file first, then use it. The diff is a one-liner; the precedent is project-wide.
