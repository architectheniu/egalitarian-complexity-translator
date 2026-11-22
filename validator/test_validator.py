"""Pytest suite for ECT Complexity Capsule validation and Topology Preservation Laws."""

from __future__ import annotations

import copy
import json
from pathlib import Path

import pytest

from ect_validate import validate_capsule

ROOT = Path(__file__).resolve().parent.parent
CAPSULE_PATH = ROOT / "capsules" / "rh-2026-alpoege" / "capsule.jsonld"


@pytest.fixture(scope="module")
def valid_capsule() -> dict:
    return json.loads(CAPSULE_PATH.read_text(encoding="utf-8"))


def test_real_capsule_passes_all_8_laws(valid_capsule: dict) -> None:
    rep = validate_capsule(valid_capsule)
    assert rep.ok, f"Expected PASS, got errors: {rep.errors}"
    assert rep.stats["components"] == 14
    assert rep.stats["component_lenses"] == 140
    assert rep.stats["interfaces"] == 14
    assert rep.stats["cuts"] == 2
    assert rep.stats["topology_violations"] == 0


def test_missing_where_metaphor_breaks_fails_law4(valid_capsule: dict) -> None:
    broken = copy.deepcopy(valid_capsule)
    broken["lenses"]["components"]["endpoints"]["pl"]["L1"]["loss_meter"]["where_metaphor_breaks"] = ""
    rep = validate_capsule(broken)
    assert not rep.ok


def test_non_monotonic_fidelity_fails_law3(valid_capsule: dict) -> None:
    broken = copy.deepcopy(valid_capsule)
    broken["lenses"]["components"]["primes"]["en"]["L1"]["loss_meter"]["fidelity_score"] = 0.85
    broken["lenses"]["components"]["primes"]["en"]["L2"]["loss_meter"]["fidelity_score"] = 0.60
    rep = validate_capsule(broken)
    assert not rep.ok
    assert any("Law 3" in e for e in rep.errors)


def test_exact_isomorphism_on_l2_fails_law5(valid_capsule: dict) -> None:
    broken = copy.deepcopy(valid_capsule)
    broken["lenses"]["components"]["galois"]["pl"]["L2"]["loss_meter"]["topology_status"] = "exact_isomorphism"
    rep = validate_capsule(broken)
    assert not rep.ok
    assert any("Law 5" in e for e in rep.errors)


def test_dangling_interface_target_fails_law6(valid_capsule: dict) -> None:
    broken = copy.deepcopy(valid_capsule)
    broken["formal_core_ir"]["interfaces"][0]["to"] = "nonexistent-node"
    rep = validate_capsule(broken)
    assert not rep.ok
    assert any("Law 6" in e for e in rep.errors)


def test_directed_cycle_fails_law7(valid_capsule: dict) -> None:
    broken = copy.deepcopy(valid_capsule)
    # Create cycle endpoints -> reflection -> endpoints
    broken["formal_core_ir"]["interfaces"].append(
        {
            "id": "if-99-cycle",
            "from": "endpoints",
            "to": "reflection",
            "label_raw": "illegal backward cycle",
        }
    )
    broken["lenses"]["interfaces"]["if-99-cycle"] = {
        "pl": {lvl: "cykl" for lvl in ("L0", "L1", "L2", "L3", "L4")},
        "en": {lvl: "cycle" for lvl in ("L0", "L1", "L2", "L3", "L4")},
    }
    rep = validate_capsule(broken)
    assert not rep.ok
    assert any("Law 7" in e for e in rep.errors)
