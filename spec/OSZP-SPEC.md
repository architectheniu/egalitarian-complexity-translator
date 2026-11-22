**Language:** **English** | [Polski](OSZP-SPEC.pl.md)

# Open Semantic Zoom Protocol (OSZP / `ect-capsule/1.0`)

## 1. Purpose

The **Open Semantic Zoom Protocol (OSZP)** defines a portable, model-agnostic container format (`capsule.jsonld`) and Formal Core Intermediate Representation (`formal-core-ir.json`) for translating hyper-dense formal systems (machine-verified proofs, complex physical theories, large technical architectures) into calibrated human intuition without losing causal topology or hiding simplification errors.

OSZP implements two architectural invariants:
1. **Silicon Egalitarianism**: The causal dependency graph, pinned formal anchors, and epistemic verification record live inside `formal_core_ir`, isolated from prose lenses. Any AI model can inspect, audit, or re-render the same skeleton.
2. **Biological Egalitarianism**: Every component and logical cut is mapped across five discrete zoom levels (`L0`–`L4`), each paired with a mandatory **Compression Loss Meter** (`loss_meter`).

---

## 2. The Four Layers

| Layer | Object in Capsule | Owner | Invariant |
|---|---|---|---|
| **1. Formal Core IR** | `formal_core_ir` | Formal source / verifier | Immutable across zoom levels; pinned via hashes & commit IDs |
| **2. Semantic Zoom Engine** | `lenses.strata`, `lenses.components`, `lenses.cuts`, `lenses.interfaces`, `lenses.itineraries` | Bilingual translators (human + AI) | Five levels (`L0`–`L4`) preserving graph direction and dependencies |
| **3. Compression Loss Meter** | `loss_meter` inside every lens node/cut | Translator + Schema Validator | Mandatory `fidelity_score`, `compression_ratio`, `topology_status`, `what_is_omitted`, `where_metaphor_breaks` |
| **4. Human Interface** | Audiovisual Microscope + Intuition Labs | Web runtime | Zero-backend client-side renderer capable of loading any valid `.capsule.jsonld` |

---

## 3. Zoom Level Taxonomy (`L0`–`L4`)

- **`L0` — Story / Child (~10 yrs)**  
  Sensory, spatial, or everyday physical metaphors. No symbolic equations or formal notation. Must still keep the causal arrow pointed in the true direction.
- **`L1` — Intuitive Architect**  
  High-resolution conceptual mechanics: equilibria, bottlenecks, pressure/signal analogies, coupling constraints, and phase transitions. Built for experienced thinkers who operate through structural intuition rather than formal notation.
- **`L2` — Systems Engineer / Practitioner**  
  Modular inputs, outputs, invariants, scaling exponents, parameter-choice choreography, and architectural rationale.
- **`L3` — Domain Researcher**  
  Full technical vocabulary, exact mathematical objects, proof strategies, and theorems (e.g., theta lifts over unitary groups, Mellin transforms, localized Landau oscillation, Galois cohomology windows).
- **`L4` — Formal Core / Kernel Anchor**  
  Verbatim exported identifiers, Lean modules, Git commit pins, SHA-256 verification checksums, axiom set, and explicit **Specification Boundary / Formalization Gap** (distinguishing machine compilation from human refereeing).

---

## 4. Compression Loss Meter Specification

Every component lens at every zoom level (`L0`–`L4`) MUST contain a `loss_meter` object:

```json
{
  "fidelity_score": 0.48,
  "compression_ratio": "~25,000:1",
  "topology_status": "faithful_projection",
  "what_is_omitted": [
    "Explicit adelic group decomposition",
    "Quantitative error constants in Behrend tower"
  ],
  "where_metaphor_breaks": "A physical tightrope vibrates locally under wind; the critical line Re(s) = 1/2 is a global symmetry of analytic continuation where moving even one zero distorts prime error oscillations everywhere."
}
```

Rules:
- `fidelity_score`: float in `[0.0, 1.0]`, monotonically non-decreasing across `L0 <= L1 <= L2 <= L3 < L4` with `L4.fidelity_score == 1.0`.
- `topology_status`:
  - `"lossy_analogy"` — illustrative metaphor; omits internal mechanism (`L0`, sometimes `L1`)
  - `"faithful_projection"` — preserves causal dependencies and key invariants while dropping technical machinery (`L1`–`L3`)
  - `"exact_isomorphism"` — formal specification match (`L4` only)
- `what_is_omitted`: non-empty list of concrete omitted mechanisms on `L0`–`L3`; may be empty `[]` only on `L4`.
- `where_metaphor_breaks`: **non-empty string on ALL levels `L0`–`L4`**. At `L4`, it records the *Formalization Gap*: what even a compiled formal proof leaves open (kernel trust, Mathlib definition alignment, human comprehension/refereeing).

---

## 5. Portability & JSON-LD Interoperability

A capsule file (`capsule.jsonld`) is self-contained JSON-LD (`@type: "ect:ComplexityCapsule"`). Any compliant viewer MUST be able to load a user-supplied `.capsule.jsonld`, validate it against `spec/ect-capsule.schema.json` and the Topology Laws (`spec/TOPOLOGY-LAWS.md`), and render its zoom microscope without code changes.
