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

