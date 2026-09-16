const { head, header, footer, breadcrumb, escapeHtml } = require("../partials");
const { propertyCard, withBase, telHref } = require("../format");
const { SITE_URL } = require("../config");

function agentDetailPage(agent, listings) {
  const waLink = agent.whatsappNumber
    ? `<a class="icon-btn icon-btn--whatsapp" href="https://wa.me/${encodeURIComponent(agent.whatsappNumber)}" target="_blank" rel="noopener">WhatsApp</a>`
    : "";
  const callLink = agent.mobile
    ? `<a class="icon-btn" href="${telHref(agent.mobile)}">Call ${escapeHtml(agent.mobile)}</a>`
    : "";
  const officeLink = agent.officePhone
    ? `<a class="icon-btn" href="${telHref(agent.officePhone)}">Office ${escapeHtml(agent.officePhone)}</a>`
    : "";
  const emailLink = agent.email
    ? `<a class="icon-btn" href="mailto:${encodeURIComponent(agent.email)}">${escapeHtml(agent.email)}</a>`
    : "";

  const bodyHtml = `${header("/team.html")}
  <main id="main">
    <div class="page-head">
      <div class="container">
        ${breadcrumb([{ href: "/team.html", label: "Our Team" }], agent.name)}
      </div>
    </div>
    <section class="section--tight">
      <div class="container" style="display:grid; gap: var(--space-xl); grid-template-columns: 1fr;">
        <div class="agent-profile-layout">
          <div style="aspect-ratio:3/4; overflow:hidden; border-radius: var(--radius-md); background: var(--stone);">
            <img src="${withBase(agent.photo)}" alt="${escapeHtml(agent.name)}" style="width:100%; height:100%; object-fit:cover; transform: scale(1.8); transform-origin: 50% 42%;" width="480" height="640" />
          </div>
          <div>
            <p class="eyebrow">${escapeHtml(agent.title || "Estate Agent")}</p>
            <h1 style="margin-bottom:0.4em;">${escapeHtml(agent.name)}</h1>
            <p class="muted">LAW Real Estate &mdash; Glenanda Head Office</p>
            <div class="contact-actions" style="margin-top: var(--space-md);">
              ${callLink}${waLink}${officeLink}${emailLink}
            </div>
          </div>
        </div>
      </div>
    </section>

    ${
      listings.length
        ? `<section class="section section--stone">
      <div class="container">
        <div class="section-head">
          <div class="section-head__copy">
            <p class="eyebrow">Current Mandates</p>
            <h2 style="font-size:var(--step-2);">${escapeHtml(agent.name)}'s Listings</h2>
          </div>
        </div>
        <div class="grid grid--3">${listings.map((p) => propertyCard(p)).join("")}</div>
      </div>
    </section>`
        : ""
    }
  </main>
  ${footer()}
  <style>
    @media (min-width: 720px) {
      .agent-profile-layout { grid-template-columns: 280px 1fr !important; gap: var(--space-xl); align-items:start; }
    }
  </style>`;

  const headHtml = head({
    title: `${agent.name} — ${agent.title || "Estate Agent"} | LAW Real Estate`,
    description: `Contact ${agent.name}, ${agent.title || "estate agent"} at LAW Real Estate, for property advice, valuations and current listings.`,
    canonical: `${SITE_URL}/team/${agent.slug}/`,
    ogImage: `${SITE_URL}${agent.photo}`,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Person",
      name: agent.name,
      jobTitle: agent.title || "Estate Agent",
      worksFor: { "@type": "Organization", name: "LAW Real Estate" },
      telephone: agent.mobile,
      email: agent.email,
      image: `${SITE_URL}${agent.photo}`,
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

module.exports = agentDetailPage;
