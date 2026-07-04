# SKILLS.md — house skills index

Skills live in `.claude/skills/<name>/SKILL.md` and are invoked as `/<name>` in Claude Code.
This file is the human-readable index; keep it in sync when adding a skill.

| Skill        | Invoke                            | What it does                                                                                                       | When to use                                            |
| ------------ | --------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| new-task     | `/new-task <type>/<title>`        | Creates the worktree branch, seeds a TASKS.md checklist, confirms the lane                                         | Start of every unit of work                            |
| pre-merge    | `/pre-merge`                      | Runs lint + typecheck + tests + gitleaks + end-to-end verify, then conventional-commits and opens the PR           | End of every unit of work, before merge                |
| verify-data  | `/verify-data <table-or-dataset>` | Runs the data-quality gates: row counts, required fields, domain invariants; writes violations to the review queue | After any ingestion/backfill, before promoting to prod |
| prod-migrate | `/prod-migrate`                   | Guarded prod migration: verify backup exists and restores → run migration tool → smoke check                       | Only path allowed to touch prod schema                 |

## Built-in skills we rely on (don't reinvent)

- `/code-review` — before every merge to main
- `/verify` — end-to-end verification of a change
- `/security-review` — before exposing a new endpoint or auth change

## Adding a skill

1. `mkdir .claude/skills/<name>` and write `SKILL.md` (frontmatter: `name`, `description`; body: the procedure).
2. Add a row to the table above in the same commit.
3. A skill is a _procedure with teeth_ — it should state what blocks completion (e.g. "if gitleaks finds a hit, STOP and report"), not just suggest steps.
