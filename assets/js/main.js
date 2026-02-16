(() => {
  const prefersReduced =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const reveals = document.querySelectorAll(".reveal");
  if (reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible"));
    });
    reveals.forEach((r) => io.observe(r));
  }

  const progressBar = document.getElementById("progressBar");
  const back = document.getElementById("backTop");

  const onScrollGlobal = () => {
    const h = document.documentElement;
    const denom = h.scrollHeight - h.clientHeight;
    const p = denom > 0 ? h.scrollTop / denom : 0;
    if (progressBar) progressBar.style.width = p * 100 + "%";
    if (back) back.style.display = window.scrollY > 500 ? "block" : "none";
  };

  window.addEventListener("scroll", onScrollGlobal, { passive: true });
  onScrollGlobal();

  if (back) back.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });

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
    Chart.defaults.animation.duration = prefersReduced ? 0 : 700;
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

    new Chart(document.getElementById("chartGenero"), {
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
          x: { min: 0, max: 100, ticks: { callback

