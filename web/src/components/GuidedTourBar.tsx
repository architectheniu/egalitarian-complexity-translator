import React from "react";
import { ChevronLeft, ChevronRight, Compass, Pause, Play, Sparkles, Volume2, VolumeX } from "lucide-react";
import { GuidedItinerary, Language, ZoomLevel } from "../types/ect";
import { UI_STRINGS } from "../i18n/ui";

interface GuidedTourBarProps {
  itineraries: GuidedItinerary[];
  activeItineraryId: string;
  stepIndex: number;
  autoPlaying: boolean;
  narratorEnabled: boolean;
  lang: Language;
  level: ZoomLevel;
  onSelectItinerary: (id: string) => void;
  onStepChange: (nextStep: number) => void;
  onToggleAutoPlay: () => void;
  onToggleNarrator: () => void;
}

export const GuidedTourBar: React.FC<GuidedTourBarProps> = ({
  itineraries,
  activeItineraryId,
  stepIndex,
  autoPlaying,
  narratorEnabled,
  lang,
  level,
  onSelectItinerary,
  onStepChange,
  onToggleAutoPlay,
  onToggleNarrator,
}) => {
  const t = UI_STRINGS[lang];
  const current = itineraries.find((it) => it.id === activeItineraryId) ?? itineraries[0];
  if (!current) return null;

  const loc = current[lang] ?? current.en;
  const totalSteps = current.component_path.length;
  const safeIdx = Math.min(Math.max(0, stepIndex), Math.max(0, totalSteps - 1));
  const stepNote = loc.step_notes?.[safeIdx]?.note_by_level?.[level] ?? loc.question;

  return (
    <div className="rounded-xl border border-hairline bg-panel/90 px-4 py-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-300">
            <Compass className="h-4 w-4" />
            <span>{t.tourHeading}:</span>
          </div>

          <select
            aria-label={t.tourHeading}
            value={current.id}
            onChange={(e) => onSelectItinerary(e.target.value)}
            className="max-w-full rounded-lg border border-hairline bg-obsidian px-3 py-1.5 text-xs font-medium text-slate-100 focus:border-ana focus:outline-none sm:max-w-md"
          >
            {itineraries.map((it) => {
              const title = (it[lang] ?? it.en).title;
              return (
                <option key={it.id} value={it.id}>
                  {it.is_architect_default ? `★ ${title}` : title}
                </option>
              );
            })}
          </select>

          {current.is_architect_default && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-200">
              <Sparkles className="h-3 w-3" />
              {t.architectBadge}
            </span>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onStepChange((safeIdx - 1 + totalSteps) % totalSteps)}
            className="inline-flex items-center gap-1 rounded-lg border border-hairline bg-obsidian/70 px-2.5 py-1.5 text-xs text-slate-200 hover:border-slate-500"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>{t.tourPrev}</span>
          </button>

          <span className="rounded bg-obsidian px-2.5 py-1 font-mono text-xs text-slate-300">
            {t.tourStepOf} {safeIdx + 1}/{totalSteps}
          </span>

          <button
            type="button"
            onClick={() => onStepChange((safeIdx + 1) % totalSteps)}
            className="inline-flex items-center gap-1 rounded-lg border border-hairline bg-obsidian/70 px-2.5 py-1.5 text-xs text-slate-200 hover:border-slate-500"
          >
            <span>{t.tourNext}</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={onToggleAutoPlay}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
              autoPlaying
                ? "border-amber-400/60 bg-amber-500/15 text-amber-200"
                : "border-ana/50 bg-ana/15 text-teal-200 hover:bg-ana/25"
            }`}
          >
            {autoPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span>{autoPlaying ? t.tourPause : t.tourPlay}</span>
          </button>

          <button
            type="button"
            onClick={onToggleNarrator}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition ${
              narratorEnabled
                ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-200"
                : "border-hairline bg-obsidian/60 text-slate-400 hover:text-slate-200"
            }`}
          >
            {narratorEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            <span>{narratorEnabled ? t.narratorOn : t.narratorOff}</span>
          </button>
        </div>
      </div>

      {/* Step commentary banner */}
      <div className="mt-2.5 flex flex-col gap-1 border-t border-hairline/70 pt-2.5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-slate-300">
          <span className="font-semibold text-teal-300">{loc.question}</span>{" "}
          <span className="text-slate-200">— {stepNote}</span>
        </p>
        <div className="flex shrink-0 items-center gap-1 pt-1 sm:pt-0">
          {current.component_path.map((cid, idx) => (
            <button
              key={`${cid}-${idx}`}
              type="button"
              onClick={() => onStepChange(idx)}
              title={cid}
              className={`h-2 rounded-full transition-all ${
                idx === safeIdx ? "w-6 bg-teal-400" : "w-2 bg-slate-600 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
