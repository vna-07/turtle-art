// app.js — TurtleArt Application Controller

import { Turtle }                                from './ui/canvas.js';
import { drawSpiral,    randomSpiral,    SPIRAL_TYPES    } from './core/spiral.js';
import { drawFractal,   randomFractal,   FRACTAL_TYPES   } from './core/fractal.js';
import { drawGeometric, randomGeometric, GEOMETRIC_TYPES } from './core/geometric.js';
import { drawLSystem,   randomLSystem,   LSYSTEM_TYPES   } from './core/lsystem.js';
import { drawWalk,      randomWalk,      WALK_TYPES, ARTWORK_TYPES } from './core/randomWalk.js';
import { traceImage,    loadImageFromFile }               from './core/imageTracer.js';

// ── Mode config ───────────────────────────────────────────
const MODES = {
  spiral:   { title: 'Spiral Generator',    sub: 'arithmetic · polar · star · galaxy · lissajous' },
  fractal:  { title: 'Fractal Engine',      sub: 'koch · sierpinski · dragon · hilbert · tree'    },
  geometric:{ title: 'Geometric Patterns',  sub: 'rose · spirograph · string art · sunflower'     },
  lsystem:  { title: 'L-System Renderer',   sub: 'fern · dragon · gosper · bush · penrose'        },
  walk:     { title: 'Random Walk Art',     sub: 'drunk · brownian · lévy · neon web · artworks'  },
  tracer:   { title: 'Image Tracer',        sub: 'edge detection · sobel · turtle reconstruction' },
};

// ── State ─────────────────────────────────────────────────
let turtle      = null;
let activeMode  = 'spiral';
let activePalette = 'rainbow';
let activeType  = 'arithmetic';
let uploadedImg = null;
let startTime   = null;

// ── Boot ──────────────────────────────────────────────────
const canvasEl = document.getElementById('art-canvas');
turtle = new Turtle(canvasEl);

turtle.onStroke = n => {
  flashStat('stat-strokes', n);
  document.getElementById('chip-strokes').textContent = n + ' strokes';
};
turtle.onStep = n => flashStat('stat-steps', n);
turtle.onDone = ({ strokes, steps, ms }) => {
  setStat('stat-strokes', strokes);
  setStat('stat-steps',   steps);
  setStat('stat-time',    ms + 'ms');
  setStatus('done', '#22c55e');
  document.getElementById('btn-draw').textContent = '▶ Draw';
  document.getElementById('btn-draw').classList.remove('primary');
  setTimeout(() => document.getElementById('btn-draw').classList.add('primary'), 10);
};

// Nav
document.querySelectorAll('[data-mode]').forEach(item =>
  item.addEventListener('click', () => switchMode(item.dataset.mode))
);

// Palette
document.querySelectorAll('.palette-swatch').forEach(sw =>
  sw.addEventListener('click', () => {
    document.querySelectorAll('.palette-swatch').forEach(s => s.classList.remove('active'));
    sw.classList.add('active');
    activePalette = sw.dataset.palette;
    setStat('stat-colors', sw.dataset.palette);
  })
);

// Controls
document.getElementById('btn-draw').addEventListener('click', runDraw);
document.getElementById('btn-clear').addEventListener('click', () => {
  turtle.clear();
  resetStats();
  setStatus('idle', 'var(--text-dim)');
});
document.getElementById('btn-randomize').addEventListener('click', randomize);
document.getElementById('btn-download').addEventListener('click', downloadPNG);

document.getElementById('slider-speed').addEventListener('input', e => {
  document.getElementById('lbl-speed').textContent = e.target.value;
});

document.getElementById('toggle-bg').addEventListener('change', e => {
  turtle.setDarkBg(e.target.checked);
});

// Init
switchMode('spiral');

// ── Mode switching ────────────────────────────────────────
function switchMode(mode) {
  activeMode = mode;
  const cfg  = MODES[mode];

  document.getElementById('topbar-title').textContent = cfg.title;
  document.getElementById('topbar-sub').textContent   = cfg.sub;
  document.getElementById('canvas-title').textContent =
    mode.charAt(0).toUpperCase() + mode.slice(1);

  document.querySelectorAll('[data-mode]').forEach(i =>
    i.classList.toggle('active', i.dataset.mode === mode)
  );

  turtle.stop();
  buildModeControls(mode);
  resetStats();
  setStatus('idle', 'var(--text-dim)');
}

