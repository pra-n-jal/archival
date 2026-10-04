
// Refinement: optimize renderer execution and edge case handling
// import { CHUNK_WIDTH, WALL_HEIGHT, PALETTE } from './composer.js';
import { PRNG } from './math.js';
import {
      drawWaveformDiagram,
        drawCelestialDiagram,
          drawMoonPhasesStrip,
            drawTypographyColumn,
              drawLedgerFragment,
                drawArchivalStamp,
                  drawRegistrationMarks
} from './diagrams.js';

export class WallRenderer {
      constructor(canvas, composer, audio) {
            this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
        this.composer = composer;
            this.audio = audio;
            
                this.cameraX = 0;
                    this.velocity = 0;

                        // Movement physics: punchy initial acceleration with high inertia glide
                            this.acceleration = 2400;
                                this.friction = 0.88;
                                    this.maxVelocity = 900;

                                        this.moveLeft = false;
                                            this.moveRight = false;
                                                this.isDragging = false;

                                                    this.width = window.innerWidth;
                                                        this.height = window.innerHeight;
                                                            this.scale = 1.0;

                                                                this.imageCache = new Map();

                                                                    // Reusable 256x256 film grain overlay tile
                                                                        this.noiseCanvas = document.createElement('canvas');
                                                                            this.noiseCanvas.width = 256;
                                                                                this.noiseCanvas.height = 256;
                                                                                    this.initNoisePattern();

                                                                                        this.resize();
                                                                                            window.addEventListener('resize', () => this.resize());
      }

        initNoisePattern() {
                const nctx = this.noiseCanvas.getContext('2d');
                    const imgData = nctx.createImageData(256, 256);
                        const d = imgData.data;
                            for (let i = 0; i < d.length; i += 4) {
                                      const v = Math.random() * 255;
                                            d[i] = v;
                                                  d[i + 1] = v;
                                                        d[i + 2] = v;
                                                              d[i + 3] = Math.random() * 28 + 6;
                            }
                                nctx.putImageData(imgData, 0, 0);
                        }

                          resize() {
                                this.width = window.innerWidth;
                                    this.height = window.innerHeight;
                                        const dpr = Math.min(window.devicePixelRatio || 1, 2);

                                            this.canvas.width = Math.floor(this.width * dpr);
                                                this.canvas.height = Math.floor(this.height * dpr);

                                                    // Fit full 1080px wall height comfortably within view with margin
                                                        this.scale = (this.height / WALL_HEIGHT) * 0.94;
                                                            this.dpr = dpr;
                          }

                            getImage(path) {
                                    let img = this.imageCache.get(path);
                                        if (!img) {
                                                  img = new Image();
                                                        img.src = path;
                                                              this.imageCache.set(path, img);
                                        }
                                            return img;
                                    }

                                      update(dt) {
                                            let dir = 0;
                                                if (this.moveLeft) dir -= 1;
                                                    if (this.moveRight) dir += 1;

                                                        if (dir !== 0) {
                                                                  this.velocity += dir * this.acceleration * dt;
                                                                        this.velocity = Math.max(-this.maxVelocity, Math.min(this.maxVelocity, this.velocity));
                                                        } else if (!this.isDragging) {
                                                                  this.velocity *= Math.pow(this.friction, dt * 60);
                                                                        if (Math.abs(this.velocity) < 0.5) this.velocity = 0;
                                                        }

                                                            this.cameraX += this.velocity * dt;

                                                                if (this.audio) {
                                                                          this.audio.updateVelocity(this.velocity);
                                                                }
                                                            }

