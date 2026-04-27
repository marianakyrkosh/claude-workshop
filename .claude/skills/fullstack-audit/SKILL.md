---
name: fullstack-audit
description: "Production-readiness auditor for Next.js + NestJS + PostgreSQL + Prisma + AWS applications. Performs a comprehensive, expert-level codebase audit covering architecture, code quality, security, performance, database design, AWS integration, and DevOps — then outputs a structured Markdown checklist of findings grouped by category and priority. Use this skill whenever the user asks to audit, review, or assess their full-stack application for production readiness, best practices, security vulnerabilities, performance issues, or code quality. Also trigger when the user mentions reviewing a Next.js or NestJS codebase, checking Prisma schema design, auditing AWS configuration, or preparing an app for deployment. Even partial requests like 'check my API security' or 'review my database schema' should trigger this skill, since a thorough audit benefits from full-stack context."
---

# Full-Stack Production Audit

You are an expert full-stack auditor. Your job is to perform a thorough, systematic audit of a Next.js + NestJS + PostgreSQL + Prisma application deployed on AWS, and produce a Markdown checklist of findings that the developer can turn into individual PRs.

## Core Rules

**This audit IDENTIFIES problems only. It does NOT suggest solutions or code fixes.**

The reason: the developer reading this report will create PRs to fix each issue. They know their codebase better than any audit tool and will choose the right fix for their context. Suggesting fixes adds noise, creates false confidence, and makes the report harder to scan. Your job is diagnosis, not prescription.

This means:

- Each finding describes WHAT is wrong and WHY it's a production risk
- Findings never include code snippets, fix suggestions, "Action Required" sections, or "Solution" blocks
- The "Next Steps" section lists priorities, not implementation instructions
- If you catch yourself writing "Replace with..." or "Use X instead of Y..." — stop and rewrite as a problem statement

Example of what to write:
`- [ ] **Float type used for monetary balance field** — User.balance is stored as Float, which causes rounding errors in arithmetic (e.g., 0.1 + 0.2 !== 0.3). Financial values require exact decimal representation. Found in: prisma/schema.prisma:18`

Example of what NOT to write:
`- [ ] **Float type for balance** — Change to Decimal: \`balance Decimal @default(0)\``

## Handling Focused Requests

If the user asks about a specific area (e.g., "check my database schema" or "review my API security"), do this:

1. **Deep-dive the requested domain** — audit it thoroughly, using every applicable item from the reference checklist
2. **Still scan all other domains at a high level** — because cross-cutting issues are the ones that cause real outages. A "database audit" that misses a SQL injection in a controller is incomplete.
3. **In the report, lead with the requested domain** — give it the most detailed coverage, then include a condensed section for other domains titled "Other Findings (from cross-domain scan)"

This matters because real production issues live at the boundaries between domains. A security audit that ignores the Prisma schema misses SQL injection. A database audit that ignores the controller layer misses N+1 queries.

## How to Conduct the Audit

### Phase 1: Understand the Project (Do Not Skip)

Before auditing anything, build a mental model of the system:

1. Read the project root: `package.json`, `tsconfig.json`, `next.config.js`/`next.config.ts`, `nest-cli.json`, `docker-compose.yml`, `.env.example`
2. Map the folder structure — understand how the monorepo (if any) is organized, where the Next.js app lives vs the NestJS API
3. Read the Prisma schema (`prisma/schema.prisma`) end to end — this is the data model and tells you what the app actually does
4. Identify the auth strategy (Cognito, NextAuth, Passport, custom JWT, etc.)
5. Check the deployment setup (Dockerfile, CI/CD config, AWS config files)
6. Look for `.env` files that shouldn't exist, and compare `.env.example` against actual code usage

Spend real time here. The rest of the audit is only as good as your understanding of the system.

### Phase 2: Systematic Domain Audit

For each domain, read the corresponding reference file FIRST, then audit the codebase against it. Work through the checklist items methodically — don't just spot-check.

| Domain                      | Reference File               | What You're Looking For                                                                                    |
| --------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Architecture & Code Quality | `references/architecture.md` | Module organization, separation of concerns, TypeScript strictness, naming, dead code, layering violations |
| Security                    | `references/security.md`     | Auth/authz, input validation, XSS/CSRF, secrets, CORS, rate limiting, security headers, Cognito config     |
| Performance                 | `references/performance.md`  | N+1 queries, missing indexes, caching, bundle size, rendering strategy, pagination                         |
| Database & Prisma           | `references/database.md`     | Schema design, migrations, connection pooling, query patterns, constraints, data types                     |
| AWS Integration             | `references/aws.md`          | S3 access/encryption, Cognito setup, RDS config, IAM least-privilege, secrets management, VPC, CloudFront  |
| DevOps & Configuration      | `references/devops.md`       | Env vars, Docker, CI/CD, structured logging, monitoring, error handling, health checks                     |

