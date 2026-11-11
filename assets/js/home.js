/**
 * Home: load the particle-field hero script after first paint.
 * The script pauses off-screen (IntersectionObserver) and draws one still frame
 * under prefers-reduced-motion. Skipped under Save-Data (static gradient hero stays).
 */
(function () {
  const host = document.querySelector("[data-webgl-src]");
  if (!host) return;
  const conn = navigator.connection;
  if (conn && conn.saveData) return;
  const mount = () => {
    const s = document.createElement("script");
    s.src = host.dataset.webglSrc;
    s.async = true;
    document.head.appendChild(s);
  };
  if ("requestIdleCallback" in window) requestIdleCallback(mount, { timeout: 1500 });
  else setTimeout(mount, 300);
})();

/* Thumbnails fade in and rise 8px on first view (200 ms, CSS). Skipped under reduced motion. */
(function () {
  if (!("IntersectionObserver" in window)) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const thumbs = document.querySelectorAll(".ledger-thumb");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.remove("is-pre");
      io.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -8% 0px" });
  thumbs.forEach((t) => { t.classList.add("is-pre"); io.observe(t); });
})();
