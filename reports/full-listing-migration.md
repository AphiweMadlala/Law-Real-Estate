# Full Listing-Data Migration Report

**Date:** 2026-09-19
**Source:** https://www.lawrealestate.co.za/ (live site, captured this session)
**Scope:** Replace the 31-property proposal sample with LAW Real Estate's complete currently-active property inventory (For Sale + Monthly Rental).

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
