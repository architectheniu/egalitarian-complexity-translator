import React, { useMemo } from "react";
import { Scissors } from "lucide-react";
import { ComplexityCapsule, Language, ZoomLevel } from "../types/ect";
import { UI_STRINGS } from "../i18n/ui";

interface ProofTopologyMapProps {
  capsule: ComplexityCapsule;
  lang: Language;
  level: ZoomLevel;
  selectedType: "component" | "cut";
  selectedId: string;
  tourPath: string[];
  onSelectComponent: (id: string) => void;
  onSelectCut: (id: string) => void;
}

const NODE_COORDS: Record<string, { col: number; row: number }> = {
  // Col 0: arith (4 components)
  galois: { col: 0, row: 0 },
  inputs: { col: 0, row: 1 },
  primes: { col: 0, row: 2 },
  cohomology: { col: 0, row: 3 },
  // Col 1: est (3 components)
  family: { col: 1, row: 0.6 },
  hosts: { col: 1, row: 2.0 },
  comparison: { col: 1, row: 3.1 },
  // Col 2: ana (4 components)
  statistic: { col: 2, row: 0 },
  residues: { col: 2, row: 1 },
  criterion: { col: 2, row: 2 },
  choreography: { col: 2, row: 3 },
  // Col 3: dest (3 components)
  descent: { col: 3, row: 0.6 },
  reflection: { col: 3, row: 1.8 },
  endpoints: { col: 3, row: 3.0 },
};

const STRATUM_ACCENT: Record<string, { border: string; badge: string; glow: string; hex: string }> = {
  arith: {
    border: "border-arith/50",
    badge: "bg-arith/15 text-orange-300 border-arith/40",
    glow: "ring-2 ring-arith/60 bg-[#1a1614]",
    hex: "#e06c38",
  },
  est: {
    border: "border-est/50",
    badge: "bg-est/15 text-amber-300 border-est/40",
    glow: "ring-2 ring-est/60 bg-[#1b1a12]",
    hex: "#eab308",
  },
  ana: {
    border: "border-ana/50",
    badge: "bg-ana/15 text-teal-300 border-ana/40",
    glow: "ring-2 ring-ana/60 bg-[#101c1e]",
    hex: "#2dd4bf",
  },
  dest: {
    border: "border-dest/50",
    badge: "bg-dest/15 text-emerald-300 border-dest/40",
    glow: "ring-2 ring-dest/60 bg-[#101d17]",
    hex: "#34d399",
  },
};

