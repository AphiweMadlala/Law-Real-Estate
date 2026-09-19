# Data architecture: current proposal vs. production integration

This is a **static structured dataset + build pipeline**, not a live
integration with LAW's own systems. That's an intentional, explicit design
decision for a proposal — not something to pretend otherwise — and it's
worth being precise about the boundary so a future production integration
is a swap-in, not a rewrite.

## Current (this proposal)

```
LAW's live website (lawrealestate.co.za)
        │  one-off migration/scrape (scripts run manually, this session)
        ▼
data/*.json   — structured, hand-auditable source of truth
  properties.json, agents.json, notable-sales.json, developments.json,
  offices.json, company.json
        │  scripts/build.js  (plain Node, no framework, no external deps)
        ▼
public/**.html + public/data/*.json  — fully static generated output
        │  served as-is
        ▼
Browser (public/js/*.js fetches public/data/*.json as a static "API")
```

Everything downstream of `data/*.json` — every template in `templates/`,
every script in `public/js/`, every CSS file — is written against that
JSON shape and nothing else. No template or script talks to
lawrealestate.co.za, scrapes anything at request time, or assumes how the
data got into `data/*.json` in the first place.

## Potential production integration

```
LAW CMS / listing feed / API (owned by LAW, real-time)
        │  sync job (scheduled or webhook-driven)
        ▼
data/*.json   — same shape as today
        │  scripts/build.js  — UNCHANGED
        ▼
public/**.html + public/data/*.json  — UNCHANGED
        │
        ▼
Browser  — UNCHANGED
```

The only thing that changes is what fills `data/*.json` and how often: a
one-off manual migration becomes a scheduled or event-driven sync from
LAW's actual listing source (their CMS, a feed like Property24/PropData's
IDX export, or a direct API if LAW has one). **Nothing below that line
needs to change** — the build script, every page template, and every
browser-side script are already decoupled from the acquisition method,
because they only ever read the same JSON shape regardless of where it
came from.

### What would actually need to be built for production

- The sync job itself (not written here — depends entirely on what LAW's
  real backend/CMS exposes, which is unknown at proposal stage).
- Turning `scripts/build.js` from "run manually" into "run on a schedule /
  on webhook" (a CI job, e.g. GitHub Actions on a cron trigger or a
  `repository_dispatch` from the sync job) — infrastructure, not frontend
  work.
- The archived-listing handling described in `docs/listing-lifecycle.md`,
  so listings the sync job removes from the active feed don't just
  disappear.
- Turning off `PROPOSAL_MODE` in `templates/config.js` (see that file's own
  comment) once this is genuinely LAW's production deployment.

### What would NOT need to change

- Any template in `templates/pages/`.
- Any file in `public/js/` or `public/css/`.
- The property card, gallery, filter, search, or detail-page markup and
  behavior audited in this hardening pass.

This separation is why the schema in `data/properties.json` was kept
deliberately close to the source site's own field names and structure
during migration (see `reports/full-listing-migration.md`) rather than
inventing a bespoke shape — a real LAW feed is more likely to resemble the
source site's own data model than an arbitrary one made up for this
proposal, which minimizes the translation layer a real sync job would need
to write.
