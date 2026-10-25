/* pointer-fx: an image trail behind the cursor and a gooey (metaball) hover button.
   [data-trail]: a stage whose .sx-pointer-fx__tile images are a recycled pool. A tile is dropped every 72 px of pointer travel and fades out; the pool never grows.
   [data-goo]: a link or button with a .sx-pointer-fx__goo-layer; blobs trail the pointer past the button edge and merge with it through the SVG goo filter.
   Touch: the trail drifts along a slow virtual path while visible; a goo button follows the finger. ?demo=1 gives desktop the same drift and a looping goo.
   Reduced motion: the trail is one still arrangement and the buttons stay plain pills. No library. Only transform and opacity change per frame.
   ?t=<seconds> renders one deterministic frame (virtual pointer) and sets window.__ready; window.pointerFx.seek(t) does the same live, for a stitcher. */
(function () {
  var q = new URLSearchParams(location.search);
  var calm = matchMedia("(prefers-reduced-motion: no-preference)").matches;
  var fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  var demo = q.has("demo");
  var tParam = q.has("t") ? parseFloat(q.get("t")) : NaN;
  var seekOnly = !isNaN(tParam);
  var now = function () { return performance.now() / 1000; };
  var all = [];
  var LIFE = 1.15, GAP = 0.11, STEP = 72;

  function easeOut(x) { return 1 - Math.pow(1 - x, 3); }

  /* ---------- image trail ---------- */
  document.querySelectorAll(".sx-pointer-fx [data-trail]").forEach(function (stage) {
    if (stage.__fxInit) return; stage.__fxInit = 1;
    var tiles = [].slice.call(stage.querySelectorAll(".sx-pointer-fx__tile"));
    if (!tiles.length) return;
    var items = [], n = 0, raf = 0, vis = false, drift = false, nextDrift = 0, lx = -1e4, ly = -1e4, lt = 0;
    var rot = tiles.map(function (_, i) { return ((i * 47) % 29) - 14; });

    function path(t) { /* the virtual pointer: a slow loop across the stage */
      var w = stage.clientWidth, h = stage.clientHeight;
      return [w * (0.5 + 0.4 * Math.sin(t * 0.8 + 0.3) * Math.cos(t * 0.23)), h * (0.5 + 0.34 * Math.sin(t * 1.25 + 1.1))];
    }
    function spawn(x, y, t0) { var i = n % tiles.length; n++; items[i] = { x: x, y: y, t0: t0, k: n, on: false }; }
    function paint(at) {
      var alive = false;
      for (var i = 0; i < tiles.length; i++) {
        var it = items[i]; if (!it) continue;
        var a = (at - it.t0) / LIFE, el = tiles[i];
        if (a < 0 || a >= 1) { if (it.on) { el.style.opacity = 0; it.on = false; } continue; }
        alive = true; it.on = true;
        var pop = easeOut(Math.min(1, a / 0.22)), fade = a < 0.45 ? 1 : 1 - Math.pow((a - 0.45) / 0.55, 2);
        el.style.transform = "translate3d(" + it.x.toFixed(1) + "px," + (it.y - 16 * a).toFixed(1) + "px,0) translate(-50%,-50%) rotate(" + rot[i] + "deg) scale(" + (0.55 + 0.45 * pop).toFixed(3) + ")";
        el.style.opacity = fade.toFixed(3);
        el.style.zIndex = 1 + (it.k % 500);
      }
      return alive;
    }
    function tick() {
      raf = 0;
      var t = now();
      if (drift && vis) while (nextDrift <= t) { var p = path(nextDrift); spawn(p[0], p[1], nextDrift); nextDrift += GAP; }
      if (paint(t) || (drift && vis)) raf = requestAnimationFrame(tick);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(tick); }
    function seek(t) { /* deterministic: replay the virtual pointer up to t */
      stage.classList.add("is-moving");
      items = []; n = 0;
      for (var k = Math.max(0, Math.floor((t - LIFE) / GAP)); k <= Math.floor(t / GAP); k++) { var p = path(k * GAP); spawn(p[0], p[1], k * GAP); }
      paint(t);
    }
    stage.__pfSeek = seek;
    all.push(stage);

    if (seekOnly) { seek(tParam); return; }
    if (!calm) { seek(2.6); addEventListener("resize", function () { seek(2.6); }); return; } /* still arrangement */
    stage.classList.add("is-live");
    stage.addEventListener("pointermove", function (e) {
      if (e.pointerType === "touch") return;
      var r = stage.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, t = now();
      stage.classList.add("is-moving");
      if (Math.hypot(x - lx, y - ly) >= STEP && t - lt > 0.03) { spawn(x, y, t); lx = x; ly = y; lt = t; kick(); }
    });
    drift = demo || !fine;
    new IntersectionObserver(function (es) {
      vis = es[0].isIntersecting;
      if (vis && drift) { nextDrift = now(); stage.classList.add("is-moving"); kick(); }
    }).observe(stage);
  });

  /* ---------- gooey button ---------- */
  var SIZE = [30, 25, 20, 15], FAC = [1.9, 1.6, 1.35, 1.1], LAG = [0, 0.07, 0.14, 0.21], RATE = [20, 13, 9, 6];
  document.querySelectorAll(".sx-pointer-fx [data-goo]").forEach(function (btn) {
    if (btn.__fxInit) return; btn.__fxInit = 1;
    var layer = btn.querySelector(".sx-pointer-fx__goo-layer");
    if (!layer) return;
    var blobs = SIZE.map(function (s) {
      var b = document.createElement("span"); b.className = "sx-pointer-fx__blob";
      b.style.width = b.style.height = s + "px"; layer.appendChild(b); return b;
    });
    var S = blobs.map(function () { return { x: 0, y: 0, s: 0 }; });
    var P = [0, 0], active = false, virtUntil = 0, virt = false, raf = 0, last = 0, vis = !seekOnly;

    function virtP(t) { var w = btn.offsetWidth / 2, h = btn.offsetHeight / 2; return [w * 0.95 * Math.sin(1.3 * t + 0.4), h * 0.9 * Math.sin(2.1 * t)]; }
    function put(i, x, y, s) {
      var b = blobs[i], k = SIZE[i] / 2, mx = layer.offsetWidth / 2 - k, my = layer.offsetHeight / 2 - k; /* centre the blob; the layer centre is the button centre, and a blob never leaves the layer */
      x = Math.max(-mx, Math.min(mx, x)); y = Math.max(-my, Math.min(my, y));
      b.style.transform = "translate3d(" + (x - k).toFixed(1) + "px," + (y - k).toFixed(1) + "px,0) scale(" + s.toFixed(3) + ")";
      b.style.opacity = s > 0.01 ? 1 : 0;
    }
    function tick() {
      raf = 0;
      var t = now(), dt = Math.min(0.05, last ? t - last : 0.016); last = t;
      var on = active || (virt && (virtUntil === Infinity || t < virtUntil)), moving = false;
      if (virt && on) P = virtP(t); else if (!active) P = [0, 0];
      for (var i = 0; i < blobs.length; i++) {
        var k = 1 - Math.exp(-dt * RATE[i]), st = S[i];
        st.x += (P[0] * FAC[i] - st.x) * k; st.y += (P[1] * FAC[i] - st.y) * k; st.s += ((on ? 1 : 0) - st.s) * (1 - Math.exp(-dt * 14));
        if (Math.abs(st.x - P[0] * FAC[i]) > 0.2 || Math.abs(st.y - P[1] * FAC[i]) > 0.2 || (on ? 1 - st.s : st.s) > 0.01) moving = true;
        put(i, st.x, st.y, st.s);
      }
      if (moving || on) raf = requestAnimationFrame(tick); else last = 0;
    }
    function kick() { if (!raf && vis) raf = requestAnimationFrame(tick); }
    function seek(t) { /* deterministic: every blob samples the virtual pointer a little later in the past */
      for (var i = 0; i < blobs.length; i++) { var p = virtP(t - LAG[i]); put(i, p[0] * FAC[i], p[1] * FAC[i], 1); }
    }
    btn.__pfSeek = seek;
    all.push(btn);
    if (seekOnly) { layer.classList.add("is-goo"); seek(tParam); return; }
    if (!calm) return; /* plain pill */
    layer.classList.add("is-goo");

    function at(e) { var r = btn.getBoundingClientRect(); P = [e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)]; active = true; virt = false; kick(); }
    btn.addEventListener("pointerenter", at);
    btn.addEventListener("pointermove", at);
    btn.addEventListener("pointerdown", at);
    btn.addEventListener("pointerleave", function () { active = false; kick(); });
    btn.addEventListener("pointerup", function (e) { if (e.pointerType === "touch") { active = false; kick(); } });
    btn.addEventListener("pointercancel", function () { active = false; kick(); });
    btn.addEventListener("focus", function () { if (btn.matches(":focus-visible")) { virt = true; virtUntil = now() + 1.2; kick(); } });
    if (demo) {
      virt = true; virtUntil = Infinity;
      new IntersectionObserver(function (es) { vis = es[0].isIntersecting; if (vis) kick(); }).observe(btn);
    } else {
      new IntersectionObserver(function (es) { vis = es[0].isIntersecting; if (!vis) { active = false; virt = false; } }).observe(btn);
    }
    kick();
  });

  window.pointerFx = { seek: function (t) { all.forEach(function (el) { if (el.__pfSeek) el.__pfSeek(t); }); window.__ready = true; } };
  if (seekOnly) window.__ready = true;
})();
