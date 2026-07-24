/**
 * About page constellation.
 *
 * - Pill ↔ cluster highlight across skills, impact cards, SVG nodes
 * - Click a node → detail panel (label, cluster, detail text)
 * - Deep links: ?cluster=agents | ?node=eval
 * - Keyboard: 1–4 filter clusters, Esc clears
 * - When WebGL + motion allowed: Three.js scene (same graph JSON)
 *
 * Progressive enhancement: no Three, no WebGL, or prefers-reduced-motion
 * keeps the interactive SVG.
 */
(function () {
  const root = document.querySelector(".about-page");
  if (!root) return;

  const figure = root.querySelector("[data-constellation-root]");
  const pills = Array.from(root.querySelectorAll(".about-pill[data-cluster]"));
  const svgNodes = Array.from(root.querySelectorAll(".about-constellation-node[data-cluster]"));
  const svgEdges = Array.from(root.querySelectorAll(".about-constellation-edge"));
  const impactCards = Array.from(root.querySelectorAll(".about-impact-card[data-cluster]"));
  const skillBlocks = Array.from(
    root.querySelectorAll(".about-skills-primary, .about-skills-web, .about-skills-card")
  );

  const detailRoot = root.querySelector("[data-node-detail]");
  const detailKicker = root.querySelector("[data-node-detail-kicker]");
  const detailTitle = root.querySelector("[data-node-detail-title]");
  const detailCluster = root.querySelector("[data-node-detail-cluster]");
  const detailBody = root.querySelector("[data-node-detail-body]");
  const detailClear = root.querySelector("[data-node-detail-clear]");

  const EMPTY_DETAIL =
    'Click a node on the map to see what that piece of the agent production system does. Deep link with ?node=eval or filter a layer with ?cluster=agents.';

  let activeCluster = null;
  let locked = false;
  let selectedNodeId = null;
  /** @type {null | ((cluster: string | null) => void)} */
  let webglSetCluster = null;
  /** @type {null | ((id: string | null) => void)} */
  let webglSetSelected = null;

  const CLUSTER_KEYS = {
    "1": "agents",
    "2": "web",
    "3": "program",
    "4": "production",
  };

  const CLUSTER_LABELS = {
    agents: "Agents",
    web: "Web",
    program: "Program",
    production: "Production",
  };

  function parseGraphData() {
    if (!figure) return null;
    const el = figure.querySelector("[data-constellation-data]");
    if (!el) return null;
    try {
      return JSON.parse(el.textContent);
    } catch (_) {
      return null;
    }
  }

  const graph = parseGraphData();
  const nodeById = new Map();
  if (graph && graph.nodes) {
    graph.nodes.forEach((n) => nodeById.set(n.id, n));
  }

  function setCluster(cluster, { lock = false } = {}) {
    activeCluster = cluster || null;
    if (lock) locked = Boolean(cluster);
    if (!cluster) locked = false;

    root.classList.toggle("about-page--filtering", Boolean(cluster));

    const match = (el) => !cluster || el.getAttribute("data-cluster") === cluster;

    pills.forEach((el) => {
      el.classList.toggle("is-active", match(el) && Boolean(cluster));
      el.classList.toggle("is-dimmed", Boolean(cluster) && !match(el));
    });

    svgNodes.forEach((el) => {
      const on = match(el) && Boolean(cluster);
      el.classList.toggle("is-active", on);
      el.classList.toggle("is-dimmed", Boolean(cluster) && !match(el));
      el.setAttribute("aria-pressed", on || el.classList.contains("is-selected") ? "true" : "false");
    });

    skillBlocks.forEach((el) => {
      el.classList.toggle("is-active", match(el) && Boolean(cluster));
      el.classList.toggle("is-dimmed", Boolean(cluster) && !match(el));
    });

    impactCards.forEach((el) => {
      el.classList.toggle("is-active", match(el) && Boolean(cluster));
      el.classList.toggle("is-dimmed", Boolean(cluster) && !match(el));
    });

    if (!cluster) {
      svgEdges.forEach((e) => e.classList.remove("is-active", "is-dimmed"));
    } else {
      const activeIds = new Set(
        svgNodes
          .filter((n) => n.getAttribute("data-cluster") === cluster)
          .map((n) => n.getAttribute("data-node-id"))
      );
      svgEdges.forEach((edge) => {
        const from = edge.getAttribute("data-from");
        const to = edge.getAttribute("data-to");
        const on = activeIds.has(from) || activeIds.has(to);
        edge.classList.toggle("is-active", on);
        edge.classList.toggle("is-dimmed", !on);
      });
    }

    if (webglSetCluster) webglSetCluster(cluster);
  }

  function renderDetail(node) {
    if (!detailRoot) return;
    if (!node) {
      detailRoot.classList.remove("is-filled");
      if (detailKicker) detailKicker.textContent = "Inspect";
      if (detailTitle) detailTitle.textContent = "Select a node";
      if (detailCluster) {
        detailCluster.hidden = true;
        detailCluster.textContent = "";
      }
      if (detailBody) detailBody.textContent = EMPTY_DETAIL;
      if (detailClear) detailClear.hidden = true;
      return;
    }

    detailRoot.classList.add("is-filled");
    if (detailKicker) detailKicker.textContent = "Node";
    if (detailTitle) detailTitle.textContent = node.label || node.id;
    if (detailCluster) {
      const label = CLUSTER_LABELS[node.cluster] || node.cluster || "";
      detailCluster.hidden = !label;
      detailCluster.textContent = label;
      detailCluster.dataset.cluster = node.cluster || "";
    }
    if (detailBody) {
      detailBody.textContent =
        node.detail ||
        "No detail yet for this node — edit content/about.md constellation.nodes.";
    }
    if (detailClear) detailClear.hidden = false;
  }

  function setSelectedNode(id, { syncUrl = true } = {}) {
    selectedNodeId = id || null;

    svgNodes.forEach((el) => {
      const on = selectedNodeId && el.getAttribute("data-node-id") === selectedNodeId;
      el.classList.toggle("is-selected", Boolean(on));
    });

    if (webglSetSelected) webglSetSelected(selectedNodeId);

    if (selectedNodeId) {
      const node = nodeById.get(selectedNodeId);
      renderDetail(node || { id: selectedNodeId, label: selectedNodeId });
      if (node && node.cluster) {
        setCluster(node.cluster, { lock: true });
      }
    } else {
      renderDetail(null);
    }

    if (syncUrl) {
      syncDeepLink();
    }
  }

  function clearAll({ syncUrl = true } = {}) {
    locked = false;
    selectedNodeId = null;
    setCluster(null);
    setSelectedNode(null, { syncUrl: false });
    if (syncUrl) syncDeepLink();
  }

  function clearIfUnlocked() {
    if (!locked && !selectedNodeId) setCluster(null);
  }

  function toggleLock(cluster) {
    if (locked && activeCluster === cluster && !selectedNodeId) {
      clearAll();
    } else {
      selectedNodeId = null;
      svgNodes.forEach((el) => el.classList.remove("is-selected"));
      if (webglSetSelected) webglSetSelected(null);
      renderDetail(null);
      setCluster(cluster, { lock: true });
      syncDeepLink();
    }
  }

  function syncDeepLink() {
    try {
      const url = new URL(window.location.href);
      if (selectedNodeId) {
        url.searchParams.set("node", selectedNodeId);
        url.searchParams.delete("cluster");
      } else if (locked && activeCluster) {
        url.searchParams.set("cluster", activeCluster);
        url.searchParams.delete("node");
      } else {
        url.searchParams.delete("node");
        url.searchParams.delete("cluster");
      }
      window.history.replaceState({}, "", url.pathname + url.search + url.hash);
    } catch (_) {
      /* ignore */
    }
  }

  function applyDeepLink() {
    try {
      const params = new URLSearchParams(window.location.search);
      const nodeId = params.get("node");
      const cluster = params.get("cluster");
      if (nodeId && nodeById.has(nodeId)) {
        setSelectedNode(nodeId, { syncUrl: false });
        return;
      }
      if (cluster && CLUSTER_LABELS[cluster]) {
        setCluster(cluster, { lock: true });
      }
    } catch (_) {
      /* ignore */
    }
  }

  pills.forEach((pill) => {
    const cluster = pill.getAttribute("data-cluster");
    pill.addEventListener("mouseenter", () => {
      if (!locked) setCluster(cluster);
    });
    pill.addEventListener("mouseleave", clearIfUnlocked);
    pill.addEventListener("focus", () => {
      if (!locked) setCluster(cluster);
    });
    pill.addEventListener("blur", clearIfUnlocked);
    pill.addEventListener("click", () => toggleLock(cluster));
  });

  svgNodes.forEach((node) => {
    const cluster = node.getAttribute("data-cluster");
    const id = node.getAttribute("data-node-id");
    node.addEventListener("mouseenter", () => {
      if (!locked) setCluster(cluster);
    });
    node.addEventListener("mouseleave", clearIfUnlocked);
    node.addEventListener("focus", () => {
      if (!locked) setCluster(cluster);
    });
    node.addEventListener("blur", clearIfUnlocked);
    node.addEventListener("click", (ev) => {
      ev.stopPropagation();
      if (selectedNodeId === id) {
        clearAll();
      } else {
        setSelectedNode(id);
      }
    });
    node.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        node.click();
      }
    });
  });

  const svg = root.querySelector(".about-constellation-svg");
  if (svg) {
    svg.addEventListener("click", (ev) => {
      if (ev.target === svg || ev.target.classList.contains("about-constellation-edge")) {
        clearAll();
      }
    });
  }

  if (detailClear) {
    detailClear.addEventListener("click", () => clearAll());
  }

  document.addEventListener("keydown", (ev) => {
    const t = ev.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) {
      return;
    }
    if (ev.key === "Escape") {
      clearAll();
      return;
    }
    if (CLUSTER_KEYS[ev.key]) {
      ev.preventDefault();
      toggleLock(CLUSTER_KEYS[ev.key]);
    }
  });

  // ---------------------------------------------------------------------------
  // WebGL path
  // ---------------------------------------------------------------------------

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function webglAvailable() {
    try {
      const c = document.createElement("canvas");
      return !!(c.getContext("webgl") || c.getContext("experimental-webgl"));
    } catch (_) {
      return false;
    }
  }

  function readAccentHex() {
    const raw = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
    const m = raw.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (m) {
      return (Number(m[1]) << 16) | (Number(m[2]) << 8) | Number(m[3]);
    }
    return 0x5fb87a;
  }

  function clusterColor(cluster, accent) {
    const map = {
      agents: accent,
      web: 0x4aa8c9,
      program: 0xc4a35a,
      production: 0x7a8f9a,
    };
    return map[cluster] || accent;
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (window.THREE) {
        resolve(window.THREE);
        return;
      }
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = () => (window.THREE ? resolve(window.THREE) : reject(new Error("THREE missing")));
      s.onerror = () => reject(new Error("Failed to load Three.js"));
      document.head.appendChild(s);
    });
  }

  function toVec3(THREE, node) {
    const x = ((node.x || 50) / 100) * 10 - 5;
    const y = -(((node.y || 50) / 100) * 7 - 3.5);
    const zByCluster = {
      agents: 0.6,
      web: -0.2,
      production: -0.9,
      program: -1.2,
    };
    const z = zByCluster[node.cluster] || 0;
    return new THREE.Vector3(x, y, z);
  }

  async function bootWebGL() {
    if (!figure || prefersReducedMotion() || !webglAvailable()) return;
    if (!graph || !graph.nodes || !graph.nodes.length) return;

    const host = figure.querySelector("[data-constellation-webgl]");
    if (!host) return;

    const THREE = await loadScript(
      "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.min.js"
    );

    const accent = readAccentHex();
    const width = figure.clientWidth || 640;
    const height = Math.max(320, Math.min(480, Math.round(width * 0.55)));

    host.hidden = false;
    host.removeAttribute("aria-hidden");
    host.style.height = height + "px";
    figure.classList.add("about-constellation-figure--webgl");

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0d0f0d, 0.045);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 11.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);
    renderer.domElement.setAttribute("aria-label", "Interactive 3D agent production system map");
    renderer.domElement.tabIndex = 0;

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.PointLight(accent, 1.4, 40);
    key.position.set(2, 4, 6);
    scene.add(key);
    const fill = new THREE.PointLight(0x4a6a55, 0.55, 40);
    fill.position.set(-4, -2, 4);
    scene.add(fill);

    const grid = new THREE.GridHelper(14, 14, accent, 0x1a221a);
    grid.position.y = -4.2;
    grid.material.opacity = 0.35;
    grid.material.transparent = true;
    scene.add(grid);

    const meshById = new Map();
    const baseScale = new Map();
    const edgeLines = [];

    graph.nodes.forEach((node) => {
      const pos = toVec3(THREE, node);
      const color = clusterColor(node.cluster, accent);

      const geo = new THREE.SphereGeometry(0.22, 24, 24);
      const mat = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.35,
        metalness: 0.2,
        roughness: 0.35,
        transparent: true,
        opacity: 1,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(pos);
      mesh.userData = {
        id: node.id,
        cluster: node.cluster,
        label: node.label,
        baseColor: color,
      };
      scene.add(mesh);
      meshById.set(node.id, mesh);
      baseScale.set(node.id, 1);

      const glowGeo = new THREE.SphereGeometry(0.38, 16, 16);
      const glowMat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.12,
        depthWrite: false,
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      mesh.add(glow);
      mesh.userData.glow = glow;
    });

    (graph.edges || []).forEach((edge) => {
      const a = nodeById.get(edge.from);
      const b = nodeById.get(edge.to);
      if (!a || !b) return;
      const pa = toVec3(THREE, a);
      const pb = toVec3(THREE, b);
      const positions = new Float32Array([pa.x, pa.y, pa.z, pb.x, pb.y, pb.z]);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const mat = new THREE.LineBasicMaterial({
        color: accent,
        transparent: true,
        opacity: 0.35,
      });
      const line = new THREE.Line(geo, mat);
      line.userData = { from: edge.from, to: edge.to, baseOpacity: 0.35 };
      scene.add(line);
      edgeLines.push(line);
    });

    const labelLayer = document.createElement("div");
    labelLayer.className = "about-constellation-labels";
    host.appendChild(labelLayer);
    const labelEls = new Map();
    graph.nodes.forEach((node) => {
      const el = document.createElement("span");
      el.className = "about-constellation-glabel";
      el.textContent = node.label;
      el.dataset.nodeId = node.id;
      el.dataset.cluster = node.cluster;
      labelLayer.appendChild(el);
      labelEls.set(node.id, el);
    });

    function projectLabels() {
      const rect = renderer.domElement.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      meshById.forEach((mesh, id) => {
        const el = labelEls.get(id);
        if (!el) return;
        const v = mesh.position.clone().project(camera);
        if (v.z > 1) {
          el.style.opacity = "0";
          return;
        }
        const x = (v.x * 0.5 + 0.5) * w;
        const y = (-v.y * 0.5 + 0.5) * h;
        el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y + 18}px)`;
      });
    }

    function applyClusterVisual(cluster) {
      meshById.forEach((mesh) => {
        const on = !cluster || mesh.userData.cluster === cluster;
        const mat = mesh.material;
        const selected = selectedNodeId && mesh.userData.id === selectedNodeId;
        mat.opacity = on ? 1 : 0.18;
        mat.emissiveIntensity = selected ? 1.1 : on && cluster ? 0.75 : on ? 0.35 : 0.08;
        if (mesh.userData.glow) {
          mesh.userData.glow.material.opacity = selected
            ? 0.4
            : on && cluster
              ? 0.28
              : on
                ? 0.12
                : 0.03;
        }
        const target = selected ? 1.55 : on && cluster ? 1.35 : 1;
        baseScale.set(mesh.userData.id, target);
        const lab = labelEls.get(mesh.userData.id);
        if (lab) {
          lab.classList.toggle("is-active", Boolean(cluster) && on);
          lab.classList.toggle("is-dimmed", Boolean(cluster) && !on);
          lab.classList.toggle("is-selected", Boolean(selected));
        }
      });
      edgeLines.forEach((line) => {
        const fromMesh = meshById.get(line.userData.from);
        const toMesh = meshById.get(line.userData.to);
        if (!fromMesh || !toMesh) return;
        const on =
          !cluster ||
          fromMesh.userData.cluster === cluster ||
          toMesh.userData.cluster === cluster;
        line.material.opacity = on ? (cluster ? 0.75 : line.userData.baseOpacity) : 0.08;
      });
    }

    function applySelectedVisual(id) {
      applyClusterVisual(activeCluster);
      if (!id) return;
      const mesh = meshById.get(id);
      if (!mesh) return;
      baseScale.set(id, 1.55);
      mesh.material.emissiveIntensity = 1.1;
      if (mesh.userData.glow) mesh.userData.glow.material.opacity = 0.4;
      const lab = labelEls.get(id);
      if (lab) lab.classList.add("is-selected");
    }

    webglSetCluster = applyClusterVisual;
    webglSetSelected = applySelectedVisual;
    if (activeCluster || selectedNodeId) {
      applyClusterVisual(activeCluster);
      if (selectedNodeId) applySelectedVisual(selectedNodeId);
    }

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let hoveredId = null;
    let dragMoved = false;

    function pick(clientX, clientY) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(Array.from(meshById.values()), false);
      return hits[0] ? hits[0].object : null;
    }

    renderer.domElement.addEventListener("pointermove", (ev) => {
      if (dragging) return;
      const hit = pick(ev.clientX, ev.clientY);
      const id = hit ? hit.userData.id : null;
      if (id !== hoveredId) {
        hoveredId = id;
        renderer.domElement.style.cursor = hit ? "pointer" : "grab";
        if (!locked) {
          setCluster(hit ? hit.userData.cluster : null);
        }
      }
    });

    renderer.domElement.addEventListener("pointerleave", () => {
      hoveredId = null;
      if (!locked && !selectedNodeId) setCluster(null);
    });

    let dragging = false;
    let lastX = 0;
    let rotY = 0.15;
    let rotX = -0.12;

    renderer.domElement.addEventListener("pointerdown", (ev) => {
      dragging = true;
      dragMoved = false;
      lastX = ev.clientX;
      renderer.domElement.setPointerCapture(ev.pointerId);
      renderer.domElement.style.cursor = "grabbing";
    });
    renderer.domElement.addEventListener("pointerup", (ev) => {
      const wasDragging = dragging;
      dragging = false;
      try {
        renderer.domElement.releasePointerCapture(ev.pointerId);
      } catch (_) {
        /* ignore */
      }
      renderer.domElement.style.cursor = hoveredId ? "pointer" : "grab";
      if (wasDragging && !dragMoved) {
        const hit = pick(ev.clientX, ev.clientY);
        if (hit) {
          const id = hit.userData.id;
          if (selectedNodeId === id) {
            clearAll();
          } else {
            setSelectedNode(id);
          }
        } else {
          clearAll();
        }
      }
    });
    renderer.domElement.addEventListener("pointermove", (ev) => {
      if (!dragging) return;
      const dx = ev.clientX - lastX;
      if (Math.abs(dx) > 3) dragMoved = true;
      lastX = ev.clientX;
      rotY += dx * 0.005;
    });

    function onResize() {
      const w = figure.clientWidth || width;
      const h = Math.max(320, Math.min(480, Math.round(w * 0.55)));
      host.style.height = h + "px";
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener("resize", onResize);

    let raf = 0;
    const clock = new THREE.Clock();
    function frame() {
      raf = requestAnimationFrame(frame);
      const t = clock.getElapsedTime();

      if (!dragging && !locked) {
        rotY += 0.0018;
      }

      const radius = 11.5;
      camera.position.x = Math.sin(rotY) * radius * Math.cos(rotX);
      camera.position.z = Math.cos(rotY) * radius * Math.cos(rotX);
      camera.position.y = Math.sin(rotX) * radius * 0.35 + 0.4;
      camera.lookAt(0, 0, 0);

      meshById.forEach((mesh, id) => {
        const target = baseScale.get(id) || 1;
        const pulse = 1 + Math.sin(t * 2 + mesh.position.x) * 0.03;
        const s = THREE.MathUtils.lerp(mesh.scale.x, target * pulse, 0.12);
        mesh.scale.setScalar(s);
      });

      projectLabels();
      renderer.render(scene, camera);
    }
    frame();

    renderer.domElement.addEventListener(
      "webglcontextlost",
      (ev) => {
        ev.preventDefault();
        cancelAnimationFrame(raf);
        figure.classList.remove("about-constellation-figure--webgl");
        host.hidden = true;
        webglSetCluster = null;
        webglSetSelected = null;
      },
      false
    );
  }

  applyDeepLink();

  if (figure) {
    requestAnimationFrame(() => {
      bootWebGL().catch(() => {
        /* Keep SVG path; silent degrade is intentional. */
      });
    });
  }
})();
