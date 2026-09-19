const { head, header, footer, withBase } = require("../partials");
const { SITE_URL } = require("../config");

// Served by GitHub Pages automatically for any unmatched URL on this site
// (a project Pages site looks for /404.html at the published root — see
// scripts/build.js, which writes this to public/404.html). Also doubles as
// the landing point for a future "listing no longer available" redirect —
// see docs/listing-lifecycle.md for how a sold/off-market listing should
// eventually degrade instead of hard-404ing.
function notFoundPage() {
  const bodyHtml = `${header()}
  <main id="main">
    <section class="section text-center" style="padding-block: var(--space-3xl) var(--space-2xl);">
      <div class="container" style="max-width: 48ch; margin-inline: auto;">
        <p class="eyebrow" style="justify-content:center;">404</p>
        <h1 style="font-size: var(--step-4);">Page not found</h1>
        <p class="muted" style="font-size: var(--step-1);">The property or page you're looking for may no longer be available.</p>
        <div class="hero__actions" style="justify-content:center; margin-top: var(--space-lg);">
          <a href="${withBase("/properties.html")}" class="btn btn-accent">Explore Properties</a>
          <a href="${withBase("/")}" class="btn btn-outline">Return Home</a>
        </div>
      </div>
    </section>
  </main>
  ${footer()}`;

  const headHtml = head({
    title: "Page Not Found — LAW Real Estate",
    description: "The page you're looking for may no longer be available. Browse LAW Real Estate's current property listings instead.",
    canonical: `${SITE_URL}/404.html`,
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

module.exports = notFoundPage;
