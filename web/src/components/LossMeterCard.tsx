import React from "react";
import { AlertTriangle, Gauge, Layers } from "lucide-react";
import { Language, LossMeter, ZoomLevel } from "../types/ect";
import { UI_STRINGS } from "../i18n/ui";

interface LossMeterCardProps {
  lossMeter: LossMeter;
  level: ZoomLevel;
  lang: Language;
}

export const LossMeterCard: React.FC<LossMeterCardProps> = ({ lossMeter, level, lang }) => {
  const t = UI_STRINGS[lang];
  const pct = Math.round(lossMeter.fidelity_score * 100);

  const badgeTone =
    lossMeter.topology_status === "exact_isomorphism"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
      : lossMeter.topology_status === "faithful_projection"
        ? "bg-teal-500/15 text-teal-300 border-teal-500/40"
        : "bg-amber-500/15 text-amber-300 border-amber-500/40";

  return (
    <div className="rounded-xl border border-amber-500/30 bg-[#0d1418] p-4 shadow-inner">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline pb-3">
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
            {t.lossMeterTitle} ({level})
          </span>
        </div>
        <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${badgeTone}`}>
          {t.statusNames[lossMeter.topology_status]}
        </span>
      </div>

      {/* Fidelity & Compression bar */}
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{t.fidelityLabel}</span>
            <span className="font-mono font-semibold text-slate-100">{pct}%</span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-arith via-est to-dest transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <div className="flex flex-col justify-center rounded-lg border border-hairline/80 bg-panel/70 px-3 py-1.5">
          <span className="text-[11px] text-slate-400">{t.compressionLabel}</span>
          <span className="font-mono text-xs font-semibold text-slate-100">{lossMeter.compression_ratio}</span>
        </div>
      </div>

      {/* Omitted mechanisms */}
      {lossMeter.what_is_omitted.length > 0 && (
        <div className="mt-3">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            <Layers className="h-3.5 w-3.5 text-slate-400" />
            <span>{t.omittedLabel}</span>
          </div>
          <ul className="mt-1.5 space-y-1 text-xs text-slate-300">
            {lossMeter.what_is_omitted.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Mandatory Fracture Honesty Box */}
      <div className="mt-3 rounded-lg border border-amber-500/40 bg-amber-950/30 p-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
          <span>{t.breaksLabel}</span>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-amber-100/90">{lossMeter.where_metaphor_breaks}</p>
      </div>
    </div>
  );
};
