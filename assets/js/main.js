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
      plugins: {
        tooltip: { enabled: true }
      }
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
      const pretty = m === "seguidores" ? "Seguidores" : m === "publicaciones" ? "Publicaciones" : "Interacciones";
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
          { label: "Mujeres (%)", data: generoActividades.map((d) => d.mujeres), stack: "s", borderWidth: 0, borderRadius: 8, backgroundColor: palette.g1 },
          { label: "Hombres (%)", data: generoActividades.map((d) => d.hombres), stack: "s", borderWidth: 0, borderRadius: 8, backgroundColor: palette.g0 }
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
        datasets: [{ label: "Consultas", data: consultasTemas.map((d) => d.total), borderWidth: 0, borderRadius: 10, backgroundColor: palette.g2 }]
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
          { label: "Mujeres (%)", data: consultasTemas.map((d) => d.mujeres), stack: "g", borderWidth: 0, borderRadius: 8, backgroundColor: palette.g1 },
          { label: "Hombres (%)", data: consultasTemas.map((d) => d.hombres), stack: "g", borderWidth: 0, borderRadius: 8, backgroundColor: palette.g0 }
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
      circulares:   { chip:"Comunicaciones", label:"Circulares internas", value:38,    sub:"Alcance interno consolidado", prog:.62 },
      aperturas:    { chip:"Engagement",     label:"Aperturas registradas", value:8439, type:"number", sub:"Interacción con envíos internos", prog:.78 },
      promedio:     { chip:"Engagement",     label:"Promedio aperturas", value:60.19, type:"percent", decimals:2, sub:"Porcentaje medio de apertura", prog:.60 },
      publicaciones:{ chip:"Contenido",      label:"Publicaciones web", value:41,     type:"number", sub:"Contenido publicado", prog:.58 },
      eventos:      { chip:"Activaciones",   label:"Eventos web", value:26,           type:"number", sub:"Actividades y entradas online", prog:.52 },
      empleo:       { chip:"Talento",        label:"Ofertas de empleo", value:12,     type:"number", sub:"Oportunidades publicadas", prog:.44 },
      visitas:      { chip:"Tráfico",        label:"Visitas web", value:12670,       type:"number", sub:"Tráfico total del sitio", prog:.72 }
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

    cards.forEach((card) => {
      card.addEventListener("click", () => {
        setActive(card.dataset.key);
        card.scrollIntoView({ behavior: "smooth", block: "center" });
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
