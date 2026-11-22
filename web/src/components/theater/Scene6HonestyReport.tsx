import React, { useState } from "react";
import { AlertTriangle, Check, Copy, Microscope, ShieldCheck } from "lucide-react";
import { Language } from "../../types/ect";

export type SceneRating = "clicked" | "fog" | null;

interface Scene6HonestyReportProps {
  lang: Language;
  ratings: Record<number, SceneRating>;
  onOpenMicroscope: () => void;
}

const HONESTY_ROWS = [
  {
    scene: 1,
    plTitle: "Scena 1 · Ukryte fale",
    enTitle: "Scene 1 · Hidden waves",
    plCrack: "Liczby pierwsze leżą na dyskretnej osi, a fale mieszkają w świecie liczb zespolonych — to nie drgania powietrza.",
    enCrack: "Primes sit on a discrete number line while the waves live in complex analysis — not acoustic air vibrations.",
  },
  {
    scene: 2,
    plTitle: "Scena 2 · Zwierciadło",
    enTitle: "Scene 2 · Mirror",
    plCrack: "Odbicie paruje wartość po lewej ze sprzężeniem po prawej za sprawą równania funkcyjnego, nie optycznego lustra.",
    enCrack: "The pairing reflects values through a functional equation and conjugation, not a physical mirror beam.",
  },
  {
    scene: 3,
    plTitle: "Scena 3 · Jednokierunkowy detektor",
    enTitle: "Scene 3 · One-way detector",
    plCrack: "Brak znoszenia nie polega na zwykłym module |A|+|B|, lecz na dodatnio ważonej sumie wielu charakterów i biegunach transformaty.",
    enCrack: "Non-cancellation comes from positive-weighted character families and residue poles, not simple |A|+|B| rectification.",
  },
  {
    scene: 4,
    plTitle: "Scena 4 · Kamień i Kula",
    enTitle: "Scene 4 · Stone & Sphere",
    plCrack: "Zamiast fizycznej kuli dowód koduje punkty w ogromnym systemie liczbowym i łączy łańcuch podniesień z kontrolą podzielności i kowolumenu.",
    enCrack: "Instead of a physical ball, points are radix-encoded integers feeding a unitary lift chain governed by divisibility and covolume bounds.",
  },
  {
    scene: 5,
    plTitle: "Scena 5 · Gra z Naturą",
    enTitle: "Scene 5 · Duel with Nature",
    plCrack: "Dach nie zamyka się na jednym punkcie, lecz musi utrzymać się na całych długich przedziałach skali jednocześnie.",
    enCrack: "The ceiling does not trap one point — it must hold uniformly across entire wide scale windows simultaneously.",
  },
];

export const Scene6HonestyReport: React.FC<Scene6HonestyReportProps> = ({
  lang,
  ratings,
  onOpenMicroscope,
}) => {
  const [copied, setCopied] = useState(false);

  const copyFeedbackReport = async () => {
    const lines = [1, 2, 3, 4, 5].map((num) => {
      const r = ratings[num];
      const tag = r === "clicked" ? "KLIKNĘŁO ✓" : r === "fog" ? "NADAL MGŁA ?" : "nieocenione";
      return `- Scena ${num}: ${tag}`;
    });
    const text = `Raport Intuicji Teatru Poznawczego (v2):\n${lines.join("\n")}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div className="max-w-3xl space-y-2">
        <h2 className="font-serif text-2xl font-medium text-white sm:text-3xl">
          {lang === "pl" ? "Scena 6: Uczciwe granice opowieści i Twój raport" : "Scene 6: Where Every Metaphor Breaks + Your Report"}
        </h2>
        <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
          {lang === "pl"
            ? "Zasada żelaznej uczciwości ETZ: nawet najprostsza animacja musi jawnie pokazać, gdzie kończy się podobieństwo, a zaczyna formalizm."
            : "ECT's iron rule of honesty: even the simplest animation must point out cleanly where analogy ends and formal structure takes over."}
        </p>
      </div>

      {/* Epistemic Truth Strip */}
      <div className="flex items-start gap-3 rounded-xl border border-emerald-500/35 bg-emerald-950/20 p-4 text-xs text-slate-200">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
        <div>
          <strong className="text-emerald-300">
            {lang === "pl" ? "Stan na dziś: " : "Current verification state: "}
          </strong>
          {lang === "pl"
            ? "17,37 mln linii w Lean 4 zostało skompilowanych i zaakceptowanych przez dwa niezależne programy-sędziów (jądra weryfikujące) pod 3 standardowymi aksjomatami; ludzka recenzja matematyczna w świecie akademickim nadal trwa."
            : "17.37M lines of Lean 4 compiled and passed two independent verifier kernels under 3 standard axioms; traditional human peer review remains ongoing."}
        </div>
      </div>

      {/* Where each metaphor breaks */}
      <div className="space-y-2">
        {HONESTY_ROWS.map((row) => (
          <div
            key={row.scene}
            className="flex flex-col gap-2 rounded-xl border border-hairline bg-obsidian/70 p-3.5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="text-xs font-semibold text-amber-300">{lang === "pl" ? row.plTitle : row.enTitle}</div>
              <div className="mt-1 flex items-start gap-2 text-xs text-slate-300">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                <span>{lang === "pl" ? row.plCrack : row.enCrack}</span>
              </div>
            </div>
            <span
              className={`shrink-0 self-start rounded-full border px-2.5 py-0.5 text-[11px] font-semibold sm:self-center ${
                ratings[row.scene] === "clicked"
                  ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-200"
                  : ratings[row.scene] === "fog"
                    ? "border-orange-500/50 bg-orange-500/15 text-orange-200"
                    : "border-hairline bg-panel text-slate-400"
              }`}
            >
              {ratings[row.scene] === "clicked"
                ? lang === "pl"
                  ? "Kliknęło ✓"
                  : "Clicked ✓"
                : ratings[row.scene] === "fog"
                  ? lang === "pl"
                    ? "Nadal mgła ?"
                    : "Still foggy ?"
                  : lang === "pl"
                    ? "Nieocenione"
                    : "Unrated"}
            </span>
          </div>
        ))}
      </div>

      {/* Calibration Report & Enter Microscope CTA */}
      <div className="flex flex-col gap-3 rounded-xl border border-hairline bg-panel p-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={copyFeedbackReport}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-400/50 bg-amber-500/15 px-4 py-2.5 text-xs font-semibold text-amber-200 hover:bg-amber-500/25"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          <span>
            {copied
              ? lang === "pl"
                ? "Skopiowano raport!"
                : "Report copied!"
              : lang === "pl"
                ? "Kopiuj raport intuicji (Sceny 1–5)"
                : "Copy Perceptual Calibration Report"}
          </span>
        </button>

        <button
          type="button"
          onClick={onOpenMicroscope}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-ana/60 bg-ana/20 px-4 py-2.5 text-xs font-semibold text-teal-100 hover:bg-ana/30"
        >
          <Microscope className="h-4 w-4" />
          <span>
            {lang === "pl"
              ? "Wejdź pod maskę: Mikroskop Badacza (14 węzłów · L0–L4 · Lean 4)"
              : "Under the Hood: Researcher Microscope (14 nodes · L0–L4 · Lean 4)"}
          </span>
        </button>
      </div>
    </div>
  );
};
