"""Generate rich bilingual (PL + EN) L0-L4 semantic zoom lenses via Claude Opus 5.5.

Reads authoritative Formal Core IR from:
  capsules/rh-2026-alpoege/formal-core-ir.json

Uses --effort medium and 9 small disk-cached units under lenses/cache/ so partial
progress is preserved and each unit completes cleanly.

Produces modular JSON files in capsules/rh-2026-alpoege/lenses/:
  - strata-cuts-interfaces.json
  - components-arith-est.json
  - components-ana-dest.json
"""

from __future__ import annotations

import json
import os
import re
import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent
CAP_DIR = ROOT / "capsules" / "rh-2026-alpoege"
LENS_DIR = CAP_DIR / "lenses"
CACHE_DIR = LENS_DIR / "cache"
IR_PATH = CAP_DIR / "formal-core-ir.json"

LEVELS = ("L0", "L1", "L2", "L3", "L4")
LANGUAGES = ("pl", "en")


def extract_json(text: str) -> Any:
    """Extract JSON object/array from model output, stripping optional markdown fences."""
    cleaned = text.strip()
    fence_match = re.search(r"```(?:json)?\s*([\s\S]*?)```", cleaned)
    if fence_match:
        cleaned = fence_match.group(1).strip()
    start_obj = cleaned.find("{")
    start_arr = cleaned.find("[")
    starts = [i for i in (start_obj, start_arr) if i != -1]
    if not starts:
        raise ValueError("No JSON object or array found in output")
    start = min(starts)
    return json.loads(cleaned[start:])


def call_opus(prompt: str, tag: str) -> Any:
    """Invoke local Claude Code CLI (claude-opus-5-5, --effort medium) and parse JSON."""
    cmd = [
        "claude",
        "-p",
        "--model",
        "claude-opus-5-5",
        "--effort",
        "medium",
        "--tools",
        "",
        "--output-format",
        "text",
        "--no-session-persistence",
    ]
    env = dict(os.environ)
    env["PYTHONUTF8"] = "1"
    last_err: Exception | None = None
    for attempt in range(1, 3):
        print(f"[{tag}] Calling Claude Opus 5.5 (--effort medium, attempt {attempt})...", flush=True)
        try:
            res = subprocess.run(
                cmd,
                input=prompt,
                cwd=str(ROOT),
                capture_output=True,
                text=True,
                encoding="utf-8",
                timeout=360,
                env=env,
            )
        except subprocess.TimeoutExpired as exc:
            last_err = RuntimeError(f"Timeout after {exc.timeout}s")
            continue
        if res.returncode != 0:
            last_err = RuntimeError(f"claude exited {res.returncode}: {res.stderr[:400]} | {res.stdout[:400]}")
            continue
        raw = res.stdout.strip()
        try:
            return extract_json(raw)
        except Exception as exc:
            last_err = RuntimeError(f"JSON parse error ({exc}); raw tail: {raw[-400:]}")
    raise RuntimeError(f"[{tag}] Failed after retries: {last_err}")


def cached_unit(tag: str, producer, validator) -> Any:
    cache_file = CACHE_DIR / f"{tag}.json"
    if cache_file.exists():
        data = json.loads(cache_file.read_text(encoding="utf-8"))
        validator(data)
        print(f"[CACHE] {tag}", flush=True)
        return data
    data = producer()
    validator(data)
    cache_file.write_bytes((json.dumps(data, ensure_ascii=False, indent=2) + "\n").encode("utf-8"))
    print(f"[DONE] {tag}", flush=True)
    return data


