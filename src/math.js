// Mulberry32 seeded PRNG - deterministic generator for chunk layouts
export class PRNG {
      constructor(seed = 0x6d2b79f5) {
            this.s = seed >>> 0;
      }

        next() {
                let t = (this.s += 0x6d2b79f5);
                    t = Math.imul(t ^ (t >>> 15), t | 1);
                        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
                            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        }

          range(min, max) {
                return min + this.next() * (max - min);
          }
          
            rangeInt(min, max) {
                    return Math.floor(min + this.next() * (max - min + 1));
            }

              choice(arr) {
                    if (!arr?.length) return null;
                        return arr[(this.next() * arr.length) | 0];
              }

                weightedChoice(items, weights) {
                        const total = weights.reduce((sum, w) => sum + w, 0);
                            let r = this.next() * total;
                                for (let i = 0; i < items.length; i++) {
                                          r -= weights[i];
                                                if (r <= 0) return items[i];
                                }
                                    return items[items.length - 1];
                            }

                              chance(p) {
                                    return this.next() < p;
                              }

                                // Slight organic variance for angles, positions, and hand-cut lines
                                  jitter(amount = 1) {
                                        return (this.next() * 2 - 1) * amount;
                                  }
                                }

                                // 32-bit integer hash for coordinate space (works smoothly with negative indices)
                                export function hashChunk(x) {
                                      let h = (x | 0) * 0x45d9f3b + 0x27d4eb2d;
                                        h = ((h >>> 16) ^ h) * 0x45d9f3b;
                                          h = ((h >>> 16) ^ h);
                                            return h >>> 0;
                                }

                                export function lerp(a, b, t) {
                                      return a + (b - a) * t;
                                }

                                export function clamp(v, min, max) {
                                      return Math.min(Math.max(v, min), max);
                                }

                                
                                }
      }
}