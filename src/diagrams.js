
// Refinement: optimize diagrams execution and edge case handling
// const PALETTE = {
      black: '#080808',
        paper: '#E8E3D7',
          cobalt: '#1749E8',
            darkGrey: '#323230',
              midGrey: '#6a6864',
                lightGrey: '#a8a59e'
};

export function drawWaveformDiagram(ctx, x, y, width, height, rng) {
      ctx.save();
        ctx.translate(x, y);

          ctx.fillStyle = PALETTE.paper;
            ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = PALETTE.black;
    ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, width, height);
      
        // Background coordinate grid
          const rows = 5;
            const cols = Math.floor(width / 40);
              ctx.strokeStyle = 'rgba(8, 8, 8, 0.15)';
                ctx.lineWidth = 0.5;

                  for (let r = 1; r < rows; r++) {
                        const gy = (height / rows) * r;
                            ctx.beginPath();
                                ctx.moveTo(0, gy);
                                    ctx.lineTo(width, gy);
                                        ctx.stroke();
                  }
                    for (let c = 1; c < cols; c++) {
                            const gx = (width / cols) * c;
                                ctx.beginPath();
                                    ctx.moveTo(gx, 0);
                                        ctx.lineTo(gx, height);
                                            ctx.stroke();
                    }

                      const baseline = height * rng.range(0.45, 0.55);
                        ctx.strokeStyle = PALETTE.black;
                          ctx.lineWidth = 1;
                            ctx.beginPath();
                              ctx.moveTo(10, baseline);
                                ctx.lineTo(width - 10, baseline);
                                  ctx.stroke();

                                    // Axis ticks
                                      ctx.beginPath();
                                        ctx.moveTo(25, 10);
                                          ctx.lineTo(25, height - 10);
                                            ctx.stroke();

                                              for (let ty = 15; ty < height - 10; ty += 15) {
                                                    ctx.beginPath();
                                                        ctx.moveTo(21, ty);
                                                            ctx.lineTo(25, ty);
                                                                ctx.stroke();
                                              }

                                                // Seismograph harmonic trace
                                                  ctx.lineWidth = 1.4;
                                                    ctx.beginPath();

                                                      const points = Math.floor(width - 35);
                                                        const f1 = rng.range(0.04, 0.08);
                                                          const f2 = rng.range(0.12, 0.25);
                                                            const pulseX = rng.range(width * 0.2, width * 0.7);
                                                              const pulseW = rng.range(30, 70);

                                                                ctx.moveTo(25, baseline);
                                                                  for (let i = 0; i < points; i++) {
                                                                        const px = 25 + i;
                                                                            let amp = Math.sin(i * f1) * 8 + Math.cos(i * f2) * 5 + (rng.next() - 0.5) * 6;
                                                                                const dist = Math.abs(px - pulseX);
                                                                                    if (dist < pulseW) {
                                                                                              const envelope = Math.cos((dist / pulseW) * (Math.PI / 2));
                                                                                                    amp += Math.sin(dist * 0.5) * (height * 0.38) * envelope;
                                                                                    }
                                                                                        const py = Math.max(10, Math.min(height - 10, baseline - amp));
                                                                                            ctx.lineTo(px, py);
                                                                                }
                                                                                  ctx.stroke();

                                                                                    if (rng.chance(0.8)) {
                                                                                            const markerX = pulseX - pulseW * 0.4;
                                                                                                ctx.lineWidth = 0.8;
                                                                                                    ctx.setLineDash([2, 2]);
                                                                                                        ctx.beginPath();
                                                                                                            ctx.moveTo(markerX, 8);
                                                                                                                ctx.lineTo(markerX, height - 8);
                                                                                                                    ctx.stroke();
                                                                                                                        ctx.setLineDash([]);

                                                                                                                            ctx.fillStyle = PALETTE.black;
                                                                                                                                ctx.font = '9px "Courier New", monospace';
                                                                                                                                    ctx.fillText('0', markerX - 3, 16);
                                                                                                                                        ctx.fillText('1', pulseX + pulseW * 0.5, 16);
                                                                                    }

                                                                                      ctx.fillStyle = PALETTE.black;
                                                                                        ctx.font = '8px "Courier New", monospace';
                                                                                          ctx.fillText('+15', width - 24, baseline - 20);
                                                                                            ctx.fillText('0', width - 16, baseline + 3);
                                                                                              ctx.fillText('-15', width - 24, baseline + 25);

                                                                                                ctx.restore();
                                                                                }

                                                                                export function drawCelestialDiagram(ctx, x, y, size, rng) {
                                                                                      ctx.save();
                                                                                        ctx.translate(x, y);

                                                                                          const r = size * 0.45;
                                                                                            const cx = size * 0.5;
                                                                                              const cy = size * 0.5;

                                                                                                ctx.fillStyle = PALETTE.paper;
                                                                                                  ctx.fillRect(0, 0, size, size);

                                                                                                    ctx.strokeStyle = PALETTE.black;
                                                                                                      ctx.lineWidth = 1.2;
                                                                                                        ctx.beginPath();
                                                                                                          ctx.arc(cx, cy, r, 0, Math.PI * 2);
                                                                                                            ctx.stroke();

                                                                                                              ctx.lineWidth = 0.6;
                                                                                                                ctx.beginPath();
                                                                                                                  ctx.arc(cx, cy, r * 0.82, 0, Math.PI * 2);
                                                                                                                    ctx.arc(cx, cy, r * 0.25, 0, Math.PI * 2);
                                                                                                                      ctx.stroke();

                                                                                                                        // Degree marks around circumference
                                                                                                                          const tickCount = 48;
                                                                                                                            for (let i = 0; i < tickCount; i++) {
                                                                                                                                    const angle = (i / tickCount) * Math.PI * 2;
                                                                                                                                        const len = (i % 4 === 0) ? 6 : 3;
                                                                                                                                            ctx.beginPath();
                                                                                                                                                ctx.moveTo(cx + Math.cos(angle) * (r - len), cy + Math.sin(angle) * (r - len));
                                                                                                                                                    ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
                                                                                                                                                        ctx.stroke();
                                                                                                                            }

                                                                                                                              // Cross axes
                                                                                                                                ctx.lineWidth = 0.8;
                                                                                                                                  ctx.beginPath();
                                                                                                                                    ctx.moveTo(cx - r - 8, cy);
                                                                                                                                      ctx.lineTo(cx + r + 8, cy);
                                                                                                                                        ctx.moveTo(cx, cy - r - 8);
                                                                                                                                          ctx.lineTo(cx, cy + r + 8);
                                                                                                                                            ctx.stroke();

                                                                                                                                              // Orbital ellipses
                                                                                                                                                ctx.beginPath();
                                                                                                                                                  ctx.ellipse(cx, cy, r * 0.82, r * 0.38, rng.range(-0.4, 0.4), 0, Math.PI * 2);
                                                                                                                                                    if (rng.chance(0.7)) {
                                                                                                                                                            ctx.ellipse(cx, cy, r * 0.7, r * 0.55, rng.range(0.2, 0.8), 0, Math.PI * 2);
                                                                                                                                                    }
                                                                                                                                                      ctx.stroke();

                                                                                                                                                        const ray = rng.range(0.3, 1.2);
                                                                                                                                                          ctx.lineWidth = 1;
                                                                                                                                                            ctx.beginPath();
                                                                                                                                                              ctx.moveTo(cx, cy);
                                                                                                                                                                ctx.lineTo(cx + Math.cos(ray) * r, cy - Math.sin(ray) * r);
                                                                                                                                                                  ctx.stroke();

                                                                                                                                                                    ctx.fillStyle = PALETTE.black;
                                                                                                                                                                      ctx.font = '8px "Courier New", monospace';
                                                                                                                                                                        ctx.fillText('45°', cx + r * 0.4, cy - r * 0.3);
                                                                                                                                                                          ctx.fillText('N', cx - 3, cy - r - 10);
                                                                                                                                                                            ctx.fillText('S', cx - 3, cy + r + 15);

                                                                                                                                                                              ctx.font = 'italic 9px "Times New Roman", serif';
                                                                                                                                                                                ctx.fillText('α', cx - r * 0.5, cy - 4);
                                                                                                                                                                                  ctx.fillText('β', cx + r * 0.3, cy + r * 0.4);

                                                                                                                                                                                    ctx.strokeStyle = PALETTE.black;
                                                                                                                                                                                      ctx.lineWidth = 0.8;
                                                                                                                                                                                        ctx.strokeRect(4, 4, size - 8, size - 8);

                                                                                                                                                                                          ctx.restore();
                                                                                                                                                }

                                                                                                                                                export function drawMoonPhasesStrip(ctx, x, y, width, height, rng) {
                                                                                                                                                      ctx.save();
                                                                                                                                                        ctx.translate(x, y);

                                                                                                                                                          ctx.fillStyle = PALETTE.paper;
                                                                                                                                                            ctx.fillRect(0, 0, width, height);
                                                                                                                                                              ctx.strokeStyle = PALETTE.black;
                                                                                                                                                                ctx.lineWidth = 0.8;
                                                                                                                                                                  ctx.strokeRect(0, 0, width, height);

                                                                                                                                                                    const count = 4;
                                                                                                                                                                      const r = Math.min(width * 0.35, (height / count) * 0.35);
                                                                                                                                                                        const stepY = height / count;

                                                                                                                                                                          for (let i = 0; i < count; i++) {
                                                                                                                                                                                const cy = stepY * (i + 0.5);
                                                                                                                                                                                    const cx = width * 0.5;

                                                                                                                                                                                        ctx.fillStyle = PALETTE.black;
                                                                                                                                                                                            ctx.beginPath();
                                                                                                                                                                                                ctx.arc(cx, cy, r, 0, Math.PI * 2);
                                                                                                                                                                                                    ctx.fill();

                                                                                                                                                                                                        ctx.fillStyle = PALETTE.paper;
                                                                                                                                                                                                            ctx.beginPath();
                                                                                                                                                                                                                const phase = (i + 1) / (count + 1);
                                                                                                                                                                                                                    ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2, false);
                                                                                                                                                                                                                        ctx.ellipse(cx, cy, Math.abs(r * (phase * 2 - 1)), r, 0, Math.PI / 2, -Math.PI / 2, phase < 0.5);
                                                                                                                                                                                                                            ctx.fill();

                                                                                                                                                                                                                                ctx.strokeStyle = PALETTE.darkGrey;
                                                                                                                                                                                                                                    ctx.lineWidth = 0.6;
                                                                                                                                                                                                                                        ctx.beginPath();
                                                                                                                                                                                                                                            ctx.arc(cx, cy, r, 0, Math.PI * 2);
                                                                                                                                                                                                                                                ctx.stroke();
                                                                                                                                                                          }

                                                                                                                                                                            ctx.restore();
                                                                                                                                                                        }

                                                                                                                                                                        export function drawTypographyColumn(ctx, x, y, width, height, rng) {
                                                                                                                                                                              ctx.save();
                                                                                                                                                                                ctx.translate(x, y);

                                                                                                                                                                                  ctx.fillStyle = PALETTE.paper;
                                                                                                                                                                                    ctx.fillRect(0, 0, width, height);
                                                                                                                                                                                      ctx.strokeStyle = 'rgba(8, 8, 8, 0.4)';
                                                                                                                                                                                        ctx.lineWidth = 0.6;
                                                                                                                                                                                          ctx.strokeRect(0, 0, width, height);

                                                                                                                                                                                            const headlines = [
                                                                                                                                                                                                    'BEOBACHTUNG',
                                                                                                                                                                                                        'BERICHT IV',
                                                                                                                                                                                                            'FRAGMENT 1912',
                                                                                                                                                                                                                'DER ARCHIVKODEX',
                                                                                                                                                                                                                    'CHRONICA',
                                                                                                                                                                                                                        'SYSTEM DER WELT',
                                                                                                                                                                                                                            'DE RERUM NATURA'
                                                                                                                                                                                            ];
                                                                                                                                                                                              ctx.fillStyle = PALETTE.black;
                                                                                                                                                                                                ctx.font = 'bold 11px "Times New Roman", serif';
                                                                                                                                                                                                  ctx.fillText(rng.choice(headlines), 8, 18);

                                                                                                                                                                                                    ctx.strokeStyle = PALETTE.black;
                                                                                                                                                                                                      ctx.lineWidth = 0.8;
                                                                                                                                                                                                        ctx.beginPath();
                                                                                                                                                                                                          ctx.moveTo(8, 22);
                                                                                                                                                                                                            ctx.lineTo(width - 8, 22);
                                                                                                                                                                                                              ctx.stroke();

                                                                                                                                                                                                                // Simulated letterpress typeset slugs
                                                                                                                                                                                                                  let curY = 32;
                                                                                                                                                                                                                    const colW = width - 16;
                                                                                                                                                                                                                      while (curY < height - 10) {
                                                                                                                                                                                                                            const segments = rng.rangeInt(3, 7);
                                                                                                                                                                                                                                let curX = 8;
                                                                                                                                                                                                                                    const avgSegW = colW / segments;

                                                                                                                                                                                                                                        for (let s = 0; s < segments; s++) {
                                                                                                                                                                                                                                                  const segW = Math.max(8, avgSegW + rng.range(-6, 6));
                                                                                                                                                                                                                                                        if (curX + segW > width - 8) break;
                                                                                                                                                                                                                                                              ctx.fillStyle = rng.chance(0.15) ? PALETTE.midGrey : PALETTE.black;
                                                                                                                                                                                                                                                                    ctx.fillRect(curX, curY, segW - 2, 4.5);
                                                                                                                                                                                                                                                                          curX += segW;
                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                            curY += 10;
                                                                                                                                                                                                                                    }

                                                                                                                                                                                                                                      ctx.restore();
                                                                                                                                                                                                                                }

                                                                                                                                                                                                                                export function drawLedgerFragment(ctx, x, y, width, height, rng) {
                                                                                                                                                                                                                                      ctx.save();
                                                                                                                                                                                                                                        ctx.translate(x, y);

                                                                                                                                                                                                                                          ctx.fillStyle = PALETTE.paper;
                                                                                                                                                                                                                                            ctx.fillRect(0, 0, width, height);
                                                                                                                                                                                                                                              ctx.strokeStyle = PALETTE.black;
                                                                                                                                                                                                                                                ctx.lineWidth = 1;
                                                                                                                                                                                                                                                  ctx.strokeRect(0, 0, width, height);

                                                                                                                                                                                                                                                    const rows = Math.floor(height / 14);
                                                                                                                                                                                                                                                      ctx.strokeStyle = 'rgba(8, 8, 8, 0.25)';
                                                                                                                                                                                                                                                        ctx.lineWidth = 0.5;

                                                                                                                                                                                                                                                          for (let r = 1; r < rows; r++) {
                                                                                                                                                                                                                                                                const ry = r * 14;
                                                                                                                                                                                                                                                                    ctx.beginPath();
                                                                                                                                                                                                                                                                        ctx.moveTo(0, ry);
                                                                                                                                                                                                                                                                            ctx.lineTo(width, ry);
                                                                                                                                                                                                                                                                                ctx.stroke();
                                                                                                                                                                                                                                                          }

                                                                                                                                                                                                                                                            const col1 = width * 0.35;
                                                                                                                                                                                                                                                              const col2 = width * 0.7;
                                                                                                                                                                                                                                                                ctx.strokeStyle = PALETTE.black;
                                                                                                                                                                                                                                                                  ctx.lineWidth = 0.8;
                                                                                                                                                                                                                                                                    ctx.beginPath();
                                                                                                                                                                                                                                                                      ctx.moveTo(col1, 0);
                                                                                                                                                                                                                                                                        ctx.lineTo(col1, height);
                                                                                                                                                                                                                                                                          ctx.moveTo(col2, 0);
                                                                                                                                                                                                                                                                            ctx.lineTo(col2, height);
                                                                                                                                                                                                                                                                              ctx.stroke();

                                                                                                                                                                                                                                                                                for (let r = 0; r < rows; r++) {
                                                                                                                                                                                                                                                                                        const ry = r * 14 + 7;
                                                                                                                                                                                                                                                                                            ctx.fillStyle = PALETTE.black;
                                                                                                                                                                                                                                                                                                ctx.font = '7px "Courier New", monospace';
                                                                                                                                                                                                                                                                                                    ctx.fillText((r * 13 + 104).toString().padStart(4, '0'), 4, ry + 2);

                                                                                                                                                                                                                                                                                                        const dots = rng.rangeInt(1, 4);
                                                                                                                                                                                                                                                                                                            for (let d = 0; d < dots; d++) {
                                                                                                                                                                                                                                                                                                                      ctx.beginPath();
                                                                                                                                                                                                                                                                                                                            ctx.arc(col1 + 8 + d * 10, ry, 2.5, 0, Math.PI * 2);
                                                                                                                                                                                                                                                                                                                                  ctx.fill();
                                                                                                                                                                                                                                                                                                            }

                                                                                                                                                                                                                                                                                                                if (rng.chance(0.6)) {
                                                                                                                                                                                                                                                                                                                          ctx.fillRect(col2 + 5, ry - 3, rng.range(8, (width - col2) - 10), 6);
                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                            }

                                                                                                                                                                                                                                                                                                              ctx.restore();
                                                                                                                                                                                                                                                                                                        }

                                                                                                                                                                                                                                                                                                        export function drawArchivalStamp(ctx, text, x, y, angle = 0, isCobalt = false) {
                                                                                                                                                                                                                                                                                                              ctx.save();
                                                                                                                                                                                                                                                                                                                ctx.translate(x, y);
                                                                                                                                                                                                                                                                                                                  if (angle) ctx.rotate(angle);

                                                                                                                                                                                                                                                                                                                    ctx.font = 'bold 9px "Courier New", monospace';
                                                                                                                                                                                                                                                                                                                      const pad = 4;
                                                                                                                                                                                                                                                                                                                        const w = ctx.measureText(text).width + pad * 2;

                                                                                                                                                                                                                                                                                                                          ctx.strokeStyle = isCobalt ? PALETTE.cobalt : PALETTE.black;
                                                                                                                                                                                                                                                                                                                            ctx.lineWidth = 1;
                                                                                                                                                                                                                                                                                                                              ctx.strokeRect(-pad, -11, w, 14);

                                                                                                                                                                                                                                                                                                                                ctx.fillStyle = isCobalt ? PALETTE.cobalt : PALETTE.black;
                                                                                                                                                                                                                                                                                                                                  ctx.fillText(text, 0, 0);
                                                                                                                                                                                                                                                                                                                                    ctx.restore();
                                                                                                                                                                                                                                                                                                        }

                                                                                                                                                                                                                                                                                                        export function drawRegistrationMarks(ctx, x, y, size = 16, isCobalt = false) {
                                                                                                                                                                                                                                                                                                              ctx.save();
                                                                                                                                                                                                                                                                                                                ctx.translate(x, y);
                                                                                                                                                                                                                                                                                                                  ctx.strokeStyle = isCobalt ? PALETTE.cobalt : PALETTE.black;
                                                                                                                                                                                                                                                                                                                    ctx.lineWidth = 0.8;

                                                                                                                                                                                                                                                                                                                      ctx.beginPath();
                                                                                                                                                                                                                                                                                                                        ctx.moveTo(-size, 0);
                                                                                                                                                                                                                                                                                                                          ctx.lineTo(size, 0);
                                                                                                                                                                                                                                                                                                                            ctx.moveTo(0, -size);
                                                                                                                                                                                                                                                                                                                              ctx.lineTo(0, size);
                                                                                                                                                                                                                                                                                                                                ctx.stroke();

                                                                                                                                                                                                                                                                                                                                  ctx.beginPath();
                                                                                                                                                                                                                                                                                                                                    ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2);
                                                                                                                                                                                                                                                                                                                                      ctx.stroke();

                                                                                                                                                                                                                                                                                                                                        ctx.restore();
                                                                                                                                                                                                                                                                                                        }

                                                                                                                                                                                            ]
                                                                                    }
                  }
}