def validate_component_batch(data: dict[str, Any], expected_ids: list[str]) -> None:
    for cid in expected_ids:
        if cid not in data:
            raise ValueError(f"Missing component '{cid}' in Opus output")
        for lang in LANGUAGES:
            if lang not in data[cid]:
                raise ValueError(f"Missing language '{lang}' in component '{cid}'")
            fids = []
            for lvl in LEVELS:
                lens = data[cid][lang].get(lvl)
                if not isinstance(lens, dict):
                    raise ValueError(f"Missing level {lvl} in {cid}.{lang}")
                for req in ("title", "headline", "explanation", "key_insight", "analogy_anchor", "loss_meter"):
                    if not lens.get(req):
                        raise ValueError(f"Missing field {req} in {cid}.{lang}.{lvl}")
                lm = lens["loss_meter"]
                if len(str(lm.get("where_metaphor_breaks", "")).strip()) < 12:
                    raise ValueError(f"Too short where_metaphor_breaks in {cid}.{lang}.{lvl}")
                if lvl != "L4" and not lm.get("what_is_omitted"):
                    raise ValueError(f"Empty what_is_omitted in {cid}.{lang}.{lvl}")
                if lvl != "L4" and lm.get("topology_status") == "exact_isomorphism":
                    raise ValueError(f"Illegal exact_isomorphism in {cid}.{lang}.{lvl}")
                if lvl == "L4":
                    lm["topology_status"] = "exact_isomorphism"
                    lm["fidelity_score"] = 1.0
                    lm.setdefault("what_is_omitted", [])
                fids.append(float(lm["fidelity_score"]))
            if not (0.0 < fids[0] <= fids[1] <= fids[2] <= fids[3] < fids[4] == 1.0):
                raise ValueError(f"Non-monotonic fidelities in {cid}.{lang}: {fids}")


def produce_meta_and_strata(ir: dict[str, Any]) -> dict[str, Any]:
    prompt = f"""Generate bilingual (Polish `pl` + English `en`) OSZP 1.0 lenses for `level_meta` and `strata` (4 strata) of Capsule #001 (`rh-2026-alpoege`).

VOICE & RULES:
- Polish (`pl`) must use accurate Polish UTF-8 diacritics (ąćęłńóśźż), vivid clarity, zero corporate hype.
- Keep summaries crisp (1-2 sharp sentences).

INPUT STRATA:
{json.dumps(ir["strata"], ensure_ascii=False, indent=2)}

Return ONLY ONE valid JSON object with EXACTLY these 2 top-level keys:
1. `"level_meta"`: keys `"L0"`, `"L1"`, `"L2"`, `"L3"`, `"L4"`, each with `"label"`, `"audience"`, `"description"` as `{{"pl": "...", "en": "..."}}`.
2. `"strata"`: keys `"arith"`, `"est"`, `"ana"`, `"dest"` -> `"pl"` & `"en"` -> `"L0"`..`"L4"` -> `{{"title": "...", "summary": "..."}}`.
"""
    return call_opus(prompt, "meta_and_strata")


def validate_meta_and_strata(data: dict[str, Any], ir: dict[str, Any]) -> None:
    for k in ("level_meta", "strata"):
        if k not in data:
            raise ValueError(f"Missing {k}")
    for lvl in LEVELS:
        if lvl not in data["level_meta"]:
            raise ValueError(f"Missing level_meta.{lvl}")
    for s in ir["strata"]:
        for lang in LANGUAGES:
            for lvl in LEVELS:
                if lvl not in data["strata"][s["id"]][lang]:
                    raise ValueError(f"Missing stratum {s['id']}.{lang}.{lvl}")


def produce_cuts_only(ir: dict[str, Any]) -> dict[str, Any]:
    context = {"cuts": ir["cuts"], "pins": ir["pins"]}
    prompt = f"""Generate bilingual (Polish `pl` + English `en`) OSZP 1.0 lenses for the 2 global `cuts` of Capsule #001 (`rh-2026-alpoege`).

VOICE & RULES:
- Polish (`pl`) must use accurate Polish UTF-8 diacritics (ąćęłńóśźż), vivid clarity, zero corporate hype.
- Distinguish machine compilation/replay from ongoing human peer review.
- Every cut at every level `L0..L4` needs a `loss_meter`: fidelity monotonically increasing (0.20, 0.45, 0.70, 0.90, 1.0), `topology_status` (`lossy_analogy` at L0, `faithful_projection` at L1-L3, `exact_isomorphism` ONLY at L4), non-empty `what_is_omitted` on L0..L3, and razor-sharp `where_metaphor_breaks` (>= 20 chars) on ALL L0..L4.

INPUT CUTS:
{json.dumps(context, ensure_ascii=False, indent=2)}

Return ONLY ONE valid JSON object with EXACTLY one top-level key `"cuts"` mapping `"cut-zeta"` and `"cut-dirichlet"` -> `"pl"` & `"en"` -> `"L0"`..`"L4"` -> `{{"title": "...", "statement": "...", "intuition": "...", "loss_meter": {{...}}}}`.
"""
    return call_opus(prompt, "cuts_only")


