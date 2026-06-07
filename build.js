/**
 * waralenda — build.js
 *
 * Assembles final HTML pages from partials + page sources.
 * Run: node build.js
 * Output: /dist (ready to deploy or preview locally)
 *
 * Page front-matter (HTML comment at top of each src/pages/*.html):
 *   title       — <title> tag
 *   description — <meta description>
 *   bodyClass   — class on <body> (optional)
 *   navCta      — true/false — show "Work with me" button in nav
 *   stickyCta   — "work-with-me" | "email" — mobile sticky bar variant
 *   extraScript — filename of a page-specific JS file to defer-load (e.g. work.js)
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync, existsSync, statSync } from 'fs';
import { join, basename } from 'path';

function copyDir(src, dest) {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const s = join(src, entry), d = join(dest, entry);
    statSync(s).isDirectory() ? copyDir(s, d) : copyFileSync(s, d);
  }
}

const SRC       = './src';
const PAGES     = join(SRC, 'pages');
const PARTIALS  = join(SRC, 'partials');
const DIST      = './dist';

// Ensure dist directory exists
mkdirSync(DIST, { recursive: true });


// ── Load partials ──────────────────────────────────────────────────────────

const partial = name => readFileSync(join(PARTIALS, `${name}.html`), 'utf8');

const HEAD_PARTIAL   = partial('head');
const NAV_PARTIAL    = partial('nav');
const FOOTER_PARTIAL = partial('footer');

// ── Sticky CTA variants ────────────────────────────────────────────────────

const ARROW_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>`;

const STICKY_CTA = {
  'work-with-me': `
  <div class="sticky-cta" role="complementary" aria-label="Contact">
    <a href="contact.html">Work with me ${ARROW_SVG}</a>
  </div>`,

  'email': `
  <div class="sticky-cta" role="complementary" aria-label="Contact">
    <a id="ctaMobileEmail" href="#">Email me ${ARROW_SVG}</a>
  </div>`,
};

const NAV_CTA_HTML = `<a href="contact.html" class="nav-cta">Work with me</a>`;

// ── Parse front-matter ─────────────────────────────────────────────────────

function parseFrontMatter(src) {
  const match = src.match(/^<!--\s*([\s\S]*?)\s*-->/);
  if (!match) throw new Error('Missing front-matter');

  const meta = {};
  for (const line of match[1].split('\n')) {
    const [key, ...rest] = line.split(':');
    if (key && rest.length) meta[key.trim()] = rest.join(':').trim();
  }

  const body = src.slice(match[0].length).trim();
  return { meta, body };
}

// ── Build a single page ────────────────────────────────────────────────────

function buildPage(filename) {
  const src = readFileSync(join(PAGES, filename), 'utf8');
  const { meta, body } = parseFrontMatter(src);

  const navCta   = meta.navCta === 'true' ? NAV_CTA_HTML : '';
  const stickyCta = STICKY_CTA[meta.stickyCta] || STICKY_CTA['work-with-me'];
  const bodyClass = meta.bodyClass ? ` class="${meta.bodyClass}"` : '';

  const head    = HEAD_PARTIAL
    .replace('{{description}}', meta.description || '')
    .replace('{{title}}', meta.title || 'waralenda') +
    (meta.extraCss ? `  <link rel="stylesheet" href="${meta.extraCss}">\n` : '');

  const nav     = NAV_PARTIAL.replace('{{nav_cta}}', navCta);
  const footer  = FOOTER_PARTIAL.replace('{{sticky_cta}}', stickyCta) +
    (meta.extraScript ? `\n  <script src="${meta.extraScript}" defer></script>` : '');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
${head}
</head>
<body${bodyClass}>

${nav}
${body}

${footer}
</body>
</html>`;

  writeFileSync(join(DIST, filename), html);
  console.log(`  ✓ ${filename}`);
}

// ── Build all pages ────────────────────────────────────────────────────────

console.log('\nwaralenda build\n');

// Copy static assets to dist
['system.css', 'system.js', 'work.css'].forEach(f => {
  if (existsSync(`./${f}`)) {
    copyFileSync(`./${f}`, join(DIST, f));
    console.log(`  ✓ ${f} (copied)`);
  }
});

['assets', 'fonts'].forEach(dir => {
  if (existsSync(`./${dir}`)) {
    copyDir(`./${dir}`, join(DIST, dir));
    console.log(`  ✓ ${dir}/ (copied)`);
  }
});

const pages = readdirSync(PAGES).filter(f => f.endsWith('.html'));
for (const page of pages) buildPage(page);

if (existsSync('./work.js')) {
  copyFileSync('./work.js', join(DIST, 'work.js'));
  console.log('  ✓ work.js (copied)');
}

// pets.html is built separately (too large/complex for src/pages)
if (existsSync('./src/pages/pets.html')) {
  buildPage('pets.html');
} else if (existsSync('./pets.html')) {
  // Fallback: assemble pets.html from root using front matter
  const src = readFileSync('./pets.html', 'utf8');
  const { meta, body } = parseFrontMatter(src);
  const navCta    = meta.navCta === 'true' ? NAV_CTA_HTML : '';
  const stickyCta = STICKY_CTA[meta.stickyCta] || STICKY_CTA['work-with-me'];
  const bodyClass = meta.bodyClass ? ` class="${meta.bodyClass}"` : '';
  const head = HEAD_PARTIAL
    .replace('{{description}}', meta.description || '')
    .replace('{{title}}', meta.title || 'waralenda') +
    (meta.extraCss ? `  <link rel="stylesheet" href="${meta.extraCss}">\n` : '');
  const nav    = NAV_PARTIAL.replace('{{nav_cta}}', navCta);
  const footer = FOOTER_PARTIAL.replace('{{sticky_cta}}', stickyCta);
  const html = `<!DOCTYPE html>\n<html lang="en">\n<head>\n${head}\n</head>\n<body${bodyClass}>\n\n${nav}\n${body}\n\n${footer}\n</body>\n</html>`;
  writeFileSync(join(DIST, 'pets.html'), html);
  console.log('  ✓ pets.html (built from root)');
}

// pets.js is the pets page script, lives alongside pets.html
if (existsSync('./pets.js')) {
  copyFileSync('./pets.js', join(DIST, 'pets.js'));
  console.log('  ✓ pets.js (copied from root)');
}

// pets.css is the pets page stylesheet, lives alongside system.css
if (existsSync('./pets.css')) {
  copyFileSync('./pets.css', join(DIST, 'pets.css'));
  console.log('  ✓ pets.css (copied from root)');
}

console.log(`\nBuilt ${pages.length} pages → dist\n`);
