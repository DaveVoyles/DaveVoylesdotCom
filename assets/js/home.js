/**
 * Home interactions: lazy WebGL hero, agent-loop embed, card spotlight/tilt,
 * and the layer-stack lift on the first "Currently building" card.
 */
(function () {
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const idle = (f) => setTimeout(f, 100);

  // Lazy WebGL hero: fetch the script only after first paint.
  const host = document.querySelector("[data-home-webgl]");
  if (host && host.dataset.webglSrc) {
    idle(() => {
      const s = document.createElement("script");
      s.src = host.dataset.webglSrc;
      s.async = true;
      document.head.appendChild(s);
    });
  }

  // Motion looks are iframes, transparent over the page.
  const mount = (el, src, label, aspect) => {
    const p = new URLSearchParams({ embed: "1", play: "auto", bg: "transparent", vars: "--bg:transparent", label });
    const f = document.createElement("iframe");
    f.src = src + "?" + p;
    f.title = label;
    f.loading = "lazy";
    f.setAttribute("scrolling", "no");
    f.style.cssText = "display:block;width:100%;border:0;background:transparent;aspect-ratio:" + aspect;
    el.appendChild(f);
    return f;
  };
  const status = document.querySelector(".home-emb[data-embed]");
  if (status) {
    const io = new IntersectionObserver((es) => {
      if (es[0].isIntersecting) { io.disconnect(); mount(status, status.dataset.embed, status.dataset.label, "16/9"); }
    }, { rootMargin: "200px" });
    io.observe(status);
  }

  // Spotlight + tilt on the building cards.
  document.querySelectorAll("a.home-building-card").forEach((c) => {
    c.addEventListener("pointermove", (e) => {
      const b = c.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
      c.style.setProperty("--mx", x + "px");
      c.style.setProperty("--my", y + "px");
      if (RM) return;
      c.classList.add("is-live");
      c.style.setProperty("--ry", ((x / b.width - 0.5) * 7).toFixed(2) + "deg");
      c.style.setProperty("--rx", ((0.5 - y / b.height) * 6).toFixed(2) + "deg");
    });
    c.addEventListener("pointerleave", () => {
      c.classList.remove("is-live");
      c.style.setProperty("--rx", "0deg");
      c.style.setProperty("--ry", "0deg");
    });
  });

  // First card: lift apart the layer stack on hover or focus.
  const sys = document.querySelector("a.home-building-card[data-lift]");
  if (sys) {
    const lift = sys.querySelector(".home-lift"), box = lift.firstElementChild;
    let fr = null;
    const msg = (m) => { try { fr && fr.contentWindow.postMessage(m, "*"); } catch (e) {} };
    const open = () => {
      if (!fr) fr = mount(box, sys.dataset.lift, "Layer stack: the system lifted apart", "1/1");
      sys.classList.add("is-open");
      lift.removeAttribute("aria-hidden");
      msg("motion:play");
    };
    const close = () => { sys.classList.remove("is-open"); lift.setAttribute("aria-hidden", "true"); msg("motion:pause"); };
    sys.addEventListener("pointerenter", open);
    sys.addEventListener("pointerleave", () => { if (!sys.contains(document.activeElement)) close(); });
    sys.addEventListener("focusin", open);
    sys.addEventListener("focusout", (e) => { if (!sys.contains(e.relatedTarget)) close(); });
  }
})();