def validate_cuts_only(data: dict[str, Any], ir: dict[str, Any]) -> None:
    cuts = data.get("cuts")
    if not isinstance(cuts, dict):
        raise ValueError("Missing cuts")
    for cut in ir["cuts"]:
        for lang in LANGUAGES:
            fids = []
            for lvl in LEVELS:
                lm = cuts[cut["id"]][lang][lvl]["loss_meter"]
                if lvl == "L4":
                    lm["topology_status"] = "exact_isomorphism"
                    lm["fidelity_score"] = 1.0
                    lm.setdefault("what_is_omitted", [])
                elif not lm.get("what_is_omitted"):
                    raise ValueError(f"Empty what_is_omitted on {cut['id']}.{lang}.{lvl}")
                if len(str(lm.get("where_metaphor_breaks", "")).strip()) < 12:
                    raise ValueError(f"Short where_metaphor_breaks on {cut['id']}.{lang}.{lvl}")
                fids.append(float(lm["fidelity_score"]))
            if not (0.0 < fids[0] <= fids[1] <= fids[2] <= fids[3] < fids[4] == 1.0):
                raise ValueError(f"Non-monotonic cut fidelities {cut['id']}.{lang}: {fids}")


def produce_interfaces_itineraries(ir: dict[str, Any]) -> dict[str, Any]:
    context = {
        "interfaces": ir["interfaces"],
        "itineraries": ir["itineraries"],
        "components_brief": [
            {"id": c["id"], "n": c["n"], "stratum": c["stratum"], "title_raw": c["title_raw"], "gist_raw": c["gist_raw"]}
            for c in ir["components"]
        ],
    }
    prompt = f"""Generate bilingual (Polish `pl` + English `en`) OSZP 1.0 lenses for ALL 14 `interfaces` and ALL 6 `itineraries` of Capsule #001 (`rh-2026-alpoege`).

INPUT IR:
{json.dumps(context, ensure_ascii=False, indent=2)}

Return ONLY ONE valid JSON object with EXACTLY these 2 top-level keys:
1. `"interfaces"`: map EVERY exact interface ID (`if-01-galois-to-inputs`, ..., `if-14-reflection-to-endpoints`) -> `"pl"` & `"en"` -> `"L0"`, `"L1"`, `"L2"`, `"L3"`, `"L4"` -> concise 2-6 word edge label suitable for a graph arrow.
2. `"itineraries"`: array of 6 guided itineraries:
   - FIRST item MUST be:
     `"id": "architect-path"`, `"is_architect_default": true`,
     `"component_path": ["primes", "galois", "family", "comparison", "criterion", "endpoints"]`,
     `"lean_node_path": ["behrend", "row-prod", "shape", "core-gm", "window-consumer", "main-rh"]`,
     `"pl"`: `{{"title": "Ścieżka Architekta: Od cegiełek do niewidzialnej liny w 6 krokach", "question": "Jak dowód spina elementarne liczby pierwsze z prostą krytyczną bez czytania 17 milionów linii?", "step_notes": [{{"component_id": "...", "note_by_level": {{"L0": "...", "L1": "...", "L2": "...", "L3": "...", "L4": "..."}}}}, ... (all 6)]}}`,
     `"en"`: `{{"title": "The Architect's Path: From Prime Bricks to the Critical Line in 6 Steps", "question": "How does the proof bind prime bricks to the critical line without reading 17 million lines?", "step_notes": [...]}}`.
   - Followed by the 5 upstream itineraries (`upstream-1` .. `upstream-5`) keeping their exact `component_path` and `nodes` (as `lean_node_path`), `"is_architect_default": false`, and translated `"pl"` and `"en"` objects (`title`, `question`, `step_notes` covering every item in `component_path`).
"""
    return call_opus(prompt, "interfaces_itineraries")


