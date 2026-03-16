const navToggle = document.getElementById("navToggle");
const siteNav = document.getElementById("siteNav");
const revealItems = document.querySelectorAll(".reveal");
const carouselTrack = document.getElementById("carouselTrack");
const carouselShell = document.querySelector(".carousel-shell");
const projectCards = document.querySelectorAll(".project-card");
const lightbox = document.getElementById("projectLightbox");
const lightboxBackdrop = document.getElementById("lightboxBackdrop");
const lightboxClose = document.getElementById("lightboxClose");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxTitle = document.getElementById("lightboxTitle");
const lightboxDescription = document.getElementById("lightboxDescription");
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
const backToTop = document.getElementById("backToTop");
const brandLink = document.querySelector(".brand");

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

if (revealItems.length) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

function openLightbox(card) {
  const title = card.dataset.title || "Project";
  const image = card.dataset.image || "";
  const description = card.dataset.description || "";

  lightboxTitle.textContent = title;
  lightboxImage.src = image;
  lightboxImage.alt = title;
  lightboxDescription.textContent = description;

  lightbox.classList.add("active");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  lightbox.classList.remove("active");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImage.src = "";
  document.body.style.overflow = "";
}

if (lightboxClose) {
  lightboxClose.addEventListener("click", closeLightbox);
}

if (lightboxBackdrop) {
  lightboxBackdrop.addEventListener("click", closeLightbox);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && lightbox.classList.contains("active")) {
    closeLightbox();
  }
});

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const service = document.getElementById("service").value;

    formStatus.textContent = `Thanks ${name || "there"} — your ${service || "service"} request is ready. This demo form still needs to be connected to email or a backend.`;
    contactForm.reset();
  });
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

if (brandLink) {
  brandLink.addEventListener("click", (event) => {
    event.preventDefault();
    scrollToTop();
  });
}

if (backToTop) {
  backToTop.addEventListener("click", scrollToTop);

  window.addEventListener("scroll", () => {
    if (window.scrollY > 500) {
      backToTop.classList.add("visible");
    } else {
      backToTop.classList.remove("visible");
    }
  });
}

/* Endless draggable looping carousel with snap */
if (carouselTrack && carouselShell) {
  const cards = Array.from(carouselTrack.querySelectorAll(".project-card"));
  const uniqueCardCount = cards.length / 2;

  let isHovering = false;
  let isDragging = false;
  let isSnapping = false;
  let didDrag = false;

  let autoScrollSpeed = 0.35;
  let currentX = 0;
  let startX = 0;
  let dragStartX = 0;

  let cardStep = 0;
  let loopWidth = 0;
  let animationFrameId = null;
  let lastTimestamp = 0;

  function measureCarousel() {
    const firstCard = cards[0];
    if (!firstCard) return;

    const cardStyles = window.getComputedStyle(firstCard);
    const trackStyles = window.getComputedStyle(carouselTrack);

    const cardWidth = firstCard.getBoundingClientRect().width;
    const gap =
      parseFloat(trackStyles.columnGap || trackStyles.gap || "0") || 0;

    cardStep = cardWidth + gap;
    loopWidth = cardStep * uniqueCardCount;

    if (loopWidth > 0) {
      currentX = normalizeX(currentX);
      applyTranslate();
    }
  }

  function normalizeX(value) {
    if (loopWidth <= 0) return value;

    while (value <= -loopWidth) {
      value += loopWidth;
    }

    while (value > 0) {
      value -= loopWidth;
    }

    return value;
  }

  function applyTranslate() {
    carouselTrack.style.transform = `translate3d(${currentX}px, 0, 0)`;
  }

  function tick(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const delta = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    if (!isHovering && !isDragging && !isSnapping) {
      currentX -= autoScrollSpeed * (delta / 16.6667);
      currentX = normalizeX(currentX);
      applyTranslate();
    }

    animationFrameId = window.requestAnimationFrame(tick);
  }

  function stopSnap() {
    isSnapping = false;
  }

  function snapToNearestCard() {
    if (!cardStep || !loopWidth) return;

    isSnapping = true;

    const currentIndex = Math.round(Math.abs(currentX) / cardStep);
    const targetX = normalizeX(-(currentIndex * cardStep));

    const start = currentX;
    const distance = targetX - start;
    const duration = 320;
    const startTime = performance.now();

    function animateSnap(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      currentX = start + distance * eased;
      currentX = normalizeX(currentX);
      applyTranslate();

      if (progress < 1) {
        window.requestAnimationFrame(animateSnap);
      } else {
        currentX = targetX;
        currentX = normalizeX(currentX);
        applyTranslate();
        stopSnap();
      }
    }

    window.requestAnimationFrame(animateSnap);
  }

  function startDrag(clientX) {
    if (isSnapping) {
      stopSnap();
    }

    isDragging = true;
    didDrag = false;
    startX = clientX;
    dragStartX = currentX;
    carouselShell.classList.add("dragging");
  }

  function moveDrag(clientX) {
    if (!isDragging) return;

    const delta = clientX - startX;

    if (Math.abs(delta) > 6) {
      didDrag = true;
    }

    currentX = normalizeX(dragStartX + delta);
    applyTranslate();
  }

  function endDrag() {
    if (!isDragging) return;

    isDragging = false;
    carouselShell.classList.remove("dragging");
    snapToNearestCard();

    window.setTimeout(() => {
      didDrag = false;
    }, 50);
  }

  carouselShell.addEventListener("mouseenter", () => {
    isHovering = true;
  });

  carouselShell.addEventListener("mouseleave", () => {
    isHovering = false;

    if (isDragging) {
      endDrag();
    }
  });

  carouselShell.addEventListener("mousedown", (event) => {
    if (event.button !== 0) return;
    startDrag(event.clientX);
  });

  window.addEventListener("mousemove", (event) => {
    moveDrag(event.clientX);
  });

  window.addEventListener("mouseup", () => {
    endDrag();
  });

  carouselShell.addEventListener(
    "touchstart",
    (event) => {
      if (event.touches.length !== 1) return;
      startDrag(event.touches[0].clientX);
    },
    { passive: true }
  );

  carouselShell.addEventListener(
    "touchmove",
    (event) => {
      if (event.touches.length !== 1) return;
      moveDrag(event.touches[0].clientX);
    },
    { passive: true }
  );

  carouselShell.addEventListener("touchend", () => {
    endDrag();
  });

  carouselShell.addEventListener("touchcancel", () => {
    endDrag();
  });

  projectCards.forEach((card) => {
    card.addEventListener("click", (event) => {
      if (didDrag) {
        event.preventDefault();
        return;
      }

      openLightbox(card);
    });

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox(card);
      }
    });
  });

  window.addEventListener("resize", measureCarousel);

  measureCarousel();
  applyTranslate();
  animationFrameId = window.requestAnimationFrame(tick);
}