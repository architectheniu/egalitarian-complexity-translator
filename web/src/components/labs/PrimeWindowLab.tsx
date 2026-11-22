import React, { useMemo, useState } from "react";
import { Activity, AlertOctagon, CheckCircle2, Volume2 } from "lucide-react";
import { Language } from "../../types/ect";
import { computePrimeWindowSeries } from "../../math/zeta";
import { soundEngine } from "../../audio/soundEngine";

interface PrimeWindowLabProps {
  lang: Language;
  audioEnabled: boolean;
  onEnableAudio: () => void;
}

export const PrimeWindowLab: React.FC<PrimeWindowLabProps> = ({ lang, audioEnabled, onEnableAudio }) => {
  const [yStart, setYStart] = useState<number>(120);
  const [rogueBeta, setRogueBeta] = useState<number>(0.5);

  const thetaCap = rogueBeta > 0.505 ? (0.5 + rogueBeta) / 2 : 0.62;
  const { points, yEnd, maxBreachRatio } = useMemo(
    () => computePrimeWindowSeries(yStart, rogueBeta, thetaCap, 130),
    [yStart, rogueBeta, thetaCap]
  );

  const breached = maxBreachRatio > 1.0;

  const width = 640;
  const height = 220;
  const padL = 48;
  const padR = 16;
  const padT = 18;
  const padB = 28;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const maxAbsVal = useMemo(() => {
    let m = 25;
    for (const p of points) {
      m = Math.max(m, Math.abs(p.withRogueError), p.ceiling);
    }
    return m * 1.08;
  }, [points]);

  const xOf = (y: number) => padL + ((y - yStart) / Math.max(1, yEnd - yStart)) * plotW;
  const yOf = (val: number) => padT + plotH / 2 - (val / maxAbsVal) * (plotH / 2);

  const topCeilD = points.map((p, i) => `${i === 0 ? "M" : "L"}${xOf(p.y).toFixed(1)},${yOf(p.ceiling).toFixed(1)}`).join(" ");
  const botCeilD = points.map((p, i) => `${i === 0 ? "M" : "L"}${xOf(p.y).toFixed(1)},${yOf(-p.ceiling).toFixed(1)}`).join(" ");
  const realD = points.map((p, i) => `${i === 0 ? "M" : "L"}${xOf(p.y).toFixed(1)},${yOf(p.realError).toFixed(1)}`).join(" ");
  const rogueD = points.map((p, i) => `${i === 0 ? "M" : "L"}${xOf(p.y).toFixed(1)},${yOf(p.withRogueError).toFixed(1)}`).join(" ");

  const testAudioFeedback = (nextBeta: number) => {
    setRogueBeta(nextBeta);
    if (audioEnabled) {
      soundEngine.playCeilingEvent(nextBeta > 0.56);
    }
  };

  return (
    <div className="rounded-xl border border-ana/30 bg-panel p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-ana" />
            <h3 className="font-serif text-lg font-medium text-white">
              {lang === "pl" ? "Okno Liczb Pierwszych [Y, Y^(3/2)] i Oscylacja Landaua" : "Prime Window [Y, Y^(3/2)] & Landau Oscillation"}
            </h3>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {lang === "pl"
              ? "Prawdziwe fluktuacje ψ(y)−y z sita Eratostenesa kontra sufit potęgowy C·y^θ. Przesuń hipotetyczne zero poza prostą (β > 0,5), aby zobaczyć sprzeczność."
              : "Real Sieve fluctuations ψ(y)−y vs power ceiling C·y^θ. Drag a hypothetical off-line zero (β > 0.5) to see it shatter the ceiling."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!audioEnabled) onEnableAudio();
            soundEngine.playCeilingEvent(breached);
          }}
          className="flex items-center gap-1.5 rounded-lg border border-hairline bg-obsidian/80 px-3 py-1.5 text-xs text-slate-200 hover:border-ana"
        >
          <Volume2 className="h-3.5 w-3.5 text-ana" />
          <span>{lang === "pl" ? "Test dźwięku" : "Audio Pulse"}</span>
        </button>
      </div>

      {/* Controls */}
      <div className="mt-4 grid grid-cols-1 gap-3 rounded-lg border border-hairline bg-obsidian/70 p-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-300">{lang === "pl" ? "Hipotetyczne zero β = Re(ρ)" : "Hypothetical rogue zero β"}</span>
            <span className="font-mono font-semibold text-amber-300">{rogueBeta.toFixed(3)}</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={0.82}
            step={0.01}
            value={rogueBeta}
            onChange={(e) => testAudioFeedback(Number(e.target.value))}
            className="h-2 cursor-pointer accent-amber-400"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-300">{lang === "pl" ? "Początek okna Y → Y^(3/2)" : "Window start Y → Y^(3/2)"}</span>
            <span className="font-mono font-semibold text-teal-300">
              [{yStart}, {yEnd}]
            </span>
          </div>
          <input
            type="range"
            min={40}
            max={400}
            step={10}
            value={yStart}
            onChange={(e) => setYStart(Number(e.target.value))}
            className="h-2 cursor-pointer accent-teal-400"
          />
        </label>
      </div>

      {/* Plot */}
      <div className="mt-3 overflow-hidden rounded-lg border border-hairline bg-[#080d10] p-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
          <line x1={padL} x2={width - padR} y1={yOf(0)} y2={yOf(0)} stroke="#24343e" strokeWidth={1} />
          <path d={topCeilD} fill="none" stroke="#eab308" strokeDasharray="5 4" strokeWidth={1.6} />
          <path d={botCeilD} fill="none" stroke="#eab308" strokeDasharray="5 4" strokeWidth={1.6} />
          <path d={realD} fill="none" stroke="#2dd4bf" strokeWidth={1.8} opacity={0.85} />
          {rogueBeta > 0.505 && <path d={rogueD} fill="none" stroke="#f97316" strokeWidth={2.1} />}
          <text x={padL + 6} y={padT + 12} className="fill-amber-300 font-mono text-[10px]">
            ±C·y^θ (θ = {thetaCap.toFixed(3)})
          </text>
          <text x={width - padR - 4} y={height - 8} textAnchor="end" className="fill-slate-500 font-mono text-[10px]">
            y ∈ [{yStart}, {yEnd}]
          </text>
        </svg>
      </div>

      {/* Verdict banner */}
      <div
        className={`mt-3 flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs ${
          breached
            ? "border-orange-500/50 bg-orange-950/35 text-orange-200"
            : "border-emerald-500/40 bg-emerald-950/25 text-emerald-200"
        }`}
      >
        <div className="flex items-center gap-2">
          {breached ? <AlertOctagon className="h-4 w-4 text-orange-400" /> : <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
          <span>
            {breached
              ? lang === "pl"
                ? `SPRZECZNOŚĆ: Fala zera β = ${rogueBeta.toFixed(2)} przebija sufit C·y^θ — takie zero nie może istnieć!`
                : `CONTRADICTION: Rogue zero β = ${rogueBeta.toFixed(2)} shatters C·y^θ ceiling — zero forbidden!`
              : lang === "pl"
                ? "Sygnał liczb pierwszych mieści się spokojnie w korytarzu C·y^θ."
                : "Prime fluctuation stays calmly inside the C·y^θ power corridor."}
          </span>
        </div>
        <span className="font-mono font-semibold">{(maxBreachRatio * 100).toFixed(0)}% cap</span>
      </div>
    </div>
  );
};
