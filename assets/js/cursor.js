/* Cursor, botones magnéticos y adelanto de video en tarjetas
 * Parte de Bramdon Aguilar · Portafolio. Ver docs/ARQUITECTURA.md */
/* ---- Cursor, botones magnéticos, brillo y tilt (solo con mouse) ---- */
(function () {
  if (!fine || reduce) return;
  const cur = $('#cursor'); let x = 0, y = 0, cx = 0, cy = 0;
  addEventListener('mousemove', function (e) { x = e.clientX; y = e.clientY; cur.classList.add('on'); }, { passive: true });
  document.addEventListener('mouseleave', function () { cur.classList.remove('on'); });
  (function loop() { cx += (x - cx) * 0.2; cy += (y - cy) * 0.2; cur.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)'; requestAnimationFrame(loop); })();
  document.addEventListener('mouseover', function (e) {
    const t = e.target.closest('a, button, .chip, .brand, .bcard');
    const card = e.target.closest('button.card');
    cur.classList.toggle('view', !!card); cur.textContent = card ? 'Ver' : '';
    cur.classList.toggle('link', !!t && !card);
  });
  $$('[data-magnet]').forEach(function (b) {
    b.addEventListener('mousemove', function (e) {
      const r = b.getBoundingClientRect();
      b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.25) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.35) + 'px)';
    });
    b.addEventListener('mouseleave', function () { b.style.transform = ''; });
  });
  $$('.skill').forEach(function (b) {
    b.addEventListener('mousemove', function (e) {
      const r = b.getBoundingClientRect(); b.style.setProperty('--mx', (e.clientX - r.left) + 'px'); b.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
  $$('.brand').forEach(function (b) {
    b.addEventListener('mousemove', function (e) {
      const r = b.getBoundingClientRect(); b.style.setProperty('--mx', (e.clientX - r.left) + 'px'); b.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
  $$('button.card').forEach(function (c) {
    const shot = $('.shot', c);
    c.addEventListener('mousemove', function (e) {
      const r = shot.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
      shot.style.transform = 'perspective(900px) rotateY(' + (px * 6) + 'deg) rotateX(' + (-py * 6) + 'deg) scale(1.01)';
    });
    c.addEventListener('mouseleave', function () { shot.style.transform = ''; });
  });
})();

/* ---- Adelanto en video al pasar el mouse sobre un proyecto ---- */
(function () {
  if (!fine || reduce) return;
  $$('button.card[data-preview]').forEach(function (c) {
    let v;
    c.addEventListener('mouseenter', function () {
      if (!c.dataset.preview) return;
      v = document.createElement('video'); v.className = 'pv'; v.muted = true; v.loop = true; v.playsInline = true; v.src = c.dataset.preview;
      $('.shot', c).insertBefore(v, $('.shot', c).firstChild.nextSibling);
      v.addEventListener('playing', function () { v.classList.add('on'); });
      v.play().catch(function () {});
    });
    c.addEventListener('mouseleave', function () { if (v) { v.remove(); v = null; } });
  });
})();

