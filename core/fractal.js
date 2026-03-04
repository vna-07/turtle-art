// core/fractal.js
// Fractal art generators — Koch, Sierpinski, Dragon Curve, Hilbert, Tree

import { PALETTES } from '../ui/canvas.js';

// ── 1. Koch Snowflake ─────────────────────────────────────
export function kochSnowflake(t, opts = {}) {
  const { depth = 4, size = 280, palette = 'rainbow', pensize = 1.2 } = opts;

  t.pensize(pensize);
  t.penup();
  t.goto(-size / 2, size / 3);
  t.pendown();

  let colorIdx = 0;
  const totalLines = Math.pow(4, depth) * 3;

  function kochLine(len, d) {
    if (d === 0) {
      t.color(PALETTES[palette](colorIdx++ % totalLines, totalLines));
      t.forward(len);
      return;
    }
    kochLine(len / 3, d - 1);
    t.left(60);
    kochLine(len / 3, d - 1);
    t.right(120);
    kochLine(len / 3, d - 1);
    t.left(60);
    kochLine(len / 3, d - 1);
  }

  for (let i = 0; i < 3; i++) {
    kochLine(size, depth);
    t.right(120);
  }
  t.done();
}

// ── 2. Sierpinski Triangle ────────────────────────────────
export function sierpinski(t, opts = {}) {
  const { depth = 6, size = 280, palette = 'rainbow', pensize = 1 } = opts;

  t.pensize(pensize);
  t.penup();
  t.goto(-size / 2, -size / 2.5);
  t.pendown();

  let colorIdx = 0;
  const totalLines = Math.pow(3, depth);

  function tri(len, d) {
    if (d === 0) {
      t.color(PALETTES[palette](colorIdx++ % totalLines, totalLines));
      for (let i = 0; i < 3; i++) { t.forward(len); t.left(120); }
      return;
    }
    tri(len / 2, d - 1);
    t.forward(len / 2);
    tri(len / 2, d - 1);
    t.backward(len / 2);
    t.left(60);
    t.forward(len / 2);
    t.right(60);
    tri(len / 2, d - 1);
    t.left(60);
    t.backward(len / 2);
    t.right(60);
  }

  tri(size, depth);
  t.done();
}

// ── 3. Dragon Curve ───────────────────────────────────────
export function dragonCurve(t, opts = {}) {
  const { depth = 12, size = 6, palette = 'rainbow', pensize = 1.2 } = opts;

  t.pensize(pensize);
  t.penup();
  t.goto(-50, 30);
  t.pendown();

  let colorIdx = 0;
  const totalLines = Math.pow(2, depth);

  function dragon(len, d, turn) {
    if (d === 0) {
      t.color(PALETTES[palette](colorIdx++ % totalLines, totalLines));
      t.forward(len);
      return;
    }
    t.left(turn * 45);
    dragon(len / Math.SQRT2, d - 1, 1);
    t.right(turn * 90);
    dragon(len / Math.SQRT2, d - 1, -1);
    t.left(turn * 45);
  }

  dragon(size * Math.pow(Math.SQRT2, depth), depth, 1);
  t.done();
}

// ── 4. Hilbert Curve ──────────────────────────────────────
export function hilbertCurve(t, opts = {}) {
  const { depth = 5, size = 8, palette = 'ocean', pensize = 1.5 } = opts;

  t.pensize(pensize);
  t.penup();
  t.goto(-120, -120);
  t.pendown();

  let colorIdx = 0;
  const totalLines = Math.pow(4, depth);

  function hilbert(len, d, angle) {
    if (d === 0) return;
    t.left(angle);
    hilbert(len, d - 1, -angle);
    t.color(PALETTES[palette](colorIdx++ % totalLines, totalLines));
    t.forward(len);
    t.right(angle);
    hilbert(len, d - 1, angle);
    t.color(PALETTES[palette](colorIdx++ % totalLines, totalLines));
    t.forward(len);
    hilbert(len, d - 1, angle);
    t.right(angle);
    t.color(PALETTES[palette](colorIdx++ % totalLines, totalLines));
    t.forward(len);
    hilbert(len, d - 1, -angle);
    t.left(angle);
  }

  hilbert(size, depth, 90);
  t.done();
}

// ── 5. Fractal Tree ───────────────────────────────────────
export function fractalTree(t, opts = {}) {
  const {
    depth    = 9,
    length   = 100,
    angle    = 25,
    shrink   = 0.7,
    palette  = 'forest',
    pensize  = 2,
  } = opts;

  t.penup();
  t.goto(0, -180);
  t.pendown();

  function branch(len, d) {
    if (d === 0 || len < 2) return;
    const progress = 1 - d / depth;
    t.color(PALETTES[palette](Math.floor(progress * 100), 100));
    t.pensize(Math.max(0.5, pensize * (d / depth)));
    t.forward(len);
    t.left(angle);
    branch(len * shrink, d - 1);
    t.right(angle * 2);
    branch(len * shrink, d - 1);
    t.left(angle);
    t.backward(len);
  }

  // Point turtle upward
  t.left(90);
  branch(length, depth);
  t.done();
}

// ── Randomizer ────────────────────────────────────────────
export function randomFractal(palette = 'rainbow') {
  const types = ['koch', 'sierpinski', 'dragon', 'hilbert', 'tree'];
  const type  = types[Math.floor(Math.random() * types.length)];
  const rnd   = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

  const configs = {
    koch:       { depth: rnd(2, 5), size: rnd(200, 300), palette },
    sierpinski: { depth: rnd(4, 7), size: rnd(220, 300), palette },
    dragon:     { depth: rnd(8, 14), size: rnd(4, 8), palette },
    hilbert:    { depth: rnd(3, 6), size: rnd(6, 12), palette },
    tree:       { depth: rnd(7, 11), length: rnd(80, 120), angle: rnd(15, 40), shrink: +(Math.random() * 0.25 + 0.6).toFixed(2), palette },
  };

  return { type, opts: configs[type] };
}

export const FRACTAL_TYPES = [
  { key: 'koch',       label: 'Koch Snowflake'   },
  { key: 'sierpinski', label: 'Sierpinski'        },
  { key: 'dragon',     label: 'Dragon Curve'      },
  { key: 'hilbert',    label: 'Hilbert Curve'     },
  { key: 'tree',       label: 'Fractal Tree'      },
];

export function drawFractal(t, type, opts) {
  const map = { koch: kochSnowflake, sierpinski, dragon: dragonCurve,
                hilbert: hilbertCurve, tree: fractalTree };
  (map[type] ?? kochSnowflake)(t, opts);
}