// Fullscreen gallery lightbox with thumbnail filmstrip and keyboard navigation.
import { trapFocus } from "./focus-trap.js";

const galleryLinks = Array.from(document.querySelectorAll(".gallery a[data-index]"));
if (galleryLinks.length) {
  const images = galleryLinks.map((a) => ({ src: a.href, alt: a.querySelector("img")?.alt || "" }));

  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.hidden = true;
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-label", "Property image gallery");
  lightbox.innerHTML = `
    <div class="lightbox__top">
      <span class="lightbox__count"><span id="lbCurrent">1</span> / ${images.length}</span>
      <button class="lightbox__close" id="lbClose" aria-label="Close gallery">&times;</button>
    </div>
    <div class="lightbox__stage">
      <button class="lightbox__nav lightbox__nav--prev" id="lbPrev" aria-label="Previous image">&#8249;</button>
      <img id="lbImage" src="" alt="" />
      <button class="lightbox__nav lightbox__nav--next" id="lbNext" aria-label="Next image">&#8250;</button>
    </div>
    <div class="lightbox__filmstrip" id="lbFilmstrip"></div>
  `;
  document.body.appendChild(lightbox);

  const lbImage = lightbox.querySelector("#lbImage");
  const lbCurrent = lightbox.querySelector("#lbCurrent");
  const filmstrip = lightbox.querySelector("#lbFilmstrip");
  const closeBtn = lightbox.querySelector("#lbClose");
  const prevBtn = lightbox.querySelector("#lbPrev");
  const nextBtn = lightbox.querySelector("#lbNext");

  images.forEach((img, i) => {
    const thumbBtn = document.createElement("button");
    thumbBtn.type = "button";
    thumbBtn.className = "lightbox__thumb";
    thumbBtn.setAttribute("aria-label", `View photo ${i + 1} of ${images.length}`);
    thumbBtn.addEventListener("click", () => show(i));

    const thumbImg = document.createElement("img");
    thumbImg.src = img.src;
    thumbImg.alt = "";
    thumbImg.loading = "lazy";
    thumbBtn.appendChild(thumbImg);

    filmstrip.appendChild(thumbBtn);
  });

  let current = 0;
  let lastFocused = null;

  function show(i) {
    current = (i + images.length) % images.length;
    lbImage.src = images[current].src;
    lbImage.alt = images[current].alt;
    lbCurrent.textContent = current + 1;
    Array.from(filmstrip.children).forEach((el, idx) => {
      const isActive = idx === current;
      el.classList.toggle("is-active", isActive);
      if (isActive) el.setAttribute("aria-current", "true");
      else el.removeAttribute("aria-current");
    });
    filmstrip.children[current]?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }

  function open(i) {
    lastFocused = document.activeElement;
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    show(i);
    closeBtn.focus();
  }

  function close() {
    lightbox.hidden = true;
    document.body.style.overflow = "";
    lastFocused?.focus();
  }

  galleryLinks.forEach((a, i) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      open(i);
    });
  });

  closeBtn.addEventListener("click", close);
  prevBtn.addEventListener("click", () => show(current - 1));
  nextBtn.addEventListener("click", () => show(current + 1));

  document.addEventListener("keydown", (e) => {
    if (lightbox.hidden) return;
    if (e.key === "Escape") {
      close();
      return;
    }
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
    trapFocus(lightbox, e);
  });

  let touchStartX = null;
  lightbox.querySelector(".lightbox__stage").addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  lightbox.querySelector(".lightbox__stage").addEventListener("touchend", (e) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (dx > 40) show(current - 1);
    if (dx < -40) show(current + 1);
    touchStartX = null;
  }, { passive: true });
}
