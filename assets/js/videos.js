/* Videos de lanzamiento: reproductor grande + carrusel
 * Parte de Bramdon Aguilar · Portafolio. Ver docs/ARQUITECTURA.md */
/* ---- Videos de lanzamiento: reproductor grande + carrusel moderado ---- */
(function () {
  const main = $('#vmain'), rail = $$('.vthumb'); if (!main) return;
  const role = $('#vrole'), title = $('#vtitle'), link = $('#vlink'), stage = $('.vlaunch');
  const DELAY = 8000;
  let idx = 0, elapsed = 0, playing = false, hover = false, visible = false, last = 0;
  function poster(id) { return 'https://i.ytimg.com/vi/' + id + '/maxresdefault.jpg'; }
  function select(i) {
    idx = (i + rail.length) % rail.length; elapsed = 0; playing = false;
    const b = rail[idx];
    rail.forEach(function (r) { const on = r === b; r.classList.toggle('on', on); r.setAttribute('aria-pressed', on); r.style.setProperty('--p', 0); });
    const id = b.dataset.yt;
    main.dataset.yt = id; role.textContent = b.dataset.role; title.textContent = b.dataset.title;
    link.href = 'https://www.youtube.com/watch?v=' + id;
    main.innerHTML = '<button class="vplay" type="button" aria-label="Reproducir: ' + b.dataset.title + '"><img alt="" decoding="async" src="' + poster(id) + '" width="1280" height="720"><span class="play" aria-hidden="true"></span></button>';
    bind();
  }
  function play() {
    playing = true;
    const f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + main.dataset.yt + '?autoplay=1&rel=0&modestbranding=1';
    f.title = title.textContent; f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; f.allowFullscreen = true;
    main.innerHTML = ''; main.appendChild(f); f.focus();
    rail[idx].style.setProperty('--p', 0);
  }
  function bind() {
    const btn = $('.vplay', main); if (!btn) return;
    const im = $('img', btn);
    im.addEventListener('error', function () { if (!im.dataset.fb) { im.dataset.fb = 1; im.src = 'https://i.ytimg.com/vi/' + main.dataset.yt + '/hqdefault.jpg'; } });
    btn.addEventListener('click', play);
  }
  rail.forEach(function (b, i) { b.addEventListener('click', function () { select(i); }); });
  $('.vnav.prev').addEventListener('click', function () { select(idx - 1); });
  $('.vnav.next').addEventListener('click', function () { select(idx + 1); });
  stage.addEventListener('mouseenter', function () { hover = true; });
  stage.addEventListener('mouseleave', function () { hover = false; });
  stage.addEventListener('focusin', function () { hover = true; });
  stage.addEventListener('focusout', function () { hover = false; });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: 0.35 }).observe(stage); else visible = true;
  bind();
  if (reduce) return;
  (function tick(t) {
    const dt = Math.min(100, t - last); last = t;
    if (visible && !playing && !hover && !document.hidden) {
      elapsed += dt;
      rail[idx].style.setProperty('--p', Math.min(1, elapsed / DELAY));
      if (elapsed >= DELAY) select(idx + 1);
    }
    requestAnimationFrame(tick);
  })(0);
})();

