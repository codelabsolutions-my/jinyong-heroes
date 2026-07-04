---
name: prod-migrate
description: The only sanctioned path for touching the production database — verified backup, migration tool, smoke check, rollback path. Use for every prod schema or bulk-data change.
---

Perform a production database change safely. This procedure is the direct result of past incidents: hand-rolled migration scripts causing schema drift, ingestion pointed at prod, and no backup at migration time.

**Preconditions — verify, don't assume:**

- The change is expressed as a migration in the project's migration tool (Alembic / Prisma migrate). If it's a raw SQL script or an ad-hoc Python script: STOP — convert it to a proper migration first.
- The same migration has already run cleanly against local/staging on a recent copy of prod schema. If not, do that first.
- The prod credential comes from an env-var/secret-store reference. If the user tries to paste a connection string into chat: refuse it, have them put it in the environment, and remind them to rotate it if it was already pasted.

**Procedure:**

1. **Backup:** take a dump of the affected database. Store it OUTSIDE any git repo (state the path). Verify it restores into a scratch database — an unverified backup is not a backup.
2. **Announce the plan:** what the migration does, expected row/table impact, and the rollback path (down-migration or restore-from-dump). Get explicit user confirmation for destructive operations (drops, truncates, type narrowing).
3. **Migrate:** run the migration tool against prod. Capture full output.
4. **Smoke check:** run 3–5 read queries proving the app's critical paths still work (key tables row counts, a representative app query, the API health endpoint against prod).
5. **Record:** append to `docs/DECISIONS.md` or the migration log — date, migration ID, backup location, verification output.

On any failure mid-procedure: stop, report exactly where it failed and what state prod is in, and present the rollback options. Never improvise forward-fixes on prod without confirmation.