def validate_interfaces_itineraries(data: dict[str, Any], ir: dict[str, Any]) -> None:
    if "interfaces" not in data or "itineraries" not in data:
        raise ValueError("Missing interfaces or itineraries")
    for iface in ir["interfaces"]:
        iid = iface["id"]
        if iid not in data["interfaces"]:
            raise ValueError(f"Missing interface {iid}")
        for lang in LANGUAGES:
            for lvl in LEVELS:
                if not data["interfaces"][iid][lang].get(lvl):
                    raise ValueError(f"Missing interface {iid}.{lang}.{lvl}")
    if len(data["itineraries"]) < 6:
        raise ValueError("Expected 6 itineraries")
    for it in data["itineraries"]:
        for lang in LANGUAGES:
            if not it.get(lang, {}).get("step_notes"):
                raise ValueError(f"Missing step_notes in {it.get('id')}.{lang}")


def produce_component_pair(ir: dict[str, Any], comp_ids: list[str], tag: str) -> dict[str, Any]:
    nodes_by_comp: dict[str, list[dict]] = {}
    for n in ir["nodes"]:
        nodes_by_comp.setdefault(n["component"], []).append(n)

    batch_specs = []
    for c in ir["components"]:
        if c["id"] in comp_ids:
            c_nodes = [
                {
                    "id": n["id"],
                    "title": n.get("title"),
                    "declaration": n.get("declaration"),
                    "module": n.get("module"),
                    "lines": n.get("lines"),
                    "contract": n.get("contract"),
                    "idea": n.get("idea"),
                    "excerpt": n.get("excerpt"),
                }
                for n in nodes_by_comp.get(c["id"], [])[:5]
            ]
            batch_specs.append({**c, "detailed_nodes": c_nodes})

    in_edges = [i for i in ir["interfaces"] if i["to"] in comp_ids]
    out_edges = [i for i in ir["interfaces"] if i["from"] in comp_ids]

    prompt = f"""Generate bilingual (`pl` + `en`) L0-L4 semantic zoom lenses for OSZP 1.0 Capsule #001 (`rh-2026-alpoege`).

Generate lenses for EXACTLY these 2 components: {json.dumps(comp_ids)}

CALIBRATION:
- `L0` (Opowieść / Story ~10 yrs): Concrete physical/musical/everyday metaphors. Zero equations. `fidelity_score`: 0.20, `compression_ratio`: `"~500,000:1"`, `topology_status`: `"lossy_analogy"`.
- `L1` (Architekt Intuicji / Intuitive Architect): Structural intuition — balances, signals, tension, bottlenecks, phase transitions, clear causal mechanism without formal jargon. `fidelity_score`: 0.45, `compression_ratio`: `"~50,000:1"`, `topology_status`: `"faithful_projection"`.
- `L2` (Inżynier / Systems Engineer): Inputs/outputs, invariant contracts, scaling exponents, parameter choreography. `fidelity_score`: 0.70, `compression_ratio`: `"~5,000:1"`, `topology_status`: `"faithful_projection"`.
- `L3` (Badacz / Domain Researcher): Exact mathematical machinery (Stepanov over Z, unitary theta chains, Behrend sets, Row0b, VWinAt, TopG, Mellin ramp, localized Landau). `fidelity_score`: 0.90, `compression_ratio`: `"~200:1"`, `topology_status`: `"faithful_projection"`.
- `L4` (Rdzeń Lean / Formal Kernel): Exact Lean 4.33.1 declarations, modules, commit `40e56bab026552e089d7afcfeff08d2defb9c005` pin, 3 standard axioms (`propext`, `Classical.choice`, `Quot.sound`). `fidelity_score`: 1.0, `compression_ratio`: `"1:1 (formal anchor)"`, `topology_status`: `"exact_isomorphism"`, `what_is_omitted`: `[]`, `where_metaphor_breaks`: explicit Formalization Gap / Specification Boundary (kernel trust + Mathlib definitions + ongoing human mathematical peer review).

STRICT RULES:
- Polish (`pl`) MUST use clean UTF-8 Polish diacritics (ąćęłńóśźż), vivid clarity.
- Every `L0..L3` MUST have >= 2 concrete items in `what_is_omitted`.
- Every `L0..L4` MUST have a specific, honest `where_metaphor_breaks` (>= 25 chars).
- Keep each `explanation` crisp (2-3 dense, high-signal sentences).

COMPONENTS & PINNED LEAN NODES:
{json.dumps(batch_specs, ensure_ascii=False, indent=2)}

INTERFACES:
In: {json.dumps(in_edges, ensure_ascii=False)}
Out: {json.dumps(out_edges, ensure_ascii=False)}

Return ONLY ONE valid JSON object mapping each component ID (`{comp_ids[0]}`, `{comp_ids[1]}`) -> `"pl"` & `"en"` -> `"L0"`..`"L4"` -> {{
  "title": string,
  "headline": string,
  "explanation": string,
  "key_insight": string,
  "analogy_anchor": string,
  "loss_meter": {{
    "fidelity_score": number,
    "compression_ratio": string,
    "topology_status": "lossy_analogy" | "faithful_projection" | "exact_isomorphism",
    "what_is_omitted": [string, ...],
    "where_metaphor_breaks": string
  }}
}}.
"""
    return call_opus(prompt, tag)


