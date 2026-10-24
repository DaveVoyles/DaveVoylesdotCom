/**
 * Cmd/Ctrl-K command palette. Searches /index.json (the same data the
 * /search/ page uses), fetched on first open. Adds a trigger button to the
 * header. Plain script, no dependencies.
 */
(function () {
  const root = document.documentElement.dataset.cmdkIndex;
  const PAGES = [["About", "/about/"], ["Tags", "/tags/"], ["Archives", "/archives/"], ["Search", "/search/"], ["Graph", "/graph/"]];
  let data = null, items = [], sel = 0, prev = null, pal = null, q = null, res = null;
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const hl = (s, i, n) => i < 0 ? esc(s) : esc(s.slice(0, i)) + "<mark>" + esc(s.slice(i, i + n)) + "</mark>" + esc(s.slice(i + n));
  const mac = /Mac|iPhone|iPad/.test(navigator.platform);

  const build = () => {
    pal = document.createElement("div");
    pal.id = "cmdk";
    pal.setAttribute("role", "dialog");
    pal.setAttribute("aria-modal", "true");
    pal.setAttribute("aria-label", "Search posts");
    pal.innerHTML = '<div class="cmdk-box"><input class="cmdk-input" type="text" placeholder="Search posts..." autocomplete="off" spellcheck="false" role="combobox" aria-expanded="true" aria-controls="cmdk-res"><ul id="cmdk-res" class="cmdk-res" role="listbox"></ul><div class="cmdk-foot"><span><kbd>↑</kbd> <kbd>↓</kbd> move</span><span><kbd>Enter</kbd> open</span><span><kbd>Esc</kbd> close</span></div></div>';
    document.body.appendChild(pal);
    q = pal.querySelector("input");
    res = pal.querySelector("ul");
    q.addEventListener("input", () => { sel = 0; run(); });
    pal.addEventListener("mousedown", (e) => { if (e.target === pal) hide(); });
    res.addEventListener("mousemove", (e) => {
      const li = e.target.closest("li[data-i]");
      if (li && +li.dataset.i !== sel) { sel = +li.dataset.i; mark(); }
    });
  };
  const mark = () => res.querySelectorAll("li[data-i]").forEach((l) => l.setAttribute("aria-selected", +l.dataset.i === sel));
  const load = () => data || (data = fetch(root || "/index.json").then((r) => r.json()).catch(() => []));

  const run = async () => {
    const n = q.value.trim().toLowerCase();
    const posts = await load();
    let out = [];
    if (!n) out = posts.slice(0, 7).map((p) => ({ p, t: esc(p.title) }));
    else for (const p of posts) {
      const ti = p.title.toLowerCase().indexOf(n);
      if (ti >= 0) out.push({ p, t: hl(p.title, ti, n.length), sc: ti });
      else if ((p.summary || "").toLowerCase().includes(n)) out.push({ p, t: esc(p.title), sc: 100 });
    }
    out.sort((a, b) => (a.sc || 0) - (b.sc || 0));
    const pg = n ? PAGES.filter((g) => g[0].toLowerCase().includes(n)).map((g) => ({ pg: g })) : [];
    items = [...out.slice(0, 8), ...pg];
    sel = Math.min(sel, Math.max(items.length - 1, 0));
    res.innerHTML = items.length ? items.map((it, i) => it.pg
      ? '<li role="option" data-i="' + i + '" aria-selected="' + (i === sel) + '"><a href="' + it.pg[1] + '"><span class="cmdk-t">' + esc(it.pg[0]) + '</span><span class="cmdk-m">page</span></a></li>'
      : '<li role="option" data-i="' + i + '" aria-selected="' + (i === sel) + '"><a href="' + esc(it.p.permalink) + '"><span class="cmdk-t">' + it.t + '</span><span class="cmdk-m">' + esc((it.p.summary || "").replace(/\s+/g, " ").slice(0, 110)) + '</span></a></li>').join("")
      : '<li class="cmdk-none">No posts match “' + esc(q.value) + '”</li>';
  };
  const move = (d) => {
    if (!items.length) return;
    sel = (sel + d + items.length) % items.length; mark();
    const a = res.querySelector('[aria-selected="true"]'); a && a.scrollIntoView({ block: "nearest" });
  };
  const show = () => { if (!pal) build(); prev = document.activeElement; pal.classList.add("on"); q.value = ""; sel = 0; run(); q.focus(); };
  const hide = () => { pal.classList.remove("on"); prev && prev.focus && prev.focus(); };

  addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); pal && pal.classList.contains("on") ? hide() : show(); return; }
    if (!pal || !pal.classList.contains("on")) return;
    if (e.key === "Escape") hide();
    else if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
    else if (e.key === "Enter") { const a = res.querySelector('[aria-selected="true"] a'); if (a) { e.preventDefault(); location.href = a.href; } }
  });

  const nav = document.querySelector(".logo-switches") || document.querySelector(".header-nav");
  if (nav) {
    const b = document.createElement("button");
    b.type = "button"; b.className = "cmdk-btn"; b.setAttribute("aria-label", "Open search palette");
    b.innerHTML = 'Search <kbd>' + (mac ? "⌘ K" : "Ctrl K") + "</kbd>";
    b.addEventListener("click", show);
    nav.appendChild(b);
  }
})();
