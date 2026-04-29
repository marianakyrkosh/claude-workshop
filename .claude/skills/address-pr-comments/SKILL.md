---
description: Process unresolved PR review comments — evaluate, fix, reply, and resolve threads
argument-hint: [PR number or URL]
---

# Address PR Comments

End-to-end handling of PR review feedback. Each comment is evaluated, optionally implemented, replied to, and the thread resolved.

## Phase 1: Fetch

```bash
gh pr view <number> --json number,title,headRefName,baseRefName,url,state
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
      reviewRequests(first: 20) {
        nodes { requestedReviewer { ... on Bot { login } ... on User { login } } }
      }
    }
  }
}'
```

Filter to threads where `isResolved == false`. Skip pure acknowledgments ("LGTM", "thanks").

Note whether Copilot is "in the process of reviewing" by checking the GraphQL `requestedReviewer.login` value for exactly `copilot-pull-request-reviewer` (no `[bot]` suffix). Treat that as "Copilot pending" for the early-stop check below. This is intentionally different from the REST reviewer slug `copilot-pull-request-reviewer[bot]` used later in Phase 6 — REST and GraphQL surface bot logins differently.

Also note the PR `state` from `gh pr view`: it's used by the early-stop check to recognize merged or closed PRs.

### Early stop: nothing to address

Trigger this stop if **any** of the following are true:

- `state != "OPEN"` (the PR is `MERGED` or `CLOSED` — there's nothing left to review), or
- `unresolved threads == 0` AND Copilot is not in the pending `reviewRequests`.

When triggered, this skill has nothing to do — and if it's running on a `/loop`, the loop should be cancelled rather than burn cycles. Do the following:

1. Call `CronList` to list session cron jobs.
2. Find **every** job whose `prompt` matches `/address-pr-comments <number>` for the current PR (there should usually be at most one, but if duplicate `/loop` invocations created several, treat them all as stale).
3. Call `CronDelete` on each matching job id — cancel them all.
4. Tell the user, in one line, which job ids were cancelled and why (e.g. `state=MERGED`, or `no unresolved threads + no pending Copilot review`).
5. Stop — do not continue to Phase 2+.

If the PR is `OPEN`, threads are 0, but Copilot **is** still pending: stop this invocation without cancelling the loop — the next tick may catch Copilot's incoming review.

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
- If there are no unresolved threads and Copilot isn't pending: stop. Don't create busywork. If a matching `/loop` cron exists for this PR, cancel it via `CronList` + `CronDelete` so it doesn't keep firing — see Phase 1's early-stop block.
