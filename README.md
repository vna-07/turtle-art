# TurtleArt — Generative Art Engine

A browser-based generative art tool that simulates Python's turtle graphics engine on an HTML Canvas. Six art modes, 30+ patterns, famous artwork recreations, and an image tracer that redraws any uploaded photo as turtle strokes — all offline, no server required.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://vna-07.github.io/turtle-art)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![Vanilla JS](https://img.shields.io/badge/built%20with-Vanilla%20JS-yellow)

---

## Art Modes

### 🌀 Spirals
Parametric and mathematical spirals with color-cycling palettes.

| Pattern | Description |
|---------|-------------|
| Arithmetic | Classic expanding polygon spiral |
| Polar | Smooth Archimedean outward coil |
| Star | Overlapping rotating stars, hypnotic layered effect |
| Galaxy | Logarithmic multi-arm galaxy shape |
| Lissajous | Figure-8 and knot patterns using parametric sin equations |

### ❄️ Fractals
Recursive self-similar patterns drawn with turtle commands.

| Pattern | Description |
|---------|-------------|
| Koch Snowflake | Classic recursive triangle snowflake |
| Sierpinski | Recursive triangle subdivision |
| Dragon Curve | Folded paper self-similar curve |
| Hilbert Curve | Space-filling curve — beautiful with ocean palette |
| Fractal Tree | Branching tree with shrinking limbs and color gradient |

### ⭐ Geometric Patterns
Mathematical curves and tiling patterns.

| Pattern | Description |
|---------|-------------|
| Rose Curve | r = cos(k·θ) — petal count depends on k |
| Spirograph | Hypotrochoid — inner circle rolling inside outer circle |
| String Art | Lines connecting points around a circle |
| Sunflower | Fibonacci golden angle (137.508°) — the exact pattern nature uses |
| Islamic Tile | Interlocking 6-pointed stars inspired by traditional geometric art |

### 🌿 L-Systems
String rewriting rules interpreted as turtle commands.

| Pattern | Description |
|---------|-------------|
| Barnsley Fern | `X → F+[[X]-X]-F[-FX]+X` — the famous fern rule |
| Dragon Curve | Self-similar curve via L-System rewriting |
| Sierpinski Arrowhead | Triangle via alternating rules |
| Gosper Curve | Space-filling flowsnake |
| Bush / Plant | Branching plant structure |
| Penrose Tiling | Quasi-periodic 5-fold symmetry tiling |

### 🚶 Random Walk Art
Stochastic drawing algorithms.

| Pattern | Description |
|---------|-------------|
| Drunk Walk | Random angle + fixed step — classic random walk |
| Brownian Motion | Small random displacements simulating particle diffusion |
| Lévy Flight | Mostly small steps with occasional long jumps — creates clusters |
| Spiral Walk | Ordered chaos — walk that slowly spirals outward |
| Neon Web | Multiple agents walking outward from center |

### 🎨 Famous Artworks
Turtle interpretations of iconic art styles.

| Artwork | Inspiration |
|---------|-------------|
| Mondrian | Primary color grid blocks — Piet Mondrian |
| Starry Night | Swirling sinusoidal walks + stars — Van Gogh |
| Kandinsky | Concentric colorful circles — Wassily Kandinsky |

---

## 🖼️ Image Tracer

Upload any image and watch the turtle redraw it as edge strokes.

1. Converts the image to grayscale
2. Runs **Sobel edge detection** on pixel data
3. Samples and sorts edge points by proximity
4. Draws the result as turtle strokes with your chosen palette

Adjustable edge threshold and point density give fine control over the output.

---

## Controls

| Control | Description |
|---------|-------------|
| **Palette** | 6 color palettes: Rainbow, Sunset, Ocean, Forest, Mono, Neon |
| **Speed** | 1 (slow) to 10 (instant) |
| **Type** | Pick a specific pattern within the current mode |
| **Randomize** | Generate random parameters for the current mode |
| **Dark Canvas** | Toggle black background for neon/dark palettes |
| **Save PNG** | Download the current canvas as a PNG image |

---

## How to Use

