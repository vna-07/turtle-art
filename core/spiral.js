// core/spiral.js
// Generates spiral art commands for the Turtle engine.
// All functions take (turtle, opts) and queue commands — no drawing happens here.

import { PALETTES } from '../ui/canvas.js';

// ── 1. Arithmetic Spiral ───────────────────────────────────
// Classic expanding polygon spiral — the one from ch4 turtle
export function arithmeticSpiral(t, opts = {}) {
  const {
    sides    = 4,
    steps    = 200,
    increment= 2,
    palette  = 'rainbow',
    size     = 1.5,
  } = opts;

  const angle = 360 / sides + (opts.angle ?? 1);
  t.pensize(size);

  for (let i = 0; i < steps; i++) {
    t.color(PALETTES[palette](i, steps));
    t.forward(i * increment);
    t.left(angle);
  }
  t.done();
}

// ── 2. Polar Spiral (Archimedean) ──────────────────────────
// Draws a smooth outward spiral using tiny steps
export function polarSpiral(t, opts = {}) {
  const {
    loops    = 6,
    density  = 360,
    palette  = 'rainbow',
    size     = 1.5,
  } = opts;

  const total = loops * density;
  t.pensize(size);
  t.penup();
  t.goto(0, 0);
  t.pendown();

  for (let i = 0; i < total; i++) {
    const angle  = (i / density) * 360;
    const radius = (i / total) * 220;
    const rad    = (angle * Math.PI) / 180;
    const x      = radius * Math.cos(rad);
    const y      = radius * Math.sin(rad);
    t.color(PALETTES[palette](i, total));
    t.goto(x, y);
  }
  t.done();
}

// ── 3. Star Spiral ────────────────────────────────────────
// Rotating overlapping stars — hypnotic layered effect
export function starSpiral(t, opts = {}) {
  const {
    points   = 5,
    count    = 36,
    size     = 120,
    palette  = 'rainbow',
    pensize  = 1,
  } = opts;

  const rotStep = 360 / count;
  const inner   = size * Math.sin((Math.PI / 180) * (90 - 180 / points));
  t.pensize(pensize);

  for (let s = 0; s < count; s++) {
    t.color(PALETTES[palette](s, count));
    t.penup();
    t.goto(0, 0);
    t.right(s * rotStep);
    t.pendown();
    for (let i = 0; i < points * 2; i++) {
      t.forward(i % 2 === 0 ? size : inner);
      t.left(180 - 180 / points);
    }
  }
  t.done();
}

// ── 4. Galaxy Spiral ─────────────────────────────────────
// Two-arm galaxy shape using logarithmic spiral arms
export function galaxySpiral(t, opts = {}) {
  const {
    arms     = 3,
    density  = 180,
    palette  = 'rainbow',
    size     = 1.2,
  } = opts;

  t.pensize(size);
  const total = arms * density;

  for (let a = 0; a < arms; a++) {
    const offset = (360 / arms) * a;
    t.penup();
    t.goto(0, 0);
    t.pendown();

    for (let i = 0; i < density; i++) {
      const globalI = a * density + i;
      const angle   = (i / density) * 720 + offset;
      const radius  = Math.pow(i / density, 0.6) * 200;
      const rad     = (angle * Math.PI) / 180;
      t.color(PALETTES[palette](globalI, total));
      t.goto(radius * Math.cos(rad), radius * Math.sin(rad));
    }
  }
  t.done();
}

// ── 5. Lissajous Spiral ───────────────────────────────────
// Figure-8 and knot patterns using parametric equations
export function lissajousSpiral(t, opts = {}) {
  const {
    a        = 3,
    b        = 2,
    delta    = Math.PI / 4,
    density  = 720,
    scale    = 200,
    palette  = 'rainbow',
    size     = 1.5,
  } = opts;

  t.pensize(size);
  t.penup();

  for (let i = 0; i <= density; i++) {
    const theta = (i / density) * 2 * Math.PI;
    const x     = scale * Math.sin(a * theta + delta);
    const y     = scale * Math.sin(b * theta);
    t.color(PALETTES[palette](i, density));
    if (i === 0) { t.goto(x, y); t.pendown(); }
    else           t.goto(x, y);
  }
  t.done();
}

// ── Randomizer ────────────────────────────────────────────
export function randomSpiral(palette = 'rainbow') {
  const types = ['arithmetic', 'polar', 'star', 'galaxy', 'lissajous'];
  const type  = types[Math.floor(Math.random() * types.length)];
  const rnd   = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

  const configs = {
    arithmetic: { sides: rnd(3, 8), steps: rnd(100, 300), increment: rnd(1, 4), palette },
    polar:      { loops: rnd(3, 10), density: 360, palette },
    star:       { points: rnd(4, 9), count: rnd(20, 60), size: rnd(80, 160), palette },
    galaxy:     { arms: rnd(2, 5), density: rnd(120, 240), palette },
    lissajous:  { a: rnd(2, 5), b: rnd(2, 5), delta: Math.random() * Math.PI, density: 720, palette },
  };

  return { type, opts: configs[type] };
}

export const SPIRAL_TYPES = [
  { key: 'arithmetic', label: 'Arithmetic' },
  { key: 'polar',      label: 'Polar'      },
  { key: 'star',       label: 'Star'       },
  { key: 'galaxy',     label: 'Galaxy'     },
  { key: 'lissajous',  label: 'Lissajous'  },
];

export function drawSpiral(t, type, opts) {
  const map = { arithmetic: arithmeticSpiral, polar: polarSpiral,
                star: starSpiral, galaxy: galaxySpiral, lissajous: lissajousSpiral };
  (map[type] ?? arithmeticSpiral)(t, opts);
}