---
description: Cut a feature branch from main and push with upstream tracking
argument-hint: [branch slug (optional)]
---

# Branch Start

Create a clean branch for the work in progress. If invoked without a name, derive the slug from the most recent change request file.

## Steps

```bash
git fetch origin
git checkout main
git pull origin main
git checkout -b feature/<slug>
git push -u origin feature/<slug>
```

## Rules

- Always branch from updated `main`. Never from another feature branch.
- One feature per branch. If scope grows, open a follow-up branch.
- Slug format: `feature/<kebab-case>` (e.g. `feature/add-bulk-delete`).
- If the working tree has uncommitted changes, stop and ask whether to stash, commit, or discard them. Don't decide silently.

## Auto-name fallback

If no name passed, look for the most recent file matching `.claude/workitems/feedback/REQUEST-*.md` and use that slug.
