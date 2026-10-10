/* Marcelo · Electricista 24 h — interacciones */
(() => {
  const WA_NUMBER = "5493413302237";
  const root = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  // Sin GSAP (CDN caído, etc.) o con movimiento reducido: todo visible y listo.
  if (!hasGsap || reduced) {
    root.classList.add("reduced");
    $$("[data-reveal],[data-fade]").forEach((el) => (el.style.opacity = 1));
    $$("[data-count]").forEach((el) => (el.textContent = formatCount(+el.dataset.count, +(el.dataset.decimals || 0))));
  }

  /* ---------- Año ---------- */
  const year = $("[data-year]");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Lenis ---------- */
  let lenis = null;
  if (window.Lenis && !reduced) {
    lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    if (hasGsap) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  // Anclas internas con Lenis
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      const target = id === "#top" ? 0 : $(id);
      if (target === null) return;
      e.preventDefault();
      closeMenu();
      if (lenis) lenis.scrollTo(target, { offset: id === "#top" ? 0 : -80, duration: 1.4 });
      else if (target === 0) window.scrollTo({ top: 0, behavior: "smooth" });
      else target.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ---------- Menú móvil ---------- */
  const burger = $("[data-burger]");
  const menu = $("[data-menu]");
  function closeMenu() {
    if (!root.classList.contains("menu-open")) return;
    root.classList.remove("menu-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Abrir menú");
    menu.setAttribute("aria-hidden", "true");
    lenis?.start();
  }
  burger?.addEventListener("click", () => {
    const open = !root.classList.contains("menu-open");
    if (!open) return closeMenu();
    root.classList.add("menu-open");
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Cerrar menú");
    menu.setAttribute("aria-hidden", "false");
    lenis?.stop();
  });
  document.addEventListener("keydown", (e) => e.key === "Escape" && closeMenu());

  /* ---------- Nav que se esconde ---------- */
  const nav = $("[data-nav]");
  let lastY = 0;
  const onScroll = (y) => {
    const down = y > lastY && y > 300;
    if (!root.classList.contains("menu-open")) nav.classList.toggle("is-hidden", down);
    lastY = y;
  };
  if (lenis) lenis.on("scroll", ({ scroll }) => onScroll(scroll));
  else window.addEventListener("scroll", () => onScroll(window.scrollY), { passive: true });

  /* ---------- Glow del hero sigue al cursor ---------- */
  const hero = $("[data-hero]");
  if (hero && window.matchMedia("(pointer: fine)").matches) {
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty("--mx", `${e.clientX - r.left}px`);
      hero.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  }

  /* ---------- Botones magnéticos ---------- */
  if (!reduced && window.matchMedia("(pointer: fine)").matches) {
    $$("[data-magnetic]").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.18;
        const y = (e.clientY - r.top - r.height / 2) * 0.28;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener("pointerleave", () => (el.style.transform = ""));
    });
  }

  /* ---------- Carrusel de opiniones arrastrable ---------- */
  const rail = $("[data-rail]");
  const track = $("[data-track]");
  if (rail && track) {
    let x = 0, target = 0, startX = 0, startTarget = 0, dragging = false, auto = !reduced, moved = 0;
    const max = () => Math.max(0, track.scrollWidth - rail.clientWidth + parseFloat(getComputedStyle(rail).paddingLeft) * 2);
    const clamp = (v) => Math.min(0, Math.max(-max(), v));

    rail.addEventListener("pointerdown", (e) => {
      dragging = true; moved = 0; auto = false;
      startX = e.clientX; startTarget = target;
      rail.classList.add("is-dragging");
      rail.setPointerCapture(e.pointerId);
    });
    rail.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      moved = e.clientX - startX;
      target = clamp(startTarget + moved * 1.2);
    });
    const end = () => { dragging = false; rail.classList.remove("is-dragging"); };
    rail.addEventListener("pointerup", end);
    rail.addEventListener("pointercancel", end);

    // Deriva lenta automática hasta que el usuario interactúa
    let dir = -1;
    const loop = () => {
      if (auto) {
        target += dir * 0.35;
        if (target <= -max()) dir = 1;
        if (target >= 0) dir = -1;
        target = clamp(target);
      }
      x += (target - x) * 0.09;
      track.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    window.addEventListener("resize", () => (target = clamp(target)));
  }

  /* ---------- Formulario → WhatsApp ---------- */
  const form = $("[data-form]");
  const err = $("[data-form-error]");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = new FormData(form);
    const nombre = (d.get("nombre") || "").toString().trim();
    const barrio = (d.get("barrio") || "").toString().trim();
    const detalle = (d.get("detalle") || "").toString().trim();
    const problema = d.get("problema");
    const urgente = d.get("urgente");

    $$(".field", form).forEach((f) => f.classList.remove("is-invalid"));
    const missing = [];
    if (!nombre) missing.push(form.nombre);
    if (!barrio) missing.push(form.barrio);
    if (missing.length) {
      missing.forEach((i) => i.closest(".field").classList.add("is-invalid"));
      err.textContent = "Completá tu nombre y barrio para que Marcelo sepa dónde ir.";
      missing[0].focus();
      return;
    }
    err.textContent = "";

    const lines = [
      `Hola Marcelo, soy ${nombre}.`,
      `${urgente ? "⚡ URGENTE — " : ""}${problema}.`,
      `Zona: ${barrio}.`,
      detalle && `Detalle: ${detalle}`,
      "(Te escribo desde tu web)",
    ].filter(Boolean);
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener");
  });

  if (!hasGsap || reduced) return;

  /* ==========================================================
     GSAP
     ========================================================== */
  gsap.registerPlugin(ScrollTrigger);
  const ease = "expo.out";

  // Intro: el voltaje sube, la luz parpadea y vuelve.
  const intro = $(".intro");
  const volt = $("[data-volt]");
  const heroImg = $("[data-hero-img]");
  const titleLines = $$(".hero__title .line > span");

  gsap.set(titleLines, { yPercent: 110 });
  gsap.set(heroImg, { opacity: 0, scale: 1.12 });
  lenis?.stop();

  const v = { n: 0 };
  const tl = gsap.timeline({ defaults: { ease } });
  tl.to(v, {
    n: 220, duration: 1.1, ease: "power2.inOut",
    onUpdate: () => (volt.textContent = String(Math.round(v.n)).padStart(3, "0")),
  })
    .to(intro, { opacity: 0, duration: 0.5, ease: "power2.out" }, "+=0.1")
    .set(intro, { display: "none" })
    // parpadeo de filamento
    .to(heroImg, { opacity: 0.5, duration: 0.06 }, "<-0.1")
    .to(heroImg, { opacity: 0.1, duration: 0.08 })
    .to(heroImg, { opacity: 0.8, duration: 0.05 })
    .to(heroImg, { opacity: 0.25, duration: 0.1 })
    .to(heroImg, { opacity: 1, duration: 0.9, ease: "power2.out" })
    .to(heroImg, { scale: 1, duration: 2.4, ease }, "<-0.4")
    .to(titleLines, { yPercent: 0, duration: 1.3, stagger: 0.12 }, "<")
    .to($$("[data-fade]"), { opacity: 1, y: 0, duration: 1.2, stagger: 0.1 }, "<0.4")
    .add(() => lenis?.start(), "<");
  gsap.set($$("[data-fade]"), { y: 24 });

  // Parallax del hero
  gsap.to(heroImg, {
    yPercent: -10,
    ease: "none",
    scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
  });

  // Reveals
  $$("[data-reveal]").forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 56, filter: "blur(8px)" },
      {
        opacity: 1, y: 0, filter: "blur(0px)", duration: 1.2, ease,
        clearProps: "filter",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      }
    );
  });

  // Parallax interno de imágenes
  $$("[data-parallax]").forEach((img) => {
    gsap.fromTo(img, { yPercent: -8 }, {
      yPercent: 6, ease: "none",
      scrollTrigger: { trigger: img.closest("article, .trust__shell") || img, start: "top bottom", end: "bottom top", scrub: true },
    });
  });

  // Contadores
  $$("[data-count]").forEach((el) => {
    const to = +el.dataset.count;
    const dec = +(el.dataset.decimals || 0);
    const o = { n: 0 };
    gsap.to(o, {
      n: to, duration: 1.8, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 90%", once: true },
      onUpdate: () => (el.textContent = formatCount(o.n, dec)),
    });
  });

  // FAQ: altura animada
  $$(".faq details").forEach((d) => {
    const sum = $("summary", d);
    const body = $(".faq__a", d);
    sum.addEventListener("click", (e) => {
      e.preventDefault();
      if (d.open) {
        gsap.to(body, { height: 0, opacity: 0, duration: 0.5, ease: "power3.inOut", onComplete: () => { d.open = false; ScrollTrigger.refresh(); } });
      } else {
        d.open = true;
        gsap.fromTo(body, { height: 0, opacity: 0 }, { height: "auto", opacity: 1, duration: 0.7, ease, onComplete: () => ScrollTrigger.refresh() });
      }
    });
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());

  function formatCount(n, dec) {
    return n.toLocaleString("es-AR", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }
})();
