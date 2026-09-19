const { head, header, footer, breadcrumb, withBase } = require("../partials");
const { SITE_URL } = require("../config");
const { statusOptionsHtml } = require("../format");

function propertiesPage(properties) {
  const bodyHtml = `${header("/properties.html")}
  <main id="main">
    <div class="page-head">
      <div class="container">
        ${breadcrumb([], "Properties")}
        <p class="eyebrow">Current Inventory</p>
        <h1 style="font-size: var(--step-4); margin-bottom:0.3em;">Properties</h1>
        <p class="muted" style="max-width:60ch;">Browse LAW's current mandates. Use the filters to narrow by status, location, type, price and bedrooms &mdash; then sort the results however suits you.</p>
      </div>
    </div>

    <section class="section--tight">
      <div class="container">
        <form class="filters-bar" id="filtersForm">
          <div class="field">
            <label for="fStatus">Status</label>
            <select id="fStatus" name="status">
              ${statusOptionsHtml(properties)}
            </select>
          </div>
          <div class="field">
            <label for="fLocation">Location</label>
            <select id="fLocation" name="location">
              <option value="">Any suburb</option>
            </select>
          </div>
          <div class="field">
            <label for="fType">Property Type</label>
            <select id="fType" name="type">
              <option value="">Any type</option>
            </select>
          </div>
          <div class="field">
            <label for="fMin">Min Price</label>
            <input type="number" id="fMin" name="minPrice" placeholder="No min" min="0" step="50000" inputmode="numeric" />
          </div>
          <div class="field">
            <label for="fMax">Max Price</label>
            <input type="number" id="fMax" name="maxPrice" placeholder="No max" min="0" step="50000" inputmode="numeric" />
          </div>
          <div class="field">
            <label for="fBeds">Bedrooms</label>
            <select id="fBeds" name="beds">
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
          </div>
          <div class="field">
            <label for="fBaths">Bathrooms</label>
            <select id="fBaths" name="baths">
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
            </select>
          </div>
          <button type="button" class="btn btn-outline btn-sm" id="resetFilters">Reset</button>
        </form>

        <div class="results-bar">
          <p class="results-count" id="resultsCount">Loading&hellip;</p>
          <div class="sort-field">
            <label for="sortSelect">Sort by</label>
            <select id="sortSelect">
              <option value="default">Default Order</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div class="grid grid--3" id="resultsGrid" aria-live="polite"></div>
        <div class="empty-state" id="emptyState" hidden>
          <h3>No properties match those filters</h3>
          <p>Try widening your price range or clearing a filter.</p>
        </div>

        <hr class="divider" style="margin-top: var(--space-2xl);" />
        <p class="muted text-center" style="margin-top: var(--space-md);">Know the reference number of a specific listing? <a href="${withBase("/contact.html")}" class="link-underline">Contact us</a> and quote it &mdash; e.g. Ref&nbsp;#6893.</p>
      </div>
    </section>
  </main>
  ${footer()}
  <script type="module" src="${withBase("/js/properties-search.js")}"></script>`;

  const headHtml = head({
    title: "Properties For Sale & To Rent — LAW Real Estate",
    description: "Browse LAW Real Estate's current property mandates across Johannesburg — filter by location, type, price and bedrooms.",
    canonical: `${SITE_URL}/properties.html`,
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

module.exports = propertiesPage;
