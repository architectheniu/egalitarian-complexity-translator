import React, { useEffect, useMemo, useState } from "react";
import { ShieldAlert, Sliders, Volume2 } from "lucide-react";
import { Language } from "../../types/ect";
import { theaterAudio } from "../../audio/theaterAudio";

interface Scene3DetectorProps {
  lang: Language;
  audioEnabled: boolean;
  onEnableAudio: () => void;
}

export const Scene3Detector: React.FC<Scene3DetectorProps> = ({ lang, audioEnabled, onEnableAudio }) => {
  // Default phase = PI so two rogue waves cancel each other out cleanly in normal mode!
  const [phaseShift, setPhaseShift] = useState<number>(Math.PI);
  const [oneWayMode, setOneWayMode] = useState<boolean>(false);
  const [animTime, setAnimTime] = useState<number>(0);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setAnimTime((t) => (t + dt * 2.4) % (Math.PI * 20));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const width = 680;
  const height = 240;
  const baseline = 155;
  const ceilingY = 66;

  const { waveAPath, waveBPath, combinedPath, peakY } = useMemo(() => {
    const aPts: string[] = [];
    const bPts: string[] = [];
    const cPts: string[] = [];
    let minY = baseline;
    const steps = 150;
    for (let i = 0; i <= steps; i++) {
      const f = i / steps;
      const x = 16 + f * (width - 32);
      const env = 0.55 + f * 0.8;
      const valA = Math.sin(f * 14 - animTime) * 40 * env;
      const valB = Math.sin(f * 14 - animTime + phaseShift) * 40 * env;

      const combinedRaw = oneWayMode ? Math.abs(valA) + Math.abs(valB) : valA + valB;
      const yA = baseline - valA * 0.45;
      const yB = baseline - valB * 0.45;
      const yC = Math.max(14, baseline - combinedRaw);

      if (yC < minY) minY = yC;
      aPts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${yA.toFixed(1)}`);
      bPts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${yB.toFixed(1)}`);
      cPts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${yC.toFixed(1)}`);
    }
    return {
      waveAPath: aPts.join(" "),
      waveBPath: bPts.join(" "),
      combinedPath: cPts.join(" "),
      peakY: minY,
    };
  }, [animTime, phaseShift, oneWayMode]);

  const ceilingShattered = peakY < ceilingY;

  const toggleDetector = () => {
    if (!audioEnabled) onEnableAudio();
    const next = !oneWayMode;
    setOneWayMode(next);
    theaterAudio.playDetectorFlip(next);
  };

  return (
    <div className="space-y-5">
      <div className="max-w-3xl space-y-2">
        <h2 className="font-serif text-2xl font-medium text-white sm:text-3xl">
          {lang === "pl" ? "Scena 3: Pułapka, której nie da się zagłuszyć" : "Scene 3: A Trap You Cannot Cancel Out"}
        </h2>
        <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
          {lang === "pl"
            ? "W zwykłym pokoju dwie fale mogą grać przeciwko sobie i nawzajem się wyciszyć pod sufitem. Dowód stosuje detektor jednokierunkowy, który potrafi wyłącznie dodawać energię — więc ukryty potwór zawsze przebija złoty sufit!"
            : "In an ordinary room, two waves can cancel out and hide quietly beneath the ceiling. The proof uses a one-way detector that can only add energy upward — so any hidden monster blasts straight through the golden ceiling!"}
        </p>
      </div>

      {/* Stage */}
      <div className="overflow-hidden rounded-xl border border-hairline bg-[#060b0f] p-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
          {/* Ceiling */}
          <line
            x1={16}
            x2={width - 16}
            y1={ceilingY}
            y2={ceilingY}
            stroke={ceilingShattered ? "#ef4444" : "#eab308"}
            strokeWidth={2.5}
            strokeDasharray={ceilingShattered ? "8 5" : undefined}
          />
          <text x={24} y={ceilingY - 10} className={ceilingShattered ? "fill-red-300 text-xs font-bold" : "fill-amber-300 text-xs font-semibold"}>
            {ceilingShattered
              ? lang === "pl"
                ? "SUFIT PRZEBITY! Żadna fala nie może tu istnieć!"
                : "CEILING SHATTERED! No hidden wave can survive!"
              : lang === "pl"
                ? "ZŁOTY SUFIT (maksymalny dozwolony hałas)"
                : "GOLDEN CEILING (maximum allowed noise)"}
          </text>

          <line x1={16} x2={width - 16} y1={baseline} y2={baseline} stroke="#1f2e37" strokeWidth={1} />

          {/* Individual waves (ghosted) */}
          <path d={waveAPath} fill="none" stroke="#fb923c" strokeWidth={1.3} opacity={0.45} />
          <path d={waveBPath} fill="none" stroke="#f472b6" strokeWidth={1.3} opacity={0.45} />

          {/* Combined signal */}
          <path
            d={combinedPath}
            fill="none"
            stroke={ceilingShattered ? "#f87171" : "#34d399"}
            strokeWidth={3.2}
          />
        </svg>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-hairline bg-obsidian/80 p-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-semibold text-slate-200">
              <Sliders className="h-3.5 w-3.5 text-amber-400" />
              {lang === "pl" ? "Przesuń Falę B, żeby zagłuszyć Falę A:" : "Shift Wave B to cancel Wave A:"}
            </span>
            <span className="font-mono text-slate-400">
              {Math.abs(phaseShift - Math.PI) < 0.25
                ? lang === "pl"
                  ? "Przeciwfaza (cisza)"
                  : "Anti-phase (quiet)"
                : lang === "pl"
                  ? "Zgodna faza"
                  : "Aligned"}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={Math.PI * 2}
            step={0.05}
            value={phaseShift}
            onChange={(e) => setPhaseShift(Number(e.target.value))}
            className="h-2.5 cursor-pointer accent-amber-400"
          />
        </label>

        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={toggleDetector}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-xs font-semibold transition md:w-auto ${
              oneWayMode
                ? "border-red-400/70 bg-red-500/20 text-red-200 hover:bg-red-500/30"
                : "border-emerald-400/60 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25"
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            <span>
              {oneWayMode
                ? lang === "pl"
                  ? "Detektor jednokierunkowy WŁ. (wróć do zwykłego)"
                  : "One-Way Detector ON (reset to normal)"
                : lang === "pl"
                  ? "Włącz detektor jednokierunkowy (tylko dodawanie!)"
                  : "Switch On One-Way Detector (Add Only!)"}
            </span>
            <Volume2 className="h-3.5 w-3.5 opacity-80" />
          </button>
        </div>
      </div>
    </div>
  );
};
