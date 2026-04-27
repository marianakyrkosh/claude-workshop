# Security Checklist

## Authentication & Authorization

### AWS Cognito Integration

- Is Cognito configured with MFA enabled (at minimum for admin users)?
- Are Cognito tokens (ID token, access token, refresh token) handled securely?
  - Stored in HTTP-only, secure, SameSite cookies — not localStorage or sessionStorage
  - Tokens are validated on the server side, not just on the client
- Is the Cognito User Pool configured with appropriate password policies (length, complexity)?
- Are unused Cognito app clients removed?
- Is adaptive authentication enabled to detect suspicious sign-in attempts?
- For NestJS: Is JWT verification using the Cognito JWKS endpoint (not hardcoded secrets)?
- For Next.js: Is auth state checked in middleware for protected routes?
- Are refresh token rotation and revocation properly implemented?

### Authorization

- **Route-level guards**: Are all protected NestJS endpoints using auth guards? Look for endpoints that should require authentication but don't have `@UseGuards()`.
- **Role-based access control**: If the app has different user roles, is RBAC implemented via guards and decorators — not ad-hoc `if (user.role === 'admin')` checks in service logic?
- **Resource-level authorization**: Beyond "is this user logged in," does the app check "does this user own this resource"? Look for endpoints that fetch/modify resources by ID without checking ownership.
- **Next.js middleware auth**: Is authentication enforced in Next.js middleware for protected routes, or only in individual page components (which can be bypassed)?

## Input Validation

### NestJS Validation

- Is the global `ValidationPipe` configured with `whitelist: true` and `forbidNonWhitelisted: true`? Without `whitelist`, extra fields in requests pass through silently — a mass assignment vulnerability.
- Are all DTOs using class-validator decorators (`@IsString()`, `@IsEmail()`, `@IsUUID()`, `@Min()`, `@Max()`, etc.)?
- Are nested objects validated using `@ValidateNested()` with `@Type()`?
- Is `transform: true` enabled for automatic type coercion?
- Are custom validators used for domain-specific rules (e.g., valid phone format, business-specific constraints)?

### Next.js Validation

- Are Server Actions validating input on the server side (using Zod, Yup, or similar)?
- Is client-side validation treated as UX only, with real validation on the server?
- Are URL parameters and search params validated before use?

### Prisma-Specific

- Are `$queryRaw` and `$executeRaw` using tagged template literals (safe) or string concatenation (SQL injection risk)?
- Is `$queryRawUnsafe()` used anywhere? If so, is the input rigorously validated? This function exists for edge cases — any user-controlled input here is a direct SQL injection vector.
- Are Prisma's type-safe query methods used wherever possible instead of raw SQL?

## Cross-Site Scripting (XSS)

- Is `dangerouslySetInnerHTML` used anywhere in the Next.js app? If so, is the content sanitized (using DOMPurify or similar)?
- Are user-generated content fields properly escaped before rendering?
- Is a Content Security Policy (CSP) header configured? A good CSP blocks inline scripts and restricts resource origins, which is the strongest XSS defense.
- Are CSP nonces used for inline scripts that must remain?

## Cross-Site Request Forgery (CSRF)

- For cookie-based auth: Is CSRF protection implemented?
  - SameSite cookie attribute set to `Strict` or `Lax`
  - CSRF tokens for state-changing operations
- For token-based auth (Bearer tokens): CSRF is less of a concern, but verify tokens are sent via headers, not cookies.

## HTTP Security Headers

- **Helmet**: Is Helmet middleware configured in NestJS? It sets critical headers:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY` or `SAMEORIGIN`
  - `Strict-Transport-Security` (HSTS)
  - `X-XSS-Protection`
- **Next.js security headers**: Are security headers configured in `next.config.js` via the `headers()` function?
- **Referrer-Policy**: Set to `strict-origin-when-cross-origin` or stricter
- **Permissions-Policy**: Restricts browser features (camera, microphone, geolocation) the app can use

## CORS

- Is CORS configured with specific allowed origins (not `*` in production)?
- Are allowed methods restricted to only what's needed?
- Is `credentials: true` set only when cookies/auth headers need to cross origins?
- Are different CORS configs used for development vs production?

## Rate Limiting

- Is the NestJS `ThrottlerModule` (or equivalent) configured?
- Are auth endpoints (login, register, password reset, forgot-password) rate-limited more aggressively than general endpoints?
- Are file upload endpoints rate-limited?
- Is rate limiting applied globally with per-route overrides where needed?

## Secrets Management

- Are secrets (API keys, database URLs, JWT secrets) stored in environment variables — never in code?
- Is `.env` in `.gitignore`?
- Is there an `.env.example` with placeholder values (not real secrets)?
- Are secrets different across environments (dev/staging/prod)?
- For AWS: Are secrets stored in Secrets Manager or Parameter Store — not baked into Docker images or CI/CD config files?
- Is there a secret rotation strategy for database credentials and API keys?

## Dependency Security

- Are dependencies up to date? Run `npm audit` and check for known vulnerabilities.
- Are there dependencies with critical/high severity CVEs?
- Is there a lockfile (package-lock.json or pnpm-lock.yaml) committed to ensure deterministic installs?
- Are dev dependencies correctly separated from production dependencies?

## Next.js Specific Security (2025)

- **CVE-2025-29927**: Is the Next.js version 14.2.25+ or 15.2.3+? Earlier versions have a middleware authorization bypass vulnerability.
- **Server Actions**: Are Server Actions validating authorization before executing? A Server Action that mutates data without checking the user's session is an open endpoint.
- **Environment variable leakage**: Are any sensitive variables prefixed with `NEXT_PUBLIC_`? Only truly public values should use this prefix — anything else is exposed to the browser.
