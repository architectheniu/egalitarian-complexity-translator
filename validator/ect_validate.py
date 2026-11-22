"""Validator for ECT Complexity Capsules (OSZP 1.0 / ect-capsule/1.0).

Enforces both JSON Schema conformance (spec/ect-capsule.schema.json) and all
8 Topology Preservation Laws (spec/TOPOLOGY-LAWS.md).
"""

from __future__ import annotations

import json
import sys
from collections import deque
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_SCHEMA_PATH = ROOT / "spec" / "ect-capsule.schema.json"
LEVELS = ("L0", "L1", "L2", "L3", "L4")


class ValidationReport:
    def __init__(self) -> None:
        self.errors: list[str] = []
        self.stats: dict[str, Any] = {}

    @property
    def ok(self) -> bool:
        return len(self.errors) == 0

    def fail(self, law: str, msg: str) -> None:
        self.errors.append(f"[{law}] {msg}")


def _check_loss_meter(
    report: ValidationReport,
    context: str,
    level: str,
    loss_meter: dict[str, Any],
) -> float:
    fidelity = float(loss_meter.get("fidelity_score", -1.0))
    status = loss_meter.get("topology_status", "")
    omitted = loss_meter.get("what_is_omitted", [])
    breaks = str(loss_meter.get("where_metaphor_breaks", "")).strip()

    if len(breaks) < 12:
        report.fail("Law 4 (Fracture Honesty)", f"{context} {level}: where_metaphor_breaks must be >= 12 chars")

    if level in ("L0", "L1", "L2", "L3"):
        if not isinstance(omitted, list) or len(omitted) < 1:
            report.fail("Law 4 (Fracture Honesty)", f"{context} {level}: what_is_omitted must be non-empty")
        if status == "exact_isomorphism":
            report.fail("Law 5 (Status Calibration)", f"{context} {level}: exact_isomorphism allowed only at L4")
    elif level == "L4":
        if status != "exact_isomorphism":
            report.fail("Law 5 (Status Calibration)", f"{context} L4: topology_status must be exact_isomorphism")

    return fidelity


