/*=============== HOME SPLIT TEXT ANIMATION ===============*/
if (typeof anime !== "undefined" && anime.text && anime.text.split) {
  try {
    const { animate, text, stagger } = anime;

    const prof1El = document.querySelector(".home__profession-1");
    if (prof1El && !prof1El.querySelector("#heroCapsule")) {
      const { chars: chars1 } = text.split(".home__profession-1", {
        chars: true,
      });
      if (chars1 && chars1.length > 0) {
        animate(chars1, {
          y: [{ to: ["100%", "0%"] }, { to: "-100%", delay: 4000, ease: "in(3)" }],
          duration: 900,
          ease: "out(3)",
          delay: stagger(60),
          loop: true,
        });
      }
    }

    const { chars: chars2 } = text.split(".home__profession-2", {
      chars: true,
    });

    if (chars2 && chars2.length > 0) {
      animate(chars2, {
        y: [{ to: ["100%", "0%"] }, { to: "-100%", delay: 4000, ease: "in(3)" }],
        duration: 900,
        ease: "out(3)",
        delay: stagger(60),
        loop: true,
      });
    }
  } catch (err) {
    console.warn("Anime.js text split initialisation bypassed:", err);
  }
}

/*=============== SWIPER PROJECTS CAROUSEL ===============*/
const swiperProjects = new Swiper(".projects__swiper", {
  loop: true,
  spaceBetween: 24,
  slidesPerView: "auto",
  grabCursor: true,
  speed: 600,

  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },

  autoplay: {
    delay: 3500,
    disableOnInteraction: false,
  },
});

/*=============== WORK TABS (EXPERIENCE / EDUCATION) ===============*/
const tabs = document.querySelectorAll("[data-target]"),
  tabContents = document.querySelectorAll("[data-content]");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const targetSelector = tab.dataset.target,
      targetContent = document.querySelector(targetSelector);

    // Disable all content and active tabs
    tabContents.forEach((content) => content.classList.remove("work-active"));
    tabs.forEach((t) => t.classList.remove("work-active"));

    // Activate the tab and corresponding content
    tab.classList.add("work-active");
    if (targetContent) {
      targetContent.classList.add("work-active");
    }
  });
});

/*=============== SERVICES / TECHNICAL SKILLS ACCORDION ===============*/
const serviceCards = document.querySelectorAll(".services__card");

serviceCards.forEach((card) => {
  const button = card.querySelector(".services__button");
  const info = card.querySelector(".services__info");

  // Initial state check
  if (card.classList.contains("services__open") && info) {
    info.style.height = info.scrollHeight + "px";
  }

  const toggleCard = () => {
    const isOpen = card.classList.contains("services__open");

    // Close all other cards first
    serviceCards.forEach((c) => {
      c.classList.remove("services__open");
      c.classList.add("services__close");
      const i = c.querySelector(".services__info");
      if (i) i.style.height = "0px";
    });

    // Toggle current card
    if (!isOpen && info) {
      card.classList.remove("services__close");
      card.classList.add("services__open");
      info.style.height = info.scrollHeight + "px";
    }
  };

  if (button) {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleCard();
    });
  }

  // Also allow clicking card header to toggle
  const cardData = card.querySelector(".services__data");
  if (cardData) {
    cardData.style.cursor = "pointer";
    cardData.addEventListener("click", toggleCard);
  }
});

/*=============== GALLERY LIGHTBOX MODAL ===============*/
const galleryCards = document.querySelectorAll(".gallery__card");
const galleryModal = document.getElementById("gallery-modal");
const modalImg = document.getElementById("modal-img");
const modalTitle = document.getElementById("modal-title");
const modalDesc = document.getElementById("modal-desc");
const modalClose = document.getElementById("modal-close");
const modalLiveBtn = document.getElementById("modal-live-btn");
const modalGithubBtn = document.getElementById("modal-github-btn");

