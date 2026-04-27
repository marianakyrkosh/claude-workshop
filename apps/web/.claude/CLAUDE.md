# Web — Claude Guide

Implementation rules for `apps/web`. See root `.claude/CLAUDE.md` for cross-app policy.

> Also read `apps/web/AGENTS.md` for Next.js 16-specific guidance — this is not the Next.js documented in your training data.

## Stack

- Next.js 16 (App Router) + React 19
- TypeScript (strict)
- Tailwind CSS 4 (PostCSS plugin) + shadcn/ui (Radix Slot)
- next-intl for i18n
- React Query (`@tanstack/react-query`) for server state
- Sonner for toasts
- Vitest for unit tests, Playwright for e2e

## Layout

```
app/
  layout.tsx                 root pass-through (returns children)
  globals.css                Tailwind imports, theme tokens
  providers.tsx              QueryClientProvider, Toaster
  [locale]/
    layout.tsx               <html lang>, NextIntlClientProvider, header
    page.tsx                 home (server component)
    items/
      page.tsx               list (client)
      new/page.tsx           create form (client)
      [id]/page.tsx          detail (client)
      [id]/edit/page.tsx     edit form (client)
components/
  ui/                        shadcn primitives (Button, Card, Input, Textarea, Label, Dialog)
config/
  env.ts                     NEXT_PUBLIC_API_URL with default
hooks/
  use-items.ts               React Query CRUD hooks
i18n/
  config.ts                  locales array, defaultLocale
  routing.ts                 defineRouting, localePrefix
  navigation.ts              createNavigation — locale-aware Link
  request.ts                 next-intl getRequestConfig
lib/
  utils.ts                   cn() helper
locales/
  en/
    common.json              app name, nav, home strings
    items.json               Items feature strings
middleware.ts                next-intl middleware
__tests__/                   Vitest tests
e2e/                         Playwright tests
```

## Implementation rules

1. **Server components by default.** Add `'use client'` only when the file uses state, effects, refs, or browser APIs.
2. **Always use the locale-aware Link** from `@/i18n/navigation` — never `next/link` directly. The middleware handles prefix logic.
3. **Translations live in `locales/en/`** — `useTranslations('namespace')` in client, `getTranslations('namespace')` in server. Never hardcode user-visible strings.
4. **shadcn primitives** (`<Button>`, `<Card>`, `<Input>`, `<Textarea>`, `<Label>`) — don't rebuild these. Add new shadcn components with `npx shadcn add <name>`.
5. **Static `process.env.NEXT_PUBLIC_*` access only** — don't use bracket notation or it won't inline.
6. **No hardcoded visual values.** Use Tailwind tokens (`bg-primary`, `text-muted-foreground`, `text-destructive`, `space-y-6`) and CSS variables defined in `globals.css`.
7. **Edge/middleware code can't use Node APIs** (`fs`, `path`, etc.) — keep `middleware.ts` clean.

## API integration

```typescript
import { env } from '@/config/env'

const res = await fetch(`${env.API_URL}/items`, {
  // Don't set Content-Type for GET — only when there's a body
})
```

The `fetchJson` helper in `hooks/use-items.ts` already handles this.

## React Query hooks

Pattern in `hooks/use-items.ts`:

- `useItems(page, limit)` for paginated list
- `useItem(id)` with `enabled: !!id`
- `useCreateItem` / `useUpdateItem` / `useDeleteItem` invalidating the right keys

When adding a new feature, mirror this pattern in `hooks/use-<feature>.ts`.

## Forms

- `useState` controlled inputs are fine for simple forms (the Items example uses this)
- For complex validation, layer `react-hook-form` + `zod` (already in package.json) on top of shadcn primitives
- Always show pending state on the submit button (`isPending` from React Query)
- Always handle `onError` with `toast.error(err.message)`

## Locale-aware navigation

```tsx
import { Link } from '@/i18n/navigation'
// ...
<Link href="/items">Items</Link>
```

Server-side redirects use `redirect()` from the same module:

```tsx
import { redirect } from '@/i18n/navigation'
redirect('/items')
```

## Testing

```bash
npm run test         # Vitest
npx playwright test  # Playwright
```

- Vitest tests under `__tests__/` or colocated `.test.tsx`
- Wrap rendered components with `NextIntlClientProvider` providing the messages they use
- Wrap with `QueryClientProvider` (with `retry: false`) for components using React Query
- Playwright e2e under `e2e/` — assume the API is running separately

## Adding a new page

1. Create `app/[locale]/<route>/page.tsx`
2. Decide: server (default) or client (`'use client'` if interactive)
3. Add strings to `locales/en/<namespace>.json`
4. Use `useTranslations` / `getTranslations` for all text
5. Wire navigation via `Link` from `@/i18n/navigation`
6. Add to the header in `app/[locale]/layout.tsx` if it's a top-level destination