Open `index.html` in any modern browser — no installation or server needed.

1. Pick an art mode from the sidebar
2. Choose a palette and pattern type
3. Hit **Draw** — or **Randomize** for a surprise
4. Adjust speed and redraw as many times as you like
5. Hit **Save PNG** to download your artwork

For **Image Tracer**: click the upload zone, pick an image, adjust the threshold and point density sliders, then hit **Draw**.

---

## Getting Started

```bash
git clone https://github.com/vna-07/turtle-art.git
cd turtle-art
open index.html   # or double-click it in your file explorer
```

No build step. No dependencies. No server. Just open and draw.

---

## Project Structure

```
turtle-art/
├── index.html          # UI layout
├── app.js              # Application controller
├── core/
│   ├── spiral.js       # 5 spiral generators
│   ├── fractal.js      # 5 fractal generators
│   ├── geometric.js    # 5 geometric pattern generators
│   ├── lsystem.js      # 6 L-System presets
│   ├── randomWalk.js   # 5 walk modes + 3 famous artworks
│   └── imageTracer.js  # Sobel edge detection + turtle tracer
└── ui/
    └── canvas.js       # Turtle engine — simulates Python turtle on HTML Canvas
```

---

## How It Works

TurtleArt is built entirely in vanilla JavaScript with no frameworks or external dependencies.

- **Turtle Engine** (`ui/canvas.js`) — reimplements the Python turtle API (`forward`, `left`, `penup`, `pendown`, `circle`, `fill`) on an HTML Canvas using a command queue with variable speed control
- **Spirals & Geometric** — render mathematical curves (Lissajous, hypotrochoid, rhodonea, Fibonacci) by computing parametric coordinates and issuing turtle commands
- **Fractals** — use recursive functions to break each shape into smaller copies of itself, matching the classic recursive definitions
- **L-Systems** — apply string rewriting rules iteratively (e.g. `F → F+F−F−F+F`), then interpret each character as a turtle command; bracket pairs `[` / `]` are handled with a stack
- **Random Walks** — drive the turtle with stochastic inputs (random angles, Lévy-distributed step lengths) to produce emergent organic patterns
- **Image Tracer** — runs a Sobel convolution kernel over the image's pixel data to detect edges, samples the resulting points, sorts them by proximity to minimize pen-up travel, then redraws as turtle strokes

---

## What I Learned

- Simulating the Python turtle API on HTML Canvas with a command queue animation system
- Implementing **Sobel edge detection** from scratch using pixel data and convolution kernels
- Deriving **L-System string rewriting** and parsing bracket stacks for push/pop turtle state
- Rendering mathematical curves — Lissajous, hypotrochoid, rhodonea, Fibonacci spiral
- Using the **golden angle (137.508°)** to reproduce the natural sunflower seed pattern
- Building variable-speed animation by throttling how many turtle commands execute per frame

---

## Course Connection

This project is built on concepts from my Python programming course:

| Chapter | Concept Used |
|---------|-------------|
| Ch 4 | Turtle graphics, for loops, `forward`/`left` commands |
| Ch 8 | Random walk algorithms, while loops |
| Ch 9 | String rewriting for L-Systems |
| Ch 10 | List stacks for L-System bracket parsing |
| Ch 16 | Recursion for fractals (Koch, Sierpinski, Dragon) |

---

## Acknowledgements

This project was inspired by and built on concepts from:

> *How to Think Like a Computer Scientist: Interactive Edition*
> Copyright © Brad Miller, David Ranum, Jeffrey Elkner, Peter Wentworth, Allen B. Downey, Chris Meyers, and Dario Mitchell.
>
> Permission is granted to copy, distribute and/or modify this document under the terms of the GNU Free Documentation License, Version 1.3 or any later version published by the Free Software Foundation. A copy of the license is available at [gnu.org/licenses/fdl.html](https://www.gnu.org/licenses/fdl.html).

Turtle graphics (ch4), random walk algorithms (ch8), string rewriting (ch9), list stacks (ch10), and recursion (ch16) from this textbook directly informed the design of this project.

---

*Built by [@vna-07](https://github.com/vna-07)*
