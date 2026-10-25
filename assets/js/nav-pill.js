/* Nav sliding pill: follows hover/focus, rests on the current page. Sets aria-current. */
(function () {
  const menu = document.getElementById("menu");
  if (!menu || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    if (menu) menu.querySelectorAll(".active").forEach((s) => s.parentElement.setAttribute("aria-current", "page"));
    return;
  }
  const pill = document.createElement("span");
  pill.className = "nav-pill";
  pill.setAttribute("aria-hidden", "true");
  menu.prepend(pill);
  const cur = menu.querySelector(".active");
  const curA = cur && cur.closest("a");
  if (curA) curA.setAttribute("aria-current", "page");
  const to = (a) => {
    if (!a) { pill.classList.remove("is-on"); return; }
    const l = a.closest("li"), g = 8;
    pill.style.width = l.offsetWidth + 2 * g + "px";
    pill.style.transform = "translateX(" + (l.offsetLeft - g) + "px)";
    pill.classList.add("is-on");
  };
  const rest = () => to(curA);
  menu.addEventListener("pointerover", (e) => { const a = e.target.closest("a"); if (a) to(a); });
  menu.addEventListener("focusin", (e) => to(e.target.closest("a")));
  menu.addEventListener("pointerleave", rest);
  menu.addEventListener("focusout", rest);
  addEventListener("resize", rest);
  rest();
})();
