# Workshop Starter Project Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert claude-workshop from a standalone Next.js app into a Turborepo monorepo with web (Next.js 16), API (NestJS), and mobile (Flutter) apps, including one Items/Notes CRUD example feature and all Claude skills from kroogom.

**Architecture:** Turborepo monorepo with 3 apps (web, api, mobile) and 4 shared packages (types, ui, eslint-config, typescript-config). Local PostgreSQL via Docker Compose. No auth, no AWS. Items CRUD as reference pattern across all layers.

**Tech Stack:** Next.js 16, NestJS (latest), Flutter (latest stable), Prisma, PostgreSQL 16, Tailwind CSS 4, shadcn/ui, React Query, Riverpod, GoRouter, Dio, Freezed, Turborepo, Vitest, Playwright, Jest

**Spec:** `docs/superpowers/specs/2026-04-26-workshop-starter-design.md`

**Source patterns:** `<path-to-kroogom>` (kroogom monorepo — clone separately for reference)

---

## Phase 1: Root Monorepo Setup

### Task 1: Restructure root into Turborepo workspace

**Files:**
- Modify: `package.json`
- Create: `turbo.json`
- Modify: `.prettierrc.json` → rename to `.prettierrc`
- Modify: `.gitignore`
- Create: `.nvmrc`
- Create: `docker-compose.yml`
- Delete: `app/`, `public/`, `next.config.ts`, `postcss.config.mjs`, `tsconfig.json`, `eslint.config.mjs`, `AGENTS.md`, `CLAUDE.md`, `README.md`, `.vscode/`

The existing Next.js app will be rebuilt inside `apps/web/` from scratch, so we remove the root-level Next.js files.

- [ ] **Step 1: Remove existing Next.js app files from root**

```bash
rm -rf app/ public/ .vscode/
rm -f next.config.ts postcss.config.mjs tsconfig.json eslint.config.mjs AGENTS.md CLAUDE.md README.md
rm -f package-lock.json
```

- [ ] **Step 2: Rewrite root `package.json` for Turborepo workspaces**

Replace the entire contents of `package.json` with:

```json
{
  "name": "claude-workshop",
  "private": true,
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "format": "prettier --write \"**/*.{ts,tsx,md}\"",
    "prepare": "husky install"
  },
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "engines": {
    "node": ">=22.12.0",
    "npm": ">=10.0.0"
  },
  "packageManager": "npm@10.2.4",
  "devDependencies": {
    "husky": "^9.0.0",
    "prettier": "^3.8.0",
    "turbo": "^2.5.0"
  }
}
```

- [ ] **Step 3: Rename `.prettierrc.json` to `.prettierrc` and update to match kroogom style**

Delete `.prettierrc.json` and create `.prettierrc`:

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 120,
  "tabWidth": 2,
  "useTabs": false,
  "semi": false,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "auto"
}
```

- [ ] **Step 4: Create `turbo.json`**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "lint": {},
    "test": {},
    "dev": {
      "dependsOn": ["^build"],
      "cache": false,
      "persistent": true
    }
  }
}
```

Note: Turborepo v2 uses `tasks` instead of `pipeline`.

- [ ] **Step 5: Create `.nvmrc`**

```
22.12.0
```

- [ ] **Step 6: Create `docker-compose.yml`**

```yaml
services:
  postgres:
    image: postgres:16-alpine
    ports:
      - '5432:5432'
    environment:
      POSTGRES_USER: workshop
      POSTGRES_PASSWORD: workshop
      POSTGRES_DB: workshop
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

- [ ] **Step 7: Update `.gitignore` for monorepo**

Replace entire contents:

```gitignore
# dependencies
node_modules/
.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# builds
.next/
out/
dist/
build/
.turbo/

# testing
coverage/

# env
.env
.env.*
!.env.example

# misc
.DS_Store
*.pem
npm-debug.log*
yarn-debug.log*
.pnpm-debug.log*

# typescript
*.tsbuildinfo
next-env.d.ts

# flutter
apps/mobile/.dart_tool/
apps/mobile/.packages
apps/mobile/build/
apps/mobile/.flutter-plugins
apps/mobile/.flutter-plugins-dependencies
apps/mobile/ios/Pods/
apps/mobile/ios/.symlinks/
apps/mobile/android/.gradle/
apps/mobile/android/local.properties
apps/mobile/lib/core/l10n/generated/

# IDE
.vscode/
.idea/
*.swp
*.swo

# vercel
.vercel
```

- [ ] **Step 8: Create app and package directories**

```bash
mkdir -p apps/api apps/web apps/mobile
mkdir -p packages/types packages/ui packages/eslint-config packages/typescript-config
```

- [ ] **Step 9: Run `npm install` to initialize the workspace**

```bash
npm install
```

Expected: Creates `node_modules/` and `package-lock.json` with workspace structure.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: restructure into Turborepo monorepo workspace"
```

---

## Phase 2: Shared Packages

### Task 2: Create `packages/typescript-config`

**Files:**
- Create: `packages/typescript-config/package.json`
- Create: `packages/typescript-config/base.json`
- Create: `packages/typescript-config/nextjs.json`

- [ ] **Step 1: Create `packages/typescript-config/package.json`**

```json
{
  "name": "@repo/typescript-config",
  "version": "0.0.0",
  "private": true
}
```

- [ ] **Step 2: Create `packages/typescript-config/base.json`**

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "esModuleInterop": true,
    "incremental": false,
    "isolatedModules": true,
    "lib": ["es2022", "DOM", "DOM.Iterable"],
    "module": "NodeNext",
    "moduleDetection": "force",
    "moduleResolution": "NodeNext",
    "noUncheckedIndexedAccess": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "strict": true,
    "target": "ES2022"
  }
}
```

- [ ] **Step 3: Create `packages/typescript-config/nextjs.json`**

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowJs": true,
    "jsx": "preserve",
    "noEmit": true
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add packages/typescript-config/
git commit -m "chore: add shared typescript-config package"
```

### Task 3: Create `packages/eslint-config`

**Files:**
- Create: `packages/eslint-config/package.json`
- Create: `packages/eslint-config/base.js`
- Create: `packages/eslint-config/next.js`
- Create: `packages/eslint-config/react-internal.js`

- [ ] **Step 1: Create `packages/eslint-config/package.json`**

```json
{
  "name": "@repo/eslint-config",
  "version": "0.0.0",
  "type": "module",
  "private": true,
  "exports": {
    "./base": "./base.js",
    "./next-js": "./next.js",
    "./react-internal": "./react-internal.js"
  },
  "devDependencies": {
    "@eslint/js": "^9.27.0",
    "@next/eslint-plugin-next": "^15.3.0",
    "eslint": "^9.27.0",
    "eslint-config-prettier": "^10.1.1",
    "eslint-plugin-only-warn": "^1.1.0",
    "eslint-plugin-react": "^7.37.4",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-turbo": "^2.5.0",
    "globals": "^16.2.0",
    "typescript": "^5.8.2",
    "typescript-eslint": "^8.32.0"
  }
}
```

- [ ] **Step 2: Create `packages/eslint-config/base.js`**

```javascript
import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import turboPlugin from 'eslint-plugin-turbo'
import tseslint from 'typescript-eslint'
import onlyWarn from 'eslint-plugin-only-warn'

/** @type {import("eslint").Linter.Config[]} */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      'turbo/no-undeclared-env-vars': 'warn',
    },
  },
  {
    plugins: {
      onlyWarn,
    },
  },
  {
    ignores: ['dist/**'],
  },
]
```

- [ ] **Step 3: Create `packages/eslint-config/next.js`**

```javascript
import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import tseslint from 'typescript-eslint'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import pluginReact from 'eslint-plugin-react'
import globals from 'globals'
import pluginNext from '@next/eslint-plugin-next'
import { config as baseConfig } from './base.js'

/** @type {import("eslint").Linter.Config[]} */
export const nextJsConfig = [
  ...baseConfig,
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    ...pluginReact.configs.flat.recommended,
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
      },
    },
  },
  {
    plugins: {
      '@next/next': pluginNext,
    },
    rules: {
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs['core-web-vitals'].rules,
    },
  },
  {
    plugins: {
      'react-hooks': pluginReactHooks,
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
    },
  },
]
```

- [ ] **Step 4: Create `packages/eslint-config/react-internal.js`**