if (galleryCards.length && galleryModal) {
  galleryCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      // If clicking an action link directly inside the card, let the link open normally
      if (e.target.closest("a")) return;

      const img = card.querySelector(".gallery__img");
      const title = card.querySelector(".gallery__title");
      const desc = card.querySelector(".gallery__description");

      if (img && modalImg) modalImg.src = img.src;
      if (title && modalTitle) modalTitle.textContent = title.textContent;
      if (desc && modalDesc) modalDesc.textContent = desc.textContent;

      const liveUrl = card.dataset.liveUrl;
      const ghUrl = card.dataset.githubUrl;

      if (modalLiveBtn) {
        if (liveUrl && !liveUrl.includes("github.com/stl-sahadat/")) {
          modalLiveBtn.href = liveUrl;
          modalLiveBtn.style.display = "inline-flex";
        } else if (liveUrl) {
          modalLiveBtn.href = liveUrl;
          modalLiveBtn.style.display = "inline-flex";
        } else {
          modalLiveBtn.style.display = "none";
        }
      }

      if (modalGithubBtn) {
        if (ghUrl) {
          modalGithubBtn.href = ghUrl;
          modalGithubBtn.style.display = "inline-flex";
        } else {
          modalGithubBtn.style.display = "none";
        }
      }

      galleryModal.classList.add("modal-active");
      document.body.style.overflow = "hidden";
    });
  });

  const closeModal = () => {
    galleryModal.classList.remove("modal-active");
    document.body.style.overflow = "";
  };

  if (modalClose) {
    modalClose.addEventListener("click", closeModal);
  }

  galleryModal.addEventListener("click", (e) => {
    if (e.target === galleryModal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && galleryModal.classList.contains("modal-active")) {
      closeModal();
    }
  });
}

/*=============== TESTIMONIALS DUPLICATE CARDS FOR INFINITE MARQUEE ===============*/
const tracks = document.querySelectorAll(".testimonial__content");

tracks.forEach((track) => {
  const cards = [...track.children];
  // Duplicate cards once to ensure seamless infinite scroll
  for (const card of cards) {
    track.appendChild(card.cloneNode(true));
  }
});

/*=============== 1-CLICK CLIPBOARD EMAIL COPY ===============*/
const copyBtn = document.getElementById("contact-btn");
const copyEmailElem = document.getElementById("contact-email");

if (copyBtn && copyEmailElem) {
  const emailText = copyEmailElem.textContent.trim();

  copyBtn.addEventListener("click", () => {
    navigator.clipboard
      .writeText(emailText)
      .then(() => {
        const textSpan = copyBtn.querySelector(".gem-btn__text");
        if (textSpan) {
          textSpan.textContent = "Email Copied";
          setTimeout(() => {
            textSpan.textContent = "Copy Email";
          }, 2200);
        } else {
          copyBtn.innerHTML = 'Email Copied <i class="ri-check-line"></i>';
          setTimeout(() => {
            copyBtn.innerHTML =
              'Copy Email <i class="ri-file-copy-line"></i><span class="contact__email" id="contact-email">' +
              emailText +
              "</span>";
          }, 2200);
        }
      })
      .catch((err) => {
        console.error("Clipboard write failed:", err);
      });
  });
}

/*=============== CURRENT YEAR IN FOOTER ===============*/
const textYear = document.getElementById("footer-year");
if (textYear) {
  textYear.textContent = new Date().getFullYear();
}

/*=============== CLEAN URLS & HISTORY API WITH INTERSECTIONOBSERVER (NO HASHTAGS) ===============*/
const SECTION_PATH_MAP = [
  { id: "home", path: "/", label: "Home" },
  { id: "about", path: "/about", label: "About Me" },
  { id: "projects", path: "/projects", label: "Projects" },
  { id: "gallery", path: "/showcase", label: "Showcase" },
  { id: "work", path: "/experience", label: "Experience" },
  { id: "services", path: "/skills", label: "Skills" },
  { id: "tech-stack", path: "/skills", label: "Tech Stack" },
  { id: "contact", path: "/contact", label: "Contact" },
];

const ROUTE_ALIASES = {
  "/profile": "about",
  "/projects": "projects",
  "/showcase": "gallery",
  "/experience": "work",
  "/work": "work",
  "/skills": "services",
  "/services": "services",
  "/tech": "tech-stack",
};

const navLinks = document.querySelectorAll(".nav__menu a, .nav__logo");
const initialLandingPath = window.location.pathname.replace(/\/$/, "") || "/";
let isSmoothScrolling = initialLandingPath !== "/" && !initialLandingPath.startsWith("/admin");
let scrollTimeout = null;

const updateActiveNavLink = (activePath) => {
  navLinks.forEach((link) => {
    const linkPath = link.getAttribute("data-path") || link.getAttribute("href");
    if (linkPath === activePath) {
      link.classList.add("active-link");
      link.setAttribute("aria-pressed", "true");
    } else {
      link.classList.remove("active-link");
      link.setAttribute("aria-pressed", "false");
    }
  });
};

navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    const href = link.getAttribute("href");
    if (href === "/3d" || (href && href.startsWith("/3d")) || link.target === "_blank") {
      return; // allow default browser navigation to /3d
    }
    const dataPath = link.getAttribute("data-path");
    const targetPath = dataPath || href;

    let targetId = null;
    const directMatch = SECTION_PATH_MAP.find((m) => m.path === targetPath);
    if (directMatch) {
      targetId = directMatch.id;
    } else if (ROUTE_ALIASES[targetPath]) {
      targetId = ROUTE_ALIASES[targetPath];
    } else if (href && href.startsWith("#")) {
      targetId = href.replace("#", "");
    }

    if (targetId) {
      e.preventDefault();
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        isSmoothScrolling = true;
        const targetTop = targetId === "home" ? 0 : targetSection.offsetTop - 70;
        window.scrollTo({
          top: targetTop,
          behavior: "smooth",
        });

        const canonicalPath = targetPath.startsWith("/")
          ? targetPath
          : "/" + (targetId === "home" ? "" : targetId);

        if (window.location.pathname !== canonicalPath) {
          try {
            window.history.pushState(null, "", canonicalPath);
          } catch (err) {}
        }
        updateActiveNavLink(canonicalPath);

        if (window.PortfolioAnalytics) {
          const trackKey =
            targetId === "services" || targetId === "tech-stack"
              ? "skills"
              : targetId === "gallery"
              ? "showcase"
              : targetId === "work"
              ? "experience"
              : targetId;
          window.PortfolioAnalytics.trackSection(trackKey);
        }

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          isSmoothScrolling = false;
        }, 850);

        // Close mobile liquid glass dock on navigation
        const mobileNavMenu = document.getElementById("nav-menu");
        const mobileNavToggle = document.getElementById("nav-toggle");
        if (mobileNavMenu && mobileNavToggle) {
          mobileNavMenu.classList.remove("show-menu");
          mobileNavToggle.classList.remove("active");
        }
      }
    }
  });
});

/*=============== MOBILE 3-LINE TOGGLE & THREEUI LIQUID GLASS DOCK ===============*/
const navMenu = document.getElementById("nav-menu");
const navToggle = document.getElementById("nav-toggle");

if (navToggle && navMenu) {
  navToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const isShowing = navMenu.classList.toggle("show-menu");
    navToggle.classList.toggle("active", isShowing);
  });

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    if (navMenu.classList.contains("show-menu") && !navMenu.contains(e.target) && !navToggle.contains(e.target)) {
      navMenu.classList.remove("show-menu");
      navToggle.classList.remove("active");
    }
  });

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navMenu.classList.contains("show-menu")) {
      navMenu.classList.remove("show-menu");
      navToggle.classList.remove("active");
    }
  });

  // ThreeUI Glass Icons Tactile Touch Vibration & Haptics ("ওটার মধ্যে কাপবে")
  document.querySelectorAll(".atd-glass__item, .atd-glass__cta").forEach((item) => {
    item.addEventListener("touchstart", () => {
      item.classList.add("touch-vibrating");
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate(18);
        } catch (err) {}
      }
    }, { passive: true });

    item.addEventListener("touchend", () => {
      setTimeout(() => item.classList.remove("touch-vibrating"), 350);
    }, { passive: true });

    item.addEventListener("touchcancel", () => {
      item.classList.remove("touch-vibrating");
    }, { passive: true });
  });
}

const applyPathUpdate = (newPath, recordAnalytics = true) => {
  if (isSmoothScrolling || window.location.pathname.startsWith("/admin")) return;
  if (window.location.pathname !== newPath) {
    try {
      window.history.replaceState(null, "", newPath);
    } catch (e) {}
    updateActiveNavLink(newPath);
    if (recordAnalytics && window.PortfolioAnalytics) {
      const matched = SECTION_PATH_MAP.find((m) => m.path === newPath);
      if (matched) {
        const trackKey =
          matched.id === "services" || matched.id === "tech-stack"
            ? "skills"
            : matched.id === "gallery"
            ? "showcase"
            : matched.id === "work"
            ? "experience"
            : matched.id;
        window.PortfolioAnalytics.trackSection(trackKey);
      }
    }
  }
};

