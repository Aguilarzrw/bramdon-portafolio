# Arquitectura

## Principios
- **Sin compilación ni dependencias.** HTML, CSS y JS puros; se puede abrir con un servidor estático cualquiera.
- **Scripts clásicos con `defer`**, no módulos ES, para que el sitio también funcione abriendo `index.html` directamente.
- **Una sola hoja de estilos** (`assets/css/styles.css`) con variables en `:root`.
- **Contenido en el HTML, datos de galería en `assets/js/data/projects.js`.**
- Todo script de la página es un archivo propio: no hay JavaScript en línea. Esto permite una CSP estricta (`script-src 'self'`).

## Orden de carga de scripts
Todos con `defer` (se ejecutan en orden, tras leer el HTML):

1. `data/projects.js` define `window.PROJECTS`.
2. `core.js` define las constantes globales `reduce` (movimiento reducido), `fine` (hay mouse) y los atajos `$` / `$$`.
3. `hero.js`, `scroll.js`, `cursor.js`, `brands.js`, `videos.js`, `projects.js`: cada archivo son bloques independientes (IIFE) que buscan sus elementos en el DOM y se desactivan solos si no existen.

Si se agrega un script nuevo que use `$`, debe ir **después** de `core.js` en `index.html`.

## Secciones de `index.html` (en orden)
`hero` → `metrics` → `#proyectos` → `#perfil` → `#experiencia` → `#marcas` → `#skills` → `#contacto`.
Cada una tiene un comentario `<!-- ====== NOMBRE ====== -->` encima. El menú (`#menu`) enlaza por `id`.

Los fondos alternan negro / `--ink`. La transición entre secciones usa `section + section::before` (degradado desde el color anterior, variable `--prev`) y `::after` (línea de luz). Si cambias el fondo de una sección, actualiza `--prev` de la siguiente (bloque «Transiciones entre secciones» del CSS).

## Revelado y animación
- `<html class="js">` está fijo; `assets/css/nojs.css` (dentro de `<noscript>`) deshace los estados ocultos si no hay JS.
- Elementos con `data-reveal` aparecen al entrar en pantalla (`IntersectionObserver`, en `scroll.js`). `data-stagger` en el padre escalona a los hijos.
- `prefers-reduced-motion` desactiva animaciones (CSS al final y constante `reduce` en JS).

## Proyectos
- Cada tarjeta es `button.card[data-project="clave"]` con `data-cats` (filtros) y `data-preview` (video que se reproduce al pasar el mouse).
- La galería (`<dialog id="gal">`) lee `PROJECTS[clave]` de `data/projects.js`.
- `data-wide="1"` hace la tarjeta ancha solo cuando el filtro es «Todos».
- Las tarjetas «Material en camino» son `article.card.pending` (sin galería).
- La cuadrícula principal tiene 2 columnas: mantén el número de tarjetas **par** (más la ancha).

## Marcas, habilidades y herramientas
- Marcas: `li.brand[data-logo="slug"][data-cat]` en `#marcas`; `brands.js` construye con ellas el carrusel animado `#bmarq` (`.bcard`) y busca el logo en `assets/img/logos/slug.{svg,png,webp}`; si no existe, muestra un monograma.
- Herramientas: lista `TOOLS` al inicio del bloque de logos en `brands.js`. Busca `assets/img/tools/clave.*`, luego `simple-icons` (jsDelivr) y por último un monograma.
- Habilidades: bloques `.skill` en `#skills` (HTML).

## Videos de lanzamiento (YouTube)
`#videos.vlaunch`: la miniatura grande es una «fachada» (no carga YouTube hasta pulsar play, con `youtube-nocookie.com`). La lista de miniaturas `.vthumb[data-yt]` define los videos; el carrusel avanza solo cada 8 s y se detiene al interactuar.

## Despliegue
- **GitHub Pages:** sirve la raíz de `main`. `.nojekyll` evita el procesado de Jekyll.
- **Cloudflare:** `wrangler.jsonc` sirve la raíz como assets estáticos; `.assetsignore` deja fuera `.git`, `docs`, `tools`, etc. (límite de 25 MiB por archivo). `_headers` solo lo lee Cloudflare.
