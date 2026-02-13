const reveals = document.querySelectorAll(".reveal");

if (reveals.length) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
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
        if (n >= target) {
          n = target;
          clearInterval(interval);
        }
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
const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let currentY = 0;
let currentS = 1;
let currentDim = 0;

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function setHeroVars(y, s, dim) {
  document.documentElement.style.setProperty("--heroY", `${y}px`);
  document.documentElement.style.setProperty("--heroS", `${s}`);
  document.documentElement.style.setProperty("--heroDim", `${dim}`);
}

function computeTargets() {
  if (!hero) return null;

  const rect = hero.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;

  if (rect.bottom <= 0 || rect.top >= vh) return null;

  const heroH = hero.offsetHeight || 1;
  const scrolled = clamp(-rect.top, 0, heroH);
  const t = clamp(scrolled / heroH, 0, 1);

  const targetY = scrolled * 0.28;
  const targetS = 1 + (t * 0.08);
  const targetDim = t;

  return { targetY, targetS, targetDim };
}

let ticking = false;

function animateHero() {
  ticking = false;
  if (!hero || prefersReduced) return;

  const targets = computeTargets();
  if (!targets) return;

  const ease = 0.10;

  currentY += (targets.targetY - currentY) * ease;
  currentS += (targets.targetS - currentS) * ease;
  currentDim += (targets.targetDim - currentDim) * ease;

  setHeroVars(currentY, currentS, currentDim);

  if (
    Math.abs(targets.targetY - currentY) > 0.1 ||
    Math.abs(targets.targetS - currentS) > 0.0005 ||
    Math.abs(targets.targetDim - currentDim) > 0.002
  ) {
    requestAnimationFrame(animateHero);
  }
}

function requestHeroTick() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(animateHero);
}

if (hero && !prefersReduced) {
  setHeroVars(0, 1, 0);
  window.addEventListener("scroll", requestHeroTick, { passive: true });
  window.addEventListener("resize", requestHeroTick);
  requestHeroTick();
}

(() => {
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

  const hasCharts =
    document.getElementById("chartReuniones") &&
    document.getElementById("chartRedes") &&
    document.getElementById("chartGenero") &&
    document.getElementById("chartConsultasTemas") &&
    document.getElementById("chartConsultasGenero");

  if (!hasCharts || !window.Chart) return;

  const COLORS = {
    dark: "#114632",
    accent: "#239F71",
    mid: "#73B09A",
    light: "#ADDDCB",
    slate: "#4D6B60",
    mint: "#E3FCF5",
    grid: "rgba(0,0,0,.08)",
    men: "rgba(17,70,50,.22)"
  };

  const pct = (n) => (Math.round(n * 100) / 100).toLocaleString("es-ES") + "%";
  const num = (n) => Number(n).toLocaleString("es-ES");

  Chart.defaults.font.family = "system-ui, -apple-system, Segoe UI, Roboto, Arial";
  Chart.defaults.animation.duration = 900;
  Chart.defaults.color = COLORS.dark;
  Chart.defaults.borderColor = COLORS.grid;
  Chart.defaults.plugins.legend.labels.boxWidth = 10;
  Chart.defaults.plugins.legend.labels.color = COLORS.dark;

  new Chart(document.getElementById("chartReuniones"), {
    type: "doughnut",
    data: {
      labels: reuniones.map((d) => d.label),
      datasets: [
        {
          data: reuniones.map((d) => d.value),
          backgroundColor: [COLORS.accent, COLORS.mid, COLORS.light, COLORS.slate, COLORS.mint],
          borderWidth: 0,
          hoverOffset: 10,
          cutout: "62%"
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
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
          backgroundColor: COLORS.accent,
          borderWidth: 0,
          borderRadius: 10
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: { callbacks: { label: (item) => ` ${item.dataset.label}: ${num(item.raw)}` } }
      },
      scales: {
        y: { beginAtZero: true, grid: { color: COLORS.grid } },
        x: { grid: { display: false } }
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

  new Chart(document.getElementById("chartGenero"), {
    type: "bar",
    data: {
      labels: generoActividades.map((d) => d.label),
      datasets: [
        { label: "Mujeres (%)", data: generoActividades.map((d) => d.mujeres), stack: "s", borderWidth: 0, borderRadius: 8, backgroundColor: COLORS.accent },
        { label: "Hombres (%)", data: generoActividades.map((d) => d.hombres), stack: "s", borderWidth: 0, borderRadius: 8, backgroundColor: COLORS.men }
      ]
    },
    options: {
      responsive: true,
      indexAxis: "y",
      plugins: { tooltip: { callbacks: { label: (item) => ` ${item.dataset.label}: ${pct(item.raw)}` } } },
      scales: {
        x: { min: 0, max: 100, ticks: { callback: (v) => v + "%" }, grid: { color: COLORS.grid } },
        y: { ticks: { autoSkip: false }, grid: { display: false } }
      }
    }
  });

  new Chart(document.getElementById("chartConsultasTemas"), {
    type: "bar",
    data: {
      labels: consultasTemas.map((d) => d.label),
      datasets: [
        { label: "Consultas", data: consultasTemas.map((d) => d.total), borderWidth: 0, borderRadius: 10, backgroundColor: COLORS.mid }
      ]
    },
    options: {
      responsive: true,
      indexAxis: "y",
      plugins: { tooltip: { callbacks: { label: (item) => ` ${item.dataset.label}: ${num(item.raw)}` } } },
      scales: {
        x: { beginAtZero: true, grid: { color: COLORS.grid } },
        y: { grid: { display: false } }
      }
    }
  });

  new Chart(document.getElementById("chartConsultasGenero"), {
    type: "bar",
    data: {
      labels: consultasTemas.map((d) => d.label),
      datasets: [
        { label: "Mujeres (%)", data: consultasTemas.map((d) => d.mujeres), stack: "g", borderWidth: 0, borderRadius: 8, backgroundColor: COLORS.accent },
        { label: "Hombres (%)", data: consultasTemas.map((d) => d.hombres), stack: "g", borderWidth: 0, borderRadius: 8, backgroundColor: COLORS.men }
      ]
    },
    options: {
      responsive: true,
      indexAxis: "y",
      plugins: { tooltip: { callbacks: { label: (item) => ` ${item.dataset.label}: ${pct(item.raw)}` } } },
      scales: {
        x: { min: 0, max: 100, ticks: { callback: (v) => v + "%" }, grid: { color: COLORS.grid } },
        y: { ticks: { autoSkip: false }, grid: { display: false } }
      }
    }
  });
})();