                                                              render() {
                                                                    const ctx = this.ctx;
                                                                        const dpr = this.dpr || 1;

                                                                            ctx.save();
                                                                                ctx.scale(dpr, dpr);

                                                                                    // Aged gallery paper base
                                                                                        ctx.fillStyle = PALETTE.paper;
                                                                                            ctx.fillRect(0, 0, this.width, this.height);

                                                                                                ctx.save();
                                                                                                    ctx.translate(this.width / 2, this.height / 2);
                                                                                                        ctx.scale(this.scale, this.scale);
                                                                                                            ctx.translate(-this.cameraX, -WALL_HEIGHT / 2);

                                                                                                                // Visible chunk frustum culling
                                                                                                                    const halfViewW = (this.width / 2) / this.scale;
                                                                                                                        const minX = this.cameraX - halfViewW - 120;
                                                                                                                            const maxX = this.cameraX + halfViewW + 120;

                                                                                                                                const startChunk = Math.floor(minX / CHUNK_WIDTH);
                                                                                                                                    const endChunk = Math.floor(maxX / CHUNK_WIDTH);

                                                                                                                                        for (let c = startChunk; c <= endChunk; c++) {
                                                                                                                                                  const chunk = this.composer.getChunk(c);
                                                                                                                                                        this.renderChunk(ctx, chunk);
                                                                                                                                        }

                                                                                                                                            ctx.restore();

                                                                                                                                                this.renderOverlays(ctx);
                                                                                                                                                    ctx.restore();
                                                                                                                                    }

                                                                                                                                      renderChunk(ctx, chunk) {
                                                                                                                                            ctx.save();
                                                                                                                                                ctx.translate(chunk.worldX, 0);

                                                                                                                                                    for (const el of chunk.elements) {
                                                                                                                                                              switch (el.type) {
                                                                                                                                                                        case 'fold_crease':
                                                                                                                                                                                      this.drawFoldCrease(ctx, el);
                                                                                                                                                                                                break;
                                                                                                                                                                                                        case 'black_field':
                                                                                                                                                                                                                      this.drawBlackField(ctx, el);
                                                                                                                                                                                                                                break;
                                                                                                                                                                                                                                        case 'image':
                                                                                                                                                                                                                                                      this.drawImageElement(ctx, el);
                                                                                                                                                                                                                                                                break;
                                                                                                                                                                                                                                                                        case 'diagram':
                                                                                                                                                                                                                                                                                      this.drawDiagramElement(ctx, el, chunk.index);
                                                                                                                                                                                                                                                                                                break;
                                                                                                                                                                                                                                                                                                        case 'cobalt_bar':
                                                                                                                                                                                                                                                                                                                      this.drawCobaltBar(ctx, el);
                                                                                                                                                                                                                                                                                                                                break;
                                                                                                                                                                                                                                                                                                                                        case 'cobalt_shape':
                                                                                                                                                                                                                                                                                                                                                      this.drawCobaltShape(ctx, el);
                                                                                                                                                                                                                                                                                                                                                                break;
                                                                                                                                                                                                                                                                                                                                                                        case 'cobalt_line':
                                                                                                                                                                                                                                                                                                                                                                                      this.drawCobaltLine(ctx, el);
                                                                                                                                                                                                                                                                                                                                                                                                break;
                                                                                                                                                                                                                                                                                                                                                                                                        case 'redaction':
                                                                                                                                                                                                                                                                                                                                                                                                                      this.drawRedaction(ctx, el);
                                                                                                                                                                                                                                                                                                                                                                                                                                break;
                                                                                                                                                                                                                                                                                                                                                                                                                                        case 'stamp':
                                                                                                                                                                                                                                                                                                                                                                                                                                                      drawArchivalStamp(ctx, el.text, el.x, el.y, el.angle || 0, el.isCobalt);
                                                                                                                                                                                                                                                                                                                                                                                                                                                                break;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                        case 'tape':
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      this.drawTape(ctx, el);
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                break;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        case 'scratch':
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      this.drawScratch(ctx, el);
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                break;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        case 'static_mark':
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      this.drawStaticMark(ctx, el);
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                break;
                                                                                                                                                              }
                                                                                                                                                            }

                                                                                                                                                                ctx.restore();
                                                                                                                                                        }