/* IntersectionObserver for performance and clean URL state updates */
if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      if (isSmoothScrolling || window.location.pathname.startsWith("/admin")) return;

      if (window.scrollY < 100) {
        applyPathUpdate("/");
        return;
      }

      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 60
      ) {
        applyPathUpdate("/contact");
        return;
      }

      const visible = entries.filter((e) => e.isIntersecting);
      if (visible.length > 0) {
        visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const topTarget = visible[0].target;
        const matched = SECTION_PATH_MAP.find((m) => m.id === topTarget.id);
        if (matched) {
          applyPathUpdate(matched.path);
        }
      }
    },
    {
      root: null,
      rootMargin: "-20% 0px -50% 0px",
      threshold: [0.1, 0.25, 0.5],
    }
  );

  SECTION_PATH_MAP.forEach((item) => {
    const el = document.getElementById(item.id);
    if (el) sectionObserver.observe(el);
  });
}

/* Throttled scroll boundary guards */
window.addEventListener(
  "scroll",
  () => {
    if (isSmoothScrolling || window.location.pathname.startsWith("/admin")) return;
    if (window.scrollY < 80) {
      applyPathUpdate("/");
    } else if (
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 50
    ) {
      applyPathUpdate("/contact");
    }
  },
  { passive: true }
);

const navigateToInitialRoute = () => {
  if (window.location.pathname.startsWith("/admin")) return;
  const currentPath = window.location.pathname.replace(/\/$/, "") || "/";
  let targetId = null;
  const matched = SECTION_PATH_MAP.find((m) => m.path === currentPath);
  if (matched) {
    targetId = matched.id;
  } else if (ROUTE_ALIASES[currentPath]) {
    targetId = ROUTE_ALIASES[currentPath];
  }

  if (targetId && targetId !== "home") {
    isSmoothScrolling = true;
    updateActiveNavLink(currentPath);

    let attempts = 0;
    const performScroll = () => {
      const target = document.getElementById(targetId);
      if (target) {
        const targetTop = target.offsetTop - 70;
        window.scrollTo({
          top: targetTop,
          behavior: "smooth",
        });
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          isSmoothScrolling = false;
        }, 1100);
      } else if (attempts < 10) {
        attempts++;
        setTimeout(performScroll, 60);
      } else {
        isSmoothScrolling = false;
      }
    };
    performScroll();
  } else {
    isSmoothScrolling = false;
    updateActiveNavLink("/");
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", navigateToInitialRoute);
} else {
  navigateToInitialRoute();
}

window.addEventListener("popstate", () => {
  if (window.location.pathname.startsWith("/admin")) return;
  const currentPath = window.location.pathname.replace(/\/$/, "") || "/";
  let targetId = null;
  const matched = SECTION_PATH_MAP.find((m) => m.path === currentPath);
  if (matched) {
    targetId = matched.id;
  } else if (ROUTE_ALIASES[currentPath]) {
    targetId = ROUTE_ALIASES[currentPath];
  }

  if (targetId) {
    const target = document.getElementById(targetId);
    if (target) {
      isSmoothScrolling = true;
      const targetTop = targetId === "home" ? 0 : target.offsetTop - 70;
      window.scrollTo({
        top: targetTop,
        behavior: "smooth",
      });
      updateActiveNavLink(currentPath);
      setTimeout(() => {
        isSmoothScrolling = false;
      }, 850);
    }
  }
});

/*=============== NATIVE SYSTEM CURSOR RESTORED ===============*/

/*=============== NORMAL UNIFIED SILICON CARD HOVER (NO 3D TILT) ===============*/
// Card hover is handled smoothly and normally via CSS silicon glass transitions

/*===================================================================
   FLIP FADE 3D TEXT ANIMATION ENGINE (Magic UI / 21st.dev Component)
===================================================================*/
class FlipFadeText {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    if (!this.container) return;

    this.words = options.words || [
      "AUTONOMOUS AI AGENTS",
      "PROMPT ENGINEERING",
      "REVERSE ENGINEERING",
      "ENTERPRISE AUTOMATION",
      "SYSTEMS ARCHITECTURE"
    ];
    this.interval = options.interval || 2800;
    this.letterDuration = options.letterDuration || 0.6;
    this.staggerDelay = options.staggerDelay || 0.05;
    this.exitStaggerDelay = options.exitStaggerDelay || 0.03;
    this.currentIndex = 0;
    this.isTransitioning = false;
    this.timer = null;

