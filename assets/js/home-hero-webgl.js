/**
 * Homepage hero WebGL field — soft particle / signal grid.
 * Progressive enhancement: no-op when WebGL missing or reduced motion.
 */
(function () {
  const host = document.querySelector("[data-home-webgl]");
  if (!host) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  function webglOk() {
    try {
      const c = document.createElement("canvas");
      return !!(c.getContext("webgl") || c.getContext("experimental-webgl"));
    } catch (_) {
      return false;
    }
  }
  if (!webglOk()) return;

  function loadThree() {
    return new Promise((resolve, reject) => {
      if (window.THREE) {
        resolve(window.THREE);
        return;
      }
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.min.js";
      s.async = true;
      s.onload = () => (window.THREE ? resolve(window.THREE) : reject());
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function accentHex() {
    const raw = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
    const m = raw.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (m) return (Number(m[1]) << 16) | (Number(m[2]) << 8) | Number(m[3]);
    return 0x5fb87a;
  }

  loadThree()
    .then((THREE) => {
      const accent = accentHex();
      let w = host.clientWidth || 800;
      let h = host.clientHeight || 220;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
      camera.position.z = 8;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h);
      renderer.setClearColor(0x000000, 0);
      host.appendChild(renderer.domElement);

      const count = 140;
      const positions = new Float32Array(count * 3);
      const velocities = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 14;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
        velocities[i] = 0.003 + Math.random() * 0.008;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const mat = new THREE.PointsMaterial({
        color: accent,
        size: 0.06,
        transparent: true,
        opacity: 0.75,
        depthWrite: false,
        sizeAttenuation: true,
      });
      const points = new THREE.Points(geo, mat);
      scene.add(points);

      // Soft connecting lines among a subset (signal web)
      const lineCount = 50;
      const linePos = new Float32Array(lineCount * 6);
      for (let i = 0; i < lineCount; i++) {
        const a = Math.floor(Math.random() * count);
        const b = Math.floor(Math.random() * count);
        linePos[i * 6] = positions[a * 3];
        linePos[i * 6 + 1] = positions[a * 3 + 1];
        linePos[i * 6 + 2] = positions[a * 3 + 2];
        linePos[i * 6 + 3] = positions[b * 3];
        linePos[i * 6 + 4] = positions[b * 3 + 1];
        linePos[i * 6 + 5] = positions[b * 3 + 2];
      }
      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
      const lineMat = new THREE.LineBasicMaterial({
        color: accent,
        transparent: true,
        opacity: 0.12,
      });
      scene.add(new THREE.LineSegments(lineGeo, lineMat));

      let raf = 0;
      const clock = new THREE.Clock();
      function frame() {
        raf = requestAnimationFrame(frame);
        const t = clock.getElapsedTime();
        const arr = geo.attributes.position.array;
        for (let i = 0; i < count; i++) {
          arr[i * 3 + 1] += Math.sin(t * 0.4 + i) * 0.0008;
          arr[i * 3] += velocities[i] * (i % 2 === 0 ? 1 : -1);
          if (arr[i * 3] > 7) arr[i * 3] = -7;
          if (arr[i * 3] < -7) arr[i * 3] = 7;
        }
        geo.attributes.position.needsUpdate = true;
        points.rotation.y = t * 0.03;
        renderer.render(scene, camera);
      }
      frame();

      function onResize() {
        w = host.clientWidth || w;
        h = host.clientHeight || h;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
      window.addEventListener("resize", onResize);

      renderer.domElement.addEventListener(
        "webglcontextlost",
        (ev) => {
          ev.preventDefault();
          cancelAnimationFrame(raf);
          host.innerHTML = "";
        },
        false
      );
    })
    .catch(() => {
      /* silent: CSS hero still works */
    });
})();
