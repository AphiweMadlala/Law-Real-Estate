const { head, header, footer, breadcrumb } = require("../partials");
const { SITE_URL } = require("../config");

function aboutPage(company) {
  const bodyHtml = `${header("/about.html")}
  <main id="main">
    <div class="page-head">
      <div class="container">
        ${breadcrumb([{ href: "/about.html", label: "About" }])}
        <p class="eyebrow">About LAW</p>
        <h1 style="font-size: var(--step-4); margin-bottom:0.3em;">The Authority In Residential Resale</h1>
      </div>
    </div>
    <section class="section--tight">
      <div class="container">
        <div class="prose" style="max-width: 68ch;">
          <p style="font-size: var(--step-1); color: var(--ink);">${company.tagline}</p>
          <p>${company.positioning}</p>
          <h3 style="font-size:var(--step-1); margin-top:2em;">Where LAW Operates</h3>
          <ul>
            ${company.focus.map((f) => `<li>${f}</li>`).join("")}
          </ul>
          <h3 style="font-size:var(--step-1); margin-top:2em;">By The Numbers</h3>
          <p class="muted" style="font-size:0.85rem;">Figures as published on LAW Real Estate's own website; not independently audited.</p>
        </div>
        <div class="stat-grid" style="margin-top: var(--space-lg);">
          ${company.stats
            .map(
              (s) => `<div class="stat-block"><div class="stat-block__value">${s.value}</div><div class="stat-block__label">${s.label}</div></div>`
            )
            .join("")}
        </div>
      </div>
    </section>
    <section class="section section--stone">
      <div class="container text-center" style="max-width:60ch; margin-inline:auto;">
        <h2 style="font-size:var(--step-2);">Want to work with LAW?</h2>
        <p class="muted">Whether you're buying, selling, or just want to talk through the market, the team is one call away.</p>
        <div class="hero__actions" style="justify-content:center; margin-top:1rem;">
          <a href="/team.html" class="btn btn-primary">Meet The Team</a>
          <a href="/contact.html" class="btn btn-outline">Contact &amp; Offices</a>
        </div>
      </div>
    </section>
  </main>
  ${footer()}`;

  const headHtml = head({
    title: "About LAW Real Estate",
    description: "LAW Real Estate: residential resale specialists across Johannesburg's southern suburbs, Sandton and Randburg, with a boutique new-developments division.",
    canonical: `${SITE_URL}/about.html`,
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

module.exports = aboutPage;
