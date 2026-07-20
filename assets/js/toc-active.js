// Scroll-spy for the post TOC rail (plan 0004 / D3): toggles an "active"
// class on the TOC link for whichever heading is currently in view.
// Reuses toc.html's existing heading ids/anchors -- no heading-parsing
// logic duplicated here, just observing what's already in the DOM.
(function () {
  var tocRail = document.querySelector(".post-toc-rail");
  if (!tocRail) return;

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

  // rootMargin trims the bottom 70% of the viewport out of the
  // intersection area, so a heading is only considered "current" once it
  // crosses into the top band -- the usual scroll-spy trigger point,
  // rather than firing the moment any part of a section is visible.
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