```javascript
import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import tseslint from 'typescript-eslint'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import pluginReact from 'eslint-plugin-react'
import globals from 'globals'
import { config as baseConfig } from './base.js'

/** @type {import("eslint").Linter.Config[]} */
export const config = [
  ...baseConfig,
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
  },
  {
    plugins: {
      'react-hooks': pluginReactHooks,
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
    },
  },
]
```

- [ ] **Step 5: Commit**

```bash
git add packages/eslint-config/
git commit -m "chore: add shared eslint-config package"
```

### Task 4: Create `packages/types`

**Files:**
- Create: `packages/types/package.json`
- Create: `packages/types/tsconfig.json`
- Create: `packages/types/src/index.ts`

- [ ] **Step 1: Create `packages/types/package.json`**

```json
{
  "name": "@repo/types",
  "version": "0.0.0",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsc"
  },
  "devDependencies": {
    "@repo/typescript-config": "*",
    "typescript": "^5.8.2"
  }
}
```

- [ ] **Step 2: Create `packages/types/tsconfig.json`**

```json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "dist",
    "declaration": true,
    "declarationMap": true,
    "rootDir": "src"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create `packages/types/src/index.ts`**

This is the starter version — simplified from kroogom's, with just pagination types (no domain enums since we only have Items, and Items doesn't need enums).

```typescript
// Shared types — single source of truth for both apps/api and apps/web
// Add domain enums here as your app grows.

// Pagination — shared response contract between API and frontend

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}
```

- [ ] **Step 4: Build the types package to verify**

```bash
cd packages/types && npx tsc
```

Expected: Creates `dist/index.js` and `dist/index.d.ts` without errors.

- [ ] **Step 5: Commit**

```bash
git add packages/types/
git commit -m "chore: add shared types package with pagination types"
```

### Task 5: Create `packages/ui`

**Files:**
- Create: `packages/ui/package.json`
- Create: `packages/ui/tsconfig.json`
- Create: `packages/ui/src/button.tsx`

- [ ] **Step 1: Create `packages/ui/package.json`**

```json
{
  "name": "@repo/ui",
  "version": "0.0.0",
  "private": true,
  "exports": {
    "./*": "./src/*.tsx"
  },
  "scripts": {
    "lint": "eslint . --max-warnings 0",
    "check-types": "tsc --noEmit"
  },
  "devDependencies": {
    "@repo/eslint-config": "*",
    "@repo/typescript-config": "*",
    "@types/react": "^19.1.0",
    "@types/react-dom": "^19.1.1",
    "eslint": "^9.27.0",
    "typescript": "^5.8.2"
  },
  "dependencies": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  }
}
```

- [ ] **Step 2: Create `packages/ui/tsconfig.json`**

```json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "noEmit": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create placeholder `packages/ui/src/button.tsx`**

```tsx
import * as React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

export function Button({ children, ...props }: ButtonProps) {
  return <button {...props}>{children}</button>
}
```

- [ ] **Step 4: Commit**

```bash
git add packages/ui/
git commit -m "chore: add shared ui package"
```

- [ ] **Step 5: Run `npm install` from root to link workspace packages**

```bash
npm install  # run from repo root
```

- [ ] **Step 6: Commit lockfile**

```bash
git add package-lock.json
git commit -m "chore: update lockfile with workspace packages"
```

---

## Phase 3: API App (NestJS)

### Task 6: Scaffold NestJS API app

**Files:**
- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/tsconfig.build.json`
- Create: `apps/api/nest-cli.json`
- Create: `apps/api/.eslintrc.js`
- Create: `apps/api/.env.example`
- Create: `apps/api/src/main.ts`
- Create: `apps/api/src/app.module.ts`
- Create: `apps/api/src/config/configuration.ts`

- [ ] **Step 1: Create `apps/api/package.json`**

```json
{
  "name": "api",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "dev": "nest start --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,test}/**/*.ts\"",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "db:migrate": "prisma migrate deploy",
    "db:generate": "prisma generate",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@nestjs/common": "^11.0.0",
    "@nestjs/config": "^4.0.0",
    "@nestjs/core": "^11.0.0",
    "@nestjs/platform-express": "^11.0.0",
    "@nestjs/swagger": "^11.0.0",
    "@prisma/client": "^6.0.0",
    "@repo/types": "*",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.2",
    "compression": "^1.8.1",
    "helmet": "^8.1.0",
    "reflect-metadata": "^0.2.0",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^11.0.0",
    "@nestjs/schematics": "^11.0.0",
    "@nestjs/testing": "^11.0.0",
    "@types/compression": "^1.8.1",
    "@types/express": "^5.0.0",
    "@types/jest": "^29.5.2",
    "@types/node": "^22.0.0",
    "@types/supertest": "^6.0.0",
    "eslint": "^9.0.0",
    "jest": "^29.5.0",
    "prettier": "^3.8.0",
    "prisma": "^6.0.0",
    "source-map-support": "^0.5.21",
    "supertest": "^7.0.0",
    "ts-jest": "^29.1.0",
    "ts-loader": "^9.4.3",
    "ts-node": "^10.9.1",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.8.2"
  },
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": ["**/*.(t|j)s"],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
```

- [ ] **Step 2: Create `apps/api/tsconfig.json`**

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "esModuleInterop": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "incremental": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": false
  }
}
```

- [ ] **Step 3: Create `apps/api/tsconfig.build.json`**

```json
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "test", "dist", "**/*spec.ts"]
}
```

- [ ] **Step 4: Create `apps/api/nest-cli.json`**

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}
```

- [ ] **Step 5: Create `apps/api/.eslintrc.js`**

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
}
```

- [ ] **Step 6: Create `apps/api/.env.example`**

```bash
# Database
DATABASE_URL="postgresql://workshop:workshop@localhost:5432/workshop?schema=public"

# Server
PORT=3001
NODE_ENV=development

# CORS (comma-separated origins, empty = allow localhost in dev)
CORS_ORIGINS=
```

- [ ] **Step 7: Create `apps/api/src/config/configuration.ts`**

```typescript
export default () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  cors: {
    origins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim()) : [],
  },
  environment: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV !== 'production',
})
```

- [ ] **Step 8: Create `apps/api/src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import configuration from './config/configuration'
import { PrismaModule } from './prisma/prisma.module'
import { ItemsModule } from './items/items.module'
import { HealthModule } from './health/health.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    PrismaModule,
    ItemsModule,
    HealthModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 9: Create `apps/api/src/main.ts`**

```typescript
import { NestFactory } from '@nestjs/core'
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import helmet from 'helmet'
import compression from 'compression'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'

const logger = new Logger('Bootstrap')

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)

  const isProduction = configService.get('isProduction')

  // CORS
  const allowedOrigins = configService.get('cors.origins') || []
  const corsOrigins = allowedOrigins.length ? allowedOrigins : [/localhost:\d+$/]

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })

  // Security
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
  app.use(compression())

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
      stopAtFirstError: true,
    }),
  )

  // API versioning
  app.setGlobalPrefix('v1')
  app.enableVersioning({ type: VersioningType.URI })

  // Swagger (non-production only)
  if (!isProduction) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Workshop API')
      .setDescription('API documentation for the workshop starter project')
      .setVersion('1.0')
      .addTag('items', 'Item management')
      .addTag('health', 'Health check')
      .build()

    const doc = SwaggerModule.createDocument(app, swaggerConfig)
    SwaggerModule.setup('docs', app, doc)
    logger.log('Swagger documentation available at /docs')
  }

  app.enableShutdownHooks()

  const port = configService.get('port')
  await app.listen(port)
  logger.log(`Workshop API running on port ${port}`)
}

bootstrap()
```

- [ ] **Step 10: Commit**

```bash
git add apps/api/
git commit -m "feat(api): scaffold NestJS app with config, CORS, Swagger"
```

### Task 7: Add Prisma and PrismaModule

**Files:**
- Create: `apps/api/prisma/schema.prisma`
- Create: `apps/api/src/prisma/prisma.module.ts`
- Create: `apps/api/src/prisma/prisma.service.ts`

- [ ] **Step 1: Create `apps/api/prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
}

model Item {
  id          String   @id @default(cuid())
  title       String
  description String?
  createdAt   DateTime @default(now()) @db.Timestamptz
  updatedAt   DateTime @updatedAt @db.Timestamptz
}
```

