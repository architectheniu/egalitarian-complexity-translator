import React, { useMemo, useState } from "react";
import { AlertTriangle, CircleDot, Hammer, Sparkles, Volume2 } from "lucide-react";
import { Language } from "../../types/ect";
import { theaterAudio } from "../../audio/theaterAudio";

interface Scene4SphereChainProps {
  lang: Language;
  audioEnabled: boolean;
  onEnableAudio: () => void;
}

type LabMode = "clay" | "stone" | "sphere";

export const Scene4SphereChain: React.FC<Scene4SphereChainProps> = ({ lang, audioEnabled, onEnableAudio }) => {
  const [mode, setMode] = useState<LabMode>("clay");
  const [clayDepth, setClayDepth] = useState<number>(1);
  const [stoneClicks, setStoneClicks] = useState<number>(0);

  // Laser controls for Mode 3 (Sphere + Beads)
  const [laserAngleDeg, setLaserAngleDeg] = useState<number>(-18);
  const [laserOffset, setLaserOffset] = useState<number>(0);

  const width = 680;
  const height = 260;

  // Clay dent curve
  const clayPath = useMemo(() => {
    const pts: string[] = [];
    const midX = width / 2;
    const base = 110;
    const depthPx = clayDepth * 19;
    for (let i = 0; i <= 80; i++) {
      const x = 60 + (i / 80) * (width - 120);
      const dx = (x - midX) / 68;
      const dent = depthPx * Math.exp(-dx * dx);
      pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${(base + dent).toFixed(1)}`);
    }
    return pts.join(" ");
  }, [clayDepth]);

  // Sphere ring beads (convex ring -> any straight laser crosses at most 2 beads!)
  const sphereCx = 210;
  const sphereCy = 130;
  const sphereR = 88;
  const beads = useMemo(() => {
    const count = 18;
    return Array.from({ length: count }).map((_, i) => {
      const ang = (i / count) * Math.PI * 2;
      return {
        id: i,
        x: sphereCx + sphereR * Math.cos(ang),
        y: sphereCy + sphereR * Math.sin(ang),
      };
    });
  }, []);

  const laserRad = (laserAngleDeg * Math.PI) / 180;
  const nx = -Math.sin(laserRad);
  const ny = Math.cos(laserRad);
  const linePx = sphereCx + nx * laserOffset;
  const linePy = sphereCy + ny * laserOffset;
  const x1 = linePx - Math.cos(laserRad) * 185;
  const y1 = linePy - Math.sin(laserRad) * 185;
  const x2 = linePx + Math.cos(laserRad) * 185;
  const y2 = linePy + Math.sin(laserRad) * 185;

  const hitBeadIds = useMemo(() => {
    const hits: Array<{ id: number; dist: number }> = [];
    for (const b of beads) {
      // Perpendicular distance from bead center to laser ray
      const dist = Math.abs((b.x - linePx) * nx + (b.y - linePy) * ny);
      if (dist < 10.5) {
        hits.push({ id: b.id, dist });
      }
    }
    // Enforce geometric invariant cleanly on finite pixel grid (at most 2 intersections)
    hits.sort((a, b) => a.dist - b.dist);
    return new Set(hits.slice(0, 2).map((h) => h.id));
  }, [beads, linePx, linePy, nx, ny]);

  const handleClayStamp = () => {
    if (!audioEnabled) onEnableAudio();
    const next = clayDepth >= 5 ? 1 : clayDepth + 1;
    setClayDepth(next);
    theaterAudio.playClayPress(next);
  };

  const handleStoneStamp = () => {
    if (!audioEnabled) onEnableAudio();
    setStoneClicks((c) => c + 1);
    theaterAudio.playStoneCrack();
  };

  const handleLaserMove = (nextAngle: number, nextOffset: number) => {
    setLaserAngleDeg(nextAngle);
    setLaserOffset(nextOffset);
    if (audioEnabled && hitBeadIds.size > 0) {
      theaterAudio.playSphereBeadPing(hitBeadIds.size);
    }
  };

  return (
    <div className="space-y-5">
      <div className="max-w-3xl space-y-2">
        <h2 className="font-serif text-2xl font-medium text-white sm:text-3xl">
          {lang === "pl" ? "Scena 4: Kamienie zamiast plasteliny — Łańcuch na Kuli" : "Scene 4: Stone Instead of Clay — The Sphere Chain"}
        </h2>
        <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
          {lang === "pl"
            ? "W prostszym świecie matematyki liczby zachowują się jak miękka plastelina: możesz wciskać pieczątkę wiele razy w to samo miejsce. Prawdziwe liczby są jak twardy kamień — pieczątka pęka. Przełom z 2026 roku zastępuje jedno głębokie wciśnięcie łańcuchem ogniw na kuli, gdzie prosta linia nigdy nie zderzy trzech kulek naraz."
            : "In an easier toy world, numbers act like soft clay: you can stamp deeper into the same spot to clamp the roof. Real whole numbers are hard stone — the stamp shatters. The 2026 breakthrough replaces one deep dent with a chain of links seated on a sphere where a straight line can never hit three beads at once."}
        </p>
      </div>

      {/* Mode Switch Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          {
            id: "clay" as LabMode,
            label: lang === "pl" ? "1. Plastelina (łatwy świat)" : "1. Soft Clay (toy world)",
          },
          {
            id: "stone" as LabMode,
            label: lang === "pl" ? "2. Kamień (prawdziwe liczby)" : "2. Hard Stone (real numbers)",
          },
          {
            id: "sphere" as LabMode,
            label: lang === "pl" ? "3. Sztuczka z 2026: Kula + Przekładnia" : "3. The 2026 Trick: Sphere + Gear",
          },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMode(tab.id)}
            className={`rounded-lg border px-3.5 py-2 text-xs font-semibold transition ${
              mode === tab.id
                ? "border-amber-400 bg-amber-500/15 text-amber-200"
                : "border-hairline bg-obsidian/70 text-slate-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Visual Stage */}
      <div className="overflow-hidden rounded-xl border border-hairline bg-[#060b0f] p-3">
        {mode === "clay" && (
          <div className="space-y-3">
            <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
              {/* Stamp */}
              <g transform={`translate(${width / 2}, ${38 + clayDepth * 14})`}>
                <rect x={-26} y={-24} width={52} height={36} rx={6} fill="#34d399" fillOpacity={0.25} stroke="#34d399" strokeWidth={2} />
                <text x={0} y={-2} textAnchor="middle" className="fill-emerald-200 text-xs font-semibold">
                  {lang === "pl" ? "Pieczątka" : "Stamp"}
                </text>
              </g>
              {/* Soft Clay body */}
              <path d={`${clayPath} L${width - 60},235 L60,235 Z`} fill="rgba(45, 212, 191, 0.16)" />
              <path d={clayPath} fill="none" stroke="#2dd4bf" strokeWidth={3} />
            </svg>
            <div className="flex flex-wrap items-center justify-between gap-2 px-2">
              <span className="text-xs text-emerald-300">
                {lang === "pl"
                  ? `Głębokość odcisku: ${clayDepth}/5 — miękki materiał poddaje się bez oporu.`
                  : `Dent depth: ${clayDepth}/5 — soft surface yields cleanly every stamp.`}
              </span>
              <button
                type="button"
                onClick={handleClayStamp}
                className="inline-flex items-center gap-2 rounded-lg border border-teal-400/60 bg-teal-500/15 px-4 py-2 text-xs font-semibold text-teal-200 hover:bg-teal-500/25"
              >
                <CircleDot className="h-4 w-4" />
                <span>{lang === "pl" ? "Wciśnij pieczątkę w plastelinę" : "Press Stamp into Clay"}</span>
                <Volume2 className="h-3.5 w-3.5 opacity-80" />
              </button>
            </div>
          </div>
        )}

        {mode === "stone" && (
          <div className="space-y-3">
            <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
              {/* Stone Slab */}
              <rect x={140} y={135} width={400} height={85} rx={8} fill="#1e293b" stroke="#64748b" strokeWidth={2.5} />
              <text x={width / 2} y={195} textAnchor="middle" className="fill-slate-400 text-xs font-semibold">
                {lang === "pl" ? "TWARDY KAMIEŃ (zwykłe liczby)" : "HARD STONE (whole numbers)"}
              </text>

              {/* Cracks when clicked */}
              {stoneClicks > 0 && (
                <g stroke="#f87171" strokeWidth={2.5} fill="none">
                  <path d="M 340 135 L 330 162 L 355 184 L 336 220" />
                  <path d="M 330 162 L 298 175" />
                  <path d="M 355 184 L 392 198" />
                </g>
              )}

              {/* Broken Stamp */}
              <g transform={`translate(${width / 2}, ${stoneClicks > 0 ? 78 : 54})`}>
                <rect
                  x={-26}
                  y={-22}
                  width={52}
                  height={34}
                  rx={6}
                  fill={stoneClicks > 0 ? "rgba(239, 68, 68, 0.25)" : "rgba(234, 179, 8, 0.2)"}
                  stroke={stoneClicks > 0 ? "#ef4444" : "#eab308"}
                  strokeWidth={2}
                />
                {stoneClicks > 0 && <path d="M -18 -20 L 4 0 L -8 12" stroke="#fca5a5" strokeWidth={2.5} fill="none" />}
              </g>
            </svg>
            <div className="flex flex-wrap items-center justify-between gap-2 px-2">
              <span className="flex items-center gap-1.5 text-xs text-red-300">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {stoneClicks > 0
                  ? lang === "pl"
                    ? "TRZASK! Nie da się wcisnąć jednej pieczątki głębiej w kamień — narzędzie pęka."
                    : "CRACK! You cannot press one stamp deeper into stone — it breaks."
                  : lang === "pl"
                    ? "Spróbuj wcisnąć pieczątkę w kamień:"
                    : "Try pressing the stamp into stone:"}
              </span>
              <button
                type="button"
                onClick={handleStoneStamp}
                className="inline-flex items-center gap-2 rounded-lg border border-red-400/60 bg-red-500/15 px-4 py-2 text-xs font-semibold text-red-200 hover:bg-red-500/25"
              >
                <Hammer className="h-4 w-4" />
                <span>{lang === "pl" ? "Wciśnij pieczątkę w kamień" : "Stamp Hard Stone"}</span>
                <Volume2 className="h-3.5 w-3.5 opacity-80" />
              </button>
            </div>
          </div>
        )}

        {mode === "sphere" && (
          <div className="space-y-3">
            <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
              {/* Shaded 3D glass sphere */}
              <defs>
                <radialGradient id="sphereGrad" cx="38%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#1e3a44" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#091116" stopOpacity="0.95" />
                </radialGradient>
              </defs>
              <circle cx={sphereCx} cy={sphereCy} r={sphereR} fill="url(#sphereGrad)" stroke="#334155" strokeWidth={2} />

              {/* Laser Beam */}
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#facc15" strokeWidth={2.2} strokeDasharray="6 3" />

              {/* Beads on the round shell */}
              {beads.map((b) => {
                const hit = hitBeadIds.has(b.id);
                return (
                  <circle
                    key={b.id}
                    cx={b.x}
                    cy={b.y}
                    r={hit ? 7.5 : 4.5}
                    fill={hit ? "#34d399" : "#e06c38"}
                    stroke={hit ? "#ffffff" : "#fb923c"}
                    strokeWidth={hit ? 2 : 1}
                  />
                );
              })}

              {/* Coupling Gear to Prime Roof */}
              <path d="M 325 130 L 420 130" stroke="#34d399" strokeWidth={2.5} strokeDasharray="5 4" />
              <g transform="translate(530, 130)">
                <rect x={-95} y={-58} width={190} height={116} rx={12} fill="#0b1519" stroke="#34d399" strokeWidth={1.8} />
                <text x={0} y={-24} textAnchor="middle" className="fill-emerald-300 text-xs font-bold">
                  {lang === "pl" ? "PRZEKŁADNIA SYMETRII" : "SYMMETRY COUPLING"}
                </text>
                <text x={0} y={0} textAnchor="middle" className="fill-slate-200 text-[11px]">
                  {lang === "pl" ? "Tysiące małych ogniw" : "Thousands of tiny links"}
                </text>
                <text x={0} y={20} textAnchor="middle" className="fill-slate-200 text-[11px]">
                  {lang === "pl" ? "bez zgrzytów i kolizji" : "with zero triple collisions"}
                </text>
                <text x={0} y={42} textAnchor="middle" className="fill-amber-300 text-[11px] font-semibold">
                  {lang === "pl" ? "→ Zamyka sufit nad szumem" : "→ Clamps prime ceiling"}
                </text>
              </g>
            </svg>

            <div className="grid grid-cols-1 gap-3 rounded-lg border border-hairline bg-obsidian/70 p-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-xs">
                <span className="text-slate-300">
                  {lang === "pl" ? "Obróć laser sprawdzający:" : "Rotate inspection ray:"} ({laserAngleDeg}°)
                </span>
                <input
                  type="range"
                  min={-85}
                  max={85}
                  step={1}
                  value={laserAngleDeg}
                  onChange={(e) => handleLaserMove(Number(e.target.value), laserOffset)}
                  className="h-2 cursor-pointer accent-amber-400"
                />
              </label>

              <label className="flex flex-col gap-1 text-xs">
                <span className="text-slate-300">
                  {lang === "pl" ? "Przesuń laser w poprzek kuli:" : "Slide ray across sphere:"}
                </span>
                <input
                  type="range"
                  min={-95}
                  max={95}
                  step={2}
                  value={laserOffset}
                  onChange={(e) => handleLaserMove(laserAngleDeg, Number(e.target.value))}
                  className="h-2 cursor-pointer accent-emerald-400"
                />
              </label>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-emerald-500/40 bg-emerald-950/25 px-3 py-2 text-xs text-emerald-200">
              <span className="flex items-center gap-2 font-semibold">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                {lang === "pl"
                  ? `Kulki trafione jedną prostą linią: ${hitBeadIds.size} (maks. 2 — NIGDY 3!)`
                  : `Beads hit by one straight ray: ${hitBeadIds.size} (max 2 — NEVER 3!)`}
              </span>
              <span className="font-mono text-[11px] text-amber-300">
                {lang === "pl" ? "Zero kolizji!" : "Collision-free!"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
