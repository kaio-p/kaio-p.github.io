//   NAV TOGGLE

function initNavToggle(){
  const toggle = document.getElementById("nav-toggle");
  const links = document.getElementById("nav-links");
  if (!toggle || !links) return;

  toggle.addEventListener("click", () => {
    const isOpen = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  links.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      links.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}


// SCROLLSPY — destaca a seção atual na navegação

function initScrollspy(){
  const links = document.querySelectorAll("#nav-links a");
  if (!links.length) return;

  const sections = Array.from(links)
    .map(link => document.getElementById(link.dataset.section))
    .filter(Boolean);

  if (!sections.length || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      links.forEach(link => {
        link.classList.toggle("is-active", link.dataset.section === id);
      });
    });
  }, { rootMargin: "-40% 0px -50% 0px", threshold: 0 });

  sections.forEach(section => observer.observe(section));
}

// FOOTER YEAR
function initFooterYear(){
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
}


/* SCROLL REVEAL — seções entram com fade + leve deslocamento
   (progressive enhancement: sem IntersectionObserver, tudo fica visível) */

function initScrollReveal(){
  if (!("IntersectionObserver" in window)) return;
  const blocks = document.querySelectorAll(".block");
  if (!blocks.length) return;

  blocks.forEach(block => block.classList.add("will-animate"));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });

  blocks.forEach(block => observer.observe(block));
}


//SCROLL PROGRESS — traço na titlebar acompanhando a leitura da página

function initScrollProgress(){
  const bar = document.getElementById("nav-progress");
  if (!bar) return;

  const update = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = pct + "%";
  };

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
}


//INIT
document.addEventListener("DOMContentLoaded", () => {
  initNavToggle();
  initScrollspy();
  initFooterYear();
  initScrollReveal();
  initScrollProgress();
});
