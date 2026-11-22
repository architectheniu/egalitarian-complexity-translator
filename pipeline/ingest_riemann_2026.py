"""Deterministic upstream ingestion pipeline for Capsule #001 (rh-2026-alpoege).

Fetches pinned, publicly available formal proof architecture data from:
  - nasqret/riemann-rev (model.json) [0BSD]
  - nasqret/riemann-proof-atlas (subjects.json) [0BSD]
  - leanprover-community/riemann-hypothesis (Challenge.lean, Main.lean, Statements.lean)

Produces:
  - capsules/rh-2026-alpoege/formal-core-ir.json (pure machine-readable IR, no narrative zoom lenses)
  - capsules/rh-2026-alpoege/sources-manifest.json (pinned URLs, SHA-256 digests, upstream credits)
"""

from __future__ import annotations

import hashlib
import json
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "capsules" / "rh-2026-alpoege"

SOURCES = {
    "riemann_rev_model": "https://raw.githubusercontent.com/nasqret/riemann-rev/main/data/model.json",
    "proof_atlas_subjects": "https://raw.githubusercontent.com/nasqret/riemann-proof-atlas/main/evidence/subjects.json",
    "challenge_lean": "https://raw.githubusercontent.com/leanprover-community/riemann-hypothesis/main/src/Challenge.lean",
    "main_lean": "https://raw.githubusercontent.com/leanprover-community/riemann-hypothesis/main/src/Main.lean",
    "statements_lean": "https://raw.githubusercontent.com/leanprover-community/riemann-hypothesis/main/src/Statements.lean",
}

STRATUM_ORDER = {"arith": 0, "est": 1, "ana": 2, "dest": 3}


