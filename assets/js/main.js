(() => {
  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* =========================
     HELPERS
     ========================= */
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => [...r.querySelectorAll(s)];
  const nf = new Intl.NumberFormat("es-ES");

  /* =========================
     MENU HEADER
     ========================= */
  const menuToggle = qs("#menuToggle");
  const memoriaNav = qs(".memoriaHeader__nav");

  if (menuToggle && memoriaNav) {
    menuToggle.addEventListener("click", () => {
      const open = memoriaNav.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    qsa('a[href^="#"]', memoriaNav).forEach((link) => {
      link.addEventListener("click", () => {
        memoriaNav.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* =========================
     REVEAL
     ========================= */
  const reveals = qsa(".reveal");
  if (reveals.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.12 }
    );
    reveals.forEach((r) => io.observe(r));
  }

  /* =========================
     PROGRESS + BACK TOP + NAV ACTIVE
     ========================= */
  const progressBar = qs("#progressBar");
  const back = qs("#backTop");
  const navLinks = qsa('.memoriaHeader__nav a[href^="#"], .nav a[href^="#"]');
  const navTargets = navLinks
    .map((a) => qs(a.getAttribute("href")))
    .filter(Boolean);

  const updateActiveNav = () => {
    if (!navTargets.length) return;
    const marker = window.innerHeight * 0.24;
    let currentId = navTargets[0].id;

    navTargets.forEach((sec) => {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= marker) currentId = sec.id;
    });

    navLinks.forEach((a) => {
      const is = a.getAttribute("href") === `#${currentId}`;
      a.classList.toggle("is-active", is);
      if (is) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  };

  const onScrollGlobal = () => {
    const h = document.documentElement;
    const denom = h.scrollHeight - h.clientHeight;
    const p = denom > 0 ? h.scrollTop / denom : 0;

    if (progressBar) progressBar.style.width = `${p * 100}%`;
    if (back) back.style.display = window.scrollY > 500 ? "block" : "none";

    updateActiveNav();
  };

  window.addEventListener("scroll", onScrollGlobal, { passive: true });
  window.addEventListener("resize", onScrollGlobal);
  onScrollGlobal();

  if (back) {
    back.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* =========================
     COUNTERS
     ========================= */
  qsa("[data-count]").forEach((el) => {
    let done = false;

    new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (!e.isIntersecting || done) return;
        done = true;

        const target = Number(el.dataset.count || 0);
        if (prefersReduced) {
          el.textContent = nf.format(target);
          return;
        }

        let current = 0;
        const steps = 36;
        const inc = target / steps;

        const timer = setInterval(() => {
          current += inc;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          el.textContent = nf.format(Math.floor(current));
        }, 22);
      },
      { threshold: 0.3 }
    ).observe(el);
  });

  /* =========================
     HERO / MEDIA PARALLAX
     ========================= */
  const zoomSections = qsa("[data-zoom]");
  let rafZoom = null;

  const applyZoom = () => {
    rafZoom = null;
    const vh = window.innerHeight;

    zoomSections.forEach((sec) => {
      const rect = sec.getBoundingClientRect();
      const media =
        qs(".hero__img", sec) ||
        qs(".memoriaHeader__image", sec) ||
        qs(".impact__img", sec) ||
        qs(".zoomMedia", sec);

      if (!media) return;

      const start = vh;
      const end = -rect.height;
      const t = (rect.top - end) / (start - end);
      const p = clamp(1 - t, 0, 1);

      const scale = 1.06 + p * 0.08;
      const translate = (p - 0.5) * 22;

      media.style.transform = `translateY(${translate.toFixed(2)}px) scale(${scale.toFixed(4)})`;
    });
  };

  const onScrollZoom = () => {
    if (rafZoom) return;
    rafZoom = requestAnimationFrame(applyZoom);
  };

  if (zoomSections.length) {
    window.addEventListener("scroll", onScrollZoom, { passive: true });
    window.addEventListener("resize", onScrollZoom);
    applyZoom();
  }

  /* =========================
     CHARTS
     ========================= */
  const hasCharts =
    qs("#chartReuniones") &&
    qs("#chartRedes") &&
    qs("#chartGenero") &&
    qs("#chartConsultasTemas") &&
    qs("#chartConsultasGenero");

  if (hasCharts && window.Chart) {
    const palette = {
      g0: "#114632",
      g1: "#239F71",
      g2: "#79CFAF",
      g3: "#BFECDD",
      g4: "#E8FBF3"
    };

    const pct = (n) => `${(Math.round(n * 100) / 100).toLocaleString("es-ES")}%`;
    const num = (n) => nf.format(Number(n));

    Chart.defaults.font.family = "system-ui, -apple-system, Segoe UI, Roboto, Arial";
    Chart.defaults.animation.duration = prefersReduced ? 0 : 800;
    Chart.defaults.plugins.legend.labels.boxWidth = 10;
    Chart.defaults.responsive = true;

    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "nearest", intersect: true },
      hover: { mode: "nearest", intersect: true },
      plugins: { tooltip: { enabled: true } }
    };

    const reuniones = [
      { label: "Junta Directiva / Equipo Técnico", value: 11 },
      { label: "Vocalías Consejo Asesor", value: 6 },
      { label: "Grupo de Educación", value: 11 },
      { label: "Comisión Incidencia Política", value: 5 },
      { label: "Grupo Voluntariado", value: 3 }
    ];

    const redes = {
      labels: ["X / Twitter", "Facebook", "Instagram", "YouTube"],
      seguidores: [1782, 2529, 1197, 88],
      publicaciones: [200, 187, 310, 4],
      interacciones: [459, 3041, 1908, 493]
    };

    const generoActividades = [
      { label: "Asamblea", mujeres: 73.53, hombres: 26.47 },
      { label: "Reuniones ONGs (2)", mujeres: 76.06, hombres: 23.94 },
      { label: "Junta Directiva", mujeres: 66.56, hombres: 33.44 },
      { label: "Vocalías Consejo Asesor", mujeres: 68.02, hombres: 31.98 },
      { label: "Grupo Educación", mujeres: 74.02, hombres: 25.98 },
      { label: "Incidencia política", mujeres: 65, hombres: 35 },
      { label: "Voluntariado", mujeres: 86.67, hombres: 13.33 },
      { label: "Formaciones", mujeres: 79.71, hombres: 20.29 },
      { label: "30 años (institucional)", mujeres: 71.21, hombres: 28.79 },
      { label: "30 años (encuentro ONGs)", mujeres: 76.67, hombres: 23.23 },
      { label: "Coord. estatal / Red CCAA", mujeres: 74.67, hombres: 25.33 }
    ];

    const consultasTemas = [
      { label: "Normativas", total: 63, mujeres: 90.48, hombres: 9.52 },
      { label: "Cuestiones administrativas", total: 6, mujeres: 66.67, hombres: 33.33 },
      { label: "Inf. ciudadana / otras ONGs", total: 13, mujeres: 69.23, hombres: 30.77 },
      { label: "Instituciones", total: 10, mujeres: 70, hombres: 30 },
      { label: "Coord. autonómicas", total: 3, mujeres: 100, hombres: 0 },
      { label: "Acogida ONGs CONGDEX", total: 13, mujeres: 100, hombres: 0 },
      { label: "Otras", total: 13, mujeres: 84.62, hombres: 15.38 }
    ];

    const reunionesChart = new Chart(qs("#chartReuniones"), {
      type: "doughnut",
      data: {
        labels: reuniones.map((d) => d.label),
        datasets: [{
          data: reuniones.map((d) => d.value),
          backgroundColor: [palette.g1, palette.g2, palette.g3, palette.g0, palette.g4],
          borderWidth: 0,
          hoverOffset: 8,
          cutout: "62%"
        }]
      },
      options: {
        ...commonOptions,
        plugins: {
          ...commonOptions.plugins,
          tooltip: {
            callbacks: {
              label: (item) => {
                const total = item.dataset.data.reduce((a, b) => a + b, 0);
                const v = item.raw;
                const p = (v / total) * 100;
                return ` ${item.label}: ${v} (${pct(p)})`;
              }
            }
          }
        }
      }
    });

    const redesChart = new Chart(qs("#chartRedes"), {
      type: "bar",
      data: {
        labels: redes.labels,
        datasets: [{
          label: "Seguidores",
          data: redes.seguidores,
          backgroundColor: palette.g1,
          borderWidth: 0,
          borderRadius: 10
        }]
      },
      options: {
        ...commonOptions,
        scales: {
          y: { beginAtZero: true }
        },
        plugins: {
          ...commonOptions.plugins,
          tooltip: {
            callbacks: {
              label: (item) => ` ${item.dataset.label}: ${num(item.raw)}`
            }
          }
        }
      }
    });

    const updateRedes = (m) => {
      const pretty =
        m === "seguidores" ? "Seguidores" :
        m === "publicaciones" ? "Publicaciones" :
        "Interacciones";

      redesChart.data.datasets[0].label = pretty;
      redesChart.data.datasets[0].data = redes[m];
      redesChart.update();
    };

    qsa(".tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        qsa(".tab").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        updateRedes(btn.dataset.m);
      });
    });

    const generoChart = new Chart(qs("#chartGenero"), {
      type: "bar",
      data: {
        labels: generoActividades.map((d) => d.label),
        datasets: [
          {
            label: "Mujeres (%)",
            data: generoActividades.map((d) => d.mujeres),
            stack: "s",
            borderWidth: 0,
            borderRadius: 8,
            backgroundColor: palette.g1
          },
          {
            label: "Hombres (%)",
            data: generoActividades.map((d) => d.hombres),
            stack: "s",
            borderWidth: 0,
            borderRadius: 8,
            backgroundColor: palette.g0
          }
        ]
      },
      options: {
        ...commonOptions,
        indexAxis: "y",
        scales: {
          x: { min: 0, max: 100, ticks: { callback: (v) => `${v}%` } },
          y: { ticks: { autoSkip: false } }
        },
        plugins: {
          ...commonOptions.plugins,
          tooltip: {
            callbacks: {
              label: (item) => ` ${item.dataset.label}: ${pct(item.raw)}`
            }
          }
        }
      }
    });

    const consultasTemasChart = new Chart(qs("#chartConsultasTemas"), {
      type: "bar",
      data: {
        labels: consultasTemas.map((d) => d.label),
        datasets: [{
          label: "Consultas",
          data: consultasTemas.map((d) => d.total),
          borderWidth: 0,
          borderRadius: 10,
          backgroundColor: palette.g2
        }]
      },
      options: {
        ...commonOptions,
        indexAxis: "y",
        scales: { x: { beginAtZero: true } },
        plugins: {
          ...commonOptions.plugins,
          tooltip: {
            callbacks: {
              label: (item) => ` ${item.dataset.label}: ${num(item.raw)}`
            }
          }
        }
      }
    });

    const consultasGeneroChart = new Chart(qs("#chartConsultasGenero"), {
      type: "bar",
      data: {
        labels: consultasTemas.map((d) => d.label),
        datasets: [
          {
            label: "Mujeres (%)",
            data: consultasTemas.map((d) => d.mujeres),
            stack: "g",
            borderWidth: 0,
            borderRadius: 8,
            backgroundColor: palette.g1
          },
          {
            label: "Hombres (%)",
            data: consultasTemas.map((d) => d.hombres),
            stack: "g",
            borderWidth: 0,
            borderRadius: 8,
            backgroundColor: palette.g0
          }
        ]
      },
      options: {
        ...commonOptions,
        indexAxis: "y",
        scales: {
          x: { min: 0, max: 100, ticks: { callback: (v) => `${v}%` } },
          y: { ticks: { autoSkip: false } }
        },
        plugins: {
          ...commonOptions.plugins,
          tooltip: {
            callbacks: {
              label: (item) => ` ${item.dataset.label}: ${pct(item.raw)}`
            }
          }
        }
      }
    });

    const chartMap = {
      chartReuniones: reunionesChart,
      chartRedes: redesChart,
      chartGenero: generoChart,
      chartConsultasTemas: consultasTemasChart,
      chartConsultasGenero: consultasGeneroChart
    };

    qsa("[data-dl]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-dl");
        const ch = chartMap[id];
        if (!ch) return;
        const a = document.createElement("a");
        a.href = ch.toBase64Image();
        a.download = `${id}.png`;
        a.click();
      });
    });
  }

  /* =========================
     KPI STORY PREMIUM
     ========================= */
  (() => {
    const story = qs("#kpiStory");
    if (!story) return;

    const DATA = {
      circulares: {
        chip: "Comunicación",
        label: "Circulares internas",
        value: 38,
        sub: "Alcance interno consolidado",
        prog: 0.62
      },
      aperturas: {
        chip: "Comunicación",
        label: "Aperturas registradas",
        value: 8439,
        type: "number",
        sub: "Interacción con los envíos internos",
        prog: 0.78
      },
      promedio: {
        chip: "Comunicación",
        label: "Promedio aperturas",
        value: 60.19,
        type: "percent",
        decimals: 2,
        sub: "Porcentaje medio de apertura",
        prog: 0.60
      },
      publicaciones: {
        chip: "Web",
        label: "Publicaciones web",
        value: 41,
        type: "number",
        sub: "Contenido publicado en la web",
        prog: 0.58
      },
      eventos: {
        chip: "Web",
        label: "Eventos web",
        value: 26,
        type: "number",
        sub: "Actividades y entradas online",
        prog: 0.52
      },
      empleo: {
        chip: "Web",
        label: "Ofertas de empleo",
        value: 12,
        type: "number",
        sub: "Oportunidades publicadas",
        prog: 0.44
      },
      visitas: {
        chip: "Web",
        label: "Visitas web",
        value: 12670,
        type: "number",
        sub: "Tráfico total del sitio",
        prog: 0.72
      }
    };

    const elChip = qs("#kpiChip");
    const elLabel = qs("#kpiLabel");
    const elValue = qs("#kpiValue");
    const elSub = qs("#kpiSub");
    const elBar = qs("#kpiBar");
    const elMetaR = qs("#kpiMetaR");
    const kpiCard = qs("#kpiCard");

    if (!elChip || !elLabel || !elValue || !elSub || !elBar || !elMetaR || !kpiCard) return;

    const cards = qsa(".stepCard");
    const keys = cards.map((c) => c.dataset.key).filter(Boolean);
    if (!keys.length) return;

    const formatValue = (d, v) => {
      if (d.type === "percent") {
        const dec = d.decimals ?? 2;
        return v.toFixed(dec).replace(".", ",") + "%";
      }
      return nf.format(Math.round(v));
    };

    cards.forEach((c) => {
      const h3 = qs("h3", c);
      if (!h3) return;
      let badge = qs(".stepVal", c);
      if (!badge) {
        badge = document.createElement("span");
        badge.className = "stepVal";
        h3.appendChild(badge);
      }
    });

    const easeOutExpo = (x) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x));

    const animateCounter = (from, to, d) => {
      if (prefersReduced) {
        elValue.textContent = formatValue(d, to);
        return;
      }

      const start = performance.now();
      const delta = Math.abs(to - from);
      const dur = Math.max(520, Math.min(1200, 520 + delta * 7));

      elValue.classList.add("switching");
      setTimeout(() => elValue.classList.remove("switching"), 220);

      const frame = (now) => {
        const t = Math.min(1, (now - start) / dur);
        const p = easeOutExpo(t);
        const v = from + (to - from) * p;
        elValue.textContent = formatValue(d, v);
        if (t < 1) requestAnimationFrame(frame);
      };

      requestAnimationFrame(frame);
    };

    let currentKey = keys[0];

    const setActive = (key) => {
      const d = DATA[key];
      if (!d) return;

      cards.forEach((c) => {
        const is = c.dataset.key === key;
        c.classList.toggle("is-active", is);
        const badge = qs(".stepVal", c);
        if (badge) badge.textContent = is ? ` ${formatValue(d, d.value)}` : "";
      });

      elChip.textContent = d.chip || "";
      elLabel.textContent = d.label;
      elSub.textContent = d.sub;

      const idx = keys.indexOf(key) + 1;
      elMetaR.textContent =
        String(idx).padStart(2, "0") + "/" + String(keys.length).padStart(2, "0");

      elBar.style.width = `${clamp(d.prog ?? 0.5, 0, 1) * 100}%`;

      const prev = DATA[currentKey] || d;
      animateCounter(prev.value, d.value, d);
      currentKey = key;
    };

    cards.forEach((card) => {
      card.addEventListener("click", () => {
        setActive(card.dataset.key);
      });
    });

    const io = new IntersectionObserver(
      (entries) => {
        let best = null;
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
        }
        if (best) setActive(best.target.dataset.key);
      },
      { threshold: [0.45, 0.6, 0.75] }
    );

    cards.forEach((c) => io.observe(c));

    let raf = null;

    const update3D = () => {
      raf = null;
      const rect = story.getBoundingClientRect();
      const vh = window.innerHeight;

      const total = rect.height - vh;
      const scrolled = clamp(-rect.top, 0, Math.max(total, 1));
      const p = total > 0 ? scrolled / total : 0;

      const tiltX = (p - 0.5) * 6;
      const tiltY = (0.5 - p) * 6;
      const transY = (p - 0.5) * 18;
      const gifY = (p - 0.5) * 34;
      const gifR = (p - 0.5) * 1.6;

      if (!prefersReduced) {
        kpiCard.style.transform =
          `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(${transY}px)`;
        kpiCard.style.setProperty("--parY", `${gifY.toFixed(1)}px`);
        kpiCard.style.setProperty("--parR", `${gifR.toFixed(2)}deg`);
      } else {
        kpiCard.style.transform = "";
        kpiCard.style.setProperty("--parY", "0px");
        kpiCard.style.setProperty("--parR", "0deg");
      }
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update3D);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    setActive(currentKey);
    update3D();
  })();

  /* =========================
     MAPA PREMIUM
     ========================= */
  (() => {
    const el = qs("#map");
    if (!el || !window.L) return;

    const map = L.map("map", {
      zoomControl: true,
      scrollWheelZoom: false,
      attributionControl: true
    }).setView([18, -8], 2);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap"
    }).addTo(map);

    const points = [
      {
        name: "Extremadura",
        coords: [39.0, -6.0],
        text: "Territorio base de CONGDEX, red de entidades, incidencia y ciudadanía global.",
        color: "#114632"
      },
      {
        name: "España · Redes estatales",
        coords: [40.4, -3.7],
        text: "Articulación con Coordinadora estatal y redes autonómicas.",
        color: "#239F71"
      },
      {
        name: "América Latina",
        coords: [-12.0, -77.0],
        text: "Vínculos de cooperación internacional y trabajo con organizaciones en América Latina.",
        color: "#79CFAF"
      },
      {
        name: "África",
        coords: [9.0, 8.0],
        text: "Proyección de cooperación, alianzas y trabajo internacional en África.",
        color: "#BFECDD"
      }
    ];

    const buildIcon = (color) =>
      L.divIcon({
        className: "",
        html: `
          <div style="
            width:18px;
            height:18px;
            border-radius:999px;
            background:${color};
            border:3px solid rgba(255,255,255,.96);
            box-shadow:0 8px 18px rgba(0,0,0,.18);
          "></div>
        `,
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      });

    points.forEach((p) => {
      L.marker(p.coords, { icon: buildIcon(p.color) })
        .addTo(map)
        .bindPopup(`<strong>${p.name}</strong><br>${p.text}`);
    });

    const lineStyle = {
      color: "#239F71",
      weight: 2,
      opacity: 0.45,
      dashArray: "6 8"
    };

    L.polyline([points[0].coords, points[1].coords], lineStyle).addTo(map);
    L.polyline([points[0].coords, points[2].coords], lineStyle).addTo(map);
    L.polyline([points[0].coords, points[3].coords], lineStyle).addTo(map);

    setTimeout(() => map.invalidateSize(), 250);
  })();

  /* =========================
     TIMELINE PREMIUM
     ========================= */
  (() => {
    const root = qs("#timeline");
    if (!root) return;

    const EVENTS = [
      {
        id: "1995a",
        year: "1995",
        tag: "Hito",
        title: "Constitución CONGDEX",
        desc: "Se consolida una red de ONGD en Extremadura como espacio de articulación e interlocución."
      },
      {
        id: "1995b",
        year: "1995",
        tag: "Marco",
        title: "Consejo asesor y primeras ayudas",
        desc: "Impulso inicial de las políticas autonómicas de cooperación para el desarrollo."
      },
      {
        id: "2003",
        year: "2003",
        tag: "Ley",
        title: "Ley 1/2003",
        desc: "Primera ley autonómica que consolida la cooperación para el desarrollo como política pública."
      },
      {
        id: "2006",
        year: "2006",
        tag: "Educación",
        title: "Grupo de Educación para el Desarrollo",
        desc: "Se articula un espacio específico para coordinar educación transformadora en Extremadura."
      },
      {
        id: "2008",
        year: "2008",
        tag: "Institucional",
        title: "Creación AEXCID",
        desc: "Se estructura la gestión autonómica de programas de cooperación."
      },
      {
        id: "2010",
        year: "2010",
        tag: "Incidencia",
        title: "Grupo Incidencia Política",
        desc: "Nace un espacio específico para análisis, propuesta y seguimiento político."
      },
      {
        id: "2018",
        year: "2018",
        tag: "Reconocimiento",
        title: "Premio Extremadura Global",
        desc: "Reconocimiento institucional al trabajo de CONGDEX."
      },
      {
        id: "2020",
        year: "2020",
        tag: "Género",
        title: "Grupo de Género y Feminismos",
        desc: "Se impulsa un espacio específico de reflexión y acción feminista."
      },
      {
        id: "2023",
        year: "2023",
        tag: "Ley",
        title: "Ley 3/2023",
        desc: "Nueva ley de Cooperación y Solidaridad Internacional en Extremadura."
      },
      {
        id: "2024-2028",
        year: "2024–2028",
        tag: "Estrategia",
        title: "III Planificación Estratégica",
        desc: "Nueva etapa centrada en incidencia, alianzas, comunicación y ciudadanía global."
      }
    ];

    const tlTag = qs("#tlTag");
    const tlYear = qs("#tlYear");
    const tlTitle = qs("#tlTitle");
    const tlDesc = qs("#tlDesc");
    const tlBar = qs("#tlBar");
    const tlMetaR = qs("#tlMetaR");
    const track = qs("#tlTrack");
    const trackWrap = qs("#tlTrackWrap");
    const prevBtn = qs("#tlPrevBtn");
    const nextBtn = qs("#tlNextBtn");
    const rangeHint = qs("#tlRangeHint");

    if (!track || !trackWrap || !prevBtn || !nextBtn) return;

    const years = EVENTS.map((e) => parseInt(String(e.year).split("–")[0], 10));
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    if (rangeHint) rangeHint.textContent = `Rango: ${minYear}–${maxYear}`;

    const pos01 = (ev) =>
      (parseInt(String(ev.year).split("–")[0], 10) - minYear) /
      Math.max(1, maxYear - minYear);

    const escapeHtml = (str) =>
      String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

    let activeIndex = 0;

    const animateScrollLeft = (to, dur = 520) => {
      if (prefersReduced) {
        trackWrap.scrollLeft = to;
        return;
      }

      const from = trackWrap.scrollLeft;
      const delta = to - from;
      if (Math.abs(delta) < 1) return;

      const start = performance.now();

      const tick = (now) => {
        const t = clamp((now - start) / dur, 0, 1);
        const p = 1 - Math.pow(1 - t, 3);
        trackWrap.scrollLeft = from + delta * p;
        if (t < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    };

    const getCenterScrollForNode = (nodeEl) => {
      const wrapRect = trackWrap.getBoundingClientRect();
      const nodeRect = nodeEl.getBoundingClientRect();
      const centerWrap = wrapRect.left + wrapRect.width / 2;
      const centerNode = nodeRect.left + nodeRect.width / 2;
      return trackWrap.scrollLeft + (centerNode - centerWrap);
    };

    const build = () => {
      track.style.minWidth = `${1200 + EVENTS.length * 60}px`;

      const frag = document.createDocumentFragment();

      EVENTS.forEach((ev, i) => {
        const node = document.createElement("div");
        node.className = "tl-node";
        node.dataset.index = String(i);
        node.style.left = `${pos01(ev) * 100}%`;

        const tooltip = document.createElement("div");
        tooltip.className = "tl-tooltip";
        tooltip.innerHTML = `
          <div class="tl-tYear">${escapeHtml(ev.year)}</div>
          <div class="tl-tTitle">${escapeHtml(ev.title)}</div>
          <div class="tl-tDesc">${escapeHtml(ev.desc)}</div>
        `;

        const pin = document.createElement("div");
        pin.className = "tl-pin";

        const pill = document.createElement("button");
        pill.className = "tl-pill";
        pill.type = "button";
        pill.textContent = ev.year;
        pill.setAttribute("aria-label", `${ev.year}: ${ev.title}`);
        pill.addEventListener("click", () => setActive(i, { center: true }));

        node.appendChild(tooltip);
        node.appendChild(pin);
        node.appendChild(pill);
        frag.appendChild(node);
      });

      track.appendChild(frag);
    };

    const setActive = (i, opts = { center: false }) => {
      activeIndex = ((i % EVENTS.length) + EVENTS.length) % EVENTS.length;
      const ev = EVENTS[activeIndex];

      qsa(".tl-node", track).forEach((n) => n.classList.remove("is-active"));
      const node = qs(`.tl-node[data-index="${activeIndex}"]`, track);
      if (node) node.classList.add("is-active");

      if (tlTag) tlTag.textContent = ev.tag;
      if (tlYear) tlYear.textContent = ev.year;
      if (tlTitle) tlTitle.textContent = ev.title;
      if (tlDesc) tlDesc.textContent = ev.desc;
      if (tlBar) tlBar.style.width = `${((activeIndex + 1) / EVENTS.length) * 100}%`;
      if (tlMetaR) {
        tlMetaR.textContent =
          `${String(activeIndex + 1).padStart(2, "0")}/${String(EVENTS.length).padStart(2, "0")}`;
      }

      if (opts.center && node) {
        animateScrollLeft(getCenterScrollForNode(node), 560);
      }
    };

    build();

    prevBtn.addEventListener("click", () => setActive(activeIndex - 1, { center: true }));
    nextBtn.addEventListener("click", () => setActive(activeIndex + 1, { center: true }));

    let raf = null;
    let snapTimer = null;
    let isInertia = false;

    const pickClosestIndexToCenter = () => {
      const wrapRect = trackWrap.getBoundingClientRect();
      const centerX = wrapRect.left + wrapRect.width / 2;

      let bestI = activeIndex;
      let bestDist = Infinity;

      qsa(".tl-node", track).forEach((nEl) => {
        const r = nEl.getBoundingClientRect();
        const x = r.left + r.width / 2;
        const dist = Math.abs(x - centerX);
        const idx = parseInt(nEl.dataset.index, 10);
        if (dist < bestDist) {
          bestDist = dist;
          bestI = idx;
        }
      });

      return bestI;
    };

    const snapToClosest = () => {
      const bestI = pickClosestIndexToCenter();
      const node = qs(`.tl-node[data-index="${bestI}"]`, track);
      if (node) animateScrollLeft(getCenterScrollForNode(node), 520);
    };

    const onTimelineScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const bestI = pickClosestIndexToCenter();
        if (bestI !== activeIndex) setActive(bestI, { center: false });
      });

      if (isInertia) return;

      if (snapTimer) clearTimeout(snapTimer);
      snapTimer = setTimeout(snapToClosest, 140);
    };

    trackWrap.addEventListener("scroll", onTimelineScroll, { passive: true });

    let dragging = false;
    let px = 0;
    let vx = 0;
    let rafIn = null;

    trackWrap.style.touchAction = "pan-x";

    const stepInertia = () => {
      vx *= 0.92;
      if (Math.abs(vx) < 0.15) {
        rafIn = null;
        isInertia = false;
        snapToClosest();
        return;
      }
      trackWrap.scrollLeft -= vx;
      rafIn = requestAnimationFrame(stepInertia);
    };

    trackWrap.addEventListener("pointerdown", (e) => {
      dragging = true;
      px = e.clientX;
      vx = 0;
      isInertia = true;

      if (snapTimer) clearTimeout(snapTimer);
      if (rafIn) {
        cancelAnimationFrame(rafIn);
        rafIn = null;
      }

      trackWrap.setPointerCapture(e.pointerId);
    });

    trackWrap.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - px;
      px = e.clientX;
      trackWrap.scrollLeft -= dx;
      vx = dx;
    });

    const endDrag = () => {
      dragging = false;
      if (prefersReduced) {
        isInertia = false;
        snapToClosest();
        return;
      }
      rafIn = requestAnimationFrame(stepInertia);
    };

    trackWrap.addEventListener("pointerup", endDrag);
    trackWrap.addEventListener("pointercancel", () => {
      dragging = false;
      isInertia = false;
      snapToClosest();
    });

    setActive(0, { center: true });
  })();
})();
