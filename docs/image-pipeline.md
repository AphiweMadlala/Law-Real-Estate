# Image pipeline: current state and recommended production upgrade

## Current state (this proposal)

Every property image is stored locally at a single resolution: the
source site's own 800px-wide JPEG tier (`public/images/properties/<ref>/
NN.jpg`), chosen and documented during migration (see
`reports/full-listing-migration.md` §4) as the best tradeoff between
quality and total repository size for ~378 listings. There is no smaller
or larger locally-stored variant of any image.

**Deliberately not done in this pass:** adding a `srcset`/`sizes` attribute
to any `<img>` would require either (a) multiple real resolutions to point
it at, which don't exist locally, or (b) fabricating resolution numbers
that don't correspond to real files — both explicitly out of scope. A
`srcset` listing one URL is pointless; it isn't added here.

**Done in this pass:** the three places property images render — card
grids (`templates/format.js` / `public/js/render.js` → `propertyCard()`),
the detail-page gallery (`templates/pages/property-detail.js` →
`galleryHtml()`), and the lightbox (`public/js/gallery.js`) — are already
each a single, shared function per surface, not copy-pasted markup. Adding
a real `srcset` later is a localized change to those two or three
functions, not a site-wide rewrite. Explicit `width`/`height` was added
where the image is large and eager-loaded (the property-card thumbnail,
the first/hero gallery image) so the browser can reserve layout space
before the image loads.

## Recommended production pipeline

When real multi-resolution assets are available (either re-processing the
current library or sourcing higher-resolution originals), generate three
tiers per photo and wire them through `srcset`:

| Tier | Width | Used for |
|---|---|---|
| Card | ~480–600px | Property grid cards, related-property cards, homepage Featured/Signature |
| Detail/gallery | ~1000–1200px | The in-page gallery grid on a property's own page |
| Fullscreen | ~1800–2400px | The lightbox main stage, where a photo can occupy most of a large desktop display |

Example markup shape once those exist (illustrative — not implemented,
since the underlying files don't exist):

```html
<img
  src="/images/properties/6751/01-800.jpg"
  srcset="
    /images/properties/6751/01-480.jpg 480w,
    /images/properties/6751/01-800.jpg 800w,
    /images/properties/6751/01-1200.jpg 1200w"
  sizes="(min-width: 860px) 33vw, 100vw"
  loading="lazy" width="480" height="360" alt="…" />
```

Format: keep JPEG as the guaranteed-compatible fallback; adding WebP (or
AVIF) alongside via a `<picture>` element with a JPEG `<img>` fallback is a
reasonable further optimization once resolution tiers exist, but is a
separate decision from resolution tiering itself — don't couple the two
into one migration.

Generation: any standard image pipeline (e.g. `sharp` in a Node build
step, or an image CDN with on-the-fly resizing) can produce the three
tiers above from a single high-resolution source per photo. This
environment currently has no image-processing library available (no
ImageMagick/Pillow/sharp, and package installation is network-blocked —
see `reports/full-listing-migration.md` for the same constraint noted
against WebP conversion), so this is a note for whoever builds the
production pipeline with proper tooling access, not something achievable
in the current sandbox.
