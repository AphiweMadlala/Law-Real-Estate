import { formatPrice, propertyCard } from "./render.js";
import { BASE_PATH } from "./config.js";
import { trapFocus } from "./focus-trap.js";

const INITIAL_BATCH = 24;
const LOAD_MORE_BATCH = 24;

const grid = document.getElementById("resultsGrid");
const countEl = document.getElementById("resultsCount");
const emptyEl = document.getElementById("emptyState");
const form = document.getElementById("filtersForm");
const sortSelect = document.getElementById("sortSelect");
const resetBtn = document.getElementById("resetFilters");
const loadMoreWrap = document.getElementById("loadMoreWrap");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const loadMoreProgress = document.getElementById("loadMoreProgress");

// Mobile filter drawer
const filterToggle = document.getElementById("filterToggle");
const filterApply = document.getElementById("filterApply");
const filterDrawerClose = document.getElementById("filterDrawerClose");
const filterCountBadge = document.getElementById("filterCount");

// Location combobox
const locoWrap = document.getElementById("locationCombobox");
const locoInput = document.getElementById("fLocation");
const locoValue = document.getElementById("fLocationValue");
const locoListbox = document.getElementById("fLocationListbox");
const locoClear = document.getElementById("fLocationClear");

let allProperties = [];
let visibleCount = INITIAL_BATCH;

// ---------- URL <-> filter state ----------
// Every filter/search/sort control maps 1:1 to a query param, so the
// current view is always shareable and survives a refresh. Params are
// only ever written via history.replaceState (no history-spamming on every
// keystroke) except once on genuine navigation away/back, which the browser
// already handles — Back/Forward just re-reads whatever URL it lands on.
const PARAM_KEYS = ["status", "location", "type", "minPrice", "maxPrice", "beds", "baths", "search", "sort"];

function readParamsIntoForm() {
  const params = new URLSearchParams(window.location.search);
  for (const key of PARAM_KEYS) {
    const val = params.get(key);
    if (key === "sort") {
      if (val) sortSelect.value = val;
      continue;
    }
    if (key === "location") {
      if (val) setLocationValue(val);
      continue;
    }
    if (val && form.elements[key]) form.elements[key].value = val;
  }
}

function writeFormToUrl() {
  const data = new FormData(form);
  const params = new URLSearchParams();
  for (const key of PARAM_KEYS) {
    const val = key === "sort" ? sortSelect.value : data.get(key);
    const isDefault = (key === "sort" && val === "default") || (key === "status" && val === "all");
    if (val && !isDefault) params.set(key, val);
  }
  const query = params.toString();
  const url = `${window.location.pathname}${query ? `?${query}` : ""}`;
  window.history.replaceState(window.history.state, "", url);
}

// ---------- Location combobox ----------
let locoOptions = []; // [{value, city}]
let locoFiltered = [];
let locoActiveIndex = -1;

function setLocationValue(value) {
  locoValue.value = value;
  const match = locoOptions.find((o) => o.value === value);
  locoInput.value = match ? value : value;
  locoClear.hidden = !value;
}

function populateLocationOptions(properties) {
  const seen = new Map();
  properties.forEach((p) => {
    if (p.suburb && !seen.has(p.suburb)) seen.set(p.suburb, p.city || "");
  });
  locoOptions = Array.from(seen, ([value, city]) => ({ value, city })).sort((a, b) => a.value.localeCompare(b.value));
}

