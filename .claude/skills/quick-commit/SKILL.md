---
description: Save in-progress work as a quick checkpoint commit
argument-hint: [short description (optional)]
---

# Quick Commit

A safety-net commit during active work. Local only — not pushed and not a substitute for a real PR commit.

## Steps

1. Check status:
   ```bash
   git status --porcelain
   ```
   If nothing changed, exit with "Nothing to checkpoint."

2. Stage everything:
   ```bash
   git add -A
   ```

3. Commit with a checkpoint marker:
   ```bash
   git commit -m "checkpoint: $(date +%Y-%m-%d\ %H:%M) — $ARGUMENTS"
   ```
   If `$ARGUMENTS` is empty, use a generic suffix like `wip`.

## When to use

- Between checklist items during `/implement-feature`
- Before risky refactors
- Before switching contexts

## When not to use

- For final, reviewable commits — use `/open-pr` (which generates a real conventional-commit message)
- When the work is incomplete in a way that breaks the build (fix it first, or stash instead)
