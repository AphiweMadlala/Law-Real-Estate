import { propertyCard } from "./render.js";
import { BASE_PATH } from "./config.js";

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

function showGridError(grid) {
  if (!grid) return;
  grid.innerHTML = `<p class="muted">We couldn't load current listings right now. Please refresh, or <a href="${BASE_PATH}/contact.html" class="link-underline">contact us</a> directly.</p>`;
}

async function renderHomeSections() {
  const featuredGrid = document.getElementById("featuredGrid");
  const signatureGrid = document.getElementById("signatureGrid");
  const suburbOptions = document.getElementById("suburbOptions");

  let properties;
  try {
    properties = await loadProperties();
  } catch (err) {
    showGridError(featuredGrid);
    showGridError(signatureGrid);
    return;
  }

  // Automatically-selected homepage imagery (Featured, Signature) must
  // never surface a listing with no photography — that's fine inside the
  // full Properties grid (the branded fallback handles it there), but a
  // curated "best of" section picking a blank card looks like a bug, not a
  // deliberate choice. Listings with no images are simply excluded from
  // these two automatic pools rather than shown with a fallback image.
  const withImages = properties.filter((p) => p.images && p.images.length);

  if (featuredGrid) {
    const featured = withImages
      .filter((p) => p.price && p.price < 8000000)
      .sort((a, b) => Number(b.reference) - Number(a.reference))
      .slice(0, 3);
    featuredGrid.innerHTML = featured.map((p, i) => propertyCard(p, { eager: i < 3 })).join("");
  }

  if (signatureGrid) {
    const bySignature = [...withImages].sort((a, b) => (b.price || 0) - (a.price || 0));
    signatureGrid.innerHTML = bySignature.slice(0, 3).map((p, i) => propertyCard(p, { eager: i < 3 })).join("");
  }

  if (suburbOptions) {
    const suburbs = Array.from(new Set(properties.map((p) => p.suburb).filter(Boolean))).sort();
    suburbOptions.innerHTML = suburbs.map((s) => `<option value="${s}"></option>`).join("");
  }
}

renderHomeSections();

// Hero search hand-off to the full properties page
const heroSearch = document.getElementById("heroSearch");
if (heroSearch) {
  heroSearch.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(heroSearch);
    const params = new URLSearchParams();
    for (const [key, value] of data.entries()) {
      if (value) params.set(key, value);
    }
    window.location.href = `${BASE_PATH}/properties.html?${params.toString()}`;
  });
}
