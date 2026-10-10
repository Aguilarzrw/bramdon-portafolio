/* Portada: título, nombre, timecode, palabras rotativas y video de fondo
 * Parte de Bramdon Aguilar · Portafolio. Ver docs/ARQUITECTURA.md */
/* ---- Título de la pestaña ---- */
(function () {
  const t = document.title;
  document.addEventListener('visibilitychange', function () { document.title = document.hidden ? 'Sigue explorando · Bramdon Aguilar' : t; });
})();

/* ---- Nombre: letra por letra ---- */
(function () {
  let n = 0;
  $$('[data-split]').forEach(function (el) {
    const t = el.textContent; el.textContent = '';
    el.setAttribute('aria-hidden', 'true');
    Array.from(t).forEach(function (c) {
      const s = document.createElement('span'); s.className = 'ch'; s.textContent = c; s.style.setProperty('--n', n++); el.appendChild(s);
    });
  });
})();

/* ---- Timecode ---- */
(function () {
  const el = $('#tc'); if (!el || reduce) return;
  const start = Date.now(), pad = n => String(n).padStart(2, '0');
  (function tick() {
    const t = Date.now() - start;
    el.textContent = '00:' + pad(Math.floor(t / 60000) % 60) + ':' + pad(Math.floor(t / 1000) % 60) + ':' + pad(Math.floor((t % 1000) / 41.67));
    requestAnimationFrame(tick);
  })();
})();

/* ---- Palabras que rotan ---- */
(function () {
  const spans = $$('#rot span'); if (spans.length < 2 || reduce) return;
  let i = 0;
  setInterval(function () {
    const cur = spans[i]; i = (i + 1) % spans.length; const nx = spans[i];
    cur.classList.remove('on'); cur.classList.add('out');
    nx.classList.remove('out'); void nx.offsetWidth; nx.classList.add('on');
    setTimeout(function () { cur.classList.remove('out'); }, 800);
  }, 2600);
})();

/* ---- Video de fondo: pausa si no se ve, respeta ahorro de datos y movimiento reducido ---- */
(function () {
  const v = $('#heroVideo'), btn = $('#vctl'); if (!v) return;
  const cn = navigator.connection, saver = cn && (cn.saveData || /(^|-)2g|3g/.test(cn.effectiveType || ''));
  let userPaused = false;
  const icon = {
    pause: '<svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true"><rect x="2" y="1" width="3.5" height="12"/><rect x="8.5" y="1" width="3.5" height="12"/></svg>',
    play: '<svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true"><path d="M3 1l9 6-9 6z"/></svg>'
  };
  function sync() { btn.innerHTML = v.paused ? icon.play : icon.pause; btn.setAttribute('aria-label', v.paused ? 'Reproducir video de fondo' : 'Pausar video de fondo'); }
  if (reduce || saver) { v.removeAttribute('autoplay'); v.pause(); userPaused = true; }
  btn.addEventListener('click', function () { if (v.paused) { userPaused = false; v.play(); } else { userPaused = true; v.pause(); } sync(); });
  v.addEventListener('play', sync); v.addEventListener('pause', sync); sync();
  new IntersectionObserver(function (e) { if (userPaused) return; e[0].isIntersecting ? v.play().catch(function () {}) : v.pause(); }, { threshold: 0.05 }).observe($('#inicio'));
  v.addEventListener('error', function () { v.style.display = 'none'; var im = new Image(); im.src = 'assets/img/hero-poster.webp'; im.alt = ''; $('#heroMedia').appendChild(im); });
})();