- [ ] **Step 2: Create `apps/api/src/prisma/prisma.service.ts`**

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
```

- [ ] **Step 3: Create `apps/api/src/prisma/prisma.module.ts`**

```typescript
import { Global, Module } from '@nestjs/common'
import { PrismaService } from './prisma.service'

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

- [ ] **Step 4: Copy `.env.example` to `.env` and generate Prisma client**

```bash
cd apps/api && cp .env.example .env && npx prisma generate
```

Expected: Prisma client generated successfully.

- [ ] **Step 5: Run initial migration (requires docker compose up)**

```bash
docker compose up -d
cd apps/api && npx prisma migrate dev --name init
```

Expected: Migration `init` created and applied. `Item` table exists in the database.

- [ ] **Step 6: Commit**

```bash
git add apps/api/prisma/ apps/api/src/prisma/
git commit -m "feat(api): add Prisma with Item model and PrismaModule"
```

### Task 8: Add shared DTOs (pagination)

**Files:**
- Create: `apps/api/src/common/dto/pagination.dto.ts`
- Create: `apps/api/src/common/dto/paginated-response.dto.ts`

- [ ] **Step 1: Create `apps/api/src/common/dto/pagination.dto.ts`**

```typescript
import { IsOptional, IsInt, Min, Max } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class PaginationDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20
}
```

- [ ] **Step 2: Create `apps/api/src/common/dto/paginated-response.dto.ts`**

```typescript
import type { PaginationMeta, PaginatedResponse } from '@repo/types'
import { PaginationDto } from './pagination.dto'

export type { PaginationMeta, PaginatedResponse }

export async function paginate<T>(
  delegate: { count: (args?: any) => Promise<number>; findMany: (args?: any) => Promise<T[]> },
  args: Record<string, any>,
  pagination: PaginationDto,
): Promise<PaginatedResponse<T>> {
  const { page, limit } = pagination
  const skip = (page - 1) * limit

  const [total, data] = await Promise.all([
    delegate.count({ where: args.where }),
    delegate.findMany({ ...args, skip, take: limit }),
  ])

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/common/
git commit -m "feat(api): add shared pagination DTO and paginate helper"
```

### Task 9: Add Health module

**Files:**
- Create: `apps/api/src/health/health.module.ts`
- Create: `apps/api/src/health/health.controller.ts`

- [ ] **Step 1: Create `apps/api/src/health/health.controller.ts`**

```typescript
import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { PrismaService } from '../prisma/prisma.service'

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    let database = 'disconnected'
    try {
      await this.prisma.$queryRaw`SELECT 1`
      database = 'connected'
    } catch {
      database = 'disconnected'
    }

    return {
      status: database === 'connected' ? 'ok' : 'degraded',
      database,
    }
  }
}
```

- [ ] **Step 2: Create `apps/api/src/health/health.module.ts`**

