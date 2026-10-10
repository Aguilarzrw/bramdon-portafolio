/* Marcas (carrusel y filtro) y carga de logos
 * Parte de Bramdon Aguilar · Portafolio. Ver docs/ARQUITECTURA.md */
/* ---- Marcas: carrusel animado con filtro por sector ---- */
(function () {
  const box = $('#bmarq'), sec = $('#marcas'), items = $$('.brand'), chips = $$('.brands .chip');
  if (!box || reduce) {
    chips.forEach(function (ch) { ch.addEventListener('click', function () { chips.forEach(function (c) { c.setAttribute('aria-pressed', c === ch); }); items.forEach(function (b) { b.classList.toggle('off', !(ch.dataset.filter === 'all' || b.dataset.cat === ch.dataset.filter)); }); }); });
    return;
  }
  function card(li, hidden) {
    const c = document.createElement('div'); c.className = 'bcard'; c.dataset.logo = li.dataset.logo; if (hidden) c.setAttribute('aria-hidden', 'true');
    c.innerHTML = li.innerHTML; return c;
  }
  function render(f) {
    const list = items.filter(function (b) { return f === 'all' || b.dataset.cat === f; });
    box.innerHTML = ''; rows.length = 0;
    const nRows = list.length >= 8 ? 2 : 1;
    const cw = box.clientWidth || innerWidth;
    for (let r = 0; r < nRows; r++) {
      const mine = list.filter(function (_, i) { return i % nRows === r; });
      const row = document.createElement('div'); row.className = 'brow'; if (r) row.dataset.dir = '-1';
      const tr = document.createElement('div'); tr.className = 'btrack';
      const per = 308, reps = Math.max(1, Math.ceil((cw * 1.1) / (mine.length * per)));
      for (let k = 0; k < reps; k++) mine.forEach(function (li) { tr.appendChild(card(li, k > 0)); });
      const half = tr.children.length;
      for (let k = 0; k < half; k++) tr.appendChild(card(items.filter(function (b) { return b.dataset.logo === tr.children[k].dataset.logo; })[0], true));
      row.appendChild(tr); box.appendChild(row);
      rows.push({ row: row, tr: tr, dir: r ? -1 : 1, x: 0, v: 0, drag: false, hover: false });
    }
  }

  /* Movimiento: autodesplazamiento + arrastre con mouse/dedo (a cualquier lado) con inercia */
  const rows = [], SPEED = 38; /* px por segundo */
  let last = performance.now(), visible = true;
  function wrap(o) { const half = o.tr.scrollWidth / 2; if (!half) return; o.x = ((o.x % half) + half) % half; o.tr.style.transform = 'translate3d(' + (-o.x) + 'px,0,0)'; }
  function tick(now) {
    const dt = Math.min(64, now - last) / 1000; last = now;
    if (visible) rows.forEach(function (o) {
      if (o.drag) return;
      o.x += o.v * dt * 60;                       /* inercia */
      o.v *= 0.94; if (Math.abs(o.v) < 0.05) o.v = 0;
      if (!o.hover && !o.v) o.x += o.dir * SPEED * dt;
      wrap(o);
    });
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(box);
  let moved = 0;
  box.addEventListener('pointerdown', function (e) {
    const row = e.target.closest('.brow'); if (!row) return;
    const o = rows.filter(function (r) { return r.row === row; })[0]; if (!o) return;
    o.drag = true; o.v = 0; moved = 0; let px = e.clientX, pt = e.timeStamp;
    row.classList.add('grab'); row.setPointerCapture(e.pointerId);
    function mv(ev) { const dx = ev.clientX - px; moved += Math.abs(dx); o.x -= dx; o.v = -dx / Math.max(1, (ev.timeStamp - pt) / 16.7); px = ev.clientX; pt = ev.timeStamp; wrap(o); }
    function up() { o.drag = false; row.classList.remove('grab'); row.removeEventListener('pointermove', mv); row.removeEventListener('pointerup', up); row.removeEventListener('pointercancel', up); }
    row.addEventListener('pointermove', mv); row.addEventListener('pointerup', up); row.addEventListener('pointercancel', up);
  });
  box.addEventListener('click', function (e) { if (moved > 6) { e.preventDefault(); e.stopPropagation(); moved = 0; } }, true);
  box.addEventListener('mouseover', function (e) { const r = e.target.closest('.brow'); rows.forEach(function (o) { o.hover = o.row === r; }); });
  box.addEventListener('mouseleave', function () { rows.forEach(function (o) { o.hover = false; }); });
  box.addEventListener('wheel', function (e) {
    const row = e.target.closest('.brow'); if (!row || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    const o = rows.filter(function (r) { return r.row === row; })[0]; if (o) { o.x += e.deltaX; wrap(o); e.preventDefault(); }
  }, { passive: false });
  sec.classList.add('has-marq');
  render('all');
  chips.forEach(function (ch) {
    ch.addEventListener('click', function () { chips.forEach(function (c) { c.setAttribute('aria-pressed', c === ch); }); render(ch.dataset.filter); });
  });
  box.addEventListener('mousemove', function (e) {
    const c = e.target.closest('.bcard'); if (!c) return;
    const r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
})();

/* ---- Logos: archivos locales o íconos; si no existen, queda el monograma ---- */
(function () {
  function tryUrls(urls, ok, fail) {
    let i = 0;
    (function next() {
      if (i >= urls.length) return fail && fail();
      const u = urls[i++], im = new Image();
      im.onload = function () { ok(u); }; im.onerror = next; im.src = u;
    })();
  }
  const exts = ['svg', 'png'];
  function loadLogos() { $$('.brand[data-logo]').forEach(function (b) {
    const slug = b.dataset.logo, urls = exts.map(e => 'assets/img/logos/' + slug + '.' + e);
    tryUrls(urls, function (u) {
      $$('[data-logo="' + slug + '"] .logo').forEach(function (box) { if (box.classList.contains('has-img')) return; const im = new Image(); im.alt = ''; im.src = u; box.insertBefore(im, box.firstChild); box.classList.add('has-img'); });
    });
  }); }
  const brandsSec = $('#marcas');
  if ('IntersectionObserver' in window && brandsSec) {
    const ob = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { ob.disconnect(); loadLogos(); } }, { rootMargin: '600px 0px' });
    ob.observe(brandsSec);
  } else loadLogos();

  const CDN = ['https://cdn.jsdelivr.net/npm/simple-icons@11.14.0/icons/', 'https://cdn.jsdelivr.net/npm/simple-icons@9.21.0/icons/'];
  const TOOLS = [
    { n: 'Premiere Pro', k: 'premiere-pro', s: ['adobepremierepro'], c: '#9999FF', m: 'Pr' },
    { n: 'CapCut', k: 'capcut', s: ['capcut'], c: '#FFFFFF', bg: '#2f3441', m: 'Cc' },
    { n: 'Photoshop', k: 'photoshop', s: ['adobephotoshop'], c: '#31A8FF', m: 'Ps' },
    { n: 'Google Sheets', k: 'google-sheets', s: ['googlesheets'], c: '#34A853', m: 'Sh' },
    { n: 'Trello', k: 'trello', s: ['trello'], c: '#4C7BEF', m: 'Tr' },
    { n: 'ChatGPT', k: 'chatgpt', s: ['openai'], c: '#10A37F', m: 'GP' },
    { n: 'Higgsfield', k: 'higgsfield', s: [], c: '#2a2f3b', m: 'Hf' },
    { n: 'Flow', k: 'flow', s: [], c: '#3a5fd0', m: 'Fl' },
    { n: 'Claude', k: 'claude', s: ['claude', 'anthropic'], c: '#D97757', m: 'Cl' },
    { n: 'Gemini', k: 'gemini', s: ['googlegemini'], c: '#8E75B2', m: 'Ge' }
  ];
  const track = $('#marquee'), found = {};
  function resolveIcon(t, cb) {
    if (found[t.k]) return found[t.k].then(cb);
    found[t.k] = new Promise(function (res) {
      const local = exts.map(e => 'assets/img/tools/' + t.k + '.' + e);
      tryUrls(local, function (u) { res({ img: u }); }, function () {
        const cdn = []; t.s.forEach(function (s) { CDN.forEach(function (b) { cdn.push(b + s + '.svg'); }); });
        tryUrls(cdn, function (u) { res({ mask: u }); }, function () { res(null); });
      });
    });
    return found[t.k].then(cb);
  }
  function build(list, hidden) {
    const frag = document.createDocumentFragment();
    list.forEach(function (t) {
      const d = document.createElement('div'); d.className = 'tool'; if (hidden) d.setAttribute('aria-hidden', 'true');
      const ico = document.createElement('div'); ico.className = 'ico';
      const mono = document.createElement('b'); mono.textContent = t.m; mono.style.setProperty('--c', t.bg || t.c); ico.appendChild(mono);
      const label = document.createElement('span'); label.textContent = t.n;
      d.appendChild(ico); d.appendChild(label); frag.appendChild(d);
      resolveIcon(t, function (r) {
        if (!r) return;
        ico.innerHTML = '';
        if (r.img) { const im = new Image(); im.alt = ''; im.decoding = 'async'; im.src = r.img; ico.appendChild(im); }
        else { const i = document.createElement('i'); i.style.setProperty('--c', t.c); i.style.setProperty('--m', 'url("' + r.mask + '")'); ico.appendChild(i); }
      });
    });
    return frag;
  }
  function start() {
    [TOOLS.slice(0, 5), TOOLS.slice(5)].forEach(function (list, ri) {
      const row = document.createElement('div'); row.className = 'mrow'; if (ri) row.dataset.dir = '-1';
      const tr = document.createElement('div'); tr.className = 'mtrack';
      [false, true, true, true].forEach(function (h) { tr.appendChild(build(list, h)); });
      row.appendChild(tr); track.appendChild(row);
    });
  }
  /* solo se buscan los íconos cuando la sección está cerca de la pantalla */
  const toolsBox = track.closest('section') || track;
  if ('IntersectionObserver' in window) {
    const o = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { o.disconnect(); start(); } }, { rootMargin: '600px 0px' });
    o.observe(toolsBox);
  } else start();
})();

