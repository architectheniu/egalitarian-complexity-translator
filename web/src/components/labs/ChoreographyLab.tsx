import React, { useState } from "react";
import { Lock, SlidersHorizontal } from "lucide-react";
import { Language } from "../../types/ect";

interface ChoreographyLabProps {
  lang: Language;
}

export const ChoreographyLab: React.FC<ChoreographyLabProps> = ({ lang }) => {
  const [beta, setBeta] = useState<number>(0.68);
  const eD = 2;
  const eL = 0;

  // Quantifier order: beta given -> choose theta = (0.5 + beta) / 2 -> choose eps = (theta - 0.5) / 11
  const theta = (0.5 + beta) / 2;
  const epsilon = Math.max(0.0005, (theta - 0.5) / 11);
  const effectiveExp = 0.5 + (eD + eL + 7) * epsilon; // 0.5 + 9*epsilon

  const toPct = (v: number) => Math.min(100, Math.max(0, ((v - 0.48) / 0.45) * 100));

  return (
    <div className="rounded-xl border border-est/30 bg-panel p-4">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-est" />
        <h3 className="font-serif text-lg font-medium text-white">
          {lang === "pl" ? "Choreografia Wykładników: Pułapka β → θ → ε" : "Exponent Choreography: The β → θ → ε Trap"}
        </h3>
      </div>
      <p className="mt-1 text-xs text-slate-400">
        {lang === "pl"
          ? "Dlaczego dowód nigdy nie potrzebuje ε = 0? Bo najpierw natura wskazuje ewentualne złe zero β > 0,5, potem my dobieramy sufit θ, a na końcu wystarczająco małe ε > 0."
          : "Why is ε = 0 never needed? Because an opponent fixes rogue β > 0.5 first, then we choose ceiling θ ∈ (0.5, β), and only last pick ε > 0 small enough."}
      </p>

      <div className="mt-4 rounded-lg border border-hairline bg-obsidian/70 p-3">
        <label className="flex flex-col gap-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-300">
              {lang === "pl" ? "1. Przeciwnik stawia fałszywe zero β > 0,5:" : "1. Adversary picks rogue zero β > 0.5:"}
            </span>
            <span className="font-mono font-bold text-orange-300">β = {beta.toFixed(3)}</span>
          </div>
          <input
            type="range"
            min={0.515}
            max={0.9}
            step={0.005}
            value={beta}
            onChange={(e) => setBeta(Number(e.target.value))}
            className="h-2 cursor-pointer accent-orange-400"
          />
        </label>

        {/* Visual inequality ruler */}
        <div className="mt-5">
          <div className="relative h-10 rounded-lg border border-hairline bg-[#080d10]">
            {/* Critical line 0.5 */}
            <div className="absolute top-0 bottom-0 w-0.5 bg-emerald-400" style={{ left: `${toPct(0.5)}%` }} />
            {/* Effective bound 0.5 + 9 eps */}
            <div className="absolute top-0 bottom-0 w-0.5 bg-teal-400" style={{ left: `${toPct(effectiveExp)}%` }} />
            {/* Chosen ceiling theta */}
            <div className="absolute top-0 bottom-0 w-0.5 bg-amber-400" style={{ left: `${toPct(theta)}%` }} />
            {/* Rogue zero beta */}
            <div className="absolute top-0 bottom-0 w-1 bg-orange-500" style={{ left: `${toPct(beta)}%` }} />

            {/* Fill gap */}
            <div
              className="absolute top-2 bottom-2 rounded bg-teal-500/20"
              style={{
                left: `${toPct(0.5)}%`,
                width: `${Math.max(1, toPct(effectiveExp) - toPct(0.5))}%`,
              }}
            />
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
            <div className="rounded border border-emerald-500/30 bg-emerald-950/20 p-2">
              <div className="text-[10px] text-slate-400">{lang === "pl" ? "Linia krytyczna" : "Critical Line"}</div>
              <div className="font-mono font-semibold text-emerald-300">0.5000</div>
            </div>
            <div className="rounded border border-teal-500/30 bg-teal-950/20 p-2">
              <div className="text-[10px] text-slate-400">0.5 + (eD+eL+7)ε</div>
              <div className="font-mono font-semibold text-teal-300">{effectiveExp.toFixed(4)}</div>
            </div>
            <div className="rounded border border-amber-500/30 bg-amber-950/20 p-2">
              <div className="text-[10px] text-slate-400">{lang === "pl" ? "2. Wybór θ" : "2. Choose θ"}</div>
              <div className="font-mono font-semibold text-amber-300">{theta.toFixed(4)}</div>
            </div>
            <div className="rounded border border-orange-500/30 bg-orange-950/20 p-2">
              <div className="text-[10px] text-slate-400">3. ε &gt; 0</div>
              <div className="font-mono font-semibold text-orange-300">{epsilon.toFixed(5)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-lg border border-hairline bg-obsidian/60 px-3 py-2 font-mono text-xs text-slate-200">
        <Lock className="h-3.5 w-3.5 shrink-0 text-dest" />
        <span>
          eD = {eD}, eL = {eL} ⇒ 0.5 + 9·({epsilon.toFixed(5)}) = {effectiveExp.toFixed(4)} &lt; θ ({theta.toFixed(4)}) &lt; β ({beta.toFixed(3)})
        </span>
      </div>
    </div>
  );
};