```typescript
import { Module } from '@nestjs/common'
import { HealthController } from './health.controller'

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
```

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/health/
git commit -m "feat(api): add health check endpoint"
```

### Task 10: Add Items module (CRUD)

**Files:**
- Create: `apps/api/src/items/dto/create-item.dto.ts`
- Create: `apps/api/src/items/dto/update-item.dto.ts`
- Create: `apps/api/src/items/items.service.ts`
- Create: `apps/api/src/items/items.controller.ts`
- Create: `apps/api/src/items/items.module.ts`

- [ ] **Step 1: Create `apps/api/src/items/dto/create-item.dto.ts`**

```typescript
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateItemDto {
  @ApiProperty({ description: 'Item title', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string

  @ApiPropertyOptional({ description: 'Item description', maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string
}
```

- [ ] **Step 2: Create `apps/api/src/items/dto/update-item.dto.ts`**

```typescript
import { PartialType } from '@nestjs/swagger'
import { CreateItemDto } from './create-item.dto'

export class UpdateItemDto extends PartialType(CreateItemDto) {}
```

- [ ] **Step 3: Create `apps/api/src/items/items.service.ts`**

```typescript
import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateItemDto } from './dto/create-item.dto'
import { UpdateItemDto } from './dto/update-item.dto'
import { PaginationDto } from '../common/dto/pagination.dto'
import { paginate } from '../common/dto/paginated-response.dto'

@Injectable()
export class ItemsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateItemDto) {
    return this.prisma.item.create({ data: dto })
  }

  async findAll(pagination: PaginationDto) {
    return paginate(this.prisma.item, { orderBy: { createdAt: 'desc' } }, pagination)
  }

  async findOne(id: string) {
    const item = await this.prisma.item.findUnique({ where: { id } })
    if (!item) {
      throw new NotFoundException(`Item with ID "${id}" not found`)
    }
    return item
  }

  async update(id: string, dto: UpdateItemDto) {
    await this.findOne(id) // throws if not found
    return this.prisma.item.update({ where: { id }, data: dto })
  }

  async remove(id: string) {
    await this.findOne(id) // throws if not found
    return this.prisma.item.delete({ where: { id } })
  }
}
```

- [ ] **Step 4: Create `apps/api/src/items/items.controller.ts`**

```typescript
import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { ItemsService } from './items.service'
import { CreateItemDto } from './dto/create-item.dto'
import { UpdateItemDto } from './dto/update-item.dto'
import { PaginationDto } from '../common/dto/pagination.dto'

@ApiTags('items')
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new item' })
  create(@Body() dto: CreateItemDto) {
    return this.itemsService.create(dto)
  }

  @Get()
  @ApiOperation({ summary: 'List all items (paginated)' })
  findAll(@Query() pagination: PaginationDto) {
    return this.itemsService.findAll(pagination)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get item by ID' })
  findOne(@Param('id') id: string) {
    return this.itemsService.findOne(id)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an item' })
  update(@Param('id') id: string, @Body() dto: UpdateItemDto) {
    return this.itemsService.update(id, dto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an item' })
  remove(@Param('id') id: string) {
    return this.itemsService.remove(id)
  }
}
```

- [ ] **Step 5: Create `apps/api/src/items/items.module.ts`**

```typescript
import { Module } from '@nestjs/common'
import { ItemsController } from './items.controller'
import { ItemsService } from './items.service'

@Module({
  controllers: [ItemsController],
  providers: [ItemsService],
})
export class ItemsModule {}
```

- [ ] **Step 6: Verify the API starts**

```bash
cd apps/api && npm run dev
```

Expected: API starts on port 3001. Visit `http://localhost:3001/docs` to see Swagger UI with Items and Health endpoints.

- [ ] **Step 7: Commit**

```bash
git add apps/api/src/items/
git commit -m "feat(api): add Items CRUD module with DTOs, service, controller"
```

### Task 11: Add API unit tests

**Files:**
- Create: `apps/api/src/items/items.service.spec.ts`
- Create: `apps/api/src/items/items.controller.spec.ts`

- [ ] **Step 1: Create `apps/api/src/items/items.service.spec.ts`**

```typescript
import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { ItemsService } from './items.service'
import { PrismaService } from '../prisma/prisma.service'

const mockItem = {
  id: 'cuid123',
  title: 'Test Item',
  description: 'Test description',
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockPrismaService = {
  item: {
    create: jest.fn().mockResolvedValue(mockItem),
    findMany: jest.fn().mockResolvedValue([mockItem]),
    findUnique: jest.fn().mockResolvedValue(mockItem),
    update: jest.fn().mockResolvedValue(mockItem),
    delete: jest.fn().mockResolvedValue(mockItem),
    count: jest.fn().mockResolvedValue(1),
  },
}

describe('ItemsService', () => {
  let service: ItemsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile()

    service = module.get<ItemsService>(ItemsService)
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should create an item', async () => {
      const dto = { title: 'Test Item', description: 'Test description' }
      const result = await service.create(dto)
      expect(result).toEqual(mockItem)
      expect(mockPrismaService.item.create).toHaveBeenCalledWith({ data: dto })
    })
  })

  describe('findAll', () => {
    it('should return paginated items', async () => {
      const result = await service.findAll({ page: 1, limit: 20 })
      expect(result.data).toEqual([mockItem])
      expect(result.meta.total).toBe(1)
    })
  })

  describe('findOne', () => {
    it('should return an item by id', async () => {
      const result = await service.findOne('cuid123')
      expect(result).toEqual(mockItem)
    })

    it('should throw NotFoundException if item not found', async () => {
      mockPrismaService.item.findUnique.mockResolvedValueOnce(null)
      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException)
    })
  })

  describe('update', () => {
    it('should update an item', async () => {
      const dto = { title: 'Updated' }
      const result = await service.update('cuid123', dto)
      expect(result).toEqual(mockItem)
      expect(mockPrismaService.item.update).toHaveBeenCalledWith({
        where: { id: 'cuid123' },
        data: dto,
      })
    })
  })

  describe('remove', () => {
    it('should delete an item', async () => {
      const result = await service.remove('cuid123')
      expect(result).toEqual(mockItem)
      expect(mockPrismaService.item.delete).toHaveBeenCalledWith({
        where: { id: 'cuid123' },
      })
    })
  })
})
```

- [ ] **Step 2: Create `apps/api/src/items/items.controller.spec.ts`**

```typescript
import { Test, TestingModule } from '@nestjs/testing'
import { ItemsController } from './items.controller'
import { ItemsService } from './items.service'

const mockItem = {
  id: 'cuid123',
  title: 'Test Item',
  description: 'Test description',
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockItemsService = {
  create: jest.fn().mockResolvedValue(mockItem),
  findAll: jest.fn().mockResolvedValue({ data: [mockItem], meta: { total: 1, page: 1, limit: 20, totalPages: 1 } }),
  findOne: jest.fn().mockResolvedValue(mockItem),
  update: jest.fn().mockResolvedValue(mockItem),
  remove: jest.fn().mockResolvedValue(mockItem),
}

describe('ItemsController', () => {
  let controller: ItemsController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemsController],
      providers: [{ provide: ItemsService, useValue: mockItemsService }],
    }).compile()

    controller = module.get<ItemsController>(ItemsController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('should create an item', async () => {
    const dto = { title: 'Test', description: 'Desc' }
    expect(await controller.create(dto)).toEqual(mockItem)
  })

  it('should return paginated items', async () => {
    const result = await controller.findAll({ page: 1, limit: 20 })
    expect(result.data).toEqual([mockItem])
  })

  it('should return a single item', async () => {
    expect(await controller.findOne('cuid123')).toEqual(mockItem)
  })

  it('should update an item', async () => {
    expect(await controller.update('cuid123', { title: 'Updated' })).toEqual(mockItem)
  })

  it('should delete an item', async () => {
    expect(await controller.remove('cuid123')).toEqual(mockItem)
  })
})
```

- [ ] **Step 3: Run tests**

```bash
cd apps/api && npm run test
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/items/*.spec.ts
git commit -m "test(api): add unit tests for Items service and controller"
```

---

## Phase 4: Web App (Next.js 16)

### Task 12: Scaffold Next.js web app inside monorepo

This task creates the Next.js app from scratch inside `apps/web/` using the latest Next.js with the monorepo's shared packages.

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/next.config.ts`
- Create: `apps/web/postcss.config.mjs`
- Create: `apps/web/eslint.config.mjs`

- [ ] **Step 1: Scaffold Next.js app**

```bash
cd apps && npx create-next-app@latest web --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --skip-install
```

- [ ] **Step 2: Update `apps/web/package.json` to use workspace packages and add all dependencies**

Replace with this structure (keep the Next.js version from create-next-app, but add the workspace and extra dependencies):

Add these dependencies:
- `@repo/types`: `*`
- `@tanstack/react-query`: latest
- `react-hook-form`: latest
- `@hookform/resolvers`: latest
- `zod`: latest
- `class-variance-authority`: latest
- `clsx`: latest
- `tailwind-merge`: latest
- `lucide-react`: latest
- `sonner`: latest

Add these devDependencies:
- `@repo/eslint-config`: `*`
- `@repo/typescript-config`: `*`
- `vitest`: latest
- `@vitejs/plugin-react`: latest
- `@testing-library/react`: latest
- `@testing-library/dom`: latest
- `@testing-library/jest-dom`: latest
- `jsdom`: latest
- `@playwright/test`: latest

Add scripts: `test`, `test:e2e`

- [ ] **Step 3: Update `apps/web/tsconfig.json`** to extend `@repo/typescript-config/nextjs.json`

```json
{
  "extends": "@repo/typescript-config/nextjs.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Create `apps/web/vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    exclude: ['e2e/**', 'node_modules/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

- [ ] **Step 5: Create `apps/web/vitest.setup.ts`**

```typescript
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 6: Create `apps/web/playwright.config.ts`**

```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: 0,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: true,
  },
})
```

- [ ] **Step 7: Run install from root**

```bash
npm install  # run from repo root
```

- [ ] **Step 8: Commit**

```bash
git add apps/web/
git commit -m "feat(web): scaffold Next.js app with testing setup"
```

### Task 13: Add web utility files and config

**Files:**
- Create: `apps/web/config/env.ts`
- Create: `apps/web/lib/utils.ts`
- Create: `apps/web/app/providers.tsx`

- [ ] **Step 1: Create `apps/web/config/env.ts`**

```typescript
function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

export const env = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/v1',
}
```

- [ ] **Step 2: Create `apps/web/lib/utils.ts`**

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 3: Create `apps/web/app/providers.tsx`**

```tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { Toaster } from 'sonner'

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" />
    </QueryClientProvider>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/config/ apps/web/lib/ apps/web/app/providers.tsx
git commit -m "feat(web): add env config, utils, and providers"
```

### Task 14: Add Items hooks and pages

**Files:**
- Create: `apps/web/hooks/use-items.ts`
- Create: `apps/web/app/page.tsx` (home)
- Create: `apps/web/app/items/page.tsx` (list)
- Create: `apps/web/app/items/new/page.tsx` (create)
- Create: `apps/web/app/items/[id]/page.tsx` (detail)
- Create: `apps/web/app/items/[id]/edit/page.tsx` (edit)
- Create: `apps/web/app/layout.tsx` (update root layout)

- [ ] **Step 1: Create `apps/web/hooks/use-items.ts`**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { env } from '@/config/env'
import type { PaginatedResponse } from '@repo/types'

interface Item {
  id: string
  title: string
  description: string | null
  createdAt: string
  updatedAt: string
}

const API = env.API_URL

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || `Request failed with status ${res.status}`)
  }
  return res.json()
}

export function useItems(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['items', page, limit],
    queryFn: () => fetchJson<PaginatedResponse<Item>>(`${API}/items?page=${page}&limit=${limit}`),
  })
}

export function useItem(id: string) {
  return useQuery({
    queryKey: ['items', id],
    queryFn: () => fetchJson<Item>(`${API}/items/${id}`),
    enabled: !!id,
  })
}

export function useCreateItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { title: string; description?: string }) =>
      fetchJson<Item>(`${API}/items`, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['items'] }),
  })
}

export function useUpdateItem(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { title?: string; description?: string }) =>
      fetchJson<Item>(`${API}/items/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
      queryClient.invalidateQueries({ queryKey: ['items', id] })
    },
  })
}

