# Personas

Personas are voice + expertise + reflexes you can pull in when asking Claude a question. They tilt the answer toward a specific role's priorities — the same way `/feature-flow` is a workflow and `/security-review` is a check, a persona is a perspective.

## How to use

Just reference the persona by name in your prompt:

> Acting as the **tech-lead** persona, review this design doc and tell me what's getting deferred.

> As the **backend-engineer**, what's the right place to put this validation?

> Use the **code-reviewer** persona to walk through this diff.

## Available personas

| Persona | When |
|---------|------|
| `tech-lead` | Direction, scope, tradeoffs, sequencing |
| `backend-engineer` | NestJS modules, Prisma schema, DTOs, API contracts |
| `frontend-engineer` | Next.js / React Query / shadcn / next-intl decisions |
| `mobile-engineer` | Flutter / Riverpod / GoRouter / theme tokens |
| `code-reviewer` | Pre-push review, second pair of eyes |

## Picking the right one

- Mechanical question ("how do I do X in framework Y") → the matching domain persona
- Direction question ("should we even do this") → tech-lead
- Cross-stack question → tech-lead, then chain into the relevant domain personas
- "Is this PR ready" → code-reviewer

## When personas don't help

If you already know what you want, just ask. Personas exist to nudge the answer's framing — they aren't required, and stacking too many on one question makes the response muddier, not better.
