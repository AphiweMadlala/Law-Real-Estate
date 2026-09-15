const { head, header, footer, breadcrumb, escapeHtml } = require("../partials");
const { formatPrice } = require("../format");
const { SITE_URL } = require("../config");

function developmentCard(d) {
  const img = d.images[0] || "/images/brand/placeholder.svg";
  return `<article class="showcase-card">
    <div class="showcase-card__media">
      <img src="${img}" alt="${escapeHtml(d.propertyType)} in ${escapeHtml(d.estateName)}, ${escapeHtml(d.city)}" loading="lazy" />
      <span class="showcase-card__ribbon">Sold Out</span>
    </div>
    <div class="showcase-card__body">
      <p class="showcase-card__price">${formatPrice(d.price, d.currency)}</p>
      <h3 style="font-size:1.05rem; margin:0.2em 0;">${escapeHtml(d.propertyType)} &mdash; ${escapeHtml(d.estateName)}</h3>
      <p class="muted" style="font-size:0.85rem;">${escapeHtml(d.city)}${d.bedrooms ? ` &middot; ${d.bedrooms} Bed` : ""}${d.bathrooms ? ` &middot; ${d.bathrooms} Bath` : ""}</p>
    </div>
  </article>`;
}

function developmentsPage(developments) {
  const bodyHtml = `${header("/developments.html")}
  <main id="main">
    <div class="page-head">
      <div class="container">
        ${breadcrumb([{ href: "/developments.html", label: "Developments" }])}
        <p class="eyebrow">Estate &amp; Development Track Record</p>
        <h1 style="font-size: var(--step-4); margin-bottom:0.3em;">Developments</h1>
        <p class="muted" style="max-width:64ch;">LAW runs a boutique new-developments division. The units below are units LAW has facilitated within named estates and complexes &mdash; every one shown here is <strong>already sold</strong>, presented as a track record rather than current stock. For live development opportunities, <a class="link-underline" href="/sell.html">get in touch</a> directly.</p>
      </div>
    </div>
    <section class="section--tight">
      <div class="container">
        <div class="grid grid--4">
          ${developments.map(developmentCard).join("")}
        </div>
      </div>
    </section>
  </main>
  ${footer()}`;

  const headHtml = head({
    title: "Developments & Estates — LAW Real Estate",
    description: "A showcase of estate and complex units LAW Real Estate has sold within named Johannesburg developments — a track record of past success.",
    canonical: `${SITE_URL}/developments.html`,
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

module.exports = developmentsPage;
