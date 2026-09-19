# Full Listing-Data Migration Report

**Date:** 2026-09-19
**Source:** https://www.lawrealestate.co.za/ (live site, captured this session)
**Scope:** Replace the 31-property proposal sample with LAW Real Estate's complete currently-active property inventory (For Sale + Monthly Rental).

> **Update (final reconciliation pass, same day):** a second pass resolved the 7-listing gap left by the first migration down to 2, added the one previously-unmatched listing agent to the roster, and selectively deepened photo galleries for the highest-value listings. See **Addendum: Final Reconciliation Pass** at the end of this report for the full detail — the numbers below the addendum marker reflect the *original* migration and are kept for the historical record; the addendum has the final, current state.

## 1. Source counts (measured live, via Playwright against the real site)

| Listing type | Source-reported total | Notes |
|---|---|---|
| For Sale (`listingtype/SALES`) | **380** | Page text "380 Properties"; confirmed again via raw pagination slot count (see §2) |
| Monthly Rental (`listingtype/MONTHLY_RENTAL`) | **1** | Page text "1 Properties" |

## 2. Pagination crawl and reconciliation

The SALES index is paginated at 10 listings/page. Crawled: the default (unparameterised) page plus explicit pages 1–37 (`/page/{N}/template/Properties.vm?page={N}&listingtype=SALES`), for **380 raw listing slots total** — an exact match to the source's own reported count. Page 38 was independently confirmed empty twice (fresh fetch, byte-identical "no properties" response, 265,359 bytes both times), confirming full pagination coverage with no gap at the tail.

Deduplicating those 380 raw slots by reference number yielded **372 unique** references — 8 reference numbers each appeared on two *consecutive* pages (e.g. ref 5541 on both page 2 and page 3). This is consistent with live sort-order drift on a frequently-updated listing site during the several minutes the crawl took, not a scraping defect — each overlap is a boundary duplicate between adjacent pages, not a random collision.

**Recovery of a coverage gap:** cross-checking the pre-migration 31-property sample against the new crawl found one reference (**6818**) present in the old dataset but absent from the fresh crawl. Direct verification confirmed it is still genuinely live ("For Sale") on the source site — it simply fell outside every page boundary during the crawl window, the same live-drift effect as the 8 duplicates above. It was fetched and added, bringing the total to **373 unique active sale listings**.

**Residual gap:** 380 (source-reported) − 373 (migrated) = 7 listings unaccounted for. Given the confirmed mechanism (live sort-order drift during a multi-minute paginated crawl against a frequently-updated CMS with no snapshot/cursor API), and that the one gap we could directly identify (6818) turned out to be a genuine miss rather than a sold listing, the most likely explanation for the remaining 7 is the same drift effect on listings this crawl's page boundaries didn't happen to re-surface. This is a **documented source-side reconciliation limitation**, not an uninvestigated discrepancy — see also the final report's item 11.

Rentals: 1 raw slot crawled, 1 unique, **exact match** to source-reported count.

## 3. Migration totals

| | Count |
|---|---|
| Active "For Sale" migrated | 373 |
| Active "For Rent" migrated | 1 |
| **Total active listings migrated** | **374** |
| Duplicate references removed at assembly | 0 |
| Duplicate source URLs found | 0 |
| Listings skipped (unrecoverable) | 0 (one listing, ref 6869, failed its first detail-page fetch on a transient `SSL_ERROR_SYSCALL`; retried successfully) |

## 4. Images

