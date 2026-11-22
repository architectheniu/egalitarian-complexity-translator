import { ComplexityCapsule, ZOOM_LEVELS } from "../types/ect";

export interface ClientValidationResult {
  valid: boolean;
  errors: string[];
  summary: string;
}

export function validateCapsuleClient(raw: unknown): ClientValidationResult {
  const errors: string[] = [];
  if (!raw || typeof raw !== "object") {
    return { valid: false, errors: ["File is not a JSON object"], summary: "Invalid JSON" };
  }
  const obj = raw as Partial<ComplexityCapsule>;
  if (obj["@type"] !== "ect:ComplexityCapsule") {
    errors.push('Missing or invalid "@type": expected "ect:ComplexityCapsule"');
  }
  if (obj.schema_version !== "ect-capsule/1.0") {
    errors.push('Unsupported schema_version: expected "ect-capsule/1.0"');
  }
  if (!obj.formal_core_ir || !obj.lenses) {
    errors.push("Capsule missing formal_core_ir or lenses");
    return { valid: false, errors, summary: "Missing core sections" };
  }

  const ir = obj.formal_core_ir;
  const lenses = obj.lenses;
  const compIds = new Set((ir.components ?? []).map((c) => c.id));
  const stratumIds = new Set((ir.strata ?? []).map((s) => s.id));
  const langs = lenses.languages ?? [];

  if (compIds.size === 0 || stratumIds.size === 0 || langs.length === 0) {
    errors.push("Capsule must declare at least 1 stratum, 1 component, and 1 language");
  }

  // Referential + DAG cycle check
  const adj: Record<string, string[]> = {};
  const inDeg: Record<string, number> = {};
  compIds.forEach((id) => {
    adj[id] = [];
    inDeg[id] = 0;
  });

  for (const c of ir.components ?? []) {
    if (!stratumIds.has(c.stratum)) {
      errors.push(`Component "${c.id}" references unknown stratum "${c.stratum}"`);
    }
  }

  for (const iface of ir.interfaces ?? []) {
    if (!compIds.has(iface.from) || !compIds.has(iface.to)) {
      errors.push(`Interface "${iface.id}" has dangling endpoint (${iface.from} -> ${iface.to})`);
    } else if (iface.from === iface.to) {
      errors.push(`Interface "${iface.id}" has self-loop on "${iface.from}"`);
    } else {
      adj[iface.from].push(iface.to);
      inDeg[iface.to] += 1;
    }
  }

  // Kahn topological cycle check
  const queue = Object.keys(inDeg).filter((id) => inDeg[id] === 0);
  const tempDeg = { ...inDeg };
  let visited = 0;
  while (queue.length > 0) {
    const cur = queue.shift()!;
    visited += 1;
    for (const nxt of adj[cur] ?? []) {
      tempDeg[nxt] -= 1;
      if (tempDeg[nxt] === 0) queue.push(nxt);
    }
  }
  if (visited !== compIds.size) {
    errors.push("Topology Law 7 violation: component interface graph contains a directed cycle");
  }

  // Monotonic fidelity & mandatory fracture honesty check
  for (const lang of langs) {
    for (const cid of compIds) {
      const compLang = lenses.components?.[cid]?.[lang];
      if (!compLang) {
        errors.push(`Missing component lens "${cid}.${lang}"`);
        continue;
      }
      const fids: number[] = [];
      for (const lvl of ZOOM_LEVELS) {
        const entry = compLang[lvl];
        if (!entry || !entry.loss_meter) {
          errors.push(`Missing loss_meter on "${cid}.${lang}.${lvl}"`);
          continue;
        }
        const lm = entry.loss_meter;
        if (!lm.where_metaphor_breaks || lm.where_metaphor_breaks.trim().length < 12) {
          errors.push(`Law 4 violation on "${cid}.${lang}.${lvl}": where_metaphor_breaks too short`);
        }
        if (lvl !== "L4" && lm.topology_status === "exact_isomorphism") {
          errors.push(`Law 5 violation on "${cid}.${lang}.${lvl}": exact_isomorphism only allowed at L4`);
        }
        if (lvl !== "L4" && (!lm.what_is_omitted || lm.what_is_omitted.length === 0)) {
          errors.push(`Law 4 violation on "${cid}.${lang}.${lvl}": what_is_omitted cannot be empty`);
        }
        fids.push(lm.fidelity_score);
      }
      if (
        fids.length === 5 &&
        !(0 < fids[0] && fids[0] <= fids[1] && fids[1] <= fids[2] && fids[2] <= fids[3] && fids[3] < fids[4] && fids[4] === 1.0)
      ) {
        errors.push(`Law 3 violation on "${cid}.${lang}": non-monotonic fidelities [${fids.join(", ")}]`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    summary:
      errors.length === 0
        ? `${compIds.size} components, ${(ir.interfaces ?? []).length} interfaces, ${langs.join("/").toUpperCase()} — all OSZP laws passed`
        : `${errors.length} OSZP topology violation(s)`,
  };
}
