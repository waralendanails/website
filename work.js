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
    }

    /* ── INIT — set count to actual number of items ── */
    document.getElementById('countNum').textContent =
      document.querySelectorAll('.gallery-item[data-format]').length;

    /* Run availability check on load */
    updateAvailability();

    /* Wrap tag content in inline spans so box-decoration-break: clone draws
       a per-line background instead of a fixed max-width box */
    document.querySelectorAll('.gallery-item-tags .tag').forEach(function(tag) {
      var bg = document.createElement('span');
      bg.className = 'tag-bg';
      while (tag.firstChild) bg.appendChild(tag.firstChild);
      tag.appendChild(bg);
    });