def fetch_bytes(url: str) -> tuple[bytes, str]:
    req = urllib.request.Request(url, headers={"User-Agent": "ECT-Ingestor/1.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = resp.read()
    digest = hashlib.sha256(data).hexdigest()
    return data, digest


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    raw_blobs: dict[str, bytes] = {}
    manifest_sources: dict[str, dict[str, object]] = {}

    for key, url in SOURCES.items():
        data, sha = fetch_bytes(url)
        raw_blobs[key] = data
        manifest_sources[key] = {
            "url": url,
            "sha256": sha,
            "bytes": len(data),
        }
        print(f"Fetched {key}: {len(data):,} bytes (sha256={sha[:12]}...)")

    model = json.loads(raw_blobs["riemann_rev_model"].decode("utf-8"))
    subjects = json.loads(raw_blobs["proof_atlas_subjects"].decode("utf-8"))
    challenge_lean = raw_blobs["challenge_lean"].decode("utf-8")
    main_lean = raw_blobs["main_lean"].decode("utf-8")
    statements_lean = raw_blobs["statements_lean"].decode("utf-8")

    # Index Lean nodes by component ID
    nodes_by_comp: dict[str, list[dict]] = {}
    node_to_comp: dict[str, str] = {}
    for node in model["nodes"]:
        cid = node["component"]
        nodes_by_comp.setdefault(cid, []).append(node)
        node_to_comp[node["id"]] = cid

    strata = [
        {
            "id": s["id"],
            "order": STRATUM_ORDER.get(s["id"], idx),
            "color": s["color"],
            "title_raw": s["title"],
            "blurb_raw": s["blurb"],
        }
        for idx, s in enumerate(model["strata"])
    ]

    components = []
    for comp in model["components"]:
        cid = comp["id"]
        c_nodes = nodes_by_comp.get(cid, [])
        components.append(
            {
                "id": cid,
                "n": comp["n"],
                "stratum": comp["stratum"],
                "title_raw": comp["title"],
                "kicker": comp.get("kicker", ""),
                "gist_raw": comp["gist"],
                "node_count": len(c_nodes),
                "node_ids": [n["id"] for n in c_nodes],
                "lean_anchors": [
                    {
                        "id": n["id"],
                        "declaration": n.get("declaration", ""),
                        "module": n.get("module", ""),
                        "lines": n.get("lines", []),
                        "kind": n.get("kind", ""),
                        "tier": n.get("tier", ""),
                        "url": n.get("url", ""),
                        "excerpt": n.get("excerpt", ""),
                    }
                    for n in c_nodes[:8]
                ],
            }
        )

    interfaces = []
    for idx, iface in enumerate(model["interfaces"], start=1):
        interfaces.append(
            {
                "id": f"if-{idx:02d}-{iface['from']}-to-{iface['to']}",
                "from": iface["from"],
                "to": iface["to"],
                "label_raw": iface["label"],
                "lean": iface.get("lean", ""),
                "url": iface.get("url", ""),
            }
        )

    cuts = [
        {
            "id": c["id"],
            "title_raw": c["title"],
            "lean": c.get("lean", ""),
            "premise_latex": c.get("premise", ""),
        }
        for c in model["cuts"]
    ]

    itineraries = []
    for idx, it in enumerate(model["itineraries"], start=1):
        comp_path: list[str] = []
        for nid in it["nodes"]:
            cid = node_to_comp.get(nid)
            if cid and (not comp_path or comp_path[-1] != cid):
                comp_path.append(cid)
        itineraries.append(
            {
                "id": f"upstream-{idx}",
                "title_raw": it["title"],
                "question_raw": it["question"],
                "nodes": it["nodes"],
                "component_path": comp_path,
            }
        )

    rh_endpoint_counts = subjects["endpoints"][0]["counts"]["value"]

    formal_core_ir = {
        "schema": model.get("schema", "riemann-rev-model/1"),
        "title_raw": model.get("title", ""),
        "pins": model["pins"],
        "epistemic_status": {
            "headline": model["status"]["headline"],
            "detail": model["status"]["detail"],
            "machine_verification": (
                "Full Lean 4.33.1 compilation (175,187 modules) & independent Rust kernel replay "
                "(con-leche / nanoda / lean4lean) reported complete; all 5 exported endpoints match Mathlib Challenge.lean."
            ),
            "human_review": (
                "Ongoing. Human mathematical peer review and readable prose account remain incomplete; "
                "community atlases and reading guides map the 17.4M-line formal object."
            ),
            "axioms": ["propext", "Classical.choice", "Quot.sound"],
            "archive_stats": {
                "lean_files": 175187,
                "total_lines": 17374215,
                "non_blank_lines": 15531759,
                "theorem_lemma_declarations": 818755,
                "def_struct_declarations": 242067,
                "rh_reachable_declarations": rh_endpoint_counts["total"],
                "rh_placed_declarations": rh_endpoint_counts["placed"],
            },
            "subjects_footprint": {
                "categories": rh_endpoint_counts["categories"],
                "top_topics": dict(
                    sorted(
                        rh_endpoint_counts["topics"].items(),
                        key=lambda kv: kv[1],
                        reverse=True,
                    )[:16]
                ),
            },
            "external_sources": model["status"].get("external_sources", []),
            "as_of": model["status"].get("as_of", ""),
        },
        "strata": strata,
        "components": components,
        "interfaces": interfaces,
        "cuts": cuts,
        "nodes": model["nodes"],
        "edges": model["edges"],
        "itineraries": itineraries,
        "audit": model.get("audit", []),
        "challenge_statements": {
            "Challenge.lean": challenge_lean,
            "Main.lean": main_lean,
            "Statements.lean": statements_lean,
        },
    }

    ir_path = OUT_DIR / "formal-core-ir.json"
    ir_bytes = (json.dumps(formal_core_ir, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
    ir_path.write_bytes(ir_bytes)

    manifest = {
        "capsule_id": "rh-2026-alpoege",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "formal_core_ir_sha256": hashlib.sha256(ir_bytes).hexdigest(),
        "upstream_sources": manifest_sources,
        "credits": [
            {
                "role": "Original Lean 4 formalization of RH & Dirichlet GRH (2026-11-20)",
                "authors": "Levent Alpöge with Claude (Anthropic)",
                "url": "https://alpo.ge/remark.pdf",
            },
            {
                "role": "Verification & Comparator setup",
                "authors": "Lean FRO, Mathlib community, Andrew Sutherland, Simon DeDeo, et al.",
                "url": "https://github.com/leanprover-community/riemann-hypothesis",
            },
            {
                "role": "Architectural IR, Proof Guide & Proof Atlas (0BSD)",
                "authors": "Bartosz Naskręcki (nasqret)",
                "url": "https://github.com/nasqret/riemann-rev",
            },
        ],
    }
    manifest_path = OUT_DIR / "sources-manifest.json"
    manifest_path.write_bytes((json.dumps(manifest, ensure_ascii=False, indent=2) + "\n").encode("utf-8"))

    print(
        f"Generated {ir_path} ({len(strata)} strata, {len(components)} components, "
        f"{len(interfaces)} interfaces, {len(cuts)} cuts, {len(model['nodes'])} Lean nodes)"
    )


if __name__ == "__main__":
    main()
