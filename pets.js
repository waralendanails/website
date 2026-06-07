(function initPets() {

  /* ── Paw cursor (mouse only) ── */
  const cursor = document.getElementById('pawCursor');
  if (cursor && window.matchMedia('(pointer: fine)').matches) {
    let lastX = -999, lastY = -999;
    document.addEventListener('mousemove', e => {
      cursor.style.transform = `translate(${e.clientX - 14}px, ${e.clientY - 14}px)`;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      if (Math.sqrt(dx*dx + dy*dy) < 38) return;
      lastX = e.clientX; lastY = e.clientY;
      const paw = document.createElement('span');
      paw.className = 'paw-trail';
      paw.textContent = '🐾';
      paw.style.left = e.clientX + 'px';
      paw.style.top  = e.clientY + 'px';
      paw.style.fontSize = (11 + Math.random() * 7) + 'px';
      document.body.appendChild(paw);
      paw.addEventListener('animationend', () => paw.remove());
    }, { passive: true });
    document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });
  }

  /* ── Keyboard boop ── */
  document.querySelectorAll('.polaroid').forEach(p => {
    p.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      p.style.transform = 'rotate(0deg) translateY(-10px) scale(1.06)';
      setTimeout(() => p.style.transform = '', 400);
    });
  });

  /* ── Critter SVGs ── */
  function makeFigYarn() {
    const el = document.createElementNS('http://www.w3.org/2000/svg','svg');
    el.setAttribute('viewBox','0 0 64 64');
    el.setAttribute('fill','none');
    el.setAttribute('aria-hidden','true');
    el.innerHTML = `
      <circle cx="32" cy="32" r="28" fill="#A8A6AE"/>
      <path d="M10 20 Q32 8 54 22" stroke="#7D7B88" stroke-width="1.4" fill="none" opacity="0.6"/>
      <path d="M8 34 Q32 18 56 30" stroke="#fff" stroke-width="1.2" fill="none" opacity="0.5"/>
      <path d="M10 46 Q32 32 54 44" stroke="#7D7B88" stroke-width="1.2" fill="none" opacity="0.5"/>
      <path d="M20 12 Q28 40 22 56" stroke="#7D7B88" stroke-width="1.2" fill="none" opacity="0.4"/>
      <path d="M54 22 Q60 28 56 36" stroke="#7D7B88" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    return el;
  }

  function makeCoffeeMouse() {
    const el = document.createElementNS('http://www.w3.org/2000/svg','svg');
    el.setAttribute('viewBox','0 0 52 52');
    el.setAttribute('fill','none');
    el.setAttribute('aria-hidden','true');
    el.innerHTML = `
      <ellipse cx="26" cy="30" rx="16" ry="12" fill="#C9A96E"/>
      <ellipse cx="26" cy="18" rx="10" ry="9" fill="#C9A96E"/>
      <ellipse cx="19" cy="11" rx="5" ry="7" fill="#B8964E"/>
      <ellipse cx="33" cy="11" rx="5" ry="7" fill="#B8964E"/>
      <ellipse cx="22" cy="18" rx="2" ry="2" fill="#2C2416"/>
      <ellipse cx="30" cy="18" rx="2" ry="2" fill="#2C2416"/>
      <ellipse cx="26" cy="21" rx="1.5" ry="1" fill="#D4947A"/>
      <line x1="14" y1="20" x2="4"  y2="17" stroke="#8B6B3D" stroke-width="1" opacity="0.7"/>
      <line x1="14" y1="22" x2="4"  y2="22" stroke="#8B6B3D" stroke-width="1" opacity="0.7"/>
      <line x1="38" y1="20" x2="48" y2="17" stroke="#8B6B3D" stroke-width="1" opacity="0.7"/>
      <line x1="38" y1="22" x2="48" y2="22" stroke="#8B6B3D" stroke-width="1" opacity="0.7"/>
      <path d="M26 42 Q20 50 14 48" stroke="#8B6B3D" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
    return el;
  }

  function makeLumenBird() {
    const el = document.createElementNS('http://www.w3.org/2000/svg','svg');
    el.setAttribute('viewBox','0 0 56 40');
    el.setAttribute('fill','none');
    el.setAttribute('aria-hidden','true');
    el.innerHTML = `
      <ellipse cx="28" cy="24" rx="14" ry="9" fill="#5B8EC4"/>
      <ellipse cx="38" cy="20" rx="8" ry="6" fill="#7AAED8"/>
      <path d="M10 24 Q6 16 12 18" stroke="#5B8EC4" stroke-width="2" fill="#5B8EC4"/>
      <path d="M46 24 Q52 16 46 18" stroke="#5B8EC4" stroke-width="2" fill="#5B8EC4"/>
      <ellipse cx="42" cy="19" rx="2" ry="2" fill="#2C2416"/>
      <path d="M46 20 Q50 19 48 22" stroke="#C9A96E" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <path d="M22 32 Q24 38 20 36" stroke="#4A7EB4" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <path d="M28 33 Q28 40 24 38" stroke="#4A7EB4" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
    return el;
  }

  function makePeekFeather() {
    const el = document.createElementNS('http://www.w3.org/2000/svg','svg');
    el.setAttribute('viewBox','0 0 70 28');
    el.setAttribute('fill','none');
    el.setAttribute('aria-hidden','true');
    el.innerHTML = `
      <path d="M4 14 Q20 13 40 14 Q55 15 66 14" stroke="#B4746A" stroke-width="1.2" fill="none" stroke-linecap="round"/>
      <path d="M8 14 Q18 6 30 4 Q44 2 60 10 Q64 12 66 14 Q52 11 38 10 Q24 9 8 14Z" fill="#C4847A" opacity="0.9"/>
      <path d="M8 14 Q18 20 30 22 Q44 24 60 19 Q64 17 66 14 Q52 17 38 18 Q24 19 8 14Z" fill="#D4948A" opacity="0.85"/>
      <line x1="20" y1="14" x2="22" y2="7"  stroke="#B4746A" stroke-width="0.6" opacity="0.5"/>
      <line x1="30" y1="13" x2="33" y2="5"  stroke="#B4746A" stroke-width="0.6" opacity="0.5"/>
      <line x1="40" y1="13" x2="44" y2="7"  stroke="#B4746A" stroke-width="0.6" opacity="0.5"/>
      <line x1="50" y1="13" x2="54" y2="10" stroke="#B4746A" stroke-width="0.6" opacity="0.5"/>
      <line x1="20" y1="14" x2="22" y2="20" stroke="#B4746A" stroke-width="0.6" opacity="0.4"/>
      <line x1="30" y1="14" x2="33" y2="21" stroke="#B4746A" stroke-width="0.6" opacity="0.4"/>
      <line x1="40" y1="14" x2="44" y2="20" stroke="#B4746A" stroke-width="0.6" opacity="0.4"/>
      <line x1="50" y1="14" x2="54" y2="18" stroke="#B4746A" stroke-width="0.6" opacity="0.4"/>
      <path d="M4 14 Q2 12 3 10" stroke="#C4847A" stroke-width="1" fill="none" stroke-linecap="round"/>
      <path d="M4 14 Q2 15 3 17" stroke="#C4847A" stroke-width="1" fill="none" stroke-linecap="round"/>`;
    return el;
  }

  /* ── Fire a critter ── */
  function fireCritter(sectionId) {
    const makers = {
      'section-fig':    { make: makeFigYarn,    cls: 'pet-critter--fig' },
      'section-coffee': { make: makeCoffeeMouse, cls: 'pet-critter--coffee' },
      'section-lumen':  { make: makeLumenBird,   cls: 'pet-critter--lumen' },
      'section-peek':   { make: makePeekFeather, cls: 'pet-critter--peek' },
    };
    const def = makers[sectionId];
    if (!def) return;
    const wrap = document.createElement('div');
    wrap.className = 'pet-critter ' + def.cls;
    wrap.appendChild(def.make());
    document.body.appendChild(wrap);
    wrap.addEventListener('animationend', () => wrap.remove());
  }

  /* ── Intersection observer + 60s timers ── */
  const sections = ['section-fig','section-coffee','section-lumen','section-peek'];
  const timers = {};
  const fired = new Set();

  // Small delay so sections already in view on page load don't fire immediately.
  // After the delay, only fire if the user has actually scrolled to the section
  // (i.e. it wasn't visible at time zero).
  let ready = false;
  setTimeout(() => { ready = true; }, 800);

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const id = entry.target.id;
      if (entry.isIntersecting) {
        if (!fired.has(id) && ready) { fired.add(id); fireCritter(id); }
        if (!timers[id]) { timers[id] = setInterval(() => fireCritter(id), 60000); }
      } else {
        if (timers[id]) { clearInterval(timers[id]); delete timers[id]; }
      }
    });
  }, { threshold: 0.2 });

  sections.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); });

})();

/* ── Rosette confetti ── */
(function() {
  // Read rosette colours from CSS custom properties — single source of truth
  function getRosetteColours(sectionId) {
    const el = document.getElementById(sectionId);
    if (!el) return ['#888'];
    const s = getComputedStyle(el);
    return [
      s.getPropertyValue('--rosette').trim(),
      s.getPropertyValue('--rosette-lt').trim(),
      s.getPropertyValue('--rosette-lt2').trim(),
      s.getPropertyValue('--rosette-dk').trim(),
      s.getPropertyValue('--rosette-tc').trim(),
    ].filter(Boolean);
  }

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let particles = [];
  let raf = null;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function burst(x, y, colours) {
    const count = 60;
    for (let i = 0; i < count; i++) {
      const angle  = Math.random() * Math.PI * 2;
      const speed  = 3 + Math.random() * 6;
      const size   = 5 + Math.random() * 6;
      const shape  = Math.random() < 0.5 ? 'rect' : 'circle';
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        gravity: 0.25,
        colour: colours[Math.floor(Math.random() * colours.length)],
        alpha: 1,
        decay: 0.013 + Math.random() * 0.01,
        size,
        shape,
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.2,
      });
    }
    if (!raf) loop();
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = particles.filter(p => p.alpha > 0.01);
    for (const p of particles) {
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.98;
      p.rot += p.rotV;
      p.alpha -= p.decay;
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.colour;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      if (p.shape === 'rect') {
        ctx.fillRect(-p.size/2, -p.size/4, p.size, p.size/2);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size/2, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.restore();
    }
    raf = particles.length ? requestAnimationFrame(loop) : null;
  }

  document.querySelectorAll('.pet-rosette-col').forEach(col => {
    const section = col.closest('[id^="section-"]');
    if (!section) return;
    const colours = getRosetteColours(section.id);
    let fired = false;
    col.addEventListener('mouseenter', () => {
      if (fired) return;
      fired = true;
      const rect = col.querySelector('.pet-rosette').getBoundingClientRect();
      burst(rect.left + rect.width/2, rect.top + rect.height/2, colours);
    });
    col.addEventListener('mouseleave', () => { fired = false; });
  });
})();