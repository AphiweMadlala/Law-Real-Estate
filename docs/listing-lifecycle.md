# Listing lifecycle: Sold / Off Market / removed

**Status: documented architecture, not implemented against live data.** No
active listing in `data/properties.json` has been converted or removed as
part of this. This describes how a *future* production build should behave
so link equity and externally-shared property URLs survive a listing
selling or being withdrawn — a gap in the current proposal build, which is
fine for a proposal but would be a real problem in production.

## The problem with the current build

`scripts/build.js` calls `clearGeneratedOutput()` before every build, which
deletes `public/property/**` entirely and regenerates it from scratch,
purely from whatever is currently in `data/properties.json`. That's the
right behavior for the proposal (it guarantees no stale "ghost" page for a
listing that's since left the sample), but it has a real consequence: the
moment a reference number is removed from `properties.json`, its URL
(`/property/<ref>/`) stops being generated at all, and the next deploy
turns it into a hard 404. Anyone who bookmarked it, shared it, or has it
indexed loses that link permanently.

## Target statuses

Beyond the two currently in use (`For Sale`, `For Rent`), a production
feed should be able to express:

| Status | Meaning | Appears in active listing filters/grids? | Page behavior |
|---|---|---|---|
| `For Sale` | current | yes | normal |
| `For Rent` | current | yes | normal |
| `Sold` | recently sold, page kept alive | **no** | "This property has sold" + related properties |
| `Off Market` | withdrawn, not sold (expired mandate, owner changed mind, etc.) | **no** | "This property is no longer available" + related properties |

## Recommended architecture

1. **Keep the active dataset active-only.** `data/properties.json` continues
   to hold only `For Sale` / `For Rent` listings — this is what the
   Properties page, its filters, and the homepage's automatic Featured/
   Signature selection all read from, and none of those should ever surface
   a sold or withdrawn listing. No change needed here.

2. **Add an archive dataset.** A new `data/archived-listings.json` (shape:
   the same property record, plus `archivedStatus: "Sold" | "Off Market"`
   and `archivedDate`) holds every listing that has left the active set.
   When a listing leaves `properties.json`, it is *moved* to this file, not
   deleted outright — exactly the same principle already applied to
   genuinely sold stock in `data/notable-sales.json`, generalized to cover
   every listing rather than only the curated high-value ones.

3. **Generate a page for every reference the site has ever used**, not just
   the currently-active ones:
   ```js
   const archived = readJson("archived-listings.json"); // new file, [] today
   for (const property of properties) { /* existing active loop, unchanged */ }
   for (const listing of archived) {
     writeFile(`property/${listing.reference}/index.html`,
       archivedPropertyPage(listing, properties));
   }
   ```
   `clearGeneratedOutput()` still wipes `public/property/` first — that stays
   correct, because now *both* loops above regenerate the full set on every
   build (active + archived), so no reference that's ever been used produces
   a 404 as long as it's recorded in one of the two files.

4. **`archivedPropertyPage()`** reuses the existing `propertyDetailPage()`
   layout (header, breadcrumb, footer — no new page template needed) but
   replaces the price/status badge, gallery-driven CTA, and enquiry block
   with a plain state:
   - Badge reads `Sold` (already styled — see `.badge--sold` in
     `components.css`, defined but currently unused since nothing in the
     active dataset is ever sold) or `Off Market`.
   - Headline: *"This property has sold"* or *"This property is no longer
     available."* (the copy the task itself specifies).
   - The original photos, description, and specs may still render below
     that (there is no reason to hide them — a sold listing's photos are
     still legitimate marketing material for the agent), or may be
     suppressed, depending on what LAW actually wants shown for a sold
     property; the proposal doesn't currently need this decision.
   - The existing `relatedProperties()` helper in
     `templates/pages/property-detail.js` runs against the *active* list
     (`properties`, passed in as the second argument), so "you may also
     like" naturally points visitors at live stock instead of another dead
     listing.
   - `<meta name="robots">`: while `PROPOSAL_MODE` is on this is `noindex`
     like everything else; in a real production launch a sold listing page
     is a reasonable candidate for `noindex` even after the site goes live
     generally, since it's not a page you want ranking for buyer search
     intent — a judgment call for whoever owns SEO at that point, not
     decided here.

5. **`sitemap.xml`** should **not** list archived/sold URLs (they're
   reachable and intentionally kept alive, but they're not content worth
   asking search engines to (re-)crawl) — same principle already applied to
   `404.html` being excluded from the sitemap.

## Why this doesn't touch anything today

Every one of the ~378 active listings currently in `data/properties.json`
was independently reconciled against the live source this session (see
`reports/full-listing-migration.md`) and confirmed still active. There is
nothing to archive right now, so `data/archived-listings.json` does not
exist yet and `scripts/build.js` has not been changed to read one — adding
that file and the loop above is a small, additive change to make the first
time a listing actually needs to move out of the active set, not something
to build speculatively against zero real data today.
