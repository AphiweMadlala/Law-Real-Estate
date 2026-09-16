// Small shared focus-trap used by the mobile nav and the gallery lightbox —
// both are full-screen modal overlays, so Tab/Shift+Tab should cycle within
// them rather than letting focus escape into the page behind.
export function getFocusable(container) {
  const selector =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  return Array.from(container.querySelectorAll(selector)).filter(
    (el) => el.getClientRects().length > 0
  );
}

// Call from a keydown listener on the modal container. Returns true if it
// handled (and should stop further processing of) the event.
export function trapFocus(container, event) {
  if (event.key !== "Tab") return false;
  const focusable = getFocusable(container);
  if (focusable.length === 0) return false;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
    return true;
  }
  if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
    return true;
  }
  return false;
}
