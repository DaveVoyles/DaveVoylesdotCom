/* film-grade: a cinematic finish layer over any [data-grade] box that holds one <img>, <video> or <canvas>.
   One WebGL2 pass: progressive blur toward an edge, halation, colour grade, vignette, film grain.
   Attributes on the box (all optional): data-grade="teal-orange|bleach|noir|warm|none" (default teal-orange),
   data-grade-grain 0-1 (0.45), data-grade-vignette 0-1 (0.55), data-grade-halation 0-1 (0.5),
   data-grade-blur "bottom|top|none" (none), data-grade-blur-amount 0-1 (0.6), data-grade-split 0-1 (raw image left of this x, 0 = off).
   Runtime: filmGrade.set(box, {grade, grain, vignette, halation, blur, blurAmount, split}); filmGrade.seek(t) for video.
   ?t=<seconds> draws one deterministic frame (grain seeded by t, window.__sourceAt(t) redraws a canvas source) and sets window.__ready.
   No WebGL2: the source stays and CSS (filter, vignette, grain overlay) approximates the grade. Reduced motion: static grain, no loop.
   Loops run only while the box is visible; grain steps at 24 fps; DPR cap 1.5. */
(function () {
  var q = new URLSearchParams(location.search);
  var tParam = q.has("t") ? parseFloat(q.get("t")) : NaN;
  var film = !isNaN(tParam);
  var calm = matchMedia("(prefers-reduced-motion: no-preference)").matches;
  var GRADES = { "none": 0, "teal-orange": 1, "bleach": 2, "noir": 3, "warm": 4 };

  var VS = "#version 300 es\nin vec2 p;out vec2 v;void main(){v=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}";
  var FS = [
    "#version 300 es", "precision highp float;in vec2 v;out vec4 o;",
    "uniform sampler2D tex;uniform float boxA,texA,seed,grain,vig,halo,blurK,blurDir,split,gscale;uniform int grade;uniform vec2 px;",
    "vec2 cover(vec2 u){vec2 s=boxA>texA?vec2(1.,texA/boxA):vec2(boxA/texA,1.);return (u-.5)*s+.5;}",
    "vec3 S(vec2 u){return texture(tex,cover(u)).rgb;}",
    "float hash(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}",
    "float luma(vec3 c){return dot(c,vec3(.2126,.7152,.0722));}",
    /* golden-angle disc taps */
    "vec3 disc(vec2 u,float r,int n,float th){vec3 a=vec3(0.);float w=0.;for(int i=0;i<16;i++){if(i>=n)break;float f=(float(i)+.5)/float(n);float ang=float(i)*2.39996;vec2 d=vec2(cos(ang),sin(ang))*sqrt(f)*r;vec3 c=S(u+d*px*vec2(1.,1.));float k=th>0.?smoothstep(th,th+.25,luma(c)):1.;a+=c*k;w+=1.;}return a/w;}",
    "vec3 doGrade(vec3 c){",
    "float l=luma(c);",
    "if(grade==1){vec3 sh=vec3(.02,.16,.22),hi=vec3(1.,.62,.28);c=mix(c,c*(1.+.28*mix(sh,hi,smoothstep(.15,.85,l))*3.),.65);c=mix(vec3(luma(c)),c,1.18);c=pow(max(c,0.),vec3(1.06));c+=sh*.1*(1.-l);}",
    "else if(grade==2){float g=luma(c);c=mix(vec3(g),c,.45);c=(c-.5)*1.32+.5;c=mix(c,vec3(g),.12);c+=vec3(.015,.02,.03)*(1.-g);c=pow(max(c,0.),vec3(.95));}",
    "else if(grade==3){float g=luma(c);g=(g-.5)*1.38+.5;g=pow(clamp(g,0.,1.),1.15);c=vec3(g)*vec3(.97,.985,1.03);}",
    "else if(grade==4){c=c*vec3(1.1,1.0,.84);c=mix(vec3(luma(c)),c,1.12);c=pow(max(c,0.),vec3(.98));c+=vec3(.05,.022,0.)*smoothstep(.5,0.,l);}",
    "return c;}",
    "void main(){",
    "vec2 u=v;vec3 c;",
    "float e=blurDir>.5?smoothstep(.62,1.,v.y):(blurDir<-.5?smoothstep(.38,0.,v.y):0.);",
    "float br=blurK*e*28.*gscale;",
    "c=br>.4?disc(u,br,16,0.):S(u);",
    "vec3 raw=S(u);",
    "if(halo>0.){vec3 h=disc(u,26.*gscale,16,.62);float bl=smoothstep(.0,.35,luma(h));c+=h*vec3(1.,.55,.38)*halo*.55*bl+h*halo*.18;}",
    "c=doGrade(c);",
    "vec2 d=(v-.5)*vec2(boxA,1.);float vr=1.-smoothstep(.25,1.05,length(d)*1.25);c*=mix(1.,vr*vr*(3.-2.*vr)*.85+.15,vig);",
    "float L=luma(c);float gr=(hash(floor(v/px/gscale)+seed*61.7)-.5);c+=gr*grain*.13*(1.-pow(L,1.6)*.8)*vec3(1.);",
    "if(split>0.){float m=smoothstep(split-.002,split+.002,v.x);c=mix(raw,c,m);c=mix(c,vec3(1.),(1.-smoothstep(0.,.0035,abs(v.x-split)))*.9);}",
    "o=vec4(c+hash(v/px)*.004-.002,1.);}"
  ].join("\n");

  function sh(gl, type, src) {
    var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  function num(el, a, d) { var v = parseFloat(el.getAttribute(a)); return isNaN(v) ? d : v; }

  var all = [];
  window.__ready = false;

  function init(box) {
    if (box.__fxInit) return; box.__fxInit = 1;
    var src = box.querySelector("img,video,canvas:not(.sx-film-grade__canvas)");
    if (!src) return;
    src.classList.add("sx-film-grade__src");
    var P = {
      grade: box.getAttribute("data-grade") || "teal-orange",
      grain: num(box, "data-grade-grain", 0.45), vignette: num(box, "data-grade-vignette", 0.55),
      halation: num(box, "data-grade-halation", 0.5), blur: box.getAttribute("data-grade-blur") || "none",
      blurAmount: num(box, "data-grade-blur-amount", 0.6), split: num(box, "data-grade-split", 0)
    };
    var isVid = src.tagName === "VIDEO", isCan = src.tagName === "CANVAS", isImg = src.tagName === "IMG";
    var canvas = document.createElement("canvas");
    canvas.className = "sx-film-grade__canvas"; canvas.setAttribute("aria-hidden", "true");
    var gl = null;
    try { gl = canvas.getContext("webgl2", { alpha: false, antialias: false, powerPreference: "high-performance", preserveDrawingBuffer: film }); } catch (e) {}
    function css() { box.classList.add("is-css"); applyCss(); }
    function applyCss() { box.setAttribute("data-grade-css", P.grade); box.style.setProperty("--sx-fg-grain", P.grain); box.style.setProperty("--sx-fg-vig", P.vignette); }
    if (!gl) { css(); return; }
    var prog, U = {};
    try {
      prog = gl.createProgram();
      gl.attachShader(prog, sh(gl, gl.VERTEX_SHADER, VS));
      gl.attachShader(prog, sh(gl, gl.FRAGMENT_SHADER, FS));
      gl.bindAttribLocation(prog, 0, "p");
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    } catch (e) { css(); return; }
    gl.useProgram(prog);
    var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    ["tex", "boxA", "texA", "seed", "grain", "vig", "halo", "blurK", "blurDir", "split", "gscale", "grade", "px"].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(U.tex, 0);

    var S = { w: 0, h: 0, t: 0, raf: 0, vis: false, ready: false, last: 0, gl: gl, up: false };
    var cap = 1.5;
    function size() {
      var r = box.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, cap);
      var w = Math.max(1, Math.round(r.width * d)), h = Math.max(1, Math.round(r.height * d));
      if (w !== S.w || h !== S.h) { S.w = w; S.h = h; canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
      gl.uniform1f(U.boxA, r.width / Math.max(1, r.height));
      gl.uniform2f(U.px, 1 / w, 1 / h);
      gl.uniform1f(U.gscale, d);
      var tw = isImg ? src.naturalWidth : isVid ? src.videoWidth : src.width, th = isImg ? src.naturalHeight : isVid ? src.videoHeight : src.height;
      gl.uniform1f(U.texA, (tw || 1) / (th || 1));
    }
    function upload() {
      try { gl.bindTexture(gl.TEXTURE_2D, tex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src); S.up = true; } catch (e) { /* tainted or not ready */ }
    }
    function draw() {
      if (!S.up) return;
      gl.uniform1f(U.seed, S.t);
      gl.uniform1f(U.grain, P.grain); gl.uniform1f(U.vig, P.vignette); gl.uniform1f(U.halo, P.halation);
      gl.uniform1f(U.blurK, P.blur === "none" ? 0 : P.blurAmount);
      gl.uniform1f(U.blurDir, P.blur === "bottom" ? 1 : P.blur === "top" ? -1 : 0);
      gl.uniform1f(U.split, P.split);
      gl.uniform1i(U.grade, GRADES[P.grade] || 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    function frame(now) {
      S.raf = 0;
      if (!S.vis) return;
      if (!S.last || now - S.last >= 41.6) { /* 24 fps grain step */
        S.last = now; S.t = Math.floor(now / 41.6) % 997;
        if (isVid || isCan) upload();
        draw();
      }
      if (calm || isVid || isCan) S.raf = requestAnimationFrame(frame);
    }
    function kick() { if (!S.raf && S.ready) S.raf = requestAnimationFrame(frame); }
    function start() {
      box.appendChild(canvas); box.classList.add("is-live");
      size(); upload(); S.ready = true; draw(); kick();
      if (film) seek(tParam);
    }
    function seek(t) {
      S.t = Math.floor(t * 24) % 997;
      if (typeof window.__sourceAt === "function") window.__sourceAt(t);
      size(); upload(); draw(); window.__ready = true;
    }
    var inst = { box: box, P: P, S: S, draw: draw, upload: upload, size: size, seek: seek, kick: kick, css: applyCss };
    box.__fg = inst; all.push(inst);

    new IntersectionObserver(function (es) {
      S.vis = es[0].isIntersecting;
      if (S.vis) { if (isVid || isCan || isImg) { upload(); draw(); } kick(); }
    }, { rootMargin: "80px" }).observe(box);
    new ResizeObserver(function () { if (S.ready) { size(); draw(); } }).observe(box);

    if (isImg) { (src.decode ? src.decode() : Promise.resolve()).then(start, start); }
    else if (isVid) { if (src.readyState >= 2) start(); else src.addEventListener("loadeddata", start, { once: true }); }
    else start();
  }

  function boot() {
    document.querySelectorAll("[data-grade]").forEach(init);
    if (film && !all.length) window.__ready = true;
  }

  window.filmGrade = {
    set: function (box, o) {
      var f = box.__fg; if (!f) { if (o && o.grade) box.setAttribute("data-grade", o.grade); return; }
      Object.keys(o).forEach(function (k) { if (k in f.P) f.P[k] = o[k]; });
      box.setAttribute("data-grade", f.P.grade); f.css(); f.draw();
    },
    seek: function (t) { all.forEach(function (f) { f.seek(t); }); }
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
