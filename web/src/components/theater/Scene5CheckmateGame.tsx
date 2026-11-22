import React, { useState } from "react";
import { Crosshair, ShieldCheck, ZoomIn } from "lucide-react";
import { Language } from "../../types/ect";
import { theaterAudio } from "../../audio/theaterAudio";

interface Scene5CheckmateGameProps {
  lang: Language;
  audioEnabled: boolean;
  onEnableAudio: () => void;
}

interface DuelAttempt {
  distance: number; // positive distance right of center line
  roofGap: number; // distance / 2
  zoomStage: number;
}

export const Scene5CheckmateGame: React.FC<Scene5CheckmateGameProps> = ({ lang, audioEnabled, onEnableAudio }) => {
  const [zoomStage, setZoomStage] = useState<number>(0); // 0 -> 1x, 1 -> 10x, 2 -> 100x, 3 -> 1000x
  const [attempts, setAttempts] = useState<DuelAttempt[]>([]);

  const width = 680;
  const height = 240;
  const lineX = 88;
  const arenaSpan = width - lineX - 28;
  const maxVisibleDist = 0.45 / Math.pow(10, zoomStage);

  const last = attempts[attempts.length - 1] ?? null;

  const triggerAttempt = (distFractionOfSpan: number) => {
    const clampedFrac = Math.min(0.95, Math.max(0.08, distFractionOfSpan));
    const distance = clampedFrac * maxVisibleDist;
    const roofGap = distance / 2;
    if (!audioEnabled) onEnableAudio();
    theaterAudio.playTrapLock(zoomStage);
    setAttempts((prev) => [...prev, { distance, roofGap, zoomStage }]);
  };

  const formatDist = (d: number) => {
    if (d >= 0.01) return d.toFixed(3);
    if (d >= 0.0001) return d.toFixed(5);
    return d.toExponential(2);
  };

  return (
    <div className="space-y-5">
      <div className="max-w-3xl space-y-2">
        <h2 className="font-serif text-2xl font-medium text-white sm:text-3xl">
          {lang === "pl" ? "Scena 5: Spróbuj oszukać Dowód! (Gra 1 na 1)" : "Scene 5: Try to Beat the Proof! (1-on-1 Duel)"}
        </h2>
        <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
          {lang === "pl"
            ? "Ostatnia tajemnica: ten dach zawsze zostawia małą szczelinę i nigdy nie schodzi do zera. Jak więc wygrywa? Liczy się kolejność ruchów! Najpierw Ty (Natura) musisz gdzieś schować Falę-Potwora — dopiero potem Dowód wsuwa dach w połowę Twojej odległości."
            : "The final secret: this roof always leaves a tiny gap and never reaches zero. How can it win? Move order! First you (Nature) must place your Runaway Wave somewhere — only then does the Proof slide its roof to half your distance."}
        </p>
      </div>

      {/* Interactive Duel Arena */}
      <div className="overflow-hidden rounded-xl border border-hairline bg-[#060b0f] p-3">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-amber-300">
            {lang === "pl"
              ? "Jesteś Naturą — kliknij dowolne miejsce na prawo od zielonej linii:"
              : "You are Nature — click anywhere to the right of the green line:"}
          </span>
          <span className="rounded bg-panel px-2.5 py-0.5 font-mono text-teal-300">
            Zoom: {Math.pow(10, zoomStage).toLocaleString("en-US")}×
          </span>
        </div>

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full cursor-crosshair select-none rounded-lg border border-hairline/70 bg-[#04080b]"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const svgX = ((e.clientX - rect.left) / rect.width) * width;
            const frac = (svgX - lineX) / arenaSpan;
            triggerAttempt(frac);
          }}
        >
          {/* Escape zone tint */}
          <rect x={lineX} y={0} width={width - lineX} height={height} fill="rgba(239, 68, 68, 0.04)" />

          {/* Balance Line */}
          <line x1={lineX} x2={lineX} y1={14} y2={height - 14} stroke="#34d399" strokeWidth={4} />
          <text x={lineX - 10} y={height / 2} textAnchor="middle" transform={`rotate(-90 ${lineX - 14} ${height / 2})`} className="fill-emerald-300 text-xs font-bold">
            {lang === "pl" ? "LINIA RÓWNOWAGI" : "BALANCE LINE"}
          </text>

          {/* Scale ruler label */}
          <text x={width - 14} y={24} textAnchor="end" className="fill-slate-500 font-mono text-[11px]">
            {lang === "pl" ? `Widoczny pas: 0 → ${formatDist(maxVisibleDist)}` : `Visible strip: 0 → ${formatDist(maxVisibleDist)}`}
          </text>

          {/* Active Trap Visualization */}
          {last && last.zoomStage === zoomStage ? (() => {
            const waveX = lineX + (last.distance / maxVisibleDist) * arenaSpan;
            const roofX = lineX + (last.roofGap / maxVisibleDist) * arenaSpan;
            return (
              <g>
                {/* Emerald Roof Shield */}
                <rect x={lineX} y={38} width={Math.max(4, roofX - lineX)} height={height - 76} fill="rgba(52, 211, 153, 0.12)" />
                <line x1={roofX} x2={roofX} y1={34} y2={height - 34} stroke="#34d399" strokeWidth={3} strokeDasharray="6 3" />
                <text x={roofX} y={28} textAnchor="middle" className="fill-emerald-300 text-[11px] font-bold">
                  {lang === "pl" ? `Dach (½ luki = ${formatDist(last.roofGap)})` : `Roof (½ gap = ${formatDist(last.roofGap)})`}
                </text>

                {/* Trapped Rogue Wave */}
                <line x1={lineX} x2={waveX} y1={height / 2} y2={height / 2} stroke="#f87171" strokeWidth={1.5} strokeDasharray="3 3" />
                <circle cx={waveX} cy={height / 2} r={18} fill="rgba(239, 68, 68, 0.2)" stroke="#f87171" strokeWidth={2.5} />
                <circle cx={waveX} cy={height / 2} r={6} fill="#ef4444" />
                <text x={waveX} y={height / 2 + 34} textAnchor="middle" className="fill-red-300 text-[11px] font-bold">
                  {lang === "pl" ? `Twoja Fala (${formatDist(last.distance)})` : `Your Wave (${formatDist(last.distance)})`}
                </text>
              </g>
            );
          })() : (
            <text x={lineX + arenaSpan / 2} y={height / 2} textAnchor="middle" className="fill-slate-500 text-sm">
              {lang === "pl" ? "← Kliknij gdziekolwiek na tym polu →" : "← Click anywhere in this zone →"}
            </text>
          )}
        </svg>
      </div>

      {/* Action Buttons & Verdict */}
      <div className="flex flex-col gap-3 rounded-xl border border-hairline bg-obsidian/80 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
            <ShieldCheck className="h-4 w-4" />
            <span>
              {last
                ? lang === "pl"
                  ? `Złapana! Uciekłeś na ${formatDist(last.distance)} → Dowód zamknął sufit w połowie (${formatDist(last.roofGap)}).`
                  : `Trapped! You hid at ${formatDist(last.distance)} → Proof slid roof to half (${formatDist(last.roofGap)}).`
                : lang === "pl"
                  ? "Kliknij na planszy albo wciśnij przycisk obok, żeby zagrać pierwszy ruch."
                  : "Click on the board or press the button to make Nature's move."}
            </span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            {lang === "pl"
              ? `Próby: ${attempts.length} | Złapane: ${attempts.length}/${attempts.length} | Idealne zero potrzebne? NIE!`
              : `Attempts: ${attempts.length} | Trapped: ${attempts.length}/${attempts.length} | Zero gap needed? NO!`}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => triggerAttempt(0.38)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-400/50 bg-red-500/15 px-3 py-2 text-xs font-semibold text-red-200 hover:bg-red-500/25"
          >
            <Crosshair className="h-3.5 w-3.5" />
            <span>{lang === "pl" ? "Postaw Falę bliżej!" : "Place Closer Wave!"}</span>
          </button>

          <button
            type="button"
            onClick={() => setZoomStage((z) => (z >= 4 ? 0 : z + 1))}
            className="inline-flex items-center gap-1.5 rounded-lg border border-teal-400/50 bg-teal-500/15 px-3 py-2 text-xs font-semibold text-teal-200 hover:bg-teal-500/25"
          >
            <ZoomIn className="h-3.5 w-3.5" />
            <span>
              {zoomStage >= 4
                ? lang === "pl"
                  ? "Resetuj Zoom (1×)"
                  : "Reset Zoom (1×)"
                : lang === "pl"
                  ? "Przybliż 10× bliżej!"
                  : "Zoom 10× Closer!"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