// ── Mode-specific controls ────────────────────────────────
function buildModeControls(mode) {
  const slot = document.getElementById('mode-controls');
  slot.innerHTML = '';

  const typeMap = {
    spiral:    SPIRAL_TYPES,
    fractal:   FRACTAL_TYPES,
    geometric: GEOMETRIC_TYPES,
    lsystem:   LSYSTEM_TYPES,
    walk:      [...WALK_TYPES, { key: '---', label: '── Artworks ──', disabled: true }, ...ARTWORK_TYPES],
  };

  if (mode === 'tracer') {
    slot.innerHTML = `
      <div class="ctrl-divider"></div>
      <div class="ctrl-group">
        <label class="ctrl-label">Upload Image</label>
        <label class="upload-zone" id="upload-zone">
          <input type="file" id="img-upload" accept="image/*" />
          <div id="upload-label">📁 Click or drag an image here</div>
        </label>
      </div>
      <div class="ctrl-group">
        <label class="ctrl-label">Edge Threshold <span class="ctrl-val" id="lbl-threshold">60</span></label>
        <input type="range" class="ctrl-slider" id="slider-threshold" min="10" max="200" value="60" />
      </div>
      <div class="ctrl-group">
        <label class="ctrl-label">Max Points <span class="ctrl-val" id="lbl-points">1500</span></label>
        <input type="range" class="ctrl-slider" id="slider-points" min="200" max="3000" value="1500" step="100" />
      </div>`;

    document.getElementById('img-upload').addEventListener('change', async e => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        uploadedImg = await loadImageFromFile(file);
        document.getElementById('upload-label').textContent = '✓ ' + file.name;
        document.getElementById('upload-zone').style.borderColor = 'var(--green)';
      } catch { document.getElementById('upload-label').textContent = '✗ Invalid image'; }
    });

    document.getElementById('slider-threshold').addEventListener('input', e =>
      document.getElementById('lbl-threshold').textContent = e.target.value
    );
    document.getElementById('slider-points').addEventListener('input', e =>
      document.getElementById('lbl-points').textContent = e.target.value
    );
    return;
  }

  const types = typeMap[mode];
  if (!types) return;

  const div = document.createElement('div');
  div.innerHTML = '<div class="ctrl-divider"></div>';

  const label = document.createElement('div');
  label.className = 'ctrl-group';
  label.innerHTML = '<label class="ctrl-label">Type</label>';

  const select = document.createElement('select');
  select.className = 'ctrl-select';
  select.id = 'type-select';

  types.forEach(({ key, label: lbl, disabled }) => {
    const opt = document.createElement('option');
    opt.value = key; opt.textContent = lbl;
    if (disabled) { opt.disabled = true; opt.style.color = 'var(--text-muted)'; }
    select.appendChild(opt);
  });

  select.addEventListener('change', () => { activeType = select.value; });
  activeType = types.find(t => !t.disabled)?.key ?? types[0].key;

  label.appendChild(select);
  div.appendChild(label);
  slot.appendChild(div);
}

// ── Draw ──────────────────────────────────────────────────
function runDraw() {
  turtle.clear();
  resetStats();

  const speed = parseInt(document.getElementById('slider-speed').value) - 1;
  turtle.speed(speed + 1);

  startTime = Date.now();
  setStatus('drawing', 'var(--orange)');
  document.getElementById('btn-draw').textContent = '⏹ Stop';

  if (activeMode === 'tracer') {
    runTracer();
    return;
  }

  const opts = { palette: activePalette };

  if      (activeMode === 'spiral')    drawSpiral(turtle,    activeType, opts);
  else if (activeMode === 'fractal')   drawFractal(turtle,   activeType, opts);
  else if (activeMode === 'geometric') drawGeometric(turtle, activeType, opts);
  else if (activeMode === 'lsystem')   drawLSystem(turtle,   activeType, opts);
  else if (activeMode === 'walk')      drawWalk(turtle,      activeType, opts);

  turtle.run(speed);
}

function runTracer() {
  if (!uploadedImg) {
    setStatus('no image', 'var(--red)');
    document.getElementById('btn-draw').textContent = '▶ Draw';
    return;
  }
  const threshold = parseInt(document.getElementById('slider-threshold')?.value ?? 60);
  const maxPoints = parseInt(document.getElementById('slider-points')?.value  ?? 1500);
  const speed     = parseInt(document.getElementById('slider-speed').value) - 1;

  traceImage(turtle, uploadedImg, {
    threshold, maxPoints, palette: activePalette,
    canvasW: canvasEl.width, canvasH: canvasEl.height,
  });
  turtle.run(speed);
}

// ── Randomize ─────────────────────────────────────────────
function randomize() {
  const fnMap = {
    spiral:    randomSpiral,
    fractal:   randomFractal,
    geometric: randomGeometric,
    lsystem:   randomLSystem,
    walk:      randomWalk,
  };
  const fn = fnMap[activeMode];
  if (!fn) return;

  const { type, opts } = fn(activePalette);
  activeType = type;

  const sel = document.getElementById('type-select');
  if (sel) sel.value = type;

  turtle.clear();
  resetStats();

  const speed = parseInt(document.getElementById('slider-speed').value) - 1;
  turtle.speed(speed + 1);
  setStatus('drawing', 'var(--orange)');

  if      (activeMode === 'spiral')    drawSpiral(turtle,    type, opts);
  else if (activeMode === 'fractal')   drawFractal(turtle,   type, opts);
  else if (activeMode === 'geometric') drawGeometric(turtle, type, opts);
  else if (activeMode === 'lsystem')   drawLSystem(turtle,   type, opts);
  else if (activeMode === 'walk')      drawWalk(turtle,      type, opts);

  turtle.run(speed);
}

// ── Download ──────────────────────────────────────────────
function downloadPNG() {
  const a = document.createElement('a');
  a.download = `turtleart-${activeMode}-${Date.now()}.png`;
  a.href = canvasEl.toDataURL('image/png');
  a.click();
}

// ── Stats helpers ─────────────────────────────────────────
function setStat(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function flashStat(id, val) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = val;
  el.classList.remove('stat-flash');
  void el.offsetWidth;
  el.classList.add('stat-flash');
}

function resetStats() {
  setStat('stat-strokes', '0');
  setStat('stat-steps',   '0');
  setStat('stat-time',    '0ms');
  document.getElementById('chip-strokes').textContent = '0 strokes';
}

function setStatus(text, color) {
  const el = document.getElementById('chip-status');
  if (!el) return;
  el.textContent  = text;
  el.style.color  = color;
}