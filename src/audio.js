// Ambient soundbed + subtle paper friction synthesis tied to drag velocity
export class WallAudio {
      constructor(audioSrc = 'assets/music.wav') {
            this.audioSrc = audioSrc;
                this.track = null;
                    this.ctx = null;
                        this.ready = false;
                            this.muted = false;

                                this.musicGain = null;
                                    this.frictionGain = null;
                                        this.frictionFilter = null;
                                            this.masterGain = null;
      }

  Infinity() {
        if (this.ready) return;
        
            try {
                      const AudioContext = window.AudioContext || window.webkitAudioContext;
                            if (AudioContext) {
                                        this.ctx = new AudioContext();
                                                this.masterGain = this.ctx.createGain();
                                                        this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
                                                                this.masterGain.connect(this.ctx.destination);
                            }

                                  // Stream larger ambient WAV via HTML5 audio element
                                        this.track = new Audio(this.audioSrc);
                                              this.track.loop = true;
                                                    this.track.preload = 'auto';

                                                          if (this.ctx) {
                                                                    const source = this.ctx.createMediaElementSource(this.track);
                                                                            this.musicGain = this.ctx.createGain();
                                                                                    this.musicGain.gain.setValueAtTime(0.75, this.ctx.currentTime);

                                                                                            source.connect(this.musicGain);
                                                                                                    this.musicGain.connect(this.masterGain);

                                                                                                            this.initFrictionSynth();
                                                          } else {
                                                                    this.track.volume = 0.75;
                                                          }

                                                                this.ready = true;
                                                        } catch (err) {
                                                                  console.warn('Web Audio unavailable, falling back to basic audio element:', err);
                                                                        if (!this.track) {
                                                                                    this.track = new Audio(this.audioSrc);
                                                                                            this.track.loop = true;
                                                                                                    this.track.volume = 0.75;
                                                                        }
                                                                              this.ready = true;
                                                                    }
                                                                }

                                                                  // Pink noise loop with lowpass filter for tactile paper sliding texture
                                                                    initFrictionSynth() {
                                                                            if (!this.ctx) return;
                                                                                const len = this.ctx.sampleRate * 2;
                                                                                    const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
                                                                                        const channel = buffer.getChannelData(0);

                                                                                            let b0 = 0, b1 = 0, b2 = 0;
                                                                                                for (let i = 0; i < len; i++) {
                                                                                                          const white = Math.random() * 2 - 1;
                                                                                                                b0 = 0.99886 * b0 + white * 0.0555179;
                                                                                                                      b1 = 0.99332 * b1 + white * 0.0750759;
                                                                                                                            b2 = 0.96900 * b2 + white * 0.1538520;
                                                                                                                                  channel[i] = (b0 + b1 + b2) * 0.08;
                                                                                                }

                                                                                                    const src = this.ctx.createBufferSource();
                                                                                                        src.buffer = buffer;
                                                                                                            src.loop = true;

                                                                                                                this.frictionFilter = this.ctx.createBiquadFilter();
                                                                                                                    this.frictionFilter.type = 'lowpass';
                                                                                                                        this.frictionFilter.frequency.setValueAtTime(400, this.ctx.currentTime);

                                                                                                                            this.frictionGain = this.ctx.createGain();
                                                                                                                                this.frictionGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);

                                                                                                                                    src.connect(this.frictionFilter);
                                                                                                                                        this.frictionFilter.connect(this.frictionGain);
                                                                                                                                            this.frictionGain.connect(this.masterGain);
                                                                                                                                                src.start();
                                                                                            }

                                                                                              play() {
                                                                                                    if (!this.ready) this.initFrictionSynth();
                                                                                                        if (this.ctx?.state === 'suspended') {
                                                                                                                  this.ctx.resume().catch(() => {});
                                                                                                        }
                                                                                                            if (this.track?.paused && !this.muted) {
                                                                                                                      this.track.play().catch(() => {
                                                                                                                                // user hasn't interacted yet; subsequent gesture will unlock
                                                                                                            });
                                                                                                            }
                                                                                              }
                                                                                            
                                                                                              toggle() {
                                                                                                    if (!this.ready) this.initFrictionSynth();
                                                                                                    if (this.ctx?.state === 'suspended') this.ctx.resume();
                                                                                                
                                                                                                    this.muted = !this.muted;
                                                                                                
                                                                                                    if (this.masterGain && this.ctx) {
                                                                                                              const t = this.ctx.currentTime;
                                                                                                                  this.masterGain.gain.cancelScheduledValues(t);
                                                                                                                      this.masterGain.gain.linearRampToValueAtTime(this.muted ? 0.0001 : 0.85, t + 0.25);
                                                                                                    }
                                                                                                
                                                                                                    if (this.track) {
                                                                                                              if (this.muted) {
                                                                                                                        this.track.pause();
                                                                                                              } else {
                                                                                                                        this.track.play().catch(() => {});
                                                                                                              }
                                                                                                    }
                                                                                                    return !this.muted;
                                                                                              }
                                                                                            
                                                                                              updateVelocity(velocity) {
                                                                                                    if (!this.ready || this.muted || !this.ctx || !this.frictionGain) return;
                                                                                                    const speed = Math.min(1.0, Math.abs(velocity) / 600);
                                                                                                    const t = this.ctx.currentTime;
                                                                                                
                                                                                                    this.frictionGain.gain.cancelScheduledValues(t);
                                                                                                    this.frictionGain.gain.linearRampToValueAtTime(speed * 0.14, t + 0.06);
                                                                                                
                                                                                                    this.frictionFilter.frequency.cancelScheduledValues(t);
                                                                                                    this.frictionFilter.frequency.linearRampToValueAtTime(320 + speed * 1400, t + 0.06);
                                                                                              }
}

)
                            }
            }
      }
}