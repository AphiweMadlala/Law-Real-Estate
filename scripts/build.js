#!/usr/bin/env node
// Static site build — plain Node, zero external dependencies (npm registry
// access is blocked in this environment). Reads /data/*.json, writes fully
// static HTML into /public.

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data");
const PUBLIC_DIR = path.join(ROOT, "public");

const { slugify } = require("../templates/format");
const { SITE_URL } = require("../templates/config");

function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, name), "utf8"));
}

function writeFile(relPath, content) {
  const full = path.join(PUBLIC_DIR, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf8");
}

function main() {
  const company = readJson("company.json");
  const offices = readJson("offices.json");
  const properties = readJson("properties.json");
  const notableSales = readJson("notable-sales.json");
  const developments = readJson("developments.json");
  const agents = readJson("agents.json").map((a) => ({ ...a, slug: a.slug || slugify(a.name) }));

  // 1. Mirror data into /public/data so the frontend can fetch it as a
  //    static JSON "API" (swap for real endpoints later without touching
  //    any page markup).
  fs.mkdirSync(path.join(PUBLIC_DIR, "data"), { recursive: true });
  for (const [name, data] of Object.entries({
    "company.json": company,
    "offices.json": offices,
    "properties.json": properties,
    "notable-sales.json": notableSales,
    "developments.json": developments,
    "agents.json": agents,
  })) {
    fs.writeFileSync(path.join(PUBLIC_DIR, "data", name), JSON.stringify(data, null, 2));
  }

  // 2. Hand-authored top-level pages
  const homePage = require("../templates/pages/home");
  const propertiesPage = require("../templates/pages/properties");
  const developmentsPage = require("../templates/pages/developments");
  const notableSalesPage = require("../templates/pages/notable-sales");
  const teamPage = require("../templates/pages/team");
  const sellPage = require("../templates/pages/sell");
  const aboutPage = require("../templates/pages/about");
  const contactPage = require("../templates/pages/contact");

  writeFile("index.html", homePage({ company, notableSales, developments, agents }));
  writeFile("properties.html", propertiesPage());
  writeFile("developments.html", developmentsPage(developments));
  writeFile("notable-sales.html", notableSalesPage(notableSales));
  writeFile("team.html", teamPage(agents));
  writeFile("sell.html", sellPage(company));
  writeFile("about.html", aboutPage(company));
  writeFile("contact.html", contactPage(offices, company));

  // 3. Generated property detail pages
  const propertyDetailPage = require("../templates/pages/property-detail");
  for (const property of properties) {
    const html = propertyDetailPage(property, properties);
    writeFile(`property/${property.reference}/index.html`, html);
  }

  // 4. Generated agent detail pages
  const agentDetailPage = require("../templates/pages/agent-detail");
  for (const agent of agents) {
    const listings = properties.filter((p) =>
      (p.agents || []).some((a) => a.id === agent.id)
    );
    const html = agentDetailPage(agent, listings);
    writeFile(`team/${agent.slug}/index.html`, html);
  }

  // 5. sitemap.xml + robots.txt
  const urls = [
    "/",
    "/properties.html",
    "/developments.html",
    "/notable-sales.html",
    "/team.html",
    "/sell.html",
    "/about.html",
    "/contact.html",
    ...properties.map((p) => `/property/${p.reference}/`),
    ...agents.map((a) => `/team/${a.slug}/`),
  ];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE_URL}${u}</loc></url>`).join("\n")}
</urlset>
`;
  writeFile("sitemap.xml", sitemap);
  writeFile("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);

  console.log(`Built ${urls.length} pages.`);
  console.log(`  Properties: ${properties.length}`);
  console.log(`  Agents: ${agents.length}`);
  console.log(`  Notable sales: ${notableSales.length}`);
  console.log(`  Developments: ${developments.length}`);
}

main();