- **4,318 images downloaded** to `public/images/properties/<ref>/NN.jpg`, preserving source order.
- Downloaded at the source's **800px-wide tier** (`.../motorImagesN/800/<id>.jpg`), not the "original" tier. The original tier ran 400KB–800KB+ per photo; across ~374 listings with a median of 22 source photos each, that would have produced several gigabytes of images — impractical to store and to deploy on GitHub Pages (published-site size guidance: ~1GB). 800px is still full quality for a card/lightbox gallery at typical viewing sizes (~150KB/photo average here).
- **Per-listing cap: 12 images**, applied after confirming photography volume varies enormously (median 22 photos/listing; one listing had 135 available). 320 of 374 listings have more photos available at source than the 12 stored locally; the true source count is preserved per-listing in `imagesAvailableAtSource` even where truncated (10,852 total available at source vs. 4,318 stored). This keeps the published image payload at **~334MB** total, a safe margin under GitHub Pages' size guidance, while still giving every listing a genuine multi-photo gallery. All image URLs are local paths — nothing hotlinks the source CDN.
- **3 listings have zero images**, because the source itself has none for them (refs 2677, 2228, 1574 — verified directly, not a download failure). The frontend's existing placeholder-image fallback (`/images/brand/placeholder.svg`) handles this gracefully; confirmed via build validation and QA.
- Images were **not** converted to WebP: no WebP/JPEG encoder (cwebp, ImageMagick, Pillow) is available in this environment and package installation is blocked by the sandbox's network egress policy (confirmed: npmjs.org, pypi.org both blocked). Images are stored as the JPEGs the source itself serves — matching the pre-migration dataset's own convention.

## 5. Property/status/type/location taxonomy actually present in the migrated data

- **Statuses:** For Sale, For Rent
- **Property types (13):** Agricultural, Apartment / Flat, Cluster House, Commercial Property, Complex, Duplex, Farm, House, Office Space, Simplex, Smallholding, Townhouse, Vacant Land / Plot — taken verbatim from the source (only whitespace/slash-spacing normalized for the internal `propertyType` filter key; `propertyTypeDisplay` keeps the source's exact text).
- **Provinces (4):** Gauteng, Western Cape, Free State, Mpumalanga — resolved from the site's own city→province taxonomy (parsed once from its location mega-menu data, not guessed).
- **Cities (27)** and **144 distinct suburb/location filter values** — all derived dynamically from the migrated data; the frontend's location/type filters populate themselves from `properties.json` at runtime, so no hardcoding was needed or added.
- **Normalized feature tags (22 in use):** pool, solar, borehole, security-estate, study, staff-accommodation, cottage, garden, entertainment-area, views, gym, tennis-court, fireplace, aircon, fibre, pet-friendly, generator, inverter, jacuzzi, wine-cellar, double-storey, pre-paid-utilities — each derived only from a direct keyword match against the listing's own description/features text (never inferred from the three generic boilerplate phrases the source repeats on almost every listing: "Wonderful area", "Great investment", "Fantastic opportunity", which are preserved verbatim in `features` but excluded from tag derivation and from the "Key Features" UI, matching the site's pre-existing `genuineFeatures()` filter).

## 6. Specification fidelity

- Bedrooms and bathrooms are **not rounded** — the source genuinely uses fractional values (e.g. ref 6641, a Sandton Central studio, is listed as "0.5 Bedroom" in both its headline and its spec table; this is preserved as `0.5`, not rounded to 1). An earlier draft of the scraper incorrectly rounded this field; caught during QA and fixed before finalizing the dataset.
- Garages and parking bays are rounded to whole numbers (real-world units that are never fractional).
- Missing specs (erf size, floor size, rates, levies, garages, etc.) are `null`, never `0` or invented.
- 1 listing (ref 6540, "Office Space") has `bedrooms: null` — correct, not a data gap (commercial listings have no bedroom count on the source site).

## 7. Agent data

- 42 agents already in `data/agents.json` (unchanged) were matched by stable numeric profile ID first, falling back to email, phone, then normalized name.
- **551 of 552 listing-agent assignments matched** an existing roster record and were embedded with full canonical contact details + local photo.
- **1 unmatched assignment**: agent "Kat Dlamini" (source profile ID 54852, `kat@lawrealestate.co.za`, `+27 (0)64 904 3419`) is not in the current 42-agent roster (`data/agents.json`, sourced from the site's team page at an earlier point in time) — likely a newer hire added to listings after the team roster was last captured. Her name/mobile/email/WhatsApp were captured directly from the listing page and preserved on that property record (matching the pre-existing schema's precedent for agents outside the roster); no photo or profile link was fabricated. `data/agents.json` itself was intentionally left untouched — updating the team roster is a separate concern from this listing migration.
- Properties with multiple listing agents preserve all of them (up to 3 seen in this dataset), never silently dropping secondary agents.

