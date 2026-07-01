/* ── GALLERY SHUFFLE ── */
function shuffleGallery(items) {
  const SESSION_KEY = 'galleryOrder';

  // Reload counts as a new session — clear stored order so we reshuffle
  const navType = performance.getEntriesByType('navigation')[0]?.type;
  if (navType === 'reload') {
    sessionStorage.removeItem(SESSION_KEY);
  }

  // Restore stored order for same-session navigations
  const stored = sessionStorage.getItem(SESSION_KEY);
  if (stored) {
    try {
      const files = JSON.parse(stored);
      const map = new Map(items.map(item => [item.file, item]));
      const restored = files.map(f => map.get(f)).filter(Boolean);
      const restoredSet = new Set(files);
      const extras = items.filter(item => !restoredSet.has(item.file));
      return restored.concat(extras);
    } catch (_) {}
  }

  // Pass 1 — fill slots in order, one random unused image per tag
  const SLOTS = ['magnetic', 'flakie', 'thermal', 'marble', 'neon',
                 'stamping', 'shimmer', 'chrome', 'gradient', 'unique', 'cream'];
  const used = new Set();
  const pass1 = [];

  for (const tag of SLOTS) {
    const candidates = items.reduce((acc, item, i) => {
      if (used.has(i)) return acc;
      const matches = tag === 'unique'
        ? item.format === 'unique'
        : item.finish.includes(tag) || item.style.includes(tag);
      if (matches) acc.push(i);
      return acc;
    }, []);

    if (candidates.length === 0) continue;
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    used.add(pick);
    pass1.push(items[pick]);
  }

  // Pass 2 — remaining images in Fisher-Yates order
  const pass2 = items.filter((_, i) => !used.has(i));
  for (let i = pass2.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pass2[i], pass2[j]] = [pass2[j], pass2[i]];
  }

  const result = pass1.concat(pass2);
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(result.map(item => item.file)));
  return result;
}

/* ── RENDER GALLERY FROM JSON DATA ── */
function renderGallery(items) {
  const grid = document.getElementById('galleryGrid');
  if (!grid) {
    console.error('Gallery grid not found');
    return;
  }

  const shuffled = shuffleGallery(items);
  
  const emptyState = grid.querySelector('.gallery-empty');

  // Build HTML for each item
  shuffled.forEach(item => {
    const div = document.createElement('div');
    div.className = 'gallery-item';
    div.dataset.format = item.format;
    div.dataset.style = item.style.join(' ');
    div.dataset.finish = item.finish.join(' ');

    // Build the CDN URL
    const url = `https://res.cloudinary.com/dvf8iwjri/image/upload/f_auto,q_auto,w_1200/${item.file}`;

    let html = `<img class="gallery-item-img" src="${url}" alt="${item.alt}" loading="lazy">
      <div class="gallery-item-tags">`;

    // Format tag
    if (item.format === 'swatch') {
      html += '<span class="tag tag-format">Swatch</span>';
    } else if (item.format === 'nailart') {
      const styleLabels = {
        'freehand': 'Freehand',
        'french': 'French',
        'gradient': 'Gradient',
        'negativespace': 'Negative Space',
        'polkadot': 'Polka Dot',
        'skittle': 'Skittle',
        'stamping': 'Stamping',
        'stripes': 'Stripes',
        'marble': 'Marble'
      };
      const styleParts = item.style.map(s => styleLabels[s] || s).join(' · ');
      html += `<span class="tag tag-format">${styleParts}</span>`;
    } else if (item.format === 'unique') {
      html += '<span class="tag tag-unique">Unique</span>';
    }

    // Finish tag
    const finishLabels = {
      'chrome': 'Chrome',
      'cream': 'Cream',
      'flakie': 'Flakie',
      'glitter': 'Glitter',
      'holo': 'Holo',
      'iridescent': 'Iridescent',
      'jelly': 'Jelly',
      'magnetic': 'Magnetic',
      'matte': 'Matte',
      'multichrome': 'Multichrome',
      'neon': 'Neon',
      'reflective': 'Reflective',
      'shimmer': 'Shimmer',
      'thermal': 'Thermal',
      'topper': 'Topper'
    };
    const finishParts = item.finish.map(f => finishLabels[f] || f).join(' · ');
    html += `<span class="tag tag-finish">${finishParts}</span>`;

    html += '</div>';

    div.innerHTML = html;
    if (emptyState) {
      grid.insertBefore(div, emptyState);
    } else {
      grid.appendChild(div);
    }
  });

  // Post-render: set count, run filters and availability, wrap tag backgrounds
  document.getElementById('countNum').textContent =
    document.querySelectorAll('.gallery-item[data-format]').length;

  applyFilters();
  updateAvailability();

  /* Wrap tag content in inline spans so box-decoration-break: clone draws
     a per-line background instead of a fixed max-width box */
  document.querySelectorAll('.gallery-item-tags .tag').forEach(function(tag) {
    var bg = document.createElement('span');
    bg.className = 'tag-bg';
    while (tag.firstChild) bg.appendChild(tag.firstChild);
    tag.appendChild(bg);
  });
}

