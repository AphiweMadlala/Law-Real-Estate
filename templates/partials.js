// Shared HTML partials used by every generated page.
// Plain Node (CommonJS), no external dependencies.

const { BASE_PATH } = require("./config");

// Prefix a root-relative path ("/", "/properties.html", "/images/x.jpg") with
// BASE_PATH so it resolves correctly when the site is served from a subpath
// (e.g. GitHub Pages project sites: /Law-Real-Estate/...). NAV_LINKS below
// stays unprefixed so activeHref comparisons stay simple; withBase() is only
// applied at render time.
function withBase(path) {
  if (/^https?:\/\//.test(path) || path.startsWith("mailto:") || path.startsWith("tel:")) {
    return path;
  }
  if (path === "/") return `${BASE_PATH}/`;
  return `${BASE_PATH}${path}`;
}

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/properties.html", label: "Properties" },
  { href: "/developments.html", label: "Developments" },
  { href: "/sell.html", label: "Sell With LAW" },
  { href: "/notable-sales.html", label: "Notable Sales" },
  { href: "/team.html", label: "Our Team" },
  { href: "/about.html", label: "About" },
  { href: "/contact.html", label: "Contact" },
];

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function head({ title, description, canonical, ogImage, structuredData }) {
  const sd = structuredData
    ? `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`
    : "";
  return `<meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${canonical}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${canonical}" />
  ${ogImage ? `<meta property="og:image" content="${ogImage}" />` : ""}
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="icon" href="${withBase("/images/brand/favicon.svg")}" type="image/svg+xml" />
  <link rel="stylesheet" href="${withBase("/css/tokens.css")}" />
  <link rel="stylesheet" href="${withBase("/css/base.css")}" />
  <link rel="stylesheet" href="${withBase("/css/components.css")}" />
  ${sd}`;
}

function header(activeHref) {
  const items = NAV_LINKS.map((l) => {
    const current = l.href === activeHref ? ` aria-current="page"` : "";
    return `<li><a href="${withBase(l.href)}"${current}>${l.label}</a></li>`;
  }).join("");
  return `<a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="container site-header__bar">
      <a href="${withBase("/")}" class="wordmark" aria-label="LAW Real Estate, home">
        <span class="wordmark__name"><strong>LAW</strong> Real Estate</span>
        <span class="wordmark__tag">Johannesburg &amp; Gauteng</span>
      </a>
      <nav class="primary-nav" aria-label="Primary">
        <ul>${items}</ul>
      </nav>
      <div class="header-actions">
        <a href="${withBase("/sell.html")}" class="btn btn-outline btn-sm">Sell With LAW</a>
        <a href="tel:+27116823865" class="btn btn-primary btn-sm">Call Us</a>
        <button class="nav-toggle" id="navToggle" aria-expanded="false" aria-controls="mobileNav" aria-label="Open menu">
          <span class="nav-toggle__bars"></span>
        </button>
      </div>
    </div>
  </header>
  <div class="mobile-nav" id="mobileNav" hidden>
    <div class="mobile-nav__head">
      <span class="wordmark__name"><strong>LAW</strong> Real Estate</span>
      <button class="mobile-nav__close" id="mobileNavClose" aria-label="Close menu">&times;</button>
    </div>
    <nav aria-label="Mobile">
      <ul>${NAV_LINKS.map((l) => `<li><a href="${withBase(l.href)}">${l.label}</a></li>`).join("")}</ul>
    </nav>
    <div class="mobile-nav__footer">
      <a href="tel:+27116823865" class="btn btn-primary btn-block">Call +27 (0)11 682 3865</a>
      <a href="${withBase("/sell.html")}" class="btn btn-outline btn-block">Sell With LAW</a>
    </div>
  </div>`;
}

function footer() {
  const year = new Date().getFullYear();
  return `<footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <span class="wordmark__name" style="color:var(--stone)"><strong style="color:var(--accent-ink)">LAW</strong> Real Estate</span>
          <p class="muted" style="margin-top:0.8em; max-width:32ch; color:color-mix(in srgb, var(--stone) 70%, transparent);">Teamwork from the team that works &mdash; residential resale specialists across Johannesburg, with a boutique new-developments division.</p>
        </div>
        <div>
          <h4>Explore</h4>
          <ul>
            <li><a href="${withBase("/properties.html")}">Properties For Sale</a></li>
            <li><a href="${withBase("/developments.html")}">Developments</a></li>
            <li><a href="${withBase("/notable-sales.html")}">Notable Sales</a></li>
            <li><a href="${withBase("/team.html")}">Our Team</a></li>
          </ul>
        </div>
        <div>
          <h4>Company</h4>
          <ul>
            <li><a href="${withBase("/about.html")}">About LAW</a></li>
            <li><a href="${withBase("/sell.html")}">Sell With LAW</a></li>
            <li><a href="${withBase("/contact.html")}">Contact &amp; Offices</a></li>
            <li><a href="https://www.instagram.com/lawrealestate" target="_blank" rel="noopener">Instagram</a></li>
          </ul>
        </div>
        <div>
          <h4>Head Office &mdash; Glenanda</h4>
          <ul>
            <li>7 Van Beek Avenue, Glenanda, Johannesburg</li>
            <li><a href="tel:+27116823865">+27 (0)11 682 3865</a></li>
            <li><a href="mailto:laura@lawrealestate.co.za">laura@lawrealestate.co.za</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>&copy; ${year} LAW Real Estate. Design proposal &mdash; independent concept, not the live site.</span>
        <span>Est. reference data sourced from lawrealestate.co.za</span>
      </div>
    </div>
  </footer>
  <script type="module" src="${withBase("/js/nav.js")}"></script>`;
}

// `trail` is the list of clickable ancestor crumbs ({href, label}), and
// `current` is the plain-text label of the page you're actually on. There
// is deliberately no way to pass an href for the current page — it always
// renders as a plain, aria-current="page" span, never a dead-end href="#"
// link. Every crumb (Home included) gets a visible/accessible separator
// before it.
function breadcrumb(trail, current) {
  const sep = `<span class="breadcrumb__sep" aria-hidden="true">/</span>`;
  const links = [{ href: "/", label: "Home" }, ...(trail || [])]
    .map((it) => `<a href="${withBase(it.href)}">${escapeHtml(it.label)}</a>`);
  const currentPart = current ? [`<span aria-current="page">${escapeHtml(current)}</span>`] : [];
  return `<nav class="breadcrumb" aria-label="Breadcrumb">${[...links, ...currentPart].join(sep)}</nav>`;
}

function page({ lang = "en-ZA", headHtml, bodyHtml, bodyClass = "" }) {
  return `<!doctype html>
<html lang="${lang}">
<head>
${headHtml}
</head>
<body class="${bodyClass}">
${bodyHtml}
</body>
</html>
`;
}

module.exports = { NAV_LINKS, escapeHtml, head, header, footer, breadcrumb, page, withBase };