function renderLocoListbox(items) {
  locoListbox.innerHTML = "";
  if (items.length === 0) {
    const li = document.createElement("li");
    li.className = "combobox__empty";
    li.setAttribute("role", "status");
    li.textContent = "No matching suburb";
    locoListbox.appendChild(li);
    return;
  }
  items.forEach((opt, i) => {
    const li = document.createElement("li");
    li.id = `loc-opt-${i}`;
    li.setAttribute("role", "option");
    li.dataset.value = opt.value;
    li.innerHTML = `<span class="combobox__option-suburb">${escapeHtml(opt.value)}</span>${opt.city ? `<span class="combobox__option-city">, ${escapeHtml(opt.city)}</span>` : ""}`;
    li.addEventListener("mousedown", (e) => {
      // mousedown (not click) so it fires before the input's blur handler
      e.preventDefault();
      selectLocation(opt.value);
    });
    locoListbox.appendChild(li);
  });
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function openLocoListbox(query) {
  const q = query.trim().toLowerCase();
  locoFiltered = q
    ? locoOptions.filter((o) => o.value.toLowerCase().includes(q) || (o.city || "").toLowerCase().includes(q))
    : locoOptions;
  renderLocoListbox(locoFiltered);
  locoListbox.hidden = false;
  locoInput.setAttribute("aria-expanded", "true");
  locoActiveIndex = locoFiltered.length ? 0 : -1;
  updateLocoActiveDescendant();
}

function closeLocoListbox() {
  locoListbox.hidden = true;
  locoInput.setAttribute("aria-expanded", "false");
  locoInput.removeAttribute("aria-activedescendant");
  locoActiveIndex = -1;
}

function updateLocoActiveDescendant() {
  Array.from(locoListbox.children).forEach((el, i) => {
    el.classList.toggle("is-active", i === locoActiveIndex);
  });
  if (locoActiveIndex >= 0 && locoFiltered[locoActiveIndex]) {
    locoInput.setAttribute("aria-activedescendant", `loc-opt-${locoActiveIndex}`);
    locoListbox.children[locoActiveIndex]?.scrollIntoView({ block: "nearest" });
  } else {
    locoInput.removeAttribute("aria-activedescendant");
  }
}

function selectLocation(value) {
  setLocationValue(value);
  closeLocoListbox();
  locoInput.blur();
  onFilterChanged();
}

function revertLocoInputToConfirmed() {
  locoInput.value = locoValue.value || "";
}

if (locoInput) {
  locoInput.addEventListener("focus", () => openLocoListbox(locoInput.value));
  locoInput.addEventListener("input", () => {
    if (locoInput.value.trim() === "") {
      locoValue.value = "";
      locoClear.hidden = true;
    }
    openLocoListbox(locoInput.value);
  });
  locoInput.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (locoListbox.hidden) return openLocoListbox(locoInput.value);
      locoActiveIndex = Math.min(locoActiveIndex + 1, locoFiltered.length - 1);
      updateLocoActiveDescendant();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (locoListbox.hidden) return openLocoListbox(locoInput.value);
      locoActiveIndex = Math.max(locoActiveIndex - 1, 0);
      updateLocoActiveDescendant();
    } else if (e.key === "Enter") {
      if (!locoListbox.hidden && locoActiveIndex >= 0 && locoFiltered[locoActiveIndex]) {
        e.preventDefault();
        selectLocation(locoFiltered[locoActiveIndex].value);
      }
    } else if (e.key === "Escape") {
      if (!locoListbox.hidden) {
        e.preventDefault();
        e.stopPropagation();
        closeLocoListbox();
        revertLocoInputToConfirmed();
      }
    }
  });
  locoInput.addEventListener("blur", () => {
    // Deferred so a mousedown-selected option (see above) still fires first.
    setTimeout(() => {
      if (locoListbox.hidden) return;
      closeLocoListbox();
      revertLocoInputToConfirmed();
    }, 0);
  });
}
locoClear?.addEventListener("click", () => {
  setLocationValue("");
  locoInput.focus();
  onFilterChanged();
});

// ---------- Type options ----------
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

