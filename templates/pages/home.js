const { head, header, footer } = require("../partials");
const { agentCardCompact, showcaseCard } = require("../format");
const { SITE_URL } = require("../config");

function homePage({ company, notableSales, developments, agents }) {
  const topStats = company.stats;
  const leadership = agents.filter((a) => (a.title || "").includes("Director")).concat(
    agents.filter((a) => (a.title || "").includes("Professional Practitioner")).slice(0, 5)
  ).slice(0, 3);

  const bodyHtml = `${header("/")}
  <main id="main">
    <section class="hero">
      <div class="hero__media">
        <img src="/images/properties/6751/1.jpg" alt="Grand double-storey residence in Cornwall Hill, Centurion, marketed by LAW Real Estate" width="1600" height="1000" />
      </div>
      <div class="hero__scrim"></div>
      <div class="container hero__content">
        <p class="eyebrow">Johannesburg &amp; Gauteng Residential Specialists</p>
        <h1>Teamwork from the team that works.</h1>
        <p>LAW Real Estate is a residential resale specialist across Johannesburg's southern suburbs, Sandton, Randburg and beyond &mdash; with a boutique luxury new-developments division and an agency built for the way property is marketed today.</p>
        <div class="hero__actions">
          <a href="/properties.html" class="btn btn-accent">Browse Properties</a>
          <a href="/sell.html" class="btn btn-outline" style="border-color:rgba(255,255,255,0.5); color:#fff;">Get a Free Appraisal</a>
        </div>
        <form class="search-panel" id="heroSearch">
          <div class="field">
            <label for="heroLocation">Location</label>
            <input list="suburbOptions" id="heroLocation" name="location" placeholder="Any suburb" autocomplete="off" />
            <datalist id="suburbOptions"></datalist>
          </div>
          <div class="field">
            <label for="heroStatus">Status</label>
            <select id="heroStatus" name="status">
              <option value="all">For Sale &amp; Rent</option>
              <option value="For Sale">For Sale</option>
              <option value="For Rent">For Rent</option>
            </select>
          </div>
          <div class="field">
            <label for="heroBeds">Bedrooms</label>
            <select id="heroBeds" name="beds">
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary">Search Properties</button>
        </form>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <div class="section-head__copy">
            <p class="eyebrow">Current Inventory</p>
            <h2>Featured Properties</h2>
            <p>A working selection of what's currently on LAW's books &mdash; from entry-level apartments to signature family homes.</p>
          </div>
          <a href="/properties.html" class="btn btn-outline">View All Properties</a>
        </div>
        <div class="grid grid--3" id="featuredGrid"></div>
      </div>
    </section>

    <section class="section section--stone">
      <div class="container">
        <div class="section-head">
          <div class="section-head__copy">
            <p class="eyebrow">Signature Listings</p>
            <h2>Luxury &amp; Estate Living</h2>
            <p>LAW's highest-value current mandates &mdash; premium architecture, security estates and generational homes.</p>
          </div>
        </div>
        <div class="grid grid--3" id="signatureGrid"></div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="grid" style="grid-template-columns: 1fr; gap: var(--space-2xl);">
          <div style="max-width: 62ch;">
            <p class="eyebrow">About LAW</p>
            <h2>The authority in residential resale, built for how property sells today.</h2>
            <p>LAW Real Estate positions itself as "agents of the future" &mdash; pairing traditional residential resale expertise with videography, social and digital marketing. The business is built around sole and exclusive mandates across Johannesburg's southern suburbs, Sandton, Randburg, Boksburg, Roodepoort, Midrand, Bedfordview and surrounds, with a dedicated boutique division for new developments.</p>
            <a href="/about.html" class="btn btn-outline" style="margin-top: 1rem;">More About LAW</a>
          </div>
        </div>
        <div class="stat-grid" style="margin-top: var(--space-xl);">
          ${topStats
            .map(
              (s) => `<div class="stat-block">
            <div class="stat-block__value">${s.value}</div>
            <div class="stat-block__label">${s.label}</div>
          </div>`
            )
            .join("")}
          <div class="stat-block">
            <div class="stat-block__value">4</div>
            <div class="stat-block__label">Offices across Johannesburg</div>
          </div>
          <div class="stat-block">
            <div class="stat-block__value">${agents.length}+</div>
            <div class="stat-block__label">Agents &amp; practitioners</div>
          </div>
        </div>
      </div>
    </section>

    <section class="section section--stone">
      <div class="container">
        <div class="section-head">
          <div class="section-head__copy">
            <p class="eyebrow">Track Record</p>
            <h2>Developments &amp; Estates</h2>
            <p>A showcase of estate homes and complex units LAW has sold within named developments &mdash; a track record, not current stock.</p>
          </div>
          <a href="/developments.html" class="btn btn-outline">View Developments</a>
        </div>
        <div class="grid grid--4">
          ${developments.slice(0, 4).map((d) => showcaseCard(d, { kind: "dev" })).join("")}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <div class="section-head__copy">
            <p class="eyebrow">Proven Results</p>
            <h2>Recent Notable Sales</h2>
            <p>A selection of LAW's highest-value concluded transactions across Johannesburg's premier suburbs.</p>
          </div>
          <a href="/notable-sales.html" class="btn btn-outline">View All Notable Sales</a>
        </div>
        <div class="grid grid--4">
          ${notableSales.slice(0, 4).map((n) => showcaseCard(n, { kind: "notable" })).join("")}
        </div>
      </div>
    </section>

    <section class="section section--stone">
      <div class="container">
        <div class="section-head">
          <div class="section-head__copy">
            <p class="eyebrow">Meet The Team</p>
            <h2>The People Behind Every Mandate</h2>
            <p>Directors, professional practitioners and a growing bench of candidate agents across four Johannesburg offices.</p>
          </div>
          <a href="/team.html" class="btn btn-outline">Meet The Full Team</a>
        </div>
        <div class="grid grid--3">
          ${leadership.map(agentCardCompact).join("")}
        </div>
      </div>
    </section>

    <section class="section--ink" style="padding-block: var(--space-2xl);">
      <div class="container text-center" style="max-width: 60ch; margin-inline:auto;">
        <p class="eyebrow" style="justify-content:center;">Thinking Of Selling?</p>
        <h2>Get a considered, data-backed appraisal from a team that markets property properly.</h2>
        <p class="muted">No obligation. Real photography, video and digital marketing from day one &mdash; not just a board on the lawn.</p>
        <div class="hero__actions" style="justify-content:center; margin-top: var(--space-md);">
          <a href="/sell.html" class="btn btn-accent">Sell With LAW</a>
          <a href="tel:+27116823865" class="btn btn-outline" style="border-color:rgba(251,248,242,0.4); color:#fff;">Call +27 (0)11 682 3865</a>
        </div>
      </div>
    </section>
  </main>
  ${footer()}
  <script type="module" src="/js/home.js"></script>`;

  const headHtml = head({
    title: "LAW Real Estate — Johannesburg Residential Property Specialists",
    description: "LAW Real Estate: residential resale specialists across Johannesburg's southern suburbs, Sandton and Randburg, with a boutique new-developments division. Teamwork from the team that works.",
    canonical: `${SITE_URL}/`,
    ogImage: `${SITE_URL}/images/properties/6751/1.jpg`,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "RealEstateAgent",
      name: "LAW Real Estate",
      url: `${SITE_URL}/`,
      telephone: "+27116823865",
      address: {
        "@type": "PostalAddress",
        streetAddress: "7 Van Beek Avenue, Glenanda",
        addressLocality: "Johannesburg",
        addressCountry: "ZA",
      },
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

module.exports = homePage;
