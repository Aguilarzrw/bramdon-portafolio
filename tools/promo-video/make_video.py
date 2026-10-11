#!/usr/bin/env python3
"""Genera un video promocional vertical (1080x1920) de una web, grabada en un
marco de teléfono, con leyendas, música sintética y pantalla final con CTA.
Uso:  python3 make_video.py [config.json] [salida.mp4]
Requisitos: playwright (+chromium), pillow, numpy, ffmpeg, fuente Inter."""
import asyncio, json, math, os, subprocess, sys, tempfile, time, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
CFG = json.load(open(sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'config.json')))
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, 'promo.mp4')
WORK = tempfile.mkdtemp(prefix='promo_')
os.makedirs(f'{WORK}/cap'); os.makedirs(f'{WORK}/frames')
FPS = CFG['fps']; T = CFG['duracion']; N = int(T * FPS)
W, H = 1080, 1920
ACC = tuple(CFG['color_acento']); BGC = tuple(CFG['color_fondo'])
MIST = (154, 162, 177); WHITE = (245, 246, 248)
ease3 = lambda x: (lambda x: x * x * (3 - 2 * x))(max(0, min(1, x)))
ease_o = lambda x: 1 - (1 - max(0, min(1, x))) ** 3

# ---------- 1) grabación del sitio ----------
async def capture():
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(CFG['puerto']), '-d', CFG['sitio']],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1)
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
            ctx = await b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2,
                                      is_mobile=True, has_touch=True)
            pg = await ctx.new_page()
            v = CFG.get('video_a_reemplazar', {})
            if v.get('webm'):  # el Chromium del sandbox no decodifica H.264: usa una copia .webm
                await pg.route(v['patron'], lambda r: r.fulfill(path=v['webm'], content_type='video/webm'))
            await pg.goto(f"http://localhost:{CFG['puerto']}/"); await pg.wait_for_timeout(1500)
            if CFG.get('revelar'):
                await pg.evaluate(f"document.querySelectorAll({json.dumps(CFG['revelar'])}).forEach(e=>e.classList.add('in'))")
            await pg.wait_for_timeout(1200)
            maxy = await pg.evaluate("document.documentElement.scrollHeight-innerHeight")
            async def ypos(spec):
                if spec == 'fin': return maxy
                if isinstance(spec, (int, float)): return spec
                return await pg.evaluate(f"(()=>{{const e=document.querySelector({json.dumps(spec['sel'])});return e.getBoundingClientRect().top+scrollY}})()") + spec.get('dy', 0)
            kf = [(s['t'], await ypos(s['y'])) for s in CFG['escenas']]
            def scroll_at(t):
                for (t0, y0), (t1, y1) in zip(kf, kf[1:]):
                    if t0 <= t <= t1: return y1 if t1 == t0 else y0 + (y1 - y0) * ease3((t - t0) / (t1 - t0))
                return kf[-1][1]
            g = CFG.get('abrir_galeria'); opened = closed = False
            for i in range(int(kf[-1][0] * FPS)):
                t = i / FPS
                if g and g['desde'] <= t < g['hasta']:
                    if not opened:
                        await pg.evaluate(f"document.querySelector({json.dumps(g['selector'])}).click()"); opened = True
                        await pg.wait_for_timeout(500)
                    if t >= g['scroll_desde']:
                        k = ease3((t - g['scroll_desde']) / (g['hasta'] - g['scroll_desde'] - 1.5))
                        await pg.evaluate(f"document.querySelector({json.dumps(g['dialogo'])}).scrollTop={int(k * g['scroll_px'])}")
                else:
                    if g and opened and not closed and t >= g['hasta']:
                        await pg.evaluate(f"document.querySelector({json.dumps(g['dialogo'])}).close()"); closed = True
                        await pg.wait_for_timeout(300)
                    await pg.evaluate(f"scrollTo({{top:{scroll_at(t)},behavior:'instant'}})")
                await pg.wait_for_timeout(30)
                await pg.screenshot(path=f'{WORK}/cap/c{i:04d}.jpg', type='jpeg', quality=90)
            await b.close()
    finally:
        srv.terminate()
    return len(os.listdir(f'{WORK}/cap'))