export const ProofTopologyMap: React.FC<ProofTopologyMapProps> = ({
  capsule,
  lang,
  level,
  selectedType,
  selectedId,
  tourPath,
  onSelectComponent,
  onSelectCut,
}) => {
  const t = UI_STRINGS[lang];
  const ir = capsule.formal_core_ir;
  const lenses = capsule.lenses;

  const { upstreamIds, downstreamIds } = useMemo(() => {
    const up = new Set<string>();
    const down = new Set<string>();
    if (selectedType === "component") {
      for (const iface of ir.interfaces) {
        if (iface.to === selectedId) up.add(iface.from);
        if (iface.from === selectedId) down.add(iface.to);
      }
    }
    return { upstreamIds: up, downstreamIds: down };
  }, [ir.interfaces, selectedType, selectedId]);

  // Fixed canvas dimensions for crisp deterministic SVG Bezier paths + overlay cards
  const canvasW = 1040;
  const canvasH = 620;
  const colWidth = 225;
  const colGap = 42;
  const cardW = colWidth;
  const cardH = 108;
  const topOffset = 78;
  const rowPitch = 132;

  const getNodePos = (compId: string, fallbackIndex: number) => {
    const c = ir.components.find((x) => x.id === compId);
    const strataOrder = ir.strata.find((s) => s.id === c?.stratum)?.order ?? 0;
    const preset = NODE_COORDS[compId];
    const col = preset ? preset.col : Math.min(3, strataOrder);
    const row = preset ? preset.row : fallbackIndex % 4;
    const x = 14 + col * (colWidth + colGap);
    const y = topOffset + row * rowPitch;
    return { x, y };
  };

  const sortedStrata = [...ir.strata].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-3">
      {/* Global Cuts Bar */}
      <div className="rounded-xl border border-hairline bg-panel/90 p-3">
        <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          <Scissors className="h-3.5 w-3.5 text-amber-400" />
          <span>{t.globalCutsHeading}</span>
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {ir.cuts.map((cut) => {
            const cutLens = lenses.cuts?.[cut.id]?.[lang]?.[level] ?? lenses.cuts?.[cut.id]?.en?.[level];
            const isSelected = selectedType === "cut" && selectedId === cut.id;
            return (
              <button
                key={cut.id}
                type="button"
                onClick={() => onSelectCut(cut.id)}
                className={`flex flex-col items-start rounded-lg border p-3 text-left transition ${
                  isSelected
                    ? "border-amber-400 bg-amber-950/30 ring-1 ring-amber-400/50"
                    : "border-hairline bg-obsidian/70 hover:border-slate-500"
                }`}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="font-serif text-sm font-medium text-white">{cutLens?.title ?? cut.title_raw}</span>
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-amber-300">
                    {t.clickToInspectCut}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-slate-300">{cutLens?.statement ?? cut.premise_latex}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable 4-Stratum DAG Canvas */}
      <div className="overflow-x-auto rounded-xl border border-hairline bg-[#090f13] p-3 shadow-xl">
        <div className="relative" style={{ width: `${canvasW}px`, height: `${canvasH}px` }}>
          {/* Stratum Header Bands */}
          {sortedStrata.map((s) => {
            const colX = 14 + s.order * (colWidth + colGap);
            const sLens = lenses.strata?.[s.id]?.[lang]?.[level] ?? lenses.strata?.[s.id]?.en?.[level];
            const accent = STRATUM_ACCENT[s.id] ?? STRATUM_ACCENT.ana;
            return (
              <div
                key={s.id}
                style={{ left: `${colX}px`, width: `${cardW}px` }}
                className={`absolute top-1 rounded-lg border ${accent.border} bg-panel/90 px-3 py-2`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    {sLens?.title ?? s.title_raw}
                  </span>
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: s.color || accent.hex }}
                  />
                </div>
                <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-400">{sLens?.summary ?? s.blurb_raw}</p>
              </div>
            );
          })}

          {/* SVG Curved Interface Edges */}
          <svg
            width={canvasW}
            height={canvasH}
            viewBox={`0 0 ${canvasW} ${canvasH}`}
            className="pointer-events-none absolute inset-0"
          >
            <defs>
              <marker id="arrow-muted" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                <polygon points="0 0, 7 3.5, 0 7" fill="#475569" />
              </marker>
              <marker id="arrow-up" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                <polygon points="0 0, 7 3.5, 0 7" fill="#eab308" />
              </marker>
              <marker id="arrow-down" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                <polygon points="0 0, 7 3.5, 0 7" fill="#34d399" />
              </marker>
            </defs>

            {ir.interfaces.map((iface, idx) => {
              const p1 = getNodePos(iface.from, idx);
              const p2 = getNodePos(iface.to, idx);

              const sameCol = Math.abs(p1.x - p2.x) < 20;
              let startX = p1.x + cardW;
              let startY = p1.y + cardH / 2;
              let endX = p2.x - 4;
              let endY = p2.y + cardH / 2;
              let pathD = "";

              if (sameCol) {
                startX = p1.x + cardW / 2;
                startY = p1.y + cardH;
                endX = p2.x + cardW / 2;
                endY = p2.y - 4;
                const midY = (startY + endY) / 2;
                pathD = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
              } else {
                const dx = Math.abs(endX - startX) * 0.45;
                pathD = `M ${startX} ${startY} C ${startX + dx} ${startY}, ${endX - dx} ${endY}, ${endX} ${endY}`;
              }

              const isIncoming = selectedType === "component" && iface.to === selectedId;
              const isOutgoing = selectedType === "component" && iface.from === selectedId;
              const isRelated = isIncoming || isOutgoing;

              const stroke = isIncoming ? "#eab308" : isOutgoing ? "#34d399" : "#334155";
              const marker = isIncoming ? "url(#arrow-up)" : isOutgoing ? "url(#arrow-down)" : "url(#arrow-muted)";
              const edgeLabel = lenses.interfaces?.[iface.id]?.[lang]?.[level] ?? iface.label_raw;
              const midX = (startX + endX) / 2;
              const midY = (startY + endY) / 2;

              return (
                <g key={iface.id} opacity={selectedType === "component" && !isRelated ? 0.35 : 0.95}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke={stroke}
                    strokeWidth={isRelated ? 2.2 : 1.3}
                    className={isRelated ? "edge-flow" : ""}
                    markerEnd={marker}
                  />
                  {isRelated && (
                    <g transform={`translate(${midX}, ${midY})`}>
                      <rect
                        x={-64}
                        y={-10}
                        width={128}
                        height={18}
                        rx={4}
                        fill="#0b1114"
                        stroke={stroke}
                        strokeWidth={0.9}
                      />
                      <text
                        x={0}
                        y={2}
                        textAnchor="middle"
                        className="fill-slate-100 font-mono text-[9.5px]"
                      >
                        {edgeLabel.length > 23 ? `${edgeLabel.slice(0, 21)}…` : edgeLabel}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Interactive Component Cards */}
          {ir.components.map((comp, idx) => {
            const pos = getNodePos(comp.id, idx);
            const lens = lenses.components?.[comp.id]?.[lang]?.[level] ?? lenses.components?.[comp.id]?.en?.[level];
            const accent = STRATUM_ACCENT[comp.stratum] ?? STRATUM_ACCENT.ana;
            const isSelected = selectedType === "component" && selectedId === comp.id;
            const isUp = upstreamIds.has(comp.id);
            const isDown = downstreamIds.has(comp.id);
            const inTour = tourPath.includes(comp.id);
            const dimmed = selectedType === "component" && !isSelected && !isUp && !isDown;

            return (
              <button
                key={comp.id}
                type="button"
                onClick={() => onSelectComponent(comp.id)}
                style={{ left: `${pos.x}px`, top: `${pos.y}px`, width: `${cardW}px`, height: `${cardH}px` }}
                className={`absolute flex flex-col justify-between rounded-xl border p-3 text-left transition-all ${
                  isSelected
                    ? `${accent.glow} border-white/80 z-20 scale-[1.02]`
                    : isUp
                      ? "border-amber-400/70 bg-[#171611] z-10"
                      : isDown
                        ? "border-emerald-400/70 bg-[#101a16] z-10"
                        : `${accent.border} bg-panel/95 hover:border-slate-400`
                } ${dimmed ? "opacity-55 hover:opacity-95" : "opacity-100"}`}
              >
                <div className="flex w-full items-center justify-between gap-1.5">
                  <span className={`rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold ${accent.badge}`}>
                    #{comp.n} · {comp.id}
                  </span>
                  <div className="flex items-center gap-1">
                    {inTour && <span className="h-2 w-2 rounded-full bg-teal-400" title="In active tour" />}
                    {lens && (
                      <span className="font-mono text-[10px] text-slate-400">
                        {Math.round(lens.loss_meter.fidelity_score * 100)}%
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="line-clamp-1 font-serif text-sm font-semibold text-white">
                    {lens?.title ?? comp.title_raw}
                  </div>
                  <div className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-slate-300">
                    {lens?.headline ?? comp.gist_raw}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
