// Build-time integrity checks for the source dataset. Run before any page is
// generated so a bad scrape/edit fails the build loudly instead of shipping
// broken links, missing images or ghost pages.

const fs = require("fs");
const path = require("path");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s()]{7,}$/;
const URL_RE = /^https?:\/\/\S+$/;

function fileExists(publicDir, relPath) {
  if (!relPath) return false;
  return fs.existsSync(path.join(publicDir, relPath.replace(/^\//, "")));
}

function validate({ properties, agents, notableSales, developments, offices, publicDir }) {
  const errors = [];
  const warnings = [];

  // --- Properties: uniqueness + required fields + image existence ---
  const seenRefs = new Set();
  for (const p of properties) {
    if (!p.reference) {
      errors.push(`Property missing "reference": ${JSON.stringify(p).slice(0, 120)}`);
      continue;
    }
    if (seenRefs.has(p.reference)) {
      errors.push(`Duplicate property reference: ${p.reference}`);
    }
    seenRefs.add(p.reference);

    for (const field of ["title", "status", "suburb", "city"]) {
      if (!p[field]) errors.push(`Property #${p.reference} missing required field "${field}"`);
    }
    if (!p.price && !p.priceOnApplication) {
      warnings.push(`Property #${p.reference} has no price and priceOnApplication is not set`);
    }
    if (!Array.isArray(p.images) || p.images.length === 0) {
      warnings.push(`Property #${p.reference} has no images`);
    } else {
      for (const img of p.images) {
        if (!fileExists(publicDir, img)) {
          errors.push(`Property #${p.reference} references missing image file: ${img}`);
        }
      }
    }
    for (const a of p.agents || []) {
      if (a.email && !EMAIL_RE.test(a.email)) warnings.push(`Property #${p.reference} agent "${a.name}" has malformed email: ${a.email}`);
      if (a.mobile && !PHONE_RE.test(a.mobile)) warnings.push(`Property #${p.reference} agent "${a.name}" has malformed mobile: ${a.mobile}`);
      if (a.photo && !fileExists(publicDir, a.photo)) {
        errors.push(`Property #${p.reference} agent "${a.name}" references missing photo: ${a.photo}`);
      }
    }
    if (p.sourceUrl && !URL_RE.test(p.sourceUrl)) {
      warnings.push(`Property #${p.reference} has malformed sourceUrl: ${p.sourceUrl}`);
    }
  }

  // --- Agents: uniqueness + required fields + image existence ---
  const seenIds = new Set();
  const seenSlugs = new Set();
  for (const a of agents) {
    if (!a.id) errors.push(`Agent missing "id": ${a.name || JSON.stringify(a).slice(0, 80)}`);
    if (a.id && seenIds.has(a.id)) errors.push(`Duplicate agent id: ${a.id}`);
    if (a.id) seenIds.add(a.id);

    if (!a.slug) errors.push(`Agent ${a.id || "?"} missing "slug"`);
    if (a.slug && seenSlugs.has(a.slug)) errors.push(`Duplicate agent slug: ${a.slug} (used by "${a.name}")`);
    if (a.slug) seenSlugs.add(a.slug);

    if (!a.name) errors.push(`Agent ${a.id || "?"} missing "name"`);
    if (a.email && !EMAIL_RE.test(a.email)) warnings.push(`Agent "${a.name}" has malformed email: ${a.email}`);
    if (a.mobile && !PHONE_RE.test(a.mobile)) warnings.push(`Agent "${a.name}" has malformed mobile: ${a.mobile}`);
    if (a.photo && !fileExists(publicDir, a.photo)) {
      errors.push(`Agent "${a.name}" (${a.id}) references missing photo: ${a.photo} — either provide the file or set photo to null so the neutral fallback renders.`);
    }
    if (a.profileUrl && !URL_RE.test(a.profileUrl)) {
      warnings.push(`Agent "${a.name}" has malformed profileUrl: ${a.profileUrl}`);
    }
  }

  // --- Notable sales / developments: image existence only (looser schema) ---
  for (const [label, list] of [["Notable sale", notableSales], ["Development", developments]]) {
    for (const item of list) {
      for (const img of item.images || []) {
        if (!fileExists(publicDir, img)) {
          errors.push(`${label} #${item.reference} references missing image file: ${img}`);
        }
      }
    }
  }

  // --- Offices: structural sanity only (many fields are legitimately null) ---
  for (const o of offices) {
    if (!o.name || !o.address) errors.push(`Office "${o.id || "?"}" missing name/address`);
  }

  return { errors, warnings };
}

function runOrFail(input) {
  const { errors, warnings } = validate(input);

  if (warnings.length) {
    console.warn(`\nBuild data warnings (${warnings.length}) — not fatal, but worth checking:`);
    warnings.forEach((w) => console.warn(`  - ${w}`));
  }

  if (errors.length) {
    console.error(`\nBuild FAILED — ${errors.length} data integrity error(s):`);
    errors.forEach((e) => console.error(`  - ${e}`));
    console.error("\nFix the source data (or the scrape/import step that produced it) and re-run the build.");
    process.exit(1);
  }
}

module.exports = { validate, runOrFail };
