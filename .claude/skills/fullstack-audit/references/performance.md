# Performance Checklist

## Database Query Performance

### N+1 Queries

This is the single most common performance problem in Prisma applications. An N+1 happens when you fetch a list of items (1 query), then fetch related data for each item in a loop (N queries). A list of 100 users with their posts becomes 101 queries instead of 2.

- Enable Prisma query logging (`log: ['query']`) and look at the actual SQL being executed. If you see the same SELECT repeated with different WHERE values in a loop, that's an N+1.
- Check for `findMany` calls followed by loops that call `findUnique` or `findFirst` on related data.
- The fix is usually `include` or `select` with nested relations in the original query.
- Look for GraphQL resolvers (if applicable) that resolve relations field-by-field — these are N+1 machines without a DataLoader.

### Select vs Include

- Are queries fetching only the fields they need? `findMany()` with no `select` returns every column, including potentially large text fields or internal metadata.
- For list endpoints that display summaries, use `select` to fetch only displayed fields.
- For detail endpoints, `include` with specific relations is fine.
- Check API response sizes — if responses contain fields the frontend doesn't use, the query is over-fetching.

### Missing Indexes

- Read the Prisma schema and identify fields used in `WHERE`, `ORDER BY`, and `JOIN` clauses that don't have `@@index`.
- Common misses: foreign key fields on the "many" side of relations, status/type fields used for filtering, date fields used for sorting or range queries.
- Check for composite indexes on fields that are frequently queried together (e.g., `@@index([userId, createdAt])`).
- Be cautious about over-indexing — each index slows writes. Index fields that are queried frequently and selectively.

### Pagination

- Are list endpoints paginated? Unbounded `findMany()` calls are a ticking time bomb — they're fine with 100 rows and catastrophic with 100,000.
- **Offset pagination** (`skip`/`take`): Simple but degrades at scale because the database still traverses skipped rows. Acceptable for admin panels and small datasets.
- **Cursor-based pagination**: Uses an indexed column (usually `id` or `createdAt`) to efficiently seek to the starting point. Required for large datasets, infinite scroll, or real-time feeds.
- Check for endpoints that accept unbounded `limit` or `pageSize` parameters from the client with no server-side cap.

### Bulk Operations

- Are there loops that create/update records one at a time? Prisma's `createMany`, `updateMany`, and `deleteMany` are significantly faster for batch operations.
- Look for `Promise.all` wrapping individual `create` calls — this parallelizes but still makes N separate queries. `createMany` is a single query.

## Next.js Performance

### Bundle Size

- Is `@next/bundle-analyzer` configured? Without it, you're guessing about what's in the bundle.
- Look for large dependencies imported on the client side: moment.js (use date-fns or dayjs), lodash (import individual functions), entire icon libraries (import specific icons).
- Check for `'use client'` on components that don't need it — each client component and its dependencies get shipped to the browser.
- Are dynamic imports (`next/dynamic`) used for heavy components that aren't needed on initial load (charts, editors, maps)?

### Image Optimization

- Is `next/image` used for all images? Raw `<img>` tags skip optimization (no lazy loading, no responsive sizing, no format conversion).
- Are external image domains configured in `next.config.js` (`images.remotePatterns`)?
- Do images have explicit `width` and `height` (or `fill`) to prevent layout shift (CLS)?
- Are large hero/banner images using `priority` prop for above-the-fold loading?

### Rendering Strategy

- **Static pages** (no user-specific data): Should be statically generated at build time or use ISR. Check that they're not accidentally using SSR because of a dynamic function call (`cookies()`, `headers()`, `searchParams`).
- **Dynamic pages** (user-specific): Should use SSR with proper caching headers.
- **Interactive components**: Should be Client Components wrapped in Suspense boundaries for streaming.
- Is `generateStaticParams` used for dynamic routes that can be pre-rendered?
- Check for `cookies()` or `headers()` calls at the top of layouts — these opt the entire subtree into dynamic rendering.

### Caching

- Are fetch requests using Next.js caching directives (`cache: 'force-cache'`, `next: { revalidate: N }`)?
- Is `revalidatePath()` or `revalidateTag()` used for on-demand cache invalidation after mutations?
- For data that rarely changes, are there appropriate revalidation periods (not just "no-store" everywhere)?

## NestJS Performance

### Caching

- Is a caching layer implemented for frequently accessed, rarely changing data? Options: NestJS CacheModule (in-memory), Redis (distributed).
- Are cached responses invalidated when the underlying data changes?
- Is there a cache-aside pattern where reads check cache first, writes update cache?

### Compression

- Is HTTP compression (gzip/brotli) enabled? For NestJS this is typically compression middleware. If behind a reverse proxy (Nginx, CloudFront), compression should happen there instead.

### Connection Management

- Is the Prisma client using the singleton pattern to prevent connection pool exhaustion? In development with hot reload, each file change can create a new Prisma instance. The singleton pattern stores the instance on `globalThis`.
- Is the connection pool size configured appropriately? Default is `num_cpus * 2 + 1`. For serverless, start with `connection_limit=1`.
- If using PgBouncer: is the `?pgbouncer=true` flag set on the connection URL?

### Response Optimization

- Are API responses serialized to exclude unnecessary fields? Without output DTOs or Prisma `select`, responses often contain internal fields, soft-delete flags, or relation IDs the client doesn't need.
- Is payload compression happening at the right layer (application vs reverse proxy)?
- Are there endpoints returning large arrays without pagination or streaming?
