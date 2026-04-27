# Database & Prisma Checklist

## Schema Design

### Naming & Conventions

- Models use PascalCase singular names (User, not users or Users)
- Fields use camelCase
- If the database uses snake_case columns (common with PostgreSQL), are `@map` and `@@map` used to keep the Prisma schema readable while preserving database naming?

### Relations

- Are both sides of relationships defined? Missing back-relations cause confusion and limit query capabilities.
- For many-to-many: Is an explicit join table used when the relationship carries extra data (e.g., role, joinedAt)? Implicit many-to-many is fine for simple associations.
- Are foreign key fields indexed? Prisma creates indexes on `@unique` and `@id` fields, but plain foreign keys used in `@relation` need manual `@@index` declarations — without them, joins and filtered queries trigger full table scans.

### Constraints & Data Integrity

- Are `@unique` constraints applied where business rules require uniqueness (email, slug, external IDs)?
- Are composite unique constraints (`@@unique([userId, projectId])`) used where a combination must be unique?
- Are required fields truly required? Look for optional fields (`String?`) that should be required — missing data causes bugs downstream.
- Are enum types used for fields with a fixed set of values (status, role, type)? String fields used as enums without validation allow invalid data.
- Are default values sensible? Check `@default` usage on timestamps, status fields, and boolean flags.

### Timestamps

- Do all models have `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt`?
- For PostgreSQL: Are timestamps using `@db.Timestamptz` for timezone-aware storage? Without it, Prisma uses `timestamp without time zone`, which can cause issues in multi-timezone deployments.

### Soft Deletes

- If soft deletes are implemented, is there a consistent pattern?
  - `deletedAt DateTime?` is more flexible than `isDeleted Boolean` (you get the deletion timestamp for free)
  - Is there a middleware or client extension that automatically filters out soft-deleted records?
  - Are unique constraints handled? A soft-deleted user with email "john@example.com" will block a new user with the same email unless you use partial indexes (`WHERE deleted_at IS NULL`).
- If soft deletes are NOT used, should they be? Consider whether the app needs audit trails, undo functionality, or compliance with data retention policies.

### Schema Organization

- For large schemas: Are related models grouped with comments or separated into logical sections?
- Is the schema a single file or split using Prisma's multi-file schema feature? For 20+ models, splitting improves maintainability.

## Migration Strategy

### Migration Files

- Are migration files committed to version control? They should be — they're the deployment record.
- Are migration files ever manually edited? This is risky but sometimes necessary (data migrations, custom SQL). If so, are the edits documented?
- Is there a clear distinction between development migrations (`prisma migrate dev`) and production deployments (`prisma migrate deploy`)?

### Deployment Safety

- Is `prisma migrate deploy` run in CI/CD before the application starts? Running migrations as part of the app startup process is fragile — if the migration fails, the app might start with a stale schema.
- Are destructive migrations (dropping columns, tables) handled with care? The safe pattern is: deploy code that stops using the column → migrate to drop it. Not the other way around.
- Is there a rollback strategy? Prisma doesn't natively support rollback migrations. If a migration fails in production, what's the plan?

### Connection Configuration

- Are two connection URLs configured?
  - `DATABASE_URL`: For the application (may go through a connection pooler like PgBouncer)
  - `DIRECT_URL`: For migrations (must connect directly to the database, not through a pooler)
- If using PgBouncer: Is the `?pgbouncer=true` parameter on the application URL?

## Query Patterns

### Common Anti-Patterns

- **Unbounded queries**: `findMany()` with no `take` limit. Every list query should have a maximum page size.
- **Over-fetching**: Using `findMany()` or `findUnique()` without `select` or `include` when only a few fields are needed.
- **Sequential queries in loops**: Fetching related data in a `for` loop instead of using `include` or batching with `findMany({ where: { id: { in: ids } } })`.
- **Missing transactions**: Operations that must succeed or fail together (e.g., creating an order and decrementing inventory) should use `prisma.$transaction()`.
- **Ignoring count for pagination**: Using `findMany` for paginated lists without a corresponding `count` query for the total — the UI can't show page counts or "showing X of Y".

### Error Handling

- Are Prisma errors caught and translated into appropriate HTTP responses? Prisma throws specific error codes (P2002 for unique constraint violation, P2025 for record not found). These should map to 409 Conflict, 404 Not Found, etc. — not generic 500 errors.
- Is there a centralized Prisma error handler or are try-catch blocks duplicated across services?

## PostgreSQL-Specific

### Indexes

- Beyond what Prisma creates automatically: Are there indexes on fields frequently used in `WHERE` clauses, `ORDER BY`, and join conditions?
- For text search: Are GIN or GiST indexes used where full-text search is needed?
- Are partial indexes used where queries consistently filter on a condition (e.g., `WHERE status = 'active'` or `WHERE deleted_at IS NULL`)?

### Data Types

- Are appropriate PostgreSQL types used? Common misses:
  - `Decimal` for money (not `Float` — floating point causes rounding errors)
  - `@db.Uuid` for UUIDs (not `String`)
  - `@db.Text` for long text fields (not `String` with arbitrary `@db.VarChar(N)` limits)
  - `Json` type used sparingly and with a clear reason (it bypasses schema validation)

### Connection Limits

- Is the application's connection pool size appropriate for the RDS instance? Check `max_connections` on RDS and ensure the app's pool doesn't exceed it (leaving headroom for admin connections and migrations).
- For serverless or auto-scaling setups: Is there a connection pooler (PgBouncer) between the app and RDS to prevent connection exhaustion during scale-up events?