/* ── FILTER STATE ── */
    let currentFormat = 'all';
    let activeStyles  = new Set();
    let activeFinishes = new Set();

    /* ── FORMAT — single select ── */
    function setFormat(val, btn) {
      currentFormat = val;
      ['fmt-all','fmt-swatch','fmt-nailart','fmt-unique'].forEach(id => {
        const b = document.getElementById(id);
        b.classList.remove('format-active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('format-active');
      btn.setAttribute('aria-pressed', 'true');

      const styleRow = document.getElementById('styleRow');
      if (val === 'nailart') {
        styleRow.classList.add('visible');
        styleRow.setAttribute('aria-hidden', 'false');
      } else {
        styleRow.classList.remove('visible');
        styleRow.setAttribute('aria-hidden', 'true');
        activeStyles.clear();
        document.querySelectorAll('[data-style]').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
      }
      applyFilters();
    }

    /* ── STYLE — multichoice ── */
    function toggleStyle(val, btn) {
      if (activeStyles.has(val)) {
        activeStyles.delete(val);
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      } else {
        activeStyles.add(val);
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
      }
      applyFilters();
    }

    /* ── FINISH — multichoice, AND logic ── */
    function toggleFinish(val, btn) {
      if (activeFinishes.has(val)) {
        activeFinishes.delete(val);
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      } else {
        activeFinishes.add(val);
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
      }
      applyFilters();
    }

    /* ── CLEAR BUTTON VISIBILITY ── */
    function updateClearButton() {
      const hasFilters = currentFormat !== 'all' || activeStyles.size > 0 || activeFinishes.size > 0;
      document.querySelector('.filter-count-reset').classList.toggle('visible', hasFilters);
    }

    /* ── APPLY FILTERS ── */
    function applyFilters() {
      const items = document.querySelectorAll('.gallery-item[data-format]');
      let visible = 0;

      items.forEach(item => {
        const fmt     = item.dataset.format;
        const style   = item.dataset.style;
        const finishes = item.dataset.finish.split(' ');

        const fmtPass    = currentFormat === 'all' || fmt === currentFormat;
        const stylePass  = activeStyles.size === 0 ||
                           [...activeStyles].every(s => style.includes(s));
        const finishPass = activeFinishes.size === 0 ||
                           [...activeFinishes].every(f => finishes.includes(f));

        const show = fmtPass && stylePass && finishPass;
        item.classList.toggle('hidden', !show);
        if (show) visible++;
      });

      document.getElementById('countNum').textContent = visible;
      document.getElementById('galleryEmpty').classList.toggle('show', visible === 0);

      updateAvailability();
      updateClearButton();
    }

    /* ── DYNAMIC AVAILABILITY — grey out impossible finish combos ── */
    function updateAvailability() {
      document.querySelectorAll('[data-finish]').forEach(btn => {
        if (btn.classList.contains('active')) return; // never grey active buttons

        const testFinish = btn.dataset.finish;
        const testSet    = new Set([...activeFinishes, testFinish]);
        let wouldShow    = false;

        document.querySelectorAll('.gallery-item[data-format]').forEach(item => {
          const fmt     = item.dataset.format;
          const style   = item.dataset.style;
          const finishes = item.dataset.finish.split(' ');

          const fmtPass    = currentFormat === 'all' || fmt === currentFormat;
          const stylePass  = activeStyles.size === 0 ||
                             [...activeStyles].every(s => style.includes(s));
          const finishPass = [...testSet].every(f => finishes.includes(f));

          if (fmtPass && stylePass && finishPass) wouldShow = true;
        });

        btn.classList.toggle('disabled', !wouldShow);
        btn.setAttribute('aria-disabled', !wouldShow);
      });
    }

    /* ── RESET ── */
    function resetFilters() {
      currentFormat = 'all';
      activeStyles.clear();
      activeFinishes.clear();

      document.querySelectorAll('.filter-pill').forEach(b => {
        b.classList.remove('active', 'disabled', 'format-active');
        b.setAttribute('aria-pressed', 'false');
        b.removeAttribute('aria-disabled');
      });
      document.getElementById('fmt-all').classList.add('format-active');
      document.getElementById('fmt-all').setAttribute('aria-pressed', 'true');
      document.getElementById('styleRow').classList.remove('visible');
      document.getElementById('styleRow').setAttribute('aria-hidden', 'true');
      document.querySelectorAll('.gallery-item[data-format]').forEach(i => i.classList.remove('hidden'));
      document.getElementById('countNum').textContent =
        document.querySelectorAll('.gallery-item[data-format]').length;
      document.getElementById('galleryEmpty').classList.remove('show');
      updateClearButton();
    }

    /* ── FETCH AND RENDER GALLERY ── */
    fetch('data/gallery.json')
      .then(r => r.json())
      .then(items => renderGallery(items))
      .catch(e => console.error('Failed to load gallery:', e));

