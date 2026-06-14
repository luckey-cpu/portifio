/* ============================================================
   Portfolio — interactivity (vanilla JS, no dependencies)
   ============================================================ */
(() => {
  'use strict';

  /* ---------- Preloader ---------- */
  window.addEventListener('load', () => {
    const pre = document.getElementById('preloader');
    if (pre) setTimeout(() => pre.classList.add('hide'), 400);
  });

  /* ---------- Year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Theme (dark/light) ---------- */
  const root = document.documentElement;
  const themeBtn = document.getElementById('themeBtn');
  const themeIcon = themeBtn?.querySelector('i');

  const setTheme = (mode) => {
    root.classList.toggle('dark', mode === 'dark');
    if (themeIcon) themeIcon.className = mode === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    if (themeBtn) themeBtn.setAttribute('aria-pressed', String(mode === 'dark'));
    try { localStorage.setItem('theme', mode); } catch {}
  };

  const savedTheme = (() => { try { return localStorage.getItem('theme'); } catch { return null; } })();
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

  themeBtn?.addEventListener('click', () => {
    setTheme(root.classList.contains('dark') ? 'light' : 'dark');
  });

  /* ---------- Accent palette ---------- */
  const accents = {
    violet:  { a: '#7c3aed', b: '#06b6d4' },
    blue:    { a: '#2563eb', b: '#06b6d4' },
    emerald: { a: '#10b981', b: '#22d3ee' },
    rose:    { a: '#f43f5e', b: '#f59e0b' },
    amber:   { a: '#f59e0b', b: '#ef4444' },
    cyan:    { a: '#06b6d4', b: '#7c3aed' },
  };
  const applyAccent = (name) => {
    const c = accents[name] || accents.violet;
    root.style.setProperty('--accent', c.a);
    root.style.setProperty('--accent-2', c.b);
    try { localStorage.setItem('accent', name); } catch {}
  };
  const savedAccent = (() => { try { return localStorage.getItem('accent'); } catch { return null; } })();
  applyAccent(savedAccent || 'violet');

  const paletteBtn = document.getElementById('paletteBtn');
  const palette = document.getElementById('palette');
  paletteBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = !palette.hidden;
    palette.hidden = open;
    paletteBtn.setAttribute('aria-expanded', String(!open));
  });
  document.addEventListener('click', (e) => {
    if (!palette || palette.hidden) return;
    if (!palette.contains(e.target) && e.target !== paletteBtn) {
      palette.hidden = true;
      paletteBtn?.setAttribute('aria-expanded', 'false');
    }
  });
  palette?.querySelectorAll('.swatch').forEach((s) => {
    s.addEventListener('click', () => applyAccent(s.dataset.accent));
  });

  /* ---------- Mobile menu ---------- */
  const menuBtn = document.getElementById('menuBtn');
  const navLinks = document.getElementById('navLinks');
  menuBtn?.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.querySelector('i').className = open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
  });
  navLinks?.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuBtn?.setAttribute('aria-expanded', 'false');
      const i = menuBtn?.querySelector('i'); if (i) i.className = 'fa-solid fa-bars';
    })
  );

  /* ---------- Active section highlight ---------- */
  const sections = document.querySelectorAll('main section[id]');
  const linkMap = new Map();
  document.querySelectorAll('.nav-link').forEach((l) => {
    const id = l.getAttribute('href')?.replace('#', '');
    if (id) linkMap.set(id, l);
  });
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        linkMap.forEach((l) => l.classList.remove('active'));
        linkMap.get(en.target.id)?.classList.add('active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  sections.forEach((s) => spy.observe(s));

  /* ---------- Reveal on scroll ---------- */
  const revealer = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        revealer.unobserve(en.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((el) => revealer.observe(el));

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll('.stat-num');
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      const target = parseInt(el.dataset.count || '0', 10);
      const duration = 1400;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        el.textContent = Math.round(target * (0.2 + 0.8 * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = String(target) + '+';
      };
      requestAnimationFrame(tick);
      countObs.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach((c) => countObs.observe(c));

  /* ---------- Skill bars ---------- */
  const barObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.querySelectorAll('.track i').forEach((bar) => {
        const pct = parseInt(bar.dataset.pct || '0', 10);
        bar.style.width = pct + '%';
      });
      barObs.unobserve(en.target);
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.skill-cat').forEach((c) => barObs.observe(c));

  /* ---------- Typing effect ---------- */
  const roles = ['Student', 'Aspiring Web Developer', 'Frontend Enthusiast', 'Programmer'];
  const typedEl = document.getElementById('typed');
  if (typedEl) {
    let r = 0, i = 0, deleting = false;
    const tick = () => {
      const word = roles[r];
      typedEl.textContent = word.substring(0, i);
      if (!deleting && i < word.length) { i++; setTimeout(tick, 90); }
      else if (deleting && i > 0) { i--; setTimeout(tick, 45); }
      else {
        deleting = !deleting;
        if (!deleting) r = (r + 1) % roles.length;
        setTimeout(tick, deleting ? 1400 : 250);
      }
    };
    tick();
  }

  /* ---------- Project filter ---------- */
  const chips = document.querySelectorAll('.chip');
  const projects = document.querySelectorAll('.project');
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => { c.classList.remove('active'); c.setAttribute('aria-selected', 'false'); });
      chip.classList.add('active'); chip.setAttribute('aria-selected', 'true');
      const f = chip.dataset.filter;
      projects.forEach((p) => {
        const show = f === 'all' || p.dataset.cat === f;
        p.classList.toggle('hide', !show);
      });
    });
  });

  /* ---------- 3D project tilt ---------- */
  projects.forEach((p) => {
    p.addEventListener('mousemove', (e) => {
      const r = p.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      p.style.transform = `translateY(-6px) perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
    });
    p.addEventListener('mouseleave', () => { p.style.transform = ''; });
  });

  /* ---------- Back to top ---------- */
  const toTop = document.getElementById('toTop');
  window.addEventListener('scroll', () => {
    toTop?.classList.toggle('show', window.scrollY > 500);
  }, { passive: true });
  toTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- Resume demo button ---------- */
  document.getElementById('resumeBtn')?.addEventListener('click', () => {
    alert('Resume download is a UI demo. Wire this button to your hosted PDF when ready.');
  });

  /* ---------- Contact form (demo only) ---------- */
  const form = document.getElementById('contactForm');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const note = document.getElementById('formNote');
    const name = form.querySelector('#cname').value.trim();
    const email = form.querySelector('#cemail').value.trim();
    const msg = form.querySelector('#cmsg').value.trim();
    if (!name || !email || !msg) {
      if (note) note.textContent = 'Please fill in all fields.';
      return;
    }
    if (note) note.textContent = 'Thanks! This is a demo form — your message was not sent.';
    form.reset();
  });

  /* ---------- Custom cursor ---------- */
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (dot && ring && window.matchMedia('(pointer:fine)').matches) {
    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    });
    const loop = () => {
      rx += (mx - rx) * 0.15; ry += (my - ry) * 0.15;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    };
    loop();
    document.querySelectorAll('a, button, .chip, .project, .swatch').forEach((el) => {
      el.addEventListener('mouseenter', () => ring.classList.add('hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
    });
  }

  /* ---------- Particle background ---------- */
  const canvas = document.getElementById('particles');
  if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const ctx = canvas.getContext('2d');
    let w, h, particles = [];
    const COUNT = window.innerWidth < 700 ? 28 : 60;

    const resize = () => {
      w = canvas.width = window.innerWidth * devicePixelRatio;
      h = canvas.height = window.innerHeight * devicePixelRatio;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
    };
    resize(); window.addEventListener('resize', resize);

    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3 * devicePixelRatio,
        vy: (Math.random() - 0.5) * 0.3 * devicePixelRatio,
        r: (Math.random() * 1.5 + 0.5) * devicePixelRatio,
      });
    }
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const accent = getComputedStyle(root).getPropertyValue('--accent').trim() || '#7c3aed';
      ctx.fillStyle = accent;
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.globalAlpha = 0.5;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 0.08;
      ctx.strokeStyle = accent;
      ctx.lineWidth = devicePixelRatio;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist2 = dx * dx + dy * dy;
          const max = 130 * devicePixelRatio;
          if (dist2 < max * max) {
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    };
    draw();
  }
})();
