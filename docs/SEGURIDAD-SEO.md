# Seguridad y SEO

## Seguridad (sitio estático: no hay servidor, base de datos ni formularios)
- **CSP estricta** (`index.html` en `<meta>` y `_headers` en cabecera): scripts y estilos solo propios; únicas conexiones externas permitidas: Google Fonts, miniaturas de YouTube (`i.ytimg.com`), reproductor `youtube-nocookie.com` e íconos de `cdn.jsdelivr.net`. Además `object-src 'none'`, `base-uri 'self'`, `form-action 'none'`, `frame-ancestors 'none'` (solo en cabecera).
- **Cabeceras** (`_headers`, solo Cloudflare): `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Strict-Transport-Security`, `Cross-Origin-Opener-Policy`, `Permissions-Policy` (sin cámara, micrófono ni geolocalización).
- GitHub Pages ignora `_headers`; allí protege la CSP del `<meta>` y HTTPS forzado.
- **Enlaces externos** con `rel="noopener noreferrer"`. YouTube se carga con el dominio sin cookies y solo al pulsar play.
- No hay secretos en el repositorio (`.dev.vars`, `.wrangler` están en `.gitignore`). El teléfono y el correo del sitio son públicos a propósito.
- **Si agregas un servicio externo** (analítica, mapa, formulario) hay que añadir su dominio a la CSP en **ambos** lugares (`index.html` y `_headers`) o el navegador lo bloqueará. No uses scripts en línea: crea un archivo en `assets/js/`.
- Mantén 2FA activo en GitHub y Cloudflare (es lo que realmente protege el sitio).

## SEO
- `<title>` y `meta description` únicos, `canonical`, `robots` con `max-image-preview:large`, `lang="es"`, `og:locale es_VE`.
- **Open Graph / Twitter Card** con `og-image.jpg` (1200×630, en la raíz).
- **Datos estructurados JSON-LD** (`@graph`): `WebSite`, `WebPage`, `Person` (ocupación, ciudad, empleador, conocimientos, redes) y un `VideoObject` por cada video de YouTube. Valida en https://search.google.com/test/rich-results después de publicar.
- `robots.txt` y `sitemap.xml` apuntan a la URL pública; se actualizan con `tools/set-domain.py`. Actualiza `lastmod` del sitemap al publicar cambios grandes.
- Un solo `<h1>` (nombre), `<h2>` por sección, `<h3>` por tarjeta. Imágenes decorativas con `alt=""`; las informativas (retrato) con texto.
- Rendimiento: fuentes con `preconnect`, imágenes `loading="lazy"` con `width/height`, hero con `preload`, los videos de galería se cargan solo al abrir el proyecto (`preload="none"`) y el de portada es el único con `preload="auto"`, YouTube con fachada.

## Lista de revisión antes de publicar
- [ ] `python3 tools/test-smoke.py` sin errores (incluye violaciones de CSP).
- [ ] Todas las rutas `assets/…` existen (el script lo detecta como imagen o video roto).
- [ ] Tarjetas principales en número par.
- [ ] Canonical / OG / sitemap con el dominio correcto.
- [ ] Vista previa en WhatsApp con `?v=N`.
- [ ] PageSpeed Insights (móvil) y prueba de resultados enriquecidos.
