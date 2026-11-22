import React, { useState } from "react";
import { Check, Copy, Cpu, Download, Upload, X } from "lucide-react";
import { ComplexityCapsule, CrossModelAuditReport, Language } from "../types/ect";
import { UI_STRINGS } from "../i18n/ui";
import { ClientValidationResult, validateCapsuleClient } from "../utils/capsuleValidator";

interface CrossModelModalProps {
  open: boolean;
  onClose: () => void;
  lang: Language;
  capsule: ComplexityCapsule;
  auditReport: CrossModelAuditReport | null;
  onLoadCapsule: (nextCapsule: ComplexityCapsule) => void;
  onResetCapsule: () => void;
  isCustomCapsule: boolean;
}

export const CrossModelModal: React.FC<CrossModelModalProps> = ({
  open,
  onClose,
  lang,
  capsule,
  auditReport,
  onLoadCapsule,
  onResetCapsule,
  isCustomCapsule,
}) => {
  const t = UI_STRINGS[lang];
  const [copied, setCopied] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<ClientValidationResult | null>(null);

  if (!open) return null;

  const downloadJson = (data: unknown, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyIrPrompt = async () => {
    const irOnly = {
      schema: capsule.formal_core_ir.schema,
      pins: capsule.formal_core_ir.pins,
      strata: capsule.formal_core_ir.strata,
      components: capsule.formal_core_ir.components.map((c) => ({
        id: c.id,
        stratum: c.stratum,
        title: c.title_raw,
        gist: c.gist_raw,
      })),
      interfaces: capsule.formal_core_ir.interfaces,
      cuts: capsule.formal_core_ir.cuts,
    };
    const promptText =
      "Reconstruct the 4-stratum dependency order, global cuts, exponent budget (e_D, e_L), L1 structural metaphor, and exact fracture boundary where the analogy breaks from this stripped OSZP Formal Core IR:\n\n" +
      JSON.stringify(irOnly, null, 2);
    await navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const res = validateCapsuleClient(parsed);
      setUploadStatus(res);
      if (res.valid) {
        onLoadCapsule(parsed as ComplexityCapsule);
      }
    } catch (err) {
      setUploadStatus({
        valid: false,
        errors: [err instanceof Error ? err.message : "Failed to parse JSON"],
        summary: "Parse error",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-hairline bg-panel p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-hairline pb-4">
          <div className="flex items-center gap-3">
            <Cpu className="h-6 w-6 text-ana" />
            <div>
              <h2 className="font-serif text-2xl font-semibold text-white">{t.crossModelTitle}</h2>
              <p className="mt-1 text-xs text-slate-400">{t.crossModelDesc}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-hairline p-1.5 text-slate-400 hover:text-white"
            aria-label={t.closeBtn}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cross-Model Scorecard */}
        {auditReport && (
          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
            {auditReport.models.map((m) => (
              <div key={m.model_id} className="rounded-xl border border-hairline bg-obsidian/80 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-white">{m.model_label}</span>
                  <span className="rounded-full border border-dest/50 bg-dest/15 px-2 py-0.5 font-mono text-xs font-bold text-emerald-300">
                    {m.scores.total_score}/100
                  </span>
                </div>
                <div className="mt-0.5 text-[11px] text-slate-400">{m.provider}</div>
                <div className="mt-3 space-y-1 text-[11px] text-slate-300">
                  {Object.entries(m.scores.dimensions).map(([k, v]) => (
                    <div key={k} className="flex justify-between font-mono">
                      <span className="text-slate-400">{k.replace(/_/g, " ")}</span>
                      <span className="text-teal-300">{v}/20</span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 border-t border-hairline/70 pt-2 text-xs leading-relaxed text-slate-300">
                  {lang === "pl" ? m.reconstruction.l1_intuitive_synthesis_pl : m.reconstruction.l1_intuitive_synthesis_en}
                </p>
                <div className="mt-2 rounded border border-amber-500/30 bg-amber-950/20 p-2 text-[11px] text-amber-200/90">
                  <strong className="text-amber-300">{lang === "pl" ? "Granica Stiepanowa: " : "Stepanov limit: "}</strong>
                  {m.reconstruction.where_stepanov_metaphor_breaks}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Portability & Downloads */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-hairline bg-obsidian/70 p-4">
            <h3 className="text-sm font-semibold text-white">{t.uploadTitle}</h3>
            <p className="mt-1 text-xs text-slate-400">{t.uploadDesc}</p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-ana/50 bg-ana/15 px-3 py-2 text-xs font-semibold text-teal-200 hover:bg-ana/25">
                <Upload className="h-4 w-4" />
                <span>{t.uploadDrop}</span>
                <input type="file" accept=".json,.jsonld" onChange={handleFileUpload} className="hidden" />
              </label>

              {isCustomCapsule && (
                <button
                  type="button"
                  onClick={() => {
                    onResetCapsule();
                    setUploadStatus(null);
                  }}
                  className="rounded-lg border border-hairline px-3 py-2 text-xs text-slate-300 hover:text-white"
                >
                  {t.resetDefaultBtn}
                </button>
              )}
            </div>

            {uploadStatus && (
              <div
                className={`mt-3 rounded-lg border p-2.5 text-xs ${
                  uploadStatus.valid
                    ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-200"
                    : "border-red-500/40 bg-red-950/30 text-red-200"
                }`}
              >
                <div className="font-semibold">{uploadStatus.summary}</div>
                {uploadStatus.errors.slice(0, 4).map((e, idx) => (
                  <div key={idx} className="mt-1 font-mono text-[11px]">
                    • {e}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-hairline bg-obsidian/70 p-4">
            <div>
              <h3 className="text-sm font-semibold text-white">
                {lang === "pl" ? "Eksport OSZP i Test Krzemu" : "OSZP Export & Silicon Check"}
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                {lang === "pl"
                  ? "Pobierz całą kapsułę JSON-LD albo sam oczyszczony Rdzeń Formalny IR i przetestuj go w dowolnym zewnętrznym modelu."
                  : "Export the full JSON-LD capsule or stripped Formal Core IR to inspect or test with any external AI."}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => downloadJson(capsule, `${capsule.id}.capsule.jsonld`)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-panel px-3 py-2 text-xs text-slate-200 hover:border-slate-400"
              >
                <Download className="h-3.5 w-3.5" />
                <span>{t.downloadCapsule}</span>
              </button>

              <button
                type="button"
                onClick={() => downloadJson(capsule.formal_core_ir, `${capsule.id}.formal-core-ir.json`)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-panel px-3 py-2 text-xs text-slate-200 hover:border-slate-400"
              >
                <Download className="h-3.5 w-3.5" />
                <span>{t.downloadIr}</span>
              </button>

              <button
                type="button"
                onClick={copyIrPrompt}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-200 hover:bg-amber-500/20"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? t.copiedBtn : t.copyPromptBtn}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
