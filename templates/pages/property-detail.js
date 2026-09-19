const { head, header, footer, breadcrumb, escapeHtml } = require("../partials");
const { formatPrice, propertyCard, withBase, slugify, telHref, normalizeDescription, truncateAtWord, genuineFeatures } = require("../format");
const { SITE_URL } = require("../config");

// Priority: same suburb, then same city, then same property type as a last
// resort. That last tier can pull in listings from a completely different
// city — geographically nothing like "related" — so callers get told
// whether any *local* match (same suburb/city) actually contributed, and
// use that to decide between the "Related Properties" and "Similar
// Properties" heading rather than always claiming a local relationship.
function relatedProperties(current, all) {
  const others = all.filter((p) => p.reference !== current.reference);
  const sameSuburb = others.filter((p) => p.suburb === current.suburb);
  const sameCity = others.filter((p) => p.city === current.city && p.suburb !== current.suburb);
  const sameType = others.filter(
    (p) => p.propertyType === current.propertyType && p.city !== current.city
  );
  const localRefs = new Set([...sameSuburb, ...sameCity].map((p) => p.reference));

  const combined = [...sameSuburb, ...sameCity, ...sameType];
  const seen = new Set();
  const items = [];
  for (const p of combined) {
    if (!seen.has(p.reference)) {
      seen.add(p.reference);
      items.push(p);
    }
    if (items.length >= 3) break;
  }

  const hasLocalMatch = items.some((p) => localRefs.has(p.reference));
  return { items, hasLocalMatch };
}

// Some genuine source listings have no photography at all (verified at
// migration time, not a download failure — see reports/full-listing-
// migration.md). Rather than rendering a collapsed, empty gallery grid,
// show one deliberate LAW-branded panel so the page never looks broken.
function galleryFallbackHtml() {
  return `<div class="gallery gallery--empty">
    <div class="gallery__fallback" role="img" aria-label="Photography unavailable for this property">
      <img src="${withBase("/images/brand/placeholder.svg")}" alt="" width="480" height="360" loading="eager" />
    </div>
  </div>`;
}

function galleryHtml(images, title, reference) {
  if (!images || images.length === 0) return galleryFallbackHtml();
  const shown = images.slice(0, 5);
  return `<div class="gallery">
    ${shown
      .map((src, i) => {
        const isLast = i === shown.length - 1 && images.length > shown.length;
        return `<a href="${withBase(src)}" data-index="${i}" aria-label="Open photo ${i + 1} of ${images.length} in fullscreen gallery" data-event="property_gallery_open" data-property-ref="${escapeHtml(reference)}">
          <img src="${withBase(src)}" alt="${escapeHtml(title)} — photo ${i + 1} of ${images.length}" loading="${i === 0 ? "eager" : "lazy"}" ${i === 0 ? 'width="960" height="720"' : ""} />
          ${isLast ? `<span class="gallery__more">+${images.length - shown.length} more</span>` : ""}
        </a>`;
      })
      .join("")}
    ${images.slice(5).map((src, i) => `<a href="${withBase(src)}" data-index="${i + 5}" style="display:none;" aria-label="Open photo ${i + 6} of ${images.length} in fullscreen gallery" data-event="property_gallery_open" data-property-ref="${escapeHtml(reference)}"><img src="${withBase(src)}" alt="${escapeHtml(title)} — photo ${i + 6}" loading="lazy" /></a>`).join("")}
  </div>`;
}

