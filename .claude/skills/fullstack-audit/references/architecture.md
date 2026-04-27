# Architecture & Code Quality Checklist

## Project Structure

### Monorepo Organization

- Is the separation between Next.js (frontend) and NestJS (backend) clean?
- Are shared types/interfaces/DTOs in a shared package or duplicated?
- Is there a clear dependency direction (frontend depends on shared, backend depends on shared, neither depends on the other)?
- If using a monorepo tool (Nx, Turborepo, npm/pnpm workspaces), is it configured correctly?

### NestJS Architecture

- **Module organization**: Each feature should be a self-contained module with its own controller, service, DTOs, and entities. Look for god-modules that do too many unrelated things.
- **Layered separation**: Controllers should only handle HTTP concerns (parsing requests, returning responses). Business logic belongs in services. Database access belongs in repositories or Prisma service calls.
- **Business logic in controllers**: This is one of the most common anti-patterns. Controllers with conditional branches, data transformations, or direct Prisma calls are a red flag.
- **Circular dependencies**: Check for `forwardRef()` usage — each one is a sign of tangled module boundaries. A few are normal, many indicate architectural problems.
- **Provider scoping**: Are providers using the correct scope (SINGLETON vs REQUEST)? Incorrect scoping causes shared state bugs or memory bloat.
- **DTOs**: Are there separate input DTOs (CreateUserDto, UpdateUserDto) and output DTOs (UserResponseDto)? Missing output DTOs often means the API leaks internal fields (passwords, internal IDs, soft-delete flags).
- **Repository pattern**: Is database access abstracted behind a repository layer, or are services calling Prisma directly? Direct Prisma calls in services couple business logic to the ORM.

### Next.js Architecture

- **App Router vs Pages Router**: New projects should use App Router. Mixed usage is acceptable during migration but should be intentional, not accidental.
- **Server vs Client Components**: Are components defaulting to Server Components? Look for unnecessary `'use client'` directives — each one adds to the client bundle. Components that only render data, fetch from APIs, or access server-side resources should be Server Components.
- **Route organization**: Are routes logically grouped using route groups `(groupName)`? Are layouts used for shared UI?
- **API routes**: If the app has a NestJS backend, the Next.js API routes should be minimal (auth callbacks, BFF patterns). Duplicate API logic across both is a maintenance problem.
- **Component organization**: Are components organized by feature or by type? Feature-based (components/auth/LoginForm, components/dashboard/Chart) scales better than type-based (components/forms/Login, components/charts/Dashboard).

## TypeScript Usage

- **Strict mode**: Is `strict: true` enabled in tsconfig.json? Without it, TypeScript misses entire categories of bugs.
- **`any` type usage**: Search for `any` across the codebase. Each `any` is a hole in type safety. Occasional use in type-assertion-heavy code (e.g., middleware) is acceptable; widespread use is a problem.
- **Type assertions (`as`)**: Excessive use of `as` suggests the types don't match reality. Look for `as any`, `as unknown as Something`, and similar casts.
- **Enums vs union types**: TypeScript enums have runtime overhead and quirks. String union types (`type Status = 'active' | 'inactive'`) are usually better unless you need reverse mapping.
- **Return types**: Are function return types explicit on public APIs (service methods, controller handlers)? Implicit returns are fine for private helpers but public contracts should be explicit.
- **Nullability**: Are null/undefined cases handled properly? Look for non-null assertions (`!`) — each one is an assumption that might be wrong.

## Code Quality

- **DRY violations**: Look for duplicated logic across services, duplicated validation rules, duplicated error handling patterns. Some duplication is fine (DRY is about knowledge, not code), but identical business logic in multiple places is a bug waiting to happen.
- **Dead code**: Unused imports, commented-out code blocks, unreachable branches, exported functions with no consumers. These add noise and maintenance burden.
- **Naming**: Do names communicate intent? `handleData()` is meaningless; `validatePaymentAmount()` is clear. Look for abbreviations that hurt readability (e.g., `usrSvc`, `prcMgr`).
- **Function length**: Functions over ~50 lines are hard to test and reason about. Look for functions that do multiple unrelated things.
- **Error messages**: Are error messages helpful for debugging? `"Error"` or `"Something went wrong"` in production logs is useless.
- **Magic numbers/strings**: Are there hardcoded values that should be constants or config? Look for things like status codes, timeout values, and URL paths scattered through the code.
- **Console.log**: Are there `console.log` statements left from debugging? These should be replaced with proper logging (a structured logger with levels).
- **Async/await patterns**: Look for missing `await` on async calls (a common source of subtle bugs), unnecessary `async` on functions that don't await anything, and unhandled promise rejections.
