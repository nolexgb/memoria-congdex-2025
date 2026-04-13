(() => {
  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  document.documentElement.classList.add("js");

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

      if (nav && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
      }
    });
  });

  /* =========================
     REVEAL SAFE
     ========================= */
  qsa(".reveal").forEach((el) => el.classList.add("visible"));

  /* =========================
     PROGRESS + BACKTOP
     ========================= */
  const bar = qs("#progressBar");
  const back = qs("#backTop");
  let ticking = false;

  const updateScroll = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const p = max > 0 ? h.scrollTop / max : 0;

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
  qsa("[data-count]").forEach((el) => {
    const target = Number(el.dataset.count || 0);
    if (!Number.isFinite(target)) return;
    el.textContent = String(target);
  });

  /* =========================
     HERO PARALLAX
     ========================= */
  const heroZoom = qs("[data-zoom]");
  const heroImg = qs(".memoriaHeader__image");

  if (heroZoom && heroImg && !prefersReduced) {
    window.addEventListener("scroll", () => {
      const rect = heroZoom.getBoundingClientRect();
      const p = clamp(1 - rect.top / window.innerHeight, 0, 1);
      heroImg.style.transform = `scale(${1.02 + p * 0.08})`;
    });
  }

  /* =========================
     KPI STORY
     ========================= */
  const steps = qsa(".stepCard");
  const kpiValue = qs("#kpiValue");
  const kpiLabel = qs("#kpiLabel");
  const kpiSub = qs("#kpiSub");
  const kpiBar = qs("#kpiBar");
  const kpiMetaR = qs("#kpiMetaR");
  const kpiChip = qs("#kpiChip");

  const kpiData = {
    circulares: {
      value: "38",
      label: "Circulares internas",
      sub: "Alcance interno consolidado",
      progress: 14,
      meta: "01/07",
      chip: "Comunicación"
    },
    aperturas: {
      value: "8.439",
      label: "Aperturas registradas",
      sub: "Seguimiento del rendimiento de envíos",
      progress: 28,
      meta: "02/07",
      chip: "Comunicación"
    },
    promedio: {
      value: "60,19%",
      label: "Promedio aperturas",
      sub: "Tasa media de apertura de circulares",
      progress: 42,
      meta: "03/07",
      chip: "Comunicación"
    },
    publicaciones: {
      value: "41",
      label: "Publicaciones web",
      sub: "Contenidos publicados durante el año",
      progress: 57,
      meta: "04/07",
      chip: "Web"
    },
    eventos: {
      value: "26",
      label: "Eventos web",
      sub: "Actividad difundida en la web",
      progress: 71,
      meta: "05/07",
      chip: "Web"
    },
    empleo: {
      value: "12",
      label: "Ofertas de empleo",
      sub: "Difusión de oportunidades y convocatorias",
      progress: 85,
      meta: "06/07",
      chip: "Web"
    },
    visitas: {
      value: "12.670",
      label: "Visitas web",
      sub: "Tráfico total registrado en la web",
      progress: 100,
      meta: "07/07",
      chip: "Impacto digital"
    }
  };

  function setKpi(key) {
    const item = kpiData[key];
    if (!item) return;

    if (kpiValue) kpiValue.textContent = item.value;
    if (kpiLabel) kpiLabel.textContent = item.label;
    if (kpiSub) kpiSub.textContent = item.sub;
    if (kpiBar) kpiBar.style.width = `${item.progress}%`;
    if (kpiMetaR) kpiMetaR.textContent = item.meta;
    if (kpiChip) kpiChip.textContent = item.chip;
  }

  steps.forEach((step) => {
    step.addEventListener("click", () => {
      steps.forEach((el) => el.classList.remove("is-active"));
      step.classList.add("is-active");
      setKpi(step.dataset.key);
    });
  });

  const activeStep = qs(".stepCard.is-active");
  if (activeStep?.dataset.key) setKpi(activeStep.dataset.key);

  /* =========================
     MAPA
     ========================= */
  const mapWrap = qs(".mapFrameWrap");
  if (mapWrap) mapWrap.classList.add("is-visible");

  /* =========================
     LOAD
     ========================= */
  window.addEventListener("load", () => {
    document.body.classList.add("is-loaded");
    qsa(".reveal").forEach((el) => el.classList.add("visible"));
    updateScroll();
  });
})();
