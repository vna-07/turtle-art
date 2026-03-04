
// core/geometric.js
// Geometric pattern generators — mandalas, polygons, roses, webs, spirographs

import { PALETTES } from '../ui/canvas.js';

// ── 1. Mandala ────────────────────────────────────────────
export function mandala(t, opts = {}) {
  const { petals = 12, layers = 5, size = 160, palette = 'rainbow', pensize = 1 } = opts;

  t.pensize(pensize);
  const total = petals * layers;

  for (let layer = 0; layer < layers; layer++) {
    const r = (size / layers) * (layer + 1);
    for (let p = 0; p < petals; p++) {
      const i = layer * petals + p;
      t.color(PALETTES[palette](i, total));
      t.penup();
      t.goto(0, 0);
      t.pendown();
      t.left(360 / petals);
      t.begin_fill();
      t.circle(r / petals, 360);
      t.end_fill();
      t.penup();
      t.goto(0, 0);
      t.pendown();
      t.forward(r);
      t.backward(r);
    }
  }
  t.done();
}

// ── 2. Rose Curve (Rhodonea) ──────────────────────────────
// r = cos(k * theta) — number of petals depends on k
export function roseCurve(t, opts = {}) {
  const { k = 5, density = 720, scale = 200, palette = 'sunset', pensize = 1.5 } = opts;

  t.pensize(pensize);
  t.penup();

  for (let i = 0; i <= density; i++) {
    const theta = (i / density) * 2 * Math.PI;
    const r     = scale * Math.cos(k * theta);
    const x     = r * Math.cos(theta);
    const y     = r * Math.sin(theta);
    t.color(PALETTES[palette](i, density));
    if (i === 0) { t.goto(x, y); t.pendown(); }
    else           t.goto(x, y);
  }
  t.done();
}

// ── 3. Spirograph ─────────────────────────────────────────
// Hypotrochoid — inner circle rolling inside outer circle
export function spirograph(t, opts = {}) {
  const { R = 150, r = 113, d = 160, density = 1440, palette = 'ocean', pensize = 1.2 } = opts;

  t.pensize(pensize);
  t.penup();

  for (let i = 0; i <= density; i++) {
    const theta = (i / density) * 2 * Math.PI * (r / gcd(R, r));
    const x = (R - r) * Math.cos(theta) + d * Math.cos(((R - r) / r) * theta);
    const y = (R - r) * Math.sin(theta) - d * Math.sin(((R - r) / r) * theta);
    t.color(PALETTES[palette](i, density));
    if (i === 0) { t.goto(x, y); t.pendown(); }
    else           t.goto(x, y);
  }
  t.done();
}

// ── 4. Web / String Art ───────────────────────────────────
// Lines connecting points around a circle — classic string art
export function stringArt(t, opts = {}) {
  const { points = 60, skip = 17, size = 200, palette = 'neon', pensize = 0.6 } = opts;

  t.pensize(pensize);
  const pts = [];
  for (let i = 0; i < points; i++) {
    const a = (i / points) * 2 * Math.PI;
    pts.push([size * Math.cos(a), size * Math.sin(a)]);
  }

  let cur = 0;
  for (let i = 0; i < points; i++) {
    const next = (cur + skip) % points;
    t.color(PALETTES[palette](i, points));
    t.penup();
    t.goto(pts[cur][0], pts[cur][1]);
    t.pendown();
    t.goto(pts[next][0], pts[next][1]);
    cur = next;
  }
  t.done();
}

// ── 5. Sunflower (Fibonacci / Vogel spiral) ───────────────
export function sunflower(t, opts = {}) {
  const { n = 300, scale = 10, palette = 'sunset', pensize = 1 } = opts;

  const golden = 137.508;
  t.pensize(pensize);

  for (let i = 0; i < n; i++) {
    const r     = scale * Math.sqrt(i);
    const theta = (i * golden * Math.PI) / 180;
    const x     = r * Math.cos(theta);
    const y     = r * Math.sin(theta);
    t.color(PALETTES[palette](i, n));
    t.penup();
    t.goto(x, y);
    t.pendown();
    t.circle(scale * 0.45 * Math.sqrt(i / n) + 1);
  }
  t.done();
}

// ── 6. Islamic Geometric Tiling ───────────────────────────
// Interlocking star polygons — inspired by traditional geometric art
export function islamicTile(t, opts = {}) {
  const { rings = 3, size = 40, palette = 'ocean', pensize = 1 } = opts;

  t.pensize(pensize);
  let idx = 0;
  const total = rings * rings * 2;

  for (let row = -rings; row <= rings; row++) {
    for (let col = -rings; col <= rings; col++) {
      const x = col * size * 1.73;
      const y = row * size * 2 + (col % 2) * size;
      t.color(PALETTES[palette](idx++ % total, total));
      t.penup();
      t.goto(x, y);
      t.pendown();
      // 6-pointed star
      for (let s = 0; s < 6; s++) {
        t.forward(size);
        t.left(60);
        t.forward(size);
        t.right(120);
      }
    }
  }
  t.done();
}

// ── Helper ────────────────────────────────────────────────
function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

// ── Types ─────────────────────────────────────────────────
export const GEOMETRIC_TYPES = [
  { key: 'rose',        label: 'Rose Curve'      },
  { key: 'spirograph',  label: 'Spirograph'      },
  { key: 'stringArt',   label: 'String Art'      },
  { key: 'sunflower',   label: 'Sunflower'       },
  { key: 'islamicTile', label: 'Islamic Tile'    },
];

// ── Randomizer ────────────────────────────────────────────
export function randomGeometric(palette = 'rainbow') {
  const types = ['rose', 'spirograph', 'stringArt', 'sunflower', 'islamicTile'];
  const type  = types[Math.floor(Math.random() * types.length)];
  const rnd   = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

  const configs = {
    rose:        { k: rnd(3, 8), density: 720, scale: rnd(150, 220), palette },
    spirograph:  { R: rnd(120, 180), r: rnd(60, 140), d: rnd(80, 180), density: 1440, palette },
    stringArt:   { points: rnd(40, 80), skip: rnd(7, 29), size: rnd(160, 210), palette },
    sunflower:   { n: rnd(200, 500), scale: rnd(8, 13), palette },
    islamicTile: { rings: rnd(2, 4), size: rnd(30, 50), palette },
  };

  return { type, opts: configs[type] };
}

export function drawGeometric(t, type, opts) {
  const map = { rose: roseCurve, spirograph, stringArt, sunflower, islamicTile, mandala };
  (map[type] ?? roseCurve)(t, opts);
}