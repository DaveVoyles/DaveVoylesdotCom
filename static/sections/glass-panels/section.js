/* glass-panels: one WebGL2 canvas behind a card grid draws a flowing background and frosted refractive glass at each [data-glass] rectangle.
   Cards stay real HTML. Knobs on the section: data-glass-strength (0-2), data-glass-frost (0-2). Phone or ?lite=1: lite mode.
   ?t=<seconds> renders one deterministic frame (for video). Reduced motion or no WebGL2: no canvas, CSS backdrop-filter fallback stays. */
(function () {
  var q = new URLSearchParams(location.search);
  var calm = matchMedia("(prefers-reduced-motion: no-preference)").matches;
  var fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  var tParam = q.has("t") ? parseFloat(q.get("t")) : NaN;
  var seekOnly = !isNaN(tParam);
  if (!calm && !seekOnly) return;
  var MAXC = 8;

  var VS = "#version 300 es\nin vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
  var FS = [
    "#version 300 es\nprecision highp float;out vec4 o;",
    "uniform vec2 res,ptr;uniform float time,str,frost,lite,rad;uniform int n;uniform vec4 rc[" + MAXC + "];",
    "uniform vec3 cBg,cInk,cAcc;",
    /* background: dark field, four drifting glows in accent-derived hues, thin diagonal rules so refraction is visible */
    "vec3 bg(vec2 q){",
    "vec2 u=q/res.y;float t=time*.12;vec3 c=cBg;",
    "vec3 h1=cAcc,h2=cAcc.gbr*.9+.1*cInk,h3=cAcc.brg*.9+.1*cInk,h4=mix(cAcc,cInk,.5);",
    "vec2 a=vec2(.35+.25*sin(t*1.3),.45+.2*cos(t*1.1));c=mix(c,h1,.8*exp(-dot(u-a,u-a)*5.));",
    "a=vec2(1.2+.3*cos(t*.9),.35+.25*sin(t*1.4));c=mix(c,h2,.75*exp(-dot(u-a,u-a)*6.));",
    "a=vec2(.8+.35*sin(t*.7+2.),.9+.2*cos(t*1.2));c=mix(c,h3,.7*exp(-dot(u-a,u-a)*5.5));",
    "a=vec2(.2+.2*cos(t*1.6),1.0+.15*sin(t));c=mix(c,h4,.5*exp(-dot(u-a,u-a)*9.));",
    "float d=abs(fract((u.x+u.y*.6)*9.+t*.8)-.5);c=mix(c,cInk,.10*smoothstep(.47,.5,d)*(1.-.4*lite));",
    "d=abs(fract((u.x-u.y*.6)*4.5-t*.5)-.5);c=mix(c,cInk,.05*smoothstep(.485,.5,d));",
    "return c;}",
    "float sdb(vec2 p,vec4 r){vec2 hs=r.zw*.5;vec2 d=abs(p-r.xy-hs)-hs+rad;return length(max(d,0.))+min(max(d.x,d.y),0.)-rad;}",
    "void main(){",
    "vec2 q=vec2(gl_FragCoord.x,res.y-gl_FragCoord.y);",
    "float best=1e5;int bi=-1;",
    "for(int i=0;i<" + MAXC + ";i++){if(i>=n)break;float s=sdb(q,rc[i]);if(s<best){best=s;bi=i;}}",
    "vec3 col=bg(q);",
    "if(bi>=0){",
    "vec4 r=rc[bi];vec2 ctr=r.xy+r.zw*.5;",
    "float sd=best;",
    "float sh=exp(-max(sd,0.)/22.)*step(0.,sd);col=mix(col,cBg*.55,.30*sh);",
    "float cov=1.-smoothstep(-1.,1.,sd);",
    "if(cov>0.){",
    "float dep=max(-sd,0.);",
    "vec2 e=vec2(1.5,0.);",
    "vec2 g=vec2(sdb(q+e.xy,r)-sdb(q-e.xy,r),sdb(q+e.yx,r)-sdb(q-e.yx,r));",
    "vec2 nn=length(g)>1e-4?normalize(g):vec2(0.);",
    "float edge=exp(-dep/(rad*.9));",
    "vec2 off=nn*(-edge*rad*.95*str)+(ctr-q)*.05*str;", /* pull toward edge normal and magnify slightly */
    "vec2 ca=nn*edge*5.*str*(1.-.6*lite);",
    "vec3 acc=vec3(0.);float fr=frost*5.*(1.-lite);",
    "if(lite>.5){acc=vec3(bg(q+off+ca).r,bg(q+off).g,bg(q+off-ca).b);}",
    "else{for(int k=0;k<4;k++){float a=float(k)*1.5708+.4;vec2 j=vec2(cos(a),sin(a))*fr;",
    "acc+=vec3(bg(q+off+ca+j).r,bg(q+off+j).g,bg(q+off-ca+j).b);}acc/=4.;}",
    "acc=mix(acc*.88,cInk,.05);",
    /* light direction tilts with the pointer */
    "vec2 L2=normalize(ptr-ctr+vec2(1e-3,-80.));",
    "float fac=max(dot(nn,-L2),0.);",
    "float rim=exp(-dep/1.6);",
    "float lit=.25+.75*fac;",
    "acc+=cInk*rim*(.22+.55*lit);",
    "acc+=cInk*pow(fac,6.)*exp(-dep/(rad*1.4))*.20;",
    "float pd=length((q-ptr)/(.55*max(r.z,r.w)));acc+=cInk*exp(-pd*pd*2.)*.07;",
    "acc+=cInk*(1.-smoothstep(0.,rad*2.,dep))*.03;",
    "col=mix(col,acc,cov);}",
    "}",
    "col+=(fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-.5)/255.;",
    "o=vec4(col,1.);}"
  ].join("\n");

  function sh(gl, type, src) {
    var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  function hex(v, fb) {
    v = (v || "").trim();
    var m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(v);
    if (!m) return fb;
    var h = m[1].length === 3 ? m[1].replace(/./g, "$&$&") : m[1];
    return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255];
  }
  function vpath(t, w, h) { /* virtual pointer in section px */
    return [w * (0.5 + 0.38 * Math.sin(t * 0.55)), h * (0.5 + 0.34 * Math.sin(t * 0.8 + 1.2))];
  }

  document.querySelectorAll(".sx-glass-panels").forEach(function (root, idx) {
    if (root.__fxInit) return; root.__fxInit = 1;
    var cards = Array.prototype.slice.call(root.querySelectorAll("[data-glass]")).slice(0, MAXC);
    if (!cards.length) return;
    var canvas = document.createElement("canvas");
    canvas.className = "sx-glass-panels__canvas";
    canvas.setAttribute("aria-hidden", "true");
    var gl;
    try { gl = canvas.getContext("webgl2", { alpha: false, antialias: false, powerPreference: "high-performance" }); } catch (e) {}
    if (!gl) return;
    var prog;
    try {
      prog = gl.createProgram();
      gl.attachShader(prog, sh(gl, gl.VERTEX_SHADER, VS));
      gl.attachShader(prog, sh(gl, gl.FRAGMENT_SHADER, FS));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error("link");
    } catch (e) { return; }
    gl.useProgram(prog);
    var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var U = {}; ["res", "ptr", "time", "str", "frost", "lite", "rad", "n", "rc", "cBg", "cInk", "cAcc"].forEach(function (k) { U[k] = gl.getUniformLocation(prog, k); });
    root.insertBefore(canvas, root.firstChild);

    var lite = q.has("lite") || !fine || innerWidth < 700;
    var str = parseFloat(root.getAttribute("data-glass-strength")); if (isNaN(str)) str = 1;
    var frost = parseFloat(root.getAttribute("data-glass-frost")); if (isNaN(frost)) frost = 1;
    var drift = q.has("demo") || !fine;
    var S = { w: 0, h: 0, dpr: 1, px: 0, py: 0, tx: 0, ty: 0, hasPtr: false, raf: 0, vis: false, last: 0, t0: performance.now(), rects: new Float32Array(MAXC * 4), rad: 22, live: false };

    function colors() {
      var cs = getComputedStyle(document.documentElement);
      gl.uniform3fv(U.cBg, hex(cs.getPropertyValue("--ds-bg"), [0.05, 0.055, 0.063]));
      gl.uniform3fv(U.cInk, hex(cs.getPropertyValue("--ds-text"), [0.93, 0.94, 0.95]));
      gl.uniform3fv(U.cAcc, hex(cs.getPropertyValue("--ds-accent"), [0.43, 0.61, 1]));
    }
    function measure() {
      var rr = root.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, lite ? 1 : 1.25);
      var w = Math.max(1, Math.round(rr.width * d)), h = Math.max(1, Math.round(rr.height * d));
      if (w !== S.w || h !== S.h || d !== S.dpr) { S.w = w; S.h = h; S.dpr = d; canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
      cards.forEach(function (c, i) {
        var r = c.getBoundingClientRect();
        S.rects[i * 4] = (r.left - rr.left) * d; S.rects[i * 4 + 1] = (r.top - rr.top) * d;
        S.rects[i * 4 + 2] = r.width * d; S.rects[i * 4 + 3] = r.height * d;
      });
      var br = parseFloat(getComputedStyle(cards[0]).borderTopLeftRadius) || 22;
      S.rad = br * d;
      S.cssW = rr.width; S.cssH = rr.height;
      gl.uniform2f(U.res, w, h); gl.uniform1i(U.n, cards.length);
      gl.uniform4fv(U.rc, S.rects); gl.uniform1f(U.rad, S.rad);
      gl.uniform1f(U.str, str); gl.uniform1f(U.frost, frost); gl.uniform1f(U.lite, lite ? 1 : 0);
    }
    function draw(time, px, py) {
      gl.uniform1f(U.time, time);
      gl.uniform2f(U.ptr, px * S.dpr, py * S.dpr);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    function go() { if (!S.live) { S.live = true; root.classList.add("is-live"); } }
    function frame(now) {
      S.raf = 0;
      var dt = S.last ? Math.min((now - S.last) / 1000, 0.05) : 0.016; S.last = now;
      var time = (now - S.t0) / 1000;
      if (drift || !S.hasPtr) { var p = vpath(time, S.cssW, S.cssH); S.tx = p[0]; S.ty = p[1]; }
      var k = 1 - Math.exp(-dt * 8);
      S.px += (S.tx - S.px) * k; S.py += (S.ty - S.py) * k;
      draw(time, S.px, S.py);
      if (S.vis) S.raf = requestAnimationFrame(frame);
    }
    function kick() { if (!S.raf && S.vis && S.live) { S.last = 0; S.raf = requestAnimationFrame(frame); } }
    function seek(t) {
      measure(); var p = vpath(t, S.cssW, S.cssH); S.px = S.tx = p[0]; S.py = S.ty = p[1];
      draw(t, p[0], p[1]); go(); window.__ready = true;
    }
    if (!drift) {
      root.addEventListener("pointermove", function (e) {
        if (e.pointerType === "touch") return;
        var r = root.getBoundingClientRect(); S.tx = e.clientX - r.left; S.ty = e.clientY - r.top;
        if (!S.hasPtr) { S.hasPtr = true; S.px = S.tx; S.py = S.ty; }
      });
      root.addEventListener("pointerleave", function () { S.hasPtr = false; });
    }
    colors(); measure();
    new MutationObserver(function () { colors(); if (!S.raf) draw((performance.now() - S.t0) / 1000, S.px, S.py); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    new ResizeObserver(function () { measure(); if (!S.raf && S.live) draw(seekOnly ? tParam : (performance.now() - S.t0) / 1000, S.px, S.py); }).observe(root);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measure(); });
    new IntersectionObserver(function (es) {
      S.vis = es[0].isIntersecting;
      if (seekOnly) return;
      if (S.vis) { go(); kick(); } else if (S.raf) { cancelAnimationFrame(S.raf); S.raf = 0; }
    }, { rootMargin: "80px" }).observe(root);
    root.__gpSeek = seek;
    if (seekOnly) seek(tParam);
  });

  window.glassPanels = { seek: function (t) { document.querySelectorAll(".sx-glass-panels").forEach(function (r) { if (r.__gpSeek) r.__gpSeek(t); }); } };
})();
