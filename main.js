/* ==========================================================================
   NOVA STUDIO — main.js
   Rebuilt using the same libraries and near-identical ScrollTrigger configs
   found in the original bundle (OS4hgONa.js / kReKbN7K.js / -qTsPo9v.js /
   BB9HWyGd.js / BJvwdrpy.js):
     - Splitting.js  → data-splitting="chars|lines"
     - GSAP + ScrollTrigger → effect__textFade / effect__titleRandom /
       effect__fadeOut / effect__overlayIn / effect__separatorIn /
       effect__parallax / topOverlay visibility
     - Lenis → smooth scroll driven through the GSAP ticker
     - MarqueeText → gsap.to(track, {x:-width, duration:width/speed, repeat:-1})
     - Footer → cloned "trail" logos animated via --trail-progress/--trail-crop
   ========================================================================== */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isMobile = window.matchMedia("(max-width: 600px)").matches;

  var hasGsap = typeof window.gsap !== "undefined";
  var hasScrollTrigger = hasGsap && typeof window.ScrollTrigger !== "undefined";
  var hasSplitting = typeof window.Splitting === "function";

  if (hasScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ------------------------------------------------------------------ */
  /* 1. SPLITTING — wraps [data-splitting] into .line > .line__inner     */
  /*    (mirrors the site's own JP()/Splitting({whitespace:true}) call)  */
  /* ------------------------------------------------------------------ */
  function initSplitting() {
    if (hasSplitting) {
      Splitting({ target: "[data-splitting]", by: "chars", whitespace: true });
    }

    // Rebuild every result into <span class="line"><span class="line__inner">
    // exactly like the site's JP() helper, so effect__titleRandom /
    // effect__textFade can target .line__inner / .word.
    document.querySelectorAll("[data-splitting]").forEach(function (el) {
      if (el.classList.contains("chars")) return; // leave char-split marquee bits alone
      rebuildLines(el);
    });
  }

  // Fallback + line-rebuild: groups visually-wrapped words by offsetTop,
  // used both when Splitting.js isn't reachable and to normalise its output.
  function rebuildLines(el) {
    var text = el.textContent.trim();
    if (!text) return;
    var words = text.split(/\s+/);
    el.innerHTML = "";

    var frag = document.createDocumentFragment();
    var measure = [];
    words.forEach(function (w, i) {
      var span = document.createElement("span");
      span.textContent = w + (i < words.length - 1 ? " " : "");
      span.style.display = "inline-block";
      frag.appendChild(span);
      measure.push(span);
    });
    el.appendChild(frag);

    var lines = [];
    var top = null;
    var current = [];
    measure.forEach(function (span) {
      var t = span.offsetTop;
      if (top === null) top = t;
      if (Math.abs(t - top) > 2) {
        lines.push(current);
        current = [];
        top = t;
      }
      current.push(span.textContent);
    });
    if (current.length) lines.push(current);

    el.innerHTML = "";
    lines.forEach(function (words) {
      var line = document.createElement("span");
      line.className = "line";
      var inner = document.createElement("span");
      inner.className = "line__inner";
      inner.textContent = words.join("");
      line.appendChild(inner);
      el.appendChild(line);
    });
    el.removeAttribute("data-splitting");
  }

  /* ------------------------------------------------------------------ */
  /* 2. GSAP / ScrollTrigger EFFECTS — configs match the source 1:1      */
  /* ------------------------------------------------------------------ */
  function initScrollEffects() {
    if (!hasScrollTrigger) {
      // graceful fallback: just reveal everything statically
      document.querySelectorAll(
        "[data-splitting], .splitting, [effect__textfade], [effect__titlerandom]"
      ).forEach(function (el) { el.style.opacity = 1; });
      return;
    }

    var Y = gsap;

    // topOverlay visibility (gradient mask fade under fixed header)
    document.querySelectorAll(".topOverlay__section").forEach(function (el) {
      var section = el.closest("section") || el.parentElement;
      if (!section) return;
      ScrollTrigger.create({
        trigger: section,
        start: "top 5%",
        end: "bottom 20%",
        onEnter: function () { el.classList.add("is-visible"); },
        onLeave: function () { el.classList.remove("is-visible"); },
        onEnterBack: function () { el.classList.add("is-visible"); },
        onLeaveBack: function () { el.classList.remove("is-visible"); },
      });
    });

    // effect__textFade — .word/.line__inner opacity 0 -> 1, scrubbed
    document.querySelectorAll("[effect__textFade]").forEach(function (d) {
      var targets = d.querySelectorAll(".word, .line__inner");
      if (!targets.length) return;
      Y.fromTo(
        targets,
        { opacity: 0 },
        {
          ease: "none",
          opacity: 1,
          stagger: 0.05,
          scrollTrigger: {
            trigger: d,
            start: "top 80%",
            end: isMobile ? "center top+=10%" : "bottom 80%",
            scrub: true,
          },
        }
      );
    });

    // effect__titleRandom — .word/.line__inner random-order 3D reveal
    document.querySelectorAll("[effect__titleRandom]").forEach(function (d) {
      var small = d.getAttribute("data-small");
      var targets = d.querySelectorAll(".word, .line__inner");
      if (!targets.length) return;
      targets.forEach(function (t) { Y.set(t.parentNode, { perspective: 1000 }); });
      Y.fromTo(
        targets,
        { transformOrigin: "50% 100%", opacity: 0, z: -100 },
        {
          ease: "power4",
          opacity: 1,
          stagger: { each: 0.03, from: "random" },
          rotationX: 0,
          z: 0,
          scrollTrigger: {
            trigger: d,
            start: "top 90%",
            end: small ? "top 50%" : "top 0%",
            scrub: true,
          },
        }
      );
    });

    // effect__fadeOut — whole block fades + blurs out as it exits the top
    document.querySelectorAll("[effect__fadeOut]").forEach(function (d) {
      Y.fromTo(
        d,
        { opacity: 1, filter: "blur(0px)" },
        {
          ease: "none",
          opacity: 0,
          filter: "blur(20px)",
          scrollTrigger: { trigger: d, start: "top 5%", end: "top -30%", scrub: true },
        }
      );
    });

    // effect__fadeOutVideo
    document.querySelectorAll("[effect__fadeOutVideo]").forEach(function (d) {
      Y.fromTo(
        d,
        { opacity: 1, yPercent: 0 },
        {
          ease: "none",
          opacity: 0,
          yPercent: 50,
          scrollTrigger: { trigger: d, start: "top top", end: "top -100%", scrub: true },
        }
      );
    });

    // effect__overlayIn — grid of vertical bars wipes open (blinds reveal)
    document.querySelectorAll("[effect__overlayIn]").forEach(function (d) {
      var bars = d.querySelectorAll("div");
      if (!bars.length) return;
      Y.fromTo(
        bars,
        { transformOrigin: "50% 100%", opacity: 1, scaleY: 0 },
        {
          ease: "power4",
          scaleY: 1.01,
          opacity: 1,
          stagger: { grid: [isMobile ? 15 : 10, 1], from: "end", each: 0.04 },
          scrollTrigger: { trigger: d, start: "top 0%", end: "top -80%", scrub: true },
        }
      );
    });

    // effect__separatorIn — horizontal rule wipes in via clip-path
    document.querySelectorAll("[effect__separatorIn]").forEach(function (d) {
      Y.from(d, {
        ease: "none",
        clipPath: "inset(0 100vw 0 0)",
        scrollTrigger: { trigger: d, start: "top 90%", end: "top 70%", scrub: true },
      });
    });

    // effect__parallax — data-parallax="N" controls yPercent travel
    document.querySelectorAll("[effect__parallax]").forEach(function (d) {
      var isTop = d.classList.contains("top");
      Y.fromTo(
        d,
        { opacity: 1, yPercent: 0 },
        {
          ease: "none",
          yPercent: d.getAttribute("data-parallax"),
          scrollTrigger: {
            trigger: d,
            scroller: window,
            start: isTop ? "top top" : "top bottom",
            end: isTop ? "bottom top" : "bottom -60%",
            scrub: true,
          },
        }
      );
    });

    ScrollTrigger.refresh();
  }

  /* ------------------------------------------------------------------ */
  /* 3. MARQUEE — mirrors kReKbN7K.js MarqueeText.vue                    */
  /*    (measures title width, tweens x:-width, duration = width/speed)  */
  /* ------------------------------------------------------------------ */
  function initMarquees() {
    document.querySelectorAll(".marqueeText__track").forEach(function (track) {
      var speed = isMobile ? 80 : 150; // px/sec, matches component defaults

      function play() {
        var title = track.querySelector(".marqueeText__title");
        if (!title) return;
        var width = title.getBoundingClientRect().width;
        if (!width) return;

        if (hasGsap) {
          gsap.killTweensOf(track);
          gsap.set(track, { x: 0 });
          gsap.to(track, { x: -width, duration: width / speed, ease: "linear", repeat: -1 });
        } else {
          // CSS fallback loop
          track.style.setProperty("--marquee-w", -width + "px");
          track.style.animation = "marqueeFallback " + (width / speed) + "s linear infinite";
        }
      }

      requestAnimationFrame(function () { requestAnimationFrame(play); });
      window.addEventListener("resize", debounce(play, 200));
    });

    // reveal the marquee separator lines once tracks are measured
    requestAnimationFrame(function () {
      document.querySelectorAll(".marqueeText").forEach(function (m) {
        m.style.setProperty("--marquee-line-scale", "1");
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* 4. ACCORDION (FAQ)                                                   */
  /* ------------------------------------------------------------------ */
  function initAccordion() {
    var items = document.querySelectorAll("#accordion > li");
    items.forEach(function (item) {
      var trigger = item.querySelector("a");
      var content = item.querySelector(".accordion__content");

      trigger.addEventListener("click", function () {
        var isOpen = item.classList.contains("selected");

        items.forEach(function (other) {
          other.classList.remove("selected");
          other.style.setProperty("--anim", 0);
          other.querySelector(".accordion__content").style.height = "0px";
        });

        if (!isOpen) {
          item.classList.add("selected");
          item.style.setProperty("--anim", 1);
          content.style.height = content.scrollHeight + "px";
        }
      });
    });

    window.addEventListener("resize", debounce(function () {
      items.forEach(function (item) {
        if (item.classList.contains("selected")) {
          var content = item.querySelector(".accordion__content");
          content.style.height = content.scrollHeight + "px";
        }
      });
    }, 150));
  }

  /* ------------------------------------------------------------------ */
  /* 5. HEADER menu — clip-path wipe + staggered line reveal (BJvwdrpy)  */
  /* ------------------------------------------------------------------ */
  function initMenu() {
    var toggle = document.querySelector("header .menu");
    var nav = document.getElementById("mobile-navigation");
    if (!toggle || !nav) return;
    var links = nav.querySelectorAll("a");
    var open = false;

    function close() {
      if (!open) return;
      document.body.classList.remove("menu_open");
      toggle.textContent = "Menu";
      toggle.setAttribute("aria-expanded", "false");
      open = false;
      if (hasGsap) {
        gsap.fromTo(
          nav,
          { clipPath: "rect(0% 100% 100% 0%)" },
          { clipPath: "rect(0% 100% 0% 0%)", ease: "expo.out", duration: 0.5 }
        );
      } else {
        nav.style.clipPath = "rect(0% 100% 0% 0%)";
      }
    }

    toggle.addEventListener("click", function () {
      if (open) { close(); return; }
      document.body.classList.add("menu_open");
      toggle.textContent = "Close";
      toggle.setAttribute("aria-expanded", "true");
      open = true;

      if (hasGsap) {
        gsap.set(links, { opacity: 1 });
        gsap.set(".mobilenav .line__inner", { clearProps: "all" });
        gsap.fromTo(
          ".mobilenav .line__inner",
          { yPercent: -100 },
          { yPercent: 0, ease: "expo.out", duration: 0.7, stagger: 0.06 }
        );
        gsap.fromTo(
          nav,
          { clipPath: "rect(0% 100% 0% 0%)" },
          { clipPath: "rect(0% 100% 100% 0%)", ease: "expo.out", duration: 0.5 }
        );
      } else {
        nav.style.clipPath = "rect(0% 100% 100% 0%)";
      }
    });

    links.forEach(function (link) { link.addEventListener("click", close); });
  }

  /* ------------------------------------------------------------------ */
  /* 6. FOOTER — cloned logo trail scrubbed via ScrollTrigger            */
  /*    (mirrors -qTsPo9v.js Footer.vue)                                 */
  /* ------------------------------------------------------------------ */
  function initFooterTrail() {
    var stack = document.getElementById("footerLogoStack");
    var front = document.getElementById("footerLogoFront");
    if (!stack || !front || !hasGsap) return;

    stack.querySelectorAll(".footer__logo--trail").forEach(function (n) { n.remove(); });

    for (var i = 3; i >= 1; i -= 1) {
      var clone = front.cloneNode(true);
      var offset = (i - 1) * 5;
      clone.removeAttribute("id");
      clone.classList.remove("footer__logo--front");
      clone.classList.add("footer__logo--trail");
      clone.style.setProperty("--trail-index", i);
      clone.style.setProperty("--trail-crop-offset", offset + "%");
      clone.style.zIndex = i;
      stack.insertBefore(clone, front);
    }

    gsap.set(stack, { "--trail-progress": 0, "--trail-crop": "90%" });

    if (hasScrollTrigger) {
      gsap.to(stack, {
        "--trail-progress": 1,
        "--trail-crop": "65%",
        ease: "none",
        scrollTrigger: {
          trigger: stack,
          start: "top bottom",
          end: "bottom center",
          scrub: true,
        },
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /* 7. ADVANTAGES scroll-stack (mirrors BB9HWyGd.js ScrollAccordion)    */
  /*    Items translate upward as the section pins/scrolls past.         */
  /* ------------------------------------------------------------------ */
  function initBenefitsStack() {
    var target = document.getElementById("benefitsTarget");
    if (!target || !hasGsap) return;
    var items = target.querySelectorAll(".benefits__items--item");
    if (!items.length) return;

    var gap = window.innerHeight * 0.1;
    var stackHeight = items[items.length - 1].clientHeight + gap * (items.length - 1);
    var coeff = Math.max(-1, Math.min(1 - (1 - window.innerHeight / stackHeight), 1));

    function update() {
      var rect = target.getBoundingClientRect();
      var vh = window.innerHeight;
      var active = rect.top <= 0 && rect.bottom >= vh;
      if (!active) return;

      var scrolled = window.scrollY || window.pageYOffset;
      items.forEach(function (item, i) {
        var travel = gap * (i + 1) * coeff;
        var progress = scrolled - (target.offsetTop) - item.offsetTop + travel;
        if (progress >= 0) {
          gsap.set(item, { y: progress * coeff });
        }
      });
    }

    window.addEventListener("scroll", throttleRaf(update));
    window.addEventListener("resize", debounce(update, 200));
  }

  /* ------------------------------------------------------------------ */
  /* 8. GOOEY CURSOR                                                      */
  /* ------------------------------------------------------------------ */
  function initCursor() {
    var cursor = document.getElementById("cursor");
    if (!cursor || window.matchMedia("(max-width: 1300px)").matches) return;
    var x = 0, y = 0, cx = 0, cy = 0;

    window.addEventListener("mousemove", function (e) { x = e.clientX; y = e.clientY; });

    function loop() {
      cx += (x - cx) * 0.25;
      cy += (y - cy) * 0.25;
      cursor.style.transform = "translate(" + cx + "px," + cy + "px)";
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    document.querySelectorAll(".hover_effect, button, a").forEach(function (el) {
      el.addEventListener("mouseenter", function () { cursor.classList.add("is-active"); });
      el.addEventListener("mouseleave", function () { cursor.classList.remove("is-active"); });
    });
  }

  /* ------------------------------------------------------------------ */
  /* 9. LENIS smooth scroll, driven through the GSAP ticker              */
  /*    (mirrors GP()/KP() in the source: autoRaf:false + ticker.add)    */
  /* ------------------------------------------------------------------ */
  function initSmoothScroll() {
    if (reduceMotion || isMobile) return;
    if (typeof window.Lenis !== "function") return;

    var lenis = new window.Lenis({ autoRaf: false, lerp: 0.1, smoothWheel: true });
    lenis.stop();
    // give layout a tick to settle before enabling
    requestAnimationFrame(function () { lenis.start(); });

    if (hasGsap) {
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
      requestAnimationFrame(raf);
    }

    if (hasScrollTrigger) {
      lenis.on("scroll", ScrollTrigger.update);
    }

    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (e) {
        var id = link.getAttribute("href");
        if (id.length < 2) return;
        var el = document.querySelector(id);
        if (!el) return;
        e.preventDefault();
        lenis.scrollTo(el, { offset: -20 });
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* UTIL                                                                 */
  /* ------------------------------------------------------------------ */
  function debounce(fn, wait) {
    var t;
    return function () {
      clearTimeout(t);
      var args = arguments, ctx = this;
      t = setTimeout(function () { fn.apply(ctx, args); }, wait);
    };
  }
  function throttleRaf(fn) {
    var ticking = false;
    return function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { fn(); ticking = false; });
    };
  }

  /* ------------------------------------------------------------------ */
  /* BOOT                                                                 */
  /* ------------------------------------------------------------------ */
  function boot() {
    initSplitting();

    requestAnimationFrame(function () {
      initScrollEffects();
      initMarquees();
      initFooterTrail();
      initBenefitsStack();
    });

    initAccordion();
    initMenu();
    initCursor();
    initSmoothScroll();

    document.body.classList.remove("is-loading");

    window.addEventListener("load", function () {
      if (hasScrollTrigger) ScrollTrigger.refresh();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
