import React, { useState } from "react";
import { AlertTriangle, GitMerge } from "lucide-react";
import { Language } from "../../types/ect";

interface ThetaChainLabProps {
  lang: Language;
}

export const ThetaChainLab: React.FC<ThetaChainLabProps> = ({ lang }) => {
  const [log10X, setLog10X] = useState<number>(6);
  const xVal = Math.pow(10, log10X);
  const chainLength = Math.round(Math.sqrt(xVal));
  const displayLinks = Math.min(18, Math.max(4, Math.round(log10X * 1.5)));

  return (
    <div className="rounded-xl border border-arith/30 bg-panel p-4">
      <div className="flex items-center gap-2">
        <GitMerge className="h-4 w-4 text-arith" />
        <h3 className="font-serif text-lg font-medium text-white">
          {lang === "pl" ? "Most Stiepanowa → Łańcuch Podniesień Theta" : "Stepanov Bridge → Unitary Theta-Lift Chain"}
        </h3>
      </div>
      <p className="mt-1 text-xs text-slate-400">
        {lang === "pl"
          ? "Nad ciałami skończonymi wielomian potrafi znikać z dużą krotnością przez różniczkowanie. Nad Z nie ma pochodnej — więc zastępuje ją łańcuch √x podniesień theta na grupach unitarnych."
          : "Over finite fields a polynomial vanishes with high multiplicity via derivatives. Over Z there is no derivative — so a chain of √x unitary theta lifts acts as its surrogate."}
      </p>

      <div className="mt-4 rounded-lg border border-hairline bg-obsidian/70 p-3">
        <label className="flex flex-col gap-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-300">
              {lang === "pl" ? "Skala sumy von Mangoldta (X = 10^k):" : "Prime sum scale (X = 10^k):"}
            </span>
            <span className="font-mono font-semibold text-arith">
              X = 10^{log10X} &nbsp;|&nbsp; √X ≈ {chainLength.toLocaleString("en-US")} {lang === "pl" ? "kroków" : "lifts"}
            </span>
          </div>
          <input
            type="range"
            min={2}
            max={12}
            step={1}
            value={log10X}
            onChange={(e) => setLog10X(Number(e.target.value))}
            className="h-2 cursor-pointer accent-orange-500"
          />
        </label>

        {/* Side-by-side comparison */}
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-slate-700/70 bg-[#080d10] p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {lang === "pl" ? "1. Pierwowzór: F_q (Stiepanow 1969)" : "1. Blueprint: F_q (Stepanov 1969)"}
            </div>
            <p className="mt-1 text-xs text-slate-300">
              {lang === "pl"
                ? "Jeden wielomian pomocniczy P(T) z krotnością znikania rzędu √X mierzoną zwykłymi pochodnymi."
                : "Single auxiliary polynomial P(T) whose vanishing multiplicity ~√X is measured by literal derivatives."}
            </p>
            <div className="mt-3 flex items-center gap-2 font-mono text-xs text-slate-300">
              <span className="rounded border border-slate-600 bg-slate-800/80 px-2 py-1">P(x) = ∂¹ = … = ∂^M = 0</span>
            </div>
          </div>

          <div className="rounded-lg border border-arith/40 bg-[#080d10] p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-arith">
              {lang === "pl" ? "2. Przeniesienie nad Z (Alpöge–Claude)" : "2. Lift over Z (Alpöge–Claude)"}
            </div>
            <p className="mt-1 text-xs text-slate-300">
              {lang === "pl"
                ? `Łańcuch ${chainLength.toLocaleString("en-US")} podniesień theta na grupach unitarnych z wieżą Behrenda przeciw krótkim kolizjom.`
                : `Chain of ${chainLength.toLocaleString("en-US")} unitary-group theta lifts on a Behrend collision-free CM tower.`}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-1">
              {Array.from({ length: displayLinks }).map((_, idx) => (
                <React.Fragment key={idx}>
                  <span className="h-3 w-3 rounded-sm border border-arith/70 bg-arith/30" />
                  {idx < displayLinks - 1 && <span className="text-[10px] text-slate-500">→</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-500/35 bg-amber-950/25 p-2.5 text-xs text-amber-100/90">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
        <span>
          {lang === "pl"
            ? "Granica metafory: łańcuch podniesień theta NIE jest różniczkowaniem liczb całkowitych — działa wyłącznie przez nierówności podzielności, nachyleń i kowolumenów oraz kontrolę kohomologii (eD = 2, eL = 0)."
            : "Fracture boundary: a theta-lift chain is NOT literal integer differentiation — it works strictly via divisibility, slope, and covolume inequalities coupled to cohomology windows (eD = 2, eL = 0)."}
        </span>
      </div>
    </div>
  );
};
