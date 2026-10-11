// motion-reel engine: helpers + seek(t) wiring. No timers, no CSS transitions in render.
(function () {
  const q = new URLSearchParams(location.search);
  const M = (window.M = {});
  M.clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  M.lerp = (a, b, k) => a + (b - a) * k;
  M.prog = (t, a, b) => M.clamp((t - a) / (b - a));
  M.ease = {
    linear: (p) => p,
    outCubic: (p) => 1 - Math.pow(1 - p, 3),
    outExpo: (p) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p)),
    inCubic: (p) => p * p * p,
    inOut: (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
  };
  // Spring on p in [0,1]. zeta .8 gives ~1.5% overshoot: the most a UI move may have.
  // zeta 1 is critically damped, zeta > 1 overdamped: both arrive with no overshoot (settling, calm moves).
  M.spring = (p, zeta = 0.8, w = 10) => {
    if (p <= 0) return 0;
    if (p >= 1) return 1;
    if (zeta >= 1 - 1e-6) {
      if (zeta < 1 + 1e-6) return 1 - Math.exp(-w * p) * (1 + w * p);
      const q = Math.sqrt(zeta * zeta - 1); w *= zeta + q; // keep the slow pole at w so it still lands by p = 1
      const s = w * q;
      return 1 - Math.exp(-zeta * w * p) * (Math.cosh(s * p) + ((zeta * w) / s) * Math.sinh(s * p));
    }
    const wd = w * Math.sqrt(1 - zeta * zeta);
    return 1 - Math.exp(-zeta * w * p) * (Math.cos(wd * p) + ((zeta * w) / wd) * Math.sin(wd * p));
  };
  // M.track: one value retargeted many times, e.g. a camera. changes = [{t, v}] (v a number or an array; first entry is the start).
  // value = start + sum over changes of (jump size) * spring(that change's own move). Closed form, so seek(t) stays pure,
  // and a retarget mid-move bends the motion instead of snapping it. opts: {dur 0.6 s per move, zeta, w}.
  M.track = (changes, t, { dur = 0.6, zeta, w } = {}) => {
    const v = (x, f) => (Array.isArray(x) ? x.map(f) : f(x));
    let out = v(changes[0].v, (x) => x);
    for (let i = 1; i < changes.length; i++) {
      const k = M.spring(M.prog(t, changes[i].t, changes[i].t + dur), zeta, w), prev = changes[i - 1].v;
      out = Array.isArray(out) ? out.map((x, j) => x + (changes[i].v[j] - prev[j]) * k) : out + (changes[i].v - prev) * k;
    }
    return out;
  };
  // M.vis: visibility 0..1 for a text swap, with its own in and out timing. In eases out over inDur; the exit is faster
  // (default 0.65x the entrance) and eases in. vis(t, inAt, outAt): shows from inAt, leaves from outAt (omit = stays).
  M.vis = (t, inAt, outAt = Infinity, inDur = 0.5, outDur = inDur * 0.65) =>
    M.ease.outExpo(M.prog(t, inAt, inAt + inDur)) * (outAt === Infinity ? 1 : 1 - M.ease.inCubic(M.prog(t, outAt, outAt + outDur)));
  // Seeded noise. Never Math.random.
  M.mulberry32 = (a) => () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  // M.cfg(defaults): `const CONFIG = M.cfg({...})`. ?cfg=<urlencoded JSON> deep-merges over it (objects merge, arrays replace). ?vars=--bg:#fff;--accent:#f40 sets CSS tokens.
  M.cfg = (d) => {
    const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
    const clean = (v) => Array.isArray(v) ? v.map(clean) : v && typeof v === "object" ? Object.keys(v).reduce((o, k) => (k === "__proto__" || k === "constructor" || k === "prototype" ? o : Object.assign(o, { [k]: clean(v[k]) })), {}) : v;
    const m = (a, b) => { for (const k of Object.keys(b)) { if (k === "__proto__" || k === "constructor" || k === "prototype") continue; const v = clean(b[k]); a[k] = v && typeof v === "object" && !Array.isArray(v) && own(a, k) && a[k] && typeof a[k] === "object" ? m(a[k], v) : v; } return a; };
    try { if (q.get("cfg")) m(d, JSON.parse(q.get("cfg"))); } catch (e) { console.warn("motion: bad ?cfg", e); }
    return d;
  };
  if (q.has("embed")) {
    const r = document.documentElement.style;
    (q.get("vars") || "").split(";").forEach((p) => { const i = p.indexOf(":"); if (i > 0) r.setProperty(p.slice(0, i).trim(), p.slice(i + 1).trim()); });
    if (q.get("bg") === "transparent") { const s = document.createElement("style"); s.textContent = "html,body{background:transparent!important}"; document.head.appendChild(s); }
  }
  // M.esc(s): HTML-escape a cfg-sourced string before it goes through innerHTML.
  M.esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  // M.safe(html): keep a small allowlist of inline tags (b i em strong br code span with plain class/style), escape every other < or >. For cfg text that may carry light markup.
  const OKTAG = /^<(\/?)(b|i|em|strong|br|code|span|sub|sup|small)((?:\s+(?:class|style)="[^"<>\\]*")*)\s*\/?>$/i;
  const ENT = { "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  M.safe = (s) => String(s == null ? "" : s).replace(/<[^<>]*>|[<>"']/g, (t) => (t.length > 1 && OKTAG.test(t) && !/url|expression|import|@/i.test(t) ? t : t.replace(/[<>"']/g, (c) => ENT[c])));
  M.hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  M.rgb = (c) => `rgb(${c.map((v) => Math.round(v)).join(",")})`;
  // Keyframes: [{t: arrival time, d: move duration (default: whole gap), ...numbers or [r,g,b]}].
  // Holds the previous state until (t - d), then springs to this one.
  M.keys = (keys, t, ease = M.spring) => {
    let i = 0;
    for (let j = 1; j < keys.length; j++) if (t >= keys[j].t - (keys[j].d ?? keys[j].t - keys[j - 1].t)) i = j;
    if (i === 0) return keys[0];
    const a = keys[i - 1], b = keys[i], d = b.d ?? b.t - a.t;
    const k = ease(M.prog(t, b.t - d, b.t));
    const out = {};
    for (const n in b) {
      if (n === "t" || n === "d") continue;
      out[n] = Array.isArray(b[n]) ? b[n].map((v, x) => M.lerp(a[n][x], v, k)) : M.lerp(a[n], b[n], k);
    }
    return out;
  };
  M.pulse = (t, a, up = 0.08, down = 0.18) => M.prog(t, a, a + up) * (1 - M.prog(t, a + up, a + up + down));
  M.dims = () => {
    const W = innerWidth, H = innerHeight, u = Math.min(W, H) / 100;
    document.documentElement.style.setProperty("--u", u + "px");
    return { W, H, u, tall: H > W * 1.05, square: Math.abs(H - W) <= W * 0.05 };
  };
  // M.film({duration, render(t), poster}): defines window.seek / DURATION; plays live unless ?render=1.
  M.film = ({ duration, render, live = true, poster, settled }) => {
    window.DURATION = duration;
    if (poster != null) window.POSTER = poster; // finished-picture time for render.mjs --poster / --gif
    window.seek = (t) => { render(Math.max(0, Math.min(duration, t))); };
    window.seek(0);
    /* live-play:start */
    if (q.has("embed") && !q.has("render")) {
      // embed player: loop=1 (default) or 0 (play once, rest on the last frame); play=view (default, only while on screen) or auto;
      // reduced motion shows the SETTLED frame (settled, else poster) and waits for the play button. label= is the aria-label.
      const loopOn = q.get("loop") !== "0", inView = q.get("play") !== "auto", reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      let t = 0, last = null, visible = !inView, paused = reduced, raf = 0;
      document.body.setAttribute("role", "img"); document.body.setAttribute("aria-label", q.get("label") || document.title);
      const b = document.createElement("button"); b.type = "button";
      b.style.cssText = "position:fixed;right:6px;bottom:6px;z-index:999;width:28px;height:28px;border:0;border-radius:50%;background:rgba(128,128,128,.35);color:inherit;font:14px/28px sans-serif;cursor:pointer;opacity:0;transition:opacity .2s";
      const sync = () => { b.textContent = paused ? "\u25B6" : "\u275A\u275A"; b.setAttribute("aria-label", paused ? "Play animation" : "Pause animation"); };
      b.onclick = () => { paused = !paused; if (!paused && t >= duration) t = 0; sync(); kick(); };
      b.onfocus = () => (b.style.opacity = 1); b.onblur = () => (b.style.opacity = 0);
      document.addEventListener("pointerenter", () => (b.style.opacity = 0.9)); document.addEventListener("pointerleave", () => (b.style.opacity = 0));
      document.body.appendChild(b); sync();
      if (reduced) { t = settled ?? poster ?? duration; seek(t); } else seek(0);
      const loop = (ts) => {
        raf = 0; if (paused || !visible) { last = null; return; }
        if (last != null) t += (ts - last) / 1000; last = ts;
        if (t >= duration) { if (loopOn) t %= duration; else { t = duration; paused = true; sync(); } }
        seek(t); raf = requestAnimationFrame(loop);
      };
      const kick = () => { if (!raf && !paused && visible) raf = requestAnimationFrame(loop); };
      if (inView) new IntersectionObserver((e) => { visible = e[e.length - 1].isIntersecting; kick(); }).observe(document.documentElement);
      addEventListener("message", (e) => { if (e.data === "motion:pause") { paused = true; sync(); } else if (e.data === "motion:play") { paused = false; sync(); kick(); } });
      addEventListener("resize", () => seek(Math.min(t, duration)));
      kick();
    } else if (live && !q.has("render")) {
      let t0 = null;
      const loop = (ts) => { if (t0 == null) t0 = ts; seek(((ts - t0) / 1000) % duration); requestAnimationFrame(loop); };
      requestAnimationFrame(loop);
      addEventListener("resize", () => seek(0));
    }
    /* live-play:end */
  };
})();
