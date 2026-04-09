(() => {
  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  /* =========================
     MENU
     ========================= */
  const menuToggle = qs("#menuToggle");
  const nav = qs(".memoriaHeader__nav");

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", open);
    });
  }

  /* =========================
     SMOOTH NAV
     ========================= */
  qsa('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const target = qs(link.getAttribute("href"));
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* =========================
     REVEAL
     ========================= */
  qsa(".reveal").forEach((el) => {
    new IntersectionObserver(
      ([e]) => e.isIntersecting && el.classList.add("visible"),
      { threshold: 0.2 }
    ).observe(el);
  });

  /* =========================
     PROGRESS + BACKTOP
     ========================= */
  const bar = qs("#progressBar");
  const back = qs("#backTop");

  let ticking = false;

  const updateScroll = () => {
    const h = document.documentElement;
    const p = h.scrollTop / (h.scrollHeight - h.clientHeight);

    if (bar) bar.style.width = `${p * 100}%`;
    if (back) back.style.display = window.scrollY > 500 ? "block" : "none";

    ticking = false;
  };

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(updateScroll);
      ticking = true;
    }
  });

  if (back) {
    back.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "smooth" })
    );
  }

  /* =========================
     COUNTERS
     ========================= */
  qsa("[data-count]").forEach((el) => {
    new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;

        let i = 0;
        const target = +el.dataset.count;

        const step = () => {
          i += target / 30;
          if (i >= target) i = target;
          el.textContent = Math.floor(i);
          if (i < target) requestAnimationFrame(step);
        };

        step();
      },
      { threshold: 0.4 }
    ).observe(el);
  });

  /* =========================
     HERO PARALLAX
     ========================= */
  const hero = qs("[data-zoom]");

  if (hero) {
    window.addEventListener("scroll", () => {
      const rect = hero.getBoundingClientRect();
      const img = qs(".memoriaHeader__image");

      if (!img) return;

      const p = clamp(1 - rect.top / window.innerHeight, 0, 1);
      img.style.transform = `scale(${1.05 + p * 0.1})`;
    });
  }

  /* =========================
     KPI STORY
     ========================= */
  const steps = qsa(".stepCard");
  const value = qs("#kpiValue");

  const data = {
    circulares: 38,
    aperturas: 8439,
    promedio: "60,19%",
    publicaciones: 41,
    eventos: 26,
    empleo: 12,
    visitas: 12670
  };

  steps.forEach((s) => {
    s.addEventListener("click", () => {
      steps.forEach((el) => el.classList.remove("is-active"));
      s.classList.add("is-active");

      const key = s.dataset.key;
      if (value) value.textContent = data[key];
    });
  });

  /* =========================
     LOAD ANIMATION
     ========================= */
  window.addEventListener("load", () => {
    document.body.classList.add("is-loaded");
  });
})();
