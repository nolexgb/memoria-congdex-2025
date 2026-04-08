(() => {

  /* =========================
     SCROLL + UI GLOBAL
     ========================= */

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

  const onScroll = () => {
    const h = document.documentElement;
    const p = h.scrollTop / (h.scrollHeight - h.clientHeight);
    if (progressBar) progressBar.style.width = p * 100 + "%";
    if (back) back.style.display = window.scrollY > 500 ? "block" : "none";
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (back) back.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });

  /* =========================
     CONTADORES
     ========================= */

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

  /* =========================
     CHARTS
     ========================= */

  if (window.Chart) {

    const palette = {
      g0: "#114632",
      g1: "#239F71",
      g2: "#79CFAF",
      g3: "#BFECDD"
    };

    /* REUNIONES */
    new Chart(document.getElementById("chartReuniones"), {
      type: "doughnut",
      data: {
        labels: ["Junta Directiva", "Consejo Asesor", "Educación", "Incidencia", "Voluntariado"],
        datasets: [{
          data: [11, 6, 11, 5, 3],
          backgroundColor: [palette.g1, palette.g2, palette.g3, palette.g0, "#ddd"]
        }]
      }
    });

    /* REDES */
    const redesChart = new Chart(document.getElementById("chartRedes"), {
      type: "bar",
      data: {
        labels: ["Twitter", "Facebook", "Instagram", "YouTube"],
        datasets: [{
          label: "Seguidores",
          data: [1782, 2529, 1197, 88],
          backgroundColor: palette.g1
        }]
      }
    });

    document.querySelectorAll(".tab").forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll(".tab").forEach(b => b.classList.remove("is-active"));
        btn.classList.add("is-active");

        const m = btn.dataset.m;

        if (m === "publicaciones") {
          redesChart.data.datasets[0].data = [200,187,310,4];
        } else if (m === "interacciones") {
          redesChart.data.datasets[0].data = [459,3041,1908,493];
        } else {
          redesChart.data.datasets[0].data = [1782,2529,1197,88];
        }

        redesChart.update();
      };
    });

    /* GENERO */
    new Chart(document.getElementById("chartGenero"), {
      type: "bar",
      data: {
        labels: ["Asamblea", "Educación", "Voluntariado"],
        datasets: [
          { label:"Mujeres", data:[73,74,86], backgroundColor:palette.g1 },
          { label:"Hombres", data:[27,26,14], backgroundColor:palette.g0 }
        ]
      }
    });

  }

  /* =========================
     KPI INTERACTIVO (FIX SALTO)
     ========================= */

  (() => {

    const DATA = {
      circulares: 38,
      aperturas: 8439,
      promedio: "60%",
      publicaciones: 41,
      eventos: 26,
      empleo: 12,
      visitas: 12670
    };

    const value = document.getElementById("kpiValue");
    const label = document.getElementById("kpiLabel");

    document.querySelectorAll(".stepCard").forEach(card => {
      card.onclick = () => {

        document.querySelectorAll(".stepCard")
          .forEach(c => c.classList.remove("is-active"));

        card.classList.add("is-active");

        const key = card.dataset.key;

        label.textContent = card.textContent;
        value.textContent = DATA[key];

      };
    });

  })();

  /* =========================
     MAPA
     ========================= */

  (() => {

    const el = document.getElementById("map");
    if (!el || !window.L) return;

    const map = L.map("map").setView([18, -8], 2);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

    const points = [
      ["Extremadura", [39,-6]],
      ["España", [40,-3]],
      ["América Latina", [-12,-77]],
      ["África", [9,8]]
    ];

    points.forEach(p => {
      L.marker(p[1]).addTo(map).bindPopup(p[0]);
    });

  })();

  /* =========================
     TIMELINE (SIMPLIFICADO)
     ========================= */

  (() => {

    const track = document.getElementById("tlTrack");
    if (!track) return;

    const events = [
      {year:"1995", title:"Constitución"},
      {year:"2003", title:"Ley cooperación"},
      {year:"2010", title:"Incidencia"},
      {year:"2023", title:"Nueva ley"}
    ];

    events.forEach((e,i)=>{
      const node = document.createElement("div");
      node.className = "tl-node";
      node.style.left = (i/(events.length-1))*100 + "%";

      node.innerHTML = `
        <div class="tl-pin"></div>
        <div class="tl-pill">${e.year}</div>
      `;

      track.appendChild(node);
    });

  })();

})();
