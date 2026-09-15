import { propertyCard } from "./render.js";

async function loadFeatured() {
  const res = await fetch("/data/properties.json");
  const properties = await res.json();

  const bySignature = [...properties].sort((a, b) => (b.price || 0) - (a.price || 0));
  const featuredGrid = document.getElementById("featuredGrid");
  if (featuredGrid) {
    const featured = properties
      .filter((p) => p.price && p.price < 8000000)
      .sort((a, b) => Number(b.reference) - Number(a.reference))
      .slice(0, 3);
    featuredGrid.innerHTML = featured.map((p, i) => propertyCard(p, { eager: i < 3 })).join("");
  }

  const signatureGrid = document.getElementById("signatureGrid");
  if (signatureGrid) {
    const signature = bySignature.slice(0, 3);
    signatureGrid.innerHTML = signature.map((p, i) => propertyCard(p, { eager: i < 3 })).join("");
  }
}

loadFeatured();

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
    window.location.href = `/properties.html?${params.toString()}`;
  });

  // populate location datalist
  fetch("/data/properties.json")
    .then((r) => r.json())
    .then((properties) => {
      const list = document.getElementById("suburbOptions");
      if (!list) return;
      const suburbs = Array.from(new Set(properties.map((p) => p.suburb))).sort();
      list.innerHTML = suburbs.map((s) => `<option value="${s}"></option>`).join("");
    });
}
