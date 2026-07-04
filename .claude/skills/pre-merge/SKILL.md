---
name: pre-merge
description: The gate at the end of every unit of work — full checks, secret scan, end-to-end verification, conventional commit, PR. Nothing merges to main without passing this.
---

Run the full pre-merge gate on the current worktree branch. Every step blocks: on failure, fix and re-run — do not proceed, do not soften the report.

1. **Full checks:** lint, typecheck, and the entire test suite (the project's `{{CHECK_COMMAND}}` from CLAUDE.md §7) — not just tests near the diff.
2. **Secret scan:** `gitleaks protect --staged` (or `gitleaks detect` on the branch diff). Any hit: STOP, remove the secret, tell the user to rotate it. Also verify no `.env`, dumps, or build output are staged.
3. **End-to-end verify:** exercise the changed flow with real input (run `/verify` if available). Record actual observed behavior — response bodies, rendered states — not expectations.
4. **Acceptance criteria:** walk the task checklist / design brief; every item gets explicit pass/fail with evidence. Any fail returns to implementation.
5. **Docs:** if architecture, data model, commands, or setup changed — update CLAUDE.md / docs/DECISIONS.md / README.md now, in this branch.
6. **Commit & PR:** conventional commit(s), push, open the PR with: what changed, how it was verified (paste the evidence), and any follow-ups. Run `/code-review` on the diff.
7. **Report** to the user: gate results step-by-step, PR link, and — only after they merge — remind to `git worktree remove` the branch worktree.

Never merge to main yourself unless the user has explicitly asked for auto-merge on this task.
