# Guía de contenido

## Agregar un proyecto
1. **Medios.** Fotos en `assets/img/` (`.webp`) y videos en `assets/video/` (`.mp4`). Para cada video crea una portada `assets/img/v-nombre.webp`. Ver `MEDIOS.md`.
2. **Tarjeta** en `index.html`, dentro de `<div class="cards">` (copia una existente):
   ```html
   <button class="card" type="button" data-project="clave" data-cats="lanzamientos motos"
           data-preview="assets/video/nombre.mp4" data-reveal="clip" aria-haspopup="dialog">
     <span class="shot"><img src="assets/img/foto.webp" alt="" loading="lazy" decoding="async"><span class="count">5 fotos · 2 videos</span></span>
     <span class="info">
       <span class="role">Rol</span><h3>Título</h3>
       <span class="brandline">Marca</span>
       <span class="txt">Texto corto (1–2 líneas).</span>
       <span class="open">Ver galería</span>
     </span>
   </button>
   ```
   `data-cats` admite: `lanzamientos`, `motos`, `eventos`, `campanas` (varias separadas por espacio).
3. **Datos de la galería** en `assets/js/data/projects.js`:
   ```js
   clave: { title, brand, role, desc, photos: ["assets/img/…"], videos: [{ src, poster, title }] }
   ```
   `desc` admite saltos de línea (`\n`) y se muestran tal cual. La clave debe ser igual a `data-project`.
4. Mantén la cuadrícula cuadrada: cada tarjeta ancha (`wide`, ocupa 2 columnas) cuenta como 2; el total debe ser par.

## Editar un proyecto existente
Cambia el título/texto corto en la tarjeta (`index.html`) **y** el título/descripción en `projects.js`. Los contadores («5 fotos · 2 videos») están escritos a mano en la tarjeta.

## Quitar un proyecto
Borra la tarjeta en `index.html` y su entrada en `projects.js`. Los archivos de `assets/` pueden quedarse o borrarse si nadie más los usa (`grep -r nombre.webp .`).

## Proyectos en camino
La sección «Próximos proyectos» se retiró porque todos tienen material. Para volver a usarla, añade `<div class="soon-head">` y `<div class="cards soon-grid">` con `article.card.pending` (los estilos `.soon-*` siguen en el CSS).

## Videos de YouTube (carrusel «Videos de lanzamiento»)
En `#videos` duplica un `<button class="vthumb">` con el ID del video (`data-yt`), `data-title`, `data-role` y la miniatura `https://i.ytimg.com/vi/ID/mqdefault.jpg`. Añade también el video en el JSON-LD (`VideoObject`) del `<head>` para SEO.

## Marcas
Duplica un `<li class="brand">` en `#marcas` con `data-logo="slug"` y `data-cat` (sector del filtro). El carrusel se construye solo desde esa lista. Para poner el logo real: `assets/img/logos/slug.svg` (o `.png`/`.webp`). Instrucciones en `assets/img/logos/LEEME.txt`.

## Herramientas y habilidades
- Herramientas: lista `TOOLS` en `assets/js/brands.js` (`k` clave, nombre, color `c`). Logo opcional en `assets/img/tools/clave.svg`.
- Habilidades: bloques `.skill` en `#skills` de `index.html`.

## Textos de contacto
WhatsApp: busca `wa.me/` en `index.html` (botón «Contactar ya» del menú y de Contacto). Cambia número y mensaje en ambos.