                                                                                                                                                          drawScratch(ctx, el) {
                                                                                                                                                                ctx.save();
                                                                                                                                                                    ctx.translate(el.x, el.y);
                                                                                                                                                                        ctx.rotate(el.angle);
                                                                                                                                                                            ctx.strokeStyle = el.isWhite ? 'rgba(232, 227, 215, 0.7)' : 'rgba(8, 8, 8, 0.65)';
                                                                                                                                                                                ctx.lineWidth = el.width;
                                                                                                                                                                                    ctx.beginPath();
                                                                                                                                                                                        ctx.moveTo(0, 0);
                                                                                                                                                                                            ctx.lineTo(el.len, 0);
                                                                                                                                                                                                ctx.stroke();
                                                                                                                                                                                                    ctx.restore();
                                                                                                                                                          }

                                                                                                                                                            drawStaticMark(ctx, el) {
                                                                                                                                                                    ctx.save();
                                                                                                                                                                        ctx.translate(el.x, el.y);
                                                                                                                                                                            drawRegistrationMarks(ctx, 0, 0, el.size, el.isCobalt);
                                                                                                                                                                                ctx.restore();
                                                                                                                                                            }

                                                                                                                                                              drawFoldCrease(ctx, el) {
                                                                                                                                                                    ctx.save();
                                                                                                                                                                        if (el.axis === 'h') {
                                                                                                                                                                                  ctx.fillStyle = 'rgba(8, 8, 8, 0.12)';
                                                                                                                                                                                        ctx.fillRect(el.x, el.y, el.w, 1.2);
                                                                                                                                                                                              ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
                                                                                                                                                                                                    ctx.fillRect(el.x, el.y + 1.2, el.w, 1.2);
                                                                                                                                                                        } else {
                                                                                                                                                                                  ctx.fillStyle = 'rgba(8, 8, 8, 0.1)';
                                                                                                                                                                                        ctx.fillRect(el.x, el.y, 1.2, el.h);
                                                                                                                                                                                              ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
                                                                                                                                                                                                    ctx.fillRect(el.x + 1.2, el.y, 1.2, el.h);
                                                                                                                                                                        }
                                                                                                                                                                            ctx.restore();
                                                                                                                                                                    }

                                                                                                                                                                      drawBlackField(ctx, el) {
                                                                                                                                                                            ctx.save();
                                                                                                                                                                                ctx.fillStyle = PALETTE.black;

                                                                                                                                                                                    if (!el.stepped) {
                                                                                                                                                                                              ctx.fillRect(el.x, el.y, el.w, el.h);
                                                                                                                                                                                    } else {
                                                                                                                                                                                              // Constructivist stepped cutouts
                                                                                                                                                                                                    ctx.beginPath();
                                                                                                                                                                                                          const cut = el.stepped;
                                                                                                                                                                                                                if (cut.cutX === 'left') {
                                                                                                                                                                                                                            ctx.moveTo(el.x, el.y);
                                                                                                                                                                                                                                    ctx.lineTo(el.x + el.w, el.y);
                                                                                                                                                                                                                                            ctx.lineTo(el.x + el.w, el.y + el.h);
                                                                                                                                                                                                                                                    ctx.lineTo(el.x + cut.cutW, el.y + el.h);
                                                                                                                                                                                                                                                            ctx.lineTo(el.x + cut.cutW, el.y + el.h - cut.cutH);
                                                                                                                                                                                                                                                                    ctx.lineTo(el.x, el.y + el.h - cut.cutH);
                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                            ctx.moveTo(el.x, el.y);
                                                                                                                                                                                                                                    ctx.lineTo(el.x + el.w - cut.cutW, el.y);
                                                                                                                                                                                                                                            ctx.lineTo(el.x + el.w - cut.cutW, el.y + cut.cutH);
                                                                                                                                                                                                                                                    ctx.lineTo(el.x + el.w, el.y + cut.cutH);
                                                                                                                                                                                                                                                            ctx.lineTo(el.x + el.w, el.y + el.h);
                                                                                                                                                                                                                                                                    ctx.lineTo(el.x, el.y + el.h);
                                                                                                                                                                                                                }
                                                                                                                                                                                                                      ctx.closePath();
                                                                                                                                                                                                                            ctx.fill();
                                                                                                                                                                                                            }
                                                                                                                                                                                                                ctx.restore();
                                                                                                                                                                                                        }

