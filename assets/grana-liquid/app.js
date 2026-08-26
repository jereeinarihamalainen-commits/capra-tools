
    (function () {
      "use strict";

      var body = document.body;
      var header = document.querySelector("[data-header]");
      var toggle = document.querySelector("[data-menu-toggle]");
      var menu = document.querySelector("[data-mobile-menu]");
      var mobileLinks = menu ? menu.querySelectorAll("a") : [];
      var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

      function setMenu(open) {
        if (!toggle || !menu) return;
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Sulje valikko" : "Avaa valikko");
        menu.setAttribute("aria-hidden", String(!open));
        menu.classList.toggle("is-open", open);
        header.classList.toggle("menu-active", open);
        body.classList.toggle("menu-open", open);
      }

      if (toggle) {
        toggle.addEventListener("click", function () {
          setMenu(toggle.getAttribute("aria-expanded") !== "true");
        });
      }

      mobileLinks.forEach(function (link) {
        link.addEventListener("click", function () {
          setMenu(false);
        });
      });

      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") setMenu(false);
      });

      function updateHeader() {
        if (header) header.classList.toggle("is-scrolled", window.scrollY > 24);
      }

      updateHeader();
      window.addEventListener("scroll", updateHeader, { passive: true });

      var revealItems = document.querySelectorAll(".reveal");

      if ("IntersectionObserver" in window && !reducedMotion.matches) {
        var revealObserver = new IntersectionObserver(function (entries, observer) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        }, {
          threshold: 0.12,
          rootMargin: "0px 0px -6% 0px"
        });

        revealItems.forEach(function (item) {
          revealObserver.observe(item);
        });
      } else {
        revealItems.forEach(function (item) {
          item.classList.add("is-visible");
        });
      }

      var heroImage = document.querySelector(".hero-product img");
      var ticking = false;

      function updateHeroDepth() {
        if (!heroImage || reducedMotion.matches || window.innerWidth < 761) {
          ticking = false;
          return;
        }

        var movement = Math.min(window.scrollY * 0.035, 24);
        heroImage.style.setProperty("--hero-image-y", movement + "px");
        ticking = false;
      }

      window.addEventListener("scroll", function () {
        if (!ticking) {
          window.requestAnimationFrame(updateHeroDepth);
          ticking = true;
        }
      }, { passive: true });
    }());
  