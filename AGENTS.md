# AGENTS.md

Instructions for AI coding agents working in this repository.

**Read `CLAUDE.md` — it is the single operating manual.** This file exists because
`AGENTS.md` is the cross-tool convention (Codex, Cursor, Copilot, etc. read it);
we keep one source of truth rather than two drifting copies.

The short version, for any agent in any tool:

1. **Never commit to `main`.** Worktree branch per task: `<type>/<title>`, conventional commits.
2. **Tests always** — written with the change, run before every commit.
3. **Verify end-to-end before claiming done** — exercise the flow, report what you observed.
4. **Never touch prod** — no direct prod DB writes, no hand-rolled migrations, backup before any migration.
5. **Never handle raw secrets** — env-var names only; flag and rotate anything pasted in a conversation.
6. **Stay in your lane** — directory ownership is mapped in `CLAUDE.md` §8.

Team agent definitions live in `.claude/agents/`. House skills are indexed in `SKILLS.md`.
