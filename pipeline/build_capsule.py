"""Assemble canonical JSON-LD capsule from Formal Core IR and modular bilingual lenses."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CAP_DIR = ROOT / "capsules" / "rh-2026-alpoege"
LENS_DIR = CAP_DIR / "lenses"


def main() -> None:
    formal_core_ir = json.loads((CAP_DIR / "formal-core-ir.json").read_text(encoding="utf-8"))
    sources_manifest = json.loads((CAP_DIR / "sources-manifest.json").read_text(encoding="utf-8"))

    strata_cuts_ifaces = json.loads((LENS_DIR / "strata-cuts-interfaces.json").read_text(encoding="utf-8"))
    comp_arith_est = json.loads((LENS_DIR / "components-arith-est.json").read_text(encoding="utf-8"))
    comp_ana_dest = json.loads((LENS_DIR / "components-ana-dest.json").read_text(encoding="utf-8"))

    merged_components: dict[str, dict] = {}
    merged_components.update(comp_arith_est)
    merged_components.update(comp_ana_dest)

    capsule = {
        "@context": {
            "ect": "https://architectheniu.github.io/egalitarian-complexity-translator/ns/",
            "schema": "https://schema.org/",
            "formal_core_ir": "ect:formalCoreIR",
            "lenses": "ect:semanticZoomLenses",
            "loss_meter": "ect:compressionLossMeter",
        },
        "@type": "ect:ComplexityCapsule",
        "schema_version": "ect-capsule/1.0",
        "protocol": "OSZP-1.0",
        "id": "rh-2026-alpoege",
        "metadata": {
            "title": {
                "en": "Riemann Hypothesis & Dirichlet GRH Proof Architecture (Nov 2026)",
                "pl": "Architektura Dowodu Hipotezy Riemanna i GRH Dirichleta (listopad 2026)",
            },
            "subtitle": {
                "en": "17.37M lines of Lean 4 translated into a 5-level bilingual cognitive microscope with mandatory compression loss bounds.",
                "pl": "17,37 mln linii kodu Lean 4 przełożone na 5-poziomowy, dwujęzyczny mikroskop poznawczy z jawnymi granicami pęknięcia metafory.",
            },
            "domain": "analytic-arithmetic-number-theory",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "license": "CC-BY-4.0 (capsule & lenses); upstream sources under MIT / 0BSD",
            "authors": [
                "Marcin Marek Lewandowski (The Architect)",
                "Gemini 4 Neon (Google)",
                "Claude Opus 5.5 (Anthropic)",
            ],
            "source_credits": sources_manifest["credits"],
            "manifesto_links": {
                "pl": "https://heniu.blog/dziennik/010/",
                "en": "https://heniu.blog/en/dziennik/010/",
            },
        },
        "formal_core_ir": formal_core_ir,
        "lenses": {
            "languages": ["pl", "en"],
            "levels": ["L0", "L1", "L2", "L3", "L4"],
            "level_meta": strata_cuts_ifaces["level_meta"],
            "strata": strata_cuts_ifaces["strata"],
            "components": merged_components,
            "cuts": strata_cuts_ifaces["cuts"],
            "interfaces": strata_cuts_ifaces["interfaces"],
            "itineraries": strata_cuts_ifaces["itineraries"],
        },
        "cross_model_audit_ref": "audits/cross-model-rh-2026.json",
    }

    out_path = CAP_DIR / "capsule.jsonld"
    capsule_bytes = (json.dumps(capsule, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
    out_path.write_bytes(capsule_bytes)

    web_data_dir = ROOT / "web" / "public" / "data"
    web_data_dir.mkdir(parents=True, exist_ok=True)
    (web_data_dir / "capsule.jsonld").write_bytes(capsule_bytes)
    print(f"Built {out_path} ({out_path.stat().st_size:,} bytes, {len(merged_components)} components) & synced web/public/data/")


if __name__ == "__main__":
    main()
