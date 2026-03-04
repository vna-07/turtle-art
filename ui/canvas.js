
// ui/canvas.js — Turtle Engine
// Simulates Python turtle on HTML Canvas.
// All drawing goes through this class — core modules never touch the DOM.
//
// API mirrors Python turtle:
//   t.forward(n)   t.backward(n)
//   t.left(deg)    t.right(deg)
//   t.penup()      t.pendown()
//   t.goto(x,y)    t.home()
//   t.color(c)     t.pensize(n)
//   t.speed(n)     t.clear()
//   t.begin_fill() t.end_fill()
//   t.circle(r, extent)
//   t.stamp()
//   t.done()       ← call when all commands are queued

const SPEED_DELAYS = [200, 120, 80, 50, 30, 18, 10, 5, 2, 0]; // ms per step

export class Turtle {
  constructor(canvasEl) {
    this.el  = canvasEl;
    this.ctx = canvasEl.getContext('2d');

    // Turtle state
    this._x        = 0;
    this._y        = 0;
    this._angle    = 0;       // degrees, 0 = right, 90 = up
    this._down     = true;
    this._color    = '#f97316';
    this._fillColor= '#f97316';
    this._size     = 1.5;
    this._speedIdx = 4;       // 0-9
    this._filling  = false;
    this._fillPath = [];

    // Command queue for animation
    this._queue    = [];
    this._running  = false;
    this._timer    = null;
    this._startTime= null;

    // Stats callbacks
    this.onStroke  = null;   // () => void
    this.onStep    = null;   // (steps) => void
    this.onDone    = null;   // ({ strokes, steps, ms }) => void

    this._strokes  = 0;
    this._steps    = 0;

    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  // ── Setup ──────────────────────────────────────────────

  _resize() {
    const rect = this.el.parentElement.getBoundingClientRect();
    this.el.width  = rect.width  || 800;
    this.el.height = rect.height || 480;
    this._cx = this.el.width  / 2;
    this._cy = this.el.height / 2;
  }

  _sx(x) { return this._cx + x; }   // screen x from turtle x
  _sy(y) { return this._cy - y; }   // screen y from turtle y (y-up)

  // ── Public turtle API ──────────────────────────────────

  speed(n)     { this._speedIdx = Math.max(0, Math.min(9, n - 1)); return this; }
  color(c)     { this._enqueue('color',  c);    return this; }
  fillcolor(c) { this._enqueue('fillcolor', c); return this; }
  pensize(n)   { this._enqueue('pensize', n);   return this; }
  penup()      { this._enqueue('penup');         return this; }
  pendown()    { this._enqueue('pendown');       return this; }
  home()       { this._enqueue('home');          return this; }
  stamp()      { this._enqueue('stamp');         return this; }
  begin_fill() { this._enqueue('begin_fill');    return this; }
  end_fill()   { this._enqueue('end_fill');      return this; }
  done()       { this._enqueue('done');          return this; }

  forward(n)   { this._enqueue('forward',  n);  return this; }
  backward(n)  { this._enqueue('forward', -n);  return this; }
  left(deg)    { this._enqueue('left',   deg);  return this; }
  right(deg)   { this._enqueue('left',  -deg);  return this; }
  goto(x, y)   { this._enqueue('goto',   x, y); return this; }

  circle(radius, extent = 360, steps = null) {
    // Approximate circle with many short forward+turn steps
    const n    = steps ?? Math.max(8, Math.abs(Math.round(radius * 0.5)));
    const step = (2 * Math.PI * Math.abs(radius) * (extent / 360)) / n;
    const turn = extent / n * (radius < 0 ? -1 : 1);
    for (let i = 0; i < n; i++) {
      this.forward(step);
      this.left(turn);
    }
    return this;
  }

  // ── Command queue ──────────────────────────────────────

  _enqueue(cmd, ...args) {
    this._queue.push({ cmd, args });
  }

  // ── Run / Stop ─────────────────────────────────────────

  run(speedOverride) {
    if (this._running) return;
    if (speedOverride !== undefined) this._speedIdx = speedOverride;
    this._running   = true;
    this._startTime = Date.now();
    document.body.classList.add('drawing');
    this._tick();
  }

  stop() {
    this._running = false;
    clearTimeout(this._timer);
    document.body.classList.remove('drawing');
  }

  clear() {
    this.stop();
    this._queue   = [];
    this._x = this._y = this._angle = 0;
    this._down    = true;
    this._filling = false;
    this._fillPath= [];
    this._strokes = 0;
    this._steps   = 0;
    const { width: w, height: h } = this.el;
    this.ctx.clearRect(0, 0, w, h);
    if (this._darkBg) {
      this.ctx.fillStyle = '#111';
      this.ctx.fillRect(0, 0, w, h);
    }
    this.el.classList.add('canvas-fade');
    setTimeout(() => this.el.classList.remove('canvas-fade'), 400);
  }

  setDarkBg(on) {
    this._darkBg = on;
    this.clear();
  }

  // ── Tick ───────────────────────────────────────────────

  _tick() {
    if (!this._running || this._queue.length === 0) {
      this._running = false;
      document.body.classList.remove('drawing');
      if (this.onDone) this.onDone({
        strokes: this._strokes,
        steps:   this._steps,
        ms:      Date.now() - this._startTime,
      });
      return;
    }

    const delay = SPEED_DELAYS[this._speedIdx];

    if (delay === 0) {
      // Instant mode — drain entire queue at once
      while (this._queue.length > 0) this._execNext();
      this._running = false;
      document.body.classList.remove('drawing');
      if (this.onDone) this.onDone({
        strokes: this._strokes,
        steps:   this._steps,
        ms:      Date.now() - this._startTime,
      });
      return;
    }

    this._execNext();
    this._timer = setTimeout(() => this._tick(), delay);
  }

  _execNext() {
    if (!this._queue.length) return;
    const { cmd, args } = this._queue.shift();
    this._exec(cmd, args);
  }

  // ── Execute ────────────────────────────────────────────

  _exec(cmd, args) {
    switch (cmd) {
      case 'forward':   this._doForward(args[0]);        break;
      case 'left':      this._angle += args[0];          break;
      case 'goto':      this._doGoto(args[0], args[1]);  break;
      case 'home':      this._doGoto(0, 0);              break;
      case 'penup':     this._down = false;              break;
      case 'pendown':   this._down = true;               break;
      case 'color':     this._color = args[0];           break;
      case 'fillcolor': this._fillColor = args[0];       break;
      case 'pensize':   this._size = args[0];            break;
      case 'begin_fill':
        this._filling  = true;
        this._fillPath = [[this._sx(this._x), this._sy(this._y)]];
        break;
      case 'end_fill':  this._doFill();                  break;
      case 'stamp':     this._doStamp();                 break;
      case 'done':      /* sentinel — handled in tick */ break;
    }
    this._steps++;
    if (this.onStep) this.onStep(this._steps);
  }

  _doForward(dist) {
    const rad  = (this._angle * Math.PI) / 180;
    const nx   = this._x + dist * Math.cos(rad);
    const ny   = this._y + dist * Math.sin(rad);
    const sx1  = this._sx(this._x), sy1 = this._sy(this._y);
    const sx2  = this._sx(nx),      sy2 = this._sy(ny);

    if (this._down) {
      this.ctx.beginPath();
      this.ctx.moveTo(sx1, sy1);
      this.ctx.lineTo(sx2, sy2);
      this.ctx.strokeStyle = this._color;
      this.ctx.lineWidth   = this._size;
      this.ctx.lineCap     = 'round';
      this.ctx.stroke();
      this._strokes++;
      if (this.onStroke) this.onStroke(this._strokes);
    }

    if (this._filling) this._fillPath.push([sx2, sy2]);

    this._x = nx;
    this._y = ny;
  }

  _doGoto(x, y) {
    const sx1 = this._sx(this._x), sy1 = this._sy(this._y);
    const sx2 = this._sx(x),       sy2 = this._sy(y);
    if (this._down) {
      this.ctx.beginPath();
      this.ctx.moveTo(sx1, sy1);
      this.ctx.lineTo(sx2, sy2);
      this.ctx.strokeStyle = this._color;
      this.ctx.lineWidth   = this._size;
      this.ctx.lineCap     = 'round';
      this.ctx.stroke();
      this._strokes++;
      if (this.onStroke) this.onStroke(this._strokes);
    }
    if (this._filling) this._fillPath.push([sx2, sy2]);
    this._x = x; this._y = y;
  }

  _doFill() {
    if (!this._fillPath.length) return;
    this.ctx.beginPath();
    this.ctx.moveTo(this._fillPath[0][0], this._fillPath[0][1]);
    for (let i = 1; i < this._fillPath.length; i++)
      this.ctx.lineTo(this._fillPath[i][0], this._fillPath[i][1]);
    this.ctx.closePath();
    this.ctx.fillStyle = this._fillColor;
    this.ctx.fill();
    this._filling  = false;
    this._fillPath = [];
  }

  _doStamp() {
    const x = this._sx(this._x), y = this._sy(this._y);
    const r = this._size * 4;
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate((-(this._angle - 90) * Math.PI) / 180);
    this.ctx.beginPath();
    this.ctx.moveTo(0, -r);
    this.ctx.lineTo(r * 0.6, r * 0.6);
    this.ctx.lineTo(-r * 0.6, r * 0.6);
    this.ctx.closePath();
    this.ctx.fillStyle = this._color;
    this.ctx.fill();
    this.ctx.restore();
  }
}

// ── Palette helper ────────────────────────────────────────
export const PALETTES = {
  rainbow: (i, total) => `hsl(${(i / total) * 360}, 90%, 55%)`,
  sunset:  (i, total) => {
    const stops = ['#f97316','#ec4899','#8b5cf6','#f59e0b'];
    return stops[Math.floor((i / total) * stops.length) % stops.length];
  },
  ocean:   (i, total) => `hsl(${200 + (i / total) * 60}, 80%, 55%)`,
  forest:  (i, total) => `hsl(${100 + (i / total) * 60}, 70%, 45%)`,
  mono:    (i, total) => `hsl(0, 0%, ${20 + (i / total) * 70}%)`,
  neon:    (i, total) => `hsl(${(i / total) * 300 + 60}, 100%, 60%)`,
};