---
name: new-task
description: Start a unit of work the standard way — worktree branch, task checklist, lane confirmation. Use at the start of every feature, fix, or chore.
---

Start a new unit of work. The argument is the branch name as `<type>/<title>` (e.g. `feat/user-report-flow`). If no argument was given, derive one from the user's request and confirm it.

1. **Guard:** run `git status`. If the current tree is dirty, stop and ask whether to commit, stash, or include the changes.
2. **Worktree:** from the main checkout, create the isolated worktree:
   ```bash
   git worktree add ../<repo>-<title> -b <type>/<title>
   ```
   Work happens in that directory from now on.
3. **Checklist:** if the task has 4 or more distinct items, copy `docs/TASKS.md` to `docs/tasks/<type>-<title>.md`, fill in the numbered items with acceptance criteria each, and confirm the list with the user before implementing. Work through it marking `[x]` only when verified.
4. **Lane check:** state which CLAUDE.md §8 lane(s) the work touches. If it touches shared contracts/types or more than two lanes, flag that to the user — it may need decomposition via team-lead.
5. **UI check:** if the task includes non-trivial UI, require a filled `docs/DESIGN_BRIEF.md` copy before building (CLAUDE.md §4). Ask the 4 brief questions if missing (reference/sketch, must-haves, must-nots, target viewport).

Then implement per CLAUDE.md §1. Finish every task with `/pre-merge`.
