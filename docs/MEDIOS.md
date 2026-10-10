# Fotos y videos

| Tipo | Formato | Tamaño recomendado |
|---|---|---|
| Fotos | `.webp`, calidad ~80 | máx. 1800 px de lado largo |
| Portadas de video | `.webp` | 960 px de ancho |
| Videos | `.mp4` H.264 + AAC mono | 720p, 30 fps, 2–10 MB cada uno |

Comando ffmpeg usado para los videos:
```bash
ffmpeg -i original.mp4 -vf "scale=-2:720" -c:v libx264 -crf 22 -preset slow -r 30 \
       -c:a aac -ac 1 -b:a 80k -movflags +faststart salida.mp4
```
`+faststart` es obligatorio: permite reproducir antes de descargar todo el archivo.
Portada de un video: `ffmpeg -ss 2 -i salida.mp4 -frames:v 1 -vf scale=960:-2 poster.webp`.

Límites: Cloudflare no acepta archivos de más de 25 MiB; GitHub rechaza más de 100 MB. Si un video pasa de ~15 MB, súbelo a YouTube.
Si el original es de baja resolución (WhatsApp, 464×832), re-codificar no mejora la calidad: usa el archivo original en alta.
