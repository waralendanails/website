/**
 * waralenda — build.js
 *
 * Assembles final HTML pages from partials + page sources.
 * Run: node build.js
 * Output: /dist (ready to deploy)
 *
 * Page front-matter (HTML comment at top of each src/pages/*.html):
 *   title       — <title> tag
 *   description — <meta description>
 *   bodyClass   — class on <body> (optional)
 *   navCta      — true/false — show "Work with me" button in nav
 *   stickyCta   — "work-with-me" | "email" — mobile sticky bar variant
 */

import {
  readFileSync, writeFileSync, mkdirSync,
  readdirSync, copyFileSync, existsSync, cpSync
} from 'fs';
import { join } from 'path';

const SRC      = './src';
const PAGES    = join(SRC, 'pages');
const PARTIALS = join(SRC, 'partials');
const DIST     = './dist';

// ── Ensure dist exists ─────────────────────────────────────────────────────

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

// ── Build a single templated page ──────────────────────────────────────────

function buildPage(filename) {
  const src = readFileSync(join(PAGES, filename), 'utf8');
  const { meta, body } = parseFrontMatter(src);

  const navCta    = meta.navCta === 'true' ? NAV_CTA_HTML : '';
  const stickyCta = STICKY_CTA[meta.stickyCta] || STICKY_CTA['work-with-me'];
  const bodyClass = meta.bodyClass ? ` class="${meta.bodyClass}"` : '';

  const head   = HEAD_PARTIAL
    .replace('{{description}}', meta.description || '')
    .replace('{{title}}', meta.title || 'waralenda');

  const nav    = NAV_PARTIAL.replace('{{nav_cta}}', navCta);
  const footer = FOOTER_PARTIAL.replace('{{sticky_cta}}', stickyCta);

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

// ── Copy a static file ─────────────────────────────────────────────────────

function copyStatic(src, dest) {
  if (existsSync(src)) {
    copyFileSync(src, dest);
    console.log(`  ✓ ${dest.replace(DIST + '/', '')} (static copy)`);
  } else {
    console.warn(`  ⚠ not found, skipped: ${src}`);
  }
}

// ── Copy a whole directory ─────────────────────────────────────────────────

function copyDir(src, dest) {
  if (existsSync(src)) {
    cpSync(src, dest, { recursive: true });
    console.log(`  ✓ ${src}/ → dist/`);
  } else {
    console.warn(`  ⚠ directory not found, skipped: ${src}`);
  }
}

// ── Build all pages ────────────────────────────────────────────────────────

console.log('\nwaralenda build\n');

// Templated pages (use partials + front-matter)
const templatedPages = readdirSync(PAGES)
  .filter(f => f.endsWith('.html') && f !== 'work.html' && f !== 'pets.html');

for (const page of templatedPages) buildPage(page);

// Static HTML pages (self-contained, just copy across)
copyStatic(join(PAGES, 'work.html'),  join(DIST, 'work.html'));
copyStatic(join(PAGES, 'pets.html'),  join(DIST, 'pets.html'));

// JS files
copyStatic('./system.js', join(DIST, 'system.js'));
copyStatic('./work.js',   join(DIST, 'work.js'));
copyStatic('./pets.js',   join(DIST, 'pets.js'));

// CSS files
copyStatic('./system.css', join(DIST, 'system.css'));
copyStatic('./pets.css',   join(DIST, 'pets.css'));

// Asset directories
copyDir('./assets', join(DIST, 'assets'));
copyDir('./fonts',  join(DIST, 'fonts'));

const total = templatedPages.length + 2; // +2 for work + pets
console.log(`\nBuilt ${total} pages → dist/\n`);