def validate_capsule(
    capsule: dict[str, Any],
    schema_path: Path = DEFAULT_SCHEMA_PATH,
) -> ValidationReport:
    report = ValidationReport()
    schema = json.loads(schema_path.read_text(encoding="utf-8"))

    # Law 1: Schema Conformance
    validator = Draft202012Validator(schema)
    schema_errors = sorted(validator.iter_errors(capsule), key=lambda e: list(e.path))
    for err in schema_errors[:25]:
        loc = ".".join(str(p) for p in err.path) or "<root>"
        report.fail("Law 1 (Schema)", f"{loc}: {err.message}")
    if schema_errors:
        return report

    ir = capsule["formal_core_ir"]
    lenses = capsule["lenses"]
    languages: list[str] = lenses["languages"]

    stratum_ids = {s["id"] for s in ir["strata"]}
    comp_ids = {c["id"] for c in ir["components"]}
    cut_ids = {c["id"] for c in ir["cuts"]}
    iface_ids = {i["id"] for i in ir["interfaces"]}

    # Law 2, 3, 4, 5: Bilingual Completeness, Monotonic Fidelity, Fracture Honesty, Status Calibration
    for lang in languages:
        # Strata
        for sid in stratum_ids:
            slens = lenses["strata"].get(sid, {}).get(lang)
            if not slens:
                report.fail("Law 2 (Bilingual)", f"Missing stratum lens {sid}.{lang}")
                continue
            for lvl in LEVELS:
                if lvl not in slens:
                    report.fail("Law 2 (Bilingual)", f"Missing stratum lens {sid}.{lang}.{lvl}")

        # Components
        for cid in comp_ids:
            clens = lenses["components"].get(cid, {}).get(lang)
            if not clens:
                report.fail("Law 2 (Bilingual)", f"Missing component lens {cid}.{lang}")
                continue
            fidelities: list[float] = []
            for lvl in LEVELS:
                item = clens.get(lvl)
                if not item:
                    report.fail("Law 2 (Bilingual)", f"Missing component lens {cid}.{lang}.{lvl}")
                    continue
                fidelities.append(_check_loss_meter(report, f"component {cid}.{lang}", lvl, item["loss_meter"]))
            if len(fidelities) == 5:
                f0, f1, f2, f3, f4 = fidelities
                if not (0.0 < f0 <= f1 <= f2 <= f3 < f4 == 1.0):
                    report.fail(
                        "Law 3 (Monotonic Fidelity)",
                        f"component {cid}.{lang}: expected 0 < L0 <= L1 <= L2 <= L3 < L4 == 1.0, got {fidelities}",
                    )

        # Cuts
        for cut_id in cut_ids:
            cut_lens = lenses["cuts"].get(cut_id, {}).get(lang)
            if not cut_lens:
                report.fail("Law 2 (Bilingual)", f"Missing cut lens {cut_id}.{lang}")
                continue
            fidelities = []
            for lvl in LEVELS:
                item = cut_lens.get(lvl)
                if not item:
                    report.fail("Law 2 (Bilingual)", f"Missing cut lens {cut_id}.{lang}.{lvl}")
                    continue
                fidelities.append(_check_loss_meter(report, f"cut {cut_id}.{lang}", lvl, item["loss_meter"]))
            if len(fidelities) == 5:
                f0, f1, f2, f3, f4 = fidelities
                if not (0.0 < f0 <= f1 <= f2 <= f3 < f4 == 1.0):
                    report.fail(
                        "Law 3 (Monotonic Fidelity)",
                        f"cut {cut_id}.{lang}: expected 0 < L0 <= L1 <= L2 <= L3 < L4 == 1.0, got {fidelities}",
                    )

        # Interfaces
        for iid in iface_ids:
            ilens = lenses["interfaces"].get(iid, {}).get(lang)
            if not ilens:
                report.fail("Law 2 (Bilingual)", f"Missing interface lens {iid}.{lang}")
                continue
            for lvl in LEVELS:
                if lvl not in ilens:
                    report.fail("Law 2 (Bilingual)", f"Missing interface lens {iid}.{lang}.{lvl}")

    # Law 6: Graph Referential Integrity
    for comp in ir["components"]:
        if comp["stratum"] not in stratum_ids:
            report.fail("Law 6 (Referential)", f"Component {comp['id']} references unknown stratum {comp['stratum']}")

    adj: dict[str, list[str]] = {cid: [] for cid in comp_ids}
    in_deg: dict[str, int] = {cid: 0 for cid in comp_ids}
    out_deg: dict[str, int] = {cid: 0 for cid in comp_ids}

    for iface in ir["interfaces"]:
        src, dst = iface["from"], iface["to"]
        if src not in comp_ids:
            report.fail("Law 6 (Referential)", f"Interface {iface['id']} unknown from={src}")
        if dst not in comp_ids:
            report.fail("Law 6 (Referential)", f"Interface {iface['id']} unknown to={dst}")
        if src == dst:
            report.fail("Law 6 (Referential)", f"Interface {iface['id']} has self-loop on {src}")
        if src in comp_ids and dst in comp_ids and src != dst:
            adj[src].append(dst)
            out_deg[src] += 1
            in_deg[dst] += 1

    for it in lenses["itineraries"]:
        for cid in it.get("component_path", []):
            if cid not in comp_ids:
                report.fail("Law 6 (Referential)", f"Itinerary {it['id']} references unknown component {cid}")
        for lang in languages:
            if lang not in it:
                report.fail("Law 2 (Bilingual)", f"Itinerary {it['id']} missing language block '{lang}'")

    # Law 7: DAG Acyclicity & Endpoint Reachability
    q = deque([cid for cid, deg in in_deg.items() if deg == 0])
    temp_in = dict(in_deg)
    visited = 0
    while q:
        curr = q.popleft()
        visited += 1
        for nxt in adj[curr]:
            temp_in[nxt] -= 1
            if temp_in[nxt] == 0:
                q.append(nxt)

    if visited != len(comp_ids):
        report.fail("Law 7 (DAG Acyclicity)", f"Cycle detected in component interfaces ({visited}/{len(comp_ids)} topological)")
    else:
        sinks = {cid for cid, deg in out_deg.items() if deg == 0}
        roots = [cid for cid, deg in in_deg.items() if deg == 0]
        for root in roots:
            seen = {root}
            bfs = deque([root])
            reached_sink = False
            while bfs:
                node = bfs.popleft()
                if node in sinks:
                    reached_sink = True
                    break
                for nxt in adj[node]:
                    if nxt not in seen:
                        seen.add(nxt)
                        bfs.append(nxt)
            if not reached_sink:
                report.fail("Law 7 (Reachability)", f"Root component {root} does not reach any sink component")

    # Law 8: Provenance & Epistemic Pin Law
    pins = ir["pins"]
    for req_pin in ("mirror", "mirror_commit", "toolchain"):
        if not str(pins.get(req_pin, "")).strip():
            report.fail("Law 8 (Provenance)", f"pins.{req_pin} must be non-empty")
    ep = ir["epistemic_status"]
    for req_ep in ("headline", "machine_verification", "human_review"):
        if not str(ep.get(req_ep, "")).strip():
            report.fail("Law 8 (Provenance)", f"epistemic_status.{req_ep} must be non-empty")

    report.stats = {
        "capsule_id": capsule.get("id"),
        "languages": languages,
        "strata": len(stratum_ids),
        "components": len(comp_ids),
        "component_lenses": len(comp_ids) * len(languages) * len(LEVELS),
        "interfaces": len(iface_ids),
        "cuts": len(cut_ids),
        "itineraries": len(lenses["itineraries"]),
        "topology_violations": len(report.errors),
    }
    return report


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: python validator/ect_validate.py <path/to/capsule.jsonld>", file=sys.stderr)
        return 2
    capsule_path = Path(sys.argv[1])
    capsule = json.loads(capsule_path.read_text(encoding="utf-8"))
    rep = validate_capsule(capsule)
    if rep.ok:
        s = rep.stats
        print(
            f"PASS [{s['capsule_id']}]: {s['components']}/{s['components']} components, "
            f"{s['component_lenses']} bilingual zoom lenses ({','.join(s['languages'])}), "
            f"{s['interfaces']} interfaces, {s['cuts']} cuts, {s['itineraries']} itineraries, "
            f"0 topology violations."
        )
        return 0
    print(f"FAIL [{capsule_path.name}]: {len(rep.errors)} violations:", file=sys.stderr)
    for err in rep.errors:
        print(f"  - {err}", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
