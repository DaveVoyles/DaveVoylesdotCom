// motion parts: reusable pieces for tutorial and infographic films. Load AFTER engine.js (needs window.M).
//   <script src="engine.js"></script><script src="parts.js"></script>
// Every part is a factory: Parts.x({...}) builds its DOM once and returns { el, at(t) }. at(t) is a pure function of t:
// no timers, no random, no wall clock, so seek(t) repaints identically in any order. Call at(t) from inside M.film render(t).
// Sizes are plain pixels unless noted. Styles are injected once (class prefix pt-) and never use CSS animation or transition.
(function () {
  const M = window.M;
  if (!M) throw new Error("parts.js: load engine.js first");
  const P = (window.Parts = {});
  const { prog, ease, lerp, spring } = M;
  const mk = (tag, cls, parent, css) => {
    const e = document.createElement(tag); if (cls) e.className = cls; if (css) Object.assign(e.style, css); if (parent) parent.appendChild(e); return e;
  };
  const px = (n) => n + "px";

  if (!document.getElementById("pt-css")) {
    const s = mk("style"); s.id = "pt-css";
    s.textContent = `
.pt-win{position:absolute;box-sizing:border-box;overflow:hidden;transform:translateZ(0);background:var(--pt-panel,#15171c);border:.07em solid var(--pt-line,rgba(255,255,255,.1));border-radius:.8em;
 box-shadow:0 1.6em 4em rgba(0,0,0,.5),0 .2em .7em rgba(0,0,0,.4);display:flex;flex-direction:column;color:var(--pt-fg,#f1f0ec);font-family:var(--pt-font,-apple-system,"Helvetica Neue",Helvetica,Arial,sans-serif)}
.pt-bar{flex:none;height:2.4em;display:flex;align-items:center;gap:.45em;padding:0 .9em;border-bottom:.07em solid var(--pt-line,rgba(255,255,255,.1));position:relative}
.pt-bar i{width:.7em;height:.7em;border-radius:50%;background:rgba(255,255,255,.18)}
.pt-bar b{position:absolute;left:0;right:0;text-align:center;font-weight:600;font-size:.8em;color:var(--pt-dim,#8b8f99);pointer-events:none}
.pt-url{position:absolute;left:50%;top:50%;width:46%;height:1.5em;margin:-.75em 0 0 -23%;border-radius:.4em;background:rgba(255,255,255,.07);font-size:.78em;color:var(--pt-dim,#8b8f99);display:flex;align-items:center;justify-content:center}
.pt-body{position:relative;flex:1;overflow:hidden}
.pt-cur{position:absolute;left:0;top:0;pointer-events:none;z-index:50}
.pt-rip{position:absolute;left:0;top:0;border-radius:50%;border:.25em solid var(--pt-accent,#8fb4ff);pointer-events:none;z-index:49}
.pt-mask{position:absolute;overflow:hidden;white-space:nowrap;line-height:1.1;padding-bottom:.3em}
.pt-mask>span{display:inline-block}
.pt-odo{display:inline-flex;height:1.3em;line-height:1.3em;vertical-align:bottom}
.pt-dig{display:inline-block;height:1.3em;overflow:hidden}
.pt-dig span{height:1.3em;line-height:1.3em;display:block;text-align:center}
.pt-rail{position:absolute}
.pt-rail .pt-lab{position:absolute;white-space:nowrap;font-weight:600}
.pt-hw{color:var(--pt-accent,#8fb4ff)}
.pt-caret{display:inline-block;width:.55em;height:1.05em;vertical-align:-.15em;background:currentColor}
`;
    document.head.appendChild(s);
  }

  // ---- cursor: scripted path with easing and click ripples.
  // path: [{t, x, y, d, click}] x,y are fractions (0..1) of the parent; first entry is the rest point; d = move duration (default whole gap);
  // click:true pulses a press and a ripple at that arrival time. opts: {parent, size 24 px, color, fade:[inAt,outAt] optional}.
  P.cursor = ({ parent = document.body, path, size = 26, color = "#fff", ring = "#8fb4ff", ripple = 70, fade } = {}) => {
    const el = mk("div", "pt-cur", parent);
    el.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24"><path d="M5 3l14 8-6.2 1.6L9.6 19z" fill="${color}" stroke="#0b0c0f" stroke-width="1.4" stroke-linejoin="round"/></svg>`;
    el.style.transformOrigin = "5px 3px";
    const rip = mk("div", "pt-rip", parent, { borderColor: ring });
    const clicks = path.filter((k) => k.click).map((k) => k.t);
    return { el, rip, at(t) {
      const W = parent.clientWidth, H = parent.clientHeight, k = M.keys(path, t);
      const press = clicks.reduce((a, c) => a + M.pulse(t, c, 0.07, 0.16), 0);
      el.style.transform = `translate(${k.x * W}px,${k.y * H}px) scale(${1 - 0.18 * Math.min(1, press)})`;
      el.style.opacity = fade ? String(prog(t, fade[0], fade[0] + 0.3) * (1 - prog(t, fade[1], fade[1] + 0.3))) : "1";
      let rp = 0, rx = 0, ry = 0;
      for (const c of clicks) { const p = prog(t, c, c + 0.55); if (p > 0 && p < 1) { rp = p; const kk = M.keys(path, c); rx = kk.x * W; ry = kk.y * H; } }
      const r = ripple * ease.outCubic(rp);
      Object.assign(rip.style, { width: px(r), height: px(r), transform: `translate(${rx - r / 2}px,${ry - r / 2}px)`, opacity: String(rp > 0 ? 1 - rp : 0) });
    } };
  };

  // ---- countUp: a number that counts to a value. target is an existing element (or a parent when odometer:true).
  // opts: {from 0, to, start, dur 1.4, decimals 0, prefix "", suffix "", group true (thousands), fmt(v) overrides, ease outExpo, odometer false}.
  P.countUp = (el, { from = 0, to, start = 0, dur = 1.4, decimals = 0, prefix = "", suffix = "", group = true, fmt, ease: e = ease.outExpo, odometer = false } = {}) => {
    const f = fmt || ((v) => prefix + v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: group }) + suffix);
    if (!odometer) return { el, at(t) { el.textContent = f(lerp(from, to, e(prog(t, start, start + dur)))); } };
    // odometer: one clipped column per digit of the final formatted number, each shows the current digit and rolls to the next one as the value carries
    const final = f(to), cols = []; let nd = 0;
    [...final].forEach((ch) => {
      if (!/\d/.test(ch)) { mk("span", "", el).textContent = ch; return; }
      const d = mk("div", "pt-dig", el), a = mk("span", "", d), b = mk("span", "", d); cols.push({ d, a, b }); nd++;
    });
    el.classList.add("pt-odo");
    const sc = Math.pow(10, decimals);
    return { el, at(t) {
      const v = Math.max(0, lerp(from, to, e(prog(t, start, start + dur)))) * sc;
      cols.forEach((c, i) => {
        const k = nd - 1 - i, x = v / Math.pow(10, k), dg = Math.floor(x) % 10, fr = x - Math.floor(x);
        const g = Math.pow(10, -k), r = ease.inOut(k === 0 ? M.clamp((fr - 0.6) / 0.4) : M.clamp((fr - (1 - g)) / g)); // higher digits only roll while the digits below carry over
        c.a.textContent = dg; c.b.textContent = r > 0.001 ? (dg + 1) % 10 : "";
        c.a.style.transform = `translateY(${-r * 1.3}em)`; c.b.style.transform = `translateY(${-r * 1.3}em)`;
        c.a.style.opacity = String(1 - r); c.b.style.opacity = String(r); // neighbours never show side by side
      });
    } };
  };

  // ---- beatCaption: one headline per beat, masked rise in, faster mask out.
  // beats: [{t, text, out}] (out defaults to the next beat's t - 0.45 so the exit finishes before the next rise starts; last beat stays). opts: {parent, x, y, size px, cls, weight}.
  P.beatCaption = ({ parent = document.body, beats, x = 0, y = 0, size = 52, weight = 650, color, dur = 0.7 } = {}) => {
    const el = mk("div", "", parent, { position: "absolute", left: 0, top: 0 });
    const lines = beats.map((b) => {
      const m = mk("div", "pt-mask", el, { left: px(x), top: px(y), fontSize: px(size), fontWeight: weight, letterSpacing: "-.035em", color: color || "var(--pt-fg,#f1f0ec)" });
      mk("span", "", m).innerHTML = M.safe(b.text); return m;
    });
    return { el, at(t) {
      beats.forEach((b, i) => {
        const out = b.out ?? (i < beats.length - 1 ? beats[i + 1].t - 0.45 : Infinity), p = M.vis(t, b.t, out, dur, dur * 0.5);
        lines[i].firstChild.style.transform = `translateY(${(1 - p) * 115}%)`; lines[i].style.visibility = p < 0.001 ? "hidden" : "visible";
      });
    } };
  };

  // ---- cameraPush: spring zoom and pan on a stage element toward target rects (in the stage's own pixels).
  // stage: the element holding the scene (give it a fixed px width/height, left/top 0). shots: [{t, rect:{x,y,w,h} | null (= full view), pad 0.9 (fill fraction)}].
  // opts: {W, H (viewport px; default innerWidth/Height), dur 1.2, zeta 1, w 7}. Retargeting mid-move bends, never snaps (M.track).
  P.cameraPush = ({ stage, shots, W = innerWidth, H = innerHeight, dur = 1.2, zeta = 1, w = 7 } = {}) => {
    const view = (s) => {
      const r = s.rect || { x: 0, y: 0, w: W, h: H }, k = Math.min(W / r.w, H / r.h) * (s.rect ? (s.pad ?? 0.9) : 1);
      return [r.x + r.w / 2, r.y + r.h / 2, k];
    };
    const ch = [{ t: 0, v: view({ rect: null }) }, ...shots.map((s) => ({ t: s.t, v: view(s) }))];
    stage.style.transformOrigin = "0 0";
    stage.setAttribute("data-layout-allow", "offcanvas safe"); // a push moves the scene past the frame edges on purpose
    return { at(t) {
      const [cx, cy, k] = M.track(ch, t, { dur, zeta, w });
      stage.style.transform = `translate(${W / 2 - cx * k}px,${H / 2 - cy * k}px) scale(${k})`;
    } };
  };

  // ---- windowChrome: a browser or app window frame. Returns { el, body }; put your content in body.
  // opts: {parent, x, y, w, h (px), title, kind "browser" | "app", url, size (font px, scales the chrome), anchor}. Colors: --pt-panel --pt-line --pt-fg --pt-dim.
  P.windowChrome = ({ parent = document.body, x = 0, y = 0, w = 640, h = 400, title = "", kind = "app", url = "", size = 16 } = {}) => {
    const el = mk("div", "pt-win", parent, { left: px(x), top: px(y), width: px(w), height: px(h), fontSize: px(size) });
    const bar = mk("div", "pt-bar", el); bar.innerHTML = "<i></i><i></i><i></i>";
    if (kind === "browser") mk("div", "pt-url", bar).textContent = url; else mk("b", "", bar).textContent = title;
    const body = mk("div", "pt-body", el);
    return { el, body, at() {} };
  };

  // ---- footageFrame: prepared clip footage (motion-reel clips.js + prep-clip.sh) inside a framed window. Needs Clips and Clips.ready().
  // opts: windowChrome opts + {clip: name, start, end, sourceIn, speed, fit, hold}. at(t) draws the exact frame.
  P.footageFrame = ({ clip, start, end, sourceIn, speed, fit = "cover", hold = "last", ...win } = {}) => {
    if (typeof Clips === "undefined") throw new Error("footageFrame: load clips.js first");
    const f = P.windowChrome(win), c = Clips.add(clip, { start, end, sourceIn, speed, fit, hold, parent: f.body });
    return { el: f.el, body: f.body, at(t) { c.show(t); } };
  };

  // ---- progressRail: chapters along a line with a fill that follows time.
  // chapters: [{t, label}] (t = chapter start); end = the second the fill hits 100% (set it before the film's end so the last frame rests). opts: {parent, x, y, w px, orient "h" | "v", size px, accent}.
  P.progressRail = ({ parent = document.body, chapters, end, x = 0, y = 0, w = 600, orient = "h", size = 18, accent = "var(--pt-accent,#8fb4ff)" } = {}) => {
    const v = orient === "v", th = Math.max(3, size * 0.22);
    const el = mk("div", "pt-rail", parent, { left: px(x), top: px(y), width: px(v ? th : w), height: px(v ? w : th), background: "rgba(255,255,255,.14)", borderRadius: px(th), fontSize: px(size) });
    const fill = mk("div", "", el, { position: "absolute", left: 0, top: 0, width: "100%", height: "100%", background: accent, borderRadius: px(th), transformOrigin: v ? "0 0" : "0 50%" });
    const labs = chapters.map((c) => {
      const f = c.t / end, l = mk("div", "pt-lab", el, { color: "var(--pt-dim,#8b8f99)" }); l.textContent = c.label;
      if (v) Object.assign(l.style, { left: px(th + size * 0.8), top: px(f * w - size * 0.6) }); else Object.assign(l.style, { left: px(f * w), top: px(th + size * 0.7) });
      return l;
    });
    return { el, at(t) {
      const p = M.clamp(t / end); fill.style.transform = v ? `scaleY(${p})` : `scaleX(${p})`;
      let a = 0; chapters.forEach((c, i) => { if (t >= c.t) a = i; });
      labs.forEach((l, i) => { const on = i === a; l.style.color = on ? "var(--pt-fg,#f1f0ec)" : "var(--pt-dim,#8b8f99)"; l.style.opacity = on ? "1" : "0.7"; });
    } };
  };

  // ---- highlightWord: a masked headline with one accent keyword. Mark the keyword with {braces}: "Ship {faster} today".
  // opts: {parent, x, y, size px, t (reveal at), hl (keyword lights up at t + hl, default 0.5), weight, color}.
  P.highlightWord = ({ parent = document.body, text, x = 0, y = 0, size = 64, t: t0 = 0, hl = 0.5, weight = 700, color } = {}) => {
    const m = mk("div", "pt-mask", parent, { left: px(x), top: px(y), fontSize: px(size), fontWeight: weight, letterSpacing: "-.035em", color: color || "var(--pt-fg,#f1f0ec)" });
    const s = mk("span", "", m); s.innerHTML = M.safe(text).replace(/\{(.+?)\}/g, '<em class="pt-hw" style="font-style:normal">$1</em>');
    const ems = [...s.querySelectorAll("em")];
    return { el: m, at(t) {
      const p = M.vis(t, t0, Infinity, 0.7); s.style.transform = `translateY(${(1 - p) * 115}%)`; m.style.visibility = p < 0.001 ? "hidden" : "visible";
      const h = ease.outCubic(prog(t, t0 + hl, t0 + hl + 0.4));
      ems.forEach((e) => { e.style.opacity = String(lerp(0.45, 1, h)); e.style.filter = `brightness(${lerp(0.8, 1.15, M.pulse(t, t0 + hl, 0.2, 0.5))})`; e.style.color = h > 0.01 ? "" : "var(--pt-dim,#8b8f99)"; });
    } };
  };

  // ---- typeText: typewriter by t, for terminals. lines: a string or array of strings; typed in order at cps characters per second.
  // opts: {start, cps 22, caret true, gap 0.4 (seconds between lines), hold 1.2 (caret blinks this long after the last key, then goes, so a film never ends on a blink), prompt "$ "}. Writes into el (use white-space:pre).
  P.typeText = (el, { text, start = 0, cps = 22, caret = true, gap = 0.4, hold = 1.2, prompt = "" } = {}) => {
    const lines = Array.isArray(text) ? text : [text];
    el.style.whiteSpace = "pre";
    const starts = []; let a = start; lines.forEach((l) => { starts.push(a); a += l.length / cps + gap; });
    return { el, end: a - gap, at(t) {
      let out = "", cur = false;
      lines.forEach((l, i) => {
        if (t < starts[i]) return;
        const n = Math.min(l.length, Math.floor((t - starts[i]) * cps));
        out += (i ? "\n" : "") + prompt + l.slice(0, n); cur = n < l.length || i === lines.length - 1;
      });
      el.textContent = out;
      if (caret && t >= start && cur && t < a - gap + hold) { const c = mk("span", "pt-caret", el); c.style.opacity = Math.floor(t * 2) % 2 ? "0.15" : "1"; }
    } };
  };

  // ---- scrub: LIVE pages only. A thin bottom scrubber, plus dragging the stage, maps to window.seek(t). Untouched, the film loops on its own.
  // Call AFTER M.film(...). Inert in renders (?render=1 or no live-play): nothing is added, window.seek is not wrapped.
  // opts: {idle 2.5 (seconds untouched before autoplay resumes), color, target (element that takes the stage drag; default the whole document)}.
  // Anything inside an element with [data-no-scrub] ignores the drag (use it for a film's own draggable controls). A resize repaints on the next rAF tick.
  P.scrub = (opts = {}) => {
    const { idle = 2.5, color = "#8fb4ff" } = opts;
    if (/[?&](render|embed)\b/.test(location.search)) return null;
    /* live-play:start */
    const orig = window.seek, D = window.DURATION;
    if (!orig || !D) return null;
    window.seek = () => {}; // the engine's own loop is replaced by ours below
    const bar = mk("div", "", document.body, { position: "fixed", left: 0, right: 0, bottom: 0, height: "14px", cursor: "ew-resize", zIndex: 999, touchAction: "none" });
    const track = mk("div", "", bar, { position: "absolute", left: 0, right: 0, bottom: 0, height: "3px", background: "rgba(255,255,255,.12)" });
    const fill = mk("div", "", track, { height: "100%", width: "100%", background: color, transformOrigin: "0 50%" });
    document.body.style.touchAction = "none";
    let t = 0, last = null, drag = null, touched = -1e9;
    const frac = (e) => M.clamp(e.clientX / innerWidth);
    const down = (abs) => (e) => {
      drag = abs ? { abs: true } : { x: e.clientX, t }; touched = performance.now() / 1000;
      if (abs) t = frac(e) * D;
      try { e.target.setPointerCapture && e.target.setPointerCapture(e.pointerId); } catch (_) {}
    };
    bar.addEventListener("pointerdown", down(true));
    (opts.target || document).addEventListener("pointerdown", (e) => { if (!bar.contains(e.target) && !(e.target.closest && e.target.closest("[data-no-scrub]"))) down(false)(e); });
    addEventListener("pointermove", (e) => {
      if (!drag) return; touched = performance.now() / 1000;
      t = drag.abs ? frac(e) * D : M.clamp(drag.t + ((e.clientX - drag.x) / innerWidth) * D, 0, D);
    });
    const up = () => { if (!drag) return; drag = null; touched = performance.now() / 1000; };
    addEventListener("pointerup", up); addEventListener("pointercancel", up);
    const loop = (ts) => {
      const now = ts / 1000;
      if (last != null && !drag && now - touched > idle) t = (t + (now - last)) % D;
      last = now; orig(t); fill.style.transform = `scaleX(${M.clamp(t / D)})`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    return { el: bar };
    /* live-play:end */
  };
})();
