/* Reproductor de video propio: reemplaza los controles nativos de <video data-player>.
 * Botón grande, barra de progreso con buffer, tiempo, volumen, velocidad y pantalla completa.
 * Teclado: espacio/K reproducir · ← → ±5 s · ↑ ↓ volumen · M silencio · F pantalla completa.
 * Se expone window.enhanceVideos(raíz) para videos creados dinámicamente (galería).
 * Parte de Bramdon Aguilar · Portafolio. Ver docs/ARQUITECTURA.md */
(function () {
  const I = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.6v14H7zM13.4 5H17v14h-3.6z"/></svg>',
    vol: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h3.5l5 4V6l-5 4z"/><path class="ln" d="M16 9.2a4 4 0 0 1 0 5.6M18.4 6.8a7.4 7.4 0 0 1 0 10.4"/></svg>',
    mute: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h3.5l5 4V6l-5 4z"/><path class="ln" d="M16 9.5l5 5M21 9.5l-5 5"/></svg>',
    full: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="ln" d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    exit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="ln" d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>',
    replay: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="ln" d="M5 12a7 7 0 1 0 2.2-5.1M5 4.5V8h3.5"/></svg>'
  };
  const SPEEDS = [1, 1.25, 1.5, 2, 0.75];
  const fmt = function (t) {
    if (!isFinite(t)) return '0:00';
    t = Math.max(0, Math.floor(t));
    return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0');
  };
  const clamp = function (n, a, b) { return Math.min(b, Math.max(a, n)); };

  function build(v) {
    if (v.dataset.ready) return;
    v.dataset.ready = '1';
    v.controls = false; v.removeAttribute('controls'); v.disablePictureInPicture = false;
    const box = document.createElement('div');
    box.className = 'vp'; box.tabIndex = 0;
    box.setAttribute('role', 'group');
    box.setAttribute('aria-label', 'Reproductor de video' + (v.getAttribute('aria-label') ? ': ' + v.getAttribute('aria-label') : ''));
    v.parentNode.insertBefore(box, v); box.appendChild(v);
    box.insertAdjacentHTML('beforeend',
      '<button class="vp-big" type="button" aria-label="Reproducir">' + I.play + '</button>' +
      '<span class="vp-spin" aria-hidden="true"></span>' +
      '<div class="vp-bar">' +
        '<div class="vp-seek" role="slider" tabindex="0" aria-label="Posición del video" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i class="vp-buf"></i><i class="vp-fill"></i><i class="vp-knob"></i></div>' +
        '<div class="vp-row">' +
          '<button class="vp-pp" type="button" aria-label="Reproducir">' + I.play + '</button>' +
          '<span class="vp-time">0:00 / 0:00</span>' +
          '<span class="vp-sp"></span>' +
          '<button class="vp-rate" type="button" aria-label="Velocidad de reproducción">1×</button>' +
          '<button class="vp-mute" type="button" aria-label="Silenciar">' + I.vol + '</button>' +
          '<button class="vp-fs" type="button" aria-label="Pantalla completa">' + I.full + '</button>' +
        '</div>' +
      '</div>');
    const big = box.querySelector('.vp-big'), pp = box.querySelector('.vp-pp'), seek = box.querySelector('.vp-seek'),
      fill = box.querySelector('.vp-fill'), buf = box.querySelector('.vp-buf'), knob = box.querySelector('.vp-knob'),
      time = box.querySelector('.vp-time'), rate = box.querySelector('.vp-rate'), mute = box.querySelector('.vp-mute'),
      fs = box.querySelector('.vp-fs');
    let hideT = 0, drag = false, ri = 0;

    function paint() {
      const d = v.duration || 0, c = v.currentTime || 0, p = d ? c / d : 0;
      fill.style.width = (p * 100) + '%'; knob.style.left = (p * 100) + '%';
      time.textContent = fmt(c) + ' / ' + fmt(d);
      seek.setAttribute('aria-valuenow', Math.round(p * 100));
      seek.setAttribute('aria-valuetext', fmt(c) + ' de ' + fmt(d));
      if (d && v.buffered.length) { let e = 0; for (let i = 0; i < v.buffered.length; i++) if (v.buffered.start(i) <= c + 0.3) e = Math.max(e, v.buffered.end(i)); buf.style.width = (e / d * 100) + '%'; }
    }
    function state() {
      const on = !v.paused && !v.ended;
      box.classList.toggle('playing', on); box.classList.toggle('ended', v.ended);
      const lab = v.ended ? 'Ver de nuevo' : (on ? 'Pausar' : 'Reproducir');
      pp.innerHTML = v.ended ? I.replay : (on ? I.pause : I.play); pp.setAttribute('aria-label', lab);
      big.innerHTML = v.ended ? I.replay : I.play; big.setAttribute('aria-label', lab);
      wake();
    }
    function toggle() {
      if (v.paused || v.ended) {
        if (v.ended) v.currentTime = 0;
        $$('video[data-ready]').forEach(function (o) { if (o !== v && !o.paused) o.pause(); });
        const pr = v.play(); if (pr && pr.catch) pr.catch(function () {});
      } else v.pause();
    }
    function wake() {
      box.classList.add('show'); clearTimeout(hideT);
      if (!v.paused && !v.ended && !seek.matches(':focus-visible')) hideT = setTimeout(function () { if (!drag) box.classList.remove('show'); }, 2600);
    }
    function setT(clientX) {
      const r = seek.getBoundingClientRect(), p = clamp((clientX - r.left) / r.width, 0, 1);
      if (v.duration) { v.currentTime = p * v.duration; paint(); }
    }
    function vol() {
      mute.innerHTML = (v.muted || v.volume === 0) ? I.mute : I.vol;
      mute.setAttribute('aria-label', (v.muted || v.volume === 0) ? 'Activar sonido' : 'Silenciar');
    }
    function fsOn() { return document.fullscreenElement === box || document.webkitFullscreenElement === box; }
    function toggleFs() {
      if (fsOn()) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; }
      const f = box.requestFullscreen || box.webkitRequestFullscreen;
      if (f) { const pr = f.call(box); if (pr && pr.catch) pr.catch(function () {}); }
      else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen();
    }
    document.addEventListener('fullscreenchange', function () { const on = fsOn(); box.classList.toggle('fs', on); fs.innerHTML = on ? I.exit : I.full; fs.setAttribute('aria-label', on ? 'Salir de pantalla completa' : 'Pantalla completa'); });

    big.addEventListener('click', toggle); pp.addEventListener('click', toggle);
    v.addEventListener('click', function () { toggle(); wake(); });
    v.addEventListener('dblclick', toggleFs);
    mute.addEventListener('click', function () { v.muted = !v.muted; if (!v.muted && v.volume === 0) v.volume = 0.8; vol(); });
    fs.addEventListener('click', toggleFs);
    rate.addEventListener('click', function () { ri = (ri + 1) % SPEEDS.length; v.playbackRate = SPEEDS[ri]; rate.textContent = SPEEDS[ri] + '×'; });
    seek.addEventListener('pointerdown', function (e) { drag = true; seek.setPointerCapture(e.pointerId); box.classList.add('drag'); setT(e.clientX); });
    seek.addEventListener('pointermove', function (e) { if (drag) setT(e.clientX); });
    ['pointerup', 'pointercancel'].forEach(function (n) { seek.addEventListener(n, function () { drag = false; box.classList.remove('drag'); wake(); }); });
    seek.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { v.currentTime = clamp(v.currentTime + (e.key === 'ArrowRight' ? 5 : -5), 0, v.duration || 0); e.preventDefault(); e.stopPropagation(); }
      else if (e.key === 'Home') { v.currentTime = 0; e.preventDefault(); }
      else if (e.key === 'End') { v.currentTime = v.duration || 0; e.preventDefault(); }
    });
    box.addEventListener('keydown', function (e) {
      if (e.target.closest('button')) { if (e.key === ' ' || e.key === 'Enter') return; }
      const k = e.key.toLowerCase();
      if (k === ' ' || k === 'k') { toggle(); e.preventDefault(); }
      else if (k === 'arrowleft') { v.currentTime = Math.max(0, v.currentTime - 5); e.preventDefault(); }
      else if (k === 'arrowright') { v.currentTime = Math.min(v.duration || 0, v.currentTime + 5); e.preventDefault(); }
      else if (k === 'arrowup') { v.muted = false; v.volume = clamp(v.volume + 0.1, 0, 1); vol(); e.preventDefault(); }
      else if (k === 'arrowdown') { v.volume = clamp(v.volume - 0.1, 0, 1); vol(); e.preventDefault(); }
      else if (k === 'm') { v.muted = !v.muted; vol(); }
      else if (k === 'f') { toggleFs(); }
      wake();
    });
    ['mousemove', 'pointerdown', 'focusin', 'touchstart'].forEach(function (n) { box.addEventListener(n, wake, { passive: true }); });
    box.addEventListener('mouseleave', function () { if (!v.paused) { clearTimeout(hideT); hideT = setTimeout(function () { box.classList.remove('show'); }, 600); } });
    ['timeupdate', 'durationchange', 'loadedmetadata', 'progress'].forEach(function (n) { v.addEventListener(n, paint); });
    ['play', 'pause', 'ended'].forEach(function (n) { v.addEventListener(n, state); });
    v.addEventListener('waiting', function () { box.classList.add('wait'); });
    ['playing', 'canplay', 'pause'].forEach(function (n) { v.addEventListener(n, function () { box.classList.remove('wait'); }); });
    v.addEventListener('volumechange', vol);
    v.addEventListener('error', function () { box.classList.add('err'); box.classList.remove('wait'); });
    state(); vol(); paint(); box.classList.add('show');
  }

  window.enhanceVideos = function (root) { $$('video[data-player]', root || document).forEach(build); };
  window.enhanceVideos();
})();
