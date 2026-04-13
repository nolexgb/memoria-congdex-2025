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
        menuToggle?.setAttribute("aria-expanded", "false");
      }
    });
  });

  /* =========================
     REVEAL
     ========================= */
  const revealItems = qsa(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12 }
    );

    revealItems.forEach((el) => revealObserver.observe(el));
  } else {
    revealItems.forEach((el) => el.classList.add("visible"));
  }

  /* =========================
     PROGRESS + BACKTOP
     ========================= */
  const progressBar = qs("#progressBar");
  const backTop = qs("#backTop");
  let scrollTicking = false;

  const updateScrollUi = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const progress = max > 0 ? doc.scrollTop / max : 0;

    if (progressBar) {
      progressBar.style.width = `${progress * 100}%`;
    }

    if (backTop) {
      backTop.style.display = window.scrollY > 500 ? "block" : "none";
    }

    scrollTicking = false;
  };

  window.addEventListener("scroll", () => {
    if (!scrollTicking) {
      requestAnimationFrame(updateScrollUi);
      scrollTicking = true;
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
  const counterEls = qsa("[data-count]");

  if ("IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const el = entry.target;
          const target = Number(el.dataset.count || 0);

          if (!Number.isFinite(target)) {
            observer.unobserve(el);
            return;
          }

          const duration = prefersReduced ? 0 : 1000;
          const startTime = performance.now();

          const animate = (now) => {
            if (duration === 0) {
              el.textContent = String(target);
              return;
            }

            const progress = Math.min((now - startTime) / duration, 1);
            const value = Math.floor(progress * target);
            el.textContent = String(value);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              el.textContent = String(target);
            }
          };

          requestAnimationFrame(animate);
          observer.unobserve(el);
        });
      },
      { threshold: 0.35 }
    );

    counterEls.forEach((el) => counterObserver.observe(el));
  } else {
    counterEls.forEach((el) => {
      el.textContent = el.dataset.count || "0";
    });
  }

  /* =========================
     HERO PARALLAX
     ========================= */
  const heroZoom = qs("[data-zoom]");
  const heroImg = qs(".memoriaHeader__image");

  if (heroZoom && heroImg && !prefersReduced) {
    let heroTicking = false;

    const updateHero = () => {
      const rect = heroZoom.getBoundingClientRect();
      const p = clamp(1 - rect.top / window.innerHeight, 0, 1);
      heroImg.style.transform = `scale(${1.04 + p * 0.08})`;
      heroTicking = false;
    };

    window.addEventListener("scroll", () => {
      if (!heroTicking) {
        requestAnimationFrame(updateHero);
        heroTicking = true;
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

  const setKpi = (key) => {
    const item = kpiData[key];
    if (!item) return;

    if (kpiValue) kpiValue.textContent = item.value;
    if (kpiLabel) kpiLabel.textContent = item.label;
    if (kpiSub) kpiSub.textContent = item.sub;
    if (kpiMetaR) kpiMetaR.textContent = item.meta;
    if (kpiChip) kpiChip.textContent = item.chip;

    if (kpiBar) {
      requestAnimationFrame(() => {
        kpiBar.style.width = `${item.progress}%`;
      });
    }
  };

  if (stepCards.length) {
    stepCards.forEach((card) => {
      card.addEventListener("click", () => {
        stepCards.forEach((item) => item.classList.remove("is-active"));
        card.classList.add("is-active");
        setKpi(card.dataset.key);
      });
    });

    const activeCard = qs(".stepCard.is-active");
    if (activeCard?.dataset.key) {
      setKpi(activeCard.dataset.key);
    }
  }

  /* =========================
     CHARTS
     ========================= */
  const chartInstances = {};
  const hasChartJs = typeof window.Chart !== "undefined";

  const destroyChart = (id) => {
    if (chartInstances[id]) {
      chartInstances[id].destroy();
      delete chartInstances[id];
    }
  };

  const makeChart = (id, config) => {
    if (!hasChartJs) return null;

    const canvas = qs(`#${id}`);
    if (!canvas) return null;

    destroyChart(id);

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    chartInstances[id] = new Chart(ctx, config);
    return chartInstances[id];
  };

  if (hasChartJs) {
    Chart.defaults.color = "#163126";
    Chart.defaults.font.family = 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    Chart.defaults.borderColor = "rgba(17, 70, 50, 0.08)";
    Chart.defaults.plugins.legend.labels.boxWidth = 12;
  }

  const baseScales = {
    x: {
      ticks: { color: "#163126" },
      grid: { color: "rgba(17, 70, 50, 0.08)" }
    },
    y: {
      beginAtZero: true,
      ticks: { color: "#163126" },
      grid: { color: "rgba(17, 70, 50, 0.08)" }
    }
  };

  const baseChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: prefersReduced ? false : { duration: 900 },
    plugins: {
      legend: {
        labels: {
          color: "#163126"
        }
      },
      tooltip: {
        enabled: true
      }
    },
    scales: baseScales
  };

  /* 2.1 Reuniones */
  makeChart("chartReuniones", {
    type: "bar",
    data: {
      labels: [
        "Junta Directiva",
        "Consejo Asesor",
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
            "#8fd8bc"
          ],
          borderRadius: 10,
          borderSkipped: false
        }
      ]
    },
    options: baseChartOptions
  });

  /* 2.2 Comunicación */
  const redesData = {
    seguidores: {
      labels: ["X / Twitter", "Facebook", "Instagram", "YouTube"],
      values: [1782, 2529, 1197, 88],
      label: "Seguidores"
    },
    publicaciones: {
      labels: ["Web", "Eventos web", "Ofertas empleo", "Circulares"],
      values: [41, 26, 12, 38],
      label: "Publicaciones"
    },
    interacciones: {
      labels: ["Aperturas", "Visitas web", "Visitantes", "Promedio %"],
      values: [8439, 12670, 11420, 60.19],
      label: "Interacciones"
    }
  };

  const renderRedesChart = (metric = "seguidores") => {
    const item = redesData[metric];
    if (!item) return;

    makeChart("chartRedes", {
      type: "bar",
      data: {
        labels: item.labels,
        datasets: [
          {
            label: item.label,
            data: item.values,
            backgroundColor: [
              "#114632",
              "#239f71",
              "#79cfaf",
              "#bfecdd"
            ],
            borderRadius: 10,
            borderSkipped: false
          }
        ]
      },
      options: {
        ...baseChartOptions,
        scales: {
          ...baseScales,
          y: {
            ...baseScales.y
          }
        }
      }
    });
  };

  renderRedesChart("seguidores");

  qsa(".tab[data-m]").forEach((tab) => {
    tab.addEventListener("click", () => {
      qsa(".tab[data-m]").forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");
      renderRedesChart(tab.dataset.m);
    });
  });

  /* 2.3 Participación */
  makeChart("chartGenero", {
    type: "bar",
    data: {
      labels: ["Mujeres", "Hombres", "No consta"],
      datasets: [
        {
          label: "Participación",
          data: [68, 29, 3],
          backgroundColor: ["#239f71", "#114632", "#79cfaf"],
          borderRadius: 10,
          borderSkipped: false
        }
      ]
    },
    options: baseChartOptions
  });

  makeChart("chartConsultasTemas", {
    type: "doughnut",
    data: {
      labels: ["Subvenciones", "Justificación", "Comunicación", "Incidencia", "Voluntariado"],
      datasets: [
        {
          data: [12, 9, 6, 4, 3],
          backgroundColor: ["#114632", "#239f71", "#79cfaf", "#bfecdd", "#2d7f60"],
          borderWidth: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: prefersReduced ? false : { duration: 900 },
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: "#163126" }
        }
      }
    }
  });

  makeChart("chartConsultasGenero", {
    type: "bar",
    data: {
      labels: ["Subvenciones", "Justificación", "Comunicación", "Incidencia", "Voluntariado"],
      datasets: [
        {
          label: "Mujeres",
          data: [8, 6, 4, 3, 2],
          backgroundColor: "#239f71",
          borderRadius: 8,
          borderSkipped: false
        },
        {
          label: "Hombres",
          data: [4, 3, 2, 1, 1],
          backgroundColor: "#114632",
          borderRadius: 8,
          borderSkipped: false
        }
      ]
    },
    options: baseChartOptions
  });

  /* Descarga charts */
  qsa("[data-dl]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.dl;
      const canvas = qs(`#${id}`);
      if (!canvas) return;

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png", 1);
      link.download = `${id}.png`;
      link.click();
    });
  });

  /* =========================
     TIMELINE
     ========================= */
  const timelineData = [
    {
      year: 1995,
      title: "Constitución CONGDEX",
      desc: "Nace la Coordinadora Extremeña de ONGD y se consolida un espacio común de trabajo en red.",
      tag: "Resumen"
    },
    {
      year: 1998,
      title: "Primeros marcos de cooperación",
      desc: "Se fortalecen los mecanismos institucionales y la interlocución con las administraciones.",
      tag: "Institucional"
    },
    {
      year: 2005,
      title: "Consolidación de red",
      desc: "La Coordinadora amplía su capacidad de articulación, coordinación y representación.",
      tag: "Red"
    },
    {
      year: 2010,
      title: "Ciudadanía global",
      desc: "Se refuerzan las líneas de educación transformadora e incidencia pública.",
      tag: "Ciudadanía global"
    },
    {
      year: 2015,
      title: "Nuevas agendas",
      desc: "La agenda internacional impulsa nuevas miradas sobre sostenibilidad y justicia global.",
      tag: "Agenda"
    },
    {
      year: 2020,
      title: "Transformación digital",
      desc: "Se intensifica el trabajo en red, la comunicación online y los formatos híbridos.",
      tag: "Digital"
    },
    {
      year: 2025,
      title: "30 aniversario",
      desc: "CONGDEX celebra tres décadas de cooperación, alianzas y defensa de derechos humanos.",
      tag: "Aniversario"
    }
  ];

  const tlTrack = qs("#tlTrack");
  const tlTrackWrap = qs("#tlTrackWrap");
  const tlYear = qs("#tlYear");
  const tlTitle = qs("#tlTitle");
  const tlDesc = qs("#tlDesc");
  const tlTag = qs("#tlTag");
  const tlBar = qs("#tlBar");
  const tlMetaR = qs("#tlMetaR");
  const tlPrevBtn = qs("#tlPrevBtn");
  const tlNextBtn = qs("#tlNextBtn");
  const tlRangeHint = qs("#tlRangeHint");

  if (tlTrack && tlTrackWrap && timelineData.length) {
    tlTrack.querySelectorAll(".tl-node").forEach((node) => node.remove());

    const startYear = timelineData[0].year;
    const endYear = timelineData[timelineData.length - 1].year;

    if (tlRangeHint) {
      tlRangeHint.textContent = `Rango: ${startYear}–${endYear}`;
    }

    const baseWidth = Math.max(1100, timelineData.length * 180);
    tlTrack.style.width = `${baseWidth}px`;

    let currentIndex = 0;

    const createNode = (item, index) => {
      const node = document.createElement("div");
      node.className = `tl-node${index === 0 ? " is-active" : ""}`;

      const leftPct =
        timelineData.length === 1
          ? 50
          : (index / (timelineData.length - 1)) * 100;

      node.style.left = `${leftPct}%`;

      node.innerHTML = `
        <div class="tl-tooltip">
          <div class="tl-tYear">${item.year}</div>
          <div class="tl-tTitle">${item.title}</div>
          <div class="tl-tDesc">${item.desc}</div>
        </div>
        <div class="tl-pin"></div>
        <button class="tl-pill" type="button">${item.year}</button>
      `;

      const pill = node.querySelector(".tl-pill");

      node.addEventListener("click", () => setTimeline(index));
      pill?.addEventListener("click", (e) => {
        e.stopPropagation();
        setTimeline(index);
      });

      return node;
    };

    timelineData.forEach((item, index) => {
      tlTrack.appendChild(createNode(item, index));
    });

    const getNodes = () => qsa(".tl-node", tlTrack);

    const setTimeline = (index) => {
      currentIndex = clamp(index, 0, timelineData.length - 1);
      const item = timelineData[currentIndex];

      if (tlYear) tlYear.textContent = item.year;
      if (tlTitle) tlTitle.textContent = item.title;
      if (tlDesc) tlDesc.textContent = item.desc;
      if (tlTag) tlTag.textContent = item.tag;
      if (tlMetaR) {
        tlMetaR.textContent = `${String(currentIndex + 1).padStart(2, "0")}/${String(timelineData.length).padStart(2, "0")}`;
      }
      if (tlBar) {
        tlBar.style.width = `${((currentIndex + 1) / timelineData.length) * 100}%`;
      }

      getNodes().forEach((node, i) => {
        node.classList.toggle("is-active", i === currentIndex);
      });

      const activeNode = getNodes()[currentIndex];
      if (activeNode) {
        const wrapRect = tlTrackWrap.getBoundingClientRect();
        const nodeRect = activeNode.getBoundingClientRect();
        const currentScroll = tlTrackWrap.scrollLeft;
        const delta =
          nodeRect.left -
          wrapRect.left -
          wrapRect.width / 2 +
          nodeRect.width / 2;

        tlTrackWrap.scrollTo({
          left: currentScroll + delta,
          behavior: prefersReduced ? "auto" : "smooth"
        });
      }
    };

    tlPrevBtn?.addEventListener("click", () => setTimeline(currentIndex - 1));
    tlNextBtn?.addEventListener("click", () => setTimeline(currentIndex + 1));

    setTimeline(0);
  }

  /* =========================
     MAPA
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
     RESIZE FIX CHARTS
     ========================= */
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      Object.values(chartInstances).forEach((chart) => {
        if (chart && typeof chart.resize === "function") {
          chart.resize();
        }
      });
    }, 120);
  });

  /* =========================
     LOAD
     ========================= */
  window.addEventListener("load", () => {
    document.body.classList.add("is-loaded");
    updateScrollUi();

    qsa(".reveal").forEach((el) => {
      el.classList.add("visible");
    });
  });
})();
