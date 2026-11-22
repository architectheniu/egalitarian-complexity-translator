import { Language, ZoomLevel } from "../types/ect";

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private enabled = false;
  private volume = 0.28;
  private lastChimeTime = 0;

  private ensureContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.volume;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  public setEnabled(next: boolean): void {
    this.enabled = next;
    if (next) {
      this.ensureContext();
      this.playWarmUnlockChord();
    } else {
      this.stopNarration();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setVolume(v: number): void {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.03);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getActiveOutput(): { ctx: AudioContext; master: GainNode } | null {
    if (!this.enabled) return null;
    const ctx = this.ensureContext();
    if (!ctx || !this.master) return null;
    return { ctx, master: this.master };
  }

  private playTone(
    freq: number,
    durationSec: number,
    type: OscillatorType = "sine",
    gainPeak = 0.2,
    delaySec = 0
  ): void {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.master) return;

    const start = ctx.currentTime + delaySec;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);

    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gainPeak), start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, start + durationSec);

    osc.connect(g);
    g.connect(this.master);
    osc.start(start);
    osc.stop(start + durationSec + 0.03);
  }

  private playWarmUnlockChord(): void {
    // Grounded fifths: C4 + G4 + D5
    this.playTone(261.63, 0.45, "sine", 0.14, 0);
    this.playTone(392.0, 0.45, "triangle", 0.1, 0.04);
    this.playTone(587.33, 0.55, "sine", 0.09, 0.08);
  }

  public playZoomHarmonic(level: ZoomLevel): void {
    if (!this.enabled) return;
    const roots: Record<ZoomLevel, number[]> = {
      L0: [220.0, 329.63], // A3 + E4 warm story open fifth
      L1: [246.94, 369.99], // B3 + F#4 architect focus
      L2: [261.63, 392.0], // C4 + G4 systems clarity
      L3: [293.66, 440.0], // D4 + A4 research sharpness
      L4: [329.63, 493.88, 659.25], // E4 + B4 + E5 crystalline kernel lock
    };
    const freqs = roots[level] ?? [261.63, 392.0];
    freqs.forEach((f, idx) => {
      this.playTone(f, 0.28, idx === 0 ? "triangle" : "sine", 0.11 / (idx + 1), idx * 0.025);
    });
  }

  public playStratumFocus(stratum: string): void {
    if (!this.enabled) return;
    const map: Record<string, number> = {
      arith: 196.0, // G3 terracotta deep arithmetic
      est: 261.63, // C4 amber estimate
      ana: 329.63, // E4 cyan analytic
      dest: 392.0, // G4 emerald critical line
    };
    const f = map[stratum] ?? 261.63;
    this.playTone(f, 0.25, "sine", 0.13, 0);
    this.playTone(f * 1.5, 0.22, "triangle", 0.07, 0.02);
  }

  public playZetaSweepFrame(zetaAbs: number, sigma: number, isZeroHit: boolean): void {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const offLine = Math.abs(sigma - 0.5);

    // Base continuous-feeling harmonic ping proportional to |zeta|
    const clampedAbs = Math.min(3.0, Math.max(0.02, zetaAbs));
    const baseFreq = 220 + clampedAbs * 95;
    this.playTone(baseFreq, 0.12, "sine", 0.08, 0);

    // Off-line dissonance beating: second detuned tone proportional to |sigma - 0.5|
    if (offLine > 0.015) {
      const detuneRatio = 1 + offLine * 0.42;
      this.playTone(baseFreq * detuneRatio, 0.14, "sawtooth", 0.045, 0);
    }

    // Pure crystalline chime when hitting a nontrivial zero on the critical line!
    if (isZeroHit && now - this.lastChimeTime > 0.28) {
      this.lastChimeTime = now;
      this.playTone(587.33, 0.55, "sine", 0.2, 0);
      this.playTone(880.0, 0.65, "sine", 0.14, 0.04);
      this.playTone(1174.66, 0.75, "triangle", 0.08, 0.08);
    }
  }

  public playCeilingEvent(breached: boolean): void {
    if (!this.enabled) return;
    if (breached) {
      this.playTone(146.83, 0.24, "sawtooth", 0.11, 0);
      this.playTone(155.56, 0.24, "sawtooth", 0.09, 0.02); // minor second warning clash
    } else {
      this.playTone(293.66, 0.22, "sine", 0.1, 0);
      this.playTone(440.0, 0.25, "sine", 0.08, 0.03);
    }
  }

  public speakStep(text: string, lang: Language): void {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang === "pl" ? "pl-PL" : "en-US";
    utter.rate = 1.02;
    utter.pitch = 1.0;
    window.speechSynthesis.speak(utter);
  }

  public stopNarration(): void {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const soundEngine = new SoundEngine();
