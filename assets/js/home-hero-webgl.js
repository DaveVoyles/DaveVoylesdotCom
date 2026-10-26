/**
 * Homepage hero: mesh gradient + particles morphing sphere, torus knot, sphere (vertex shader, time driven); two draw calls, no libraries.
 * Injected lazily by home.js. No-op without WebGL (the CSS gradient on
 * .home-hero stays as the fallback). Reduced motion draws one still frame.
 */
(function () {
  const host = document.querySelector("[data-webgl-src]");
  const hero = host && host.closest(".ledger-hero");
  if (!hero) return;
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cv = document.createElement("canvas");
  const gl = cv.getContext("webgl", { antialias: false, alpha: true, premultipliedAlpha: false, powerPreference: "low-power" });
  if (!gl) return;
  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(o); return o; };
  const prog = (v, f) => { const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, v)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, f)); gl.linkProgram(p); return p; };
  let bgP, ptP;
  try {
    bgP = prog("attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}",
`precision mediump float;uniform vec2 r,m;uniform float t;
void main(){vec2 uv=gl_FragCoord.xy/r;float a=r.x/r.y;vec2 q=vec2(uv.x*a,uv.y);
 vec2 b1=vec2(.35*a+.18*sin(t*.31),.65+.15*cos(t*.27));
 vec2 b2=vec2(.85*a+.2*cos(t*.23),.35+.2*sin(t*.35));
 vec2 b3=vec2(m.x*a,m.y);
 float f1=.16/(.02+dot(q-b1,q-b1)),f2=.12/(.02+dot(q-b2,q-b2)),f3=.05/(.015+dot(q-b3,q-b3));
 vec3 c=vec3(.03,.06,.045)+vec3(.05,.34,.17)*f1*.35+vec3(.02,.22,.30)*f2*.3+vec3(.30,.75,.5)*f3*.25;
 gl_FragColor=vec4(c,1.);}`);
    ptP = prog(`attribute vec4 s;uniform vec2 r,m;uniform float t,d;varying float v;
const float TAU=6.2832;
mat3 rot(float a,float b){float c=cos(a),n=sin(a),e=cos(b),f=sin(b);return mat3(c,0.,-n,0.,1.,0.,n,0.,c)*mat3(1.,0.,0.,0.,e,f,0.,-f,e);}
void main(){
 float sp=.015+.03*s.z;
 vec2 p=vec2(fract(s.x+t*sp*.4+.06*sin(t*.2+s.y*6.28)),fract(s.y+t*sp*.25));
 p+=.03*vec2(sin(t*.4+s.y*9.),cos(t*.35+s.x*9.));
 vec2 a=vec2(r.x/r.y,1.);
 float z=0.;
 if(s.w<.82){
  float th=s.x*TAU,ph=acos(2.*s.y-1.);
  vec3 sph=.5*vec3(sin(ph)*cos(th),cos(ph),sin(ph)*sin(th));
  float u=s.x*TAU,q=cos(2.*u)+2.;
  vec3 knot=.16*vec3(q*cos(3.*u),q*sin(3.*u),-sin(4.*u))+(s.yzw-.5)*.1;
  float k=.5-.5*cos(t*.2618);k=k*k*(3.-2.*k);
  vec3 P=rot(t*.15,.45)*mix(sph,knot,k);
  P+=.012*vec3(sin(t+s.z*40.),cos(t*.8+s.y*40.),0.);
  vec2 c=vec2(a.x>1.2?.74:.5,.55);
  p=c+vec2(P.x/a.x,P.y)*.95;z=P.z;
 }
 vec2 dv=(p-m)*a;float dist=length(dv);
 p+=normalize(dv+1e-4)*.09*exp(-dist*dist*28.)/a;
 v=(.35+.65*s.w)*(1.+.5*exp(-dist*dist*10.))*(.75+.5*z);
 gl_Position=vec4(p*2.-1.,0.,1.);gl_PointSize=(1.5+2.4*s.w)*d*(.85+.5*z);}`,
`precision mediump float;varying float v;
void main(){float k=smoothstep(.5,0.,length(gl_PointCoord-.5));gl_FragColor=vec4(.6,.95,.72,k*v*.85);}`);
  } catch (e) { return; }
  host.appendChild(cv);
  host.classList.add("is-ready");
  const tri = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, tri); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const N = innerWidth < 700 ? 1500 : 4000, seeds = new Float32Array(N * 4);
  for (let i = 0; i < seeds.length; i++) seeds[i] = Math.random();
  const pb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, pb); gl.bufferData(gl.ARRAY_BUFFER, seeds, gl.STATIC_DRAW);
  const U = (p, n) => gl.getUniformLocation(p, n);
  const ub = { r: U(bgP, "r"), m: U(bgP, "m"), t: U(bgP, "t") }, up = { r: U(ptP, "r"), m: U(ptP, "m"), t: U(ptP, "t"), d: U(ptP, "d") };
  const pA = gl.getAttribLocation(bgP, "p"), sA = gl.getAttribLocation(ptP, "s");
  let W = 0, H = 0, dpr = 1;
  const size = () => { dpr = Math.min(devicePixelRatio || 1, 1.5); W = Math.max(1, Math.round(hero.clientWidth * dpr)); H = Math.max(1, Math.round(hero.clientHeight * dpr)); cv.width = W; cv.height = H; gl.viewport(0, 0, W, H); if (RM) draw(3); };
  const tgt = { x: .6, y: .5 }, cur = { x: .6, y: .5 };
  hero.addEventListener("pointermove", (e) => { const b = hero.getBoundingClientRect(); tgt.x = (e.clientX - b.left) / b.width; tgt.y = 1 - (e.clientY - b.top) / b.height; });
  function draw(t) {
    gl.disable(gl.BLEND); gl.useProgram(bgP);
    gl.bindBuffer(gl.ARRAY_BUFFER, tri); gl.enableVertexAttribArray(pA); gl.vertexAttribPointer(pA, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(ub.r, W, H); gl.uniform2f(ub.m, cur.x, cur.y); gl.uniform1f(ub.t, t); gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.disableVertexAttribArray(pA);
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE); gl.useProgram(ptP);
    gl.bindBuffer(gl.ARRAY_BUFFER, pb); gl.enableVertexAttribArray(sA); gl.vertexAttribPointer(sA, 4, gl.FLOAT, false, 0, 0);
    gl.uniform2f(up.r, W, H); gl.uniform2f(up.m, cur.x, cur.y); gl.uniform1f(up.t, t); gl.uniform1f(up.d, dpr); gl.drawArrays(gl.POINTS, 0, N);
    gl.disableVertexAttribArray(sA);
  }
  new ResizeObserver(size).observe(hero); size();
  let vis = true, raf = 0, last = performance.now(), clock = 3;
  const loop = (now) => {
    raf = 0; if (!vis || document.hidden) return;
    const dt = Math.min((now - last) / 1000, .05); last = now; clock += dt;
    cur.x += (tgt.x - cur.x) * Math.min(1, dt * 4); cur.y += (tgt.y - cur.y) * Math.min(1, dt * 4);
    draw(clock);
    raf = requestAnimationFrame(loop);
  };
  const go = () => { if (RM) { draw(3); return; } if (!raf && vis && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(loop); } };
  new IntersectionObserver((es) => { vis = es[0].isIntersecting; if (vis) go(); }, { threshold: 0 }).observe(hero);
  document.addEventListener("visibilitychange", go);
  cv.addEventListener("webglcontextlost", (e) => { e.preventDefault(); cancelAnimationFrame(raf); cv.remove(); });
  go();
})();
