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
        el.textContent = Math.floor(n).toLocaleString();
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

function animate() {
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
    requestAnimationFrame(animate);
  }
}

function requestTick() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(animate);
}

if (hero && !prefersReduced) {
  setHeroVars(0, 1, 0);

  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", requestTick);
  requestTick();
}