    this.init();
  }

  init() {
    this.renderWord(this.words[0], false);
    this.startLoop();
  }

  createWordElement(text) {
    const wordEl = document.createElement('div');
    wordEl.className = 'flip-fade-word';

    const words = text.split(' ');
    let globalIndex = 0;

    words.forEach((w, wIdx) => {
      const chunk = document.createElement('span');
      chunk.className = 'flip-fade-chunk';

      w.split('').forEach((char) => {
        const letterSpan = document.createElement('span');
        letterSpan.className = 'flip-fade-letter';
        letterSpan.style.setProperty('--enter-delay', `${globalIndex * this.staggerDelay}s`);
        letterSpan.style.setProperty('--exit-delay', `${globalIndex * this.exitStaggerDelay}s`);
        letterSpan.style.setProperty('--letter-duration', `${this.letterDuration}s`);
        letterSpan.textContent = char;
        chunk.appendChild(letterSpan);
        globalIndex++;
      });

      wordEl.appendChild(chunk);

      if (wIdx < words.length - 1) {
        const space = document.createElement('span');
        space.className = 'flip-fade-space';
        space.innerHTML = '&nbsp;';
        wordEl.appendChild(space);
      }
    });

    return wordEl;
  }

  renderWord(text, animateIn = true) {
    this.container.innerHTML = '';
    const wordEl = this.createWordElement(text);
    if (animateIn) {
      wordEl.classList.add('flip-fade-entering');
    } else {
      wordEl.classList.add('flip-fade-visible');
    }
    this.container.appendChild(wordEl);
    this.activeWordEl = wordEl;
  }

  async next() {
    if (this.isTransitioning || !this.activeWordEl) return;
    this.isTransitioning = true;

    this.activeWordEl.classList.remove('flip-fade-entering', 'flip-fade-visible');
    this.activeWordEl.classList.add('flip-fade-exiting');

    const exitDuration = (this.letterDuration * 0.67 + (this.words[this.currentIndex].length * this.exitStaggerDelay)) * 1000;
    await new Promise(r => setTimeout(r, exitDuration));

    this.currentIndex = (this.currentIndex + 1) % this.words.length;
    this.renderWord(this.words[this.currentIndex], true);

    const enterDuration = (this.letterDuration + (this.words[this.currentIndex].length * this.staggerDelay)) * 1000;
    await new Promise(r => setTimeout(r, enterDuration));

    this.isTransitioning = false;
  }

  startLoop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (document.hidden) return;
      this.next();
    }, this.interval);
  }
}

