import React from "react";
import { Microscope } from "lucide-react";
import { Language, LevelMetaEntry, ZOOM_LEVELS, ZoomLevel } from "../types/ect";
import { UI_STRINGS } from "../i18n/ui";

interface ZoomControlBarProps {
  level: ZoomLevel;
  onChange: (next: ZoomLevel) => void;
  levelMeta: Record<ZoomLevel, LevelMetaEntry>;
  lang: Language;
}

export const ZoomControlBar: React.FC<ZoomControlBarProps> = ({ level, onChange, levelMeta, lang }) => {
  const t = UI_STRINGS[lang];
  const idx = ZOOM_LEVELS.indexOf(level);
  const currentMeta = levelMeta[level];

  return (
    <div className="rounded-xl border border-hairline bg-panel/95 px-4 py-3 shadow-lg">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-ana/30 bg-ana/10 text-ana">
            <Microscope className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">{t.zoomHeading}</span>
              <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[11px] text-ana">{level}</span>
            </div>
            <p className="text-xs text-slate-400">{currentMeta?.description?.[lang] ?? t.zoomHint}</p>
          </div>
        </div>

        {/* Continuous slider + 5 clickable pills */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 pr-1">
            <input
              type="range"
              aria-label={t.zoomHeading}
              min={0}
              max={4}
              step={1}
              value={idx}
              onChange={(e) => onChange(ZOOM_LEVELS[Number(e.target.value)])}
              className="h-2 w-32 cursor-pointer accent-teal-400 sm:w-40"
            />
          </div>

          <div className="flex flex-wrap gap-1">
            {ZOOM_LEVELS.map((lvl, i) => {
              const active = lvl === level;
              const meta = levelMeta[lvl];
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => onChange(lvl)}
                  title={`${lvl}: ${meta?.audience?.[lang] ?? ""}`}
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                    active
                      ? "border-ana bg-ana/15 text-teal-200 shadow-sm"
                      : "border-hairline bg-obsidian/60 text-slate-400 hover:border-slate-500 hover:text-slate-200"
                  }`}
                >
                  <span className="font-mono text-[10px] opacity-75">{i + 1}</span>
                  <span>{lvl}</span>
                  <span className="hidden sm:inline">· {meta?.label?.[lang]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
