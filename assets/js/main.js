const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
function pctES(n) { return (Math.round(n * 100) / 100).toLocaleString("es-ES") + "%"; }
function numES(n) { return Number(n).toLocaleString("es-ES"); }
function getCSSVar(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

const reveals = document.querySelectorAll(".reveal");
if (reveals.length) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add("visible"); });
  });
  reveals.forEach(el => io.observe(el));
}

const progressBar = document.getElementById("progressBar");
if (progressBar) {
  window.addEventListener("scroll", () => {
    const h = document.documentElement;
    const p = h.scrollTop / (h.scrollHeight - h.clientHeight);
    progressBar.style.width = (p * 100) + "%";
  }, { passive: true });
}

document.querySelectorAll("[data-count]").forEach(el => {
  let done = false;
  const obs = new IntersectionObserver(entries => {
    if (done) return;
    if (entries[0].isIntersecting) {
      done = true;
      const target = Number(el.dataset.count);
      let n = 0;
      const interval = setInterval(() => {
        n += target / 30;
        if (n >= target) { n = target; clearInterval(interval); }
        el.textContent = Math.floor(n).toLocaleString("es-ES");
      }, 20);
    }
  });
  obs.observe(el);
});

document.querySelectorAll(".barFill").forEach(bar => {
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      bar.style.transition = "transform .8s cubic-bezier(.2,.8,.2,1)";
      bar.style.transform = "scaleX(" + (bar.dataset.value / 100) + ")";
    }
  });
  obs.observe(bar);
});