                                                                                                                                                                                                          drawImageElement(ctx, el) {
                                                                                                                                                                                                                const img = this.getImage(el.asset.path);
                                                                                                                                                                                                                    if (!img.complete || img.naturalWidth === 0) {
                                                                                                                                                                                                                              ctx.save();
                                                                                                                                                                                                                                    ctx.fillStyle = 'rgba(8, 8, 8, 0.08)';
                                                                                                                                                                                                                                          ctx.fillRect(el.x, el.y, el.w, el.h);
                                                                                                                                                                                                                                                ctx.restore();
                                                                                                                                                                                                                                                      return;
                                                                                                                                                                                                                    }

                                                                                                                                                                                                                        ctx.save();

                                                                                                                                                                                                                            // Natural hand-placed rotation
                                                                                                                                                                                                                                if (el.rotation) {
                                                                                                                                                                                                                                          const cx = el.x + el.w / 2;
                                                                                                                                                                                                                                                const cy = el.y + el.h / 2;
                                                                                                                                                                                                                                                      ctx.translate(cx, cy);
                                                                                                                                                                                                                                                            ctx.rotate(el.rotation);
                                                                                                                                                                                                                                                                  ctx.translate(-cx, -cy);
                                                                                                                                                                                                                                }

                                                                                                                                                                                                                                    if (el.paperBorder) {
                                                                                                                                                                                                                                              ctx.fillStyle = PALETTE.paper;
                                                                                                                                                                                                                                                    ctx.fillRect(el.x - 3, el.y - 3, el.w + 6, el.h + 6);
                                                                                                                                                                                                                                                          ctx.strokeStyle = 'rgba(8, 8, 8, 0.18)';
                                                                                                                                                                                                                                                                ctx.lineWidth = 0.5;
                                                                                                                                                                                                                                                                      ctx.strokeRect(el.x - 3, el.y - 3, el.w + 6, el.h + 6);
                                                                                                                                                                                                                                    }

                                                                                                                                                                                                                                        if (el.cropTorn) {
                                                                                                                                                                                                                                                  // Rough scissor/tear clipping path
                                                                                                                                                                                                                                                        ctx.beginPath();
                                                                                                                                                                                                                                                              ctx.rect(el.x, el.y, el.w, el.h);
                                                                                                                                                                                                                                                                    ctx.clip();
                                                                                                                                                                                                                                        }

                                                                                                                                                                                                                                            ctx.drawImage(img, el.x, el.y, el.w, el.h);
                                                                                                                                                                                                                                                ctx.restore();
                                                                                                                                                                                                                                    }

