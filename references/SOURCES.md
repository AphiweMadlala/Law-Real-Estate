# Sources & Extraction Notes

This is an independent, unaffiliated **design proposal** for LAW Real Estate. It does not modify, replace, or connect to LAW Real Estate's live website, CMS, or hosting. All factual content (company details, listings, agents, offices, prices, photography) was extracted from LAW Real Estate's own public website and is reproduced here for the purpose of demonstrating a redesign concept.

## Primary source

- **https://www.lawrealestate.co.za/** — LAW Real Estate's live website (Webbox/Velocity-templated `.vm` CMS). Captured 2026-09-15.

## Extraction method

Direct HTTP requests (`curl`, desktop Chrome user-agent) against the live site's public HTML, followed by regex/DOM-pattern extraction into structured JSON. This was necessary because:

- The sandboxed `WebFetch` tool's default fetcher was blocked by the site's WAF (406 "Not Acceptable" responses) on most inner pages, while direct `curl` requests from this environment succeeded (HTTP 200) consistently.
- No Firecrawl or Apify MCP tool was available in this session (searched via tool discovery; neither was found). No dedicated Playwright/browser-automation MCP tool was available either. `npm install` is blocked by this environment's organisation-level network egress policy (`registry.npmjs.org` not in the allowlist — confirmed via the proxy status endpoint), so a Playwright browser session could not be provisioned for the audit stage. The audit and data extraction were therefore done via raw HTTP + HTML parsing, which is faithful to the live markup and, unlike an LLM-summarised fetch, does not risk paraphrasing or dropping numeric data (prices, room counts, reference numbers).

## Pages audited (Stage 1)

| Page | URL |
|---|---|
| Homepage | https://www.lawrealestate.co.za/ |
| About / company info | https://www.lawrealestate.co.za/about-us |
| Sitemap (full URL inventory, 1,657 URLs) | https://www.lawrealestate.co.za/sitemap.xml |
| Properties for sale (all) | https://www.lawrealestate.co.za/template/Properties.vm/listingtype/SALES/order/priceDescending |
| Properties for rent (all) | https://www.lawrealestate.co.za/template/Properties.vm/listingtype/MONTHLY_RENTAL/order/priceDescending |
| "New Developments" showroom | https://www.lawrealestate.co.za/template/Properties.vm/showroomid/7/order/priceDescending/listingtype/ALL |
| "Recent Notable Sales" showroom | https://www.lawrealestate.co.za/template/Properties.vm/showroomid/8/order/priceDescending/listingtype/ALL |
| Sold properties (recent) | https://www.lawrealestate.co.za/template/Properties.vm/listingtype/SOLD/order/dateNewestFirst |
| Team / agent roster | https://www.lawrealestate.co.za/template/TeamDynamic.vm |
| Individual agent profiles (42 fetched) | https://www.lawrealestate.co.za/estate-agent/&lt;slug&gt;/&lt;id&gt; |
| Contact — Glenanda (HQ) | https://www.lawrealestate.co.za/template/ContactUs.vm |
| Contact — Glenvista | https://www.lawrealestate.co.za/template/ContactUs2.vm |
| Contact — Boskruin | https://www.lawrealestate.co.za/template/Boskruin.vm |
| Contact — Illovo Junction | https://www.lawrealestate.co.za/template/IllovoJunction.vm |
| "I Have A Property To Sell" | https://www.lawrealestate.co.za/template/HavePropertyToSell.vm |
| "I Need A Property To Buy" | https://www.lawrealestate.co.za/template/NeedPropertyToBuy.vm |
| 36 individual property detail pages | https://www.lawrealestate.co.za/property/&lt;slug&gt; (see data/properties.json for full list) |
| 10 individual notable-sale property pages | see data/notable-sales.json |
| 8 individual "development" showroom property pages | see data/developments.json |

## Key audit findings

