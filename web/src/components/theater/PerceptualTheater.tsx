import React, { useState } from "react";
import { ChevronLeft, ChevronRight, HelpCircle, Sparkles, Volume2, VolumeX } from "lucide-react";
import { Language } from "../../types/ect";
import { soundEngine } from "../../audio/soundEngine";
import { Scene1Waves } from "./Scene1Waves";
import { Scene2Mirror } from "./Scene2Mirror";
import { Scene3Detector } from "./Scene3Detector";
import { Scene4SphereChain } from "./Scene4SphereChain";
import { Scene5CheckmateGame } from "./Scene5CheckmateGame";
import { Scene6HonestyReport, SceneRating } from "./Scene6HonestyReport";

interface PerceptualTheaterProps {
  lang: Language;
  audioEnabled: boolean;
  onEnableAudio: () => void;
  onOpenMicroscope: () => void;
}

const SCENE_TABS = [
  { num: 1, pl: "1. Fale", en: "1. Waves" },
  { num: 2, pl: "2. Lustro", en: "2. Mirror" },
  { num: 3, pl: "3. Detektor", en: "3. Detector" },
  { num: 4, pl: "4. Kula", en: "4. Sphere" },
  { num: 5, pl: "5. Gra", en: "5. Duel" },
  { num: 6, pl: "6. Granice", en: "6. Limits" },
];

const SCENE_NARRATION: Record<number, { pl: string; en: string; crackPl: string; crackEn: string }> = {
  1: {
    pl: "Liczby pierwsze nie pojawiają się na ślepo — steruje nimi chór ukrytych fal. Jeśli choć jedna fala stoi na prawo od środka, zaczyna rosnąć jak sprzężenie zwrotne w mikrofonie.",
    en: "Prime numbers are shaped by hidden waves. If even one wave shifts right of center, it grows endlessly like audio feedback.",
    crackPl: "Uproszczenie: fale nie są falami akustycznymi w czasie, lecz składowymi rozkładu na osi liczbowej.",
    crackEn: "Simplification: these waves are analytic components on the number line, not sound waves in air.",
  },
  2: {
    pl: "Ukryte fale występują w lustrzanych parach. Nie da się schować po lewej bez wywołania bliźniaka po prawej, więc wystarczy wyczyścić prawą stronę.",
    en: "Hidden waves come in mirror pairs. Escaping left always creates a runaway twin on the right, so clearing the right side clears both.",
    crackPl: "Uproszczenie: lustro to algebraiczna symetria równania funkcyjnego, nie odbicie światła.",
    crackEn: "Simplification: the mirror comes from a functional equation symmetry, not physical reflection.",
  },
  3: {
    pl: "Dwa potwory mogłyby się nawzajem wyciszyć w zwykłym pokoju. Dowód włącza detektor jednokierunkowy, który tylko dodaje głośność, dzięki czemu żadna fala na prawo nie ukryje się pod sufitem.",
    en: "Two monsters could cancel out normally. The proof switches on a one-way additive detector so no off-center wave can hide beneath the ceiling.",
    crackPl: "Uproszczenie: w dowodzie nie ma fizycznego prostownika, lecz dodatnio ważone rodziny wyrazów i bieguny transformaty.",
    crackEn: "Simplification: mathematically this uses positive weights across character families and residue poles.",
  },
  4: {
    pl: "Zamiast naciskać jeden twardy kamień tysiąc razy jak w plastelinie, przełom z 2026 roku łączy tysiące ogniw na kuli, gdzie prosta linia nigdy nie zderzy trzech kulek naraz.",
    en: "Instead of pressing deep into hard stone, the 2026 breakthrough links thousands of small steps on a sphere where a straight ray can never hit three beads at once.",
    crackPl: "Uproszczenie: kulki na okręgu odpowiadają punktom zakodowanym dużym systemem liczbowym oraz długim łańcuchom operacji symetrii.",
    crackEn: "Simplification: the sphere beads correspond to radix-encoded integer vectors feeding a long chain of symmetry lifts.",
  },
  5: {
    pl: "W tej grze 1 na 1 najpierw rusza się Natura i stawia falę w jakiejś odległości od linii równowagi. Dopiero potem dowód wsuwa dach w połowę tej luki i zamyka potwora w pułapce.",
    en: "In this duel, Nature moves first and hides a wave at some positive distance. Only afterward does the proof slide a roof to half that gap and trap it.",
    crackPl: "Uproszczenie: w prawdziwym dowodzie dach musi utrzymać się jednocześnie w całym szerokim oknie liczb, nie w jednym punkcie.",
    crackEn: "Simplification: in the actual proof the ceiling bound must hold across an entire wide interval of numbers.",
  },
  6: {
    pl: "Każdy obraz ma granicę, w której zaczyna pękać. Oceń, które sceny kliknęły, albo zajrzyj pod maskę do Mikroskopu Badacza.",
    en: "Every metaphor has a fracture line. Review what clicked for you or step under the hood into the Researcher Microscope.",
    crackPl: "",
    crackEn: "",
  },
};

