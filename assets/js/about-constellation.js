/**
 * About page constellation interactivity.
 *
 * Phase 1: pill ↔ node ↔ impact-card highlight by data-cluster.
 * Phase 2 (future): same data-node-id / data-cluster attributes feed a WebGL scene.
 *
 * Respects prefers-reduced-motion for auto-effects; manual hover/focus still works.
 */
(function () {
  const root = document.querySelector(".about-page");
  if (!root) return;

  const pills = Array.from(root.querySelectorAll(".about-pill[data-cluster]"));
  const nodes = Array.from(root.querySelectorAll(".about-constellation-node[data-cluster]"));
  const edges = Array.from(root.querySelectorAll(".about-constellation-edge"));
  const impactCards = Array.from(root.querySelectorAll(".about-impact-card[data-cluster]"));
  const skillBlocks = Array.from(
    root.querySelectorAll(
      ".about-skills-primary, .about-skills-web, .about-skills-card"
    )
  );

  let activeCluster = null;
  let locked = false;

  function setCluster(cluster, { lock = false } = {}) {
    activeCluster = cluster || null;
    if (lock) locked = Boolean(cluster);

    root.classList.toggle("about-page--filtering", Boolean(cluster));

    const match = (el) => !cluster || el.getAttribute("data-cluster") === cluster;

    pills.forEach((el) => {
      el.classList.toggle("is-active", match(el) && Boolean(cluster));
      el.classList.toggle("is-dimmed", Boolean(cluster) && !match(el));
    });

    nodes.forEach((el) => {
      const on = match(el) && Boolean(cluster);
      el.classList.toggle("is-active", on);
      el.classList.toggle("is-dimmed", Boolean(cluster) && !match(el));
      el.setAttribute("aria-pressed", on ? "true" : "false");
    });

    skillBlocks.forEach((el) => {
      el.classList.toggle("is-active", match(el) && Boolean(cluster));
      el.classList.toggle("is-dimmed", Boolean(cluster) && !match(el));
    });

    impactCards.forEach((el) => {
      el.classList.toggle("is-active", match(el) && Boolean(cluster));
      el.classList.toggle("is-dimmed", Boolean(cluster) && !match(el));
    });

    // Dim edges that do not touch an active-cluster node
    if (!cluster) {
      edges.forEach((e) => e.classList.remove("is-active", "is-dimmed"));
      return;
    }

    const activeIds = new Set(
      nodes
        .filter((n) => n.getAttribute("data-cluster") === cluster)
        .map((n) => n.getAttribute("data-node-id"))
    );

    edges.forEach((edge) => {
      const from = edge.getAttribute("data-from");
      const to = edge.getAttribute("data-to");
      const on = activeIds.has(from) || activeIds.has(to);
      edge.classList.toggle("is-active", on);
      edge.classList.toggle("is-dimmed", !on);
    });
  }

  function clearIfUnlocked() {
    if (!locked) setCluster(null);
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
    pill.addEventListener("click", () => {
      if (locked && activeCluster === cluster) {
        locked = false;
        setCluster(null);
      } else {
        setCluster(cluster, { lock: true });
      }
    });
  });

  nodes.forEach((node) => {
    const cluster = node.getAttribute("data-cluster");
    node.addEventListener("mouseenter", () => {
      if (!locked) setCluster(cluster);
    });
    node.addEventListener("mouseleave", clearIfUnlocked);
    node.addEventListener("focus", () => {
      if (!locked) setCluster(cluster);
    });
    node.addEventListener("blur", clearIfUnlocked);
    node.addEventListener("click", () => {
      if (locked && activeCluster === cluster) {
        locked = false;
        setCluster(null);
      } else {
        setCluster(cluster, { lock: true });
      }
    });
    node.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        node.click();
      }
    });
  });

  // Click empty constellation background to clear a lock
  const svg = root.querySelector(".about-constellation-svg");
  if (svg) {
    svg.addEventListener("click", (ev) => {
      if (ev.target === svg || ev.target.classList.contains("about-constellation-edge")) {
        locked = false;
        setCluster(null);
      }
    });
  }
})();
