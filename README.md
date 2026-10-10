# Marcelo Pissani · Electricista de urgencias 24 h — Rosario

Landing estática (HTML + CSS + JS, sin build) para contratar a Marcelo Pissani, electricista de urgencias en Rosario.

- Scroll suave con [Lenis](https://github.com/darkroomengineering/lenis) y animaciones con [GSAP + ScrollTrigger](https://gsap.com) (servidos localmente en `js/vendor/`).
- Formulario que arma el mensaje y abre WhatsApp (no requiere backend).
- Respeta `prefers-reduced-motion`; si los scripts fallan, todo el contenido queda visible.

## Estructura

```
index.html
css/styles.css
js/main.js            interacciones
js/vendor/            lenis, gsap, ScrollTrigger
assets/img/           fotos (Unsplash, licencia libre)
assets/brand/         logos (originales en assets/brand/originales)
favicon.ico, site.webmanifest, robots.txt, sitemap.xml
vercel.json           headers y caché
```

## Desarrollo local

```bash
python -m http.server 5173
```

Abrir http://localhost:5173

## Deploy en Vercel

1. Subir el repo a GitHub.
2. En Vercel: **Add New → Project → Import** el repo.
3. Framework preset: **Other**. Sin build command ni output directory.
4. Deploy.

O por CLI: `npx vercel --prod`

> Si el dominio final no es `electricista-marcelo.vercel.app`, actualizar `canonical`, `og:image`, el JSON-LD de `index.html`, `robots.txt` y `sitemap.xml`.

## Datos de contacto usados

- Teléfono: 0341 330-2237 · WhatsApp: +54 9 341 330-2237
- Callao 800, Rosario, Santa Fe

---

Sitio web hecho por [Intelix](https://intelix.com.ar).
