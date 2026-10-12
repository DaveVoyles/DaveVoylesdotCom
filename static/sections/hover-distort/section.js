/* hover-distort: WebGL image distortion on [data-distort] boxes (each holds one <img>).
   data-distort="smear" (default): the image drags along the pointer velocity with an RGB split.
   data-distort="lens": a round lens follows the pointer, magnifies and splits RGB at its rim.
   data-distort-strength: 0-2, default 1. Touch and ?demo=1 use a slow virtual pointer on a loop.
   ?t=<seconds> renders one deterministic frame of that virtual pointer (for video).
   Reduced motion or no WebGL: the plain <img> stays. Loops run only while the box is visible and the effect is moving. */
(function () {
  var q = new URLSearchParams(location.search);
  var calm = matchMedia("(prefers-reduced-motion: no-preference)").matches;
  var fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  var demo = q.has("demo");
  var tParam = q.has("t") ? parseFloat(q.get("t")) : NaN;
  var seekOnly = !isNaN(tParam);
  function mark(box, why) { box.setAttribute("data-gl", why); } /* "off": the plain <img> is showing, and why (static = reduced motion, fallback = no usable WebGL, lost = context lost) */
  if (!calm && !seekOnly) { document.querySelectorAll(".sx-hover-distort [data-distort]").forEach(function (b) { mark(b, "static"); }); return; }

  var VS = "attribute vec2 p;varying vec2 v;void main(){v=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}";
  var FS = [
    "precision mediump float;varying vec2 v;",
    "uniform sampler2D tex;uniform float boxA,texA,mode,hot,amt;uniform vec2 ptr,vel;",
    "vec2 cover(vec2 u){vec2 s=boxA>texA?vec2(1.,texA/boxA):vec2(boxA/texA,1.);return (u-.5)*s+.5;}",
    "vec3 tap(vec2 u,vec2 o){return vec3(texture2D(tex,cover(u+o*1.5)).r,texture2D(tex,cover(u)).g,texture2D(tex,cover(u-o*1.5)).b);}",
    "void main(){",
    "vec2 d=(v-ptr)*vec2(boxA,1.);",
    "if(mode<.5){",
    "float w=exp(-dot(d,d)/.14)*hot;",
    "vec2 sm=vel*w*amt;",
    "vec3 c=vec3(0.);",
    "for(int i=0;i<7;i++){float t=float(i)/6.-.5;c+=tap(v-sm*(t+.5),sm*.35);}",
    "gl_FragColor=vec4(c/7.,1.);",
    "}else{",
    "float r=.2*hot;float l=length(d);",
    "float inside=1.-smoothstep(r-.006,r,l);",
    "float rim=smoothstep(r-.03,r,l)*inside;",
    "vec2 dir=l>.0001?d/l/vec2(boxA,1.):vec2(0.);",
    "vec2 uv=mix(v,ptr+(v-ptr)*.72,inside);",
    "vec3 c=tap(uv,dir*rim*.025*amt);",
    "c+=rim*.18*hot;",
    "c*=1.-.35*hot*(1.-inside);",
    "gl_FragColor=vec4(c,1.);}",
    "}"
  ].join("");

  function shader(gl, type, src) {
    var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  function loop(t, phase) { /* virtual pointer: position in uv, plus analytic velocity (uv per second) */
    var a = t * 0.9 + phase, b = t * 1.3 + phase * 1.7;
    return { x: 0.5 + 0.34 * Math.sin(a), y: 0.5 + 0.3 * Math.sin(b),
             vx: 0.34 * 0.9 * Math.cos(a), vy: 0.3 * 1.3 * Math.cos(b) };
  }

  var all = [];
  document.querySelectorAll(".sx-hover-distort [data-distort]").forEach(function (box, idx) {
    if (box.__fxInit) return; box.__fxInit = 1;
    var img = box.querySelector("img");
    if (!img) return;
    var canvas = document.createElement("canvas");
    canvas.className = "sx-hover-distort__canvas";
    canvas.setAttribute("aria-hidden", "true");
    var gl;
    try { gl = canvas.getContext("webgl", { alpha: false, antialias: false, powerPreference: "high-performance" }); } catch (e) {}
    if (!gl) { mark(box, "fallback"); return; }
    var prog;
    try {
      prog = gl.createProgram();
      gl.attachShader(prog, shader(gl, gl.VERTEX_SHADER, VS));
      gl.attachShader(prog, shader(gl, gl.FRAGMENT_SHADER, FS));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error("link");
    } catch (e) { mark(box, "fallback"); return; }
    gl.useProgram(prog);
    var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var U = {}; ["tex", "boxA", "texA", "mode", "hot", "amt", "ptr", "vel"].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });
    var mode = box.getAttribute("data-distort") === "lens" ? 1 : 0;
    var amt = parseFloat(box.getAttribute("data-distort-strength")) || 1;
    gl.uniform1f(U.mode, mode); gl.uniform1f(U.amt, amt);

    var S = { px: 0.5, py: 0.5, tx: 0.5, ty: 0.5, vx: 0, vy: 0, hot: 0, hotT: 0, last: 0, raf: 0, vis: false, ready: false, drift: false, phase: idx * 2.1, w: 0, h: 0 };
    var cap = 1.5;

    function size() {
      var r = box.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, cap);
      var w = Math.max(1, Math.round(r.width * d)), h = Math.max(1, Math.round(r.height * d));
      if (w !== S.w || h !== S.h) { S.w = w; S.h = h; canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
      gl.uniform1f(U.boxA, r.width / Math.max(1, r.height));
    }
    function draw() {
      gl.uniform2f(U.ptr, S.px, S.py);
      gl.uniform2f(U.vel, S.vx, S.vy);
      gl.uniform1f(U.hot, S.hot);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    function frame(now) {
      S.raf = 0;
      var dt = S.last ? Math.min((now - S.last) / 1000, 0.05) : 0.016; S.last = now;
      if (S.drift) {
        var p = loop(now / 1000, S.phase); S.tx = p.x; S.ty = p.y; S.hotT = 0.7;
      }
      var k = 1 - Math.exp(-dt * 14), ox = S.px, oy = S.py;
      S.px += (S.tx - S.px) * k; S.py += (S.ty - S.py) * k;
      var iv = dt > 0 ? [(S.px - ox) / dt, (S.py - oy) / dt] : [0, 0], kv = 1 - Math.exp(-dt * 9);
      S.vx += (iv[0] * 0.07 - S.vx) * kv; S.vy += (iv[1] * 0.07 - S.vy) * kv;
      S.hot += (S.hotT - S.hot) * (1 - Math.exp(-dt * 10));
      draw();
      var moving = Math.abs(S.vx) + Math.abs(S.vy) > 0.0015 || Math.abs(S.hotT - S.hot) > 0.01 || Math.hypot(S.tx - S.px, S.ty - S.py) > 0.0008;
      if ((moving || S.drift) && S.vis) S.raf = requestAnimationFrame(frame);
      else { S.vx = S.vy = 0; S.last = 0; }
    }
    function kick() { if (!S.raf && S.vis && S.ready) S.raf = requestAnimationFrame(frame); }

    /* Pointer input: mouse and pen only; touch gets the virtual pointer. */
    box.addEventListener("pointermove", function (e) {
      if (e.pointerType === "touch" || S.drift) return;
      var r = box.getBoundingClientRect();
      S.tx = (e.clientX - r.left) / r.width; S.ty = (e.clientY - r.top) / r.height; S.hotT = 1; kick();
    });
    box.addEventListener("pointerenter", function (e) {
      if (e.pointerType === "touch" || S.drift) return;
      var r = box.getBoundingClientRect(); S.px = S.tx = (e.clientX - r.left) / r.width; S.py = S.ty = (e.clientY - r.top) / r.height; S.hotT = 1; kick();
    });
    box.addEventListener("pointerleave", function () { if (!S.drift) { S.hotT = 0; kick(); } });

    function giveUp(why) { /* back to the plain <img>: stop the loop, drop the canvas */
      S.ready = false; S.vis = false; if (S.raf) { cancelAnimationFrame(S.raf); S.raf = 0; }
      box.classList.remove("is-live"); if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      all = all.filter(function (a) { return a.box !== box; }); mark(box, why);
    }
    canvas.addEventListener("webglcontextlost", function (e) { e.preventDefault(); giveUp("lost"); }); /* a lost context draws black; show the image instead */
    function upload() {
      if (!img.naturalWidth) { mark(box, "fallback"); return; } /* image failed to load: nothing to texture, leave the broken-image box as is */
      try { upload2(); } catch (e) { giveUp("fallback"); }
    }
    function upload2() {
      var tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.uniform1i(U.tex, 0);
      gl.uniform1f(U.texA, img.naturalWidth / img.naturalHeight);
      box.appendChild(canvas);
      size(); S.ready = true; draw();
      box.classList.add("is-live");
      S.drift = demo || !fine;
      var inst = { box: box, S: S, draw: draw, size: size, loop: loop };
      all.push(inst);
      if (seekOnly) { seek(tParam); }
      else if (S.vis) kick();
    }
    function seek(t) { /* deterministic frame at time t of the virtual pointer */
      var p = loop(t, S.phase);
      S.px = S.tx = p.x; S.py = S.ty = p.y; S.vx = p.vx * 0.07; S.vy = p.vy * 0.07; S.hot = S.hotT = 0.85; size(); draw();
      window.__ready = true;
    }
    box.__hdSeek = seek;

    new IntersectionObserver(function (es) {
      S.vis = es[0].isIntersecting;
      if (S.vis) kick(); else if (S.raf) { cancelAnimationFrame(S.raf); S.raf = 0; S.last = 0; }
    }, { rootMargin: "80px" }).observe(box);
    new ResizeObserver(function () { if (S.ready) { size(); draw(); } }).observe(box);

    (img.decode ? img.decode() : Promise.resolve()).then(upload, upload);
  });

  window.hoverDistort = { seek: function (t) { document.querySelectorAll("[data-distort]").forEach(function (b) { if (b.__hdSeek) b.__hdSeek(t); }); } };
})();
