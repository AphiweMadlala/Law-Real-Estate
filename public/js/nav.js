import { trapFocus } from "./focus-trap.js";

const toggle = document.getElementById("navToggle");
const mobileNav = document.getElementById("mobileNav");
const closeBtn = document.getElementById("mobileNavClose");

function openNav() {
  mobileNav.hidden = false;
  toggle.setAttribute("aria-expanded", "true");
  document.body.style.overflow = "hidden";
  const firstLink = mobileNav.querySelector("a");
  if (firstLink) firstLink.focus();
}

function closeNav() {
  mobileNav.hidden = true;
  toggle.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
  toggle.focus();
}

if (toggle && mobileNav) {
  toggle.addEventListener("click", openNav);
  closeBtn?.addEventListener("click", closeNav);
  mobileNav.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeNav();
      return;
    }
    trapFocus(mobileNav, e);
  });
  mobileNav.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeNav));
}

// Header shadow on scroll
const header = document.querySelector(".site-header");
if (header) {
  const onScroll = () => {
    header.style.boxShadow = window.scrollY > 8 ? "var(--shadow-sm)" : "none";
  };
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}
