import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Cpu, ExternalLink, FlaskConical, Globe, Map as MapIcon, ShieldCheck, Volume2, VolumeX } from "lucide-react";
import { ComplexityCapsule, CrossModelAuditReport, Language, ZOOM_LEVELS, ZoomLevel } from "./types/ect";
import { UI_STRINGS } from "./i18n/ui";
import { soundEngine } from "./audio/soundEngine";
import { ZoomControlBar } from "./components/ZoomControlBar";
import { GuidedTourBar } from "./components/GuidedTourBar";
import { ProofTopologyMap } from "./components/ProofTopologyMap";
import { NodeInspector } from "./components/NodeInspector";
import { CriticalLineLab } from "./components/labs/CriticalLineLab";
import { PrimeWindowLab } from "./components/labs/PrimeWindowLab";
import { ChoreographyLab } from "./components/labs/ChoreographyLab";
import { ThetaChainLab } from "./components/labs/ThetaChainLab";
import { CrossModelModal } from "./components/CrossModelModal";
import { EpistemicLedgerView } from "./components/EpistemicLedgerView";

function detectDefaultLang(): Language {
  if (typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("pl")) {
    return "pl";
  }
  return "en";
}

export const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(detectDefaultLang);
  const [level, setLevel] = useState<ZoomLevel>("L1");
  const [activeTab, setActiveTab] = useState<"map" | "labs" | "ledger">("map");
  const [focusedLab, setFocusedLab] = useState<"critical" | "window" | "choreography" | "theta">("critical");
  const [capsule, setCapsule] = useState<ComplexityCapsule | null>(null);
  const [defaultCapsule, setDefaultCapsule] = useState<ComplexityCapsule | null>(null);
  const [isCustomCapsule, setIsCustomCapsule] = useState(false);
  const [auditReport, setAuditReport] = useState<CrossModelAuditReport | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedType, setSelectedType] = useState<"component" | "cut">("component");
  const [selectedId, setSelectedId] = useState<string>("primes");

  const [activeItineraryId, setActiveItineraryId] = useState<string>("architect-path");
  const [tourStep, setTourStep] = useState<number>(0);
  const [autoPlaying, setAutoPlaying] = useState<boolean>(false);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
  const [audioVolume, setAudioVolume] = useState<number>(0.28);
  const [narratorEnabled, setNarratorEnabled] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const t = UI_STRINGS[lang];

  useEffect(() => {
    const base = import.meta.env.BASE_URL;
    Promise.all([
      fetch(`${base}data/capsule.jsonld`).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status} loading capsule.jsonld`);
        return r.json();
      }),
      fetch(`${base}data/cross-model-rh-2026.json`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
    ])
      .then(([capData, auditData]) => {
        const cap = capData as ComplexityCapsule;
        setCapsule(cap);
        setDefaultCapsule(cap);
        setAuditReport(auditData as CrossModelAuditReport | null);
        const firstIt = cap.lenses.itineraries?.[0];
        if (firstIt) {
          setActiveItineraryId(firstIt.id);
          if (firstIt.component_path[0]) setSelectedId(firstIt.component_path[0]);
        }
      })
      .catch((err) => {
        setLoadError(err instanceof Error ? err.message : "Failed to load capsule");
      });
  }, []);

  const currentItinerary = useMemo(() => {
    if (!capsule) return null;
    return (
      capsule.lenses.itineraries.find((it) => it.id === activeItineraryId) ?? capsule.lenses.itineraries[0] ?? null
    );
  }, [capsule, activeItineraryId]);

  const handleZoomChange = useCallback(
    (next: ZoomLevel) => {
      setLevel(next);
      if (audioEnabled) {
        soundEngine.playZoomHarmonic(next);
      }
    },
    [audioEnabled]
  );

  // Keyboard shortcuts 1-5 for Zoom Levels L0-L4
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      if (e.key >= "1" && e.key <= "5") {
        handleZoomChange(ZOOM_LEVELS[Number(e.key) - 1]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleZoomChange]);

  const speakCurrentTourStep = useCallback(
    (itId: string, stepIdx: number, cap: ComplexityCapsule, curLang: Language, curLevel: ZoomLevel) => {
      const it = cap.lenses.itineraries.find((x) => x.id === itId) ?? cap.lenses.itineraries[0];
      if (!it) return;
      const cid = it.component_path[stepIdx];
      const compLens = cap.lenses.components?.[cid]?.[curLang]?.[curLevel];
      const note = it[curLang]?.step_notes?.[stepIdx]?.note_by_level?.[curLevel] ?? "";
      if (compLens) {
        soundEngine.speakStep(`${compLens.title}. ${note}`, curLang);
      }
    },
    []
  );

  const selectTourStep = useCallback(
    (nextIdx: number) => {
      if (!capsule || !currentItinerary) return;
      const clamped = ((nextIdx % currentItinerary.component_path.length) + currentItinerary.component_path.length) % currentItinerary.component_path.length;
      setTourStep(clamped);
      const cid = currentItinerary.component_path[clamped];
      if (cid) {
        setSelectedType("component");
        setSelectedId(cid);
        const comp = capsule.formal_core_ir.components.find((c) => c.id === cid);
        if (audioEnabled && comp) {
          soundEngine.playStratumFocus(comp.stratum);
        }
        if (narratorEnabled) {
          speakCurrentTourStep(currentItinerary.id, clamped, capsule, lang, level);
        }
      }
    },
    [capsule, currentItinerary, audioEnabled, narratorEnabled, lang, level, speakCurrentTourStep]
  );

  // Auto-tour progression
  useEffect(() => {
    if (!autoPlaying || !currentItinerary) return;
    const timer = setInterval(() => {
      selectTourStep(tourStep + 1);
    }, 5500);
    return () => clearInterval(timer);
  }, [autoPlaying, currentItinerary, tourStep, selectTourStep]);

  const handleToggleAudio = () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    soundEngine.setEnabled(next);
  };

  const handleToggleNarrator = () => {
    const next = !narratorEnabled;
    setNarratorEnabled(next);
    if (next && capsule && currentItinerary) {
      if (!audioEnabled) {
        setAudioEnabled(true);
        soundEngine.setEnabled(true);
      }
      speakCurrentTourStep(currentItinerary.id, tourStep, capsule, lang, level);
    } else {
      soundEngine.stopNarration();
    }
  };

  const handleSelectComponent = (id: string) => {
    setSelectedType("component");
    setSelectedId(id);
    if (capsule && audioEnabled) {
      const comp = capsule.formal_core_ir.components.find((c) => c.id === id);
      if (comp) soundEngine.playStratumFocus(comp.stratum);
    }
  };

  const handleSelectCut = (id: string) => {
    setSelectedType("cut");
    setSelectedId(id);
    if (audioEnabled) {
      soundEngine.playZoomHarmonic(level);
    }
  };

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-obsidian p-6 text-center">
        <div className="max-w-md rounded-xl border border-red-500/40 bg-panel p-6">
          <h1 className="font-serif text-xl text-white">Failed to load OSZP Capsule</h1>
          <p className="mt-2 font-mono text-xs text-red-300">{loadError}</p>
        </div>
      </div>
    );
  }

  if (!capsule) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-obsidian text-slate-300">
        <div className="animate-pulse font-mono text-sm">Loading OSZP Capsule…</div>
      </div>
    );
  }

  const titleText = capsule.metadata.title[lang] ?? capsule.metadata.title.en ?? capsule.id;
  const subtitleText = capsule.metadata.subtitle[lang] ?? capsule.metadata.subtitle.en ?? "";

  return (
    <div className="min-h-screen bg-obsidian text-slate-100">
      {/* Top Navigation & Global Controls */}
      <header className="sticky top-0 z-40 border-b border-hairline bg-obsidian/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="rounded border border-ana/40 bg-ana/10 px-2 py-0.5 font-mono text-xs font-bold text-ana">
                ECT / ETZ
              </span>
              <h1 className="font-serif text-lg font-semibold text-white sm:text-xl">{t.brandTitle}</h1>
            </div>
            <p className="text-[11px] text-slate-400">{t.brandSubtitle}</p>
          </div>

          {/* Right Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-panel px-1.5 py-0.5">
              <button
                type="button"
                onClick={handleToggleAudio}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                  audioEnabled
                    ? "bg-dest/20 text-emerald-200"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {audioEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                <span>{audioEnabled ? t.audioOn : t.audioOff}</span>
              </button>
              {audioEnabled && (
                <input
                  type="range"
                  aria-label="Audio volume"
                  min={0.05}
                  max={0.75}
                  step={0.05}
                  value={audioVolume}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setAudioVolume(v);
                    soundEngine.setVolume(v);
                  }}
                  className="mr-1 h-1.5 w-14 cursor-pointer accent-emerald-400"
                />
              )}
            </div>

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-200 hover:bg-amber-500/20"
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>{t.crossModelBtn}</span>
            </button>

            {/* PL | EN Language Switch */}
            <div className="inline-flex rounded-lg border border-hairline bg-panel p-0.5">
              {(["pl", "en"] as Language[]).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLang(code)}
                  className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold uppercase transition ${
                    lang === code ? "bg-ana/20 text-teal-200" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Globe className="h-3 w-3" />
                  {code}
                </button>
              ))}
            </div>

            <a
              href={capsule.metadata.manifesto_links?.[lang] ?? "https://heniu.blog/dziennik/010/"}
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-1 rounded-lg border border-hairline px-2.5 py-1.5 text-xs text-slate-300 hover:border-slate-500 hover:text-white md:inline-flex"
            >
              <span>Log #010</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-[1600px] space-y-4 px-4 py-5 sm:px-6">
        {/* Capsule Banner + Navigation Tabs */}
        <div className="flex flex-col justify-between gap-4 rounded-xl border border-hairline bg-panel/70 p-4 lg:flex-row lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-amber-300">capsule://{capsule.id}</span>
              <span className="rounded bg-obsidian px-2 py-0.5 font-mono text-[10px] text-slate-400">
                {capsule.schema_version}
              </span>
            </div>
            <h2 className="mt-1 font-serif text-xl font-medium text-white sm:text-2xl">{titleText}</h2>
            <p className="mt-0.5 text-xs text-slate-300">{subtitleText}</p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("map")}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                activeTab === "map"
                  ? "border-ana bg-ana/15 text-teal-200"
                  : "border-hairline bg-obsidian/70 text-slate-300 hover:border-slate-500"
              }`}
            >
              <MapIcon className="h-4 w-4" />
              <span>{t.tabMap}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("labs")}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                activeTab === "labs"
                  ? "border-dest bg-dest/15 text-emerald-200"
                  : "border-hairline bg-obsidian/70 text-slate-300 hover:border-slate-500"
              }`}
            >
              <FlaskConical className="h-4 w-4" />
              <span>{t.tabLabs}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("ledger")}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                activeTab === "ledger"
                  ? "border-est bg-est/15 text-amber-200"
                  : "border-hairline bg-obsidian/70 text-slate-300 hover:border-slate-500"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>{t.tabProtocol}</span>
            </button>
          </div>
        </div>

        {/* Continuous Semantic Zoom Bar */}
        <ZoomControlBar
          level={level}
          onChange={handleZoomChange}
          levelMeta={capsule.lenses.level_meta}
          lang={lang}
        />

        {activeTab === "map" && (
          <>
            {currentItinerary && (
              <GuidedTourBar
                itineraries={capsule.lenses.itineraries}
                activeItineraryId={currentItinerary.id}
                stepIndex={tourStep}
                autoPlaying={autoPlaying}
                narratorEnabled={narratorEnabled}
                lang={lang}
                level={level}
                onSelectItinerary={(id) => {
                  setActiveItineraryId(id);
                  setTourStep(0);
                  setAutoPlaying(false);
                  const found = capsule.lenses.itineraries.find((x) => x.id === id);
                  if (found?.component_path[0]) {
                    handleSelectComponent(found.component_path[0]);
                  }
                }}
                onStepChange={selectTourStep}
                onToggleAutoPlay={() => {
                  if (!autoPlaying && !audioEnabled) {
                    handleToggleAudio();
                  }
                  setAutoPlaying((a) => !a);
                }}
                onToggleNarrator={handleToggleNarrator}
              />
            )}

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
              <div className="xl:col-span-7">
                <ProofTopologyMap
                  capsule={capsule}
                  lang={lang}
                  level={level}
                  selectedType={selectedType}
                  selectedId={selectedId}
                  tourPath={currentItinerary?.component_path ?? []}
                  onSelectComponent={handleSelectComponent}
                  onSelectCut={handleSelectCut}
                />
              </div>

              <div className="xl:col-span-5">
                <NodeInspector
                  capsule={capsule}
                  lang={lang}
                  level={level}
                  selectedType={selectedType}
                  selectedId={selectedId}
                  onSelectComponent={handleSelectComponent}
                  onOpenLab={(labId) => {
                    setFocusedLab(labId);
                    setActiveTab("labs");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </div>
            </div>
          </>
        )}

        {activeTab === "labs" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-hairline bg-panel/80 p-4">
              <h2 className="font-serif text-xl font-semibold text-white">{t.labsIntroTitle}</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-300">{t.labsIntroDesc}</p>
            </div>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className={focusedLab === "critical" ? "ring-2 ring-dest/60 rounded-xl" : ""}>
                <CriticalLineLab
                  lang={lang}
                  audioEnabled={audioEnabled}
                  onEnableAudio={() => {
                    setAudioEnabled(true);
                    soundEngine.setEnabled(true);
                  }}
                />
              </div>
              <div className={focusedLab === "window" ? "ring-2 ring-ana/60 rounded-xl" : ""}>
                <PrimeWindowLab
                  lang={lang}
                  audioEnabled={audioEnabled}
                  onEnableAudio={() => {
                    setAudioEnabled(true);
                    soundEngine.setEnabled(true);
                  }}
                />
              </div>
              <div className={focusedLab === "choreography" ? "ring-2 ring-est/60 rounded-xl" : ""}>
                <ChoreographyLab lang={lang} />
              </div>
              <div className={focusedLab === "theta" ? "ring-2 ring-arith/60 rounded-xl" : ""}>
                <ThetaChainLab lang={lang} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "ledger" && <EpistemicLedgerView capsule={capsule} lang={lang} />}
      </main>

      <CrossModelModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        lang={lang}
        capsule={capsule}
        auditReport={auditReport}
        isCustomCapsule={isCustomCapsule}
        onLoadCapsule={(next) => {
          setCapsule(next);
          setIsCustomCapsule(true);
          const firstComp = next.formal_core_ir.components[0]?.id;
          if (firstComp) {
            setSelectedType("component");
            setSelectedId(firstComp);
          }
        }}
        onResetCapsule={() => {
          if (defaultCapsule) {
            setCapsule(defaultCapsule);
            setIsCustomCapsule(false);
          }
        }}
      />
    </div>
  );
};
