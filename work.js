/* ── SEEDED RANDOM FOR CONSISTENT SHUFFLING ── */
function getSeededRandom(seed) {
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

/* ── SHUFFLE WITH VARIETY FOR FIRST 12 ITEMS ── */
function shuffleGallery(items) {
  // Get or create session seed
  let seed = parseInt(sessionStorage.getItem('gallerySeed'));
  if (!seed) {
    seed = Math.floor(Math.random() * 233280);
    sessionStorage.setItem('gallerySeed', seed);
  }
  const seededRandom = getSeededRandom(seed);

  // Group items by format
  const byFormat = { swatch: [], nailart: [], unique: [] };
  items.forEach(item => {
    if (byFormat[item.format]) {
      byFormat[item.format].push(item);
    }
  });

  // Shuffle within each format group
  Object.keys(byFormat).forEach(fmt => {
    for (let i = byFormat[fmt].length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom() * (i + 1));
      [byFormat[fmt][i], byFormat[fmt][j]] = [byFormat[fmt][j], byFormat[fmt][i]];
    }
  });

  // Build first 12 items with variety (no 3+ consecutive same finish)
  const first12 = [];
  const formats = ['swatch', 'nailart', 'unique'];
  const indices = { swatch: 0, nailart: 0, unique: 0 };

  while (first12.length < 12 && Object.values(indices).some((i, fmt) => i < byFormat[formats[fmt]].length)) {
    for (const fmt of formats) {
      if (first12.length >= 12) break;
      if (indices[fmt] < byFormat[fmt].length) {
        const candidate = byFormat[fmt][indices[fmt]];

        // Check if adding this would create 3+ consecutive same finish
        let canAdd = true;
        if (first12.length >= 2) {
          const lastTwo = first12.slice(-2);
          const lastFinish = lastTwo[1].finish[0];
          const candidateFinish = candidate.finish[0];

          if (lastTwo[0].finish[0] === lastFinish && lastFinish === candidateFinish) {
            canAdd = false;
          }
        }

        if (canAdd) {
          first12.push(candidate);
          indices[fmt]++;
        }
      }
    }
  }

  // Collect remaining items
  const remaining = [];
  Object.keys(byFormat).forEach(fmt => {
    while (indices[fmt] < byFormat[fmt].length) {
      remaining.push(byFormat[fmt][indices[fmt]++]);
    }
  });

  // Shuffle remaining items
  for (let i = remaining.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom() * (i + 1));
    [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
  }

  return first12.concat(remaining);
}

/* ── RENDER GALLERY FROM JSON DATA ── */
function renderGallery(items) {
  const grid = document.getElementById('galleryGrid');
  const shuffled = shuffleGallery(items);

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
        'watermarble': 'Watermarble'
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
    grid.insertBefore(div, grid.lastElementChild);
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

