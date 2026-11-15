// Rasteriza os SVG da marca conforme brand/source/render-manifest.json (fundo transparente).
import { Resvg } from '@resvg/resvg-js';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const manifest = JSON.parse(readFileSync(resolve(root, 'brand/source/render-manifest.json'), 'utf8'));
const extra = resolve(root, 'brand/source/render-extra.json');
let jobs = manifest;
try {
  jobs = jobs.concat(JSON.parse(readFileSync(extra, 'utf8')));
} catch {
  // arquivo opcional
}

const cache = resolve(root, 'tools/brand/.cache');
const fontFiles = existsSync(cache) ? readdirSync(cache).filter((f) => f.endsWith('.ttf')).map((f) => resolve(cache, f)) : [];

for (const job of jobs) {
  const svg = readFileSync(resolve(root, job.svg), 'utf8');
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: job.width }, font: { loadSystemFonts: false, fontFiles, defaultFontFamily: 'Inter' } }).render().asPng();
  const out = resolve(root, job.out);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, png);
}
console.log(`${jobs.length} imagens geradas.`);
