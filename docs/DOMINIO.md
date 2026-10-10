# Dominio propio (bramdonaguilar.com)

1. Cloudflare → **Domain Registration → Register Domains** → busca `bramdonaguilar.com` y cómpralo (se paga anualmente; Cloudflare lo vende al costo).
2. Cloudflare → **Workers & Pages** → tu proyecto `bramdon-portafolio` → **Settings → Domains & Routes → Add → Custom domain** → `bramdonaguilar.com` (y `www.bramdonaguilar.com`). Cloudflare crea el DNS y el certificado HTTPS solo.
3. Actualiza las URLs del sitio (canonical, Open Graph, JSON-LD, robots, sitemap):
   ```bash
   python3 tools/set-domain.py https://bramdonaguilar.com/
   git add -A && git commit -m "Dominio propio" && git push
   ```
4. En Cloudflare configura una redirección `www` → dominio principal (Rules → Redirect Rules).
5. En Google Search Console agrega la propiedad del dominio y envía `https://bramdonaguilar.com/sitemap.xml`.
6. Para WhatsApp, comparte el enlace nuevo con `?v=1` la primera vez para evitar vistas previas viejas.

Si después de cambiar el dominio quieres que `aguilarzrw.github.io/...` redirija, es opcional; Google tratará el canonical como la dirección oficial.
