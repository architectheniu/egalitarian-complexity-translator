**Language:** **English** | [Polski](TOPOLOGY-LAWS.pl.md)

# Topology Preservation Laws (OSZP Validator Contract)

An ECT capsule (`ect-capsule/1.0`) is rejected by `validator/ect_validate.py` if ANY of the following 8 laws fail:

1. **Schema Conformance Law**: The capsule validates strictly against `spec/ect-capsule.schema.json` (JSON Schema Draft 2020-12).
2. **Bilingual Completeness Law**: Every declared language (`en`, `pl`, ...) provides complete zoom lenses (`L0`, `L1`, `L2`, `L3`, `L4`) for every stratum, component, global cut, and interface present in `formal_core_ir`.
3. **Monotonic Fidelity Law**: For every `(component_id, lang)`, `fidelity_score` satisfies:
   `0.0 < L0 <= L1 <= L2 <= L3 < L4 == 1.0`.
4. **Mandatory Fracture Honesty Law**: For every `(component_id, lang, level)` and `(cut_id, lang, level)`:
   - `loss_meter.where_metaphor_breaks` MUST be a non-empty string (`len >= 12`).
   - For `L0..L3`, `loss_meter.what_is_omitted` MUST contain at least one explicit item.
5. **Topology Status Calibration Law**: Only `L4` may declare `topology_status == "exact_isomorphism"`; `L0..L3` must declare `"lossy_analogy"` or `"faithful_projection"`.
6. **Graph Referential Integrity Law**:
   - Every component references a valid stratum ID in `formal_core_ir.strata`.
   - Every interface `from` and `to` references an existing component ID in `formal_core_ir.components`, with no self-loops.
   - Every itinerary `component_path` references existing component IDs.
7. **DAG Acyclicity & Endpoint Reachability Law**: The component dependency graph formed by `formal_core_ir.interfaces` is a DAG (no directed cycles) and every root supply component can reach a terminal destination component (`endpoints`).
8. **Provenance & Epistemic Pin Law**: `formal_core_ir.pins` declares a repository/source mirror, commit or version pin, toolchain, and `epistemic_status` explicitly separating machine verification from human peer review.