const backTop = document.getElementById("backTop");
if (backTop) {
  window.addEventListener("scroll", () => {
    backTop.style.display = window.scrollY > 500 ? "block" : "none";
  }, { passive: true });

  backTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

const hero = document.getElementById("hero");
let heroY = 0, heroS = 1, heroDim = 0;
let heroTicking = false;

function setHeroVars(y, s, dim) {
  document.documentElement.style.setProperty("--heroY", `${y}px`);
  document.documentElement.style.setProperty("--heroS", `${s}`);
  document.documentElement.style.setProperty("--heroDim", `${dim}`);
}

function computeHeroTargets() {
  if (!hero) return null;
  const rect = hero.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  if (rect.bottom <= 0 || rect.top >= vh) return null;

  const heroH = hero.offsetHeight || 1;
  const scrolled = clamp(-rect.top, 0, heroH);
  const t = clamp(scrolled / heroH, 0, 1);

  return { y: scrolled * 0.30, s: 1 + (t * 0.10), dim: t };
}

function animateHero() {
  heroTicking = false;
  if (!hero || prefersReduced) return;

  const tgt = computeHeroTargets();
  if (!tgt) return;

  const ease = 0.10;
  heroY += (tgt.y - heroY) * ease;
  heroS += (tgt.s - heroS) * ease;
  heroDim += (tgt.dim - heroDim) * ease;

  setHeroVars(heroY, heroS, heroDim);

  if (Math.abs(tgt.y - heroY) > 0.1 || Math.abs(tgt.s - heroS) > 0.0005 || Math.abs(tgt.dim - heroDim) > 0.002) {
    requestAnimationFrame(animateHero);
  }
}

function requestHeroTick() {
  if (heroTicking) return;
  heroTicking = true;
  requestAnimationFrame(animateHero);
}

if (hero && !prefersReduced) {
  setHeroVars(0, 1, 0);
  window.addEventListener("scroll", requestHeroTick, { passive: true });
  window.addEventListener("resize", requestHeroTick);
  requestHeroTick();
}

(() => {
  const elReuniones = document.getElementById("chartReuniones");
  const elRedes = document.getElementById("chartRedes");
  const elGenero = document.getElementById("chartGenero");
  const elTemas = document.getElementById("chartConsultasTemas");
  const elCG = document.getElementById("chartConsultasGenero");

  const hasCharts = elReuniones && elRedes && elGenero && elTemas && elCG;
  if (!hasCharts || !window.Chart) return;

  const COLORS = {
    dark: "#114632",
    accent: getCSSVar("--accent", "#239F71"),
    mid: "#73B09A",
    light: "#ADDDCB",
    slate: "#4D6B60",
    mint: "#E3FCF5",
    men: "rgba(17,70,50,.22)",
    grid: "rgba(0,0,0,.08)"
  };

  const reuniones = [
    { label: "JD / Grupos de trabajo", value: 11 },
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

  Chart.defaults.font.family = "system-ui, -apple-system, Segoe UI, Roboto, Arial";
  Chart.defaults.animation.duration = prefersReduced ? 0 : 900;
  Chart.defaults.color = COLORS.dark;
  Chart.defaults.borderColor = COLORS.grid;
  Chart.defaults.plugins.legend.labels.boxWidth = 10;
  Chart.defaults.plugins.legend.labels.color = COLORS.dark;
  Chart.defaults.plugins.tooltip.padding = 10;
  Chart.defaults.plugins.tooltip.cornerRadius = 10;
  Chart.defaults.plugins.tooltip.displayColors = true;
  Chart.defaults.plugins.tooltip.boxPadding = 4;

  const centerTextPlugin = {
    id: "centerText",
    afterDraw(chart, args, opts) {
      if (!opts || !opts.lines || chart.config.type !== "doughnut") return;
      const { ctx } = chart;
      const meta = chart.getDatasetMeta(0);
      if (!meta || !meta.data || !meta.data.length) return;
      const x = meta.data[0].x;
      const y = meta.data[0].y;

      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const base = Math.min(chart.width, chart.height);
      const titleSize = Math.max(12, Math.round(base * 0.05));
      const valueSize = Math.max(18, Math.round(base * 0.085));

      const [l1, l2] = opts.lines;

      ctx.fillStyle = COLORS.slate;
      ctx.font = `600 ${titleSize}px system-ui, -apple-system, Segoe UI, Roboto, Arial`;
      ctx.fillText(l1, x, y - valueSize * 0.45);

      ctx.fillStyle = COLORS.dark;
      ctx.font = `800 ${valueSize}px system-ui, -apple-system, Segoe UI, Roboto, Arial`;
      ctx.fillText(l2, x, y + valueSize * 0.15);

      ctx.restore();
    }
  };

  function verticalGradient(ctx, area, topHex, bottomHex) {
    const g = ctx.createLinearGradient(0, area.top, 0, area.bottom);
    g.addColorStop(0, topHex);
    g.addColorStop(1, bottomHex);
    return g;
  }

  function barGradient(chart, top, bottom) {
    const { ctx, chartArea } = chart;
    if (!chartArea) return top;
    return verticalGradient(ctx, chartArea, top, bottom);
  }

  const charts = {};

  const totalReuniones = reuniones.reduce((a, b) => a + b.value, 0);

  charts.chartReuniones = new Chart(elReuniones, {
    type: "doughnut",
    plugins: [centerTextPlugin],
    data: {
      labels: reuniones.map(d => d.label),
      datasets: [{
        data: reuniones.map(d => d.value),
        backgroundColor: [COLORS.accent, COLORS.mid, COLORS.light, COLORS.slate, COLORS.mint],
        borderWidth: 0,
        hoverOffset: 12,
        cutout: "64%"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { position: "bottom" },
        centerText: { lines: ["Total", numES(totalReuniones)] },
        tooltip: {
          callbacks: {
            label: (item) => {
              const v = item.raw;
              const p = (v / totalReuniones) * 100;
              return ` ${item.label}: ${numES(v)} (${pctES(p)})`;
            }
          }
        }
      },
      onHover: (e, active) => { e.native.target.style.cursor = active.length ? "pointer" : "default"; }
    }
  });

  elReuniones.addEventListener("click", (evt) => {
    const chart = charts.chartReuniones;
    const elements = chart.getElementsAtEventForMode(evt, "nearest", { intersect: true }, true);
    if (!elements.length) return;
    const i = elements[0].index;
    chart.toggleDataVisibility(i);
    chart.update();
  });

  charts.chartRedes = new Chart(elRedes, {
    type: "bar",
    data: {
      labels: redes.labels,
      datasets: [{
        label: "Seguidores",
        data: redes.seguidores,
        borderWidth: 0,
        borderRadius: 10,
        backgroundColor: (ctx) => barGradient(ctx.chart, COLORS.accent, COLORS.light)
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (item) => ` ${item.dataset.label}: ${numES(item.raw)}` } }
      },
      scales: {
        y: { beginAtZero: true, grid: { color: COLORS.grid } },
        x: { grid: { display: false } }
      },
      onHover: (e, active) => { e.native.target.style.cursor = active.length ? "pointer" : "default"; }
    }
  });

  function updateRedes(metric) {
    const chart = charts.chartRedes;
    const pretty = metric === "seguidores" ? "Seguidores" : metric === "publicaciones" ? "Publicaciones" : "Interacciones";
    chart.data.datasets[0].label = pretty;
    chart.data.datasets[0].data = redes[metric];

    const top = metric === "seguidores" ? COLORS.accent : metric === "publicaciones" ? COLORS.mid : COLORS.slate;
    const bottom = metric === "seguidores" ? COLORS.light : metric === "publicaciones" ? COLORS.mint : COLORS.light;
    chart.data.datasets[0].backgroundColor = (ctx) => barGradient(ctx.chart, top, bottom);

    chart.update();
  }

  const tabs = Array.from(document.querySelectorAll(".tab"));
  function setActiveTab(btn) {
    tabs.forEach(t => {
      const active = t === btn;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-selected", active ? "true" : "false");
      t.tabIndex = active ? 0 : -1;
    });
    updateRedes(btn.dataset.m);
  }

  tabs.forEach(btn => {
    btn.addEventListener("click", () => setActiveTab(btn));
    btn.addEventListener("keydown", (e) => {
      const i = tabs.indexOf(btn);
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const next = e.key === "ArrowRight" ? (i + 1) % tabs.length : (i - 1 + tabs.length) % tabs.length;
        tabs[next].focus();
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setActiveTab(btn);
      }
    });
  });

  charts.chartGenero = new Chart(elGenero, {
    type: "bar",
    data: {
      labels: generoActividades.map(d => d.label),
      datasets: [
        { label: "Mujeres (%)", data: generoActividades.map(d => d.mujeres), stack: "s", borderWidth: 0, borderRadius: 8, backgroundColor: (ctx) => barGradient(ctx.chart, COLORS.accent, COLORS.light) },
        { label: "Hombres (%)", data: generoActividades.map(d => d.hombres), stack: "s", borderWidth: 0, borderRadius: 8, backgroundColor: COLORS.men }
      ]
    },
    options: {
      responsive: true,
      indexAxis: "y",
      plugins: { legend: { position: "bottom" }, tooltip: { callbacks: { label: (item) => ` ${item.dataset.label}: ${pctES(item.raw)}` } } },
      scales: {
        x: { min: 0, max: 100, ticks: { callback: (v) => v + "%" }, grid: { color: COLORS.grid } },
        y: { ticks: { autoSkip: false }, grid: { display: false } }
      },
      onHover: (e, active) => { e.native.target.style.cursor = active.length ? "pointer" : "default"; }
    }
  });

  charts.chartConsultasTemas = new Chart(elTemas, {
    type: "bar",
    data: {
      labels: consultasTemas.map(d => d.label),
      datasets: [{ label: "Consultas", data: consultasTemas.map(d => d.total), borderWidth: 0, borderRadius: 10, backgroundColor: (ctx) => barGradient(ctx.chart, COLORS.mid, COLORS.mint) }]
    },
    options: {
      responsive: true,
      indexAxis: "y",
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (item) => ` ${item.dataset.label}: ${numES(item.raw)}` } } },
      scales: { x: { beginAtZero: true, grid: { color: COLORS.grid } }, y: { grid: { display: false } } },
      onHover: (e, active) => { e.native.target.style.cursor = active.length ? "pointer" : "default"; }
    }
  });

  charts.chartConsultasGenero = new Chart(elCG, {
    type: "bar",
    data: {
      labels: consultasTemas.map(d => d.label),
      datasets: [
        { label: "Mujeres (%)", data: consultasTemas.map(d => d.mujeres), stack: "g", borderWidth: 0, borderRadius: 8, backgroundColor: (ctx) => barGradient(ctx.chart, COLORS.accent, COLORS.light) },
        { label: "Hombres (%)", data: consultasTemas.map(d => d.hombres), stack: "g", borderWidth: 0, borderRadius: 8, backgroundColor: COLORS.men }
      ]
    },
    options: {
      responsive: true,
      indexAxis: "y",
      plugins: { legend: { position: "bottom" }, tooltip: { callbacks: { label: (item) => ` ${item.dataset.label}: ${pctES(item.raw)}` } } },
      scales: {
        x: { min: 0, max: 100, ticks: { callback: (v) => v + "%" }, grid: { color: COLORS.grid } },
        y: { ticks: { autoSkip: false }, grid: { display: false } }
      },
      onHover: (e, active) => { e.native.target.style.cursor = active.length ? "pointer" : "default"; }
    }
  });

  function downloadChart(chartKey) {
    const chart = charts[chartKey];
    if (!chart) return;
    const a = document.createElement("a");
    a.href = chart.toBase64Image("image/png", 1);
    a.download = `${chartKey}.png`;
    a.click();
  }

  function resetChart(chartKey) {
    const chart = charts[chartKey];
    if (!chart) return;
    if (chart.config.type === "doughnut") {
      const n = chart.data.labels.length;
      for (let i = 0; i < n; i++) chart.setDataVisibility(i, true);
    }
    chart.reset();
    chart.update();
  }

  document.querySelectorAll("[data-dl]").forEach(btn => {
    btn.addEventListener("click", () => downloadChart(btn.dataset.dl));
  });

  document.querySelectorAll("[data-reset]").forEach(btn => {
    btn.addEventListener("click", () => resetChart(btn.dataset.reset));
  });

  let resizeTO = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTO);
    resizeTO = setTimeout(() => {
      Object.values(charts).forEach(c => c.update());
    }, 150);
  });
})();
