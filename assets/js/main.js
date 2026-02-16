(() => {
  const reveals = document.querySelectorAll(".reveal");
  if (reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("visible");
      });
    });
    reveals.forEach((r) => io.observe(r));
  }

  const progressBar = document.getElementById("progressBar");
  const back = document.getElementById("backTop");

  const onScrollGlobal = () => {
    const h = document.documentElement;
    const p = h.scrollTop / (h.scrollHeight - h.clientHeight);
    if (progressBar) progressBar.style.width = p * 100 + "%";
    if (back) back.style.display = window.scrollY > 500 ? "block" : "none";
  };

  window.addEventListener("scroll", onScrollGlobal, { passive: true });
  onScrollGlobal();

  if (back) {
    back.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
  }

  document.querySelectorAll("[data-count]").forEach((el) => {
    let done = false;
    new IntersectionObserver((e) => {
      if (done) return;
      if (e[0].isIntersecting) {
        done = true;
        const t = Number(el.dataset.count);
        let n = 0;
        const steps = 30;
        const inc = t / steps;
        const i = setInterval(() => {
          n += inc;
          if (n >= t) {
            n = t;
            clearInterval(i);
          }
          el.textContent = Math.floor(n).toLocaleString("es-ES");
        }, 20);
      }
    }).observe(el);
  });

  document.querySelectorAll(".barFill").forEach((bar) => {
    new IntersectionObserver((e) => {
      if (e[0].isIntersecting) {
        bar.style.transition = "transform .7s";
        bar.style.transform = "scaleX(" + bar.dataset.value / 100 + ")";
      }
    }).observe(bar);
  });

  const zoomSections = [...document.querySelectorAll("[data-zoom]")];
  let rafZoom = null;

  const applyZoom = () => {
    rafZoom = null;
    const vh = window.innerHeight;

    zoomSections.forEach((sec) => {
      const rect = sec.getBoundingClientRect();
      const media =
        sec.querySelector(".hero__img") ||
        sec.querySelector(".impact__img") ||
        sec.querySelector(".zoomMedia");

      if (!media) return;

      const start = vh;
      const end = -rect.height;
      const t = (rect.top - end) / (start - end);
      const p = Math.min(1, Math.max(0, 1 - t));

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

  const hasCharts =
    document.getElementById("chartReuniones") &&
    document.getElementById("chartRedes") &&
    document.getElementById("chartGenero") &&
    document.getElementById("chartConsultasTemas") &&
    document.getElementById("chartConsultasGenero");

  const palette = {
    g0: "#114632",
    g1: "#239F71",
    g2: "#79CFAF",
    g3: "#BFECDD",
    g4: "#E8FBF3",
    dark: "#101010"
  };

  if (hasCharts && window.Chart) {
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

    const pct = (n) => (Math.round(n * 100) / 100).toLocaleString("es-ES") + "%";
    const num = (n) => Number(n).toLocaleString("es-ES");

    Chart.defaults.font.family = "system-ui, -apple-system, Segoe UI, Roboto, Arial";
    Chart.defaults.animation.duration = 700;
    Chart.defaults.plugins.legend.labels.boxWidth = 10;
    Chart.defaults.responsive = true;

    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "nearest", intersect: true },
      hover: { mode: "nearest", intersect: true },
      plugins: { tooltip: { enabled: true } }
    };

    const reunionesChart = new Chart(document.getElementById("chartReuniones"), {
      type: "doughnut",
      data: {
        labels: reuniones.map((d) => d.label),
        datasets: [
          {
            data: reuniones.map((d) => d.value),
            backgroundColor: [palette.g1, palette.g2, palette.g3, palette.g0, palette.g4],
            borderWidth: 0,
            hoverOffset: 8,
            cutout: "62%"
          }
        ]
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

    const redesChart = new Chart(document.getElementById("chartRedes"), {
      type: "bar",
      data: {
        labels: redes.labels,
        datasets: [
          {
            label: "Seguidores",
            data: redes.seguidores,
            backgroundColor: palette.g1,
            borderWidth: 0,
            borderRadius: 10
          }
        ]
      },
      options: {
        ...commonOptions,
        scales: { y: { beginAtZero: true } },
        plugins: {
          ...commonOptions.plugins,
          tooltip: { callbacks: { label: (item) => ` ${item.dataset.label}: ${num(item.raw)}` } }
        }
      }
    });

    const updateRedes = (m) => {
      const pretty =
        m === "seguidores" ? "Seguidores" : m === "publicaciones" ? "Publicaciones" : "Interacciones";
      redesChart.data.datasets[0].label = pretty;
      redesChart.data.datasets[0].data = redes[m];
      redesChart.update();
    };

    document.querySelectorAll(".tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".tab").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        updateRedes(btn.dataset.m);
      });
    });

    const generoChart = new Chart(document.getElementById("chartGenero"), {
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
          x: { min: 0, max: 100, ticks: { callback: (v) => v + "%" } },
          y: { ticks: { autoSkip: false } }
        },
        plugins: {
          ...commonOptions.plugins,
          tooltip: { callbacks: { label: (item) => ` ${item.dataset.label}: ${pct(item.raw)}` } }
        }
      }
    });

    const consultasTemasChart = new Chart(document.getElementById("chartConsultasTemas"), {
      type: "bar",
      data: {
        labels: consultasTemas.map((d) => d.label),
        datasets: [
          {
            label: "Consultas",
            data: consultasTemas.map((d) => d.total),
            borderWidth: 0,
            borderRadius: 10,
            backgroundColor: palette.g2
          }
        ]
      },
      options: {
        ...commonOptions,
        indexAxis: "y",
        scales: { x: { beginAtZero: true } },
        plugins: {
          ...commonOptions.plugins,
          tooltip: { callbacks: { label: (item) => ` ${item.dataset.label}: ${num(item.raw)}` } }
        }
      }
    });

    const consultasGeneroChart = new Chart(document.getElementById("chartConsultasGenero"), {
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
          x: { min: 0, max: 100, ticks: { callback: (v) => v + "%" } },
          y: { ticks: { autoSkip: false } }
        },
        plugins: {
          ...commonOptions.plugins,
          tooltip: { callbacks: { label: (item) => ` ${item.dataset.label}: ${pct(item.raw)}` } }
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

    document.querySelectorAll("[data-dl]").forEach((btn) => {
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

  (() => {
    const story = document.getElementById("kpiStory");
    if (!story) return;

    const DATA = {
      circulares: { chip: "Métricas web", label: "Circulares internas", value: 38, sub: "Alcance interno consolidado", prog: 0.62 },
      aperturas: { chip: "Métricas web", label: "Aperturas registradas", value: 8439, type: "number", sub: "Interacción con envíos internos", prog: 0.78 },
      promedio: { chip: "Métricas web", label: "Promedio aperturas", value: 60.19, type: "percent", decimals: 2, sub: "Porcentaje medio de apertura", prog: 0.6 },
      publicaciones: { chip: "Métricas web", label: "Publicaciones web", value: 41, type: "number", sub: "Contenido publicado", prog: 0.58 },
      eventos: { chip: "Métricas web", label: "Eventos web", value: 26, type: "number", sub: "Actividades y entradas online", prog: 0.52 },
      empleo: { chip: "Métricas web", label: "Ofertas de empleo", value: 12, type: "number", sub: "Oportunidades publicadas", prog: 0.44 },
      visitas: { chip: "Métricas web", label: "Visitas web", value: 12670, type: "number", sub: "Tráfico total del sitio", prog: 0.72 }
    };

    const elChip = document.getElementById("kpiChip");
    const elLabel = document.getElementById("kpiLabel");
    const elValue = document.getElementById("kpiValue");
    const elSub = document.getElementById("kpiSub");
    const elBar = document.getElementById("kpiBar");
    const elMetaR = document.getElementById("kpiMetaR");
    const kpiCard = document.getElementById("kpiCard");

    if (!elChip || !elLabel || !elValue || !elSub || !elBar || !elMetaR || !kpiCard) return;

    const cards = [...document.querySelectorAll(".stepCard")];
    const keys = cards.map((c) => c.dataset.key).filter(Boolean);
    if (!keys.length) return;

    const nf = new Intl.NumberFormat("es-ES");

    const formatValue = (d, v) => {
      if (d.type === "percent") {
        const dec = d.decimals ?? 2;
        return v.toFixed(dec).replace(".", ",") + "%";
      }
      return nf.format(Math.round(v));
    };

    const easeOutExpo = (x) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x));

    const animateCounter = (from, to, d) => {
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

      cards.forEach((c) => c.classList.toggle("is-active", c.dataset.key === key));

      elChip.textContent = d.chip ?? "Resumen";
      elLabel.textContent = d.label;
      elSub.textContent = d.sub;

      const idx = keys.indexOf(key) + 1;
      elMetaR.textContent = String(idx).padStart(2, "0") + "/" + String(keys.length).padStart(2, "0");

      const prog = Math.max(0, Math.min(1, d.prog ?? 0.5));
      elBar.style.width = (prog * 100).toFixed(0) + "%";

      const prev = DATA[currentKey] || d;
      animateCounter(prev.value, d.value, d);

      currentKey = key;
    };

    const scrollToStep = (stepEl) => {
      const topOffset = 110;
      const storyRect = story.getBoundingClientRect();
      const storyTop = window.scrollY + storyRect.top;
      const storyBottom = storyTop + storyRect.height;

      const y = window.scrollY + stepEl.getBoundingClientRect().top - topOffset;
      const target = Math.min(Math.max(y, storyTop + 8), storyBottom - window.innerHeight + 8);

      window.scrollTo({ top: target, behavior: "smooth" });
    };

    cards.forEach((card) => {
      card.addEventListener("click", () => {
        const key = card.dataset.key;
        setActive(key);
        scrollToStep(card);
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
      const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
      const p = total > 0 ? scrolled / total : 0;

      const tiltX = (p - 0.5) * 6;
      const tiltY = (0.5 - p) * 6;
      const transY = (p - 0.5) * 18;

      const gifY = (p - 0.5) * 34;
      const gifR = (p - 0.5) * 1.6;

      kpiCard.style.transform = `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(${transY}px)`;
      kpiCard.style.setProperty("--parY", `${gifY.toFixed(1)}px`);
      kpiCard.style.setProperty("--parR", `${gifR.toFixed(2)}deg`);
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
})();

(() => {
  const root = document.getElementById("timeline");
  if (!root) return;

  const EVENTS = [
    { id:"1995a", year:"1995", tag:"Hito", title:"Constitución CONGDEX",
      desc:"Se consolida una red de ONGD en Extremadura, referencia para la interlocución con actores e instituciones políticas extremeñas para la defensa de las políticas de cooperación para el desarrollo." },
    { id:"1995b", year:"1995", tag:"Marco", title:"Decreto ayudas tercer mundo · Consejo asesor cooperación",
      desc:"CONGDEX impulsa primeras ayudas autonómicas para financiar proyectos de cooperación para el desarrollo.\nParticipa en el Consejo Asesor de Cooperación al Desarrollo (vocalías ocupadas por ONGD miembros)." },
    { id:"2003", year:"2003", tag:"Ley", title:"Aprobación Ley 1/2003 (27 feb)",
      desc:"CONGDEX participa en la construcción de la primera ley autonómica que consolida la cooperación para el desarrollo como política pública autonómica con rango legal.\nDefine principios, prioridades y áreas preferentes." },
    { id:"2004-2007", year:"2004–2007", tag:"Plan", title:"Plan General Cooperación Extremeña 2004–2008",
      desc:"CONGDEX participa en la elaboración del primer plan general de cooperación.\nPrioridades: lucha contra la pobreza, promoción de derechos humanos, igualdad de género, sostenibilidad ambiental y coherencia de políticas.\nImpulsa participación activa de sociedad civil." },
    { id:"2006", year:"2006", tag:"Educación", title:"Grupo Educación para el Desarrollo",
      desc:"ONGD de CONGDEX crean el grupo de educación para el desarrollo para coordinar acciones en materia de educación en Extremadura (encuentros, formaciones, campañas de comunicación y sensibilización)." },
    { id:"2007", year:"2007", tag:"Campaña", title:"Campaña Pobreza Cero",
      desc:"Primera vez que se ejecuta en Extremadura la campaña anual a nivel estatal y global impulsada por la sociedad civil para erradicar la pobreza y la desigualdad." },
    { id:"2008a", year:"2008", tag:"Institucional", title:"Creación AEXCID",
      desc:"Se institucionaliza desde la Junta de Extremadura la gestión de programas de cooperación, con competencias, coordinación con ONGD, agentes sociales, etc.\nImportante para profesionalizar y estructurar la cooperación." },
    { id:"2008-2011", year:"2008–2011", tag:"Plan", title:"Plan General Cooperación Extremeña 2008–2011",
      desc:"CONGDEX participa en la elaboración del plan general.\nPrioridades: lucha contra la pobreza, defensa de derechos humanos, equidad de género, protección del medio ambiente, entre otras." },
    { id:"2008b", year:"2008", tag:"Red", title:"Ingreso en Coordinadora Estatal y Red CCAA",
      desc:"CONGDEX pasa a formar parte del nivel estatal para el fortalecimiento del trabajo en alianza con la Coordinadora Estatal de ONGD y coordinadoras autonómicas.\nDefensa de políticas de cooperación." },
    { id:"2010a", year:"2010", tag:"Incidencia", title:"Grupo Incidencia Política",
      desc:"ONGD de CONGDEX crean el grupo de incidencia política para participar del debate, análisis y propuestas de mejora de políticas de cooperación y seguimiento de la ayuda oficial para el desarrollo (encuentros, formaciones, informes, campañas)." },
    { id:"2010b", year:"2010", tag:"Local", title:"Ingreso en Consejos Locales de Cooperación",
      desc:"CONGDEX ocupa una vocalía en el Consejo Local de Cooperación de Badajoz y Cáceres para seguimiento y mejora de la política de cooperación municipal." },
    { id:"2012-2016", year:"2012–2016", tag:"Estrategia", title:"I Planificación Estratégica CONGDEX 2012–2016",
      desc:"CONGDEX establece líneas prioritarias, el fortalecimiento interno de la red, el fortalecimiento del trabajo en alianza con otras redes y la mejora de la incidencia social y política." },
    { id:"2013", year:"2013", tag:"Encuentro", title:"XI Encuentro anual de Coordinadoras Autonómicas de ONGD",
      desc:"CONGDEX organiza este encuentro anual de 17 coordinadoras autonómicas y Coordinadora Estatal para dar seguimiento a políticas de cooperación del territorio español." },
    { id:"2014-2017", year:"2014–2017", tag:"Plan", title:"Plan General Cooperación Extremeña 2014–2017",
      desc:"CONGDEX participa en la elaboración del plan general, proponiendo mejoras en gestión, agilidad administrativa, transparencia, mayor impacto en beneficiarios y mejora de calidad de vida." },
    { id:"2016", year:"2016", tag:"Grupo", title:"Grupo Movilidad Humana",
      desc:"ONGD de CONGDEX crean el grupo de movilidad humana para acciones conjuntas en defensa de derechos de personas migrantes y refugiadas (formaciones, campañas de comunicación y sensibilización)." },
    { id:"2018a", year:"2018", tag:"Reconocimiento", title:"Premio Extremadura Global",
      desc:"Reconocimiento de la Junta de Extremadura a CONGDEX por su trabajo a favor de la solidaridad, la justicia social, la educación para la ciudadanía global y la defensa de los derechos humanos." },
    { id:"2018-2021", year:"2018–2021", tag:"Plan", title:"Plan General Cooperación Extremeña 2018–2021",
      desc:"CONGDEX participa en la elaboración del plan general y afianza ámbitos estratégicos: normativa, instrumentos de gestión, diálogo entre actores y criterios prioritarios." },
    { id:"2019-2022", year:"2019–2022", tag:"Estrategia", title:"II Planificación Estratégica CONGDEX 2019–2022",
      desc:"CONGDEX refuerza líneas prioritarias basadas en el fortalecimiento interno de la red, las causas globales y el trabajo en alianza, la incidencia y coherencia de políticas y la transformación social." },
    { id:"2019", year:"2019", tag:"Grupo", title:"Grupo Voluntariado",
      desc:"ONGD de CONGDEX crean el grupo de voluntariado para el fomento del voluntariado transformador y el fortalecimiento de políticas de mejora del voluntariado en Extremadura (formaciones, campañas)." },
    { id:"2020", year:"2020", tag:"Género", title:"Grupo de Género y Feminismos",
      desc:"ONGD de CONGDEX crean el grupo con el objetivo de realizar acciones conjuntas hacia una CONGDEX feminista (estudios, diagnósticos, campañas de comunicación)." },
    { id:"2023", year:"2023", tag:"Ley", title:"Ley 3/2023 (29 marzo) Cooperación y Solidaridad Internacional",
      desc:"CONGDEX acompaña el proceso de elaboración de esta nueva ley (sustituye a la de 2003). Introduce compromisos y objetivos en cooperación internacional." },
    { id:"2024-2028", year:"2024–2028", tag:"Estrategia", title:"III Planificación Estratégica CONGDEX 2024–2028",
      desc:"CONGDEX establece nuevas líneas prioritarias en desarrollo interno, alianzas y relaciones, incidencia, comunicación interna/externa y ciudadanía global." }
  ];

  const $ = (sel, r = root) => r.querySelector(sel);

  const tlTag = $("#tlTag");
  const tlYear = $("#tlYear");
  const tlTitle = $("#tlTitle");
  const tlDesc = $("#tlDesc");

  const tlBar = $("#tlBar");
  const tlMetaR = $("#tlMetaR");

  const track = $("#tlTrack");
  const trackWrap = $("#tlTrackWrap");
  const prevBtn = $("#tlPrevBtn");
  const nextBtn = $("#tlNextBtn");
  const rangeHint = $("#tlRangeHint");

  const startYearOf = (ev) => parseInt(String(ev.year).split("–")[0], 10);
  const endYearOf = (ev) => {
    const s = String(ev.year);
    const parts = s.split("–");
    return parts.length > 1 ? parseInt(parts[1], 10) : parseInt(parts[0], 10);
  };

  const yearsStart = EVENTS.map(startYearOf);
  const minYear = Math.min(...yearsStart);
  const maxYear = Math.max(...EVENTS.map(endYearOf));

  rangeHint.textContent = `Rango: ${minYear}–${maxYear}`;

  const pos01 = (ev) => (startYearOf(ev) - minYear) / (maxYear - minYear);

  const escapeHtml = (str) =>
    String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  function renderNodes() {
    const frag = document.createDocumentFragment();

    EVENTS.forEach((ev, i) => {
      const node = document.createElement("div");
      node.className = "tl-node";
      node.dataset.id = ev.id;
      node.dataset.index = String(i);

      node.style.left = pos01(ev) * 100 + "%";

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
  }

  let activeIndex = 0;

  function setActive(i, opts = { center: false }) {
    activeIndex = Math.max(0, Math.min(EVENTS.length - 1, i));
    const ev = EVENTS[activeIndex];

    track.querySelectorAll(".tl-node").forEach((n) => n.classList.remove("is-active"));
    const node = track.querySelector(`.tl-node[data-index="${activeIndex}"]`);
    if (node) node.classList.add("is-active");

    tlTag.textContent = ev.tag || "Hito";
    tlYear.textContent = ev.year;
    tlTitle.textContent = ev.title;
    tlDesc.textContent = ev.desc;

    const prog = ((activeIndex + 1) / EVENTS.length) * 100;
    tlBar.style.width = prog.toFixed(0) + "%";
    tlMetaR.textContent = String(activeIndex + 1).padStart(2, "0") + "/" + String(EVENTS.length).padStart(2, "0");

    history.replaceState(null, "", "#" + ev.id);

    if (opts.center && node) {
      const wrapRect = trackWrap.getBoundingClientRect();
      const nodeRect = node.getBoundingClientRect();
      const current = trackWrap.scrollLeft;
      const delta = nodeRect.left + nodeRect.width / 2 - (wrapRect.left + wrapRect.width / 2);
      trackWrap.scrollLeft = current + delta;
    }
  }

  prevBtn.addEventListener("click", () => setActive(activeIndex - 1, { center: true }));
  nextBtn.addEventListener("click", () => setActive(activeIndex + 1, { center: true }));

  let raf = null;
  trackWrap.addEventListener(
    "scroll",
    () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;

        const wrapRect = trackWrap.getBoundingClientRect();
        const centerX = wrapRect.left + wrapRect.width / 2;

        let bestI = activeIndex;
        let bestDist = Infinity;

        track.querySelectorAll(".tl-node").forEach((n) => {
          const r = n.getBoundingClientRect();
          const x = r.left + r.width / 2;
          const dist = Math.abs(x - centerX);
          const idx = parseInt(n.dataset.index, 10);
          if (dist < bestDist) {
            bestDist = dist;
            bestI = idx;
          }
        });

        if (bestI !== activeIndex) setActive(bestI, { center: false });
      });
    },
    { passive: true }
  );

  renderNodes();

  const hash = (location.hash || "").replace("#", "");
  const idx = hash ? EVENTS.findIndex((e) => e.id === hash) : 0;
  setActive(idx >= 0 ? idx : 0, { center: true });
})();

(() => {
  const el = document.getElementById("timeline");
  if (!el) return;

  let raf = null;

  const update = () => {
    raf = null;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;

    const visible = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
    const z = 1 + visible * 0.08;
    const y = (0.5 - visible) * 22;

    el.style.setProperty("--tlZoom", z.toFixed(3));
    el.style.setProperty("--tlY", `${y.toFixed(1)}px`);
  };

  const onScroll = () => {
    if (raf) return;
    raf = requestAnimationFrame(update);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
})();
