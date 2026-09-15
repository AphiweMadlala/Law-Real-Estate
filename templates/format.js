const { BASE_PATH } = require("./config");

function withBase(path) {
  return `${BASE_PATH}${path}`;
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
  const img = withBase(p.images && p.images[0] ? p.images[0] : "/images/brand/placeholder.svg");
  const specs = [];
  if (p.bedrooms) specs.push(`<span>${p.bedrooms} Bed</span>`);
  if (p.bathrooms) specs.push(`<span>${p.bathrooms} Bath</span>`);
  if (p.garages) specs.push(`<span>${p.garages} Garage</span>`);
  return `<article class="property-card">
    <div class="property-card__media">
      <span class="property-card__status">${p.status}</span>
      <span class="property-card__type">${p.propertyTypeDisplay || p.propertyType || ""}</span>
      <img src="${img}" alt="${(p.propertyTypeDisplay || p.propertyType || "Property")} in ${p.suburb}, ${p.city}" loading="${eager ? "eager" : "lazy"}" width="480" height="360" />
    </div>
    <div class="property-card__body">
      <p class="property-card__price">${formatPrice(p.price, p.currency, p.priceOnApplication)}</p>
      <h3 class="property-card__title">${p.propertyTypeDisplay || p.propertyType} &mdash; ${p.suburb}</h3>
      <p class="property-card__loc">${p.suburb}, ${p.city}</p>
      ${specs.length ? `<div class="property-card__specs">${specs.join("")}</div>` : ""}
    </div>
    <a class="property-card__link" href="${withBase(`/property/${p.reference}/`)}" aria-label="View details for ${p.propertyTypeDisplay || p.propertyType} in ${p.suburb}, ${p.city}, ${formatPrice(p.price, p.currency, p.priceOnApplication)}"></a>
  </article>`;
}

function showcaseCard(item, { kind = "notable" } = {}) {
  const img = withBase(item.images && item.images[0] ? item.images[0] : "/images/brand/placeholder.svg");
  const label = kind === "notable" ? "Sold" : item.status || "Sold";
  return `<article class="showcase-card">
    <div class="showcase-card__media">
      <img src="${img}" alt="${item.propertyType || ""} in ${item.suburb || item.estateName}, ${item.city}" loading="lazy" />
      <span class="showcase-card__ribbon">${label}</span>
    </div>
    <div class="showcase-card__body">
      <p class="showcase-card__price">${formatPrice(item.price, item.currency)}</p>
      <p class="muted" style="margin-top:0.2em;">${item.propertyType || ""} &middot; ${item.suburb || item.estateName}, ${item.city}</p>
    </div>
  </article>`;
}

function agentCardCompact(a) {
  return `<a href="${withBase(`/team/${a.slug}/`)}" class="team-card">
    <div class="team-card__photo"><img src="${withBase(a.photo)}" alt="${a.name}, ${a.title || "estate agent"} at LAW Real Estate" loading="lazy" width="320" height="420" /></div>
    <h3 class="team-card__name">${a.name}</h3>
    <p class="team-card__title">${a.title || "Estate Agent"}</p>
  </a>`;
}

module.exports = { formatPrice, slugify, propertyCard, showcaseCard, agentCardCompact, withBase };
