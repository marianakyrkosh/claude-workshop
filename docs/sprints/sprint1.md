# Sprint 1

Workshop sprint backlog. Each item is a self-contained feature description suitable for `/feature-flow docs/sprints/sprint1.md#<n>`.

## 1. Item subtitle

Add an optional `subtitle` field to `Item` so users can give an item a short tagline below the title.

**Scope**

- Backend (`apps/api`):
  - Add `subtitle String?` to `Item` in `prisma/schema.prisma`, generate a migration.
  - Add a validated `subtitle` field to `CreateItemDto` and `UpdateItemDto` (optional, max length 200).
  - Update Swagger annotations.
  - Update controller/service specs to cover the new field.
- Web (`apps/web`):
  - Surface `subtitle` in:
    - the items list (rendered under the title in each card),
    - the detail page (rendered under the heading),
    - the create form (`/items/new`) and edit form (`/items/[id]/edit`) as a single-line input below the title.
  - Add new translation keys to `locales/en/items.json` (`form.subtitleLabel`, `form.subtitlePlaceholder`).
  - Update the local `Item` shape in `hooks/use-items.ts` (or, preferred, export it from `@repo/types`).
- Shared types (`packages/types`):
  - If the team agrees during planning, move the `Item` shape into `packages/types` so the web client and any future mobile/api consumers stay in sync.
- Tests:
  - API: extend `items.service.spec.ts` and `items.controller.spec.ts` to cover create + update with a subtitle.
  - Web: extend the items-list Vitest test to render an item with a subtitle, and extend `e2e/items.spec.ts` to fill the subtitle in the create flow.

**Acceptance criteria**

- `subtitle` is optional everywhere — existing items without one render unchanged.
- Max length is enforced on both client (`maxLength={200}`) and server (`@MaxLength(200)`).
- Translations are used for every new user-visible string; no hardcoded English in feature code.
- `npm run lint`, `npm run test`, and `npx tsc --noEmit` all pass for both `apps/api` and `apps/web`.
- The Prisma migration is committed and named descriptively (e.g. `add_item_subtitle`).

**Out of scope**

- Mobile (`apps/mobile`) — pick up in a follow-up sprint.
- Search/filter on subtitle.
- Markdown or rich-text in subtitle (plain string only).
