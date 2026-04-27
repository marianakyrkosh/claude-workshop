---
description: Evaluate a single PR comment for correctness and project fit
argument-hint: [comment text or comment URL]
---

# Verify PR Comment

A focused tool for assessing one comment. Mostly useful when reasoning about a tricky comment in isolation, before plugging the result into `/address-pr-comments`.

## Criteria

1. **Technically correct** — does the suggestion compile/run/work as described?
2. **Risk reduction** — does it actually reduce a real risk in this codebase?
3. **Stack fit** — does it align with the workshop conventions?
4. **Contract compatibility** — does it keep API/web/mobile in sync?
5. **Cost vs benefit** — is the disruption proportional to the gain?

## Reject when the suggestion

- Assumes a stack we don't use (Pages Router, class components, Provider package, etc.)
- Conflicts with an explicit choice in `CLAUDE.md`
- Solves a problem that doesn't exist in our config
- Is purely stylistic and `prettier`/`eslint` would flag it if it mattered

## Accept when the suggestion

- Fixes a real bug or regression
- Closes a security or privacy gap
- Adds missing validation, guard, or transaction safety
- Makes test coverage match a behavior change
- Aligns API and consumer types that drifted

## Output format

- **Decision**: accept | partial | reject | question
- **Reason**: one or two sentences of technical rationale
- **Action**: the exact next change (or "none" if rejected)
- **Risk if ignored**: one sentence
