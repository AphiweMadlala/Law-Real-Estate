// Browser-side (ESM) mirror of templates/format.js — kept dependency-free
// so it can run directly in the browser without a bundler.
import { BASE_PATH } from "./config.js";

// Source-derived data (scraped listing text) is interpolated into HTML
// strings below — escape it defensively, the same way the Node build does
// in templates/partials.js, rather than trusting it's always benign.
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatPrice(price, currency = "ZAR", onApplication = false) {
  if (onApplication || price === null || price === undefined) return "Price on Application";
  const symbol = currency === "ZAR" ? "R" : currency;
  return `${symbol} ${Number(price).toLocaleString("en-ZA")}`;
}

export function propertyCard(p, { eager = false } = {}) {
  const hasImage = Boolean(p.images && p.images[0]);
  const img = BASE_PATH + (hasImage ? p.images[0] : "/images/brand/placeholder.svg");
  const typeLabel = p.propertyTypeDisplay || p.propertyType || "";
  const specs = [];
  if (p.bedrooms) specs.push(`<span>${escapeHtml(p.bedrooms)} Bed</span>`);
  if (p.bathrooms) specs.push(`<span>${escapeHtml(p.bathrooms)} Bath</span>`);
  if (p.garages) specs.push(`<span>${escapeHtml(p.garages)} Garage</span>`);
  const priceText = formatPrice(p.price, p.currency, p.priceOnApplication);
  const imgAlt = hasImage
    ? `${escapeHtml(typeLabel)} in ${escapeHtml(p.suburb)}, ${escapeHtml(p.city)}`
    : "Photography unavailable for this listing";
  return `<article class="property-card">
    <div class="property-card__media${hasImage ? "" : " property-card__media--empty"}">
      <span class="property-card__status">${escapeHtml(p.status)}</span>
      <span class="property-card__type">${escapeHtml(typeLabel)}</span>
      <img src="${escapeHtml(img)}" alt="${imgAlt}" loading="${eager ? "eager" : "lazy"}" width="480" height="360" />
    </div>
    <div class="property-card__body">
      <p class="property-card__price">${escapeHtml(priceText)}</p>
      <h3 class="property-card__title">${escapeHtml(typeLabel)} &mdash; ${escapeHtml(p.suburb)}</h3>
      <p class="property-card__loc">${escapeHtml(p.suburb)}, ${escapeHtml(p.city)}</p>
      ${specs.length ? `<div class="property-card__specs">${specs.join("")}</div>` : ""}
    </div>
    <a class="property-card__link" href="${escapeHtml(BASE_PATH)}/property/${encodeURIComponent(p.reference)}/" aria-label="View details for ${escapeHtml(typeLabel)} in ${escapeHtml(p.suburb)}, ${escapeHtml(p.city)}, ${escapeHtml(priceText)}"></a>
  </article>`;
}
