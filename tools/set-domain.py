"""Cambia la URL pública del sitio en todos los archivos que la usan.

Uso:
    python3 tools/set-domain.py https://bramdonaguilar.com/

Actualiza: canonical, Open Graph, Twitter, JSON-LD (index.html), robots.txt
y sitemap.xml. Corre desde la raíz del repositorio. Ver docs/DOMINIO.md."""
import re, sys, datetime, pathlib

if len(sys.argv) != 2 or not sys.argv[1].startswith('https://'):
    sys.exit('Uso: python3 tools/set-domain.py https://tudominio.com/')
new = sys.argv[1].rstrip('/') + '/'
root = pathlib.Path(__file__).resolve().parent.parent
idx = root / 'index.html'
m = re.search(r'<link rel="canonical" href="([^"]+)"', idx.read_text(encoding='utf8'))
old = m.group(1)
for name in ('index.html', 'robots.txt', 'sitemap.xml'):
    f = root / name
    t = f.read_text(encoding='utf8').replace(old, new)
    if name == 'sitemap.xml':
        t = re.sub(r'<lastmod>.*?</lastmod>', '<lastmod>%s</lastmod>' % datetime.date.today(), t)
    f.write_text(t, encoding='utf8')
print('URL cambiada de', old, 'a', new)
