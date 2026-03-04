TurtleArt — Generative Art Engine
A browser-based generative art tool that simulates Python's turtle graphics engine on an HTML Canvas. Six art modes, 30+ patterns, famous artwork recreations, and an image tracer that redraws any uploaded photo as turtle strokes — all offline, no server required.

🔗 Live Demo

Art Modes
🌀 Spirals
Parametric and mathematical spirals with color-cycling palettes.

Pattern	Description
Arithmetic	Classic expanding polygon spiral — the one from Python turtle ch4
Polar	Smooth Archimedean outward coil
Star	Overlapping rotating stars, hypnotic layered effect
Galaxy	Logarithmic multi-arm galaxy shape
Lissajous	Figure-8 and knot patterns using parametric sin equations
❄️ Fractals
Recursive self-similar patterns drawn with turtle commands.

Pattern	Description
Koch Snowflake	Classic recursive triangle snowflake
Sierpinski	Recursive triangle subdivision
Dragon Curve	Folded paper self-similar curve
Hilbert Curve	Space-filling curve — beautiful with ocean palette
Fractal Tree	Branching tree with shrinking limbs and color gradient
⭐ Geometric Patterns
Mathematical curves and tiling patterns.

Pattern	Description
Rose Curve	r = cos(k·θ) — petal count depends on k
Spirograph	Hypotrochoid — inner circle rolling inside outer circle
String Art	Lines connecting points around a circle
Sunflower	Fibonacci golden angle (137.508°) — the exact pattern nature uses
Islamic Tile	Interlocking 6-pointed stars inspired by traditional geometric art
🌿 L-Systems
String rewriting rules interpreted as turtle commands — directly tied to ch9 (strings) and ch10 (lists) of the Python course.

Pattern	Description
Barnsley Fern	X → F+[[X]-X]-F[-FX]+X — the famous fern rule
Dragon Curve	Self-similar curve via L-System rewriting
Sierpinski Arrowhead	Triangle via alternating rules
Gosper Curve	Space-filling flowsnake
Bush / Plant	Branching plant structure
Penrose Tiling	Quasi-periodic 5-fold symmetry tiling
🚶 Random Walk Art
Stochastic drawing algorithms — inspired by ch8 (randomly walking turtles).

Pattern	Description
Drunk Walk	Random angle + fixed step — classic ch8 random walk
Brownian Motion	Small random displacements simulating particle diffusion
Lévy Flight	Mostly small steps with occasional long jumps — creates clusters
Spiral Walk	Ordered chaos — walk that slowly spirals outward
Neon Web	Multiple agents walking outward from center
🎨 Famous Artworks
Turtle interpretations of iconic art styles.

Artwork	Inspiration
Mondrian	Primary color grid blocks — Piet Mondrian
Starry Night	Swirling sinusoidal walks + stars — Van Gogh
Kandinsky	Concentric colorful circles — Wassily Kandinsky
🖼️ Image Tracer
Upload any image and watch the turtle redraw it as edge strokes.

Converts image to grayscale
Runs Sobel edge detection on pixel data
Samples and sorts edge points by proximity
Draws the result as turtle strokes with your chosen palette
Adjustable edge threshold and point density
Controls
Palette — 6 color palettes: Rainbow, Sunset, Ocean, Forest, Mono, Neon
Speed — 1 (slow) to 10 (instant)
Type — pick specific pattern within each mode
Randomize — generate random parameters for the current mode
Dark Canvas — toggle black background for neon/dark palettes
Save PNG — download the current canvas as a PNG image
How to Use
Open index.html in any modern browser or visit the live demo — no installation needed.

Pick an art mode from the sidebar
Choose a palette and type
Hit Draw — or Randomize for a surprise
Adjust speed and redraw as many times as you like
Hit Save PNG to download your artwork
For Image Tracer: click the upload zone, pick an image, adjust the threshold and point sliders, then hit Draw.

Project Structure
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
What I Learned
Simulating the Python turtle API (forward, left, penup, pendown, circle, fill) on HTML Canvas
Building a command queue animation system with variable speed control
Implementing Sobel edge detection from scratch using pixel data and convolution kernels
Deriving L-System string rewriting from course concepts in ch9 (strings) and ch10 (lists)
Rendering mathematical curves — Lissajous, hypotrochoid, rhodonea, Fibonacci spiral
Using the golden angle (137.508°) to reproduce the natural sunflower seed pattern
Course Connection
This project is built on concepts from my Python programming course:

Chapter	Concept Used
Ch 4	Turtle graphics, for loops, forward/left commands
Ch 8	Random walk algorithms, while loops
Ch 9	String rewriting for L-Systems
Ch 10	List stacks for L-System bracket parsing
Ch 16	Recursion for fractals (Koch, Sierpinski, Dragon)
Acknowledgements
This project was inspired by and built on concepts from:

How to Think Like a Computer Scientist: Interactive Edition Copyright © Brad Miller, David Ranum, Jeffrey Elkner, Peter Wentworth, Allen B. Downey, Chris Meyers, and Dario Mitchell.

Permission is granted to copy, distribute and/or modify this document under the terms of the GNU Free Documentation License, Version 1.3 or any later version published by the Free Software Foundation. A copy of the license is available at gnu.org/licenses/fdl.html.

The interactive edition is hosted at interactivepython.org and was built using the Runestone Interactive platform.

Turtle graphics concepts (ch4), random walk algorithms (ch8), string rewriting (ch9), list stacks (ch10), and recursion (ch16) from this textbook directly informed the design of this project.

License
MIT © 2026 Ayolela Vena