# ---------- 2) composición de cuadros ----------
def compose(capn):
    F = '/usr/share/fonts/opentype/inter/Inter-%s.otf'
    font = lambda w, s: ImageFont.truetype(F % w, s)
    yy, xx = np.mgrid[0:H, 0:W]
    bg = np.zeros((H, W, 3)); bg[:] = BGC
    a = np.array(ACC) / 255
    bg += np.exp(-(((xx - W * .85) / 700) ** 2 + ((yy - H * .05) / 600) ** 2))[..., None] * a * 120
    bg += np.exp(-(((xx - W * .1) / 600) ** 2 + ((yy - H * .95) / 500) ** 2))[..., None] * a * 70
    BG = Image.fromarray(np.clip(bg, 0, 255).astype('uint8'))
    SW, SH, SX, SY = 700, 1514, 190, 330
    mask = Image.new('L', (SW, SH), 0); ImageDraw.Draw(mask).rounded_rectangle((0, 0, SW - 1, SH - 1), radius=56, fill=255)
    ph = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(ph).rounded_rectangle((SX - 18, SY - 18, SX + SW + 18, SY + SH + 18), radius=76, fill=(24, 28, 36, 255), outline=(60, 68, 86, 255), width=3)
    sh = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle((SX - 18, SY + 10, SX + SW + 18, SY + SH + 50), radius=80, fill=(0, 0, 0, 170))
    BASE = BG.convert('RGBA'); BASE.alpha_composite(sh.filter(ImageFilter.GaussianBlur(40))); BASE.alpha_composite(ph)
    # leyendas: cada escena con "leyenda" dura hasta la siguiente leyenda
    sc = [s for s in CFG['escenas'] if 'leyenda' in s]
    caps = [(s['t'], sc[i + 1]['t'] if i + 1 < len(sc) else CFG['escenas'][-1]['t'], *s['leyenda']) for i, s in enumerate(sc)]
    def tc(d, y, txt, f, fill, al=255):
        d.text(((W - d.textlength(txt, font=f)) / 2, y), txt, font=f, fill=fill + (al,))
    fT, fS, fB = font('ExtraBold', 66), font('Regular', 38), font('Bold', 30)
    OUTRO = T - 2.6
    for i in range(N):
        t = i / FPS
        im = BASE.copy()
        cap = Image.open(f'{WORK}/cap/c{min(i, capn - 1):04d}.jpg').convert('RGB').resize((SW, SH), Image.LANCZOS)
        im.paste(cap, (SX, SY), mask)
        ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
        for (a0, b0, t1, t2) in caps:
            if a0 <= t < b0:
                p = ease_o((t - a0) / .5); q = 1 - ease_o((t - (b0 - .3)) / .3) if t > b0 - .3 else 1
                al = int(255 * p * q); dy = int((1 - p) * 30)
                tc(d, 105 + dy, t1, fT, WHITE, al); tc(d, 200 + dy, t2, fS, MIST, al)
        tc(d, 1822, CFG['pie'], fB, MIST, 200)
        d.rectangle((0, H - 10, int(W * t / T), H), fill=ACC + (255,))
        im.alpha_composite(ov)
        if t >= OUTRO:
            p = ease_o((t - OUTRO) / .6); a = int(255 * p)
            im.alpha_composite(Image.new('RGBA', (W, H), BGC + (int(245 * p),)))
            d = ImageDraw.Draw(im)
            tc(d, 540, CFG['cta_titulo'], font('Bold', 46), ACC, a)
            tc(d, 610, CFG['cta_grande'], font('ExtraBold', 150), WHITE, a)
            for j, l in enumerate(CFG['cta_lineas']): tc(d, 860 + 60 * j, l, font('Regular', 40), MIST, a)
            d.rounded_rectangle((190, 1090, 890, 1210), radius=60, fill=ACC + (a,))
            tc(d, 1122, CFG['cta_boton'], font('Bold', 40), WHITE, a)
            tc(d, 1330, CFG['autor'], font('ExtraBold', 58), WHITE, a)
            tc(d, 1410, CFG['rol'], font('Regular', 38), MIST, a)
            tc(d, 1600, CFG['proyecto_texto'], font('Regular', 28), MIST, int(a * .8))
            tc(d, 1645, CFG['url_publica'], font('Regular', 27), ACC, int(a * .9))
        im.convert('RGB').save(f'{WORK}/frames/f{i:04d}.png', compress_level=1)

# ---------- 3) música sintética (acordes suaves + bombo + hi-hat) ----------
def music():
    sr = 44100; t = np.arange(int(sr * T)) / sr; beat = 60 / 96
    ch = [(110, 138.6, 164.8), (87.3, 110, 130.8), (130.8, 164.8, 196), (98, 123.5, 146.8)]
    y = np.zeros_like(t)
    for i, t0 in enumerate(np.arange(0, T, beat * 4)):
        c = ch[i % 4]; m = (t >= t0) & (t < t0 + beat * 4); x = t[m] - t0
        env = np.minimum(1, x / .5) * np.exp(-x / 6)
        for f in c: y[m] += np.sin(2 * np.pi * f * x) * .12 * env + np.sin(2 * np.pi * f * 2 * x) * .03 * env
        y[m] += np.sin(2 * np.pi * c[0] / 2 * x) * .18 * env
    for t0 in np.arange(0, T, beat):
        m = (t >= t0) & (t < t0 + .15); x = t[m] - t0
        y[m] += np.sin(2 * np.pi * (55 + 90 * np.exp(-x * 30)) * x) * .35 * np.exp(-x * 18)
    for t0 in np.arange(beat / 2, T, beat):
        m = (t >= t0) & (t < t0 + .05); x = t[m] - t0
        y[m] += np.random.randn(m.sum()) * .03 * np.exp(-x * 80)
    y *= np.minimum(1, t / 1.5) * np.minimum(1, (T - t) / 2); y = y / np.abs(y).max() * .8
    w = wave.open(f'{WORK}/music.wav', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
    w.writeframes((y * 32767).astype('<i2').tobytes()); w.close()

if __name__ == '__main__':
    capn = asyncio.run(capture()); print('grabado:', capn, 'cuadros')
    compose(capn); music()
    audio = os.environ.get('MUSICA') or f'{WORK}/music.wav'   # MUSICA=/ruta/cancion.mp3 para usar la tuya
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(FPS), '-i', f'{WORK}/frames/f%04d.png',
                    '-i', audio, '-t', str(T), '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p',
                    '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', OUT], check=True)
    print('listo ->', OUT)
