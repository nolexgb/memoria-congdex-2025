// ============================
// REVEAL ANIMATION
// ============================
const reveals = document.querySelectorAll(".reveal");

if (reveals.length) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  });

  reveals.forEach(el => revealObserver.observe(el));
}


// ============================
// PROGRESS BAR
// ============================
const progressBar = document.getElementById("progressBar");

if (progressBar) {
  window.addEventListener("scroll", () => {
    const h = document.documentElement;
    const progress = h.scrollTop / (h.scrollHeight - h.clientHeight);
    progressBar.style.width = (progress * 100) + "%";
  });
}


// ============================
// COUNT ANIMATION
// ============================
document.querySelectorAll("[data-count]").forEach(el => {

  let started = false;

  const counterObserver = new IntersectionObserver(entries => {

    if (started) return;

    if (entries[0].isIntersecting) {

      started = true;

      const target = Number(el.dataset.count);
      let current = 0;

      const interval = setInterval(() => {

        current += target / 30;

        if (current >= target) {
          current = target;
          clearInterval(interval);
        }

        el.textContent = Math.floor(current).toLocaleString();

      }, 20);
    }
  });

  counterObserver.observe(el);
});


// ============================
// BAR ANIMATION
// ============================
document.querySelectorAll(".barFill").forEach(bar => {

  const barObserver = new IntersectionObserver(entries => {

    if (entries[0].isIntersecting) {
      bar.style.transition = "transform .7s ease";
      bar.style.transform = "scaleX(" + (bar.dataset.value / 100) + ")";
    }
  });

  barObserver.observe(bar);
});


// ============================
// BACK TO TOP BUTTON
// ============================
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