                                                                                                                                                                                                                                      drawDiagramElement(ctx, el, chunkIndex) {
                                                                                                                                                                                                                                            // Deterministic PRNG seeded per element: no frame-to-frame flicker
                                                                                                                                                                                                                                                const seed = el.seed || (chunkIndex * 1337 + (el.x | 0));
                                                                                                                                                                                                                                                    const rng = new PRNG(seed);

                                                                                                                                                                                                                                                        switch (el.subType) {
                                                                                                                                                                                                                                                                  case 'waveform':
                                                                                                                                                                                                                                                                            drawWaveformDiagram(ctx, el.x, el.y, el.w, el.h, rng);
                                                                                                                                                                                                                                                                                    break;
                                                                                                                                                                                                                                                                                          case 'celestial':
                                                                                                                                                                                                                                                                                                    drawCelestialDiagram(ctx, el.x, el.y, el.w, rng);
                                                                                                                                                                                                                                                                                                            break;
                                                                                                                                                                                                                                                                                                                  case 'moon_phases':
                                                                                                                                                                                                                                                                                                                            drawMoonPhasesStrip(ctx, el.x, el.y, el.w, el.h, rng);
                                                                                                                                                                                                                                                                                                                                    break;
                                                                                                                                                                                                                                                                                                                                          case 'typography':
                                                                                                                                                                                                                                                                                                                                                    drawTypographyColumn(ctx, el.x, el.y, el.w, el.h, rng);
                                                                                                                                                                                                                                                                                                                                                            break;
                                                                                                                                                                                                                                                                                                                                                                  case 'ledger':
                                                                                                                                                                                                                                                                                                                                                                            drawLedgerFragment(ctx, el.x, el.y, el.w, el.h, rng);
                                                                                                                                                                                                                                                                                                                                                                                    break;
                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                    }

                                                                                                                                                                                                                                                      drawCobaltBar(ctx, el) {
                                                                                                                                                                                                                                                            ctx.save();
                                                                                                                                                                                                                                                                ctx.fillStyle = PALETTE.cobalt;
                                                                                                                                                                                                                                                                    ctx.fillRect(el.x, el.y, el.w, el.h);
                                                                                                                                                                                                                                                                        ctx.strokeStyle = PALETTE.black;
                                                                                                                                                                                                                                                                            ctx.lineWidth = 0.5;
                                                                                                                                                                                                                                                                                ctx.strokeRect(el.x, el.y, el.w, el.h);
                                                                                                                                                                                                                                                                                    ctx.restore();
                                                                                                                                                                                                                                                      }

                                                                                                                                                                                                                                                        drawCobaltShape(ctx, el) {
                                                                                                                                                                                                                                                                ctx.save();
                                                                                                                                                                                                                                                                    ctx.fillStyle = PALETTE.cobalt;

                                                                                                                                                                                                                                                                        if (el.shape === 'circle') {
                                                                                                                                                                                                                                                                                  ctx.beginPath();
                                                                                                                                                                                                                                                                                        ctx.arc(el.x, el.y, el.radius, 0, Math.PI * 2);
                                                                                                                                                                                                                                                                                              ctx.fill();
                                                                                                                                                                                                                                                                                                    ctx.strokeStyle = PALETTE.black;
                                                                                                                                                                                                                                                                                                          ctx.lineWidth = 0.5;
                                                                                                                                                                                                                                                                                                                ctx.stroke();
                                                                                                                                                                                                                                                                        } else {
                                                                                                                                                                                                                                                                                  ctx.fillRect(el.x, el.y, el.w, el.h);
                                                                                                                                                                                                                                                                                        ctx.strokeStyle = PALETTE.black;
                                                                                                                                                                                                                                                                                              ctx.lineWidth = 0.5;
                                                                                                                                                                                                                                                                                                    ctx.strokeRect(el.x, el.y, el.w, el.h);
                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                            ctx.restore();
                                                                                                                                                                                                                                                                    }

                                                                                                                                                                                                                                                                      drawCobaltLine(ctx, el) {
                                                                                                                                                                                                                                                                            ctx.save();
                                                                                                                                                                                                                                                                                ctx.strokeStyle = PALETTE.cobalt;
                                                                                                                                                                                                                                                                                    ctx.lineWidth = el.lineWidth || 1.5;
                                                                                                                                                                                                                                                                                        ctx.beginPath();
                                                                                                                                                                                                                                                                                            ctx.moveTo(el.x1, el.y1);
                                                                                                                                                                                                                                                                                                ctx.lineTo(el.x2, el.y2);
                                                                                                                                                                                                                                                                                                    ctx.stroke();

                                                                                                                                                                                                                                                                                                        drawRegistrationMarks(ctx, el.x1, el.y1, 6, true);
                                                                                                                                                                                                                                                                                                            drawRegistrationMarks(ctx, el.x2, el.y2, 6, true);
                                                                                                                                                                                                                                                                                                                ctx.restore();
                                                                                                                                                                                                                                                                      }

                                                                                                                                                                                                                                                                        drawRedaction(ctx, el) {
                                                                                                                                                                                                                                                                                ctx.save();
                                                                                                                                                                                                                                                                                    if (el.angle) {
                                                                                                                                                                                                                                                                                              const cx = el.x + el.w / 2;
                                                                                                                                                                                                                                                                                                    const cy = el.y + el.h / 2;
                                                                                                                                                                                                                                                                                                          ctx.translate(cx, cy);
                                                                                                                                                                                                                                                                                                                ctx.rotate(el.angle);
                                                                                                                                                                                                                                                                                                                      ctx.translate(-cx, -cy);
                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                        ctx.fillStyle = PALETTE.black;
                                                                                                                                                                                                                                                                                            ctx.fillRect(el.x, el.y, el.w, el.h);
                                                                                                                                                                                                                                                                                                ctx.restore();
                                                                                                                                                                                                                                                                                }

                                                                                                                                                                                                                                                                                  drawTape(ctx, el) {
                                                                                                                                                                                                                                                                                        ctx.save();
                                                                                                                                                                                                                                                                                            ctx.translate(el.x + el.w / 2, el.y + el.h / 2);
                                                                                                                                                                                                                                                                                                if (el.angle) ctx.rotate(el.angle);

                                                                                                                                                                                                                                                                                                    // Aged yellowed cello tape with slight translucency
                                                                                                                                                                                                                                                                                                        ctx.fillStyle = 'rgba(218, 207, 178, 0.42)';
                                                                                                                                                                                                                                                                                                            ctx.fillRect(-el.w / 2, -el.h / 2, el.w, el.h);
                                                                                                                                                                                                                                                                                                                ctx.strokeStyle = 'rgba(8, 8, 8, 0.12)';
                                                                                                                                                                                                                                                                                                                    ctx.lineWidth = 0.5;
                                                                                                                                                                                                                                                                                                                        ctx.strokeRect(-el.w / 2, -el.h / 2, el.w, el.h);

                                                                                                                                                                                                                                                                                                                            // Subtle edge highlight
                                                                                                                                                                                                                                                                                                                                ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                                                                                                                                                                                                                                                                                                                                    ctx.fillRect(-el.w / 2, -el.h / 2, el.w, 1.5);

                                                                                                                                                                                                                                                                                                                                        ctx.restore();
                                                                                                                                                                                                                                                                                  }

                                                                                                                                                                                                                                                                                    renderOverlays(ctx) {
                                                                                                                                                                                                                                                                                            // Film grain blend
                                                                                                                                                                                                                                                                                                ctx.save();
                                                                                                                                                                                                                                                                                                    ctx.globalCompositeOperation = 'multiply';
                                                                                                                                                                                                                                                                                                        ctx.fillStyle = ctx.createPattern(this.noiseCanvas, 'repeat');
                                                                                                                                                                                                                                                                                                            ctx.fillRect(0, 0, this.width, this.height);
                                                                                                                                                                                                                                                                                                                ctx.restore();

                                                                                                                                                                                                                                                                                                                    // Dark gallery vignette
                                                                                                                                                                                                                                                                                                                        ctx.save();
                                                                                                                                                                                                                                                                                                                            const cx = this.width / 2;
                                                                                                                                                                                                                                                                                                                                const cy = this.height / 2;
                                                                                                                                                                                                                                                                                                                                    const maxR = Math.sqrt(cx * cx + cy * cy);
                                                                                                                                                                                                                                                                                                                                        const grad = ctx.createRadialGradient(cx, cy, maxR * 0.45, cx, cy, maxR);
                                                                                                                                                                                                                                                                                                                                            grad.addColorStop(0, 'rgba(8, 8, 8, 0)');
                                                                                                                                                                                                                                                                                                                                                grad.addColorStop(0.8, 'rgba(8, 8, 8, 0.08)');
                                                                                                                                                                                                                                                                                                                                                    grad.addColorStop(1, 'rgba(8, 8, 8, 0.25)');

                                                                                                                                                                                                                                                                                                                                                        ctx.fillStyle = grad;
                                                                                                                                                                                                                                                                                                                                                            ctx.fillRect(0, 0, this.width, this.height);
                                                                                                                                                                                                                                                                                                                                                                ctx.restore();
                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                }

                                                                                                                                                              }
                            }
      }
}