function agentCardHtml(agent, reference) {
  // Some property-agent records (e.g. the head-office contact) have a real
  // name/mobile/email but no stable agent ID, photo, or profile page — that
  // is still genuinely useful contact info and should render, just without
  // a profile link or photo. Only fall back to the generic message when
  // there's truly nothing to contact.
  const hasContactInfo = agent && agent.name && (agent.mobile || agent.email || agent.whatsappNumber);
  if (!hasContactInfo) {
    return `<div class="agent-card"><p class="muted">Contact LAW Real Estate for more information on this property.</p></div>`;
  }

  const refAttr = reference ? ` data-property-ref="${escapeHtml(reference)}"` : "";
  const waLink = agent.whatsappNumber
    ? `<a class="icon-btn icon-btn--whatsapp" href="https://wa.me/${agent.whatsappNumber}" target="_blank" rel="noopener" data-event="property_whatsapp_click"${refAttr}>WhatsApp</a>`
    : "";
  const callLink = agent.mobile
    ? `<a class="icon-btn" href="${telHref(agent.mobile)}" data-event="property_phone_click"${refAttr}>Call</a>`
    : "";
  const emailLink = agent.email
    ? `<a class="icon-btn" href="mailto:${agent.email}" data-event="property_email_click"${refAttr}>Email</a>`
    : "";

  const photoHtml = agent.photo
    ? `<img src="${withBase(agent.photo)}" alt="${escapeHtml(agent.name)}" loading="lazy" width="84" height="84" />`
    : `<span class="agent-card__photo-fallback" aria-hidden="true">${escapeHtml((agent.name || "?").trim().charAt(0))}</span>`;

  // A real profile page only exists for agents with a stable id (build.js
  // generates /team/<slug>/ from data/agents.json, keyed by id) — never
  // link to a page that doesn't exist.
  const nameHtml = agent.id
    ? `<a class="agent-card__name-link" href="${withBase(`/team/${slugify(agent.name)}/`)}">${escapeHtml(agent.name)}</a>`
    : escapeHtml(agent.name);

  return `<div class="agent-card">
    <div class="agent-card__photo-wrap">${photoHtml}</div>
    <div>
      <p class="agent-card__name">${nameHtml}</p>
      ${agent.title ? `<p class="agent-card__title">${escapeHtml(agent.title)}</p>` : ""}
      <div class="agent-card__actions">
        ${callLink}${waLink}${emailLink}
      </div>
    </div>
  </div>`;
}

