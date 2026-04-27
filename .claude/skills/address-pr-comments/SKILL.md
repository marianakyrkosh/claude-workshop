---
description: Process unresolved PR review comments — evaluate, fix, reply, and resolve threads
argument-hint: [PR number or URL]
---

# Address PR Comments

End-to-end handling of PR review feedback. Each comment is evaluated, optionally implemented, replied to, and the thread resolved.

## Phase 1: Fetch

```bash
gh pr view <number> --json number,title,headRefName,baseRefName,url
gh pr diff <number>
gh api graphql -f query='
{
  repository(owner: "<owner>", name: "<repo>") {
    pullRequest(number: <number>) {
      reviewThreads(first: 50) {
        nodes {
          id isResolved
          comments(first: 1) { nodes { body databaseId path line } }
        }
      }
    }
  }
}'
```

Filter to threads where `isResolved == false`. Skip pure acknowledgments ("LGTM", "thanks").

## Phase 2: Evaluate

For each comment, decide:

- **accept** — the suggestion is correct and improves the change
- **partial** — the underlying concern is valid but the proposed fix doesn't fit; do a smaller variant
- **reject** — the suggestion conflicts with the project's intentional choices, or is factually wrong
- **question** — needs clarification before any action

Criteria:

1. Is the suggestion technically right?
2. Does it reduce risk (bugs, security, regressions)?
3. Does it match Workshop conventions (root and per-app `CLAUDE.md`)?
4. Does it preserve cross-layer contract consistency?
5. Cost vs benefit — is the change worth the disruption?

## Phase 3: Implement

For accept/partial:

```bash
git checkout <head-branch>
git pull origin <head-branch>
```

Make the change. Run `npx prettier --write` and the relevant linter on touched files. Run impacted tests.

## Phase 4: Reply and resolve

For each comment, post a reply via:

```bash
gh api repos/<owner>/<repo>/pulls/<number>/comments/<comment-id>/replies \
  --method POST \
  -f body="<concise reply explaining decision and action>"
```

Then resolve the thread:

```bash
gh api graphql -f query='
  mutation { resolveReviewThread(input: {threadId: "<thread-id>"}) { thread { isResolved } } }
'
```

Resolve before pushing so the next Copilot review runs against a clean slate.

## Phase 5: Commit and push

```bash
git add <changed files>
git commit -m "fix: address review comments on PR #<n>"
git push
```

## Phase 6: Re-request review

```bash
gh api repos/<owner>/<repo>/pulls/<number>/requested_reviewers \
  --method POST \
  -f 'reviewers[]=copilot-pull-request-reviewer[bot]'
```

## Guardrails

- Never force-push the PR branch. Add new commits.
- Reply messages: concise, professional, no emojis, no filler.
- If a comment references code outside the PR diff, flag it to the user instead of expanding scope.
- If you reject, explain why — don't just close the thread.
- If there are no unresolved threads and Copilot isn't pending: stop. Don't create busywork.
