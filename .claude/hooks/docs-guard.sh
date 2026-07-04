#!/bin/bash
# PreToolUse hook: blocks `git commit` when architecture-significant files are
# staged without a matching documentation update. Executed by the Claude Code
# harness — the model cannot skip it.
#
# Tune SIGNIFICANT/DOCS per project. Escape hatch for genuinely doc-irrelevant
# changes: include [no-adr] in the commit command.

input=$(cat)
cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // empty' 2>/dev/null)

case "$cmd" in
  *"git commit"*) ;;
  *) exit 0 ;;
esac

[[ "$cmd" == *"[no-adr]"* ]] && exit 0

staged=$(git diff --cached --name-only 2>/dev/null) || exit 0

# Paths whose change implies an architectural / operational decision.
SIGNIFICANT='^(db/migrations/|migrations/|prisma/migrations/|alembic/|contracts/|shared/models/|\.github/workflows/|infra/|docker-compose|Dockerfile|Makefile|\.env\.example)'
# Files that count as documentation.
DOCS='^(CLAUDE\.md|AGENTS\.md|README\.md|docs/)'

sig=$(printf '%s\n' "$staged" | grep -E "$SIGNIFICANT")
doc=$(printf '%s\n' "$staged" | grep -E "$DOCS")

if [[ -n "$sig" && -z "$doc" ]]; then
  {
    echo "BLOCKED by docs-guard: architecture-significant files are staged with no documentation update:"
    printf '%s\n' "$sig"
    echo ""
    echo "Before committing, update and stage the relevant doc in this same commit:"
    echo "  - docs/DECISIONS.md  — new/changed architectural or operational decision (one ADR row)"
    echo "  - CLAUDE.md          — changed architecture rules, stack, commands, or lanes"
    echo "  - README.md          — changed setup, prerequisites, or commands"
    echo ""
    echo "If this change genuinely needs no doc update, re-run with [no-adr] in the commit command and say why in the commit body."
  } >&2
  exit 2
fi
exit 0
