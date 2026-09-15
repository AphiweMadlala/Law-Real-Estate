const { head, header, footer, breadcrumb } = require("../partials");
const { agentCardCompact } = require("../format");
const { SITE_URL } = require("../config");

function teamPage(agents) {
  const order = { "Director": 0, "Professional Practitioner": 1, "Intern Agent": 2, "Candidate": 3 };
  const rank = (a) => {
    const t = a.title || "";
    for (const key of Object.keys(order)) if (t.includes(key)) return order[key];
    return 4;
  };
  const sorted = [...agents].sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));

  const bodyHtml = `${header("/team.html")}
  <main id="main">
    <div class="page-head">
      <div class="container">
        ${breadcrumb([{ href: "/team.html", label: "Our Team" }])}
        <p class="eyebrow">Meet LAW</p>
        <h1 style="font-size: var(--step-4); margin-bottom:0.3em;">Our Team</h1>
        <p class="muted" style="max-width:60ch;">${agents.length} directors, professional practitioners and candidate agents across LAW's four Johannesburg offices.</p>
      </div>
    </div>
    <section class="section--tight">
      <div class="container">
        <div class="grid grid--4">
          ${sorted.map(agentCardCompact).join("")}
        </div>
      </div>
    </section>
  </main>
  ${footer()}`;

  const headHtml = head({
    title: "Our Team — LAW Real Estate Agents",
    description: "Meet the directors, professional practitioners and candidate agents of LAW Real Estate across Glenanda, Glenvista, Boskruin and Illovo Junction.",
    canonical: `${SITE_URL}/team.html`,
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

module.exports = teamPage;
