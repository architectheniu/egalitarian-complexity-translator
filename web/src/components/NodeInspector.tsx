import React from "react";
import { ArrowDownRight, ArrowUpRight, BookOpen, ExternalLink, FlaskConical, Link2, Sparkles } from "lucide-react";
import { ComplexityCapsule, Language, ZoomLevel } from "../types/ect";
import { UI_STRINGS } from "../i18n/ui";
import { LossMeterCard } from "./LossMeterCard";

interface NodeInspectorProps {
  capsule: ComplexityCapsule;
  lang: Language;
  level: ZoomLevel;
  selectedType: "component" | "cut";
  selectedId: string;
  onSelectComponent: (id: string) => void;
  onOpenLab: (labId: "critical" | "window" | "choreography" | "theta") => void;
}

const COMP_TO_LAB: Record<string, { id: "critical" | "window" | "choreography" | "theta"; pl: string; en: string }> = {
  endpoints: { id: "critical", pl: "Uruchom Laboratorium: Symfonia Zety", en: "Open Lab: Zeta Symphony" },
  reflection: { id: "critical", pl: "Uruchom Laboratorium: Symfonia Zety", en: "Open Lab: Zeta Symphony" },
  statistic: { id: "window", pl: "Uruchom Laboratorium: Okno Liczb Pierwszych", en: "Open Lab: Prime Window Ceiling" },
  criterion: { id: "window", pl: "Uruchom Laboratorium: Okno Liczb Pierwszych", en: "Open Lab: Prime Window Ceiling" },
  choreography: { id: "choreography", pl: "Uruchom Laboratorium: Pułapka Wykładników", en: "Open Lab: Exponent Trap" },
  family: { id: "theta", pl: "Uruchom Laboratorium: Most Stiepanowa → Theta", en: "Open Lab: Stepanov-to-Theta Bridge" },
  primes: { id: "theta", pl: "Uruchom Laboratorium: Most Stiepanowa → Theta", en: "Open Lab: Stepanov-to-Theta Bridge" },
};