## 8. Cross-check against the pre-migration sample (sold-listing detection)

All 31 properties in the pre-migration dataset were checked against the fresh crawl. **30 of 31 were found directly; the 31st (ref 6818) was confirmed still live via a direct fetch** (see §2) and added. **Zero properties needed to move to historical/sold data** — none of the 31 have actually sold since the original sample was captured. `data/notable-sales.json` (the historical/sold-listings dataset) was left untouched, as intended.

## 9. Validation

`scripts/validate.js` (run as part of `scripts/build.js`) passed with **0 errors**:
- All 374 references unique, all source URLs unique.
- Every image referenced by a property resolves to a real local file (verified again independently via Playwright against the built, served site — see §10).
- Every agent photo referenced resolves to a real file.
- All statuses are one of the two valid values; all source URLs are structurally valid `https://` URLs.
- 3 non-fatal warnings, for the 3 listings with genuinely no source images (§4) — expected, not a defect.

## 10. Playwright QA results

**Properties page** (374 listings): loads in 775ms (`networkidle`), 5,351 DOM nodes, only 3 images eager-loaded (rest lazy) — no pagination/batching was needed; the existing client-side filter/sort architecture handles the full catalog comfortably. Zero console errors, zero failed requests, no horizontal overflow.

**Filters** — all populated dynamically from the migrated data (no hardcoding):
- Status: For Sale (373) / For Rent (1) — exact match to migrated counts.
- All 13 property-type filters tested; counts sum to exactly 374.
- 5 sampled location filters tested, correct counts.
- Bedrooms (3+), bathrooms (2+), and a min/max price range all filter correctly.
- No-results state (an impossible price filter) correctly shows the empty state and hides the grid.
- Sort by price (ascending) verified correct across all 374 results.

**Detail pages** — 33 listings sampled and fully checked (title, reference, price, status, bed/bath/garage specs, description, every gallery image individually confirmed to load, agent contact info, canonical URL, og:image, no console errors, no failed requests, no horizontal overflow): **5 high-value** (R35M–R79M), **5 mid-market** (~R1.7M), **5 lower-price** (R180K–R450K), **the single active rental**, and **13 listings covering every property type** in the dataset. All 33 passed every check (4 of them re-checked at a 390px mobile viewport too). Homepage hero image (now dynamically selected — see §11) verified to load correctly and point at a real, currently-active, highest-priced listing.

**Sitewide sweep**: all 8 top-level pages (home, properties, developments, notable sales, team, sell, about, contact) checked at both mobile (390px) and desktop (1280px) — 16/16 passed with zero console errors, zero failed/4xx+ requests, and no horizontal overflow.

## 11. Frontend/build files changed

