// core/randomWalk.js
// Random walk art — from ch8 (randomly walking turtles)
// Includes drunk walk, Brownian motion, Lévy flight, and plasma

import { PALETTES } from '../ui/canvas.js';

// ── 1. Drunk Walk ─────────────────────────────────────────
// Classic ch8 random walk — turns random angles, steps forward
export function drunkWalk(t, opts = {}) {
  const { steps = 800, stepLen = 8, palette = 'rainbow', pensize = 1.5 } = opts;

  t.pensize(pensize);
  t.penup(); t.goto(0, 0); t.pendown();

  for (let i = 0; i < steps; i++) {
    t.color(PALETTES[palette](i, steps));
    t.left(Math.random() * 360);
    t.forward(stepLen);
  }
  t.done();
}

// ── 2. Brownian Motion ────────────────────────────────────
// Small random displacements — simulates particle diffusion
export function brownianMotion(t, opts = {}) {
  const { steps = 1500, scale = 5, palette = 'ocean', pensize = 1 } = opts;

  t.pensize(pensize);
  t.penup(); t.goto(0, 0); t.pendown();

  let x = 0, y = 0;
  for (let i = 0; i < steps; i++) {
    t.color(PALETTES[palette](i, steps));
    x += (Math.random() - 0.5) * scale * 2;
    y += (Math.random() - 0.5) * scale * 2;
    t.goto(x, y);
  }
  t.done();
}

// ── 3. Lévy Flight ────────────────────────────────────────
// Mostly small steps, occasional very long jumps — creates clusters
export function levyFlight(t, opts = {}) {
  const { steps = 400, palette = 'neon', pensize = 1.2 } = opts;

  t.pensize(pensize);
  t.penup(); t.goto(0, 0); t.pendown();

  for (let i = 0; i < steps; i++) {
    t.color(PALETTES[palette](i, steps));
    // Lévy distribution: power-law step length
    const u    = Math.random();
    const step = 2 / Math.pow(u, 1 / 1.5);
    const capped = Math.min(step, 80);
    t.left(Math.random() * 360);
    t.forward(capped);
  }
  t.done();
}

// ── 4. Spiraling Random Walk ──────────────────────────────
// Walk that slowly spirals outward — ordered chaos
export function spiralWalk(t, opts = {}) {
  const { steps = 600, palette = 'sunset', pensize = 1.2 } = opts;

  t.pensize(pensize);
  t.penup(); t.goto(0, 0); t.pendown();

  for (let i = 0; i < steps; i++) {
    t.color(PALETTES[palette](i, steps));
    const stepLen = (i / steps) * 3 + 1;
    t.left(91 + Math.random() * 10 - 5);
    t.forward(stepLen);
  }
  t.done();
}

// ── 5. Neon Web ───────────────────────────────────────────
// Multiple turtles doing random walks, leaving glowing trails
export function neonWeb(t, opts = {}) {
  const { agents = 8, steps = 300, palette = 'neon', pensize = 1 } = opts;

  t.pensize(pensize);
  const total = agents * steps;

  for (let a = 0; a < agents; a++) {
    const startAngle = (360 / agents) * a;
    t.penup();
    t.goto(0, 0);
    t.left(startAngle);
    t.pendown();

    for (let i = 0; i < steps; i++) {
      t.color(PALETTES[palette](a * steps + i, total));
      t.left(Math.random() * 60 - 30);
      t.forward(Math.random() * 8 + 2);
    }
  }
  t.done();
}

// ── Famous artwork reimaginings ───────────────────────────

// 6. Mondrian — geometric color blocks via random walk grid
export function mondrian(t, opts = {}) {
  const { grid = 8, size = 280, pensize = 3 } = opts;

  const cell  = size / grid;
  const colors = ['#e63946','#f4a261','#2a9d8f','#264653','#e9c46a','#fff','#f1faee'];

  t.pensize(pensize);

  for (let r = 0; r < grid; r++) {
    for (let c = 0; c < grid; c++) {
      const x = -size / 2 + c * cell;
      const y = -size / 2 + r * cell;
      const w = cell * (Math.random() < 0.15 ? 2 : 1);
      const h = cell * (Math.random() < 0.15 ? 2 : 1);

      t.color('#1a1a1a');
      t.fillcolor(colors[Math.floor(Math.random() * colors.length)]);
      t.penup(); t.goto(x, y); t.pendown();
      t.begin_fill();
      for (const [dx, dy] of [[w,0],[0,h],[-w,0],[0,-h]]) {
        t.goto(x + (dx > 0 ? w : 0), y + (dy > 0 ? h : 0));
      }
      t.end_fill();
    }
  }
  t.done();
}

