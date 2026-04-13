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
      { threshold: 0.15 }
    );

    revealItems.forEach((el) => revealObserver.observe(el));
  } else {
    revealItems.forEach((el) => el.classList.add("visible"));
  }

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
  const counterEls = qsa("[data-count]");

  if ("IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const el = entry.target;
          const target = Number(el.dataset.count || 0);
          const duration = 1000;
          const startTime = performance.now();

          const animate = (now) => {
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

  const setKpi = (key) => {
    const item = kpiData[key];
    if (!item) return;

    if (kpiValue) kpiValue.textContent = item.value;
    if (kpiLabel) kpiLabel.textContent = item.label;
    if (kpiSub) kpiSub.textContent = item.sub;
    if (kpiBar) kpiBar.style.width = `${item.progress}%`;
    if (kpiMetaR) kpiMetaR.textContent = item.meta;
    if (kpiChip) kpiChip.textContent = item.chip;
  };

  if (steps.length) {
    steps.forEach((step) => {
      step.addEventListener("click", () => {
        steps.forEach((el) => el.classList.remove("is-active"));
        step.classList.add("is-active");
        setKpi(step.dataset.key);
      });
    });

    const active = qs(".stepCard.is-active");
    if (active?.dataset.key) setKpi(active.dataset.key);
  }

  /* =========================
     CHARTS
     ========================= */
  const chartInstances = {};

  const chartFontColor = "#163126";
  const gridColor = "rgba(17, 70, 50, 0.08)";

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: prefersReduced ? false : { duration: 900 },
    plugins: {
      legend: {
        labels: {
          color: chartFontColor,
          font: { family: "Inter, sans-serif", size: 12 }
        }
      },
      tooltip: {
        enabled: true
      }
    },
    scales: {
      x: {
        ticks: { color: chartFontColor },
        grid: { color: gridColor }
      },
      y: {
        ticks: { color: chartFontColor },
        grid: { color: gridColor },
        beginAtZero: true
      }
    }
  };

  const makeChart = (id, config) => {
    const canvas = qs(`#${id}`);
    if (!canvas || typeof Chart === "undefined") return null;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    if (chartInstances[id]) {
      chartInstances[id].destroy();
    }

    chartInstances[id] = new Chart(ctx, config);
    return chartInstances[id];
  };

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
      datasets: [{
        label: "Número de reuniones",
        data: [11, 6, 11, 5, 3]
      }]
    },
    options: baseOptions
  });

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
    const d = redesData[metric];
    if (!d) return;

    makeChart("chartRedes", {
      type: "bar",
      data: {
        labels: d.labels,
        datasets: [{
          label: d.label,
          data: d.values
        }]
      },
      options: baseOptions
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

  makeChart("chartGenero", {
    type: "bar",
    data: {
      labels: ["Mujeres", "Hombres", "No consta"],
      datasets: [{
        label: "Participación",
        data: [68, 29, 3]
      }]
    },
    options: baseOptions
  });

  makeChart("chartConsultasTemas", {
    type: "doughnut",
    data: {
      labels: ["Subvenciones", "Justificación", "Comunicación", "Incidencia", "Voluntariado"],
      datasets: [{
        data: [12, 9, 6, 4, 3]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: prefersReduced ? false : { duration: 900 },
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: chartFontColor,
            font: { family: "Inter, sans-serif", size: 12 }
          }
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
          data: [8, 6, 4, 3, 2]
        },
        {
          label: "Hombres",
          data: [4, 3, 2, 1, 1]
        }
      ]
    },
    options: baseOptions
  });

  /* =========================
     DOWNLOAD CHART
     ========================= */
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
  const tlYear = qs("#tlYear");
  const tlTitle = qs("#tlTitle");
  const tlDesc = qs("#tlDesc");
  const tlTag = qs("#tlTag");
  const tlBar = qs("#tlBar");
  const tlMetaR = qs("#tlMetaR");
  const tlPrevBtn = qs("#tlPrevBtn");
  const tlNextBtn = qs("#tlNextBtn");
  const tlRangeHint = qs("#tlRangeHint");
  const tlTrackWrap = qs("#tlTrackWrap");

  if (tlTrack && timelineData.length) {
    const startYear = timelineData[0].year;
    const endYear = timelineData[timelineData.length - 1].year;

    if (tlRangeHint) {
      tlRangeHint.textContent = `Rango: ${startYear}–${endYear}`;
    }

    const trackWidth = Math.max(900, timelineData.length * 200);
    tlTrack.style.width = `${trackWidth}px`;

    let currentIndex = 0;

    const renderTimelineNodes = () => {
      timelineData.forEach((item, index) => {
        const node = document.createElement("div");
        node.className = `tl-node${index === 0 ? " is-active" : ""}`;

        const left = timelineData.length === 1
          ? 50
          : (index / (timelineData.length - 1)) * 100;

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

        node.addEventListener("click", () => setTimeline(index));
        node.querySelector(".tl-pill")?.addEventListener("click", () => setTimeline(index));

        tlTrack.appendChild(node);
      });
    };

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

      qsa(".tl-node", tlTrack).forEach((node, i) => {
        node.classList.toggle("is-active", i === currentIndex);
      });

      const activeNode = qsa(".tl-node", tlTrack)[currentIndex];
      if (activeNode && tlTrackWrap) {
        const wrapRect = tlTrackWrap.getBoundingClientRect();
        const nodeRect = activeNode.getBoundingClientRect();
        const delta = nodeRect.left - wrapRect.left - wrapRect.width / 2 + nodeRect.width / 2;
        tlTrackWrap.scrollBy({
          left: delta,
          behavior: prefersReduced ? "auto" : "smooth"
        });
      }
    };

    renderTimelineNodes();
    setTimeline(0);

    tlPrevBtn?.addEventListener("click", () => setTimeline(currentIndex - 1));
    tlNextBtn?.addEventListener("click", () => setTimeline(currentIndex + 1));
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
     LOAD
     ========================= */
  window.addEventListener("load", () => {
    document.body.classList.add("is-loaded");
    updateScroll();
  });
})();
