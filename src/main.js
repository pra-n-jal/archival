import { CollageComposer, CHUNK_WIDTH } from './composer.js';
import { WallRenderer } from './renderer.js';
import { WallAudio } from './audio.js';

async function init() {
  const canvas = document.getElementById('wall-canvas');
  const promptEl = document.getElementById('intro-prompt');
  const posDisplay = document.getElementById('pos-display');
  const chunkDisplay = document.getElementById('chunk-display');

  let manifest = { total: 0, all: [], dominant: [], supporting: [], diagrams: [], documents: [], reference: [] };
  try {
    const res = await fetch('assets/manifest.json');
    manifest = await res.json();
  } catch (err) {
    console.warn('Asset manifest missing, generating procedural fallbacks:', err);
  }

  const audio = new WallAudio();
  const composer = new CollageComposer(manifest);
  const renderer = new WallRenderer(canvas, composer, audio);

  // Preload neighboring chunks so imagery doesn't pop in on first drag
  for (let c = -1; c <= 1; c++) {
    const chunk = composer.getChunk(c);
    for (const el of chunk.elements) {
      if (el.type === 'image' && el.asset?.path) {
        renderer.getImage(el.asset.path);
      }
    }
  }

  let promptDismissed = false;
  function onFirstAction() {
    audio.play();
    if (!promptDismissed) {
      promptDismissed = true;
      if (promptEl) {
        promptEl.classList.add('hidden');
        setTimeout(() => promptEl.remove(), 1200);
      }
    }
  }

  // Wake audio + dismiss banner on first interaction
  ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(type => {
    window.addEventListener(type, onFirstAction, { once: true, passive: true });
  });

  // Keyboard controls
  const keyMap = {
    KeyA: 'left', ArrowLeft: 'left', a: 'left', A: 'left',
    KeyD: 'right', ArrowRight: 'right', d: 'right', D: 'right'
  };

  window.addEventListener('keydown', (e) => {
    const dir = keyMap[e.code] || keyMap[e.key];
    if (dir === 'left') {
      renderer.moveLeft = true;
      onFirstAction();
    } else if (dir === 'right') {
      renderer.moveRight = true;
      onFirstAction();
    } else if (e.code === 'KeyM' || e.key === 'm' || e.key === 'M') {
      audio.toggle();
    } else if (e.code === 'KeyF' || e.key === 'f' || e.key === 'F') {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }
  });

  window.addEventListener('keyup', (e) => {
    const dir = keyMap[e.code] || keyMap[e.key];
    if (dir === 'left') renderer.moveLeft = false;
    if (dir === 'right') renderer.moveRight = false;
  });

  // Mouse drag
  let isDown = false;
  let lastX = 0;

  window.addEventListener('mousedown', (e) => {
    if (e.target.closest('.archival-controls')) return;
    isDown = true;
    lastX = e.clientX;
    renderer.isDragging = true;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;

    renderer.cameraX -= dx / renderer.scale;
    renderer.velocity = -dx / 0.016;
    onFirstAction();
  });

  window.addEventListener('mouseup', () => {
    isDown = false;
    renderer.isDragging = false;
  });

  // Trackpad horizontal swipe / mouse wheel
  window.addEventListener('wheel', (e) => {
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) > 0.5) {
      renderer.cameraX += (delta * 1.5) / renderer.scale;
      renderer.velocity = delta * 40;
      onFirstAction();
    }
  }, { passive: true });

  // Touch swipe
  window.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDown = true;
      lastX = e.touches[0].clientX;
      renderer.isDragging = true;
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!isDown || e.touches.length !== 1) return;
    const clientX = e.touches[0].clientX;
    const dx = clientX - lastX;
    lastX = clientX;

    renderer.cameraX -= dx / renderer.scale;
    renderer.velocity = -dx / 0.016;
    onFirstAction();
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isDown = false;
    renderer.isDragging = false;
  });

  // Animation frame loop
  let lastTime = performance.now();

  function tick(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    renderer.update(dt);
    renderer.render();

    // Archival coordinates HUD
    const meters = (renderer.cameraX / 100).toFixed(1);
    const sign = renderer.cameraX >= 0 ? '+' : '';
    posDisplay.textContent = `LOC: ${sign}${meters} m`;

    const sector = Math.floor(renderer.cameraX / CHUNK_WIDTH);
    const sectorSign = sector >= 0 ? '+' : '';
    chunkDisplay.textContent = `SECTOR ${sectorSign}${sector}`;

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

window.addEventListener('DOMContentLoaded', init);

