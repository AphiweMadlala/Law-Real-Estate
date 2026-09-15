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

module.exports = { BASE_PATH, SITE_URL };
