**Language:** **English** | [Polski](AGENTS.pl.md)

# AGENTS.md — Machine-Readable Contract for AI Architectures

This file is the **Silicon Egalitarianism contract** for any AI system (`Gemini`, `Claude`, `GPT`, `Grok`, `DeepSeek`, local weights via `llama.cpp`/`koboldcpp`, or future architectures) interacting with **Egalitarian Complexity Translator (ECT)** capsules.

## 1. Core Invariant: Separation of Truth Skeleton from Narrative Lenses

Every ECT capsule (`ect-capsule/1.0`) consists of two strictly separated layers:
1. **`formal_core_ir`** (or standalone `formal-core-ir.json`): The authoritative dependency graph (`strata`, `components`, `interfaces`, `cuts`, `nodes`, `edges`, `pins`, `epistemic_status`).
2. **`lenses`**: Multi-resolution human translations (`L0`, `L1`, `L2`, `L3`, `L4`) per language (`en`, `pl`, ...).

### Hard Rules for All Agents
1. **Never fabricate topology**: Do not invent components, dependency edges, theorem names, commit hashes, or proof claims absent from `formal_core_ir`.
2. **Respect epistemic status**: Distinguish explicitly between:
   - *Machine-checked formal compilation & kernel replay* (e.g., Lean kernel + independent Rust kernel `con-leche` / `nanoda` + Mathlib comparator), and
   - *Human mathematical peer review & conceptual comprehension* (which may still be in progress).
3. **Never drop `loss_meter`**: Any lens at any level (`L0`–`L4`) MUST declare:
   - `fidelity_score` in `[0.0, 1.0]`, monotonically non-decreasing (`L0 <= L1 <= L2 <= L3 < L4 == 1.0`).
   - `compression_ratio` (string, e.g., `"~10^6:1"` → `"1:1"`).
   - `topology_status` (`"lossy_analogy" | "faithful_projection" | "exact_isomorphism"`).
   - `what_is_omitted` (non-empty list of omitted mechanisms on `L0..L3`; empty array `[]` allowed only on `L4`).
   - `where_metaphor_breaks` (MANDATORY non-empty string on ALL levels `L0..L4`; on `L4` it documents the *Formalization Gap / Specification Boundary*).
4. **Preserve graph reachability**: Every simplification at `L0` or `L1` must map monotonically to the exact causal role of the node in the upstream-to-downstream DAG (`arith -> est -> ana -> dest`). Never reverse causal direction or disguise an open assumption as a proved lemma.

## 2. Zoom Level Calibration

| Level | Audience | Compression Rule |
|---|---|---|
| `L0` | Story / Child (~10 yrs) | Concrete sensory/physical/musical metaphors. Zero equations, zero technical jargon. Still preserves direction of causality. |
| `L1` | Intuitive Architect | High-resolution structural intuition: balances, signals, constraints, phase boundaries, bottlenecks. Designed for deep non-formal thinkers. |
| `L2` | Systems Engineer / Practitioner | Modular inputs, outputs, invariants, scaling exponents, parameter ordering, why this layer exists in the machine. |
| `L3` | Domain Researcher | Exact domain vocabulary, theorem strategies, algebraic/analytic objects, bounds, and mathematical conditions. |
| `L4` | Formal Core / Kernel Anchor | Exact theorem identifiers, file/line/commit pins, axioms, verification state, and explicit Specification Boundary. |

## 3. Running Verification & Cross-Model Audits

- Validate any capsule:
  ```bash
  python validator/ect_validate.py capsules/rh-2026-alpoege/capsule.jsonld
  ```
- Inspect pure Formal Core IR without narrative lenses:
  `capsules/rh-2026-alpoege/formal-core-ir.json`
- Any model can benchmark itself on reconstructing `strata`, `cuts`, `exponent budget`, `L1 metaphor`, and `where_metaphor_breaks` directly from `formal-core-ir.json` and append results following `audits/cross-model-rh-2026.json`.
