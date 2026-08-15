// Post TOC rail: scroll-spy + desktop always-open sidebar behavior.
// Plan 0004 / D3 scroll-spy; 2026-07 layout polish keeps the TOC open on
// wide viewports so expanding "Table of Contents" never pushes the article.
(function () {
  var tocRail = document.querySelector(".post-toc-rail");
  if (!tocRail) return;

  var details = tocRail.querySelector("details.toc");
  var desktopQuery = window.matchMedia("(min-width: 1024px)");

  function syncDesktopOpen() {
    if (!details) return;
    if (desktopQuery.matches) {
      details.open = true;
      details.setAttribute("data-toc-rail", "desktop");
    } else {
      details.removeAttribute("data-toc-rail");
      // Leave open state alone on mobile — user controls the collapsible.
    }
  }

  syncDesktopOpen();
  if (desktopQuery.addEventListener) {
    desktopQuery.addEventListener("change", syncDesktopOpen);
  } else if (desktopQuery.addListener) {
    desktopQuery.addListener(syncDesktopOpen);
  }

  // Re-open if something closes the panel while we're in desktop rail mode.
  if (details) {
    details.addEventListener("toggle", function () {
      if (desktopQuery.matches && !details.open) {
        details.open = true;
      }
    });
  }

  if (typeof IntersectionObserver === "undefined") return;

  var tocLinks = Array.prototype.slice.call(
    tocRail.querySelectorAll('a[href^="#"]')
  );
  if (!tocLinks.length) return;

  var linkByHeadingId = {};
  var headings = [];
  tocLinks.forEach(function (link) {
    var id = decodeURIComponent(link.getAttribute("href").slice(1));
    var heading = document.getElementById(id);
    if (!heading) return;
    linkByHeadingId[id] = link;
    headings.push(heading);
  });
  if (!headings.length) return;

  function setActive(id) {
    tocLinks.forEach(function (link) {
      link.classList.remove("active");
    });
    var active = linkByHeadingId[id];
    if (active) active.classList.add("active");
  }

  // rootMargin trims the bottom 70% so a heading is "current" in the top band.
  var observer = new IntersectionObserver(
    function (entries) {
      var visible = entries
        .filter(function (entry) {
          return entry.isIntersecting;
        })
        .sort(function (a, b) {
          return a.boundingClientRect.top - b.boundingClientRect.top;
        });
      if (visible.length) {
        setActive(visible[0].target.id);
      }
    },
    { rootMargin: "0px 0px -70% 0px", threshold: 0 }
  );

  headings.forEach(function (heading) {
    observer.observe(heading);
  });
})();
