"""Prueba rápida del sitio con Playwright (Chromium).
Uso:  python3 tools/test-smoke.py [URL]     (por defecto http://localhost:8765/)
Revisa: 404 de archivos (los logos/herramientas opcionales se ignoran), errores de JS, violaciones de CSP, secciones, filtros, galería,
carrusel de videos y desborde horizontal en escritorio y móvil.
Capturas en la carpeta temporal indicada por SHOTS (por defecto /tmp)."""
import asyncio, os, sys
from playwright.async_api import async_playwright
URL = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8765/'
SHOTS = os.environ.get('SHOTS', '/tmp')

async def main():
    bad = 0
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for w, h in ((1366, 800), (390, 844)):
            pg = await b.new_page(viewport={'width': w, 'height': h})
            errs = []
            pg.on('response', lambda r: errs.append('404: ' + r.url) if r.status >= 400 and r.url.startswith(URL) and '/logos/' not in r.url and '/tools/' not in r.url else None)
            pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
            pg.on('console', lambda m: errs.append('console: ' + m.text) if m.type == 'error' and 'ytimg' not in m.text and 'jsdelivr' not in m.text and 'net::ERR' not in m.text and 'Failed to load resource' not in m.text else None)
            await pg.goto(URL); await pg.wait_for_timeout(1200)
            ids = await pg.evaluate("[...document.querySelectorAll('section[id]')].map(s=>s.id)")
            ov = await pg.evaluate("document.documentElement.scrollWidth - innerWidth")
            cards = await pg.evaluate("[...document.querySelectorAll('.cards:not(.soon-grid) .card')].map(c=>c.querySelector('h3').textContent)")
            print(w, 'secciones', ids, 'desborde', ov, 'tarjetas', len(cards))
            for c in cards: print('   -', c)
            if ov > 1: bad += 1
            # filtros
            await pg.click('.pfilters .chip[data-pf="motos"]'); await pg.wait_for_timeout(500)
            vis = await pg.evaluate("[...document.querySelectorAll('.cards:not(.soon-grid) .card')].filter(c=>!c.classList.contains('off')).length")
            print('   filtro motos ->', vis)
            await pg.click('.pfilters .chip[data-pf="all"]')
            # galería
            await pg.evaluate("document.querySelector('[data-project=brwave]').click()"); await pg.wait_for_timeout(700)
            d = await pg.evaluate("document.querySelector('#gal-desc').textContent.slice(0,60)")
            n = await pg.evaluate("document.querySelectorAll('#gal-body img, #gal-body video').length")
            print('   galería:', d, '| medios', n)
            await pg.keyboard.press('Escape')
            # transiciones y flow
            await pg.evaluate("document.querySelector('.flow').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(1500)
            await pg.screenshot(path=f'{SHOTS}/flow{w}.png')
            await pg.evaluate("document.querySelector('#perfil').scrollIntoView()"); await pg.wait_for_timeout(1200)
            await pg.evaluate("scrollBy(0,-260)"); await pg.wait_for_timeout(800)
            await pg.screenshot(path=f'{SHOTS}/trans{w}.png')
            if errs: bad += 1; print('   ERRORES:', *errs, sep='\n     ')
            await pg.close()
        await b.close()
    print('OK' if not bad else 'HAY PROBLEMAS'); sys.exit(1 if bad else 0)
asyncio.run(main())
