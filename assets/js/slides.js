/* Portadas que rotan: las tarjetas de proyectos que solo tienen fotos
 * (sin videos) cambian de foto cada 5 s con un fundido suave.
 * Parte de Bramdon Aguilar · Portafolio. Ver docs/ARQUITECTURA.md */
(function () {
  if (reduce || !window.PROJECTS) return;
  const EVERY = 5000, MAX = 8;
  const cards = $$('button.card[data-project]').filter(function (c) {
    const p = PROJECTS[c.dataset.project];
    return p && !p.videos.length && p.photos.length > 1;
  });
  cards.forEach(function (card, n) {
    const shot = $('.shot', card), base = $('img', shot), list = PROJECTS[card.dataset.project].photos.slice(0, MAX);
    let i = Math.max(0, list.indexOf(base.getAttribute('src'))), timer = null, busy = false;
    function next() {
      if (busy) return;
      busy = true;
      const src = list[i = (i + 1) % list.length], pre = new Image();
      pre.onload = function () {
        const top = document.createElement('img');
        top.src = src; top.alt = ''; top.decoding = 'async'; top.className = 'xfade';
        top.style.objectPosition = base.style.objectPosition;
        base.after(top);
        requestAnimationFrame(function () { requestAnimationFrame(function () { top.classList.add('in'); }); });
        setTimeout(function () { base.src = src; top.remove(); busy = false; }, 1300);
      };
      pre.onerror = function () { busy = false; };
      pre.src = src;
    }
    function start() { if (!timer && !document.hidden) timer = setInterval(next, EVERY); }
    function stop() { clearInterval(timer); timer = null; }
    new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) setTimeout(start, n * 900); else stop();
    }, { threshold: 0.35 }).observe(card);
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : (card.matches(':hover') || start()); });
  });
})();
