const { head, header, footer, breadcrumb, escapeHtml, withBase } = require("../partials");
const { formatPrice } = require("../format");
const { SITE_URL } = require("../config");

function notableCard(n) {
  const img = withBase(n.images[0] || "/images/brand/placeholder.svg");
  return `<article class="showcase-card">
    <div class="showcase-card__media">
      <img src="${img}" alt="${escapeHtml(n.propertyType)} in ${escapeHtml(n.suburb)}, ${escapeHtml(n.city)}" loading="lazy" />
      <span class="showcase-card__ribbon">Sold</span>
    </div>
    <div class="showcase-card__body">
      <p class="showcase-card__price">${formatPrice(n.price, n.currency)}</p>
      <h3 style="font-size:1.05rem; margin:0.2em 0;">${escapeHtml(n.propertyType)} &mdash; ${escapeHtml(n.suburb)}</h3>
      <p class="muted" style="font-size:0.85rem;">${escapeHtml(n.city)}${n.bedrooms ? ` &middot; ${n.bedrooms} Bed` : ""}${n.bathrooms ? ` &middot; ${n.bathrooms} Bath` : ""}</p>
    </div>
  </article>`;
}

function notableSalesPage(notableSales) {
  const bodyHtml = `${header("/notable-sales.html")}
  <main id="main">
    <div class="page-head">
      <div class="container">
        ${breadcrumb([], "Notable Sales")}
        <p class="eyebrow">Proven Results</p>
        <h1 style="font-size: var(--step-4); margin-bottom:0.3em;">Recent Notable Sales</h1>
        <p class="muted" style="max-width:64ch;">A selection of LAW's highest-value concluded transactions, drawn from the agency's own published sales record &mdash; from R7.5 million to R17 million.</p>
      </div>
    </div>
    <section class="section--tight">
      <div class="container">
        <div class="grid grid--4">
          ${notableSales.map(notableCard).join("")}
        </div>
      </div>
    </section>
    <section class="section section--ink">
      <div class="container text-center" style="max-width:60ch; margin-inline:auto;">
        <h2 style="font-size:var(--step-2);">Considering a sale in this bracket?</h2>
        <p class="muted">LAW's marketing approach &mdash; professional photography, video and digital promotion &mdash; is built for exactly this kind of property.</p>
        <a href="${withBase("/sell.html")}" class="btn btn-accent" style="margin-top:1rem;">Sell With LAW</a>
      </div>
    </section>
  </main>
  ${footer()}`;

  const headHtml = head({
    title: "Recent Notable Sales — LAW Real Estate",
    description: "A selection of LAW Real Estate's highest-value concluded property sales across Johannesburg's premier suburbs.",
    canonical: `${SITE_URL}/notable-sales.html`,
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

module.exports = notableSalesPage;
