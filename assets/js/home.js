/**
 * Home: mount the shader-loop look (a motion look, iframe) behind the hero after first paint.
 * The look pauses off-screen on its own and shows one still frame under prefers-reduced-motion.
 */
(function () {
  const host = document.querySelector("[data-look]");
  if (!host) return;
  const conn = navigator.connection;
  if (conn && conn.saveData) return; // data saver: keep the static hero
  const mount = () => {
    const p = new URLSearchParams({ embed: "1", bg: "transparent", label: host.dataset.label });
    const f = document.createElement("iframe");
    f.src = host.dataset.look + "?" + p;
    f.title = host.dataset.label;
    f.loading = "lazy";
    f.tabIndex = -1;
    f.setAttribute("scrolling", "no");
    f.addEventListener("load", () => host.classList.add("is-ready"));
    host.appendChild(f);
  };
  if ("requestIdleCallback" in window) requestIdleCallback(mount, { timeout: 1500 });
  else setTimeout(mount, 300);
})();
