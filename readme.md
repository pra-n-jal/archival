<img width="1904" height="870" alt="preview" src="https://github.com/user-attachments/assets/969a2888-43a2-4935-ad9d-d88e8b5f1cc9" />


# HYPERSTITION

An endless, interactive archival collage rendered on HTML5 Canvas.

You walk sideways along a monumental wall layered with distressed, monochromatic historical imagery, technical diagrams, newspaper clippings, constructivist black fields, and cobalt blue interruptions.

---

## Getting Started

No build step or external dependencies required. Choose any of these quick ways to run:

### Option 1: Double-click (Easiest)
Double-click [`run.bat`](file:///c:/Users/pranj/Downloads/photobashing%20mosaics/run.bat) in the project folder. It launches the local server and opens your browser automatically.

### Option 2: Python (Windows `py` launcher)
On Windows, standard Python installs as `py`:
```bash
py -m http.server 8080
```
*(If `python` is configured in your PATH, `python -m http.server 8080` also works)*

### Option 3: Node.js / npx
```bash
npx serve
```

Then visit [http://localhost:8080](http://localhost:8080) (or the port shown in your terminal).

---

## Controls

| Key / Action | Function |
| :--- | :--- |
| `A` or `←` | Move left |
| `D` or `→` | Move right |
| **Mouse Drag** | Click and drag horizontally to pull the wall |
| **Trackpad / Wheel** | Horizontal scroll or two-finger swipe |
| `M` | Mute / unmute soundtrack |
| `F` | Toggle fullscreen |

Movement is momentum-based with smooth acceleration and gentle deceleration. The wall generates indefinitely in both directions.


## Project Structure

```
├── index.html              # Canvas container and minimal HUD
├── style.css               # Typography and layout styling
├── README.md
├── process_all_assets.py   # Optional tool to re-process raw source images
├── src/
│   ├── main.js             # Event handling, loop, and viewport management
│   ├── renderer.js         # 2D canvas drawing, camera physics, and grain overlays
│   ├── composer.js         # Procedural chunk generator & archetype logic
│   ├── diagrams.js         # Procedural waveforms, celestial spheres, moon phases, ledgers
│   ├── audio.js            # Web Audio API room tone, tape hiss, and paper friction
│   └── math.js             # Mulberry32 seeded PRNG and coordinate hashing
└── assets/
    ├── processed/          # 360+ curated archival collage crops
    └── manifest.json       # Asset manifest with dimensions, aspect ratios, and tags
```

---

## How Procedural Generation Works

- Coordinate space extends infinitely ($-\infty < x < +\infty$).
- The wall is partitioned into $1600\text{px}$ horizontal chunks.
- Each chunk index is hashed deterministically (`hashChunk(index)`). If you walk miles away and come back, every image and tear is in the exact same spot.
- Long horizontal cobalt bars and black fields cross chunk boundaries to avoid visible seam lines.
- Archival images are sourced from ethical public-domain archives and come under fair use.

---

## Dev Log: How I Built This & What I Struggled With

Honestly this project took way too much time than it should have taken. I wanted to build this massive endless gallery wall inspired by constructivist art, David Lynch vibes, old newspapers, and darkroom photobashing. Doing it all in pure HTML5 Canvas with zero frameworks or external libraries sounded like a fun idea until I actually started coding it.

### 1. The Infinite Coordinate 
The biggest headache early on was making the wall infinite. At first I tried just spawning images across a giant canvas and my browser tab instantly crashed because 300+ uncompressed images ate all my RAM. I had to learn how chunk-based rendering works (kinda like Minecraft terrain). 
Also, negative numbers in JavaScript are evil—`-1 % 1600` doesn't wrap around like you expect it to, so whenever I walked left into negative coordinates, the entire wall turned blank and glitched out. I spent an entire weekend fixing my chunk hash math (`hashChunk`) and setting up an LRU cache so old chunks get thrown out when you walk too far.

### 2. Physics & Friction mechanic
Getting the controls to feel good was surprisingly hard. In the first version, as soon as you tapped `D`, the camera would just launch into the void at super  speed and wouldn't stop. I had to rewrite the momentum loop three times to get that heavy, analog glide where you have real inertia, but you can still gently drag and inspect individual photos without it feeling slippery like ice.

### 3. Hand-Coding All The Diagrams & Audio
All the procedural graphics on the wall—the celestial orbit spheres, the jagged seismograph waveforms, the moon phase strips, the letterpress columns, and the vintage ledger tables—I drew by hand directly in Canvas 2D using math (`Math.sin`, `ctx.arc`, `ctx.ellipse`, and coordinate offsets). Obviously i consider myself a rookie so it meant going bakc and forth with google, friends and gpt but the code is mine only.
For the audio, I really wanted it to feel tactile, so I hooked up the Web Audio API to generate low-pass filtered pink noise whenever the camera moves. When you drag faster, the filter frequency opens up so it actually sounds like real paper sliding across a wooden desk!

### 4. The One Thing I Couldn't Do 
Ima be 100% honest here: **every single piece of the front-end code, the canvas renderer, the chunk composer archetypes, the physics loop, the audio engine, and the design layout was made by me and me only.** 

BUT... the image processing automation script (`process_all_assets.py`) was WAY too hard and specific for me to figure out on my own. Trying to write a Python script from scratch using PIL that automatically takes hundreds of high-res source images, computes S-curve photocopy LUT curves to crush midtones and clamp blacks to `#080808`, sharpens high-pass edges, auto-crops them into exact panoramic strips, vertical pillars, and squares, and then compiles a massive JSON manifest with aspect ratios... my brain completely fried trying to get the math and file paths working without breaking. I tried for hours, couldn't get it working, and ended up using **Antigravity** at the end specifically to write that batch asset processing script. 

Everything else in the actual experience you see and interact with on screen is my own manual code and labor!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
