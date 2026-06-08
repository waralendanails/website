/**
 * waralenda — system.js
 * Shared behaviour for every page.
 * Import at end of <body> on every HTML file.
 */


/* ── THEME ── */

function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t === 'dark' ? 'dark' : '');
  localStorage.setItem('wara-theme', t);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  setTheme(current === 'dark' ? 'light' : 'dark');
}

(function initTheme() {
  setTheme(localStorage.getItem('wara-theme') || 'light');
})();


/* ── MOBILE MENU ── */

function toggleMobile() {
  const menu   = document.getElementById('navMobile');
  const burger = document.getElementById('navBurger');
  if (!menu) return;
  const open = menu.classList.toggle('open');
  if (burger) burger.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
}

function closeMobile() {
  const menu = document.getElementById('navMobile');
  if (!menu) return;
  menu.classList.remove('open');
  document.body.style.overflow = '';
}


/* ── POPUP ── */

function openPopup(id) {
  const overlay = document.getElementById(id || 'popupOverlay');
  if (!overlay) return;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  const first = overlay.querySelector('button, input, textarea, select, a[href]');
  if (first) setTimeout(() => first.focus(), 50);
}

function closePopup(id) {
  const overlay = document.getElementById(id || 'popupOverlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function closePopupOnBg(event, id) {
  if (event.target === event.currentTarget) closePopup(id);
}

/* Placeholder form handler — replace with real backend */
function handleEnquiry(event, toastMsg) {
  event.preventDefault();
  closePopup();
  showToast(toastMsg || "Enquiry sent — I'll reply within 48 hours!");
  event.target.reset();
}

/* Close mobile menu and any open popup on Escape */
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  closeMobile();
  closePopup();
});


/* ── TOAST ── */

function showToast(msg, duration) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration || 3200);
}


/* ── SCROLL LISTENERS ── */

(function initScroll() {
  const btn    = document.getElementById('scrollTop');
  const nav    = document.querySelector('.site-nav');
  const footer = document.querySelector('.site-footer');

  window.addEventListener('scroll', () => {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 8);
    if (!btn) return;
    btn.classList.toggle('visible', window.scrollY > 400);

    if (footer) {
      const overlap = window.innerHeight - footer.getBoundingClientRect().top;
      btn.style.bottom = overlap > 0 ? (overlap + 16) + 'px' : '';
    }
  }, { passive: true });
})();

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}


/* ── COLLAPSIBLE FILTER (work page only) ── */

function toggleFilters() {
  const btn   = document.getElementById('filterToggle');
  const panel = document.getElementById('filterPanelInner');
  if (!btn || !panel) return;
  const open = panel.classList.toggle('open');
  btn.setAttribute('aria-expanded', open);
  panel.setAttribute('aria-hidden', !open);
}

function updateFilterBadge() {
  const countEl = document.getElementById('filterToggleCount');
  if (!countEl) return;
  const active = document.querySelectorAll(
    '#filterPanelInner .filter-pill.active, #filterPanelInner .filter-pill.format-active:not(#fmt-all)'
  ).length;
  countEl.textContent = active || '';
  countEl.classList.toggle('visible', active > 0);
}


/* ── UNIQUE ITEM OVERLAY — longpress on touch devices ── */

(function initUniqueOverlay() {
  const items = document.querySelectorAll('.gallery-item');
  if (!items.length) return;

  let pressTimer = null;

  items.forEach(item => {
    const overlay = item.querySelector('.gallery-item-unique-desc');
    if (!overlay) return;

    item.addEventListener('touchstart', () => {
      pressTimer = setTimeout(() => {
        document.querySelectorAll('.gallery-item-unique-desc.touch-visible')
          .forEach(el => el.classList.remove('touch-visible'));
        overlay.classList.add('touch-visible');
      }, 500);
    }, { passive: true });

    item.addEventListener('touchend',  () => clearTimeout(pressTimer), { passive: true });
    item.addEventListener('touchmove', () => clearTimeout(pressTimer), { passive: true });
  });

  /* Tap outside any gallery item to dismiss */
  document.addEventListener('touchstart', e => {
    if (!e.target.closest('.gallery-item')) {
      document.querySelectorAll('.gallery-item-unique-desc.touch-visible')
        .forEach(el => el.classList.remove('touch-visible'));
    }
  }, { passive: true });
})();


/* ── ACTIVE NAV LINK + VISITED TRACKING ── */

(function setActiveNav() {
  const raw  = window.location.pathname.replace(/\/$/, '').split('/').pop().replace('.html', '');
  const page = raw || 'index';

  document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(a => {
    const href = a.getAttribute('href').replace('.html', '') || 'index';

    // Active: current page
    if (href === page) a.classList.add('active');

    // Visited: persisted via localStorage
    if (localStorage.getItem('nav_visited_' + href)) a.classList.add('nav-visited');
    a.addEventListener('click', () => localStorage.setItem('nav_visited_' + href, '1'));
  });
})();


/* ── HOLO BUTTON EFFECT ── */

(function initHoloButtons() {
  const SELECTORS = '.btn-dark, .nav-cta';

  function setupBtn(btn) {
    const wrapper = document.createElement('span');
    wrapper.className = 'btn-holo-content';
    wrapper.style.cssText = 'position:relative; z-index:2; display:inline-flex; align-items:center; gap:0.5rem; pointer-events:none;';
    while (btn.firstChild) wrapper.appendChild(btn.firstChild);
    btn.appendChild(wrapper);

    const clip = document.createElement('span');
    clip.style.cssText = 'position:absolute; inset:0; overflow:hidden; border-radius:inherit; pointer-events:none; z-index:1;';
    const shine = document.createElement('span');
    shine.className = 'btn-holo-shine';
    clip.appendChild(shine);
    btn.appendChild(clip);

    btn.addEventListener('mouseenter', () => {
      const w = btn.offsetWidth;
      shine.style.transition = 'none';
      shine.style.left = '-40px';
      shine.style.opacity = '0';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          shine.style.transition = 'left 0.55s cubic-bezier(0.25,0,0.5,1), opacity 0.12s ease';
          shine.style.left = (w + 60) + 'px';
          shine.style.opacity = '1';
        });
      });
    });

    btn.addEventListener('mouseleave', () => {
      shine.style.transition = 'none';
      shine.style.left = '-320px';
      shine.style.opacity = '0';
    });
  }

  document.querySelectorAll(SELECTORS).forEach(setupBtn);
})();
