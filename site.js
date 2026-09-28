// RinkPulse site behavior: small, dependency-free, safe to fail.
(function () {
  "use strict";

  // Mobile install bar: only show it once the hero install button is off-screen,
  // so it never covers the hero links on first load.
  var bar = document.querySelector(".mobile-install-bar");
  var heroCta = document.getElementById("hero-install");
  if (bar) {
    if (heroCta && "IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var below = entry.boundingClientRect.top > 0;
          bar.classList.toggle("is-visible", !entry.isIntersecting && !below);
        });
      }).observe(heroCta);
    } else {
      bar.classList.add("is-visible");
    }
  }

  // Close the mobile menu after picking a link (same-page anchors keep it open otherwise).
  var mobileNav = document.querySelector(".mobile-nav");
  if (mobileNav) {
    mobileNav.addEventListener("click", function (e) {
      if (e.target.closest("a")) mobileNav.removeAttribute("open");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") mobileNav.removeAttribute("open");
    });
  }

  // Compatible watches filter.
  var search = document.getElementById("compat-search");
  if (search) {
    var families = document.querySelectorAll(".compat-family");
    var empty = document.querySelector(".compat-empty");
    var norm = function (s) {
      return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
    };
    search.addEventListener("input", function () {
      var q = norm(search.value);
      var shown = 0;
      families.forEach(function (fam) {
        var famName = norm(fam.getAttribute("data-family") || "");
        var any = false;
        fam.querySelectorAll("li").forEach(function (li) {
          var hit = !q || norm(li.textContent).indexOf(q) !== -1 || famName.indexOf(q) !== -1;
          li.hidden = !hit;
          if (hit) { any = true; shown++; }
        });
        fam.hidden = !any;
      });
      if (empty) empty.style.display = shown ? "none" : "block";
    });
  }
})();