function initHeroFlipFade() {
  const flipContainer = document.getElementById('heroFlipFadeText');
  if (flipContainer && !flipContainer.dataset.initialized) {
    flipContainer.dataset.initialized = 'true';
    new FlipFadeText(flipContainer, {
      words: [
        "AUTONOMOUS AI AGENTS",
        "PROMPT ENGINEERING",
        "REVERSE ENGINEERING",
        "ENTERPRISE AUTOMATION",
        "SYSTEMS ARCHITECTURE"
      ],
      interval: 2800,
      letterDuration: 0.6,
      staggerDelay: 0.05,
      exitStaggerDelay: 0.03
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeroFlipFade);
} else {
  initHeroFlipFade();
}

/*=============== SCROLL REVEAL ANIMATION (COMPREHENSIVE FULL-PAGE CASCADE) ===============*/
if (typeof ScrollReveal !== "undefined") {
  const isMobileScreen = typeof window !== "undefined" && window.innerWidth < 1024;

  const sr = ScrollReveal({
    origin: "top",
    distance: "35px",
    duration: 800,
    delay: 100,
    easing: "cubic-bezier(0.16, 1, 0.3, 1)",
    reset: false,
  });

  // 1. All Section Headings & Subtitles
  sr.reveal(`.section__title`, { origin: "top", distance: "30px", duration: 750 });
  sr.reveal(`.section__subtitle`, { origin: "bottom", distance: "25px", delay: 120, duration: 750 });

  // 2. Hero Section
  sr.reveal(`.home__data`, { origin: "bottom", distance: "45px", delay: 100, duration: 800 });
  sr.reveal(`.home__portrait-stage`, { origin: "bottom", distance: "25px", delay: 150, duration: 850 });
  sr.reveal(`.home__info`, { origin: "bottom", distance: "45px", delay: 200, duration: 800 });
  sr.reveal(`.home__social-link`, { interval: 70, origin: "bottom", distance: "18px", delay: 220 });

  // 3. About Section
  sr.reveal(`.about__image`, { origin: isMobileScreen ? "bottom" : "left", distance: "45px", delay: 120, duration: 800 });
  sr.reveal(`.about__data`, { origin: isMobileScreen ? "bottom" : "right", distance: "45px", delay: 160, duration: 800 });
  sr.reveal(`#about-cta-btn`, { origin: "bottom", distance: "25px", delay: 240 });

  // 4. Projects Section & 3D Gateway Button
  sr.reveal(`.projects__3d-cta-container`, { origin: "bottom", distance: "30px", delay: 160, duration: 750 });
  sr.reveal(`.projects__container`, { origin: "bottom", distance: "40px", delay: 200, duration: 800 });

  // 5. Showcase / Gallery Section
  sr.reveal(`.gallery__card`, { interval: 90, origin: "bottom", distance: "30px", duration: 700 });

  // 6. Experience Timeline Section
  sr.reveal(`.work__card`, { interval: 110, origin: "bottom", distance: "35px", duration: 750 });

  // 7. Skills & Capabilities Section
  sr.reveal(`.services__card`, { interval: 110, origin: "bottom", distance: "30px", duration: 750 });

  // 8. Tech Stack Section
  sr.reveal(`.tech__container`, { origin: "bottom", distance: "35px", delay: 120, duration: 800 });

  // 9. Contact Section
  sr.reveal(`.contact__button`, { origin: "bottom", distance: "25px", delay: 100 });
  sr.reveal(`.contact__info`, { origin: isMobileScreen ? "bottom" : "left", distance: "35px", delay: 140 });
  sr.reveal(`.contact__social`, { origin: "bottom", distance: "35px", delay: 170 });
  sr.reveal(`.contact__write`, { origin: isMobileScreen ? "bottom" : "right", distance: "35px", delay: 200 });
  sr.reveal(`.contact__link`, { interval: 60, origin: "bottom", distance: "18px", delay: 220 });
}

/*=============== LIVE PORTFOLIO DYNAMIC HYDRATION (CMS SYNC) ===============*/
async function hydratePortfolioFromAPI() {
  try {
    const res = await fetch("/api/portfolio-data");
    if (!res.ok) return;
    const data = await res.json();

    // 1. Profile & Hero
    if (data.profile) {
      const p = data.profile;
      const homeGreeting = document.querySelector(".home__greeting");
      if (homeGreeting && p.greeting) homeGreeting.textContent = p.greeting;

      const homeName = document.querySelector(".home__name");
      if (homeName && p.name) {
        const parts = p.name.split(" ");
        if (parts.length > 2) {
          homeName.innerHTML = `${parts.slice(0, 2).join(" ")} <br /> ${parts.slice(2).join(" ")}`;
        } else {
          homeName.textContent = p.name;
        }
      }

      const homeSplit = document.querySelector(".home__split");
      if (homeSplit && p.title_split) homeSplit.textContent = p.title_split;

      const prof1 = document.querySelector(".home__profession-1");
      if (prof1 && p.title_line1) prof1.textContent = p.title_line1;

      const prof2 = document.querySelector(".home__profession-2");
      if (prof2 && p.title_line2) prof2.textContent = p.title_line2;

      const homeProfile = document.querySelector(".home__profile");
      if (homeProfile) {
        if (homeProfile.tagName && homeProfile.tagName.toLowerCase() === "img") {
          homeProfile.src = p.hero_cutout || "assets/img/hero-profile1.png?v=20261024_1650";
          if (p.name) homeProfile.alt = p.name;
        }
      }
      const aboutImg = document.getElementById("aboutStudioImg");
      if (aboutImg) {
        aboutImg.src = p.about_img || "assets/img/sahadat-about-new.jpg?v=20261024_1650";
        if (p.name) aboutImg.alt = p.name;
      }

      const homeCv = document.querySelectorAll(".home__cv");
      if (p.resume_url) {
        homeCv.forEach(btn => btn.setAttribute("href", p.resume_url));
      }

      const navLogo = document.querySelector(".nav__logo");
      if (navLogo && p.name) navLogo.textContent = p.name;
    }

    // 2. About Me
    if (data.about) {
      const a = data.about;
      const aboutTitle = document.querySelector(".about__data .section__title");
      if (aboutTitle && a.bio_heading) {
        if (a.bio_heading.includes("&")) {
          const [part1, part2] = a.bio_heading.split("&");
          aboutTitle.innerHTML = `<span>${part1.trim()} &amp;</span> <br /> ${part2.trim()}`;
        } else {
          const words = a.bio_heading.split(" ");
          if (words.length > 1) {
            aboutTitle.innerHTML = `<span>${words.slice(0, Math.ceil(words.length / 2)).join(" ")}</span> <br /> ${words.slice(Math.ceil(words.length / 2)).join(" ")}`;
          } else {
            aboutTitle.innerHTML = `<span>${a.bio_heading}</span>`;
          }
        }
      }

      const aboutDesc = document.querySelector(".about__description");
      if (aboutDesc && (a.bio_p1 || a.bio_p2)) {
        let p1Html = a.bio_p1 || "";
        if (p1Html && !p1Html.includes("<b>")) {
          p1Html = p1Html
            .replace("Autonomous AI Agent Architect & Prompt Engineer", "<b>Autonomous AI Agent Architect &amp; Prompt Engineer</b>")
            .replace("10x", "<b>10x</b>")
            .replace("60–70%", "<b>60–70%</b>");
        }

        let p2Html = a.bio_p2 || "";
        if (p2Html && !p2Html.includes("<b>")) {
          p2Html = p2Html
            .replace("Master's Degree", "<b>Master's Degree</b>")
            .replace("Core Targets & Impact:", "<b>Core Targets &amp; Impact:</b>")
            .replace("10x Execution Velocity:", "• <b>10x Execution Velocity:</b>")
            .replace("70% Cost Compression:", "• <b>70% Cost Compression:</b>")
            .replace("Zero-Hallucination Resilience:", "• <b>Zero-Hallucination Resilience:</b>")
            .replace(/\n\n/g, "<br /><br />")
            .replace(/\n/g, "<br />");
        }

        aboutDesc.innerHTML = `${p1Html ? `<span style="display: block; margin-bottom: 12px;">${p1Html}</span>` : ""}${p2Html ? `<span style="display: block; margin-bottom: 14px;">${p2Html}</span>` : ""}`;
      }

      const aboutCta = document.getElementById("about-cta-btn");
      if (aboutCta && a.cta_text) {
        const textSpan = aboutCta.querySelector(".gem-btn__text");
        if (textSpan) {
          textSpan.textContent = a.cta_text;
        } else {
          aboutCta.innerHTML = `${a.cta_text} <i class="ri-arrow-right-up-line"></i>`;
        }
        if (a.cta_url) aboutCta.href = a.cta_url;
      }
    }

    // 3. Contact & Social Channels
    if (data.contact) {
      const c = data.contact;
      if (c.linkedin) {
        document.querySelectorAll('a[title="LinkedIn"]').forEach(a => a.href = c.linkedin);
      }
      if (c.github) {
        document.querySelectorAll('a[title="GitHub"]').forEach(a => a.href = c.github);
      }
      if (c.whatsapp_url) {
        document.querySelectorAll('a[title="WhatsApp"]').forEach(a => a.href = c.whatsapp_url);
      }
      if (c.youtube) {
        document.querySelectorAll('a[title="YouTube"]').forEach(a => a.href = c.youtube);
      }
      if (c.email) {
        document.querySelectorAll('a[title="Email"]').forEach(a => a.href = `mailto:${c.email}`);
      }
    }

    // 4. Projects Synchronization (CMS Live Sync)
    if (Array.isArray(data.projects) && data.projects.length > 0) {
      const projectCards = document.querySelectorAll(".projects__card");
      data.projects.forEach((proj, idx) => {
        if (idx < projectCards.length) {
          const card = projectCards[idx];
          const numEl = card.querySelector(".projects__number h1");
          const tagEl = card.querySelector(".projects__number h3");
          const titleEl = card.querySelector(".projects__title");
          const descEl = card.querySelector(".projects__description");
          const btnEl = card.querySelector(".projects__button");
          const liveBtn = card.querySelector(".projects__button--live");
          const ghBtn = card.querySelector(".projects__button--github");
          const imgEl = card.querySelector(".projects__img");

          if (numEl && proj.number) numEl.textContent = proj.number;
          if (tagEl && proj.tag) tagEl.textContent = proj.tag;
          if (titleEl && proj.title) {
            const words = proj.title.split(" ");
            if (words.length > 2) {
              titleEl.innerHTML = `${words.slice(0, 2).join(" ")} <br /> ${words.slice(2).join(" ")}`;
            } else {
              titleEl.textContent = proj.title;
            }
          }
          if (descEl && proj.desc) descEl.textContent = proj.desc;
          if (liveBtn && proj.demo_url) liveBtn.href = proj.demo_url;
          if (ghBtn && proj.github_url) ghBtn.href = proj.github_url;
          if (!liveBtn && btnEl && proj.demo_url) btnEl.href = proj.demo_url;
          if (imgEl && proj.img) {
            imgEl.src = proj.img;
            imgEl.alt = proj.title || "Project";
          }
        }
      });
    }

    // 4b. Gallery Showcase Synchronization (CMS Live Sync)
    if (Array.isArray(data.showcase) && data.showcase.length > 0) {
      const galCards = document.querySelectorAll(".gallery__card");
      data.showcase.forEach((item, idx) => {
        if (idx < galCards.length) {
          const card = galCards[idx];
          const badgeEl = card.querySelector(".gallery__badge");
          const titleEl = card.querySelector(".gallery__title");
          const descEl = card.querySelector(".gallery__description");
          const imgEl = card.querySelector(".gallery__img");
          const liveLink = card.querySelector(".gallery__btn--live");
          const ghLink = card.querySelector(".gallery__btn--github");

          if (badgeEl && item.tag) badgeEl.textContent = item.tag;
          if (titleEl && item.title) titleEl.textContent = item.title;
          if (descEl && item.desc) descEl.textContent = item.desc;
          if (imgEl && item.img) {
            imgEl.src = item.img;
            imgEl.alt = item.title || "Showcase";
          }
          if (item.demo_url) {
            card.dataset.liveUrl = item.demo_url;
            if (liveLink) liveLink.href = item.demo_url;
          }
          if (item.github_url) {
            card.dataset.githubUrl = item.github_url;
            if (ghLink) ghLink.href = item.github_url;
          }
        }
      });
    }

    // 5. Experience & Education Synchronization (CMS Live Sync)
    if (Array.isArray(data.experience) && data.experience.length > 0) {
      const expCards = document.querySelectorAll("#experience .work__card");
      data.experience.forEach((exp, idx) => {
        if (idx < expCards.length) {
          const card = expCards[idx];
          const titleEl = card.querySelector(".work__title");
          const subtitleEl = card.querySelector(".work__subtitle");
          const yearEl = card.querySelector(".work__year");
          const descEl = card.querySelector(".work__description");

          if (titleEl && exp.role) titleEl.textContent = exp.role;
          if (subtitleEl && exp.company) subtitleEl.textContent = exp.company;
          if (yearEl && exp.years) yearEl.textContent = exp.years;
          if (descEl && exp.desc) descEl.textContent = exp.desc;
        }
      });
    }

    if (Array.isArray(data.education) && data.education.length > 0) {
      const eduCards = document.querySelectorAll("#education .work__card");
      data.education.forEach((edu, idx) => {
        if (idx < eduCards.length) {
          const card = eduCards[idx];
          const titleEl = card.querySelector(".work__title");
          const subtitleEl = card.querySelector(".work__subtitle");
          const yearEl = card.querySelector(".work__year");
          const descEl = card.querySelector(".work__description");

          if (titleEl && edu.degree) titleEl.textContent = edu.degree;
          if (subtitleEl && edu.institution) subtitleEl.textContent = edu.institution;
          if (yearEl && edu.years) yearEl.textContent = edu.years;
          if (descEl && edu.desc) descEl.textContent = edu.desc;
        }
      });
    }
  } catch (err) {
    console.warn("Portfolio hydration bypassed (server static mode):", err);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", hydratePortfolioFromAPI);
} else {
  hydratePortfolioFromAPI();
}


/*=============== STATIC CLEAN PORTRAITS (ZERO ANIMATION) ===============*/
/* As requested, portraits remain 100% natural and static with zero scroll distortion or animation */
function initStaticPortraits() {
  const morphWrapper = document.getElementById("morphingPortrait");
  const aboutImg = document.getElementById("aboutStudioImg");
  if (morphWrapper) {
    morphWrapper.style.transform = "";
    morphWrapper.style.opacity = "1";
  }
  if (aboutImg) {
    aboutImg.style.opacity = "1";
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initStaticPortraits);
} else {
  initStaticPortraits();
}
