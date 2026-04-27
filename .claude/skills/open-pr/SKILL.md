---
description: Commit, push, and open a pull request against main
argument-hint: [PR title hint (optional)]
---

# Open PR

Wrap up the branch and open a PR. This is the last step before reviewers see the work.

## Preconditions

- `/pre-pr-review` has run with no blocking findings
- Tests for changed areas pass
- Working tree is committed (no `git status` output beyond the planned PR contents)
- Current branch is not `main`

## Steps

```bash
git status --short
git add <specific files>          # avoid `git add -A` if there's anything sensitive
git commit -m "<conventional commit>"
git push
gh pr create --base main --head $(git branch --show-current) \
  --title "<title>" --body-file <body-file>
```

## Commit message

Conventional Commits format: `feat(items): add bulk delete`. Scope is the touched area (`api`, `web`, `mobile`, `items`, etc.). Body explains intent (the why), not the diff (the what).

## PR body

```markdown
## Summary

- One bullet per major change
- Mention impacted apps: API, Web, Mobile, packages/types

## Test plan

- [ ] Specific commands or interactions someone can run to verify

## Notes

- Breaking changes (if any) and migration steps
- Screenshots for visible UI changes
```

## After creation

The repo's `PostToolUse` hook will suggest running `/loop 5m /address-pr-comments <PR#>` once the PR is open. That keeps comment handling automated until you stop the loop or the PR merges.
