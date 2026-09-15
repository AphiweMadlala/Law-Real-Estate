const { head, header, footer, breadcrumb, escapeHtml } = require("../partials");
const { SITE_URL } = require("../config");

function officeCard(office) {
  return `<div class="office-card">
    <h3>${escapeHtml(office.name)}</h3>
    <address>${escapeHtml(office.address)}</address>
    <div class="contact-actions">
      ${office.phone ? `<a class="icon-btn" href="tel:${office.phone.replace(/[^\d+]/g, "")}">Call</a>` : ""}
      ${office.email ? `<a class="icon-btn" href="mailto:${office.email}">Email</a>` : ""}
      ${!office.phone && !office.email ? `<span class="muted" style="font-size:0.85rem;">Address published; direct line not listed &mdash; reach this office via Glenanda HQ.</span>` : ""}
    </div>
  </div>`;
}

function contactPage(offices, company) {
  const bodyHtml = `${header("/contact.html")}
  <main id="main">
    <div class="page-head">
      <div class="container">
        ${breadcrumb([{ href: "/contact.html", label: "Contact" }])}
        <p class="eyebrow">Get In Touch</p>
        <h1 style="font-size: var(--step-4); margin-bottom:0.3em;">Contact &amp; Offices</h1>
        <p class="muted" style="max-width:60ch;">Four offices across Johannesburg. For a fast response, the Glenanda head office handles all general enquiries.</p>
      </div>
    </div>
    <section class="section--tight">
      <div class="container">
        <div class="grid grid--2" style="margin-bottom: var(--space-xl);">
          <div class="office-card" style="border-color: var(--accent);">
            <span class="badge badge--active" style="margin-bottom:0.6em;">Head Office</span>
            <h3>Glenanda</h3>
            <address>${escapeHtml(company.headOffice.address)}</address>
            <div class="contact-actions">
              <a class="icon-btn" href="tel:${company.headOffice.phone.replace(/[^\d+]/g, "")}">Call ${company.headOffice.phone}</a>
              <a class="icon-btn icon-btn--whatsapp" href="https://wa.me/${company.headOffice.mobile.replace(/[^\d]/g, "")}" target="_blank" rel="noopener">WhatsApp</a>
              <a class="icon-btn" href="mailto:${company.headOffice.email}">Email</a>
            </div>
          </div>
        </div>
        <h2 style="font-size: var(--step-2); margin-bottom: var(--space-md);">Other Offices</h2>
        <div class="grid grid--3">
          ${offices.filter((o) => o.id !== "glenanda").map(officeCard).join("")}
        </div>
      </div>
    </section>
  </main>
  ${footer()}`;

  const headHtml = head({
    title: "Contact LAW Real Estate — Offices Across Johannesburg",
    description: "Contact LAW Real Estate at the Glenanda head office, or find the Glenvista, Boskruin and Illovo Junction office addresses.",
    canonical: `${SITE_URL}/contact.html`,
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

module.exports = contactPage;
