/* Filtros de proyectos y galería
 * Parte de Bramdon Aguilar · Portafolio. Ver docs/ARQUITECTURA.md */
/* ---- Filtros de proyectos ---- */
(function () {
  const chips = $$('.pfilters .chip'), cards = $$('.cards .card');
  chips.forEach(function (ch) {
    ch.addEventListener('click', function () {
      chips.forEach(function (c) { c.setAttribute('aria-pressed', c === ch); });
      const f = ch.dataset.pf; let n = 0;
      cards.forEach(function (c) {
        const show = f === 'all' || (c.dataset.cats || '').split(' ').indexOf(f) > -1;
        c.classList.toggle('off', !show);
        if (show) { c.classList.add('in'); c.animate([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 500, delay: (n++) * 50, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' }); }
      });
      cards.forEach(function (c) { if (c.dataset.wide) c.classList.toggle('wide', f === 'all'); });
    });
  });
})();

/* ---- Galería por proyecto + visor de fotos ---- */
(function () {
  const dlg = $('#gallery'), body = $('#gal-body'), lb = $('#lb'), lbImg = $('#lb-img'), lbC = $('#lb-c');
  let lastBtn, photos = [], idx = 0;
  function show(i) { idx = (i + photos.length) % photos.length; lbImg.src = photos[idx]; lbC.textContent = (idx + 1) + ' / ' + photos.length; }
  function openLb(i) { lb.classList.add('open'); show(i); $('.x', lb).focus(); }
  function closeLb() { lb.classList.remove('open'); }
  function open(id, btn) {
    const p = PROJECTS[id]; if (!p) return;
    lastBtn = btn; photos = p.photos;
    $('#gal-title').textContent = p.title; $('#gal-meta').textContent = p.role + ' · ' + p.brand; $('#gal-desc').textContent = p.desc;
    const chips = [];
    if (p.photos.length) chips.push(p.photos.length + (p.photos.length === 1 ? ' foto' : ' fotos'));
    if (p.videos.length) chips.push(p.videos.length + (p.videos.length === 1 ? ' video' : ' videos'));
    $('#gal-chips').innerHTML = chips.map(function (t) { return '<li>' + t + '</li>'; }).join('');
    const cov = p.photos[0] || (p.videos[0] && p.videos[0].poster);
    $('#gal-cover').style.setProperty('--cover', cov ? 'url("' + new URL(cov, document.baseURI).href + '")' : 'none');
    const box = $('#gal-descbox'), more = $('#gal-more'), long = p.desc.length > 420;
    box.classList.toggle('clamp', long); more.hidden = !long; more.textContent = 'Leer más'; more.setAttribute('aria-expanded', 'false');
    let h = '';
    if (p.videos.length) {
      h += '<h4 class="dlg-sec">Videos</h4><div class="vids">';
      p.videos.forEach(function (v) {
        h += '<div class="' + (v.title ? 'big' : '') + '"><video controls playsinline preload="none" poster="' + v.poster + '" src="' + v.src + '"' + (v.title ? ' aria-label="' + v.title + '"' : '') + '></video></div>';
      });
      h += '</div>';
    }
    if (p.photos.length) {
      h += '<h4 class="dlg-sec">Fotos</h4><div class="gal">';
      p.photos.forEach(function (s, i) { h += '<img src="' + s + '" alt="" loading="lazy" data-i="' + i + '" style="--i:' + (i % 8) + '">'; });
      h += '</div>';
    }
    body.innerHTML = h;
    dlg.showModal(); document.body.classList.add('lock'); dlg.scrollTop = 0; $('#gal-title').focus({ preventScroll: true });
  }
  body.addEventListener('click', function (e) { const im = e.target.closest('.gal img'); if (im) openLb(+im.dataset.i); });
  $('#gal-more').addEventListener('click', function () { const b = $('#gal-descbox'), on = b.classList.toggle('clamp'); this.textContent = on ? 'Leer más' : 'Leer menos'; this.setAttribute('aria-expanded', String(!on)); });
  $('.x', lb).addEventListener('click', closeLb);
  $('.p', lb).addEventListener('click', function () { show(idx - 1); });
  $('.n', lb).addEventListener('click', function () { show(idx + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  dlg.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'ArrowLeft') show(idx - 1); else if (e.key === 'ArrowRight') show(idx + 1);
  });
  dlg.addEventListener('cancel', function (e) { if (lb.classList.contains('open')) { e.preventDefault(); closeLb(); } });
  dlg.addEventListener('close', function () {
    closeLb();
    $$('video', body).forEach(function (v) { v.pause(); });
    body.innerHTML = ''; document.body.classList.remove('lock');
    if (lastBtn) lastBtn.focus();
  });
  $('.dlg-close', dlg).addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  $$('button.card[data-project]').forEach(function (b) { b.addEventListener('click', function () { open(b.dataset.project, b); }); });
})();
