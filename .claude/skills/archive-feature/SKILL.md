---
description: Finalize learnings and move feature artifacts to the archive
argument-hint: [feature slug (optional)]
---

# Archive Feature

Wrap up a completed feature. Capture what was learned and move the working files out of active workspace into archive so the next feature starts fresh.

## Inputs

- `.claude/workitems/feedback/REQUEST-[slug].md`
- `.claude/workitems/development/[slug]-design.md`
- `.claude/workitems/planning/[slug]-checklist.md`
- `.claude/workitems/development/[slug]-learnings.md`

## Update

In the learnings doc, append:

- **Delivery summary** — what shipped, with PR link
- **Decisions** — non-obvious choices and why
- **Tradeoffs** — what was deferred or simplified
- **Verification** — commands run and their outcomes
- **Followups** — debt, gaps, or related improvements worth queuing

Keep entries short and useful. Future-you reads this when something similar comes up.

## Archive

Move the four files into the archive:

```bash
mkdir -p .claude/workitems/archive/{feedback,planning,development}
mv .claude/workitems/feedback/REQUEST-[slug].md \
   .claude/workitems/archive/feedback/
mv .claude/workitems/planning/[slug]-checklist.md \
   .claude/workitems/archive/planning/
mv .claude/workitems/development/[slug]-design.md \
   .claude/workitems/development/[slug]-learnings.md \
   .claude/workitems/archive/development/
```

Skip files that don't exist for this feature.

## If a mock was involved

```bash
mkdir -p .claude/mocks/archive
mv .claude/mocks/[slug]*.html .claude/mocks/archive/ 2>/dev/null || true
```

Update `.claude/mocks/INDEX.md` to mark the row as `Implemented` and add the archive path.
