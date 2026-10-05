# Generated challenge data

This folder is populated by `npm run batch:ingest`.

Expected outputs:

- `people.json` — grounded agent profiles derived only from LinkedIn + Instagram
- `failures.json` — candidates that failed scraping/validation
- `manifest.json` — run metadata and source URLs
- `raw/` — optional raw snapshots only when `SAVE_RAW_SOURCES=true`

Do not hand-edit generated profile traits. Re-run the pipeline so evidence remains reproducible.
