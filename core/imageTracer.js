// core/imageTracer.js
// Scans an uploaded image, detects edges, and redraws as turtle strokes.
// Uses Sobel edge detection on pixel data — no external libraries needed.

import { PALETTES } from '../ui/canvas.js';

// ── Edge Detection (Sobel) ────────────────────────────────
function toGrayscale(data, w, h) {
  const gray = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
    gray[i] = 0.299 * r + 0.587 * g + 0.114 * b;
  }
  return gray;
}

function sobel(gray, w, h) {
  const edges = new Float32Array(w * h);
  const Kx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const Ky = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let gx = 0, gy = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const px  = gray[(y + ky) * w + (x + kx)];
          const idx = (ky + 1) * 3 + (kx + 1);
          gx += px * Kx[idx];
          gy += px * Ky[idx];
        }
      }
      edges[y * w + x] = Math.sqrt(gx * gx + gy * gy);
    }
  }
  return edges;
}

// ── Sample edge pixels ────────────────────────────────────
function sampleEdges(edges, w, h, threshold = 60, maxPoints = 2000) {
  const pts = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (edges[y * w + x] > threshold) pts.push([x, y]);
    }
  }

  // Downsample if too many points
  if (pts.length > maxPoints) {
    const step = Math.ceil(pts.length / maxPoints);
    return pts.filter((_, i) => i % step === 0);
  }
  return pts;
}

// ── Sort points by proximity (nearest-neighbor greedy) ────
function sortByProximity(pts) {
  if (pts.length === 0) return pts;
  const sorted  = [pts[0]];
  const visited = new Uint8Array(pts.length);
  visited[0]    = 1;

  for (let i = 1; i < pts.length; i++) {
    const [lx, ly] = sorted[sorted.length - 1];
    let bestIdx = -1, bestDist = Infinity;

    // Only scan nearby candidates for speed
    const scanLimit = Math.min(pts.length, sorted.length + 300);
    for (let j = Math.max(0, sorted.length - 150); j < scanLimit; j++) {
      if (visited[j]) continue;
      const dx = pts[j][0] - lx, dy = pts[j][1] - ly;
      const d  = dx * dx + dy * dy;
      if (d < bestDist) { bestDist = d; bestIdx = j; }
    }

    if (bestIdx === -1) {
      // Fall back to first unvisited
      for (let j = 0; j < pts.length; j++) {
        if (!visited[j]) { bestIdx = j; break; }
      }
    }

    visited[bestIdx] = 1;
    sorted.push(pts[bestIdx]);
  }
  return sorted;
}

// ── Main tracer ───────────────────────────────────────────
export function traceImage(t, imageEl, opts = {}) {
  const {
    threshold  = 60,
    maxPoints  = 1500,
    palette    = 'rainbow',
    pensize    = 1.2,
    canvasW    = 600,
    canvasH    = 420,
  } = opts;

  // Draw image to offscreen canvas to read pixels
  const offscreen   = document.createElement('canvas');
  const scaleFactor = 0.5; // work at half res for speed
  offscreen.width   = Math.floor(canvasW * scaleFactor);
  offscreen.height  = Math.floor(canvasH * scaleFactor);
  const ctx         = offscreen.getContext('2d');

  ctx.drawImage(imageEl, 0, 0, offscreen.width, offscreen.height);
  const imgData = ctx.getImageData(0, 0, offscreen.width, offscreen.height);
  const { data, width: w, height: h } = imgData;

  // Edge detection
  const gray   = toGrayscale(data, w, h);
  const edges  = sobel(gray, w, h);
  const pts    = sampleEdges(edges, w, h, threshold, maxPoints);
  const sorted = sortByProximity(pts);

  if (sorted.length === 0) return;

  // Map image coords → turtle coords (center origin)
  const toTurtleX = x => (x / w) * canvasW - canvasW / 2;
  const toTurtleY = y => -(y / h) * canvasH + canvasH / 2;

  // Queue turtle commands
  t.pensize(pensize);
  t.penup();

  let penIsDown = false;
  let prevX = null, prevY = null;
  const jumpThreshold = (canvasW / w) * 20; // gap threshold in turtle units

  for (let i = 0; i < sorted.length; i++) {
    const tx = toTurtleX(sorted[i][0]);
    const ty = toTurtleY(sorted[i][1]);

    t.color(PALETTES[palette](i, sorted.length));

    if (prevX !== null) {
      const dist = Math.sqrt((tx - prevX) ** 2 + (ty - prevY) ** 2);
      if (dist > jumpThreshold) {
        t.penup();
        t.goto(tx, ty);
        t.pendown();
        penIsDown = true;
      } else {
        if (!penIsDown) { t.pendown(); penIsDown = true; }
        t.goto(tx, ty);
      }
    } else {
      t.goto(tx, ty);
      t.pendown();
      penIsDown = true;
    }

    prevX = tx; prevY = ty;
  }

  t.done();
  return sorted.length;
}

// ── Load image from file input ────────────────────────────
export function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Not an image file'));
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      const img  = new Image();
      img.onload = () => resolve(img);
      img.onerror= () => reject(new Error('Failed to load image'));
      img.src    = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}