import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, Sparkles, Volume2 } from "lucide-react";
import { Language } from "../../types/ect";
import { KNOWN_ZETA_ZEROS, evalZetaMagnitude, sampleZetaCurve } from "../../math/zeta";
import { soundEngine } from "../../audio/soundEngine";

interface CriticalLineLabProps {
  lang: Language;
  audioEnabled: boolean;
  onEnableAudio: () => void;
}

export const CriticalLineLab: React.FC<CriticalLineLabProps> = ({ lang, audioEnabled, onEnableAudio }) => {
  const [sigma, setSigma] = useState<number>(0.5);
  const [playing, setPlaying] = useState<boolean>(false);
  const [playT, setPlayT] = useState<number>(10);
  const rafRef = useRef<number | null>(null);
  const lastStepRef = useRef<number>(0);

  const curve = useMemo(() => sampleZetaCurve(sigma, 10, 45, 280), [sigma]);
  const currentMag = useMemo(() => evalZetaMagnitude(sigma, playT), [sigma, playT]);

  const width = 640;
  const height = 220;
  const padL = 42;
  const padR = 16;
  const padT = 18;
  const padB = 30;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const maxY = 3.8;

  const xOf = (t: number) => padL + ((t - 10) / 35) * plotW;
  const yOf = (m: number) => padT + plotH - (Math.min(maxY, m) / maxY) * plotH;

  const pathD = useMemo(() => {
    return curve
      .map((pt, i) => `${i === 0 ? "M" : "L"}${xOf(pt.t).toFixed(1)},${yOf(pt.mag).toFixed(1)}`)
      .join(" ");
  }, [curve]);

  const isOnCritical = Math.abs(sigma - 0.5) < 0.008;

  useEffect(() => {
    if (!playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    let lastTs = performance.now();
    const tick = (now: number) => {
      const dtSec = (now - lastTs) / 1000;
      lastTs = now;
      setPlayT((prev) => {
        const next = prev + dtSec * 3.4;
        const wrapped = next > 45 ? 10 : next;
        if (now - lastStepRef.current > 90) {
          lastStepRef.current = now;
          const mag = evalZetaMagnitude(sigma, wrapped);
          const nearZero =
            Math.abs(sigma - 0.5) < 0.015 &&
            KNOWN_ZETA_ZEROS.some((z) => Math.abs(z - wrapped) < 0.35);
          soundEngine.playZetaSweepFrame(mag, sigma, nearZero);
        }
        return wrapped;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, sigma]);

  const togglePlay = () => {
    if (!playing && !audioEnabled) {
      onEnableAudio();
    }
    setPlaying((p) => !p);
  };

  return (
    <div className="rounded-xl border border-dest/30 bg-panel p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-dest" />
            <h3 className="font-serif text-lg font-medium text-white">
              {lang === "pl" ? "Symfonia Zety: Linia Krytyczna Re(s) = 0.5" : "Zeta Symphony: Critical Line Re(s) = 0.5"}
            </h3>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {lang === "pl"
              ? "Obliczenia na żywo |ζ(σ + it)| metodą Borweina. Tylko przy σ = 0,500 doliny funkcji dotykają zera i brzmią czystymi dzwonami."
              : "Live Borwein-accelerated computation of |ζ(σ + it)|. Only at σ = 0.500 do valleys touch zero with pure crystalline chimes."}
          </p>
        </div>
        <button
          type="button"
          onClick={togglePlay}
          className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
            playing
              ? "border-amber-400/60 bg-amber-500/15 text-amber-200"
              : "border-dest/60 bg-dest/15 text-emerald-200 hover:bg-dest/25"
          }`}
        >
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          <span>{playing ? (lang === "pl" ? "Zatrzymaj skan" : "Stop Sweep") : lang === "pl" ? "Odtwórz skan linii" : "Play Line Sweep"}</span>
          <Volume2 className="h-3.5 w-3.5 opacity-80" />
        </button>
      </div>

      {/* Sigma Slider & Presets */}
      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-hairline bg-obsidian/70 p-3">
        <label className="flex flex-1 items-center gap-3 text-xs">
          <span className="font-mono text-slate-300">σ = {sigma.toFixed(3)}</span>
          <input
            type="range"
            min={0.15}
            max={0.85}
            step={0.005}
            value={sigma}
            onChange={(e) => setSigma(Number(e.target.value))}
            className="h-2 flex-1 cursor-pointer accent-emerald-400"
          />
        </label>
        <div className="flex flex-wrap gap-1.5">
          {[
            { val: 0.35, label: "σ = 0.35" },
            { val: 0.5, label: lang === "pl" ? "σ = 0.50 (Lina)" : "σ = 0.50 (Line)" },
            { val: 0.72, label: "σ = 0.72" },
          ].map((preset) => (
            <button
              key={preset.val}
              type="button"
              onClick={() => setSigma(preset.val)}
              className={`rounded border px-2 py-1 font-mono text-[11px] transition ${
                Math.abs(sigma - preset.val) < 0.008
                  ? "border-dest bg-dest/20 text-emerald-200"
                  : "border-hairline text-slate-400 hover:text-slate-200"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Plot */}
      <div className="mt-3 overflow-hidden rounded-lg border border-hairline bg-[#080d10] p-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
          {/* Grid lines */}
          {[0, 1, 2, 3].map((yv) => (
            <g key={yv}>
              <line
                x1={padL}
                x2={width - padR}
                y1={yOf(yv)}
                y2={yOf(yv)}
                stroke={yv === 0 ? "#34d399" : "#1e2c35"}
                strokeWidth={yv === 0 ? 1.4 : 0.8}
                strokeOpacity={yv === 0 ? 0.55 : 0.9}
              />
              <text x={padL - 8} y={yOf(yv) + 4} textAnchor="end" className="fill-slate-500 font-mono text-[10px]">
                {yv}
              </text>
            </g>
          ))}

          {/* Known zero markers */}
          {KNOWN_ZETA_ZEROS.map((z) => (
            <g key={z}>
              <line
                x1={xOf(z)}
                x2={xOf(z)}
                y1={padT}
                y2={height - padB}
                stroke="#34d399"
                strokeDasharray="3 3"
                strokeOpacity={isOnCritical ? 0.45 : 0.16}
              />
              <circle
                cx={xOf(z)}
                cy={yOf(evalZetaMagnitude(sigma, z))}
                r={isOnCritical ? 4.2 : 2.8}
                fill={isOnCritical ? "#34d399" : "#eab308"}
              />
              <text x={xOf(z)} y={height - 10} textAnchor="middle" className="fill-slate-400 font-mono text-[9px]">
                {z.toFixed(1)}
              </text>
            </g>
          ))}

          {/* |zeta| curve */}
          <path
            d={pathD}
            fill="none"
            stroke={isOnCritical ? "#34d399" : "#f59e0b"}
            strokeWidth={2.2}
          />

          {/* Live sweep playhead */}
          <line x1={xOf(playT)} x2={xOf(playT)} y1={padT} y2={height - padB} stroke="#2dd4bf" strokeWidth={1.5} />
          <circle cx={xOf(playT)} cy={yOf(currentMag)} r={5} fill="#2dd4bf" />
        </svg>
      </div>

      {/* Live readout & resonance meter */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="font-mono text-slate-300">
          t = {playT.toFixed(2)} &nbsp;|&nbsp; |ζ({sigma.toFixed(3)} + {playT.toFixed(2)}i)| ={" "}
          <span className={currentMag < 0.08 ? "font-bold text-dest" : "text-amber-300"}>{currentMag.toFixed(4)}</span>
        </div>
        <div className={`text-xs ${isOnCritical ? "text-emerald-300" : "text-amber-300"}`}>
          {isOnCritical
            ? lang === "pl"
              ? "Symetria zestrojona: wszystkie 8 punktów dotyka zera"
              : "Symmetry locked: all 8 valleys touch zero"
            : lang === "pl"
              ? "Poza linią 0.5: żadna dolina nie dotyka zera (dysonans fal)"
              : "Off-line: valleys hover above zero (wave dissonance)"}
        </div>
      </div>

      {/* Acoustic Harmonic Alignment Bar */}
      <div className="mt-2 rounded-lg border border-hairline/70 bg-obsidian/70 px-3 py-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>{lang === "pl" ? "Rezonans harmoniczny (zestrojenie fazy)" : "Harmonic phase alignment"}</span>
          <span className="font-mono text-slate-200">
            {Math.max(0, Math.round((1 - Math.abs(sigma - 0.5) / 0.35) * 100))}%
          </span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full transition-all duration-150 ${isOnCritical ? "bg-dest" : "bg-amber-400"}`}
            style={{ width: `${Math.max(4, Math.round((1 - Math.abs(sigma - 0.5) / 0.35) * 100))}%` }}
          />
        </div>
      </div>
    </div>
  );
};