// ---------- Filtering, sorting, rendering ----------
function getFilteredSorted() {
  const data = new FormData(form);
  const status = data.get("status");
  const location = data.get("location");
  const type = data.get("type");
  const minPrice = parseInt(data.get("minPrice"), 10);
  const maxPrice = parseInt(data.get("maxPrice"), 10);
  const beds = parseInt(data.get("beds"), 10);
  const baths = parseInt(data.get("baths"), 10);
  const search = (data.get("search") || "").trim().toLowerCase();
  const searchIsNumeric = /^\d+$/.test(search);

  let results = allProperties.filter((p) => {
    if (status && status !== "all" && p.status !== status) return false;
    if (location && p.suburb !== location) return false;
    if (type && (p.propertyTypeDisplay || p.propertyType) !== type) return false;
    if (!isNaN(minPrice) && (p.price || 0) < minPrice) return false;
    if (!isNaN(maxPrice) && (p.price || Infinity) > maxPrice) return false;
    if (!isNaN(beds) && (p.bedrooms || 0) < beds) return false;
    if (!isNaN(baths) && (p.bathrooms || 0) < baths) return false;
    if (search) {
      if (searchIsNumeric) {
        if (!String(p.reference).includes(search)) return false;
      } else {
        const haystack = `${p.title || ""} ${p.suburb || ""} ${p.city || ""} ${p.propertyTypeDisplay || p.propertyType || ""}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
    }
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

  return results;
}

function countActiveFilters() {
  const data = new FormData(form);
  let n = 0;
  if (data.get("search")) n++;
  if (data.get("status") && data.get("status") !== "all") n++;
  if (data.get("location")) n++;
  if (data.get("type")) n++;
  if (data.get("minPrice")) n++;
  if (data.get("maxPrice")) n++;
  if (data.get("beds")) n++;
  if (data.get("baths")) n++;
  return n;
}

function updateFilterBadge() {
  const n = countActiveFilters();
  if (n > 0) {
    filterCountBadge.textContent = String(n);
    filterCountBadge.hidden = false;
  } else {
    filterCountBadge.hidden = true;
  }
}

function applyFiltersAndSort({ resetBatch = true } = {}) {
  if (resetBatch) visibleCount = INITIAL_BATCH;
  const results = getFilteredSorted();
  render(results);
  updateFilterBadge();
  writeFormToUrl();
}

function render(results) {
  const total = results.length;
  countEl.textContent = `${total} propert${total === 1 ? "y" : "ies"}`;

  const visible = results.slice(0, visibleCount);
  grid.innerHTML = visible.map((p, i) => propertyCard(p, { eager: i < 3 })).join("");
  emptyEl.hidden = total !== 0;
  grid.hidden = total === 0;

  const remaining = total - visible.length;
  if (remaining > 0) {
    loadMoreWrap.hidden = false;
    loadMoreProgress.textContent = `Showing ${visible.length} of ${total}`;
  } else {
    loadMoreWrap.hidden = true;
  }
}

loadMoreBtn?.addEventListener("click", () => {
  visibleCount += LOAD_MORE_BATCH;
  render(getFilteredSorted());
});

function onFilterChanged() {
  applyFiltersAndSort({ resetBatch: true });
}

// ---------- Mobile filter drawer ----------
let lastFocusedBeforeDrawer = null;

function openDrawer() {
  lastFocusedBeforeDrawer = document.activeElement;
  form.classList.add("is-open");
  document.body.style.overflow = "hidden";
  filterToggle.setAttribute("aria-expanded", "true");
  const firstField = form.querySelector("#fSearch");
  firstField?.focus();
}

function closeDrawer() {
  form.classList.remove("is-open");
  document.body.style.overflow = "";
  filterToggle.setAttribute("aria-expanded", "false");
  (lastFocusedBeforeDrawer || filterToggle).focus();
}

function isDrawerOpen() {
  return form.classList.contains("is-open");
}

filterToggle?.addEventListener("click", () => {
  if (isDrawerOpen()) closeDrawer();
  else openDrawer();
});
filterDrawerClose?.addEventListener("click", closeDrawer);
filterApply?.addEventListener("click", closeDrawer);

form.addEventListener("keydown", (e) => {
  if (!isDrawerOpen()) return;
  if (e.key === "Escape") {
    // If the location listbox is open, Escape closes that first (handled
    // by its own listener with stopPropagation); otherwise it closes the
    // whole drawer.
    if (!locoListbox.hidden) return;
    e.preventDefault();
    closeDrawer();
    return;
  }
  trapFocus(form, e);
});

// The drawer only exists as an overlay below the desktop breakpoint; if the
// viewport is resized past it while open (e.g. rotating a tablet, or a
// desktop dev-tools resize), drop the open/lock state so it doesn't get
// stuck as an invisible-but-scroll-locked no-op at desktop widths.
const desktopMq = window.matchMedia("(min-width: 900px)");
desktopMq.addEventListener("change", (e) => {
  if (e.matches && isDrawerOpen()) closeDrawer();
});

// ---------- Errors / loading ----------
function showLoadError() {
  countEl.textContent = "Unable to load properties";
  grid.hidden = true;
  emptyEl.hidden = false;
  emptyEl.innerHTML = `
    <h3>We couldn't load the property list</h3>
    <p>Please refresh, or <a href="${BASE_PATH}/contact.html" class="link-underline">contact us</a> and we'll help directly.</p>
  `;
  form.querySelectorAll("select, input, button").forEach((el) => (el.disabled = true));
  loadMoreWrap.hidden = true;
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
  readParamsIntoForm();
  applyFiltersAndSort();

  form.addEventListener("input", (e) => {
    if (e.target === locoInput) return; // combobox drives its own filter-apply on selection
    onFilterChanged();
  });
  form.addEventListener("change", (e) => {
    if (e.target === locoInput) return;
    onFilterChanged();
  });
  sortSelect.addEventListener("change", () => applyFiltersAndSort({ resetBatch: true }));
  resetBtn.addEventListener("click", () => {
    form.reset();
    setLocationValue("");
    sortSelect.value = "default";
    onFilterChanged();
  });

  // Back/Forward: the URL changed under us without a full reload, so re-read
  // it into the form and re-render to match.
  window.addEventListener("popstate", () => {
    readParamsIntoForm();
    applyFiltersAndSort({ resetBatch: true });
  });
}

init();
