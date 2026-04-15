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

      if (nav?.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        menuToggle?.setAttribute("aria-expanded", "false");
      }
    });
  });

  /* =========================
     REVEAL
     ========================= */
  const reveals = qsa(".reveal");

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12 }
    );

    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("visible"));
  }

  /* =========================
     PROGRESS + BACKTOP
     ========================= */
  const progressBar = qs("#progressBar");
  const backTop = qs("#backTop");
  let ticking = false;

  const updateScrollUi = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const p = max > 0 ? doc.scrollTop / max : 0;

    if (progressBar) progressBar.style.width = `${p * 100}%`;
    if (backTop) backTop.style.display = window.scrollY > 500 ? "block" : "none";

    ticking = false;
  };

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(updateScrollUi);
      ticking = true;
    }
  });

  updateScrollUi();

  if (backTop) {
    backTop.addEventListener("click", () => {
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

    const animate = () => {
      if (prefersReduced) {
        el.textContent = target;
        return;
      }

      const start = performance.now();
      const duration = 1100;

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        el.textContent = Math.floor(target * progress);

        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          el.textContent = target;
        }
      };

      requestAnimationFrame(tick);
    };

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            animate();
            observer.unobserve(el);
          });
        },
        { threshold: 0.35 }
      );

      io.observe(el);
    } else {
      animate();
    }
  });

  /* =========================
     HERO PARALLAX
     ========================= */
  const hero = qs("[data-zoom]");
  const heroImg = qs(".memoriaHeader__image");

  if (hero && heroImg && !prefersReduced) {
    let heroTick = false;

    const updateHero = () => {
      const rect = hero.getBoundingClientRect();
      const p = clamp(1 - rect.top / window.innerHeight, 0, 1);
      heroImg.style.transform = `scale(${1.04 + p * 0.08})`;
      heroTick = false;
    };

    window.addEventListener("scroll", () => {
      if (!heroTick) {
        requestAnimationFrame(updateHero);
        heroTick = true;
      }
    });

    updateHero();
  }

  /* =========================
     KPI STORY
     ========================= */
  const stepCards = qsa(".stepCard");
  const kpiValue = qs("#kpiValue");
  const kpiLabel = qs("#kpiLabel");
  const kpiSub = qs("#kpiSub");
  const kpiBar = qs("#kpiBar");
  const kpiMetaR = qs("#kpiMetaR");
  const kpiChip = qs("#kpiChip");

  const kpis = {
    circulares: ["38", "Circulares internas", "Comunicación interna", 14, "01/07", "Comunicación"],
    aperturas: ["8.439", "Aperturas registradas", "Seguimiento campañas", 28, "02/07", "Comunicación"],
    promedio: ["60,19%", "Promedio aperturas", "Rendimiento medio", 42, "03/07", "Comunicación"],
    publicaciones: ["41", "Publicaciones web", "Contenido web anual", 57, "04/07", "Web"],
    eventos: ["26", "Eventos web", "Agenda publicada", 71, "05/07", "Web"],
    empleo: ["12", "Ofertas empleo", "Difusión oportunidades", 85, "06/07", "Web"],
    visitas: ["12.670", "Visitas web", "Impacto digital total", 100, "07/07", "Impacto"]
  };

  const setKpi = (key) => {
    const d = kpis[key];
    if (!d) return;

    if (kpiValue) kpiValue.textContent = d[0];
    if (kpiLabel) kpiLabel.textContent = d[1];
    if (kpiSub) kpiSub.textContent = d[2];
    if (kpiBar) kpiBar.style.width = `${d[3]}%`;
    if (kpiMetaR) kpiMetaR.textContent = d[4];
    if (kpiChip) kpiChip.textContent = d[5];
  };

  stepCards.forEach((card) => {
    card.addEventListener("click", () => {
      stepCards.forEach((x) => x.classList.remove("is-active"));
      card.classList.add("is-active");
      setKpi(card.dataset.key);
    });
  });

  const active = qs(".stepCard.is-active");
  if (active) setKpi(active.dataset.key);

  /* =========================
     CHARTS
     ========================= */
  const hasChart = typeof Chart !== "undefined";
  const charts = {};

  const makeChart = (id, config) => {
    if (!hasChart) return;

    const canvas = qs(`#${id}`);
    if (!canvas) return;

    if (charts[id]) charts[id].destroy();

    charts[id] = new Chart(canvas.getContext("2d"), config);
  };

  if (hasChart) {
    Chart.defaults.color = "#163126";
    Chart.defaults.font.family = "Inter, sans-serif";
    Chart.defaults.borderColor = "rgba(17,70,50,.08)";
  }

  const baseOpts = {
    responsive: true,
    maintainAspectRatio: false,
    animation: prefersReduced ? false : { duration: 900 }
  };

  makeChart("chartReuniones", {
    type: "bar",
    data: {
      labels: ["Junta", "Consejo", "Educación", "Incidencia", "Voluntariado"],
      datasets: [{
        data: [11, 6, 11, 5, 3],
        backgroundColor: ["#114632","#239f71","#79cfaf","#2d7f60","#bfeedd"],
        borderRadius: 10
      }]
    },
    options: baseOpts
  });

  makeChart("chartGenero", {
    type: "bar",
    data: {
      labels: ["Mujeres","Hombres","No consta"],
      datasets: [{
        data: [68,29,3],
        backgroundColor: ["#239f71","#114632","#79cfaf"],
        borderRadius: 10
      }]
    },
    options: baseOpts
  });

  makeChart("chartConsultasTemas", {
    type: "doughnut",
    data: {
      labels: ["Subvenciones","Justificación","Comunicación","Incidencia","Voluntariado"],
      datasets: [{
        data: [12,9,6,4,3],
        backgroundColor: ["#114632","#239f71","#79cfaf","#bfecdd","#2d7f60"],
        borderWidth: 0
      }]
    },
    options: baseOpts
  });

  makeChart("chartConsultasGenero", {
    type: "bar",
    data: {
      labels: ["Subv.","Just.","Com.","Inc.","Vol."],
      datasets: [
        {
          label: "Mujeres",
          data: [8,6,4,3,2],
          backgroundColor: "#239f71",
          borderRadius: 8
        },
        {
          label: "Hombres",
          data: [4,3,2,1,1],
          backgroundColor: "#114632",
          borderRadius: 8
        }
      ]
    },
    options: baseOpts
  });

  /* =========================
     TIMELINE NUEVO DEFINITIVO
     ========================= */
  const tlTrack = qs("#tlTrack");
  const tlWrap = qs("#tlTrackWrap");

  const tlYear = qs("#tlYear");
  const tlTitle = qs("#tlTitle");
  const tlDesc = qs("#tlDesc");
  const tlTag = qs("#tlTag");
  const tlBar = qs("#tlBar");
  const tlMeta = qs("#tlMetaR");

  const prev = qs("#tlPrevBtn");
  const next = qs("#tlNextBtn");

  const data = [
    [1995,"Constitución CONGDEX","Nace la Coordinadora Extremeña de ONGD.","Resumen"],
    [1998,"Primeros marcos","Se fortalece la interlocución institucional.","Institucional"],
    [2005,"Consolidación de red","Aumenta la capacidad de coordinación.","Red"],
    [2010,"Ciudadanía global","Impulso a educación transformadora.","Ciudadanía"],
    [2015,"Nuevas agendas","ODS, sostenibilidad y justicia global.","Agenda"],
    [2020,"Transformación digital","Trabajo híbrido y comunicación online.","Digital"],
    [2025,"30 aniversario","Tres décadas de cooperación extremeña.","Aniversario"]
  ];

  if (tlTrack && tlWrap) {
    tlTrack.innerHTML = '<div class="tl-line"></div>';

    let current = 0;

    const draw = () => {
      data.forEach((item, i) => {
        const node = document.createElement("div");
        node.className = "tl-node";
        if (i === current) node.classList.add("is-active");

        const left = (i / (data.length - 1)) * 100;
        node.style.left = `${left}%`;

        node.innerHTML = `
          <div class="tl-tooltip">
            <div class="tl-tYear">${item[0]}</div>
            <div class="tl-tTitle">${item[1]}</div>
            <div class="tl-tDesc">${item[2]}</div>
          </div>
          <div class="tl-pin"></div>
          <button class="tl-pill" type="button">${item[0]}</button>
        `;

        node.addEventListener("click", () => set(i));
        tlTrack.appendChild(node);
      });
    };

    const set = (i) => {
      current = clamp(i, 0, data.length - 1);

      qsa(".tl-node", tlTrack).forEach((n, idx) => {
        n.classList.toggle("is-active", idx === current);
      });

      const item = data[current];

      if (tlYear) tlYear.textContent = item[0];
      if (tlTitle) tlTitle.textContent = item[1];
      if (tlDesc) tlDesc.textContent = item[2];
      if (tlTag) tlTag.textContent = item[3];
      if (tlMeta) tlMeta.textContent =
        `${String(current + 1).padStart(2,"0")}/${String(data.length).padStart(2,"0")}`;

      if (tlBar) tlBar.style.width = `${((current + 1) / data.length) * 100}%`;

      const active = qsa(".tl-node", tlTrack)[current];

      if (active) {
        const wrapRect = tlWrap.getBoundingClientRect();
        const nodeRect = active.getBoundingClientRect();

        const delta =
          nodeRect.left -
          wrapRect.left -
          wrapRect.width / 2 +
          nodeRect.width / 2;

        tlWrap.scrollTo({
          left: tlWrap.scrollLeft + delta,
          behavior: prefersReduced ? "auto" : "smooth"
        });
      }
    };

    draw();
    set(0);

    prev?.addEventListener("click", () => set(current - 1));
    next?.addEventListener("click", () => set(current + 1));
  }

  /* =========================
     LOAD
     ========================= */
  window.addEventListener("load", () => {
    document.body.classList.add("is-loaded");
    reveals.forEach((el) => el.classList.add("visible"));
  });
})();
