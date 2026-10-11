# Generador de video promocional de una web

Crea un video vertical (1080×1920, ~24 s) para Reels/TikTok/Historias: la web dentro de un
teléfono, navegando sola, con leyendas, música y una pantalla final con llamada a la acción.

## Uso
    python3 tools/promo-video/make_video.py                      # usa config.json
    python3 tools/promo-video/make_video.py otra.json salida.mp4
    MUSICA=/ruta/cancion.mp3 python3 tools/promo-video/make_video.py   # tu propia música

Requisitos: Python con `playwright` (y Chromium), `pillow`, `numpy`, `ffmpeg` y la fuente Inter.

## Para una web nueva (copia config.json y cambia esto)
- `sitio`: carpeta de la web (se sirve sola en localhost, sin build).
- `autor`, `rol`, `pie`: tus datos. `url_publica`, `proyecto_texto`: la web que se muestra.
- `cta_*`: textos del final. Pon aquí tu @ o WhatsApp en `cta_boton` (ej. "Escríbeme: @tuusuario").
- `color_acento` / `color_fondo`: colores RGB de la marca.
- `escenas`: lista de momentos `t` (segundos) con la posición de scroll `y`:
  un selector CSS (`{"sel":"#seccion","dy":-100}`), un número en px, o `"fin"` (final de la página).
  Si añades `leyenda: [titulo, subtitulo]` aparece ese texto hasta la siguiente leyenda.
- `abrir_galeria`: opcional; abre un diálogo/galería en un rango de tiempo. Bórralo si la web no tiene.
- `revelar`: selector de elementos con animación de entrada que deben verse ya visibles.
- `video_a_reemplazar`: si la web tiene video de portada en MP4 (H.264), el Chromium de pruebas no
  lo decodifica; pasa una copia `.webm` en `webm` para que se vea en la grabación.

## Notas
- Los cuadros temporales se guardan en una carpeta temporal; el MP4 queda en `promo.mp4`.
- La música es sintética (acordes suaves). Con `MUSICA=` se reemplaza por una canción tuya.
- Tarda unos minutos (graba ~500 cuadros y los compone).