function propertyDetailPage(property, allProperties) {
  const specs = [];
  if (property.bedrooms) specs.push({ label: "Bedrooms", value: property.bedrooms });
  if (property.bathrooms) specs.push({ label: "Bathrooms", value: property.bathrooms });
  if (property.garages) specs.push({ label: "Garages", value: property.garages });
  if (property.erfSize) specs.push({ label: "Erf Size", value: property.erfSize });
  if (property.floorSize) specs.push({ label: "Floor Size", value: property.floorSize });

  const features = genuineFeatures(property.features);
  const { items: related, hasLocalMatch } = relatedProperties(property, allProperties);
  const relatedHeading = hasLocalMatch ? "Related Properties" : "Similar Properties";
  const relatedEyebrow = hasLocalMatch ? "You May Also Like" : "Elsewhere In Our Portfolio";
  const primaryAgent = property.agents && property.agents[0];
  const title = `${property.title} | Ref #${property.reference} | LAW Real Estate`;
  const cleanedDescription = normalizeDescription(property.description);
  const description = truncateAtWord((cleanedDescription || "").replace(/\n+/g, " "), 155);

  const bodyHtml = `${header("/properties.html")}
  <main id="main">
    <div class="container" style="padding-top: var(--space-md);">
      ${breadcrumb([{ href: "/properties.html", label: "Properties" }], `${property.suburb}, ${property.city}`)}
    </div>
    <div class="container">
      ${galleryHtml(property.images, property.title, property.reference)}
    </div>

    <section class="section--tight">
      <div class="container" style="display:grid; gap: var(--space-xl); grid-template-columns: 1fr;">
        <div style="display:grid; gap: var(--space-xl); grid-template-columns: 1fr;" class="detail-layout">
          <div>
            <div class="cluster" style="justify-content:space-between; gap:1rem;">
              <div>
                <span class="badge badge--active">${escapeHtml(property.status)}</span>
                <h1 style="margin-top:0.5em; font-size: var(--step-3);">${escapeHtml(property.title)}</h1>
                <p class="muted">${escapeHtml(property.suburb)}, ${escapeHtml(property.city)}</p>
              </div>
              <div style="text-align:right;">
                <p style="font-family:var(--font-display); font-size:var(--step-3); margin:0;">${formatPrice(property.price, property.currency, property.priceOnApplication)}</p>
                <p class="reference-tag">Ref&nbsp;#${escapeHtml(property.reference)}</p>
              </div>
            </div>

            <div class="specs-strip">
              ${specs
                .map(
                  (s) => `<div class="spec-item"><span class="spec-item__value">${s.value}</span><span class="spec-item__label">${s.label}</span></div>`
                )
                .join("")}
            </div>

            <div class="prose">
              <h2 style="font-size:var(--step-2);">About This Property</h2>
              ${(cleanedDescription || "Contact LAW Real Estate for the full description of this property.")
                .split(/\n\n+/)
                .map((para) => `<p>${escapeHtml(para).replace(/\n/g, "<br />")}</p>`)
                .join("")}
            </div>

            ${
              features.length
                ? `<div style="margin-top: var(--space-lg);">
              <h3 style="font-size:var(--step-1);">Key Features</h3>
              <ul class="feature-grid">${features.map((f) => `<li>${escapeHtml(f)}</li>`).join("")}</ul>
            </div>`
                : ""
            }
          </div>

          <aside class="detail-sidebar">
            <div class="stack" style="gap: var(--space-md); position:sticky; top: 6.5rem;">
              ${agentCardHtml(primaryAgent, property.reference)}
              <div class="office-card">
                <h3 style="font-size:1rem;">Enquire About This Property</h3>
                <p class="muted" style="font-size:0.85rem;">Quote reference <strong>#${escapeHtml(property.reference)}</strong> when you get in touch.</p>
                <div class="contact-actions">
                  <a href="tel:+27116823865" class="btn btn-primary btn-sm" data-event="property_phone_click" data-property-ref="${escapeHtml(property.reference)}">Call Office</a>
                  <a href="mailto:laura@lawrealestate.co.za?subject=Enquiry%20-%20Ref%20${encodeURIComponent(property.reference)}" class="btn btn-outline btn-sm" data-event="property_email_click" data-property-ref="${escapeHtml(property.reference)}">Email Enquiry</a>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>

    ${
      related.length
        ? `<section class="section section--stone">
      <div class="container">
        <div class="section-head">
          <div class="section-head__copy">
            <p class="eyebrow">${relatedEyebrow}</p>
            <h2 style="font-size:var(--step-2);">${relatedHeading}</h2>
          </div>
        </div>
        <div class="grid grid--3">${related.map((p) => propertyCard(p)).join("")}</div>
      </div>
    </section>`
        : ""
    }
  </main>
  ${footer()}
  <script type="module" src="${withBase("/js/gallery.js")}"></script>
  <style>
    @media (min-width: 960px) {
      .detail-layout { grid-template-columns: 1fr 340px !important; align-items: start; }
    }
  </style>`;

  const headHtml = head({
    title,
    description: description || `${property.title} — view details, photos and agent contact on LAW Real Estate.`,
    canonical: `${SITE_URL}/property/${property.reference}/`,
    ogImage: property.images[0] ? `${SITE_URL}${property.images[0]}` : undefined,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Residence",
      name: property.title,
      description: description,
      url: `${SITE_URL}/property/${property.reference}/`,
      image: property.images.map((i) => `${SITE_URL}${i}`),
      address: {
        "@type": "PostalAddress",
        addressLocality: property.suburb,
        addressRegion: property.city,
        addressCountry: "ZA",
      },
      numberOfRooms: property.bedrooms || undefined,
    },
  });

  return `<!doctype html>
<html lang="en-ZA">
<head>
${headHtml}
</head>
<body>
${bodyHtml}
</body>
</html>
`;
}

module.exports = propertyDetailPage;
