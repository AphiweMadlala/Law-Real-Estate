// Browser-side (ESM) mirror of templates/format.js — kept dependency-free
// so it can run directly in the browser without a bundler.

export function formatPrice(price, currency = "ZAR", onApplication = false) {
  if (onApplication || price === null || price === undefined) return "Price on Application";
  const symbol = currency === "ZAR" ? "R" : currency;
  return `${symbol} ${Number(price).toLocaleString("en-ZA")}`;
}

export function propertyCard(p, { eager = false } = {}) {
  const img = p.images && p.images[0] ? p.images[0] : "/images/brand/placeholder.svg";
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
    <a class="property-card__link" href="/property/${p.reference}/" aria-label="View details for ${p.propertyTypeDisplay || p.propertyType} in ${p.suburb}, ${p.city}, ${formatPrice(p.price, p.currency, p.priceOnApplication)}"></a>
  </article>`;
}
