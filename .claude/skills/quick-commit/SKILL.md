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

2. Review what's about to be staged. **Skim for accidentally-tracked secrets** — `.env` files, dumps, credentials, anything that looks like a key. If you see something that doesn't belong, stop and tell the user before staging.

3. Stage tracked changes only — don't blindly include untracked files (they may include secrets the gitignore hasn't caught yet):
   ```bash
   git add -u                # tracked modifications and deletions
   ```
   For new files, add them by name:
   ```bash
   git add <path>            # one or more specific paths
   ```
   Avoid `git add -A` and `git add .` in this skill. The whole point of a checkpoint is to be quick, but quick should not mean reckless.

4. Commit with a checkpoint marker:
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
