import { soundEngine } from "./soundEngine";

class TheaterAudio {
  private lastWavePing = 0;

  private tone(
    freq: number,
    dur: number,
    type: OscillatorType,
    peak: number,
    delay = 0,
    freqEnd?: number
  ): void {
    const out = soundEngine.getActiveOutput();
    if (!out) return;
    const { ctx, master } = out;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (freqEnd !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), t0 + dur);
    }
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  public playWaveBalanceTone(offsetRight: number): void {
    const now = performance.now();
    if (now - this.lastWavePing < 110) return;
    this.lastWavePing = now;

    if (offsetRight <= 0.04) {
      // Calm fifth hum at exact balance
      this.tone(220, 0.25, "sine", 0.12, 0);
      this.tone(330, 0.25, "triangle", 0.07, 0.01);
    } else {
      // Rising feedback howl + beating dissonance
      const base = 220 + offsetRight * 210;
      this.tone(base, 0.22, "sawtooth", 0.08 + offsetRight * 0.08, 0);
      this.tone(base * (1 + offsetRight * 0.14), 0.22, "sawtooth", 0.06 + offsetRight * 0.07, 0);
    }
  }

  public playMirrorEcho(): void {
    // Left pulse -> 90ms delayed symmetric higher mirror echo
    this.tone(293.66, 0.28, "triangle", 0.14, 0);
    this.tone(440.0, 0.34, "sine", 0.13, 0.09);
    this.tone(587.33, 0.42, "sine", 0.09, 0.16);
  }

  public playDetectorFlip(shattered: boolean): void {
    if (!shattered) {
      // Quiet neutralized wave
      this.tone(246.94, 0.24, "sine", 0.08, 0);
      return;
    }
    // Harmonic rise -> ceiling shatter impact
    this.tone(261.63, 0.14, "triangle", 0.1, 0, 523.25);
    this.tone(130.81, 0.36, "sawtooth", 0.16, 0.12, 65);
    this.tone(185.0, 0.34, "square", 0.1, 0.13, 92);
  }

  public playClayPress(depth: number): void {
    const f = Math.max(95, 190 - depth * 18);
    this.tone(f, 0.18, "sine", 0.15, 0, f * 0.72);
  }

  public playStoneCrack(): void {
    const out = soundEngine.getActiveOutput();
    if (!out) return;
    const { ctx, master } = out;
    // Short filtered noise burst for brittle stone crack
    const bufferSize = Math.floor(ctx.sampleRate * 0.14);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1600;
    filter.Q.value = 1.4;
    const gain = ctx.createGain();
    gain.gain.value = 0.28;
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    noise.start();
    this.tone(110, 0.14, "sawtooth", 0.1, 0, 55);
  }

  public playSphereBeadPing(hits: number): void {
    if (hits <= 0) return;
    this.tone(523.25, 0.18, "sine", 0.1, 0);
    if (hits >= 2) {
      this.tone(783.99, 0.22, "sine", 0.1, 0.06);
    }
  }

  public playTrapLock(zoomStage: number): void {
    const scale = [392.0, 440.0, 493.88, 523.25, 587.33, 659.25];
    const root = scale[Math.min(scale.length - 1, zoomStage)];
    this.tone(196.0, 0.16, "triangle", 0.1, 0, root);
    this.tone(root, 0.34, "sine", 0.14, 0.12);
    this.tone(root * 1.5, 0.42, "sine", 0.1, 0.18);
  }
}

export const theaterAudio = new TheaterAudio();