// 7. Starry Night — Van Gogh inspired swirling random walk
export function starryNight(t, opts = {}) {
  const { swirls = 12, steps = 200, pensize = 2 } = opts;

  const palette = ['#1a1a4e','#2d3561','#1565c0','#1976d2','#42a5f5',
                   '#ffee58','#fff176','#ffe082','#f57f17','#fff'];

  for (let s = 0; s < swirls; s++) {
    const sx = (Math.random() - 0.5) * 300;
    const sy = (Math.random() - 0.5) * 200;
    const r  = Math.random() * 60 + 20;
    const col = palette[Math.floor(Math.random() * palette.length)];

    t.pensize(pensize + Math.random() * 2);
    t.color(col);
    t.penup(); t.goto(sx, sy); t.pendown();

    for (let i = 0; i < steps; i++) {
      const drift = Math.sin((i / steps) * Math.PI * 6) * r;
      t.left(3 + Math.random() * 4);
      t.forward(2 + Math.abs(drift) * 0.05);
    }
  }

  // Stars
  for (let st = 0; st < 30; st++) {
    const sx = (Math.random() - 0.5) * 400;
    const sy = (Math.random() - 0.5) * 280;
    t.penup(); t.goto(sx, sy); t.pendown();
    t.color('#fff176');
    t.pensize(Math.random() * 3 + 1);
    t.circle(Math.random() * 5 + 2);
  }
  t.done();
}

// 8. Kandinsky Circles — concentric colorful circles
export function kandinsky(t, opts = {}) {
  const { rings = 6, circles = 10, palette = 'rainbow', pensize = 2 } = opts;

  t.pensize(pensize);
  const total = circles * rings;

  for (let c = 0; c < circles; c++) {
    const cx = (Math.random() - 0.5) * 260;
    const cy = (Math.random() - 0.5) * 180;
    for (let r = rings; r > 0; r--) {
      t.color(PALETTES[palette](c * rings + (rings - r), total));
      t.penup(); t.goto(cx, cy - r * 12); t.pendown();
      t.circle(r * 12);
    }
  }
  t.done();
}

// ── Randomizer ────────────────────────────────────────────
export function randomWalk(palette = 'rainbow') {
  const types = ['drunk', 'brownian', 'levy', 'spiralWalk', 'neonWeb'];
  const type  = types[Math.floor(Math.random() * types.length)];
  const rnd   = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

  const configs = {
    drunk:      { steps: rnd(500, 1200), stepLen: rnd(5, 15), palette },
    brownian:   { steps: rnd(1000, 2000), scale: rnd(3, 8), palette },
    levy:       { steps: rnd(200, 600), palette },
    spiralWalk: { steps: rnd(400, 800), palette },
    neonWeb:    { agents: rnd(5, 12), steps: rnd(200, 400), palette },
  };

  return { type, opts: configs[type] };
}

export const WALK_TYPES = [
  { key: 'drunk',      label: 'Drunk Walk'       },
  { key: 'brownian',   label: 'Brownian Motion'  },
  { key: 'levy',       label: 'Lévy Flight'      },
  { key: 'spiralWalk', label: 'Spiral Walk'      },
  { key: 'neonWeb',    label: 'Neon Web'         },
];

export const ARTWORK_TYPES = [
  { key: 'mondrian',    label: 'Mondrian'        },
  { key: 'starryNight', label: 'Starry Night'    },
  { key: 'kandinsky',   label: 'Kandinsky'       },
];

export function drawWalk(t, type, opts) {
  const map = { drunk: drunkWalk, brownian: brownianMotion, levy: levyFlight,
                spiralWalk, neonWeb, mondrian, starryNight, kandinsky };
  (map[type] ?? drunkWalk)(t, opts);
}