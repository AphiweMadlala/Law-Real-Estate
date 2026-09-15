const { head, header, footer, breadcrumb } = require("../partials");
const { SITE_URL } = require("../config");

function sellPage(company) {
  const bodyHtml = `${header("/sell.html")}
  <main id="main">
    <div class="page-head">
      <div class="container">
        ${breadcrumb([{ href: "/sell.html", label: "Sell With LAW" }])}
        <p class="eyebrow">For Sellers</p>
        <h1 style="font-size: var(--step-4); margin-bottom:0.3em;">Sell With LAW</h1>
        <p class="muted" style="max-width:64ch;">"${company.tagline}" &mdash; ${company.positioning}</p>
      </div>
    </div>

    <section class="section--tight">
      <div class="container">
        <div class="stat-grid">
          ${company.stats
            .map(
              (s) => `<div class="stat-block"><div class="stat-block__value">${s.value}</div><div class="stat-block__label">${s.label}</div></div>`
            )
            .join("")}
          <div class="stat-block"><div class="stat-block__value">4</div><div class="stat-block__label">Johannesburg offices</div></div>
          <div class="stat-block"><div class="stat-block__value">1</div><div class="stat-block__label">Dedicated new-developments division</div></div>
        </div>
      </div>
    </section>

    <section class="section section--stone">
      <div class="container">
        <div class="grid grid--3">
          <div>
            <h3 style="font-size:var(--step-1);">Marketing built for how buyers actually look</h3>
            <p>LAW positions itself as "agents of the future" &mdash; professional photography, videography and social/digital marketing on every mandate, not just a board on the lawn.</p>
          </div>
          <div>
            <h3 style="font-size:var(--step-1);">Residential resale expertise</h3>
            <p>LAW's focus is residential resale across Johannesburg's southern suburbs, Sandton, Randburg and surrounds &mdash; a deep, local specialism rather than a generalist national franchise.</p>
          </div>
          <div>
            <h3 style="font-size:var(--step-1);">A proven, high-value track record</h3>
            <p>From R450,000 apartments to sales well over R15 million, LAW's <a class="link-underline" href="/notable-sales.html">Notable Sales</a> record spans the full spectrum of Johannesburg residential property.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section--ink">
      <div class="container text-center" style="max-width:60ch; margin-inline:auto;">
        <p class="eyebrow" style="justify-content:center;">Get Started</p>
        <h2>Request a no-obligation property appraisal</h2>
        <p class="muted">Speak directly to the Glenanda head office, or reach out to an agent local to your suburb via the <a href="/team.html" style="color:#fff; text-decoration:underline;">team page</a>.</p>
        <div class="hero__actions" style="justify-content:center; margin-top: var(--space-md);">
          <a href="tel:+27116823865" class="btn btn-accent">Call +27 (0)11 682 3865</a>
          <a href="mailto:laura@lawrealestate.co.za?subject=Property%20Appraisal%20Request" class="btn btn-outline" style="border-color:rgba(251,248,242,0.4); color:#fff;">Email LAW</a>
          <a href="https://wa.me/27833651733" target="_blank" rel="noopener" class="btn btn-outline" style="border-color:rgba(251,248,242,0.4); color:#fff;">WhatsApp</a>
        </div>
      </div>
    </section>
  </main>
  ${footer()}`;

  const headHtml = head({
    title: "Sell With LAW Real Estate",
    description: "Considering selling? LAW Real Estate combines residential resale expertise with professional photography, video and digital marketing. Request a no-obligation appraisal.",
    canonical: `${SITE_URL}/sell.html`,
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

module.exports = sellPage;
