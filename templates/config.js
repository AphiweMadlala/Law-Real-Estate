// Deployment config for this proposal.
//
// GitHub Pages serves this repo as a *project* site — https://aphiwemadlala.github.io/Law-Real-Estate/ —
// which means every page lives under the /Law-Real-Estate subpath, not at the
// domain root. BASE_PATH is prepended to every root-absolute asset/link/fetch
// path (CSS, JS, images, data JSON, internal hrefs) so they resolve correctly
// there. If this ever moves to its own domain or a root-path host (Netlify,
// Vercel, a custom domain), set BASE_PATH back to "" and nothing else needs
// to change — every path in the templates is built from this one constant.
const BASE_PATH = "/Law-Real-Estate";
const SITE_URL = "https://aphiwemadlala.github.io/Law-Real-Estate";

// This deployment is a design proposal, not LAW's live website — it must
// never compete with lawrealestate.co.za in search results. When true,
// every generated page gets <meta name="robots" content="noindex, nofollow">
// (added centrally in templates/partials.js's head()), which is the part
// crawlers actually have to respect on a per-page basis; robots.txt alone
// is advisory and some crawlers ignore it for pages they already know about.
//
// TO LAUNCH THIS AS A REAL PRODUCTION SITE: set this to `false`. That is the
// ONLY change needed to stop emitting the noindex tag — nothing else in the
// build depends on this flag. Do so only once this is genuinely LAW's
// production deployment, not before.
const PROPOSAL_MODE = true;

module.exports = { BASE_PATH, SITE_URL, PROPOSAL_MODE };