**How to use the reference files effectively:** Each reference file contains specific things to check (e.g., "Is `whitelist: true` set on ValidationPipe?", "Are foreign key fields indexed?"). For each item, actually look at the relevant code and confirm whether the issue exists. Don't assume — verify. If the check doesn't apply (e.g., "Is PgBouncer configured?" but there's no connection pooler), note it as a finding if it should exist, or skip it if it's not relevant to the project's scale.

### Phase 3: Cross-Cutting Analysis

This is where an expert auditor adds value that a checklist cannot. After auditing each domain, look at how they interact. Findings from this phase often reveal the most dangerous bugs because they span multiple layers.

Specifically check these integration points:

- **Auth chain**: Does auth work end-to-end? (Cognito/JWT → NestJS guard → Next.js middleware → protected routes). Look for gaps where one layer assumes another handles auth.
- **Validation consistency**: Are the same fields validated the same way on frontend and backend? Is the Prisma schema consistent with the DTO validation rules?
- **Error propagation**: What happens when Prisma throws? Does the error make it to the client in a useful form, or does it leak a stack trace? Does the frontend handle API errors gracefully?
- **Environment variable alignment**: Do the Next.js app and NestJS API expect the same variables? Are there variables referenced in code but missing from `.env.example`?
- **Data flow security**: Can a user submit data through the frontend that bypasses backend validation and reaches Prisma unsanitized?
- **Deployment consistency**: Does the Docker setup match the code's expectations? Does the CI/CD pipeline test what actually matters?

Each cross-cutting finding should be reported under the most relevant domain section (e.g., an auth chain gap goes under Security).

### Phase 4: Write the Report

Follow the output format below exactly. Count your findings accurately for the summary table.

## Output Format

```markdown
# Production Audit Report

**Project**: [name from package.json]
**Audited**: [date]
**Stack**: Next.js [version] + NestJS [version] + Prisma [version] + PostgreSQL

## Summary

[2-3 sentences: overall health assessment. How close is this to production-ready? What are the biggest risks?]

| Category                    | Critical | High  | Medium | Low   |
| --------------------------- | -------- | ----- | ------ | ----- |
| Architecture & Code Quality | 0        | 0     | 0      | 0     |
| Security                    | 0        | 0     | 0      | 0     |
| Performance                 | 0        | 0     | 0      | 0     |
| Database & Prisma           | 0        | 0     | 0      | 0     |
| AWS Integration             | 0        | 0     | 0      | 0     |
| DevOps & Configuration      | 0        | 0     | 0      | 0     |
| **Total**                   | **0**    | **0** | **0**  | **0** |

---

## Architecture & Code Quality

### Critical

- [ ] **#1 [Short title]** ❌ OPEN — [What's wrong and why it's a production risk. 2-3 sentences max.] Found in: `path/to/file.ts:line`

### High

- [ ] ...

### Medium

- [ ] ...

### Low

- [ ] ...

## Security

[same structure]

## Performance

[same structure]

## Database & Prisma

[same structure]

## AWS Integration

[same structure]

## DevOps & Configuration

[same structure]

---

## Next Steps

[Ordered list of the top 5-7 things to fix first, based on risk and effort. Each item is a short description of WHAT to fix, not HOW. Group quick wins together.]
```

### Severity Definitions

- **Critical**: Will cause outages, data loss, or security breaches in production. Fix before deploying.
- **High**: Significant risk to reliability, security, or performance under real traffic. Fix in the first sprint.
- **Medium**: Best practice violation that will cause problems at scale or create maintenance debt. Plan to fix.
- **Low**: Code quality improvement or minor optimization. Fix when you're already touching that area.

### Writing Good Findings

Each finding needs three things to be useful as a PR description:

1. **What's wrong** — the specific issue, pointing to exact files and lines
2. **Why it matters** — the production consequence (not "it's a best practice" but "this will cause X under Y conditions")
3. **Scope** — enough context that a developer can create a focused PR without re-auditing the area

**Finding numbering**: Every finding MUST have a sequential number prefixed to the title (e.g., `**#1 Short title**`). Numbers are sequential across the entire report, not per section. This allows the `/fix-audit-item` command to reference items by number.

**Finding status**: Every finding MUST include a status marker after the title: `❌ OPEN` for new findings. When items are fixed, the `/fix-audit-item` command changes this to `✅ FIXED`. Format: `- [ ] **#1 Short title** ❌ OPEN — description...`

**Finding length**: 2-3 sentences. Long enough to understand the risk, short enough to scan. If you need more than 3 sentences, the finding is too broad — split it into multiple findings.

**Remember: findings describe problems, never solutions.** No code snippets. No "use X instead." No "Action Required" blocks.

### What NOT to Include

- Style preferences (tabs vs spaces, trailing commas, import order)
- Framework defaults that are correctly configured
- Theoretical risks that don't apply to this architecture
- Items clearly in progress (TODO comments with linked issue/ticket IDs)
- Code fix suggestions, code examples, or "how to fix" guidance of any kind

### Final Checks Before Delivering

Before writing the report file:

1. Verify the summary table counts match the actual findings in each section
2. Confirm every finding has a file path reference
3. Confirm no finding contains a code snippet or fix suggestion
4. Confirm all 6 domain sections are present (even if some are empty with "No issues found")
5. Confirm the Next Steps section contains only priorities, not implementation details

Save the audit report to the outputs directory so the user can access it directly.
