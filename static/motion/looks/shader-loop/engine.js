// motion engine (trimmed from studio motion/lib/engine.js): cfg, brand, dims and the embed player. No timers in render.
(function () {
  const q = new URLSearchParams(location.search);
  const M = (window.M = {});
  M.clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  M.mulberry32 = (a) => () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  M.cfg = (d) => {
    const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
    const clean = (v) => Array.isArray(v) ? v.map(clean) : v && typeof v === "object" ? Object.keys(v).reduce((o, k) => (k === "__proto__" || k === "constructor" || k === "prototype" ? o : Object.assign(o, { [k]: clean(v[k]) })), {}) : v;
    const m = (a, b) => { for (const k of Object.keys(b)) { if (k === "__proto__" || k === "constructor" || k === "prototype") continue; const v = clean(b[k]); a[k] = v && typeof v === "object" && !Array.isArray(v) && own(a, k) && a[k] && typeof a[k] === "object" ? m(a[k], v) : v; } return a; };
    try { if (q.get("cfg")) m(d, JSON.parse(q.get("cfg"))); } catch (e) { console.warn("motion: bad ?cfg", e); }
    return d;
  };
  M.hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  M.brand = (b = {}) => {
    try { if (q.get("brand")) Object.assign(b, JSON.parse(q.get("brand"))); } catch (e) { console.warn("motion: bad ?brand", e); }
    const r = document.documentElement.style;
    ["bg", "fg", "accent"].forEach((n) => b[n] != null && r.setProperty("--" + n, b[n]));
    return b;
  };
  if (q.has("embed")) {
    if (q.get("bg") === "transparent") { const s = document.createElement("style"); s.textContent = "html,body{background:transparent!important}"; document.head.appendChild(s); }
  }
  M.dims = () => {
    const W = innerWidth, H = innerHeight, u = Math.min(W, H) / 100;
    document.documentElement.style.setProperty("--u", u + "px");
    return { W, H, u };
  };
  // M.film({duration, render(t), poster}): defines window.seek; ?t=4.5 freezes on that frame; ?embed plays only while on screen,
  // and reduced motion shows the poster frame and waits for the play button.
  M.film = ({ duration, render, poster }) => {
    window.seek = (t) => { render(Math.max(0, Math.min(duration, t))); };
    window.seek(0);
    if (q.has("t")) {
      const at = Number(q.get("t")) || 0;
      seek(at); addEventListener("resize", () => seek(at));
      return;
    }
    const inView = q.get("play") !== "auto", reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let t = 0, last = null, visible = !inView, paused = reduced, raf = 0;
    document.body.setAttribute("role", "img"); document.body.setAttribute("aria-label", q.get("label") || document.title);
    const b = document.createElement("button"); b.type = "button";
    b.style.cssText = "position:fixed;right:6px;bottom:6px;z-index:999;width:28px;height:28px;border:0;border-radius:50%;background:rgba(128,128,128,.35);color:inherit;font:14px/28px sans-serif;cursor:pointer;opacity:0;transition:opacity .2s";
    const sync = () => { b.textContent = paused ? "▶" : "❚❚"; b.setAttribute("aria-label", paused ? "Play animation" : "Pause animation"); };
    b.onclick = () => { paused = !paused; sync(); kick(); };
    b.onfocus = () => (b.style.opacity = 1); b.onblur = () => (b.style.opacity = 0);
    document.addEventListener("pointerenter", () => (b.style.opacity = 0.9)); document.addEventListener("pointerleave", () => (b.style.opacity = 0));
    document.body.appendChild(b); sync();
    if (reduced) { t = poster ?? duration; seek(t); } else seek(0);
    const loop = (ts) => {
      raf = 0; if (paused || !visible) { last = null; return; }
      if (last != null) t += (ts - last) / 1000; last = ts;
      if (t >= duration) t %= duration;
      seek(t); raf = requestAnimationFrame(loop);
    };
    const kick = () => { if (!raf && !paused && visible) raf = requestAnimationFrame(loop); };
    if (inView) new IntersectionObserver((e) => { visible = e[e.length - 1].isIntersecting; kick(); }).observe(document.documentElement);
    addEventListener("message", (e) => { if (e.data === "motion:pause") { paused = true; sync(); } else if (e.data === "motion:play") { paused = false; sync(); kick(); } });
    addEventListener("resize", () => seek(Math.min(t, duration)));
    kick();
  };
})();
