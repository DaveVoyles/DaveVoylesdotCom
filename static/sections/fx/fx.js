/* fx: give any element a section effect by naming it.
   <section data-fx="glass-panels">  <h1 data-fx="chrome-type">  <div data-fx="particle-field">  <a data-fx="pointer-fx:goo">
   Syntax: data-fx="name[:arg[,key=value...]] name2 ..."  (effects split on spaces; the first value without "=" is the effect's main argument).
   Each effect's CSS and JS load on the element's first view (IntersectionObserver, 300px ahead), once per page.
   Reduced motion: the effect still mounts and the section decides (glass keeps its CSS glass, hover and trail stay plain, chrome-type, film-grade and particle-field show a still frame).
   ?t=<seconds> (film mode): everything loads at once, no waiting for view.
   Needs the page to load _base/tokens.css and _base/base.css. No dependencies. */

const ROOT = new URL("../", import.meta.url).href; /* the sections folder */
const MOTION = new URL("../../motion/", import.meta.url).href;
const q = new URLSearchParams(location.search);
const film = q.has("t");

const num = (v, d) => { const n = parseFloat(v); return Number.isNaN(n) ? d : n; };
const set = (el, name, v) => { if (v !== undefined && v !== null && v !== "") el.setAttribute(name, v); };

/* Section code finds its elements under an ancestor class (".sx-name [data-x]"). Where the effect has no section wrapper of its own,
   the class goes on <html> and the layout rules it carries are cancelled in fx.css. */
const scopeHtml = (cls) => { document.documentElement.classList.add(cls, "sx-fx-scope"); };

const media = (el) => el.querySelector("img,video,canvas");

/* name -> { dir, prep(el, o) runs before the section script } or { mount(el, o) } */
const EFFECTS = {
  "glass-panels": {
    dir: "glass-panels",
    prep(el, o) {
      el.classList.add("sx-glass-panels", "sx-fx");
      if (!el.querySelector("[data-glass]")) { /* no cards marked: the cards are the children (or the list's children) */
        let kids = [...el.children];
        if (kids.length === 1) kids = [...kids[0].children];
        if (kids.length === 1) kids = [...kids[0].children];
        kids.slice(0, 8).forEach((k) => k.setAttribute("data-glass", ""));
      }
      set(el, "data-glass-strength", o._ ?? o.strength);
      set(el, "data-glass-frost", o.frost);
    },
  },
  "film-grade": {
    dir: "film-grade",
    prep(el, o) {
      const src = media(el);
      if (!src) return console.warn("[fx] film-grade needs an img, video or canvas inside", el), false;
      el.classList.add("sx-film-grade__box", "sx-fx");
      const others = [...el.children].filter((c) => c !== src && !c.contains(src) && c.tagName !== "SOURCE");
      if (others.length) { /* content over a graded backdrop: the box takes the content's height, the content sits above the canvas */
        el.classList.add("sx-fx-backdrop");
        others.forEach((c) => { if (getComputedStyle(c).position === "static") c.style.position = "relative"; c.style.zIndex = "2"; });
      } else if (src.tagName === "IMG" && src.getAttribute("width") && src.getAttribute("height")) {
        el.style.aspectRatio = src.getAttribute("width") + " / " + src.getAttribute("height");
      }
      if (o.ratio) el.style.aspectRatio = o.ratio.replace(":", " / ");
      set(el, "data-grade", o._ ?? o.grade ?? "teal-orange");
      set(el, "data-grade-grain", o.grain);
      set(el, "data-grade-vignette", o.vignette);
      set(el, "data-grade-halation", o.halation);
      set(el, "data-grade-blur", o.blur);
      set(el, "data-grade-blur-amount", o.blurAmount);
      set(el, "data-grade-split", o.split);
    },
  },
  "chrome-type": {
    dir: "chrome-type",
    prep(el, o) {
      scopeHtml("sx-chrome-type");
      const shape = o._ === "ring" || o._ === "blob" ? o._ : "";
      el.classList.add("sx-fx");
      if (shape) {
        el.classList.add("sx-chrome-type__shape");
        set(el, "data-chrome", "shape"); set(el, "data-chrome-shape", shape);
        if (!el.hasAttribute("role")) { el.setAttribute("role", "img"); el.setAttribute("aria-label", o.label || "Chrome " + shape); }
      } else {
        set(el, "data-chrome", "text");
        if (o.size) el.style.setProperty("--sx-ct-size", o.size);
        if (o.width) el.style.maxWidth = o.width;
      }
      set(el, "data-chrome-depth", o.depth);
      set(el, "data-chrome-tint", o.tint);
    },
  },
  "hover-distort": {
    dir: "hover-distort",
    prep(el, o) {
      const img = el.querySelector("img");
      if (!img) return console.warn("[fx] hover-distort needs an img inside", el), false;
      scopeHtml("sx-hover-distort");
      el.classList.add("sx-hover-distort__box", "sx-fx");
      const w = img.getAttribute("width"), h = img.getAttribute("height");
      if (w && h) el.style.aspectRatio = w + " / " + h;
      if (o.ratio) el.style.aspectRatio = o.ratio.replace(":", " / ");
      set(el, "data-distort", o._ === "lens" ? "lens" : "smear");
      set(el, "data-distort-strength", o.strength);
    },
  },
  "pointer-fx": {
    dir: "pointer-fx",
    prep(el, o) {
      scopeHtml("sx-pointer-fx");
      if (o._ === "goo") {
        const label = document.createElement("span");
        label.className = "sx-pointer-fx__goo-label";
        while (el.firstChild) label.appendChild(el.firstChild);
        const layer = document.createElement("span");
        layer.className = "sx-pointer-fx__goo-layer"; layer.setAttribute("aria-hidden", "true");
        layer.innerHTML = '<span class="sx-pointer-fx__goo-base"></span>';
        el.append(layer, label);
        el.classList.add("sx-pointer-fx__goo", "sx-fx");
        if (o.alt !== undefined) el.classList.add("sx-pointer-fx__goo--alt");
        el.setAttribute("data-goo", "");
        if (!document.getElementById("sx-pf-goo")) {
          document.body.insertAdjacentHTML("beforeend",
            '<svg class="sx-pointer-fx__defs" aria-hidden="true" focusable="false"><defs><filter id="sx-pf-goo" x="-20%" y="-60%" width="140%" height="220%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceGraphic" stdDeviation="8" result="b"/><feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10"/></filter></defs></svg>');
        }
      } else { /* trail: the images inside are the pool */
        const imgs = [...el.querySelectorAll("img")];
        if (!imgs.length) return console.warn("[fx] pointer-fx trail needs img children", el), false;
        imgs.forEach((i) => i.classList.add("sx-pointer-fx__tile"));
        el.classList.add("sx-pointer-fx__stage", "sx-fx");
        el.setAttribute("data-trail", "");
        const hint = el.getAttribute("data-fx-hint"); /* optional centred caption that fades once the pointer moves */
        if (hint) { const p = document.createElement("p"); p.className = "sx-pointer-fx__hint"; p.textContent = hint; el.prepend(p); }
      }
    },
  },
  "particle-field": {
    dir: null, mount: mountParticles,
  },
};

