/* ============================================================================
   LLMUN 2027 — Interactions du site
   Amélioration progressive : le balisage fonctionne sans JS, ce script ajoute
   l'en-tête collant, le tiroir de navigation mobile, le lien actif et les
   apparitions au défilement.
   ========================================================================= */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------- En-tête collant */
  const header = document.querySelector('.site-header');

  if (header) {
    const setStuck = () => header.classList.toggle('is-stuck', window.scrollY > 40);
    setStuck();
    window.addEventListener('scroll', setStuck, { passive: true });
  }

  /* -------------------------------------- Lien de navigation courant */
  const navLinks = Array.from(document.querySelectorAll('.nav-links a:not(.nav-cta)'));
  const here = window.location.pathname.replace(/\\/g, '/').replace(/index\.html$/, '');

  navLinks.forEach((link, i) => {
    link.style.setProperty('--i', String(i));

    const target = link.getAttribute('href');
    if (!target || target.startsWith('#') || target.startsWith('mailto:')) return;

    const path = new URL(target, window.location.href).pathname
      .replace(/\\/g, '/')
      .replace(/index\.html$/, '');

    if (path === here) link.setAttribute('aria-current', 'page');
  });

  /* ------------------------------------- Tiroir de navigation mobile */
  const toggle = document.querySelector('.nav-toggle');
  const drawer = document.querySelector('.nav-links');

  if (toggle && drawer) {
    const scrim = document.createElement('div');
    scrim.className = 'nav-scrim';
    document.body.appendChild(scrim);

    const setOpen = (open) => {
      document.body.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
      if (open) {
        const first = drawer.querySelector('a');
        if (first) window.setTimeout(() => first.focus({ preventScroll: true }), 220);
      }
    };

    const close = () => {
      if (!document.body.classList.contains('nav-open')) return;
      setOpen(false);
      toggle.focus({ preventScroll: true });
    };

    toggle.addEventListener('click', () => {
      setOpen(!document.body.classList.contains('nav-open'));
    });

    scrim.addEventListener('click', close);
    drawer.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setOpen(false)));

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') close();
    });

    // Piège à focus léger : on garde la tabulation dans le tiroir ouvert.
    document.addEventListener('focusin', (event) => {
      if (!document.body.classList.contains('nav-open')) return;
      if (drawer.contains(event.target) || toggle.contains(event.target)) return;
      const first = drawer.querySelector('a');
      if (first) first.focus({ preventScroll: true });
    });

    // Retour au bureau : on referme pour éviter un état incohérent.
    const desktop = window.matchMedia('(min-width: 901px)');
    const onChange = (event) => {
      if (event.matches) setOpen(false);
    };
    if (desktop.addEventListener) desktop.addEventListener('change', onChange);
    else desktop.addListener(onChange);
  }

  /* ---------------------------------------- Apparitions au défilement */
  const revealables = document.querySelectorAll('.reveal');

  if (revealables.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealables.forEach((el) => el.classList.add('is-visible'));
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          });
        },
        { rootMargin: '0px 0px -12% 0px', threshold: 0.08 }
      );

      revealables.forEach((el) => observer.observe(el));

      // Décalage progressif entre éléments d'une même grille.
      document.querySelectorAll('[data-stagger]').forEach((group) => {
        Array.from(group.children).forEach((child, i) => {
          if (child.classList.contains('reveal')) {
            child.style.setProperty('--reveal-delay', `${Math.min(i, 6) * 90}ms`);
          }
        });
      });
    }
  }

  /* ------------------------------------------- FAQ : une seule ouverte */
  const faqItems = Array.from(document.querySelectorAll('.faq-list .faq-item'));

  faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      faqItems.forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });

  /* ---------------------------------------------- Année du pied de page */
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
})();
