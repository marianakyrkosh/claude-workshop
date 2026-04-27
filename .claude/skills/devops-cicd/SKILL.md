---
description: 'Production-grade DevOps and CI/CD for Next.js + NestJS + Prisma on AWS (CDK, ECS Fargate, GitHub Actions, monitoring, security)'
---

# DevOps & CI/CD — Event Platform on AWS

You are a senior DevOps/platform engineer setting up production infrastructure for a commercial event platform (think app.getriver.io). The stack is a Turborepo monorepo with Next.js frontend, NestJS API, PostgreSQL via Prisma, AWS Cognito auth, and Tailwind/Radix UI.

## Architecture Overview

The infrastructure follows an ultra-lean philosophy: production-grade security and reliability for under $50/month. The three biggest AWS cost traps at startup scale are NAT Gateways ($32/mo each), ALBs ($16/mo each), and running multiple environments 24/7. This architecture eliminates the first, shares the second, and makes non-prod environments ephemeral.

### AWS Services Map

| Layer          | Service                                                    | Purpose                                              |
| -------------- | ---------------------------------------------------------- | ---------------------------------------------------- |
| Networking     | VPC, 2 AZs, **no NAT GW** (public subnets)                 | Fargate tasks get public IPs, SGs restrict inbound   |
| Compute        | ECS Fargate Spot (prod included, 2 tasks for availability) | Container orchestration, ~70% cheaper than on-demand |
| Database       | RDS PostgreSQL t4g.micro (single instance)                 | Persistent storage                                   |
| Cache          | ElastiCache Redis (optional, add when needed)              | Session/cache layer                                  |
| CDN/Static     | S3 + CloudFront                                            | Static assets, user uploads                          |
| DNS            | Route 53                                                   | Domain management                                    |
| Load Balancing | ALB (1 shared, prod only)                                  | HTTPS termination, path-based routing                |
| Auth           | Cognito (pre-existing)                                     | User authentication                                  |
| Registry       | ECR                                                        | Docker image storage                                 |
| Certificates   | ACM                                                        | Free SSL/TLS                                         |
| Secrets        | SSM Parameter Store + Secrets Manager                      | Config and secrets                                   |
| Monitoring     | CloudWatch (basic) + Sentry (free tier)                    | Logs, metrics, error tracking                        |
| IaC            | AWS CDK (TypeScript)                                       | Infrastructure definition                            |
| CI/CD          | GitHub Actions                                             | Build, test, deploy pipelines                        |

### Monthly Cost Breakdown (~$43/mo)

| Service                                    | Monthly Cost    |
| ------------------------------------------ | --------------- |
| ALB (1 instance, prod)                     | $16             |
| RDS t4g.micro (1 instance, prod)           | $13             |
| ECS Fargate Spot × 2 tasks (256/512, prod) | ~$6             |
| S3 + CloudFront                            | ~$3             |
| CloudWatch (basic metrics + logs)          | ~$3             |
| ECR                                        | ~$1             |
| Route 53                                   | ~$0.50          |
| NAT Gateway                                | $0 (eliminated) |
| **Total**                                  | **~$43**        |

### Environment Strategy

| Environment | Where It Runs                                                       | Cost       | Purpose                |
| ----------- | ------------------------------------------------------------------- | ---------- | ---------------------- |
| dev         | **Local** — docker-compose on developer machines                    | $0         | Daily development      |
| staging     | **Ephemeral on AWS** — spun up by CI for E2E tests, torn down after | ~$2/mo     | Pre-release validation |
| production  | **Always-on AWS** — Fargate Spot with 2 tasks                       | ~$43/mo    | Live traffic           |
| dr          | **Manual** — RDS snapshot restore + redeploy to another region      | $0 standby | Disaster recovery      |

The key insight: dev and staging don't need 24/7 AWS infrastructure. Dev uses docker-compose (identical containers, local PostgreSQL). Staging is deployed on-demand during CI — the GitHub Actions pipeline creates the environment, runs Playwright E2E tests, and tears it down. You only pay for the minutes staging actually runs.

## How to Use This Skill

When the user asks you to work on infrastructure, follow this sequence:

### 1. Understand What Exists

Before writing any CDK or pipeline code, check the repo:

```
Look for:
- infra/ or cdk/ directory (existing CDK project)
- .github/workflows/ (existing pipelines)
- Dockerfile or docker-compose.yml
- turbo.json (monorepo config)
- apps/web/ and apps/api/ (app locations in monorepo)
```

If CDK is not yet initialized, set it up:

```bash
mkdir -p infra && cd infra
npx cdk init app --language typescript
```

### 2. Read the Relevant Reference File

Each major domain has a dedicated reference file with detailed patterns, code examples, and configuration. Read the one you need BEFORE writing code:

| Task                                                                                            | Reference File                              | What's Inside                                                                                                                                  |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| VPC, ECS, RDS, S3, CloudFront, ALB, Route 53, ECR, docker-compose                               | `.claude/references/cdk-architecture.md`    | CDK stack structure, construct patterns, networking (no NAT), compute, database, CDN, docker-compose for local dev, and all core AWS resources |
| GitHub Actions workflows, build/test/deploy pipelines, ephemeral staging, environment promotion | `.claude/references/github-actions.md`      | Complete workflow files, ephemeral staging E2E, caching strategies, Turborepo integration, deploy scripts, rollback                            |
| CloudWatch, Sentry, alerting, secrets management, IAM policies, security headers, WAF           | `.claude/references/monitoring-security.md` | Monitoring alarms, Sentry setup for both Next.js and NestJS, secrets rotation, least-privilege IAM, OWASP headers                              |
| No-NAT pattern, Fargate Spot, ephemeral staging, ARM tasks, cost alarms, growth triggers        | `.claude/references/cost-optimization.md`   | Complete cost breakdown (~$43/mo), where savings come from, when to upgrade                                                                    |

### 3. Write Code Following These Principles

**CDK project structure** — organize stacks by lifecycle, not by AWS service:

```
infra/
├── bin/
│   └── app.ts                  # Entry point, instantiates stacks per environment
├── lib/
│   ├── stacks/
│   │   ├── network-stack.ts    # VPC, public subnets (no NAT), security groups
│   │   ├── data-stack.ts       # RDS, S3 buckets, ElastiCache
│   │   ├── compute-stack.ts    # ECS cluster, services, ALB, auto-scaling
│   │   ├── cdn-stack.ts        # CloudFront, Route 53 records
│   │   ├── monitoring-stack.ts # CloudWatch dashboards, alarms, SNS
│   │   └── ci-stack.ts         # ECR repos, IAM deploy roles for GitHub OIDC
│   ├── constructs/             # Reusable L3 constructs
│   │   ├── fargate-service.ts  # Standardized ECS Fargate service
│   │   └── rds-instance.ts     # Standardized RDS with env-aware config
│   └── config/
│       └── environments.ts     # Per-environment settings (instance sizes, scaling, etc.)
├── test/                       # CDK snapshot + assertion tests
└── cdk.json
```

**Why this structure matters:** Stacks grouped by lifecycle mean you can deploy networking changes without touching compute, or update monitoring without redeploying the database. This reduces blast radius and speeds up deployments.

**Environment configuration pattern:**

```typescript
// lib/config/environments.ts
export interface EnvironmentConfig {
  envName: string
  account: string
  region: string
  domain: string
  rds: { instanceClass: string; multiAz: boolean; backupRetention: number }
  ecs: {
    cpu: number
    memory: number
    desiredCount: number
    spot: boolean
    minCapacity: number
    maxCapacity: number
    assignPublicIp: boolean
  }
  monitoring: { alarmEmail: string; detailedMetrics: boolean }
  ephemeral: boolean // true = torn down after use (staging)
}

export const environments: Record<string, EnvironmentConfig> = {
  staging: {
    envName: 'staging',
    account: process.env.CDK_DEFAULT_ACCOUNT!,
    region: 'eu-central-1',
    domain: 'staging.yourdomain.com',
    rds: { instanceClass: 'db.t4g.micro', multiAz: false, backupRetention: 1 },
    ecs: { cpu: 256, memory: 512, desiredCount: 1, spot: true, minCapacity: 1, maxCapacity: 1, assignPublicIp: true },
    monitoring: { alarmEmail: 'dev@yourdomain.com', detailedMetrics: false },
    ephemeral: true,
  },
  production: {
    envName: 'production',
    account: process.env.CDK_DEFAULT_ACCOUNT!,
    region: 'eu-central-1',
    domain: 'yourdomain.com',
    rds: { instanceClass: 'db.t4g.micro', multiAz: false, backupRetention: 7 },
    ecs: { cpu: 256, memory: 512, desiredCount: 2, spot: true, minCapacity: 2, maxCapacity: 6, assignPublicIp: true },
    monitoring: { alarmEmail: 'ops@yourdomain.com', detailedMetrics: false },
    ephemeral: false,
  },
}
```

**Why Fargate Spot in production:** With 2 tasks running, if AWS reclaims one (happens ~5% of the time), the other task handles traffic while ECS schedules a replacement within seconds. At startup traffic levels, this is a safe bet that saves ~70% on compute. Upgrade to on-demand when your traffic can't tolerate even brief single-task periods.

### 4. Dockerfiles

Create multi-stage Dockerfiles optimized for Turborepo. The key insight: use Turborepo's `prune` command to create a minimal Docker context containing only the packages each app needs, which dramatically reduces image size and build time.

**Frontend (apps/web/Dockerfile):**

```dockerfile
# Stage 1: Prune monorepo to only what web needs
FROM node:20-alpine AS pruner
WORKDIR /app
RUN npm i -g turbo
COPY . .
RUN turbo prune web --docker

# Stage 2: Install dependencies
FROM node:20-alpine AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./
RUN npm ci --production=false

# Stage 3: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=installer /app/ .
COPY --from=pruner /app/out/full/ .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npx turbo build --filter=web

# Stage 4: Run
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public
USER nextjs
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
```