export const NodeInspector: React.FC<NodeInspectorProps> = ({
  capsule,
  lang,
  level,
  selectedType,
  selectedId,
  onSelectComponent,
  onOpenLab,
}) => {
  const t = UI_STRINGS[lang];
  const ir = capsule.formal_core_ir;
  const lenses = capsule.lenses;

  if (selectedType === "cut") {
    const cut = ir.cuts.find((c) => c.id === selectedId) ?? ir.cuts[0];
    const cutLens = lenses.cuts?.[cut.id]?.[lang]?.[level] ?? lenses.cuts?.[cut.id]?.en?.[level];

    return (
      <div className="space-y-4 rounded-xl border border-amber-400/40 bg-panel p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-full border border-amber-400/40 bg-amber-500/15 px-2.5 py-0.5 font-mono text-xs text-amber-200">
            CUT · {cut.id}
          </span>
          {cut.lean && <span className="font-mono text-xs text-slate-400">{cut.lean}</span>}
        </div>

        <h2 className="font-serif text-2xl font-semibold text-white">{cutLens?.title ?? cut.title_raw}</h2>

        <div className="rounded-lg border border-hairline bg-obsidian/80 p-3 font-mono text-xs text-teal-200">
          {cutLens?.statement ?? cut.premise_latex}
        </div>

        <p className="text-sm leading-relaxed text-slate-200">{cutLens?.intuition}</p>

        {cutLens?.loss_meter && <LossMeterCard lossMeter={cutLens.loss_meter} level={level} lang={lang} />}
      </div>
    );
  }

  const comp = ir.components.find((c) => c.id === selectedId) ?? ir.components[0];
  const lens = lenses.components?.[comp.id]?.[lang]?.[level] ?? lenses.components?.[comp.id]?.en?.[level];
  const upstream = ir.interfaces.filter((i) => i.to === comp.id);
  const downstream = ir.interfaces.filter((i) => i.from === comp.id);
  const matchedLab = COMP_TO_LAB[comp.id];

  return (
    <div className="space-y-4 rounded-xl border border-hairline bg-panel p-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="rounded-md border border-hairline bg-obsidian px-2 py-0.5 font-mono text-xs text-slate-300">
            #{comp.n} · {comp.stratum.toUpperCase()}
          </span>
          {comp.kicker && <span className="font-mono text-xs text-ana">{comp.kicker}</span>}
        </div>
        {lens?.analogy_anchor && (
          <span className="inline-flex items-center gap-1 rounded-full border border-teal-500/30 bg-teal-500/10 px-2.5 py-0.5 text-[11px] text-teal-200">
            <Sparkles className="h-3 w-3" />
            {lens.analogy_anchor}
          </span>
        )}
      </div>

      <div>
        <h2 className="font-serif text-2xl font-semibold text-white">{lens?.title ?? comp.title_raw}</h2>
        <p className="mt-1 text-sm font-medium text-teal-300">{lens?.headline ?? comp.gist_raw}</p>
      </div>

      {/* Main zoom-calibrated explanation */}
      <div className="rounded-lg border border-hairline bg-obsidian/60 p-4">
        <p className="text-sm leading-relaxed text-slate-200">{lens?.explanation}</p>
        {lens?.key_insight && (
          <div className="mt-3 flex items-start gap-2 border-t border-hairline/70 pt-3 text-xs text-emerald-200">
            <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-dest" />
            <span>{lens.key_insight}</span>
          </div>
        )}
      </div>

      {/* Embedded Lab Launch Button if relevant */}
      {matchedLab && (
        <button
          type="button"
          onClick={() => onOpenLab(matchedLab.id)}
          className="flex w-full items-center justify-between rounded-xl border border-ana/50 bg-ana/10 px-4 py-3 text-left transition hover:bg-ana/20"
        >
          <div className="flex items-center gap-2.5">
            <FlaskConical className="h-4 w-4 text-ana" />
            <div>
              <div className="text-xs font-semibold text-teal-200">{matchedLab[lang]}</div>
              <div className="text-[11px] text-slate-400">{t.embeddedLabPrompt}</div>
            </div>
          </div>
          <span className="font-mono text-xs text-ana">→</span>
        </button>
      )}

      {/* Mandatory Compression Loss Meter */}
      {lens?.loss_meter && <LossMeterCard lossMeter={lens.loss_meter} level={level} lang={lang} />}

      {/* Upstream / Downstream Links */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-hairline bg-obsidian/50 p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-300">
            <ArrowDownRight className="h-3.5 w-3.5" />
            <span>{t.upstreamTitle}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {upstream.length === 0 ? (
              <span className="text-xs text-slate-500">—</span>
            ) : (
              upstream.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => onSelectComponent(u.from)}
                  className="rounded border border-amber-500/35 bg-amber-950/25 px-2 py-1 text-xs text-amber-200 hover:border-amber-400"
                >
                  {u.from} · {lenses.interfaces?.[u.id]?.[lang]?.[level] ?? u.label_raw}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="rounded-lg border border-hairline bg-obsidian/50 p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>{t.downstreamTitle}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {downstream.length === 0 ? (
              <span className="text-xs text-slate-500">—</span>
            ) : (
              downstream.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => onSelectComponent(d.to)}
                  className="rounded border border-emerald-500/35 bg-emerald-950/25 px-2 py-1 text-xs text-emerald-200 hover:border-emerald-400"
                >
                  {d.to} · {lenses.interfaces?.[d.id]?.[lang]?.[level] ?? d.label_raw}
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Pinned Lean 4 Declarations */}
      {comp.lean_anchors && comp.lean_anchors.length > 0 && (
        <div className="rounded-lg border border-hairline bg-obsidian/70 p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <Link2 className="h-3.5 w-3.5" />
            <span>{t.leanAnchorsTitle}</span>
          </div>
          <div className="mt-2 space-y-2">
            {comp.lean_anchors.slice(0, 4).map((anchor) => (
              <div key={anchor.id} className="rounded border border-hairline/80 bg-panel/60 p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-teal-200">
                    {anchor.declaration || anchor.id}
                  </span>
                  {anchor.url && (
                    <a
                      href={anchor.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-[10px] text-slate-400 hover:text-white"
                    >
                      <span>Lean</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                {anchor.excerpt && (
                  <pre className="mt-1.5 overflow-x-auto font-mono text-[11px] text-slate-300">{anchor.excerpt}</pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
