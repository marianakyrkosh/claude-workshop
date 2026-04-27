# DevOps & Configuration Checklist

## Environment Variables

### Organization

- Is there a `.env.example` committed to the repo with all required variables and placeholder values?
- Is `.env` (and all `.env.*` files except `.env.example`) in `.gitignore`?
- Are environment variables validated at startup? The app should fail fast with a clear error if a required variable is missing — not crash 10 minutes later when the missing DB URL is first used. Use a schema validator (Zod, Joi, class-validator) for this.
- Are variables organized with a clear naming convention? (e.g., `DB_HOST`, `DB_PORT` vs `DATABASE_URL` — pick one pattern)

### Security

- Are any secrets committed to the repo? Search the git history for patterns like passwords, tokens, and connection strings. Use tools like `git-secrets` or `truffleHog`.
- Are `NEXT_PUBLIC_*` variables reviewed? Only truly public values should use this prefix. A common mistake is `NEXT_PUBLIC_API_KEY` for a server-side API key.
- Are different values used across environments (dev/staging/prod)? Shared database credentials between environments is a risk.

### Consistency

- Are environment variables consistent between Next.js and NestJS? If both services need the same Cognito config or API URL, are they sourced from the same place (or at least documented together)?
- Are there environment variables referenced in code that don't appear in `.env.example`? This causes "works on my machine" issues for new developers.

## Docker

### Dockerfile Quality

- Is a multi-stage build used? Stage 1 installs dependencies and builds; Stage 2 copies only the built output. This reduces image size (often by 50-80%) and removes build tools from the production image.
- Is the base image pinned to a specific version (e.g., `node:20.11-alpine`, not `node:latest`)? Unpinned images break builds when upstream updates happen.
- Is `.dockerignore` configured to exclude `node_modules`, `.git`, `.env`, and other unnecessary files?
- Is the build user non-root? Running as root in a container is a security risk. Add `USER node` or create a dedicated user.
- Are `npm ci` (not `npm install`) used in the build? `npm ci` uses the lockfile for deterministic installs.
- Is `COPY package*.json ./` done before `COPY . .`? This leverages Docker layer caching — dependencies only reinstall when `package.json` changes.

### Docker Compose (Development)

- Is `docker-compose.yml` configured for local development with the database, cache, and other services?
- Are volumes mounted for hot-reload during development?
- Are health checks configured for dependent services (database, Redis)?

### Production

- Are container health checks defined?
- Is the container restarted automatically on failure?
- Are resource limits (CPU, memory) configured to prevent runaway containers?

## CI/CD

### Pipeline Structure

- Does the pipeline include: lint → type-check → unit tests → build → integration tests → deploy?
- Are builds reproducible? Same commit should produce the same artifact.
- Is there a staging environment that mirrors production?

### Testing in CI

- Are tests actually running in CI? Check if the test step is present and not skipped.
- Is there a minimum test coverage threshold enforced?
- Are E2E tests running against a real database (not mocked)?

### Deployment

- Is the deployment process automated (not manual SSH + git pull)?
- Is there a rollback mechanism? Blue-green deployments or canary releases?
- Are database migrations run as a separate step before deploying the new application version?
- Is there a smoke test after deployment to verify the app is healthy?

### Security in CI

- Are secrets stored in CI/CD secret management (not in pipeline config files)?
- Are dependency vulnerability scans (`npm audit`, Snyk, Dependabot) running in CI?
- Is the Docker image scanned for vulnerabilities before deployment?

## Logging

### Structured Logging

- Is a structured logging library used (Winston, Pino, NestJS Logger) instead of `console.log`?
- Are logs in JSON format for machine parsing?
- Do logs include: timestamp, log level, request ID (for tracing), service name, and relevant context?
- Are sensitive fields (passwords, tokens, PII) excluded from logs?

### Log Levels

- Are log levels used appropriately?
  - `ERROR`: Something failed and needs attention
  - `WARN`: Something unexpected but handled
  - `INFO`: Significant business events (user registered, order placed)
  - `DEBUG`: Detailed diagnostic information (disabled in production)
- Is the log level configurable via environment variable?

### Centralized Logging

- Are logs shipped to a centralized service (CloudWatch Logs, ELK, Datadog)?
- Are log retention policies configured (don't keep debug logs forever)?
- Can you trace a request across services using a correlation/request ID?

## Monitoring & Observability

### Health Checks

- Does the NestJS app have a health check endpoint (`/health` or `/api/health`)?
- Does the health check verify dependencies (database connection, Redis, external APIs)?
- Is the health check used by the load balancer and container orchestrator?

### Metrics

- Are application metrics collected (request rate, error rate, response time percentiles)?
- Are business metrics tracked (sign-ups, orders, key user actions)?
- Are CloudWatch alarms configured for critical thresholds (error rate > 5%, CPU > 80%, DB connections near max)?

### Distributed Tracing

- Is AWS X-Ray or an equivalent tracing tool configured?
- Can you trace a request from the Next.js frontend through the NestJS API to the database?
- Are slow operations identifiable in traces?

## Error Handling

### NestJS Error Handling

- Is there a global exception filter that catches unhandled errors and returns consistent error responses?
- Are Prisma errors mapped to appropriate HTTP status codes (P2002 → 409, P2025 → 404)?
- Do error responses follow a consistent format (e.g., `{ statusCode, message, error }`)?
- Are errors logged with enough context to debug (request body, user ID, stack trace)?
- Are internal error details hidden from API responses in production?

### Next.js Error Handling

- Is there an `error.tsx` at the app root and in key route groups?
- Is there a `global-error.tsx` for root layout errors?
- Are error boundaries granular enough that a failing component doesn't take down the entire page?
- Is `not-found.tsx` implemented for custom 404 pages?

### Resilience

- Are external service calls (AWS SDK, third-party APIs) wrapped with timeouts and retries?
- Is there graceful degradation when non-critical services are down?
- Is there a circuit breaker pattern for frequently failing external services?
- Does the application handle database connection failures gracefully (retry, queue, or fail fast)?