**API (apps/api/Dockerfile):** same prune pattern, but the final stage runs `node dist/main.js` for NestJS.

### 5. Deployment Flow

The deployment pipeline follows this promotion model:

```
PR opened → lint + typecheck + unit tests (vitest) → build check
     ↓
Merge to staging → deploy ephemeral staging → run Playwright E2E → tear down staging → Slack notify
     ↓
Merge to main (or release tag) → deploy to production (rolling update) → smoke test → Slack notify
     ↓
Rollback → previous task definition (automated on health check failure)
```

Dev runs locally with `docker-compose up` — no AWS deployment for dev.

See `.claude/references/github-actions.md` for the complete workflow files.

### 6. Database Migrations

Prisma migrations run as a one-off ECS task BEFORE the new application containers roll out. This is critical — never bake migrations into the application startup, because multiple containers starting simultaneously would race on migrations.

```bash
# In the deploy script / GitHub Action:
aws ecs run-task \
  --cluster $CLUSTER \
  --task-definition $MIGRATION_TASK_DEF \
  --launch-type FARGATE \
  --network-configuration "..." \
  --overrides '{"containerOverrides":[{"name":"migrate","command":["npx","prisma","migrate","deploy"]}]}'

# Wait for task to complete successfully before updating the ECS service
aws ecs wait tasks-stopped --cluster $CLUSTER --tasks $TASK_ARN
```

## Key Decisions and Why

| Decision                                                | Why                                                                                                                                                                                                                                                  |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **No NAT Gateway** — Fargate in public subnets          | Saves $32/mo per environment. Tasks get public IPs but security groups restrict all inbound to ALB only. Outbound (ECR pulls, external API calls) works via public internet. This is safe — the security group is the firewall, not the subnet type. |
| **Fargate Spot for production**                         | Saves ~70% on compute. With 2+ tasks, one being reclaimed is survivable — the other handles traffic while ECS reschedules. At startup traffic, this is a safe bet.                                                                                   |
| **Ephemeral staging**                                   | Staging runs only during CI (~10 min per E2E run). At maybe 10 deploys/week, that's ~100 minutes/month instead of 730 hours. Saves the entire cost of a second always-on environment.                                                                |
| **Dev runs locally** (docker-compose)                   | Eliminates an entire AWS environment (~$40/mo). The containers are identical to production. Local PostgreSQL via docker-compose mirrors RDS.                                                                                                         |
| **Single ALB, single RDS**                              | One ALB ($16/mo) and one RDS t4g.micro ($13/mo) for production. No duplicates for non-prod environments.                                                                                                                                             |
| SSM Parameter Store over Secrets Manager where possible | Free for standard parameters vs $0.40/secret/month. Use Secrets Manager only for RDS credentials (automatic rotation).                                                                                                                               |
| GitHub Actions over CodePipeline                        | Code is on GitHub. GitHub Actions is simpler, caches better with Turborepo, and avoids CodePipeline per-pipeline cost. OIDC federation — no long-lived credentials.                                                                                  |
| Rolling updates over blue/green                         | Simpler, sufficient for a lean setup. Add blue/green later when traffic justifies it.                                                                                                                                                                |
| CloudFront in front of ALB                              | Adds caching + security headers + WAF capability. Price Class 100 (US + Europe) keeps costs minimal.                                                                                                                                                 |
| **No Container Insights, no detailed CloudWatch**       | Saves ~$10/mo. Basic ECS metrics + Sentry free tier is enough for a startup. Add detailed metrics when debugging requires it.                                                                                                                        |

## Checklist for Production Readiness

Before going live, verify all items in this checklist. Read `.claude/references/monitoring-security.md` for implementation details on each:

- [ ] HTTPS everywhere (ACM cert, ALB HTTPS listener, HTTP→HTTPS redirect)
- [ ] Security headers (HSTS, CSP, X-Frame-Options) via CloudFront response headers policy
- [ ] WAF basic rule set on CloudFront (AWS Managed Rules — free tier covers common threats)
- [ ] RDS encryption at rest enabled
- [ ] S3 buckets: block public access, encryption, versioning on upload bucket
- [ ] ECS task roles follow least-privilege (separate roles for web vs API)
- [ ] Secrets in SSM/Secrets Manager — zero secrets in environment variables, code, or GitHub
- [ ] GitHub OIDC federation — no AWS access keys stored in GitHub Secrets
- [ ] CloudWatch alarms: ECS CPU/memory, RDS connections/storage, ALB 5xx rate
- [ ] Sentry configured for both Next.js (client + server) and NestJS
- [ ] Automated RDS backups with tested restore procedure
- [ ] Health check endpoints on both services (`/health` returning 200 + dependency status)
- [ ] Container image scanning enabled in ECR
- [ ] Log retention policies set (7 days staging, 30 days prod — increase to 90 when needed)
- [ ] Cost alarm in AWS Budgets (alert at 80% of monthly target)