export const PerceptualTheater: React.FC<PerceptualTheaterProps> = ({
  lang,
  audioEnabled,
  onEnableAudio,
  onOpenMicroscope,
}) => {
  const [scene, setScene] = useState<number>(1);
  const [ratings, setRatings] = useState<Record<number, SceneRating>>({});
  const [showCrack, setShowCrack] = useState<boolean>(false);
  const [speaking, setSpeaking] = useState<boolean>(false);

  const info = SCENE_NARRATION[scene];

  const handleToggleSpeech = () => {
    if (speaking) {
      soundEngine.stopNarration();
      setSpeaking(false);
    } else {
      if (!audioEnabled) onEnableAudio();
      soundEngine.speakStep(info[lang], lang);
      setSpeaking(true);
    }
  };

  const goScene = (next: number) => {
    soundEngine.stopNarration();
    setSpeaking(false);
    setShowCrack(false);
    setScene(Math.min(6, Math.max(1, next)));
  };

  const setRating = (val: SceneRating) => {
    setRatings((prev) => ({ ...prev, [scene]: val }));
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      {/* Clean 6-Scene Step Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-hairline bg-panel/90 p-3">
        <div className="flex flex-wrap gap-1.5">
          {SCENE_TABS.map((tab) => {
            const active = scene === tab.num;
            const r = ratings[tab.num];
            return (
              <button
                key={tab.num}
                type="button"
                onClick={() => goScene(tab.num)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "border-ana bg-ana/20 text-teal-100"
                    : "border-hairline bg-obsidian/70 text-slate-400 hover:border-slate-500 hover:text-slate-200"
                }`}
              >
                <span>{tab[lang]}</span>
                {r === "clicked" && <span className="h-2 w-2 rounded-full bg-emerald-400" />}
                {r === "fog" && <span className="h-2 w-2 rounded-full bg-orange-400" />}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleToggleSpeech}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
            speaking
              ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-200"
              : "border-hairline bg-obsidian/70 text-slate-300 hover:text-white"
          }`}
        >
          {speaking ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          <span>{speaking ? (lang === "pl" ? "Zatrzymaj głos" : "Stop Voice") : lang === "pl" ? "Przeczytaj scenę" : "Read Aloud"}</span>
        </button>
      </div>

      {/* Main Theater Stage Card */}
      <div className="rounded-2xl border border-hairline bg-panel p-5 shadow-2xl sm:p-7">
        {scene === 1 && <Scene1Waves lang={lang} audioEnabled={audioEnabled} onEnableAudio={onEnableAudio} />}
        {scene === 2 && <Scene2Mirror lang={lang} audioEnabled={audioEnabled} onEnableAudio={onEnableAudio} />}
        {scene === 3 && <Scene3Detector lang={lang} audioEnabled={audioEnabled} onEnableAudio={onEnableAudio} />}
        {scene === 4 && <Scene4SphereChain lang={lang} audioEnabled={audioEnabled} onEnableAudio={onEnableAudio} />}
        {scene === 5 && <Scene5CheckmateGame lang={lang} audioEnabled={audioEnabled} onEnableAudio={onEnableAudio} />}
        {scene === 6 && (
          <Scene6HonestyReport lang={lang} ratings={ratings} onOpenMicroscope={onOpenMicroscope} />
        )}

        {/* Expandable 1-line honesty footer for Scenes 1-5 */}
        {scene <= 5 && (
          <div className="mt-5 border-t border-hairline/80 pt-4">
            <button
              type="button"
              onClick={() => setShowCrack((s) => !s)}
              className="inline-flex items-center gap-1.5 text-xs text-amber-300/90 hover:text-amber-200"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>
                {lang === "pl" ? "Gdzie ten obraz upraszcza prawdę?" : "Where does this picture simplify?"}
              </span>
            </button>
            {showCrack && (
              <p className="mt-2 rounded-lg border border-amber-500/35 bg-amber-950/25 p-3 text-xs text-amber-100/90">
                {lang === "pl" ? info.crackPl : info.crackEn}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Bottom Calibration Strip + Scene Navigation */}
      <div className="flex flex-col gap-3 rounded-xl border border-hairline bg-panel/90 p-4 sm:flex-row sm:items-center sm:justify-between">
        {scene <= 5 ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-300">
              {lang === "pl" ? "Czy ta scena kliknęła?" : "Did this scene click?"}
            </span>
            <button
              type="button"
              onClick={() => setRating("clicked")}
              className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                ratings[scene] === "clicked"
                  ? "border-emerald-400 bg-emerald-500/20 text-emerald-200"
                  : "border-hairline bg-obsidian/70 text-slate-300 hover:border-emerald-500/60"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{lang === "pl" ? "Kliknęło ✓" : "Clicked ✓"}</span>
            </button>
            <button
              type="button"
              onClick={() => setRating("fog")}
              className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                ratings[scene] === "fog"
                  ? "border-orange-400 bg-orange-500/20 text-orange-200"
                  : "border-hairline bg-obsidian/70 text-slate-300 hover:border-orange-500/60"
              }`}
            >
              <span>{lang === "pl" ? "Nadal mgła ?" : "Still foggy ?"}</span>
            </button>
          </div>
        ) : (
          <span className="text-xs text-slate-400">
            {lang === "pl" ? "Koniec Teatru Poznawczego v2" : "End of Perceptual Theater v2"}
          </span>
        )}

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={scene === 1}
            onClick={() => goScene(scene - 1)}
            className="inline-flex items-center gap-1 rounded-lg border border-hairline bg-obsidian/80 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-slate-500 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>{lang === "pl" ? "Poprzednia" : "Previous"}</span>
          </button>
          <button
            type="button"
            disabled={scene === 6}
            onClick={() => goScene(scene + 1)}
            className="inline-flex items-center gap-1 rounded-lg border border-ana/60 bg-ana/15 px-4 py-2 text-xs font-semibold text-teal-100 hover:bg-ana/25 disabled:opacity-40"
          >
            <span>{lang === "pl" ? "Następna scena" : "Next Scene"}</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
