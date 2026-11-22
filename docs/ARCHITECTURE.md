**Language:** **English** | [Polski](ARCHITECTURE.pl.md)

# Technical Architecture: Egalitarian Complexity Translator (ECT v1.0)

This document details the engineering internals of ECT — from deterministic Formal Core IR ingestion and Topology Preservation validation to the real-time Audiovisual Semantic Microscope.

---

## 1. Ingestion & Capsule Assembly Pipeline (`pipeline/`)

1. **`pipeline/ingest_riemann_2026.py`**  
   Fetches pinned upstream artifacts:
   - `nasqret/riemann-rev/data/model.json` (`riemann-rev-model/1`, 0BSD): 4 strata, 14 architectural components, 14 formal interfaces, 2 global cuts, 109 Lean nodes, 113 edges, 5 itineraries, and verification records.
   - `nasqret/riemann-proof-atlas/evidence/subjects.json` (0BSD): arXiv subject footprint across 647,905 declarations reachable from `riemannHypothesis`.
   - `leanprover-community/riemann-hypothesis`: verbatim `Challenge.lean`, `Main.lean`, and `Statements.lean` (pinned baseline commit `40e56bab026552e089d7afcfeff08d2defb9c005`).

   Produces `capsules/rh-2026-alpoege/formal-core-ir.json` and `sources-manifest.json` with SHA-256 checksums.

2. **`pipeline/generate_lenses.py`**  
   Drives multi-batch structured generation of bilingual (`en`, `pl`) `L0`–`L4` lenses via `claude-opus-5-5` anchored strictly to `formal-core-ir.json`, creating:
   - `lenses/strata-cuts-interfaces.json`
   - `lenses/components-arith-est.json`
   - `lenses/components-ana-dest.json`

3. **`pipeline/build_capsule.py`**  
   Merges Formal Core IR and modular lens files into portable JSON-LD (`capsules/rh-2026-alpoege/capsule.jsonld`) and mirrors runtime payloads to `web/public/data/`.

---

## 2. Schema & 8-Law Topology Validator (`validator/`)

`validator/ect_validate.py` validates capsules against `spec/ect-capsule.schema.json` (JSON Schema Draft 2020-12) and enforces all 8 Topology Preservation Laws (`spec/TOPOLOGY-LAWS.md`):
- Bilingual completeness across all strata, components, cuts, interfaces, and itineraries.
- Monotonic fidelity (`0 < L0 <= L1 <= L2 <= L3 < L4 == 1.0`).
- Mandatory `where_metaphor_breaks` on every level (`L0`–`L4`) and non-empty `what_is_omitted` on `L0`–`L3`.
- Exact calibration of `topology_status` (`exact_isomorphism` restricted to `L4`).
- Directed Acyclic Graph (DAG) acyclicity via Kahn's algorithm and reachability from every supply root to `endpoints`.

The same 8-Law logic is mirrored in TypeScript inside `web/src/utils/capsuleValidator.ts` so user-uploaded `.capsule.jsonld` files undergo live verification directly in the browser.

---

## 3. Cross-Model Silicon Egalitarianism Audit (`audits/`)

`audits/run_cross_model_audit.py` strips ALL human narrative lenses from `formal-core-ir.json` and challenges independent AI models (`Gemini 4 Neon`, `Claude Opus 5.5`, `Claude Fable 5.2`, `Claude Fable 5.1`) with `--tools ""` to reconstruct:
- 4-stratum DAG ordering (`arith -> est -> ana -> dest`)
- Both global cuts (`cut-zeta`, `cut-dirichlet`)
- Exact loss exponent algebra ($e_D=2, e_L=0 \implies \frac{1}{2}+9\varepsilon \le \theta$)
- Bilingual `L1` intuitive synthesis
- Explicit machine-vs-human verification distinction and Stepanov-to-theta-lift metaphor breakdown

---

## 4. Audiovisual Semantic Microscope (`web/`)

Built with Vite + React + TypeScript + Tailwind CSS (no external audio assets or runtime backend):
- **Borwein Accelerated Zeta Evaluator (`src/math/zeta.ts`)**: Computes $|\zeta(\sigma + it)|$ across $t \in [10, 45]$ using 38-term float64-safe Borwein recurrence ($\sim 10^{-7}$ accuracy at nontrivial zeros).
- **Sieve of Eratosthenes Prime Window (`src/math/zeta.ts`)**: Evaluates actual $\psi(y) - y$ fluctuations across $[Y, Y^{3/2}]$ against $C y^\theta$ and visualizes off-line rogue zero contradictions.
- **Pure Web Audio Synthesis (`src/audio/soundEngine.ts`)**: Generates harmonic zoom chords (`L0`–`L4`), stratum focus tones, crystalline zero chimes vs. off-line beating dissonance in *Zeta Symphony*, ceiling-breach warnings, and optional `SpeechSynthesis` narration (`pl-PL` / `en-US`) for *The Architect's Path* auto-tour.
