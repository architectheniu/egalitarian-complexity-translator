import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Sparkles, Volume2 } from "lucide-react";
import { Language } from "../../types/ect";
import { theaterAudio } from "../../audio/theaterAudio";

interface Scene1WavesProps {
  lang: Language;
  audioEnabled: boolean;
  onEnableAudio: () => void;
}

const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53];

export const Scene1Waves: React.FC<Scene1WavesProps> = ({ lang, audioEnabled, onEnableAudio }) => {
  const [offsetRight, setOffsetRight] = useState<number>(0);
  const [phase, setPhase] = useState<number>(0);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setPhase((p) => (p + dt * (1.8 + offsetRight * 3.5)) % (Math.PI * 20));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [offsetRight]);

  const width = 680;
  const height = 220;
  const midY = height / 2;

  const wavePath = useMemo(() => {
    const pts: string[] = [];
    const steps = 160;
    for (let i = 0; i <= steps; i++) {
      const frac = i / steps;
      const x = 16 + frac * (width - 32);
      // Balanced envelope stays calm (~28px), runaway wave grows exponentially to the right!
      const growth = Math.pow(1 + frac * 3.4, offsetRight * 2.1);
      const baseAmp = 26 * growth;
      const oscillation =
        Math.sin(frac * 18 - phase) * 0.65 +
        Math.sin(frac * 29 - phase * 1.37) * 0.35;
      const y = midY - Math.max(-96, Math.min(96, baseAmp * oscillation));
      pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.join(" ");
  }, [offsetRight, phase, midY]);

  const isMonster = offsetRight > 0.08;

  const handleSlider = (val: number) => {
    setOffsetRight(val);
    if (audioEnabled) {
      theaterAudio.playWaveBalanceTone(val);
    }
  };

  return (
    <div className="space-y-5">
      {/* Short crystal-clear headline */}
      <div className="max-w-3xl space-y-2">
        <h2 className="font-serif text-2xl font-medium text-white sm:text-3xl">
          {lang === "pl" ? "Scena 1: Ukryte fale liczb pierwszych" : "Scene 1: The Hidden Waves Behind Primes"}
        </h2>
        <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
          {lang === "pl"
            ? "Liczby pierwsze nie pojawiają się całkiem na ślepo — steruje nimi chór ukrytych fal. Hipoteza Riemanna pyta tylko o jedno: czy wśród nich czai się choć jedna Fala-Potwór, która rośnie bez końca, czy wszystkie stoją idealnie w równowadze?"
            : "Prime numbers do not appear at pure random — a hidden choir of waves shapes their rhythm. The Riemann Hypothesis asks one simple question: does even a single Runaway Wave hide off-center, or do they all stand in perfect balance?"}
        </p>
      </div>

      {/* Live Prime Heartbeat Strip */}
      <div className="rounded-xl border border-hairline bg-[#080e12] p-3">
        <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-400">
          <span>{lang === "pl" ? "Kolejne liczby pierwsze na osi" : "Primes marching along the line"}</span>
          <span className={isMonster ? "font-semibold text-red-300" : "font-semibold text-emerald-300"}>
            {isMonster
              ? lang === "pl"
                ? "WYKRYTO FALĘ-POTWORA (rozsadza rytm!)"
                : "RUNAWAY WAVE DETECTED (distorting rhythm!)"
              : lang === "pl"
                ? "RÓWNOWAGA: czysty, spokojny puls"
                : "BALANCE: calm steady heartbeat"}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {PRIMES.map((p, idx) => {
            const pulse = Math.sin(phase * 1.4 - idx * 0.7) > 0.25;
            return (
              <span
                key={p}
                className={`rounded-md border px-2 py-1 font-mono text-xs transition-all duration-150 ${
                  pulse
                    ? isMonster
                      ? "border-red-400/70 bg-red-500/20 text-red-200 scale-105"
                      : "border-emerald-400/70 bg-emerald-500/20 text-emerald-200 scale-105"
                    : "border-hairline bg-panel text-slate-400"
                }`}
              >
                {p}
              </span>
            );
          })}
        </div>

        {/* Waveform Stage */}
        <div className="mt-3 overflow-hidden rounded-lg border border-hairline/80 bg-[#05090c]">
          <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
            <line x1={16} x2={width - 16} y1={midY} y2={midY} stroke="#1f2e37" strokeWidth={1.2} />
            {/* Safe corridor */}
            <rect
              x={16}
              y={midY - 34}
              width={width - 32}
              height={68}
              fill={isMonster ? "rgba(239, 68, 68, 0.04)" : "rgba(52, 211, 153, 0.06)"}
              stroke={isMonster ? "#ef4444" : "#34d399"}
              strokeOpacity={0.25}
              strokeDasharray="4 4"
            />
            <path
              d={wavePath}
              fill="none"
              stroke={isMonster ? "#f87171" : "#34d399"}
              strokeWidth={isMonster ? 3 : 2.4}
            />
          </svg>
        </div>
      </div>

      {/* Single Tactile Gesture Control */}
      <div className="flex flex-col gap-3 rounded-xl border border-hairline bg-obsidian/80 p-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex flex-1 flex-col gap-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-200">
              {lang === "pl" ? "Przesuń ukrytą falę w prawo od środka:" : "Slide the hidden wave off balance to the right:"}
            </span>
            <span className={`font-mono font-bold ${isMonster ? "text-red-300" : "text-emerald-300"}`}>
              {offsetRight === 0
                ? lang === "pl"
                  ? "Środek (Równowaga)"
                  : "Center (Balanced)"
                : `+${Math.round(offsetRight * 100)}% ${lang === "pl" ? "w prawo" : "right"}`}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.02}
            value={offsetRight}
            onChange={(e) => handleSlider(Number(e.target.value))}
            className="h-2.5 w-full cursor-pointer accent-emerald-400"
          />
        </label>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => {
              if (!audioEnabled) onEnableAudio();
              const next = isMonster ? 0 : 0.78;
              setOffsetRight(next);
              theaterAudio.playWaveBalanceTone(next);
            }}
            className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-xs font-semibold transition ${
              isMonster
                ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25"
                : "border-red-400/60 bg-red-500/15 text-red-200 hover:bg-red-500/25"
            }`}
          >
            {isMonster ? <Sparkles className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            <span>
              {isMonster
                ? lang === "pl"
                  ? "Wróć na Środek (Cisza)"
                  : "Snap Back to Center"
                : lang === "pl"
                  ? "Wpuść Falę-Potwora!"
                  : "Unleash Runaway Wave!"}
            </span>
            <Volume2 className="h-3.5 w-3.5 opacity-75" />
          </button>
        </div>
      </div>
    </div>
  );
};
