/* Scroll, revelado, contadores y menú móvil
 * Parte de Bramdon Aguilar · Portafolio. Ver docs/ARQUITECTURA.md */
/* ---- Scroll: progreso, parallax, nav, volver arriba, sección activa ---- */
(function () {
  const nav = $('#nav'), prog = $('#progress'), top = $('#totop'), media = $('#heroMedia'), content = $('#heroContent'), portrait = $('#portraitImg');
  const links = $$('nav ul a[href^="#"]'), secs = links.map(a => $(a.getAttribute('href')));
  let last = 0, ticking = false;
  function frame() {
    ticking = false;
    const y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
    nav.classList.toggle('solid', y > 40);
    nav.classList.toggle('hide', y > last && y > 240 && !nav.classList.contains('open'));
    last = y;
    top.classList.toggle('show', y > 800);
    if (!reduce && y < innerHeight * 1.2) {
      media.style.transform = 'translate3d(0,' + (y * 0.25) + 'px,0) scale(' + (1 + y / 4000) + ')';
      content.style.transform = 'translate3d(0,' + (y * -0.12) + 'px,0)';
      content.style.opacity = Math.max(0, 1 - y / (innerHeight * 0.9));
    }
    if (!reduce && portrait) {
      const r = portrait.parentElement.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) portrait.style.transform = 'translate3d(0,' + (((r.top + r.height / 2) - innerHeight / 2) * -0.08) + 'px,0)';
    }
  }
  if ('IntersectionObserver' in window) {
    const vis = new Map();
    const io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { vis.set(e.target, e.isIntersecting); });
      let cur = -1; secs.forEach(function (s, i) { if (vis.get(s)) cur = i; });
      links.forEach(function (a, i) { a.classList.toggle('active', i === cur); });
    }, { rootMargin: '-40% 0px -55% 0px' });
    secs.forEach(function (s) { if (s) io.observe(s); });
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  addEventListener('resize', frame); frame();
  top.addEventListener('click', function () { scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
})();

/* ---- Revelado + contadores ---- */
(function () {
  $$('[data-stagger]').forEach(function (g) { $$('[data-reveal]', g).forEach(function (el, i) { el.style.setProperty('--i', i % 8); }); });
  function count(el) {
    const to = +el.dataset.count, suf = el.dataset.suffix || '', t0 = performance.now(), dur = 1600;
    (function step(t) {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e) + suf;
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }
  if (!('IntersectionObserver' in window)) { $$('[data-reveal], [data-observe]').forEach(function (el) { el.classList.add('in'); }); return; }
  const io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in'); io.unobserve(e.target);
      const c = $('[data-count]', e.target); if (c && !reduce) count(c);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
  $$('[data-reveal], [data-observe]').forEach(function (el) { io.observe(el); });
})();

/* ---- Menú móvil ---- */
(function () {
  const nav = $('#nav'), btn = $('.burger');
  function set(open) {
    nav.classList.toggle('open', open); btn.setAttribute('aria-expanded', open);
    btn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú'); document.body.classList.toggle('lock', open);
  }
  btn.addEventListener('click', function () { set(!nav.classList.contains('open')); });
  $$('nav ul a').forEach(function (a) { a.addEventListener('click', function () { set(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
})();

