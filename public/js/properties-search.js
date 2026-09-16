import { formatPrice, propertyCard } from "./render.js";
import { BASE_PATH } from "./config.js";

const grid = document.getElementById("resultsGrid");
const countEl = document.getElementById("resultsCount");
const emptyEl = document.getElementById("emptyState");
const form = document.getElementById("filtersForm");
const sortSelect = document.getElementById("sortSelect");
const resetBtn = document.getElementById("resetFilters");

let allProperties = [];

function populateLocationOptions(properties) {
  const locSelect = form.elements["location"];
  const suburbs = Array.from(new Set(properties.map((p) => p.suburb).filter(Boolean))).sort();
  suburbs.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    locSelect.appendChild(opt);
  });
}

function populateTypeOptions(properties) {
  const typeSelect = form.elements["type"];
  const types = Array.from(new Set(properties.map((p) => p.propertyTypeDisplay || p.propertyType).filter(Boolean))).sort();
  types.forEach((t) => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    typeSelect.appendChild(opt);
  });
}

function applyFiltersAndSort() {
  const data = new FormData(form);
  const status = data.get("status");
  const location = data.get("location");
  const type = data.get("type");
  const minPrice = parseInt(data.get("minPrice"), 10);
  const maxPrice = parseInt(data.get("maxPrice"), 10);
  const beds = parseInt(data.get("beds"), 10);
  const baths = parseInt(data.get("baths"), 10);

  let results = allProperties.filter((p) => {
    if (status && status !== "all" && p.status !== status) return false;
    if (location && p.suburb !== location) return false;
    if (type && (p.propertyTypeDisplay || p.propertyType) !== type) return false;
    if (!isNaN(minPrice) && (p.price || 0) < minPrice) return false;
    if (!isNaN(maxPrice) && (p.price || Infinity) > maxPrice) return false;
    if (!isNaN(beds) && (p.bedrooms || 0) < beds) return false;
    if (!isNaN(baths) && (p.bathrooms || 0) < baths) return false;
    return true;
  });

  const sortValue = sortSelect.value;
  if (sortValue === "price-asc") {
    results.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
  } else if (sortValue === "price-desc") {
    results.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
  } else {
    // "Default Order": the source data has no listing/published date, so
    // this is deliberately NOT labelled "Latest" — it's just a stable,
    // deterministic order (descending reference number) so results don't
    // reshuffle between visits/filters.
    results.sort((a, b) => Number(b.reference) - Number(a.reference));
  }

  render(results);
}

function render(results) {
  countEl.textContent = `${results.length} propert${results.length === 1 ? "y" : "ies"}`;
  grid.innerHTML = results.map((p, i) => propertyCard(p, { eager: i < 3 })).join("");
  emptyEl.hidden = results.length !== 0;
  grid.hidden = results.length === 0;
}

function showLoadError() {
  countEl.textContent = "Unable to load properties";
  grid.hidden = true;
  emptyEl.hidden = false;
  emptyEl.innerHTML = `
    <h3>We couldn't load the property list</h3>
    <p>Please refresh the page. If the problem continues, <a href="${BASE_PATH}/contact.html" class="link-underline">contact us</a> and we'll help directly.</p>
  `;
  form.querySelectorAll("select, input, button").forEach((el) => (el.disabled = true));
}

async function loadProperties() {
  let res;
  try {
    res = await fetch(`${BASE_PATH}/data/properties.json`);
  } catch (networkErr) {
    console.error("Failed to fetch properties.json (network error):", networkErr);
    throw networkErr;
  }
  if (!res.ok) {
    console.error(`properties.json request failed: HTTP ${res.status} ${res.statusText}`);
    throw new Error(`HTTP ${res.status}`);
  }
  try {
    return await res.json();
  } catch (parseErr) {
    console.error("properties.json returned invalid JSON:", parseErr);
    throw parseErr;
  }
}

async function init() {
  try {
    allProperties = await loadProperties();
  } catch (err) {
    showLoadError();
    return;
  }

  populateLocationOptions(allProperties);
  populateTypeOptions(allProperties);

  // Pre-fill from query string (e.g. homepage search hand-off)
  const params = new URLSearchParams(window.location.search);
  ["status", "location", "type", "minPrice", "maxPrice", "beds", "baths"].forEach((key) => {
    const val = params.get(key);
    if (val && form.elements[key]) form.elements[key].value = val;
  });

  applyFiltersAndSort();

  form.addEventListener("input", applyFiltersAndSort);
  sortSelect.addEventListener("change", applyFiltersAndSort);
  resetBtn.addEventListener("click", () => {
    form.reset();
    sortSelect.value = "default";
    applyFiltersAndSort();
  });
}

init();