/* particle-field is a motion look, not a section: it runs in an iframe layer behind the element's content. */
let embedReady;
function loadEmbed() {
  return (embedReady ||= new Promise((res, rej) => {
    if (window.MotionEmbed) return res();
    const s = document.createElement("script");
    s.src = MOTION + "lib/embed.js"; s.onload = () => res(); s.onerror = rej;
    document.head.appendChild(s);
  }));
}
async function mountParticles(el, o) {
  await loadEmbed();
  el.classList.add("sx-fx", "sx-fx-host");
  const layer = document.createElement("div");
  layer.className = "sx-fx-layer"; layer.setAttribute("aria-hidden", "true");
  el.prepend(layer);
  const cfg = { title: "", sub: "" };
  ["count", "seed", "drift", "glow"].forEach((k) => { if (o[k] !== undefined) cfg[k] = num(o[k], undefined); });
  if (o.accent) cfg.brand = { accent: o.accent };
  const f = window.MotionEmbed.mount(layer, { src: MOTION + "starters/particle-field/index.html", label: "Particle field", bg: "transparent", cfg });
  f.style.aspectRatio = "auto"; f.style.height = "100%"; f.tabIndex = -1;
}

/* ---- loader ---- */
const cssDone = {};
function loadCss(dir) {
  return (cssDone[dir] ||= new Promise((res) => {
    const l = document.createElement("link");
    l.rel = "stylesheet"; l.href = ROOT + dir + "/section.css";
    l.onload = l.onerror = () => res();
    document.head.prepend(l); /* first in <head>: the page's own CSS wins ties */
  }));
}
const chain = {};
function runScript(dir) {
  return (chain[dir] = (chain[dir] || Promise.resolve()).then(() => new Promise((res) => {
    const s = document.createElement("script");
    s.src = ROOT + dir + "/section.js"; /* a re-run only builds the elements the earlier run did not (each section guards with __fxInit) */
    s.onload = s.onerror = () => { s.remove(); res(); };
    document.body.appendChild(s);
  })));
}

const fxCss = document.createElement("link");
fxCss.rel = "stylesheet"; fxCss.href = new URL("fx.css", import.meta.url).href;
document.head.prepend(fxCss);

function parse(attr) {
  return attr.trim().split(/\s+/).filter(Boolean).map((tok) => {
    const i = tok.indexOf(":");
    const name = i < 0 ? tok : tok.slice(0, i);
    const o = {};
    if (i >= 0) tok.slice(i + 1).split(",").forEach((part, n) => {
      const e = part.indexOf("=");
      if (e < 0) { if (n === 0) o._ = part; else o[part] = ""; } else o[part.slice(0, e)] = part.slice(e + 1);
    });
    return { name, o };
  });
}

async function mount(el) {
  const list = parse(el.getAttribute("data-fx") || "");
  const states = [];
  for (const { name, o } of list) {
    const fx = Object.hasOwn(EFFECTS, name) ? EFFECTS[name] : undefined;
    if (!fx) { console.warn("[fx] unknown effect '" + name + "'. Known: " + Object.keys(EFFECTS).join(", ")); states.push(name + ":unknown"); continue; }
    try {
      if (fx.mount) await fx.mount(el, o);
      else {
        await loadCss(fx.dir);
        if (fx.prep(el, o) === false) { states.push(name + ":error"); continue; }
        await runScript(fx.dir);
      }
      states.push(name + ":live");
    } catch (e) { console.warn("[fx] " + name + " failed", e); states.push(name + ":error"); }
  }
  el.setAttribute("data-fx-state", states.join(" "));
}

const seen = new WeakSet();
const io = "IntersectionObserver" in window
  ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { io.unobserve(e.target); mount(e.target); } }), { rootMargin: "300px 0px" })
  : null;

export function scan(root = document) {
  root.querySelectorAll("[data-fx]").forEach((el) => {
    if (seen.has(el)) return;
    seen.add(el);
    if (film || !io) mount(el); else io.observe(el);
  });
}

export const effects = Object.keys(EFFECTS);
scan();
window.fx = { scan, effects };
