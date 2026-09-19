const { BASE_PATH } = require("./config");
const { escapeHtml } = require("./partials");

function withBase(path) {
  return `${BASE_PATH}${path}`;
}

// South African numbers in the source data are formatted like
// "+27 (0)83 365 1733" — the "(0)" is a local trunk prefix that must be
// dropped (not just have its parens stripped) before a tel: link works,
// otherwise you get an invalid "+270833651733".
function telHref(phone) {
  if (!phone) return "";
  return "tel:" + phone.replace(/\(0\)/g, "").replace(/[^\d+]/g, "");
}

function waHref(phone) {
  if (!phone) return "";
  return "https://wa.me/" + phone.replace(/\(0\)/g, "").replace(/\D/g, "");
}

// Status options are derived from what's actually in the dataset, so the UI
// never offers a status (e.g. "For Rent") that has zero matching listings.
// If rental stock is added to data/properties.json later, its status
// appears here automatically — nothing hardcoded to remove or restore.
function statusOptionsHtml(properties) {
  const statuses = Array.from(new Set(properties.map((p) => p.status))).sort();
  const options = [`<option value="all">All Properties</option>`];
  for (const s of statuses) {
    options.push(`<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`);
  }
  return options.join("\n              ");
}

// Conservative fix for source line-wrap artefacts in scraped descriptions,
// e.g. "There is a home-gym, with steam-\n\nroom, sauna..." (a hard wrap
// landed mid-word/mid-sentence and got read back as a paragraph break).
// Never rewrites wording — only rejoins text the source itself clearly
// intended as one continuous run. Genuine paragraph boundaries (a
// paragraph ending in terminal punctuation) and list-like lines (starting
// with -, •, * or "1.") are always preserved.
function normalizeDescription(text) {
  if (!text) return text;
  const raw = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  if (raw.length <= 1) return text;

  const isListLike = (p) => /^([-•*]|\d+[.)])\s/.test(p);
  const endsMidWord = (p) => /[A-Za-z]-$/.test(p);
  const endsSentence = (p) => /[.!?:;"'”)\]]$/.test(p);
  const startsLowercase = (p) => /^[a-z]/.test(p);

  const merged = [raw[0]];
  for (let i = 1; i < raw.length; i++) {
    const prev = merged[merged.length - 1];
    const curr = raw[i];
    if (isListLike(curr) || isListLike(prev)) {
      merged.push(curr);
      continue;
    }
    if (endsMidWord(prev)) {
      // e.g. "steam-" + "room, sauna..." -> "steam-room, sauna..."
      merged[merged.length - 1] = prev + curr;
    } else if (!endsSentence(prev) && startsLowercase(curr)) {
      // e.g. "...offering a built-in braai" + "and dining area..." (no
      // terminal punctuation, continuation starts lowercase) -> one run
      merged[merged.length - 1] = prev + " " + curr;
    } else {
      merged.push(curr);
    }
  }
  return merged.join("\n\n");
}

// Truncate near maxLen but back off to the last word boundary so metadata
// never ends mid-word (e.g. "...offering a built-in bra" -> "...offering a built-in").
function truncateAtWord(text, maxLen) {
  if (!text || text.length <= maxLen) return text || "";
  const cut = text.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(" ");
  const safe = lastSpace > 0 ? cut.slice(0, lastSpace) : cut;
  return safe.replace(/[,;:\-–—]$/, "").trim() + "…";
}

// The source data's "features" list is frequently just three generic
// boilerplate values repeated across almost every listing ("Wonderful
// Area", "Great Investment", "Fantastic Opportunity") rather than anything
// property-specific. Filter those out so the Key Features section only
// ever shows genuine content, and is omitted entirely when nothing
// genuine remains — never fabricating a replacement.
const GENERIC_FEATURE_BOILERPLATE = new Set(["wonderful area", "great investment", "fantastic opportunity"]);

function genuineFeatures(features) {
  if (!Array.isArray(features)) return [];
  return features.filter((f) => !GENERIC_FEATURE_BOILERPLATE.has(String(f).trim().toLowerCase()));
}