- The site runs on a legacy Velocity-template (`.vm`) CMS (Webbox). Navigation is a deep multi-level suburb mega-menu; the sitemap alone lists **1,197 individual property URLs**, almost entirely "for sale" (only 1 rental URL appears in the sitemap — rental stock is currently very thin or listed dynamically outside the sitemap).
- The **"New Developments"** showroom (`showroomid/7`) currently contains 8 properties, **all marked "sold"**. Nothing in this showroom is a currently-available multi-unit development opportunity — the proposal's Developments page presents these honestly as a **completed track record**, not as active inventory, per the brief's explicit instruction not to present sold-out developments as available.
- The **"Recent Notable Sales"** showroom (`showroomid/8`) contains 10 high-value sold properties (R7.5m–R17m), which map directly onto the requested Notable Sales / track-record section.
- Company statistics ("1,000+ sole and exclusive mandates", "R5.7 billion+ portfolio value") are stated on the homepage without further breakdown or citation; reproduced verbatim with source noted, not amplified.
- The team page lists **42 people** with real names, direct mobile numbers, direct emails, headshots, and a role/title (`Director, Professional Practitioner in Real Estate`, `Professional Practitioner in Real Estate`, `Intern Agent`, or `Candidate`) sourced from each person's individual profile page. One agent (Candice De Sousa) has no title published on their profile page — recorded as `null`.
- Four physical offices are published with distinct street addresses (Glenanda/HQ, Glenvista, Boskruin, Illovo Junction); only the Glenanda HQ publishes a direct phone/fax/email — the other three only publish an address. Recorded as `null` for the unavailable fields rather than invented.
- A separate, differently-hosted site (`lawrealestatecpt.co.za`) is referenced on the homepage for Cape Town / Atlantic Seaboard business; no Cape Town listings appear in this domain's sitemap, so none were migrated into this proposal (avoids fabricating Cape Town inventory).

## Property selection for this proposal

36 property detail pages were fetched to build a diverse working set; **31 were confirmed still "For Sale" at capture time** (5 had sold between being listed in the sitemap and being fetched — normal for a live, frequently-updated site) and were kept as the proposal's active inventory. See `data/properties.json`. Selection targeted:

- a spread of price points (R450,000 – R27,000,000)
- a spread of property types (House, Apartment/Flat, Townhouse, Cluster House, Duplex, Simplex, Complex, Vacant Land/Plot, Farm)
- a spread of locations (Alberton, Johannesburg southern suburbs, Sandton, Bedfordview, Randburg, Roodepoort, Boksburg, Midrand, Benoni, Krugersdorp, Centurion, and one rural listing in Parys, Free State)

Original LAW reference numbers and source URLs are preserved on every record (`reference`, `sourceUrl` fields).

## Images

Property, agent, and notable-sale photography was downloaded directly from LAW's own image CDN (`motorImages*` / `motorAgentImages` buckets on `lawrealestate.co.za`) at 800px width and stored locally under `public/images/`, rather than hotlinking — per the brief's instruction to avoid fragile external references. A handful of individual image fetches failed transiently (SSL resets) and were either retried successfully or the JSON simply references fewer images for that one record; no image URLs are fabricated.

## Instagram (secondary source)

`https://www.instagram.com/lawrealestate` was checked directly. Instagram's public profile page requires an authenticated session to expose post data (the server-rendered HTML returns only the app shell); no Apify MCP integration was available in this session (searched via tool discovery, not found), and `npm install playwright`/browser automation for a logged-out scrape was blocked by the same network egress policy noted above. **No Instagram post data was extracted.** Per the brief's own priority ordering ("primary source" = the main website; Instagram is secondary/directional only), the design direction was built entirely from LAW's own listing photography, branding, and site copy, which was itself abundant and sufficient. This limitation is disclosed here rather than any Instagram content being invented.

## What was deliberately not fabricated

- No agent biography/credentials beyond name, title, office phone/mobile/email and photo.
- No company history narrative beyond what the homepage/about page states.
- No made-up statistics, awards, or press mentions.
- No Cape Town listings, no rental listings beyond the one that exists, no "currently available" developments.
