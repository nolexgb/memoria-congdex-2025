(() => {
  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  document.documentElement.classList.add("js");

  /* =========================================
     MENU MOBILE
  ========================================= */
  const menuToggle = qs("#menuToggle");
  const nav = qs(".memoriaHeader__nav");

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(open));
    });
  }

  /* =========================================
     SMOOTH LINKS
  ========================================= */
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

  /* =========================================
     REVEAL ON SCROLL
  ========================================= */
  const revealItems = qsa(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.15 }
    );

    revealItems.forEach((el) => revealObserver.observe(el));
  } else {
    revealItems.forEach((el) => el.classList.add("visible"));
  }

  /* =========================================
     PROGRESS BAR + BACKTOP
  ========================================= */
  const progressBar = qs("#progressBar");
  const backTop = qs("#backTop");

  let ticking = false;

  const updateScrollUI = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const progress = max > 0 ? doc.scrollTop / max : 0;

    if (progressBar) progressBar.style.width = `${progress * 100}%`;

    if (backTop) {
      backTop.style.display = window.scrollY > 500 ? "grid" : "none";
    }

    ticking = false;
  };

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(updateScrollUI);
      ticking = true;
    }
  });

  updateScrollUI();

  if (backTop) {
    backTop.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReduced ? "auto" : "smooth"
      });
    });
  }

  /* =========================================
     HERO PARALLAX
  ========================================= */
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

  /* =========================================
     COUNTERS
  ========================================= */
  qsa("[data-count]").forEach((el) => {
    const target = Number(el.dataset.count || 0);

    if (!Number.isFinite(target)) return;

    const runCounter = () => {
      if (prefersReduced) {
        el.textContent = target;
        return;
      }

      const start = performance.now();
      const duration = 1200;

      const animate = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        el.textContent = Math.floor(target * progress);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          el.textContent = target;
        }
      };

      requestAnimationFrame(animate);
    };

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            runCounter();
            obs.unobserve(el);
          });
        },
        { threshold: 0.35 }
      );

      io.observe(el);
    } else {
      runCounter();
    }
  });

  /* =========================================
     KPI STORY
  ========================================= */
  const stepCards = qsa(".stepCard");
  const kpiValue = qs("#kpiValue");
  const kpiLabel = qs("#kpiLabel");
  const kpiSub = qs("#kpiSub");
  const kpiBar = qs("#kpiBar");
  const kpiMetaR = qs("#kpiMetaR");
  const kpiChip = qs("#kpiChip");

  const KPI = {
    circulares: {
      value: "38",
      label: "Circulares internas",
      sub: "Comunicación interna anual",
      progress: 14,
      meta: "01/07",
      chip: "Comunicación"
    },
    aperturas: {
      value: "8.439",
      label: "Aperturas registradas",
      sub: "Seguimiento de envíos",
      progress: 28,
      meta: "02/07",
      chip: "Comunicación"
    },
    promedio: {
      value: "69,19%",
      label: "Promedio aperturas",
      sub: "Tasa media anual",
      progress: 42,
      meta: "03/07",
      chip: "Rendimiento"
    },
    publicaciones: {
      value: "41",
      label: "Publicaciones web",
      sub: "Noticias y contenidos web",
      progress: 57,
      meta: "04/07",
      chip: "Web"
    },
    eventos: {
      value: "26",
      label: "Eventos web",
      sub: "Agenda publicada en la web",
      progress: 71,
      meta: "05/07",
      chip: "Web"
    },
    empleo: {
      value: "12",
      label: "Ofertas de empleo",
      sub: "Oportunidades publicadas",
      progress: 85,
      meta: "06/07",
      chip: "Servicios"
    },
    visitas: {
      value: "12.670",
      label: "Visitas web",
      sub: "Impacto digital total",
      progress: 100,
      meta: "07/07",
      chip: "Impacto"
    }
  };

  const setKPI = (key) => {
    const d = KPI[key];
    if (!d) return;

    if (kpiValue) kpiValue.textContent = d.value;
    if (kpiLabel) kpiLabel.textContent = d.label;
    if (kpiSub) kpiSub.textContent = d.sub;
    if (kpiMetaR) kpiMetaR.textContent = d.meta;
    if (kpiChip) kpiChip.textContent = d.chip;
    if (kpiBar) kpiBar.style.width = `${d.progress}%`;
  };

  if (stepCards.length) {
    stepCards.forEach((card) => {
      card.addEventListener("click", () => {
        stepCards.forEach((x) => x.classList.remove("is-active"));
        card.classList.add("is-active");
        setKPI(card.dataset.key);
      });
    });

    const active = qs(".stepCard.is-active");
    if (active) setKPI(active.dataset.key);
  }

  /* =========================================
     CHARTS
  ========================================= */
  const hasChart = typeof Chart !== "undefined";
  const charts = {};

  const createChart = (id, config) => {
    if (!hasChart) return;
    const canvas = qs(`#${id}`);
    if (!canvas) return;

    if (charts[id]) charts[id].destroy();
    charts[id] = new Chart(canvas.getContext("2d"), config);
  };

  if (hasChart) {
    Chart.defaults.color = "#163126";
    Chart.defaults.font.family =
      'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    Chart.defaults.borderColor = "rgba(17,70,50,.08)";
  }

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: prefersReduced ? false : { duration: 900 }
  };

  /* 2.1 REUNIONES */
  createChart("chartReuniones", {
    type: "bar",
    data: {
      labels: [
        "Junta Directiva",
        "Vocalías Consejo Asesor",
        "Grupo Educación",
        "Incidencia Política",
        "Voluntariado"
      ],
      datasets: [
        {
          label: "Reuniones",
          data: [11, 6, 11, 5, 3],
          backgroundColor: [
            "#114632",
            "#239f71",
            "#79cfaf",
            "#2d7f60",
            "#bfecdd"
          ],
          borderRadius: 10
        }
      ]
    },
    options: {
      ...baseOptions,
      plugins: {
        legend: { display: false }
      }
    }
  });

  /* 2.2 COMUNICACIÓN */
  const redes = {
    seguidores: {
      labels: ["X/Twitter", "Facebook", "Instagram", "YouTube"],
      data: [1782, 2529, 1197, 88],
      title: "Seguidores"
    },
    publicaciones: {
      labels: ["X/Twitter", "Facebook", "Instagram", "YouTube"],
      data: [200, 187, 310, 4],
      title: "Publicaciones / vídeos"
    },
    interacciones: {
      labels: ["X Likes", "Facebook Interacciones", "Instagram Interacciones", "YouTube Reproducciones"],
      data: [459, 3041, 1980, 493],
      title: "Interacciones"
    }
  };

  const renderRedes = (key = "seguidores") => {
    const item = redes[key];

    createChart("chartRedes", {
      type: "bar",
      data: {
        labels: item.labels,
        datasets: [
          {
            label: item.title,
            data: item.data,
            backgroundColor: ["#114632", "#239f71", "#79cfaf", "#bfecdd"],
            borderRadius: 10
          }
        ]
      },
      options: {
        ...baseOptions,
        plugins: {
          legend: { display: false }
        }
      }
    });
  };

  renderRedes();

  qsa(".tab[data-m]").forEach((tab) => {
    tab.addEventListener("click", () => {
      qsa(".tab[data-m]").forEach((x) => x.classList.remove("is-active"));
      tab.classList.add("is-active");
      renderRedes(tab.dataset.m);
    });
  });

  /* 2.3 PARTICIPACIÓN POR GÉNERO */
  createChart("chartGenero", {
    type: "bar",
    data: {
      labels: [
        "Asamblea",
        "Extra ONGS",
        "Junta Directiva",
        "Vocalías Consejo",
        "Grupo Educación",
        "Incidencia Política"
      ],
      datasets: [
        {
          label: "% Mujeres",
          data: [75.63, 76.06, 66.56, 68.02, 74.02, 65.0],
          backgroundColor: "#239f71",
          borderRadius: 8
        },
        {
          label: "% Hombres",
          data: [24.47, 23.94, 33.44, 31.98, 25.98, 35.0],
          backgroundColor: "#114632",
          borderRadius: 8
        }
      ]
    },
    options: {
      ...baseOptions,
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  });

  /* ASISTENCIAS TÉCNICAS POR TEMA */
  createChart("chartConsultasTemas", {
    type: "doughnut",
    data: {
      labels: [
        "Normativas",
        "Cuestiones administrativas",
        "Inf. ciudadana / otras ONGS",
        "Instituciones",
        "Red coord. autonómicas",
        "Acogida ONGS CONGDEX",
        "Otras"
      ],
      datasets: [
        {
          data: [63, 6, 13, 10, 3, 13, 13],
          backgroundColor: [
            "#114632",
            "#239f71",
            "#79cfaf",
            "#bfecdd",
            "#2d7f60",
            "#7dbfa8",
            "#9edec7"
          ],
          borderWidth: 0
        }
      ]
    },
    options: baseOptions
  });

  /* GÉNERO EN ASISTENCIAS TÉCNICAS */
  createChart("chartConsultasGenero", {
    type: "bar",
    data: {
      labels: [
        "Normativas",
        "Adm.",
        "Inf./ONGS",
        "Instituciones",
        "Red CCAA",
        "Acogida ONGS",
        "Otras"
      ],
      datasets: [
        {
          label: "% Mujeres",
          data: [90.48, 66.67, 69.23, 70.0, 100.0, 100.0, 84.62],
          backgroundColor: "#239f71",
          borderRadius: 8
        },
        {
          label: "% Hombres",
          data: [9.52, 33.33, 30.77, 30.0, 0.0, 0.0, 15.38],
          backgroundColor: "#114632",
          borderRadius: 8
        }
      ]
    },
    options: {
      ...baseOptions,
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  });
  /* =========================================
     DOWNLOAD CHART
  ========================================= */
  qsa("[data-dl]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.dl;
      const canvas = qs(`#${id}`);
      if (!canvas) return;

      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png", 1);
      a.download = `${id}.png`;
      a.click();
    });
  });

  /* =========================================
     TIMELINE PREMIUM
  ========================================= */
  const tlTrack = qs("#tlTrack");
  const tlWrap = qs("#tlTrackWrap");

  const tlYear = qs("#tlYear");
  const tlTitle = qs("#tlTitle");
  const tlDesc = qs("#tlDesc");
  const tlTag = qs("#tlTag");
  const tlBar = qs("#tlBar");
  const tlMeta = qs("#tlMetaR");
  const tlRangeHint = qs("#tlRangeHint");

  const prev = qs("#tlPrevBtn");
  const next = qs("#tlNextBtn");

  const timeline = [
    {
      year: 1995,
      title: "Constitución CONGDEX",
      desc: "Nace la Coordinadora Extremeña de ONGD.",
      tag: "Resumen"
    },
    {
      year: 1998,
      title: "Primeros marcos",
      desc: "Se fortalece la interlocución institucional.",
      tag: "Institucional"
    },
    {
      year: 2005,
      title: "Consolidación de red",
      desc: "Aumenta la coordinación entre entidades.",
      tag: "Red"
    },
    {
      year: 2010,
      title: "Ciudadanía global",
      desc: "Impulso a educación transformadora.",
      tag: "Ciudadanía"
    },
    {
      year: 2015,
      title: "Nuevas agendas",
      desc: "ODS, sostenibilidad y justicia global.",
      tag: "Agenda"
    },
    {
      year: 2020,
      title: "Transformación digital",
      desc: "Trabajo híbrido y comunicación online.",
      tag: "Digital"
    },
    {
      year: 2025,
      title: "30 aniversario",
      desc: "Tres décadas de cooperación extremeña.",
      tag: "Aniversario"
    }
  ];

  if (tlTrack && tlWrap) {
    tlTrack.innerHTML = '<div class="tl-line"></div>';

    let current = 0;

    if (tlRangeHint) {
      tlRangeHint.textContent = `Rango: ${timeline[0].year}–${timeline[timeline.length - 1].year}`;
    }

    const drawNodes = () => {
      timeline.forEach((item, i) => {
        const node = document.createElement("div");
        node.className = "tl-node";

        const left =
          timeline.length === 1
            ? 50
            : (i / (timeline.length - 1)) * 100;

        node.style.left = `${left}%`;

        node.innerHTML = `
          <div class="tl-tooltip">
            <div class="tl-tYear">${item.year}</div>
            <div class="tl-tTitle">${item.title}</div>
            <div class="tl-tDesc">${item.desc}</div>
          </div>
          <div class="tl-pin"></div>
          <button class="tl-pill" type="button">${item.year}</button>
        `;

        node.addEventListener("click", () => setTimeline(i));
        tlTrack.appendChild(node);
      });
    };

    const setTimeline = (index) => {
      current = clamp(index, 0, timeline.length - 1);

      qsa(".tl-node", tlTrack).forEach((n, i) => {
        n.classList.toggle("is-active", i === current);
      });

      const item = timeline[current];

      if (tlYear) tlYear.textContent = item.year;
      if (tlTitle) tlTitle.textContent = item.title;
      if (tlDesc) tlDesc.textContent = item.desc;
      if (tlTag) tlTag.textContent = item.tag;

      if (tlMeta) {
        tlMeta.textContent =
          `${String(current + 1).padStart(2, "0")}/${String(
            timeline.length
          ).padStart(2, "0")}`;
      }

      if (tlBar) {
        tlBar.style.width =
          `${((current + 1) / timeline.length) * 100}%`;
      }

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

    drawNodes();
    setTimeline(0);

    prev?.addEventListener("click", () =>
      setTimeline(current - 1)
    );

    next?.addEventListener("click", () =>
      setTimeline(current + 1)
    );
  }

  /* =========================================
     LOAD
  ========================================= */
  window.addEventListener("load", () => {
    document.body.classList.add("is-loaded");
    revealItems.forEach((el) => el.classList.add("visible"));
  });
})();