def main() -> None:
    LENS_DIR.mkdir(parents=True, exist_ok=True)
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    ir = json.loads(IR_PATH.read_text(encoding="utf-8"))

    comp_pairs = [
        ("pair_01_primes_galois", ["primes", "galois"]),
        ("pair_02_inputs_cohomology", ["inputs", "cohomology"]),
        ("pair_03_hosts_family", ["hosts", "family"]),
        ("pair_04_comparison_statistic", ["comparison", "statistic"]),
        ("pair_05_residues_criterion", ["residues", "criterion"]),
        ("pair_06_choreography_descent", ["choreography", "descent"]),
        ("pair_07_reflection_endpoints", ["reflection", "endpoints"]),
    ]

    results: dict[str, Any] = {}
    with ThreadPoolExecutor(max_workers=4) as pool:
        futs = {
            pool.submit(
                cached_unit,
                "meta_and_strata",
                lambda: produce_meta_and_strata(ir),
                lambda d: validate_meta_and_strata(d, ir),
            ): "meta_and_strata",
            pool.submit(
                cached_unit,
                "cuts_only",
                lambda: produce_cuts_only(ir),
                lambda d: validate_cuts_only(d, ir),
            ): "cuts_only",
            pool.submit(
                cached_unit,
                "interfaces_itineraries",
                lambda: produce_interfaces_itineraries(ir),
                lambda d: validate_interfaces_itineraries(d, ir),
            ): "interfaces_itineraries",
        }
        for tag, cids in comp_pairs:
            futs[
                pool.submit(
                    cached_unit,
                    tag,
                    lambda c=cids, t=tag: produce_component_pair(ir, c, t),
                    lambda d, c=cids: validate_component_batch(d, c),
                )
            ] = tag

        for fut in as_completed(futs):
            name = futs[fut]
            results[name] = fut.result()

    strata_cuts_ifaces = {
        "level_meta": results["meta_and_strata"]["level_meta"],
        "strata": results["meta_and_strata"]["strata"],
        "cuts": results["cuts_only"]["cuts"],
        "interfaces": results["interfaces_itineraries"]["interfaces"],
        "itineraries": results["interfaces_itineraries"]["itineraries"],
    }
    (LENS_DIR / "strata-cuts-interfaces.json").write_bytes(
        (json.dumps(strata_cuts_ifaces, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
    )

    arith_est: dict[str, Any] = {}
    ana_dest: dict[str, Any] = {}
    arith_est_ids = {"primes", "galois", "inputs", "cohomology", "hosts", "family", "comparison"}
    for tag, _ in comp_pairs:
        for cid, payload in results[tag].items():
            if cid in arith_est_ids:
                arith_est[cid] = payload
            else:
                ana_dest[cid] = payload

    (LENS_DIR / "components-arith-est.json").write_bytes(
        (json.dumps(arith_est, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
    )
    (LENS_DIR / "components-ana-dest.json").write_bytes(
        (json.dumps(ana_dest, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
    )

    print(
        f"Merged lenses cleanly: {len(arith_est)} arith/est + {len(ana_dest)} ana/dest = "
        f"{len(arith_est) + len(ana_dest)} components!"
    )


if __name__ == "__main__":
    main()