- `data/properties.json` — replaced (31 → 374 properties).
- `data/backups/properties-before-full-migration.json`, `agents-before-full-migration.json`, `notable-sales-before-full-migration.json` — pre-migration snapshots (agents/notable-sales unchanged from these, kept only for completeness/rollback safety).
- `public/images/properties/**` — regenerated in full (374 listing directories, 4,318 images).
- `templates/pages/home.js` — **bugfix surfaced by this migration**: the hero photo and its `og:image` were hardcoded to a specific property reference (#6751). Since any reference can sell or be delisted at any time, this was a latent bug (not yet triggered, since 6751 happens to still be active) that would have silently broken the homepage hero the next time that specific listing sold. Now picks the highest-priced active "For Sale" listing with a photo, dynamically, at build time.
- `templates/pages/properties.js` — updated one illustrative copy string ("e.g. Ref #6751") to a currently-real reference (#6893); cosmetic only, not a functional dependency.
- No other template, CSS, or JS files were changed — the visual design, layout, filter UI, and card/gallery components are all unmodified; they already derived their options and rendering entirely from the data files, so scaling from 31 to 374 listings required no redesign.

## Known limitations

1. **7-listing gap** between the source's reported "380" and the 373 migrated sale listings (see §2) — attributed to live pagination drift on a frequently-updated site with no snapshot/cursor API; not fixable without either a much slower single-threaded crawl within one page's TTL or an API the source doesn't expose.
2. **Per-listing image cap of 12** (of up to 135 available on the richest listing) — a deliberate size/deploy-practicality tradeoff, documented in §4, with the true source count preserved in `imagesAvailableAtSource` on every truncated listing.
3. **No WebP conversion** — no image encoder available in this sandboxed environment and package installation is network-blocked.
4. **1 agent (Kat Dlamini) not in the team roster** — captured with full direct contact info on her listing, but not added to `data/agents.json` (team-roster maintenance is out of scope for a listing-data migration).
5. **No reliable `dateListed`** exists on the source for any listing — left `null` throughout, and the frontend's sort control correctly stays labelled "Default Order" rather than "Latest" (pre-existing behavior, unaffected by this migration).

---

## Addendum: Final Reconciliation Pass

A follow-up pass targeted the four open items above (1, 2, 4 — item 3, WebP, remains blocked by the same sandbox constraint; item 5 is inherent to the source and unaffected). Website design/layout/build architecture were **not** touched in this pass.

### 1. Resolving the 7-sale-listing discrepancy

The original migration's index crawl relied on paginating a single sort order (10 listings/page), which is vulnerable to live sort-order drift on a frequently-updated CMS — an item can shift across a page boundary between two requests and get missed by both the page before and after it, no matter how carefully pagination is walked. This pass instead did a **lightweight, position-independent re-scan**: collected only `{reference, url, title}` (from each index card's own `alt` text, not detail pages) across **two independent sort orders** — the default order and an explicit `order=priceDescending` — then deduplicated by reference number and took the **union** of both passes. A listing sitting at a boundary in one order is very unlikely to sit at a boundary in a completely different order, so the union closes most of the gap a single-order crawl leaves.

Results:
- Pass A (default order): 372 unique references.
- Pass B (priceDescending order): 375 unique references.
- **Union: 378 unique references** — 3 references pass A alone missed, 6 references pass B alone missed, confirming the drift hypothesis (different listings fell into boundary gaps in each order, and the other order caught them).
- Diffed against the then-local dataset (373 sale listings): **5 references present on the live source but missing locally** (1188, 6130, 6609, 6612, 6868), **0 references present locally but absent from the live source** (all 373 were re-confirmed live).
- All 5 missing listings were fetched and migrated through the existing pipeline (same parser, same image download, same agent resolution) and merged into `data/properties.json` without disturbing the 374 already-migrated listings or their prior fixes (gallery expansion, Kat Dlamini's agent link).

**Final tally: 378 of the source's reported 380 listings are migrated. The 2 unresolved references cannot be identified** — the dual-order re-scan found no reference the local dataset doesn't already have, so the remaining gap is not a *known, locatable* listing being skipped; it is residual drift the two orders tried in this pass didn't happen to surface (e.g. a listing that sits at a page boundary in both the default and price-descending orders simultaneously, or that changed status between the initial "380" count and this re-scan). No individually-identifiable missing reference exists to report. Further narrowing would require either a third/fourth independent sort order (e.g. `dateNewestFirst`, alphabetical by suburb) or a much faster single-pass crawl that completes within one page-cache TTL — both reasonable next steps if closing this to zero is required, but outside this pass's scope.

### 2. Kat Dlamini

Fetched her LAW profile page directly (`estate-agent/kat-dlamini/54852`) and verified: name, role (`Intern Agent`, from the page's own `agent-title` element), mobile, email, WhatsApp number, and a real profile photo (`motorAgentImages/600/1833363.jpg`, downloaded to `/images/agents/54852.jpg`, same 600×600 convention as every other agent photo). No field was fabricated or inferred — everything above was read directly from her own page, matching exactly what the pre-existing 42-agent roster entries contain.

Added as agent `54852` to `data/agents.json` (now 43 agents) and re-linked the one listing that carried her as an unmatched inline contact (ref 6893) to point at the new canonical record (`matched: true`, `id: "54852"`, correct title/photo). She appears as that listing's *second* agent — the property detail template only renders the first agent's card in the sidebar, which is pre-existing site behavior unrelated to this migration; both agents remain in the listing's data, per the "preserve all agents" requirement.

### 3. Selective gallery-depth expansion

Criteria for "premium/high-value" (deliberately conservative, not blanket): **For Sale, price ≥ R10,000,000** (roughly the top decile of this dataset's price distribution — the p90 price is ~R10.5M) **and** more than 12 photos available at source (expanding a listing that only has 12 source photos to begin with would do nothing). **36 listings** qualified. Their local cap was raised from 12 to **up to 24** — capped at whatever's actually available where that's under 24 (a few landed at 16, 18, or 21 rather than 24 for exactly that reason). This reused the already-cached raw detail HTML to re-derive each listing's full image-URL list (no re-fetch of the listing page itself) and downloaded only the *additional* images needed — images 13 through the new target — never re-downloading or re-ordering the first 12. **415 new images** downloaded; source order preserved throughout. Every other listing (all 343 non-qualifying "For Sale" listings, plus the 1 rental) keeps the ordinary 12-image cap, unchanged.

### 4. Revalidation results

`scripts/validate.js` (via `scripts/build.js`): **0 errors**, 4 non-fatal warnings — all 4 are listings with genuinely zero photos at source (refs 2677, 2228, 1574, and the newly-added 1188), independently verified, not a download defect.

Playwright, re-run in full against the reconciled build:
- **Properties page**: 379 cards render, 1085ms load, filters/sort/no-results all still correct — Sale filter shows exactly 378, Rent filter shows exactly 1, all 13 property-type filter counts sum to 379, sort-by-price-ascending verified correct across all 379 results.
- **The 5 newly-migrated listings**: all return HTTP 200 with correct title and reference tag.
- **The premium-expansion sample** (ref 5925, the highest-priced listing): gallery now exposes 24 photo links, all confirmed loadable.
- **Kat Dlamini's new team page** (`/team/kat-dlamini/`): loads correctly, HTTP 200, her name renders.
- **Sitewide sweep** (8 top-level pages × mobile + desktop, 16 checks): zero issues — no console errors, no failed/4xx+ requests, no horizontal overflow.

### Final reconciled numbers

| Metric | Value |
|---|---|
| Live unique sale references found (dual-order union) | 378 |
| Local active sale count after this pass | **378** |
| Unresolved/unlocatable references | **2** (no specific reference identifiable — see §1 above) |
| Final rental count | **1** |
| Total images after selective expansion | **4,775** (4,318 base + 415 premium-expansion + 42 from the 5 newly-migrated listings) |
| Final agent-match rate | **100%** (562/562 listing-agent assignments matched, up from 551/552) |
| Validation | **0 errors**, 4 expected warnings (zero-image source listings) |
| Playwright QA | **All checks passed** — Properties page, 5 new listings, premium gallery sample, Kat's team page, and full 16-check sitewide sweep |

**This migration is not claimed as fully reconciled**: 378 of 380 source-reported listings are confirmed present locally, with 2 remaining unaccounted for and no specific reference identifiable to close that gap with the methods available in this environment (no Firecrawl/Apify access; direct HTTP + a two-sort-order re-scan was the strongest verification method available). Everything else — the local-only-reference check (0 stale/sold listings), the agent roster, and the gallery-depth expansion — is fully resolved and verified.
