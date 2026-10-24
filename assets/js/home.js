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
