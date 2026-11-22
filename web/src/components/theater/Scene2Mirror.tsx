import React, { useState } from "react";
import { Sparkles, Volume2 } from "lucide-react";
import { Language } from "../../types/ect";
import { theaterAudio } from "../../audio/theaterAudio";

interface Scene2MirrorProps {
  lang: Language;
  audioEnabled: boolean;
  onEnableAudio: () => void;
}

interface MirrorOrb {
  id: number;
  leftDist: number; // 0.08..0.44 from center
  yFrac: number; // 0.18..0.82
}

export const Scene2Mirror: React.FC<Scene2MirrorProps> = ({ lang, audioEnabled, onEnableAudio }) => {
  const [orbs, setOrbs] = useState<MirrorOrb[]>([{ id: 1, leftDist: 0.25, yFrac: 0.45 }]);

  const width = 680;
  const height = 270;
  const centerX = width / 2;

  const spawnAt = (clientX: number, clientY: number, rect: DOMRect) => {
    const normX = (clientX - rect.left) / rect.width;
    const normY = Math.min(0.84, Math.max(0.16, (clientY - rect.top) / rect.height));
    // Map any click (left or right) onto distance from center line
    const dist = Math.min(0.43, Math.max(0.06, Math.abs(0.5 - normX)));
    if (!audioEnabled) onEnableAudio();
    theaterAudio.playMirrorEcho();
    setOrbs((prev) => [...prev.slice(-3), { id: Date.now(), leftDist: dist, yFrac: normY }]);
  };

  return (
    <div className="space-y-5">
      <div className="max-w-3xl space-y-2">
        <h2 className="font-serif text-2xl font-medium text-white sm:text-3xl">
          {lang === "pl" ? "Scena 2: Zwierciadło (połowa problemu znika)" : "Scene 2: The Mirror (Half the Problem Vanishes)"}
        </h2>
        <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
          {lang === "pl"
            ? "Ukryte fale zawsze rodzą się w lustrzanych parach. Nie da się uciec w lewo od linii równowagi, żeby nie zapalić dokładnego bliźniaka-potwora po prawej — więc wystarczy wyczyścić prawą stronę."
            : "Hidden waves always arrive in symmetric mirror pairs. You cannot slip left of center without lighting up a twin Runaway Wave on the right — so clearing the right half clears everything."}
        </p>
      </div>

      {/* Interactive Mirror Stage */}
      <div className="overflow-hidden rounded-xl border border-hairline bg-[#060b0f] p-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full cursor-crosshair select-none"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            spawnAt(e.clientX, e.clientY, rect);
          }}
        >
          {/* Left & Right half tints */}
          <rect x={0} y={0} width={centerX} height={height} fill="rgba(234, 179, 8, 0.04)" />
          <rect x={centerX} y={0} width={centerX} height={height} fill="rgba(239, 68, 68, 0.06)" />

          {/* Zone titles */}
          <text x={centerX / 2} y={24} textAnchor="middle" className="fill-amber-300 text-xs font-semibold">
            {lang === "pl" ? "LEWA STRONA (kliknij tutaj)" : "LEFT SIDE (click here)"}
          </text>
          <text x={centerX + centerX / 2} y={24} textAnchor="middle" className="fill-red-300 text-xs font-semibold">
            {lang === "pl" ? "PRAWA STRONA (bliźniak-potwór)" : "RIGHT SIDE (twin monster)"}
          </text>

          {/* Center Mirror Line */}
          <line x1={centerX} x2={centerX} y1={12} y2={height - 12} stroke="#34d399" strokeWidth={3} />
          <rect x={centerX - 66} y={height - 30} width={132} height={22} rx={6} fill="#0b1114" stroke="#34d399" />
          <text x={centerX} y={height - 15} textAnchor="middle" className="fill-emerald-300 text-[11px] font-semibold">
            {lang === "pl" ? "LUSTRO RÓWNOWAGI" : "BALANCE MIRROR"}
          </text>

          {/* Mirror Pairs */}
          {orbs.map((orb, idx) => {
            const lx = centerX - orb.leftDist * width;
            const rx = centerX + orb.leftDist * width;
            const y = orb.yFrac * height;
            const latest = idx === orbs.length - 1;
            return (
              <g key={orb.id} opacity={latest ? 1 : 0.35}>
                <line
                  x1={lx}
                  y1={y}
                  x2={rx}
                  y2={y}
                  stroke="#facc15"
                  strokeDasharray="5 4"
                  strokeWidth={latest ? 2 : 1.2}
                />
                <circle cx={lx} cy={y} r={latest ? 13 : 9} fill="rgba(251, 191, 36, 0.25)" stroke="#fbbf24" strokeWidth={2.2} />
                <circle cx={rx} cy={y} r={latest ? 17 : 11} fill="rgba(248, 113, 113, 0.25)" stroke="#f87171" strokeWidth={2.5} />
                <circle cx={rx} cy={y} r={latest ? 6 : 4} fill="#ef4444" />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Tactile preset action */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-hairline bg-obsidian/80 p-4">
        <span className="text-xs text-slate-300">
          {lang === "pl"
            ? "Kliknij dowolny punkt na scenie powyżej — albo przetestuj losową parę lustrzaną:"
            : "Click anywhere on the mirror stage above — or drop a fresh symmetric pair:"}
        </span>
        <button
          type="button"
          onClick={() => {
            if (!audioEnabled) onEnableAudio();
            theaterAudio.playMirrorEcho();
            setOrbs((prev) => [
              ...prev.slice(-3),
              {
                id: Date.now(),
                leftDist: 0.1 + Math.random() * 0.3,
                yFrac: 0.22 + Math.random() * 0.52,
              },
            ]);
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-amber-400/50 bg-amber-500/15 px-4 py-2 text-xs font-semibold text-amber-200 hover:bg-amber-500/25"
        >
          <Sparkles className="h-4 w-4" />
          <span>{lang === "pl" ? "Postaw falę po lewej → patrz na prawo" : "Drop Left Wave → Watch Right Twin"}</span>
          <Volume2 className="h-3.5 w-3.5 opacity-75" />
        </button>
      </div>
    </div>
  );
};
