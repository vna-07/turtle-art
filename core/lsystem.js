// core/lsystem.js
// L-System generator — string rewriting + turtle interpretation
// Directly tied to ch9 (strings) and ch10 (lists) from the course

import { PALETTES } from '../ui/canvas.js';

// ── L-System interpreter ──────────────────────────────────
function rewrite(axiom, rules, depth) {
  let s = axiom;
  for (let i = 0; i < depth; i++) {
    s = s.split('').map(c => rules[c] ?? c).join('');
  }
  return s;
}

function interpret(t, str, angle, stepLen, palette, startX = 0, startY = -150) {
  const stack = [];
  const total = str.length;
  let colorIdx = 0;

  t.penup();
  t.goto(startX, startY);
  t.left(90); // point upward
  t.pendown();

  for (const ch of str) {
    switch (ch) {
      case 'F': case 'G': case 'X': case 'Y': case 'A': case 'B':
        t.color(PALETTES[palette](colorIdx++ % total, total));
        t.forward(stepLen);
        break;
      case 'f':
        t.penup(); t.forward(stepLen); t.pendown();
        break;
      case '+': t.left(angle);  break;
      case '-': t.right(angle); break;
      case '[': stack.push(null); t.penup(); break; // marker
      case ']': stack.pop();      t.pendown(); break;
      case '|': t.left(180);    break;
    }
  }
  t.done();
}

// ── Presets ───────────────────────────────────────────────

// 1. Barnsley Fern
export function barnsleyFern(t, opts = {}) {
  const { depth = 5, palette = 'forest', pensize = 1 } = opts;
  t.pensize(pensize);
  const axiom = 'X';
  const rules = { X: 'F+[[X]-X]-F[-FX]+X', F: 'FF' };
  const str   = rewrite(axiom, rules, depth);
  interpret(t, str, 25, 280 / str.length * 8, palette, 0, -180);
}

// 2. Dragon Curve L-System
export function dragonLSystem(t, opts = {}) {
  const { depth = 10, palette = 'neon', pensize = 1 } = opts;
  t.pensize(pensize);
  const axiom = 'FX';
  const rules = { X: 'X+YF+', Y: '-FX-Y' };
  const str   = rewrite(axiom, rules, depth);
  interpret(t, str, 90, 8, palette, -60, -60);
}

// 3. Sierpinski Arrowhead
export function sierpinskiArrowhead(t, opts = {}) {
  const { depth = 6, palette = 'sunset', pensize = 1 } = opts;
  t.pensize(pensize);
  const axiom = 'A';
  const rules = { A: 'B-A-B', B: 'A+B+A' };
  const str   = rewrite(axiom, rules, depth);
  const len   = Math.pow(2, depth);
  interpret(t, str, 60, 250 / len, palette, -120, -120);
}

// 4. Gosper Curve (Flowsnake)
export function gosperCurve(t, opts = {}) {
  const { depth = 4, palette = 'ocean', pensize = 1.2 } = opts;
  t.pensize(pensize);
  const axiom = 'A';
  const rules = { A: 'A-B--B+A++AA+B-', B: '+A-BB--B-A++A+B' };
  const str   = rewrite(axiom, rules, depth);
  const len   = Math.pow(Math.sqrt(7), depth);
  interpret(t, str, 60, 200 / len, palette, -60, 40);
}

// 5. Bush / Plant
export function bush(t, opts = {}) {
  const { depth = 4, palette = 'forest', pensize = 1 } = opts;
  t.pensize(pensize);
  const axiom = 'F';
  const rules = { F: 'FF+[+F-F-F]-[-F+F+F]' };
  const str   = rewrite(axiom, rules, depth);
  interpret(t, str, 22.5, 300 / str.length * 5, palette, 0, -180);
}

// 6. Penrose Tiling (L-System approximation)
export function penroseTiling(t, opts = {}) {
  const { depth = 5, palette = 'rainbow', pensize = 1 } = opts;
  t.pensize(pensize);
  const axiom = '[X]++[X]++[X]++[X]++[X]';
  const rules = {
    F: '',
    X: 'YF++ZF----ZF[-YF----XF]++',
    Y: '+YF--ZF[---XF--YF]+',
    Z: '-YF++XF[+++YF++ZF]-',
  };
  const str = rewrite(axiom, rules, depth);
  interpret(t, str, 36, 15, palette, 0, 0);
}

// ── Randomizer ────────────────────────────────────────────
export function randomLSystem(palette = 'forest') {
  const types = ['fern', 'dragon', 'sierpinski', 'gosper', 'bush', 'penrose'];
  const type  = types[Math.floor(Math.random() * types.length)];
  const rnd   = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

  const configs = {
    fern:       { depth: rnd(4, 6), palette },
    dragon:     { depth: rnd(8, 12), palette },
    sierpinski: { depth: rnd(5, 7), palette },
    gosper:     { depth: rnd(3, 5), palette },
    bush:       { depth: rnd(3, 5), palette },
    penrose:    { depth: rnd(4, 6), palette },
  };

  return { type, opts: configs[type] };
}

export const LSYSTEM_TYPES = [
  { key: 'fern',       label: 'Barnsley Fern'      },
  { key: 'dragon',     label: 'Dragon Curve'        },
  { key: 'sierpinski', label: 'Sierpinski Arrowhead'},
  { key: 'gosper',     label: 'Gosper Curve'        },
  { key: 'bush',       label: 'Bush / Plant'        },
  { key: 'penrose',    label: 'Penrose Tiling'      },
];

export function drawLSystem(t, type, opts) {
  const map = { fern: barnsleyFern, dragon: dragonLSystem,
                sierpinski: sierpinskiArrowhead, gosper: gosperCurve,
                bush, penrose: penroseTiling };
  (map[type] ?? barnsleyFern)(t, opts);
}