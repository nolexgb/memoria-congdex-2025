(() => {
  document.documentElement.classList.add("js");

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
      menuToggle.setAttribute("aria-expanded", String(open));
    });

    qsa('a[href^="#"]', nav).forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* =========================
     SMOOTH NAV
     ========================= */
  qsa('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;

      const target = qs(href);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({
        behavior: prefersReduced ? "auto" : "smooth",
        block: "start"
      });
    });
  });

  /* =========================
     REVEAL
     ========================= */
  const revealEls = qsa(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.18 }
    );

    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("visible"));
  }

  /* =========================
     PROGRESS + BACKTOP
     ========================= */
  const bar = qs("#progressBar");
  const back = qs("#backTop");

  let ticking = false;

  const updateScroll = () => {
    const h = document.documentElement;
    const maxScroll = h.scrollHeight - h.clientHeight;
    const p = maxScroll > 0 ? h.scrollTop / maxScroll : 0;

    if (bar) {
      bar.style.width = `${p * 100}%`;
    }

    if (back) {
      back.style.display = window.scrollY > 500 ? "block" : "none";
    }

    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(updateScroll);
        ticking = true;
      }
    },
    { passive: true }
  );

  updateScroll();

  if (back) {
    back.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReduced ? "auto" : "smooth"
      });
    });
  }

  /* =========================
     COUNTERS
     ========================= */
  const counterEls = qsa("[data-count]");

  const animateCounter = (el) => {
    const target = Number(el.dataset.count || 0);
    if (!Number.isFinite(target)) return;

    const duration = prefersReduced ? 0 : 1000;
    const start = performance.now();

    const step = (now) => {
      if (duration === 0) {
        el.textContent = String(target);
        return;
      }

      const progress = Math.min((now - start) / duration, 1);
      const value = Math.floor(progress * target);
      el.textContent = String(value);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = String(target);
      }
    };

    requestAnimationFrame(step);
  };

  if ("IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );

    counterEls.forEach((el) => counterObserver.observe(el));
  } else {
    counterEls.forEach((el) => animateCounter(el));
  }

  /* =========================
     HERO PARALLAX
     ========================= */
  const heroZoom = qs("[data-zoom]");
  const heroImage = qs(".memoriaHeader__image");

  if (heroZoom && heroImage && !prefersReduced) {
    const updateHeroParallax = () => {
      const rect = heroZoom.getBoundingClientRect();
      const p = clamp(1 - rect.top / window.innerHeight, 0, 1);
      heroImage.style.transform = `scale(${1.02 + p * 0.08})`;
    };

    window.addEventListener(
      "scroll",
      () => requestAnimationFrame(updateHeroParallax),
      { passive: true }
    );

    updateHeroParallax();
  }

  /* =========================
     KPI STORY
     ========================= */
  const steps = qsa(".stepCard");
  const kpiValue = qs("#kpiValue");
  const kpiLabel = qs("#kpiLabel");
  const kpiSub = qs("#kpiSub");
  const kpiChip = qs("#kpiChip");
  const kpiBar = qs("#kpiBar");
  const kpiMetaR = qs("#kpiMetaR");

  const kpiData = [
    {
      key: "circulares",
      label: "Circulares internas",
      value: "38",
      sub: "Alcance interno consolidado",
      chip: "Comunicación",
      progress: 14,
      meta: "01/07"
    },
    {
      key: "aperturas",
      label: "Aperturas registradas",
      value: "8439",
      sub: "Impacto acumulado en envíos internos",
      chip: "Comunicación",
      progress: 28,
      meta: "02/07"
    },
    {
      key: "promedio",
      label: "Promedio de aperturas",
      value: "60,19%",
      sub: "Promedio de apertura sobre el total de circulares",
      chip: "Comunicación",
      progress: 42,
      meta: "03/07"
    },
    {
      key: "publicaciones",
      label: "Publicaciones web",
      value: "41",
      sub: "Contenidos publicados durante el año",
      chip: "Web",
      progress: 57,
      meta: "04/07"
    },
    {
      key: "eventos",
      label: "Eventos web",
      value: "26",
      sub: "Eventos difundidos desde la web",
      chip: "Web",
      progress: 71,
      meta: "05/07"
    },
    {
      key: "empleo",
      label: "Ofertas de empleo",
      value: "12",
      sub: "Recursos informativos para la red y el sector",
      chip: "Web",
      progress: 85,
      meta: "06/07"
    },
    {
      key: "visitas",
      label: "Visitas web",
      value: "12670",
      sub: "Tráfico anual registrado en la página web",
      chip: "Analítica",
      progress: 100,
      meta: "07/07"
    }
  ];

  const updateKpi = (key) => {
    const item = kpiData.find((d) => d.key === key);
    if (!item) return;

    if (kpiValue) {
      kpiValue.classList.add("switching");
      kpiValue.textContent = item.value;
      window.setTimeout(() => kpiValue.classList.remove("switching"), 180);
    }

    if (kpiLabel) kpiLabel.textContent = item.label;
    if (kpiSub) kpiSub.textContent = item.sub;
    if (kpiChip) kpiChip.textContent = item.chip;
    if (kpiBar) kpiBar.style.width = `${item.progress}%`;
    if (kpiMetaR) kpiMetaR.textContent = item.meta;
  };

  if (steps.length) {
    steps.forEach((step) => {
      step.addEventListener("click", () => {
        steps.forEach((el) => el.classList.remove("is-active"));
        step.classList.add("is-active");
        updateKpi(step.dataset.key);
      });
    });

    const active = qs(".stepCard.is-active") || steps[0];
    if (active) updateKpi(active.dataset.key);
  }

  /* =========================
     MAP FRAME REVEAL
     ========================= */
  const mapWrap = qs(".mapFrameWrap");

  if (mapWrap) {
    if ("IntersectionObserver" in window) {
      const mapObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            mapWrap.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.2 }
      );

      mapObserver.observe(mapWrap);
    } else {
      mapWrap.classList.add("is-visible");
    }
  }

  /* =========================
     LOAD
     ========================= */
  window.addEventListener("load", () => {
    document.body.classList.add("is-loaded");
    revealEls.forEach((el) => el.classList.add("visible"));
    updateScroll();
  });
})();([entry]) => {
        if (!entry.isIntersecting) return;
        mapWrap.classList.add("is-visible");
        io.disconnect();
      },
      { threshold: 0.2 }
    );

    io.observe(mapWrap);
  }
})();
