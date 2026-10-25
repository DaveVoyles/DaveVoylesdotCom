/* chrome-type: liquid chrome on real text and on simple shapes, in WebGL2.
   [data-chrome="text"]: the element's own words are rasterised (word by word, at the positions the browser laid them out) into a height field;
   [data-chrome="shape"] with data-chrome-shape="ring|blob" does the same for a drawn shape.
   The shader turns the height field into a normal, adds slow liquid ripples, bends it around the pointer and reflects a procedural studio
   (softboxes, horizon, strip lights) that drifts over time. Real text stays in the DOM (selectable, read by search and screen readers);
   the canvas is aria-hidden and ignores the pointer. Pointer: bends the reflection. Touch: a virtual pointer drifts.
   Knobs: data-chrome-depth (0.5-2), data-chrome-tint (cool|warm|mono). ?demo=1 forces the drifting pointer on desktop.
   ?t=<seconds> renders one deterministic frame and sets window.__ready; window.chromeType.seek(t) does the same live (for video).
   Reduced motion: one still frame. No WebGL2: the CSS fallback fill stays. Loops run only while visible; DPR capped at 1.5. */
(function () {
  var q = new URLSearchParams(location.search);
  var calm = matchMedia("(prefers-reduced-motion: no-preference)").matches;
  var fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  var demo = q.has("demo");
  var tParam = q.has("t") ? parseFloat(q.get("t")) : NaN;
  var seekOnly = !isNaN(tParam);

  var VS = "#version 300 es\nin vec2 p;out vec2 v;void main(){v=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}";
  var FS = [
    "#version 300 es\nprecision highp float;in vec2 v;out vec4 o;",
    "uniform sampler2D hf;uniform vec2 px,ptr;uniform float t,hot,depth,aspect,gain;uniform vec3 tint;",
    "float hh(vec2 u){vec3 s=texture(hf,u).rgb;return pow(s.r*.75+s.g*.55,.55)*depth;}",
    "float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}",
    "float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}",
    /* studio: r is the reflected direction (x,y screen plane); returns radiance */
    "float box(vec2 q,vec2 c,vec2 s,float k){vec2 d=abs(q-c)-s;return 1.-smoothstep(-k,k,max(d.x,d.y));}",
    "vec3 env(vec2 r){",
    "float drift=t*.045;",
    "vec2 q=vec2(r.x*.9+drift,r.y);",
    "float up=smoothstep(-.1,.9,r.y);",
    "vec3 c=mix(vec3(.05,.055,.07),vec3(.22,.25,.31),up);",
    "float hz=exp(-pow((r.y+.04)*6.,2.));c+=vec3(.95,.97,1.)*hz*.75;",
    "c*=1.-.6*smoothstep(-.1,-.9,r.y)*(1.-hz);",
    "float xa=fract(q.x*.5+.5);float xs=abs(xa-.5)*2.;",
    "c+=vec3(1.,.98,.95)*box(vec2(xs,r.y),vec2(.18,.55),vec2(.12,.2),.05)*1.6;",
    "c+=vec3(.82,.9,1.)*box(vec2(xs,r.y),vec2(.62,.35),vec2(.06,.38),.04)*1.25;",
    "c+=vec3(1.,.9,.8)*box(vec2(xs,r.y),vec2(.9,.7),vec2(.05,.12),.03)*1.1;",
    "c+=vec3(1.)*box(vec2(xs,r.y),vec2(.4,.85),vec2(.5,.015),.012)*1.3;",
    "c+=vec3(1.)*box(vec2(xs,r.y),vec2(.5,-.38),vec2(.5,.012),.01)*.7;",
    "return c*tint;}",
    "void main(){",
    "vec3 s=texture(hf,v).rgb;float m=s.b;",
    "vec2 e=px*1.4;",
    "float dx=hh(v+vec2(e.x,0.))-hh(v-vec2(e.x,0.));",
    "float dy=hh(v+vec2(0.,e.y))-hh(v-vec2(0.,e.y));",
    "vec2 g=vec2(dx,dy)*7.*gain;",
    "vec2 w=v*vec2(aspect,1.)*3.2;",
    "vec2 fl=vec2(vn(w+vec2(t*.17,t*.11))-.5,vn(w*1.3-vec2(t*.13,-t*.19)+9.)-.5);",
    "g+=fl*.55*smoothstep(.0,.5,s.r+s.g);",
    "vec2 pd=(v-ptr)*vec2(aspect,1.);float pw=exp(-dot(pd,pd)*5.)*hot;",
    "g+=pd*pw*(1.2+depth*.3);",
    "vec3 n=normalize(vec3(-g,1.));",
    "vec2 r=reflect(vec3(0.,0.,-1.),n).xy*1.35;",
    "r+=(ptr-.5)*.5*hot;",
    "vec3 c=env(r);",
    "float edge=1.-smoothstep(.0,.55,s.r);",
    "c+=vec3(.9,.95,1.)*pow(edge,3.)*.18;",
    "float f=pow(1.-n.z,1.5);c=mix(c,c*vec3(1.1,1.15,1.3),f);",
    "c=max(c,mix(vec3(.2,.22,.27),vec3(.5,.54,.62),1.-v.y)*tint*(.8+.4*vn(w*2.+t*.05)));",
    "c=c/(1.+c*.35);c=pow(c,vec3(.92));",
    "c+=(hash(v*913.+t)-.5)*.012;",
    "o=vec4(c*m,m);}"
  ].join("\n");

  var TINTS = { cool: [0.95, 1.0, 1.1], warm: [1.12, 1.0, 0.86], mono: [1, 1, 1] };

  function shader(gl, type, src) {
    var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  function loop(t, phase) { /* virtual pointer in canvas uv */
    return { x: 0.5 + 0.38 * Math.sin(t * 0.55 + phase), y: 0.5 + 0.28 * Math.sin(t * 0.83 + phase * 1.6) };
  }
  /* separable box blur on a Float32 plane, radius r px, passes times */
  function blur(src, w, h, r, passes) {
    var cur = src, tmp = new Float32Array(w * h), dst = new Float32Array(w * h), x, y, k, pass, d = 2 * r + 1;
    r = Math.max(1, Math.round(r)); d = 2 * r + 1;
    for (pass = 0; pass < passes; pass++) {
      for (y = 0; y < h; y++) {
        var acc = 0, o = y * w;
        for (k = -r; k <= r; k++) acc += cur[o + Math.min(w - 1, Math.max(0, k))];
        for (x = 0; x < w; x++) {
          tmp[o + x] = acc / d;
          acc += cur[o + Math.min(w - 1, x + r + 1)] - cur[o + Math.max(0, x - r)];
        }
      }
      for (x = 0; x < w; x++) {
        var ac = 0;
        for (k = -r; k <= r; k++) ac += tmp[Math.min(h - 1, Math.max(0, k)) * w + x];
        for (y = 0; y < h; y++) {
          dst[y * w + x] = ac / d;
          ac += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x];
        }
      }
      var sw = cur === src ? new Float32Array(w * h) : cur; cur = dst; dst = sw;
    }
    return cur;
  }

  function drawText(ctx, el, pad, scale) {
    var cs = getComputedStyle(el), fs = parseFloat(cs.fontSize); ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.font = cs.fontStyle + " " + cs.fontWeight + " " + cs.fontSize + " " + cs.fontFamily;
    if ("letterSpacing" in ctx) ctx.letterSpacing = cs.letterSpacing === "normal" ? "0px" : cs.letterSpacing;
    ctx.textBaseline = "alphabetic"; ctx.fillStyle = "#fff";
    var box = el.getBoundingClientRect(), walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), n, rng = document.createRange();
    while ((n = walker.nextNode())) {
      var txt = n.nodeValue, re = /\S+/g, m;
      while ((m = re.exec(txt))) {
        rng.setStart(n, m.index); rng.setEnd(n, m.index + m[0].length);
        var rc = rng.getClientRects()[0]; if (!rc) continue;
        var asc = ctx.measureText(m[0]).fontBoundingBoxAscent || fs * 0.9;
        ctx.fillText(m[0], rc.left - box.left + pad, rc.top - box.top + pad + asc);
      }
    }
  }
  function drawShape(ctx, kind, W, H) {
    ctx.fillStyle = ctx.strokeStyle = "#fff";
    var cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.34;
    if (kind === "ring") { ctx.lineWidth = R * 0.62; ctx.beginPath(); ctx.arc(cx, cy, R * 0.86, 0, Math.PI * 2); ctx.stroke(); return; }
    ctx.beginPath();
    for (var i = 0; i <= 120; i++) {
      var a = i / 120 * Math.PI * 2, rr = R * (1 + 0.16 * Math.sin(a * 3 + 0.6) + 0.09 * Math.sin(a * 5 + 2.1) + 0.05 * Math.cos(a * 2));
      var x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
      if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    }
    ctx.closePath(); ctx.fill();
  }

  var all = [];
  document.querySelectorAll(".sx-chrome-type [data-chrome]").forEach(function (el, idx) {
    if (el.__fxInit) return; el.__fxInit = 1;
    var isText = el.getAttribute("data-chrome") === "text";
    var canvas = document.createElement("canvas");
    canvas.className = "sx-chrome-type__canvas"; canvas.setAttribute("aria-hidden", "true");
    var gl;
    try { gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: "high-performance" }); } catch (e) {}
    if (!gl) return;
    var prog;
    try {
      prog = gl.createProgram();
      gl.attachShader(prog, shader(gl, gl.VERTEX_SHADER, VS));
      gl.attachShader(prog, shader(gl, gl.FRAGMENT_SHADER, FS));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error("link");
    } catch (e) { return; }
    gl.useProgram(prog);
    var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var U = {}; ["hf", "px", "ptr", "t", "hot", "depth", "aspect", "tint", "gain"].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });
    var depth = parseFloat(el.getAttribute("data-chrome-depth")) || 1;
    var tc = TINTS[el.getAttribute("data-chrome-tint")] || TINTS.cool;
    gl.uniform1f(U.depth, depth); gl.uniform1f(U.gain, isText ? 2.4 : 1); gl.uniform3f(U.tint, tc[0], tc[1], tc[2]); gl.uniform1i(U.hf, 0);
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    var S = { px: 0.5, py: 0.5, tx: 0.5, ty: 0.5, hot: 0, hotT: 0, last: 0, t0: 0, tt: 0, raf: 0, vis: false, ready: false, drift: false, phase: idx * 1.9, film: false, w: 0, h: 0, key: "" };
    var inst = { el: el, S: S };

    function build() { /* rasterise + blur the height field, resize the canvas */
      var r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
      var fs = parseFloat(getComputedStyle(el).fontSize) || 100;
      var pad = isText ? Math.round(fs * 0.12) : 0;
      var dpr = Math.min(devicePixelRatio || 1, 1.5);
      var cw = Math.round((r.width + pad * 2) * dpr), ch = Math.round((r.height + pad * 2) * dpr);
      var key = cw + "x" + ch + "|" + (isText ? el.textContent : "") + "|" + fs;
      if (key === S.key) return true;
      S.key = key;
      var ms = 0.7; /* height field resolution relative to the canvas */
      var mw = Math.max(8, Math.round(cw * ms)), mh = Math.max(8, Math.round(ch * ms));
      var mc = document.createElement("canvas"); mc.width = mw; mc.height = mh;
      var cx = mc.getContext("2d");
      if (isText) drawText(cx, el, pad, dpr * ms); else drawShape(cx, el.getAttribute("data-chrome-shape") || "ring", mw, mh);
      var id = cx.getImageData(0, 0, mw, mh).data, a = new Float32Array(mw * mh), i;
      for (i = 0; i < a.length; i++) a[i] = id[i * 4 + 3] / 255;
      var unit = isText ? fs * dpr * ms : Math.min(mw, mh) * 0.34;
      var wide = blur(a, mw, mh, unit * (isText ? 0.055 : 0.1), 3), narrow = blur(a, mw, mh, unit * (isText ? 0.02 : 0.035), 2);
      var out = new Float32Array(mw * mh * 4);
      for (i = 0; i < a.length; i++) {
        var al = a[i];
        out[i * 4] = wide[i] * al; out[i * 4 + 1] = narrow[i] * al; out[i * 4 + 2] = Math.min(1, al * 1.0);
        out[i * 4 + 3] = 1;
      }
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, mw, mh, 0, gl.RGBA, gl.FLOAT, out);
      if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; gl.viewport(0, 0, cw, ch); }
      canvas.style.left = -pad + "px"; canvas.style.top = -pad + "px";
      canvas.style.width = (r.width + pad * 2) + "px"; canvas.style.height = (r.height + pad * 2) + "px";
      gl.uniform2f(U.px, 1 / mw, 1 / mh); gl.uniform1f(U.aspect, cw / ch);
      return true;
    }
    function draw(t) {
      gl.uniform2f(U.ptr, S.px, S.py); gl.uniform1f(U.hot, S.hot); gl.uniform1f(U.t, t);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    function frame(now) {
      S.raf = 0;
      var dt = S.last ? Math.min((now - S.last) / 1000, 0.05) : 0.016; S.last = now; S.tt += dt;
      if (S.drift) { var p = loop(S.tt, S.phase); S.tx = p.x; S.ty = p.y; S.hotT = 0.8; }
      var k = 1 - Math.exp(-dt * 10);
      S.px += (S.tx - S.px) * k; S.py += (S.ty - S.py) * k; S.hot += (S.hotT - S.hot) * (1 - Math.exp(-dt * 7));
      draw(S.tt);
      if (S.vis) S.raf = requestAnimationFrame(frame);
    }
    function kick() { if (!S.raf && S.vis && S.ready && calm) { S.last = 0; S.raf = requestAnimationFrame(frame); } }
    function seek(t) {
      if (!build()) return;
      var p = loop(t, S.phase); S.px = S.tx = p.x; S.py = S.ty = p.y; S.hot = S.hotT = 0.8; S.tt = t; draw(t);
      window.__ready = true;
    }
    inst.seek = seek;

    el.addEventListener("pointermove", function (e) {
      if (e.pointerType === "touch" || S.drift) return;
      var r = canvas.getBoundingClientRect();
      S.tx = (e.clientX - r.left) / r.width; S.ty = (e.clientY - r.top) / r.height; S.hotT = 1;
    });
    el.addEventListener("pointerenter", function (e) {
      if (e.pointerType === "touch" || S.drift) return;
      var r = canvas.getBoundingClientRect(); S.px = S.tx = (e.clientX - r.left) / r.width; S.py = S.ty = (e.clientY - r.top) / r.height;
    });
    el.addEventListener("pointerleave", function () { if (!S.drift) S.hotT = 0; });

    function start() {
      if (el.style.position === "" && getComputedStyle(el).position === "static") el.style.position = "relative";
      el.appendChild(canvas);
      if (!build()) { canvas.remove(); return; }
      S.ready = true; S.drift = demo || !fine;
      if (seekOnly) canvas.style.transition = "none";
      el.classList.add("is-live");
      all.push(inst);
      if (seekOnly) { seek(tParam); return; }
      draw(0);
      if (S.vis) kick();
    }
    new IntersectionObserver(function (es) {
      S.vis = es[0].isIntersecting;
      if (S.vis) kick(); else if (S.raf) { cancelAnimationFrame(S.raf); S.raf = 0; }
    }, { rootMargin: "80px" }).observe(el);
    new ResizeObserver(function () { if (S.ready) { build(); if (!S.raf) draw(S.tt); } }).observe(el);

    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () { requestAnimationFrame(start); });
  });

  window.chromeType = { seek: function (t) { all.forEach(function (i) { i.seek(t); }); } };
})();
