---
name: verify-data
description: Data-quality gate for any ingestion, scrape, backfill, or LLM-extraction run. Validates counts, required fields, and domain invariants before data may be promoted anywhere. Use after every pipeline run.
---

Validate the dataset named in the argument (table, file, or pipeline output). This gate exists because manual eyeballing of scraped/LLM-extracted data was the single most recurring pain in past projects — wrong parties, duplicate winners, broken images were all caught by humans clicking around. Machines catch them here instead.

Run four layers; report actual numbers at each:

1. **Volume:** row count vs. expected (source count, previous run, or stated target). Flag deviations >2% — silent partial ingestion is a known failure mode.
2. **Completeness:** required-field null/empty rates per column. For URL/image fields, sample N=20 and verify they actually resolve (HTTP 200, correct content-type) — "the image URL exists" is not "the image displays".
3. **Domain invariants:** the project-specific rules from CLAUDE.md §2.6 (e.g. exactly one winner per seat per election; every claim has a source; enum fields only contain known values; no duplicate natural keys). Write these as queries and run them.
4. **Spot-check against source:** pick 5 random records, fetch their original source, and compare field-by-field. For LLM-extracted data this is mandatory — extraction confidence is not correctness.

**Output:** a PASS/FAIL verdict per layer with counts. On any FAIL: park the violating rows in the review queue (or a `_quarantine` table/file), never delete them and never let them proceed. The dataset may be promoted (staging → prod) only when all four layers pass or the user explicitly accepts the flagged exceptions.
