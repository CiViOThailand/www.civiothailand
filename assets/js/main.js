(() => {
  "use strict";

  // Return to the absolute top of the page when the footer link is clicked.
  document.querySelectorAll(".back-top").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const reduceMotion = window.matchMedia
        && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, left: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  });

  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");

  if (menuButton && nav) {
    const dropdowns = Array.from(nav.querySelectorAll(".nav-dropdown"));

    const setDropdown = (dropdown, open) => {
      dropdown.classList.toggle("is-open", open);
      const toggle = dropdown.querySelector(".nav-dropdown-toggle");
      if (toggle) toggle.setAttribute("aria-expanded", String(open));
    };
    const closeDropdowns = (except) => {
      dropdowns.forEach((d) => { if (d !== except) setDropdown(d, false); });
    };
    const setNav = (open) => {
      nav.classList.toggle("is-open", open);
      menuButton.setAttribute("aria-expanded", String(open));
      if (!open) closeDropdowns();
    };

    dropdowns.forEach((dropdown) => {
      const toggle = dropdown.querySelector(".nav-dropdown-toggle");
      if (!toggle) return;
      toggle.addEventListener("click", (event) => {
        event.stopPropagation();
        const willOpen = !dropdown.classList.contains("is-open");
        closeDropdowns(dropdown);
        setDropdown(dropdown, willOpen);
        // Drop focus after closing so the menu cannot stay open by focus alone.
        if (!willOpen) toggle.blur();
      });
    });

    menuButton.addEventListener("click", () => {
      setNav(menuButton.getAttribute("aria-expanded") !== "true");
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setNav(false));
    });

    document.addEventListener("click", (event) => {
      if (!nav.contains(event.target) && !menuButton.contains(event.target)) setNav(false);
      closeDropdowns(event.target.closest ? event.target.closest(".nav-dropdown") : null);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      const openDropdown = nav.querySelector(".nav-dropdown.is-open .nav-dropdown-toggle");
      closeDropdowns();
      setNav(false);
      if (openDropdown) openDropdown.focus({ preventScroll: true });
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) setNav(false);
    });
  }

  // Reveal sections as they enter the viewport.
  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  // Reading progress bar.
  const progress = document.getElementById("scrollProgress");
  const updateProgress = () => {
    if (!progress) return;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
    progress.style.width = `${Math.min(100, Math.max(0, ratio * 100))}%`;
  };
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  const year = document.getElementById("currentYear");
  if (year) year.textContent = new Date().getFullYear();

  // Interactive product carousel: selected product rotates forward and grows.
  const productCarousel = document.querySelector("[data-product-carousel]");
  if (productCarousel) {
    const slides = Array.from(productCarousel.querySelectorAll("[data-product-slide]"));
    const selectors = Array.from(productCarousel.querySelectorAll("[data-product-select]"));
    const prevButton = productCarousel.querySelector("[data-product-prev]");
    const nextButton = productCarousel.querySelector("[data-product-next]");
    let activeProduct = 0;

    const showProduct = (requestedIndex) => {
      if (!slides.length) return;
      activeProduct = (requestedIndex + slides.length) % slides.length;

      slides.forEach((slide, index) => {
        slide.classList.remove("is-active", "is-prev", "is-next", "is-back");
        let position = "is-back";
        if (index === activeProduct) position = "is-active";
        else if (index === (activeProduct - 1 + slides.length) % slides.length) position = "is-prev";
        else if (index === (activeProduct + 1) % slides.length) position = "is-next";
        slide.classList.add(position);
        slide.setAttribute("aria-hidden", String(position === "is-back"));
      });

      selectors.forEach((button, index) => {
        const selected = index === activeProduct;
        button.classList.toggle("is-active", selected);
        button.setAttribute("aria-pressed", String(selected));
      });
    };

    slides.forEach((slide, index) => {
      slide.addEventListener("click", (event) => {
        if (event.target.closest("a, button")) return;
        showProduct(index);
      });
      slide.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); showProduct(index); }
      });
    });

    selectors.forEach((button) => {
      button.addEventListener("click", () => {
        showProduct(Number(button.dataset.productSelect));
      });
    });

    if (prevButton) prevButton.addEventListener("click", () => showProduct(activeProduct - 1));
    if (nextButton) nextButton.addEventListener("click", () => showProduct(activeProduct + 1));
    let touchStartX = null;
    const stage = productCarousel.querySelector(".product-carousel-stage");
    if (stage) {
      stage.addEventListener("touchstart", (event) => { touchStartX = event.changedTouches[0].clientX; }, { passive: true });
      stage.addEventListener("touchend", (event) => {
        if (touchStartX === null) return;
        const delta = event.changedTouches[0].clientX - touchStartX;
        if (Math.abs(delta) > 45) showProduct(activeProduct + (delta < 0 ? 1 : -1));
        touchStartX = null;
      }, { passive: true });
    }
    showProduct(0);
  }

  // Contact form opens the visitor's email client with the completed enquiry.
  const civioForm = document.getElementById("civioContactForm");
  if (civioForm) civioForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!civioForm.reportValidity()) return;
    const values = new FormData(civioForm);
    const subject = encodeURIComponent("CIVIO Contact: " + values.get("subject"));
    const body = encodeURIComponent("ชื่อ-นามสกุล: " + values.get("name") + "\nเบอร์โทรศัพท์: " + values.get("phone") + "\nอีเมล: " + values.get("email") + "\nเรื่องที่ต้องการติดต่อ: " + values.get("subject"));
    window.location.href = "mailto:civioteam@massdyna.com?subject=" + subject + "&body=" + body;
  });

  // Local fallbacks keep the layout intact when an external image is unavailable.
  document.querySelectorAll("img").forEach((img) => {
    img.addEventListener("error", () => {
      if (img.dataset.fallbackApplied) return;
      img.dataset.fallbackApplied = "true";
      const alt = (img.alt || "").toLowerCase();
      img.src = alt.includes("ฟาร์ม") || alt.includes("ผัก") || alt.includes("กิจกรรม")
        ? "assets/images/vegetable-farm-natural.webp"
        : "assets/images/compost-soil-seedlings.webp";
      img.classList.add("image-fallback");
    });
  });
  
  // Intro video: play while visible, pause when scrolled away (saves battery/data)
  const introVideo = document.getElementById("civio-intro-video");
  if (introVideo && "IntersectionObserver" in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const playing = introVideo.play();
          if (playing && playing.catch) playing.catch(() => {});
        } else {
          introVideo.pause();
        }
      });
    }, { threshold: 0.35 });
    videoObserver.observe(introVideo);
  }

  // Awards showcase: three distinct items loop continuously; hover/focus reveals details.
  const awardTrack = document.getElementById("awardTrack");
  const awardTrackSet = awardTrack?.querySelector(".award-track-set:not(.award-track-set--clone)");
  const awardViewport = awardTrack?.closest(".award-marquee-viewport");

  if (awardTrack && awardTrackSet && awardViewport) {
    const awardCards = Array.from(awardTrack.querySelectorAll(".award-marquee-card"));

    awardCards.forEach((card) => {
      const description = card.dataset.description || "ผลงานและความสำเร็จของ CiViO Thailand";
      const title = card.dataset.title || "CiViO Recognition";
      const points = (card.dataset.points || "").split("|").filter(Boolean);

      const detail = document.createElement("div");
      detail.className = "award-hover-detail";

      const kicker = document.createElement("small");
      kicker.textContent = "CIVIO THAILAND · RECOGNITION";

      const heading = document.createElement("strong");
      heading.textContent = title;

      const summary = document.createElement("p");
      summary.textContent = description;

      detail.append(kicker, heading, summary);

      if (points.length) {
        const list = document.createElement("ul");
        points.forEach((point) => {
          const item = document.createElement("li");
          item.textContent = point;
          list.appendChild(item);
        });
        detail.appendChild(list);
      }

      card.appendChild(detail);
      card.setAttribute("aria-label", `${title}. ชี้เมาส์หรือโฟกัสเพื่ออ่านรายละเอียด`);
      if (card.closest(".award-track-set--clone")) {
        card.setAttribute("tabindex", "-1");
      }
    });

    const updateAwardLoop = () => {
      const distance = Math.ceil(awardTrackSet.getBoundingClientRect().width);
      if (!distance) return;
      awardTrack.style.setProperty("--award-distance", `${distance}px`);
      awardTrack.style.setProperty("--award-end", `-${distance}px`);
      // Keep a consistent, gentle pace at every screen size.
      awardTrack.style.setProperty("--award-duration", `${Math.max(24, distance / 29)}s`);
      awardTrack.classList.add("is-looping");
    };

    updateAwardLoop();
    window.addEventListener("resize", updateAwardLoop, { passive: true });
    if ("ResizeObserver" in window) {
      const awardResizeObserver = new ResizeObserver(updateAwardLoop);
      awardResizeObserver.observe(awardViewport);
      awardResizeObserver.observe(awardTrackSet);
    }
    window.addEventListener("load", updateAwardLoop, { once: true });
  }

  // Keep local fallback images available if an external award image cannot load.
  document.querySelectorAll(".award-marquee-photo img[data-fallback]").forEach((image) => {
    image.addEventListener("error", () => {
      if (image.dataset.fallback && image.src !== new URL(image.dataset.fallback, document.baseURI).href) {
        image.src = image.dataset.fallback;
        image.removeAttribute("data-fallback");
      }
    }, { once: true });
  });

})();
