import React from "react";
import { BarChart3, CheckCircle2, ExternalLink, FileCode2, ShieldAlert } from "lucide-react";
import { ComplexityCapsule, Language } from "../types/ect";
import { UI_STRINGS } from "../i18n/ui";

interface EpistemicLedgerViewProps {
  capsule: ComplexityCapsule;
  lang: Language;
}

export const EpistemicLedgerView: React.FC<EpistemicLedgerViewProps> = ({ capsule, lang }) => {
  const t = UI_STRINGS[lang];
  const ir = capsule.formal_core_ir;
  const ep = ir.epistemic_status;
  const stats = ep.archive_stats;
  const categories = ep.subjects_footprint?.categories ?? {};

  const sortedCats = Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  const maxCatCount = sortedCats[0]?.[1] ?? 1;

  return (
    <div className="space-y-5">
      {/* Machine Verification vs Human Peer Review */}
      <div className="rounded-xl border border-hairline bg-panel p-5">
        <h2 className="font-serif text-2xl font-semibold text-white">{t.epistemicTitle}</h2>
        <p className="mt-1 text-sm text-teal-300">{ep.headline}</p>
        {ep.detail && <p className="mt-2 text-xs leading-relaxed text-slate-300">{ep.detail}</p>}

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-emerald-500/35 bg-emerald-950/20 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              <span>{t.machineCheckLabel}</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-200">{ep.machine_verification}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="text-[11px] text-slate-400">{t.axiomsLabel}:</span>
              {ep.axioms.map((ax) => (
                <span key={ax} className="rounded border border-emerald-500/30 bg-obsidian px-2 py-0.5 font-mono text-[11px] text-emerald-200">
                  {ax}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-amber-500/35 bg-amber-950/20 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300">
              <ShieldAlert className="h-4 w-4" />
              <span>{t.humanReviewLabel}</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-amber-100/90">{ep.human_review}</p>
            {stats && (
              <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-[11px]">
                <div className="rounded bg-obsidian/80 px-2.5 py-1.5 text-slate-300">
                  {lang === "pl" ? "Pliki" : "Files"}: <span className="text-white">{stats.lean_files.toLocaleString("en-US")}</span>
                </div>
                <div className="rounded bg-obsidian/80 px-2.5 py-1.5 text-slate-300">
                  {lang === "pl" ? "Linie" : "Lines"}: <span className="text-white">{stats.total_lines.toLocaleString("en-US")}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* arXiv Subject Footprint + Pins */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-hairline bg-panel p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
            <BarChart3 className="h-4 w-4 text-ana" />
            <span>{t.subjectsFootprintTitle}</span>
          </div>
          <div className="mt-4 space-y-2.5">
            {sortedCats.map(([cat, count]) => {
              const pct = Math.max(4, Math.round((count / maxCatCount) * 100));
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between font-mono text-xs">
                    <span className="text-slate-200">{cat}</span>
                    <span className="text-teal-300">{count.toLocaleString("en-US")}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-obsidian">
                    <div className="h-full rounded-full bg-gradient-to-r from-arith via-est to-ana" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-hairline bg-panel p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
            <FileCode2 className="h-4 w-4 text-est" />
            <span>{lang === "pl" ? "Piny Kryptograficzne i Lean 4" : "Cryptographic & Lean Pins"}</span>
          </div>
          <div className="mt-3 space-y-2 font-mono text-xs text-slate-300">
            <div className="rounded-lg border border-hairline bg-obsidian/80 p-2.5">
              <span className="text-slate-500">toolchain: </span>
              <span className="text-teal-200">{ir.pins.toolchain}</span>
            </div>
            <div className="rounded-lg border border-hairline bg-obsidian/80 p-2.5 break-all">
              <span className="text-slate-500">mirror_commit: </span>
              <span className="text-amber-200">{ir.pins.mirror_commit}</span>
            </div>
            {ir.pins.archive_sha256 && (
              <div className="rounded-lg border border-hairline bg-obsidian/80 p-2.5 break-all">
                <span className="text-slate-500">archive_sha256: </span>
                <span className="text-slate-200">{ir.pins.archive_sha256}</span>
              </div>
            )}
          </div>

          {capsule.metadata.source_credits && (
            <div className="mt-4 space-y-1.5 border-t border-hairline pt-3">
              {capsule.metadata.source_credits.map((c, idx) => (
                <a
                  key={idx}
                  href={c.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-lg border border-hairline/70 bg-obsidian/50 px-3 py-2 text-xs text-slate-300 hover:border-slate-500 hover:text-white"
                >
                  <span>
                    <strong className="text-slate-100">{c.authors}</strong> — {c.role}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Verbatim Challenge Statements */}
      {ir.challenge_statements?.["Main.lean"] && (
        <div className="rounded-xl border border-hairline bg-panel p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {lang === "pl"
              ? "Main.lean i Challenge.lean (Dosłowne twierdzenia końcowe)"
              : "Main.lean & Challenge.lean (Verbatim Endpoints)"}
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
            <pre className="overflow-x-auto rounded-lg border border-hairline bg-obsidian p-3 font-mono text-[11px] text-emerald-200">
              {ir.challenge_statements["Main.lean"]}
            </pre>
            <pre className="overflow-x-auto rounded-lg border border-hairline bg-obsidian p-3 font-mono text-[11px] text-slate-300">
              {ir.challenge_statements["Challenge.lean"]}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
