export type ZoomLevel = "L0" | "L1" | "L2" | "L3" | "L4";
export type Language = "pl" | "en";
export type StratumId = "arith" | "est" | "ana" | "dest" | string;
export type TopologyStatus = "lossy_analogy" | "faithful_projection" | "exact_isomorphism";

export const ZOOM_LEVELS: ZoomLevel[] = ["L0", "L1", "L2", "L3", "L4"];

export interface LossMeter {
  fidelity_score: number;
  compression_ratio: string;
  topology_status: TopologyStatus;
  what_is_omitted: string[];
  where_metaphor_breaks: string;
}

export interface ComponentZoomLens {
  title: string;
  headline: string;
  explanation: string;
  key_insight: string;
  analogy_anchor: string;
  loss_meter: LossMeter;
}

export interface CutZoomLens {
  title: string;
  statement: string;
  intuition: string;
  loss_meter: LossMeter;
}

export interface StratumZoomLens {
  title: string;
  summary: string;
}

export interface LeanAnchor {
  id: string;
  declaration: string;
  module: string;
  lines: number[];
  kind: string;
  tier: string;
  url: string;
  excerpt: string;
}

export interface FormalStratum {
  id: string;
  order: number;
  color: string;
  title_raw: string;
  blurb_raw: string;
}

export interface FormalComponent {
  id: string;
  n: number;
  stratum: string;
  title_raw: string;
  kicker: string;
  gist_raw: string;
  node_count?: number;
  node_ids?: string[];
  lean_anchors?: LeanAnchor[];
}

export interface FormalInterface {
  id: string;
  from: string;
  to: string;
  label_raw: string;
  lean?: string;
  url?: string;
}

export interface FormalCut {
  id: string;
  title_raw: string;
  lean?: string;
  premise_latex?: string;
}

export interface EpistemicStatus {
  headline: string;
  detail?: string;
  machine_verification: string;
  human_review: string;
  axioms: string[];
  archive_stats?: {
    lean_files: number;
    total_lines: number;
    non_blank_lines: number;
    theorem_lemma_declarations: number;
    def_struct_declarations: number;
    rh_reachable_declarations: number;
    rh_placed_declarations: number;
  };
  subjects_footprint?: {
    categories: Record<string, number>;
    top_topics: Record<string, number>;
  };
  external_sources?: Array<{ label: string; url: string }>;
  as_of?: string;
}

export interface ItineraryStepNote {
  component_id: string;
  note_by_level: Record<ZoomLevel, string>;
}

export interface ItineraryLocale {
  title: string;
  question: string;
  step_notes: ItineraryStepNote[];
}

export interface GuidedItinerary {
  id: string;
  is_architect_default?: boolean;
  component_path: string[];
  lean_node_path?: string[];
  pl: ItineraryLocale;
  en: ItineraryLocale;
}

export interface LevelMetaEntry {
  label: Record<Language, string>;
  audience: Record<Language, string>;
  description: Record<Language, string>;
}

export interface ComplexityCapsule {
  "@context": Record<string, unknown>;
  "@type": "ect:ComplexityCapsule";
  schema_version: "ect-capsule/1.0";
  protocol: "OSZP-1.0";
  id: string;
  metadata: {
    title: Record<string, string>;
    subtitle: Record<string, string>;
    domain: string;
    created_at: string;
    license: string;
    authors?: string[];
    source_credits?: Array<{ role: string; authors: string; url: string }>;
    manifesto_links?: Record<string, string>;
  };
  formal_core_ir: {
    schema: string;
    title_raw?: string;
    pins: {
      mirror: string;
      mirror_commit: string;
      toolchain: string;
      mathlib?: string;
      archive_sha256?: string;
      pdf_sha256?: string;
    };
    epistemic_status: EpistemicStatus;
    strata: FormalStratum[];
    components: FormalComponent[];
    interfaces: FormalInterface[];
    cuts: FormalCut[];
    nodes?: Array<Record<string, unknown>>;
    edges?: Array<Record<string, unknown>>;
    itineraries?: Array<Record<string, unknown>>;
    audit?: Array<{ node: string; title: string; acceptance: string }>;
    challenge_statements?: Record<string, string>;
  };
  lenses: {
    languages: string[];
    levels: ZoomLevel[];
    level_meta: Record<ZoomLevel, LevelMetaEntry>;
    strata: Record<string, Record<string, Record<ZoomLevel, StratumZoomLens>>>;
    components: Record<string, Record<string, Record<ZoomLevel, ComponentZoomLens>>>;
    cuts: Record<string, Record<string, Record<ZoomLevel, CutZoomLens>>>;
    interfaces: Record<string, Record<string, Record<ZoomLevel, string>>>;
    itineraries: GuidedItinerary[];
  };
  cross_model_audit_ref?: string;
}

export interface CrossModelAuditEntry {
  model_id: string;
  model_label: string;
  provider: string;
  mode: string;
  reconstruction: {
    stratum_order_upstream_to_downstream: string[];
    cut_zeta_summary: string;
    cut_dirichlet_summary: string;
    exponent_budget: {
      e_D: number;
      e_L: number;
      effective_exponent_formula: string;
      why_epsilon_zero_not_needed: string;
    };
    l1_intuitive_synthesis_en: string;
    l1_intuitive_synthesis_pl: string;
    epistemic_status_distinction: string;
    where_stepanov_metaphor_breaks: string;
  };
  scores: {
    total_score: number;
    dimensions: Record<string, number>;
  };
}

export interface CrossModelAuditReport {
  schema: string;
  capsule_id: string;
  executed_at: string;
  input_ir_path: string;
  models: CrossModelAuditEntry[];
}