function formatPrice(price, currency = "ZAR", onApplication = false) {
  if (onApplication || price === null || price === undefined) return "Price on Application";
  const symbol = currency === "ZAR" ? "R" : currency;
  return `${symbol} ${Number(price).toLocaleString("en-ZA")}`;
}

function slugify(str) {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function propertyCard(p, { eager = false } = {}) {
  const hasImage = Boolean(p.images && p.images[0]);
  const img = withBase(hasImage ? p.images[0] : "/images/brand/placeholder.svg");
  const typeLabel = p.propertyTypeDisplay || p.propertyType || "";
  const priceText = formatPrice(p.price, p.currency, p.priceOnApplication);
  const specs = [];
  if (p.bedrooms) specs.push(`<span>${escapeHtml(p.bedrooms)} Bed</span>`);
  if (p.bathrooms) specs.push(`<span>${escapeHtml(p.bathrooms)} Bath</span>`);
  if (p.garages) specs.push(`<span>${escapeHtml(p.garages)} Garage</span>`);
  const imgAlt = hasImage
    ? `${escapeHtml(typeLabel || "Property")} in ${escapeHtml(p.suburb)}, ${escapeHtml(p.city)}`
    : "Photography unavailable for this listing";
  return `<article class="property-card">
    <div class="property-card__media${hasImage ? "" : " property-card__media--empty"}">
      <span class="property-card__status">${escapeHtml(p.status)}</span>
      <span class="property-card__type">${escapeHtml(typeLabel)}</span>
      <img src="${img}" alt="${imgAlt}" loading="${eager ? "eager" : "lazy"}" width="480" height="360" />
    </div>
    <div class="property-card__body">
      <p class="property-card__price">${escapeHtml(priceText)}</p>
      <h3 class="property-card__title">${escapeHtml(typeLabel)} &mdash; ${escapeHtml(p.suburb)}</h3>
      <p class="property-card__loc">${escapeHtml(p.suburb)}, ${escapeHtml(p.city)}</p>
      ${specs.length ? `<div class="property-card__specs">${specs.join("")}</div>` : ""}
    </div>
    <a class="property-card__link" href="${withBase(`/property/${encodeURIComponent(p.reference)}/`)}" aria-label="View details for ${escapeHtml(typeLabel)} in ${escapeHtml(p.suburb)}, ${escapeHtml(p.city)}, ${escapeHtml(priceText)}"></a>
  </article>`;
}

function showcaseCard(item, { kind = "notable" } = {}) {
  const img = withBase(item.images && item.images[0] ? item.images[0] : "/images/brand/placeholder.svg");
  const label = kind === "notable" ? "Sold" : item.status || "Sold";
  const typeLabel = item.propertyType || "";
  const placeLabel = item.suburb || item.estateName || "";
  return `<article class="showcase-card">
    <div class="showcase-card__media">
      <img src="${img}" alt="${escapeHtml(typeLabel)} in ${escapeHtml(placeLabel)}, ${escapeHtml(item.city)}" loading="lazy" />
      <span class="showcase-card__ribbon">${escapeHtml(label)}</span>
    </div>
    <div class="showcase-card__body">
      <p class="showcase-card__price">${escapeHtml(formatPrice(item.price, item.currency))}</p>
      <p class="muted" style="margin-top:0.2em;">${escapeHtml(typeLabel)} &middot; ${escapeHtml(placeLabel)}, ${escapeHtml(item.city)}</p>
    </div>
  </article>`;
}

function agentCardCompact(a) {
  return `<a href="${withBase(`/team/${encodeURIComponent(a.slug)}/`)}" class="team-card">
    <div class="team-card__photo"><img src="${withBase(a.photo)}" alt="${escapeHtml(a.name)}, ${escapeHtml(a.title || "estate agent")} at LAW Real Estate" loading="lazy" width="320" height="420" /></div>
    <h3 class="team-card__name">${escapeHtml(a.name)}</h3>
    <p class="team-card__title">${escapeHtml(a.title || "Estate Agent")}</p>
  </a>`;
}

module.exports = { formatPrice, slugify, propertyCard, showcaseCard, agentCardCompact, withBase, statusOptionsHtml, telHref, waHref, normalizeDescription, truncateAtWord, genuineFeatures };
