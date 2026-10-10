# Portafolio de Bramdon Aguilar

Portafolio web de **Bramdon Aguilar**, Creative Producer (Maracay, Venezuela).
Sitio estático: HTML + CSS + JavaScript puro. **No hay paso de compilación**: lo que está en el repositorio es lo que se publica.

- **Sitio:** https://aguilarzrw.github.io/bramdon-portafolio/
- **Hosting:** GitHub Pages (raíz de `main`) y Cloudflare (Worker con assets estáticos, conectado a GitHub). Cada `git push` a `main` publica.

## Estructura

```
index.html              Contenido y SEO (head, secciones, tarjetas)
assets/
  css/styles.css        Todos los estilos (colores y fuentes en :root)
  css/nojs.css          Respaldo si el navegador no ejecuta JavaScript
  js/data/projects.js   Datos de cada galería de proyecto  ← el que más se edita
  js/core.js            Utilidades compartidas ($, $$, reduce, fine)
  js/hero.js            Portada: nombre, timecode, palabras, video de fondo
  js/scroll.js          Scroll, revelado, contadores, menú móvil
  js/cursor.js          Cursor, botones magnéticos, adelanto de video
  js/brands.js          Marcas (carrusel y filtro) y carga de logos
  js/videos.js          Videos de lanzamiento (YouTube): reproductor + carrusel
  js/projects.js        Filtros de proyectos y galería
  img/                  Fotos (.webp), portadas de video y logos
    logos/  tools/      Logos de marcas y herramientas (ver LEEME.txt)
  video/                Clips (.mp4) y video de fondo
docs/                   Documentación (empieza por docs/INDICE.md)
tools/                  Scripts de ayuda (cambio de dominio, pruebas)
og-image.jpg            Vista previa al compartir (1200×630). No mover.
favicon*, icon-*, apple-touch-icon.png, site.webmanifest   Íconos
robots.txt, sitemap.xml SEO
_headers                Cabeceras de seguridad y caché (solo Cloudflare)
wrangler.jsonc, .assetsignore   Configuración de Cloudflare
```

## Tareas frecuentes

| Quiero… | Dónde está explicado |
|---|---|
| Agregar o editar un proyecto | `docs/GUIA-CONTENIDO.md` |
| Cambiar una marca, habilidad o herramienta | `docs/GUIA-CONTENIDO.md` |
| Entender cómo está armado el código | `docs/ARQUITECTURA.md` |
| Usar el dominio propio `bramdonaguilar.com` | `docs/DOMINIO.md` |
| Revisar seguridad y SEO | `docs/SEGURIDAD-SEO.md` |

## Probar en local

```bash
python3 -m http.server 8765        # luego abrir http://localhost:8765/
python3 tools/test-smoke.py        # prueba automática (requiere Playwright)
```

Después de publicar, si no ves los cambios, recarga sin caché (Ctrl + F5).
Para WhatsApp, que guarda la vista previa por enlace, comparte con `?v=2`, `?v=3`…
