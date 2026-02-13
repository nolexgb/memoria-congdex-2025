const reveals = document.querySelectorAll(".reveal");

if (reveals.length) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
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
  });
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
      bar.style.transition = "transform .7s ease";
      bar.style.transform = "scaleX(" + (bar.dataset.value / 100) + ")";
    }
  });

  obs.observe(bar);
});

const backTop = document.getElementById("backTop");

if (backTop) {
  window.addEventListener("scroll", () => {
    backTop.style.display = window.scrollY > 500 ? "block" : "none";
  });

  backTop.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
}