export function useDeleteItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fetchJson<Item>(`${API}/items/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['items'] }),
  })
}
```

- [ ] **Step 2: Update `apps/web/app/layout.tsx`** to wrap with Providers

```tsx
import type { Metadata } from 'next'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Workshop Starter',
  description: 'Full-stack starter project for the Claude workshop',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Create `apps/web/app/page.tsx`** (home page)

```tsx
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Workshop Starter</h1>
      <p className="text-gray-600">A full-stack monorepo template for building apps with Claude.</p>
      <div>
        <Link href="/items" className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          View Items
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create `apps/web/app/items/page.tsx`** (items list)

```tsx
'use client'

import Link from 'next/link'
import { useItems, useDeleteItem } from '@/hooks/use-items'
import { toast } from 'sonner'

export default function ItemsPage() {
  const { data, isLoading, error } = useItems()
  const deleteItem = useDeleteItem()

  if (isLoading) return <p>Loading...</p>
  if (error) return <p className="text-red-500">Error: {error.message}</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Items</h1>
        <Link href="/items/new" className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          New Item
        </Link>
      </div>

      {data?.data.length === 0 && <p className="text-gray-500">No items yet. Create your first one!</p>}

      <ul className="space-y-3">
        {data?.data.map((item) => (
          <li key={item.id} className="flex items-center justify-between rounded-lg border p-4">
            <Link href={`/items/${item.id}`} className="flex-1">
              <h2 className="font-semibold">{item.title}</h2>
              {item.description && <p className="text-sm text-gray-500">{item.description}</p>}
            </Link>
            <button
              onClick={() => {
                deleteItem.mutate(item.id, {
                  onSuccess: () => toast.success('Item deleted'),
                  onError: (err) => toast.error(err.message),
                })
              }}
              className="ml-4 text-sm text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

- [ ] **Step 5: Create `apps/web/app/items/new/page.tsx`** (create form)

```tsx
'use client'

import { useRouter } from 'next/navigation'
import { useCreateItem } from '@/hooks/use-items'
import { toast } from 'sonner'
import { useState } from 'react'

export default function NewItemPage() {
  const router = useRouter()
  const createItem = useCreateItem()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createItem.mutate(
      { title, description: description || undefined },
      {
        onSuccess: () => {
          toast.success('Item created')
          router.push('/items')
        },
        onError: (err) => toast.error(err.message),
      },
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Create Item</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium">
            Title
          </label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={200}
            className="mt-1 w-full rounded-lg border px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={2000}
            rows={4}
            className="mt-1 w-full rounded-lg border px-3 py-2"
          />
        </div>
        <button
          type="submit"
          disabled={createItem.isPending}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {createItem.isPending ? 'Creating...' : 'Create'}
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 6: Create `apps/web/app/items/[id]/page.tsx`** (detail)

```tsx
'use client'

import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useItem, useDeleteItem } from '@/hooks/use-items'
import { toast } from 'sonner'

export default function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: item, isLoading, error } = useItem(id)
  const deleteItem = useDeleteItem()
  const router = useRouter()

  if (isLoading) return <p>Loading...</p>
  if (error) return <p className="text-red-500">Error: {error.message}</p>
  if (!item) return <p>Item not found</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{item.title}</h1>
        <div className="flex gap-2">
          <Link href={`/items/${id}/edit`} className="rounded-lg border px-3 py-1 hover:bg-gray-50">
            Edit
          </Link>
          <button
            onClick={() =>
              deleteItem.mutate(id, {
                onSuccess: () => {
                  toast.success('Item deleted')
                  router.push('/items')
                },
              })
            }
            className="rounded-lg border border-red-200 px-3 py-1 text-red-500 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
      {item.description && <p className="text-gray-600">{item.description}</p>}
      <p className="text-sm text-gray-400">Created: {new Date(item.createdAt).toLocaleDateString()}</p>
      <Link href="/items" className="text-blue-600 hover:underline">
        &larr; Back to items
      </Link>
    </div>
  )
}
```

- [ ] **Step 7: Create `apps/web/app/items/[id]/edit/page.tsx`** (edit form)

```tsx
'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useItem, useUpdateItem } from '@/hooks/use-items'
import { toast } from 'sonner'

export default function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: item, isLoading } = useItem(id)
  const updateItem = useUpdateItem(id)
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (item) {
      setTitle(item.title)
      setDescription(item.description || '')
    }
  }, [item])

  if (isLoading) return <p>Loading...</p>

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateItem.mutate(
      { title, description: description || undefined },
      {
        onSuccess: () => {
          toast.success('Item updated')
          router.push(`/items/${id}`)
        },
        onError: (err) => toast.error(err.message),
      },
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Item</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium">
            Title
          </label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={200}
            className="mt-1 w-full rounded-lg border px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={2000}
            rows={4}
            className="mt-1 w-full rounded-lg border px-3 py-2"
          />
        </div>
        <button
          type="submit"
          disabled={updateItem.isPending}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {updateItem.isPending ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 8: Verify the web app runs**

```bash
npm run dev  # run from repo root
```

Expected: Web app at `http://localhost:3000`, API at `http://localhost:3001`. Navigate to `/items`, create/edit/delete items.

- [ ] **Step 9: Commit**

```bash
git add apps/web/
git commit -m "feat(web): add Items CRUD pages with React Query hooks"
```

### Task 15: Add web tests (Vitest + Playwright)

**Files:**
- Create: `apps/web/__tests__/items-list.test.tsx`
- Create: `apps/web/e2e/items.spec.ts`

- [ ] **Step 1: Create `apps/web/__tests__/items-list.test.tsx`**

A basic test verifying the items page renders loading state:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ItemsPage from '@/app/items/page'

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

describe('ItemsPage', () => {
  it('renders loading state', () => {
    renderWithProviders(<ItemsPage />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run Vitest**

```bash
cd apps/web && npx vitest run
```

Expected: Test passes.

- [ ] **Step 3: Create `apps/web/e2e/items.spec.ts`**

```typescript
import { test, expect } from '@playwright/test'

test.describe('Items CRUD', () => {
  test('should display items page', async ({ page }) => {
    await page.goto('/items')
    await expect(page.getByRole('heading', { name: 'Items' })).toBeVisible()
  })

  test('should create a new item', async ({ page }) => {
    await page.goto('/items/new')
    await page.getByLabel('Title').fill('Test Item')
    await page.getByLabel('Description').fill('A test description')
    await page.getByRole('button', { name: 'Create' }).click()

    await expect(page).toHaveURL('/items')
    await expect(page.getByText('Test Item')).toBeVisible()
  })

  test('should view item detail', async ({ page }) => {
    await page.goto('/items')
    await page.getByText('Test Item').click()
    await expect(page.getByText('A test description')).toBeVisible()
  })

  test('should delete an item', async ({ page }) => {
    await page.goto('/items')
    const deleteButton = page.getByRole('button', { name: 'Delete' }).first()
    await deleteButton.click()
    await expect(page.getByText('Item deleted')).toBeVisible()
  })
})
```

- [ ] **Step 4: Install Playwright browsers**

```bash
cd apps/web && npx playwright install chromium
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/__tests__/ apps/web/e2e/
git commit -m "test(web): add Vitest unit test and Playwright e2e tests for Items"
```

---

## Phase 5: Mobile App (Flutter)

### Task 16: Scaffold Flutter app

Create the Flutter app inside `apps/mobile/` with the same architecture as kroogom.

- [ ] **Step 1: Create Flutter app**

```bash
cd apps && flutter create --org com.workshop --project-name workshop_mobile mobile
```

- [ ] **Step 2: Replace `apps/mobile/pubspec.yaml`** with workshop dependencies

Key dependencies to include: flutter_riverpod, go_router, dio, freezed_annotation, json_annotation, google_fonts, intl, shared_preferences.

Key dev_dependencies: build_runner, freezed, json_serializable, flutter_lints, mocktail.

- [ ] **Step 3: Replace `apps/mobile/analysis_options.yaml`**

```yaml
include: package:flutter_lints/flutter.yaml

analyzer:
  exclude:
    - "**/*.g.dart"
    - "**/*.freezed.dart"

linter:
  rules:
    prefer_const_constructors: true
    prefer_const_declarations: true
    prefer_final_locals: true
    avoid_print: true
    require_trailing_commas: true
    sort_child_properties_last: true
    use_key_in_widget_constructors: true
    prefer_single_quotes: true
```

- [ ] **Step 4: Create `apps/mobile/.env.example`**

```
API_BASE_URL=http://localhost:3001/v1
```

- [ ] **Step 5: Run `flutter pub get`**

```bash
cd apps/mobile && flutter pub get
```

- [ ] **Step 6: Commit**

```bash
git add apps/mobile/
git commit -m "feat(mobile): scaffold Flutter app with dependencies"
```

### Task 17: Add Flutter core layer

**Files:**
- Create: `apps/mobile/lib/core/env/env.dart`
- Create: `apps/mobile/lib/core/network/api_client.dart`
- Create: `apps/mobile/lib/core/network/api_exception.dart`
- Create: `apps/mobile/lib/core/routing/app_routes.dart`
- Create: `apps/mobile/lib/core/routing/app_router.dart`
- Create: `apps/mobile/lib/core/theme/app_colors.dart`
- Create: `apps/mobile/lib/core/theme/app_typography.dart`
- Create: `apps/mobile/lib/core/theme/app_theme.dart`

- [ ] **Step 1: Create `apps/mobile/lib/core/env/env.dart`**

```dart
class Env {
  static String get apiBaseUrl =>
      const String.fromEnvironment('API_BASE_URL', defaultValue: 'http://localhost:3001/v1');

  static void validate() {
    // In dev mode, defaults are fine. Add validation for prod here.
  }
}
```

- [ ] **Step 2: Create `apps/mobile/lib/core/network/api_exception.dart`**

```dart
sealed class AppException implements Exception {
  final String message;
  const AppException(this.message);

  @override
  String toString() => message;
}

class BadRequestException extends AppException {
  const BadRequestException(super.message);
}

class NotFoundException extends AppException {
  const NotFoundException(super.message);
}

class ServerException extends AppException {
  const ServerException(super.message);
}

class NetworkException extends AppException {
  const NetworkException(super.message);
}
```

- [ ] **Step 3: Create `apps/mobile/lib/core/network/api_client.dart`**

```dart
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../env/env.dart';
import 'api_exception.dart';

final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(BaseOptions(
    baseUrl: Env.apiBaseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 15),
    headers: {'Content-Type': 'application/json'},
  ));

  dio.interceptors.add(InterceptorsWrapper(
    onError: (error, handler) {
      final statusCode = error.response?.statusCode;
      final message = error.response?.data?['message'] ?? 'Something went wrong';

      AppException exception;
      switch (statusCode) {
        case 400:
          exception = BadRequestException(message);
        case 404:
          exception = NotFoundException(message);
        case >= 500:
          exception = ServerException(message);
        default:
          if (error.type == DioExceptionType.connectionError ||
              error.type == DioExceptionType.connectionTimeout) {
            exception = const NetworkException('Unable to connect to server');
          } else {
            exception = ServerException(message);
          }
      }
      handler.reject(DioException(
        requestOptions: error.requestOptions,
        error: exception,
        response: error.response,
        type: error.type,
      ));
    },
  ));

  return dio;
});
```

- [ ] **Step 4: Create `apps/mobile/lib/core/routing/app_routes.dart`**

```dart
class AppRoutes {
  static const home = '/';
  static const items = '/items';
  static const itemDetail = '/items/:id';
  static const createItem = '/items/create';
  static const editItem = '/items/:id/edit';

  static String itemDetailPath(String id) => '/items/$id';
  static String editItemPath(String id) => '/items/$id/edit';
}
```

- [ ] **Step 5: Create `apps/mobile/lib/core/routing/app_router.dart`**

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'app_routes.dart';
import '../../features/home/presentation/home_screen.dart';
import '../../features/items/presentation/items_screen.dart';
import '../../features/items/presentation/item_detail_screen.dart';
import '../../features/items/presentation/create_item_screen.dart';
import '../../features/items/presentation/edit_item_screen.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: AppRoutes.home,
    routes: [
      GoRoute(
        path: AppRoutes.home,
        builder: (context, state) => const HomeScreen(),
      ),
      GoRoute(
        path: AppRoutes.items,
        builder: (context, state) => const ItemsScreen(),
      ),
      GoRoute(
        path: AppRoutes.createItem,
        builder: (context, state) => const CreateItemScreen(),
      ),
      GoRoute(
        path: AppRoutes.itemDetail,
        builder: (context, state) => ItemDetailScreen(id: state.pathParameters['id']!),
      ),
      GoRoute(
        path: AppRoutes.editItem,
        builder: (context, state) => EditItemScreen(id: state.pathParameters['id']!),
      ),
    ],
  );
});
```

- [ ] **Step 6: Create theme files**

Create `apps/mobile/lib/core/theme/app_colors.dart`:

```dart
import 'package:flutter/material.dart';

class AppColors {
  static const primaryBlue = Color(0xFF5669FF);
  static const primaryBlue80 = Color(0xFF7885FF);
  static const primaryBlue10 = Color(0xFFEEF0FF);

  static const textBlack = Color(0xFF1A1035);
  static const textGray = Color(0xFF747688);
  static const textGrayLight = Color(0xFFA4B4CB);

  static const accentGreen = Color(0xFF29D697);
  static const accentRed = Color(0xFFE90076);

  static const surfaceWhite = Color(0xFFFFFFFF);
  static const surfaceGray = Color(0xFFF5F5F5);
  static const borderGray = Color(0xFFE4DFDF);
}
```

Create `apps/mobile/lib/core/theme/app_typography.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

class AppTypography {
  static TextStyle get h1 => GoogleFonts.nunitoSans(fontSize: 28, fontWeight: FontWeight.bold, color: AppColors.textBlack);
  static TextStyle get h2 => GoogleFonts.nunitoSans(fontSize: 24, fontWeight: FontWeight.bold, color: AppColors.textBlack);
  static TextStyle get h3 => GoogleFonts.nunitoSans(fontSize: 20, fontWeight: FontWeight.w600, color: AppColors.textBlack);
  static TextStyle get body => GoogleFonts.nunitoSans(fontSize: 16, color: AppColors.textBlack);
  static TextStyle get bodySmall => GoogleFonts.nunitoSans(fontSize: 14, color: AppColors.textGray);
  static TextStyle get caption => GoogleFonts.nunitoSans(fontSize: 12, color: AppColors.textGrayLight);
}
```

Create `apps/mobile/lib/core/theme/app_theme.dart`:

```dart
import 'package:flutter/material.dart';
import 'app_colors.dart';

class AppTheme {
  static ThemeData get light => ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: AppColors.primaryBlue),
        scaffoldBackgroundColor: AppColors.surfaceWhite,
        appBarTheme: const AppBarTheme(
          backgroundColor: AppColors.surfaceWhite,
          foregroundColor: AppColors.textBlack,
          elevation: 0,
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primaryBlue,
            foregroundColor: Colors.white,
            minimumSize: const Size(double.infinity, 56),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        ),
      );
}
```

- [ ] **Step 7: Commit**

```bash
git add apps/mobile/lib/core/
git commit -m "feat(mobile): add core layer (env, network, routing, theme)"
```

### Task 18: Add Flutter Items feature

**Files:**
- Create: `apps/mobile/lib/models/item.dart`
- Create: `apps/mobile/lib/models/pagination.dart`
- Create: `apps/mobile/lib/features/items/data/items_repository.dart`
- Create: `apps/mobile/lib/features/items/providers/items_provider.dart`
- Create: `apps/mobile/lib/features/items/presentation/items_screen.dart`
- Create: `apps/mobile/lib/features/items/presentation/item_detail_screen.dart`
- Create: `apps/mobile/lib/features/items/presentation/create_item_screen.dart`
- Create: `apps/mobile/lib/features/items/presentation/edit_item_screen.dart`
- Create: `apps/mobile/lib/features/home/presentation/home_screen.dart`
- Modify: `apps/mobile/lib/main.dart`

- [ ] **Step 1: Create freezed models**

Create `apps/mobile/lib/models/item.dart`:

```dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'item.freezed.dart';
part 'item.g.dart';

@freezed
class Item with _$Item {
  const factory Item({
    required String id,
    required String title,
    String? description,
    required DateTime createdAt,
    required DateTime updatedAt,
  }) = _Item;

  factory Item.fromJson(Map<String, dynamic> json) => _$ItemFromJson(json);
}
```

Create `apps/mobile/lib/models/pagination.dart`:

```dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'pagination.freezed.dart';
part 'pagination.g.dart';

@freezed
class PaginationMeta with _$PaginationMeta {
  const factory PaginationMeta({
    required int total,
    required int page,
    required int limit,
    required int totalPages,
  }) = _PaginationMeta;

  factory PaginationMeta.fromJson(Map<String, dynamic> json) => _$PaginationMetaFromJson(json);
}

@freezed
class PaginatedResponse<T> with _$PaginatedResponse<T> {
  const factory PaginatedResponse({
    required List<T> data,
    required PaginationMeta meta,
  }) = _PaginatedResponse<T>;
}
```

- [ ] **Step 2: Run code generation**

```bash
cd apps/mobile && dart run build_runner build --delete-conflicting-outputs
```

Expected: Generates `.freezed.dart` and `.g.dart` files.

- [ ] **Step 3: Create items repository, providers, screens, and home screen**

Create all the feature files following the pattern from Steps 4-8 below. Each file implements the Items CRUD feature using Riverpod + Dio + GoRouter.

- [ ] **Step 4: Create `apps/mobile/lib/features/items/data/items_repository.dart`**

```dart
import 'package:dio/dio.dart';
import '../../../models/item.dart';
import '../../../models/pagination.dart';

class ItemsRepository {
  final Dio _dio;
  ItemsRepository(this._dio);

  Future<PaginatedResponse<Item>> getItems({int page = 1, int limit = 20}) async {
    final response = await _dio.get('/items', queryParameters: {'page': page, 'limit': limit});
    final data = response.data as Map<String, dynamic>;
    final items = (data['data'] as List).map((e) => Item.fromJson(e as Map<String, dynamic>)).toList();
    final meta = PaginationMeta.fromJson(data['meta'] as Map<String, dynamic>);
    return PaginatedResponse(data: items, meta: meta);
  }

  Future<Item> getItem(String id) async {
    final response = await _dio.get('/items/$id');
    return Item.fromJson(response.data as Map<String, dynamic>);
  }

  Future<Item> createItem({required String title, String? description}) async {
    final response = await _dio.post('/items', data: {'title': title, if (description != null) 'description': description});
    return Item.fromJson(response.data as Map<String, dynamic>);
  }

  Future<Item> updateItem(String id, {String? title, String? description}) async {
    final response = await _dio.patch('/items/$id', data: {if (title != null) 'title': title, if (description != null) 'description': description});
    return Item.fromJson(response.data as Map<String, dynamic>);
  }

  Future<void> deleteItem(String id) async {
    await _dio.delete('/items/$id');
  }
}
```

- [ ] **Step 5: Create `apps/mobile/lib/features/items/providers/items_provider.dart`**

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../../models/item.dart';
import '../../../models/pagination.dart';
import '../data/items_repository.dart';

final itemsRepositoryProvider = Provider<ItemsRepository>((ref) {
  return ItemsRepository(ref.watch(dioProvider));
});

final itemsProvider = FutureProvider<PaginatedResponse<Item>>((ref) {
  return ref.watch(itemsRepositoryProvider).getItems();
});

final itemProvider = FutureProvider.family<Item, String>((ref, id) {
  return ref.watch(itemsRepositoryProvider).getItem(id);
});
```

- [ ] **Step 6: Create Items screens** (items_screen.dart, item_detail_screen.dart, create_item_screen.dart, edit_item_screen.dart)

Each screen is a `ConsumerWidget` or `ConsumerStatefulWidget` that watches the relevant provider and renders the UI. Follow the same CRUD pattern as the web pages but using Flutter widgets, `GoRouter` for navigation, and Riverpod for state.

- [ ] **Step 7: Create `apps/mobile/lib/features/home/presentation/home_screen.dart`**

```dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/routing/app_routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Workshop Starter', style: AppTypography.h2)),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text('A full-stack starter for building apps with Claude.', style: AppTypography.body, textAlign: TextAlign.center),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () => context.push(AppRoutes.items),
                child: const Text('View Items'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

- [ ] **Step 8: Update `apps/mobile/lib/main.dart`**

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/env/env.dart';
import 'core/routing/app_router.dart';
import 'core/theme/app_theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  Env.validate();
  runApp(const ProviderScope(child: WorkshopApp()));
}

class WorkshopApp extends ConsumerWidget {
  const WorkshopApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);
    return MaterialApp.router(
      title: 'Workshop Starter',
      theme: AppTheme.light,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
```

- [ ] **Step 9: Run the app**

```bash
cd apps/mobile && flutter run --dart-define-from-file=.env
```

Expected: App launches with home screen, navigate to items list, create/view/edit/delete items.

- [ ] **Step 10: Commit**

```bash
git add apps/mobile/
git commit -m "feat(mobile): add Items feature with Riverpod, Dio, GoRouter, Freezed"
```

### Task 19: Add Flutter widget test

**Files:**
- Create: `apps/mobile/test/features/items/items_screen_test.dart`

- [ ] **Step 1: Create test**

```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:workshop_mobile/features/home/presentation/home_screen.dart';

void main() {
  testWidgets('HomeScreen displays title and button', (tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(home: HomeScreen()),
      ),
    );

    expect(find.text('Workshop Starter'), findsOneWidget);
    expect(find.text('View Items'), findsOneWidget);
  });
}
```

- [ ] **Step 2: Run test**

```bash
cd apps/mobile && flutter test
```

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/test/
git commit -m "test(mobile): add HomeScreen widget test"
```

---

## Phase 6: Claude Configuration

### Task 20: Create `.claude/` directory with settings, skills, and CLAUDE.md files

This is the largest single task. It involves:
1. Creating `.claude/settings.json` with plugins and hooks
2. Copying and adapting all 19 custom skills from kroogom
3. Writing 4 CLAUDE.md files (root + 3 apps)
4. Creating the workitems directory structure
5. Copying external skills (shadcn, ui-ux-pro-max)

- [ ] **Step 1: Create `.claude/settings.json`**

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "INPUT=$(cat); CMD=$(echo \"$INPUT\" | jq -r '.tool_input.command // \"\"'); OUTPUT=$(echo \"$INPUT\" | jq -r '(.tool_response.stdout // .tool_response | tostring)'); if echo \"$CMD\" | grep -q 'gh pr create'; then PR_NUM=$(echo \"$OUTPUT\" | sed -n 's#.*/pull/\\([0-9][0-9]*\\).*#\\1#p' | head -1); if [ -n \"$PR_NUM\" ]; then jq -n --arg msg \"PR #${PR_NUM} was just created. Please run: /loop 5m /address-pr-comments ${PR_NUM}\" '{\"hookSpecificOutput\": {\"hookEventName\": \"PostToolUse\", \"additionalContext\": $msg}}'; fi; fi"
          }
        ]
      }
    ]
  },
  "enabledPlugins": {
    "typescript-lsp@claude-plugins-official": true,
    "security-guidance@claude-plugins-official": true,
    "commit-commands@claude-plugins-official": true,
    "pr-review-toolkit@claude-plugins-official": true,
    "frontend-design@claude-plugins-official": true,
    "feature-dev@claude-plugins-official": true,
    "figma@claude-plugins-official": true,
    "superpowers@claude-plugins-official": true
  }
}
```

- [ ] **Step 2: Create workitems directory structure**

```bash
mkdir -p .claude/workitems/{feedback,planning,development,archive/{feedback,planning,development}}
mkdir -p .claude/mocks
echo "# UI Mocks Index\n\n| # | Name | File | Status | Created | Target |\n|---|------|------|--------|---------|--------|" > .claude/mocks/INDEX.md
```

- [ ] **Step 3: Copy all 19 custom skills from kroogom**

Copy each skill directory from `<path-to-kroogom>/.claude/skills/` to `.claude/skills/`. Then adapt each one:

- Replace "Kroogom" with "Workshop Project" throughout
- Replace domain-specific references (events, RSVPs, groups, bookmarks, invitations, categories, notifications, chat) with generic references or Items examples
- Update file paths to match workshop structure
- Remove Figma references from `build-feature` Phase 1 (design context) and Phase 2 references
- Update sprint file references to generic backlog
- Remove kroogom-specific audit output paths

Skills to copy:
```
build-feature, commit-and-pr, jira-ticket, design-plan, feature-branch,
implement, checkpoint, unit-test, integration-test, review,
capture-learnings, address-pr-comments, verify-pr-comment,
generate-mock, implement-mock, fix-audit-item, flutter-audit,
fullstack-audit, devops-cicd
```

For `flutter-audit` and `fullstack-audit`, also copy their `references/` subdirectories.

- [ ] **Step 4: Copy external skills**

```bash
mkdir -p .agents/skills
cp -r <path-to-kroogom>/.agents/skills/shadcn .agents/skills/
cp -r <path-to-kroogom>/.agents/skills/ui-ux-pro-max .agents/skills/
```

- [ ] **Step 5: Write `.claude/CLAUDE.md`** (root monorepo guide)

Adapt from kroogom's root CLAUDE.md. Key sections:
- Purpose and app-specific guide pointers
- Monorepo overview table (web, api, mobile, packages)
- Shared engineering standards (1-8, keep all)
- Cross-app API contract rules
- Data persistence rules
- DRY and component reuse
- i18n rules (English only, extensible)
- Quality gates and commands
- PR expectations
- Workflow preferences
- Change planning guidance
- Extension points section (how to add auth, AWS, real-time, etc.)

Remove: Auth/security rules (no auth), domain entities (just Item), sprint tracking, key API endpoints table (just Items + Health), mobile app flow (simplified), chat section.

- [ ] **Step 6: Write `apps/api/.claude/CLAUDE.md`** (API guide)

Adapt from kroogom's API CLAUDE.md:
- Stack overview (NestJS latest, Prisma, PostgreSQL)
- Module table (Items + Health only)
- Source structure
- Prisma patterns
- Implementation rules
- Configuration and environment
- Testing patterns
- "How to Add a New Module" tutorial section
- PR checklist

- [ ] **Step 7: Write `apps/web/.claude/CLAUDE.md`** (Web guide)

Adapt from kroogom's Web CLAUDE.md:
- Stack overview (Next.js 16, React 19, Tailwind 4)
- Project structure
- Implementation rules
- API integration (React Query pattern)
- i18n setup (English, extensible)
- Design system
- Testing (Vitest + Playwright)
- "How to Add a New Page" tutorial section
- PR checklist

- [ ] **Step 8: Write `apps/mobile/.claude/CLAUDE.md`** (Mobile guide)

Adapt from kroogom's Mobile CLAUDE.md:
- Stack overview (Flutter, Riverpod, GoRouter, Dio)
- Project structure (feature-first)
- Implementation rules (freezed, plain providers, no hardcoded visuals)
- API integration (Dio + repository pattern)
- Quality gates
- Naming conventions
- "How to Add a New Feature" tutorial section
- Common pitfalls (relevant subset)

- [ ] **Step 9: Create root `CLAUDE.md`** pointer

```markdown
@.claude/CLAUDE.md
```

- [ ] **Step 10: Commit**

```bash
git add .claude/ .agents/ CLAUDE.md apps/api/.claude/ apps/web/.claude/ apps/mobile/.claude/
git commit -m "feat: add Claude configuration, skills, and CLAUDE.md files"
```

---

## Phase 7: Documentation

### Task 21: Write architecture, system design, and coding style guide

**Files:**
- Create: `docs/architecture.md`
- Create: `docs/system-design.md`
- Create: `docs/coding-style-guide.md`

- [ ] **Step 1: Write `docs/architecture.md`**

Sections:
- System overview diagram (text-based)
- Monorepo layout (what each app/package does)
- Data flow (web/mobile → API → PostgreSQL)
- API contract (versioning, pagination, shared types)
- Shared packages (purpose of each)
- Extension points (where to add auth, cloud services, real-time, file upload)

- [ ] **Step 2: Write `docs/system-design.md`**

Sections:
- Why this stack (rationale for each technology)
- Why monorepo (benefits for Claude-assisted development)
- Local-first development (Docker Compose, no cloud deps)
- Infrastructure options (brief deployment paths)
- Scaling considerations
- Authentication options (how to add auth later)

- [ ] **Step 3: Write `docs/coding-style-guide.md`**

Sections:
- Naming conventions (files, classes, variables — all 3 languages)
- File organization (per app)
- TypeScript rules
- Dart rules
- Component/widget patterns
- API module pattern (with example)
- Testing conventions
- Git workflow (branch naming, commits, PRs)
- Design tokens (no hardcoded values)

- [ ] **Step 4: Commit**

```bash
git add docs/
git commit -m "docs: add architecture, system design, and coding style guide"
```

---

## Phase 8: CI/CD

### Task 22: Add GitHub Actions CI workflow

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  pull_request:
    branches: [main]

jobs:
  api:
    name: API (lint + test + typecheck)
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: apps/api
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
        working-directory: .
      - run: npm run lint
      - run: npm run test
      - run: npx tsc --noEmit

  web:
    name: Web (lint + test + typecheck)
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: apps/web
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
        working-directory: .
      - run: npm run lint
      - run: npm run test

  audit:
    name: Security Audit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm audit --audit-level=critical
```

- [ ] **Step 2: Commit**

```bash
git add .github/
git commit -m "ci: add GitHub Actions workflow for API, Web, and security audit"
```

---

## Phase 9: README

### Task 23: Write workshop README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write `README.md`**

```markdown
# Claude Workshop Starter

A full-stack monorepo template for building apps with Claude. Built with Turborepo, Next.js, NestJS, Flutter, and PostgreSQL.

## Prerequisites

- Node.js 22+ (`nvm use`)
- Docker (for PostgreSQL)
- Flutter SDK (for mobile development)
- Git

## Quick Start

### 1. Clone and install

\`\`\`bash
git clone <repo-url> my-project
cd my-project
nvm use
npm install
\`\`\`

### 2. Start the database

\`\`\`bash
docker compose up -d
\`\`\`

### 3. Set up the API

\`\`\`bash
cd apps/api
cp .env.example .env
npx prisma migrate dev
cd ../..
\`\`\`

### 4. Start development

\`\`\`bash
npm run dev
\`\`\`

- Web: http://localhost:3000
- API: http://localhost:3001
- Swagger docs: http://localhost:3001/docs

### 5. Mobile (optional)

\`\`\`bash
cd apps/mobile
cp .env.example .env
flutter pub get
dart run build_runner build
flutter run --dart-define-from-file=.env
\`\`\`

## Project Structure

| Path | Description |
|------|-------------|
| `apps/web` | Next.js 16 frontend |
| `apps/api` | NestJS API backend |
| `apps/mobile` | Flutter mobile app |
| `packages/types` | Shared TypeScript types |
| `packages/ui` | Shared React components |
| `packages/eslint-config` | Shared ESLint configs |
| `packages/typescript-config` | Shared TypeScript configs |
| `.claude/` | Claude Code skills and configuration |
| `docs/` | Architecture and style guides |

## Available Claude Skills

| Command | Description |
|---------|-------------|
| `/build-feature` | End-to-end feature lifecycle |
| `/design-plan` | Create implementation plan |
| `/feature-branch` | Create feature branch |
| `/implement` | Execute planned work |
| `/checkpoint` | Quick progress commit |
| `/unit-test` | Generate unit tests |
| `/integration-test` | Generate e2e tests |
| `/review` | Pre-PR quality review |
| `/commit-and-pr` | Finalize branch + open PR |
| `/address-pr-comments` | Handle PR feedback |
| `/generate-mock` | Create HTML UI mocks |
| `/implement-mock` | Convert mock to code |
| `/fullstack-audit` | Production audit |
| `/flutter-audit` | Flutter production audit |
| `/devops-cicd` | Infrastructure setup |

## Commands

\`\`\`bash
npm run dev       # Start web + API
npm run build     # Build all apps
npm run lint      # Lint all apps
npm run test      # Test all apps
npm run format    # Format with Prettier
\`\`\`

## Documentation

- [Architecture](docs/architecture.md)
- [System Design](docs/system-design.md)
- [Coding Style Guide](docs/coding-style-guide.md)

## Adding a New Feature

See the CLAUDE.md files for each app:
- `.claude/CLAUDE.md` — monorepo-wide conventions
- `apps/api/.claude/CLAUDE.md` — API module pattern
- `apps/web/.claude/CLAUDE.md` — web page pattern
- `apps/mobile/.claude/CLAUDE.md` — Flutter feature pattern

Or use `/build-feature <description>` to have Claude guide you through the entire lifecycle.
\`\`\`
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add workshop README with setup instructions"
```

---

## Phase 10: Final Verification

### Task 24: Verify everything works end-to-end

- [ ] **Step 1: Clean install from scratch**

```bash
rm -rf node_modules apps/*/node_modules packages/*/node_modules
npm install
```

- [ ] **Step 2: Start database**

```bash
docker compose up -d
```

- [ ] **Step 3: Run migrations**

```bash
cd apps/api && npx prisma migrate dev
```

- [ ] **Step 4: Start dev servers**

```bash
npm run dev
```

- [ ] **Step 5: Verify API**

```bash
curl http://localhost:3001/v1/health
curl -X POST http://localhost:3001/v1/items -H "Content-Type: application/json" -d '{"title":"Test","description":"Hello"}'
curl http://localhost:3001/v1/items
```

- [ ] **Step 6: Verify web**

Open http://localhost:3000 — navigate to Items, create/edit/delete.

- [ ] **Step 7: Run tests**

```bash
cd apps/api && npm run test
cd ../web && npx vitest run
```

- [ ] **Step 8: Verify mobile builds**

```bash
cd apps/mobile && flutter analyze && flutter test
```

- [ ] **Step 9: Final commit**

```bash
git add -A
git commit -m "chore: final verification — all apps running and tests passing"
```
