import { Language, TopologyStatus } from "../types/ect";

export interface UiStrings {
  brandTitle: string;
  brandSubtitle: string;
  tabMap: string;
  tabLabs: string;
  tabProtocol: string;
  audioOn: string;
  audioOff: string;
  narratorOn: string;
  narratorOff: string;
  loadCapsuleBtn: string;
  crossModelBtn: string;
  downloadCapsule: string;
  downloadIr: string;
  zoomHeading: string;
  zoomHint: string;
  tourHeading: string;
  tourPlay: string;
  tourPause: string;
  tourPrev: string;
  tourNext: string;
  tourStepOf: string;
  architectBadge: string;
  globalCutsHeading: string;
  clickToInspectCut: string;
  upstreamTitle: string;
  downstreamTitle: string;
  lossMeterTitle: string;
  fidelityLabel: string;
  compressionLabel: string;
  statusLabel: string;
  omittedLabel: string;
  breaksLabel: string;
  leanAnchorsTitle: string;
  subjectsFootprintTitle: string;
  epistemicTitle: string;
  machineCheckLabel: string;
  humanReviewLabel: string;
  axiomsLabel: string;
  embeddedLabPrompt: string;
  statusNames: Record<TopologyStatus, string>;
  labsIntroTitle: string;
  labsIntroDesc: string;
  crossModelTitle: string;
  crossModelDesc: string;
  copyPromptBtn: string;
  copiedBtn: string;
  uploadTitle: string;
  uploadDesc: string;
  uploadDrop: string;
  resetDefaultBtn: string;
  closeBtn: string;
}

export const UI_STRINGS: Record<Language, UiStrings> = {
  pl: {
    brandTitle: "Egalitarny Translator Złożoności",
    brandSubtitle: "OSZP 1.0 • Semantyczny Mikroskop Audiowizualny",
    tabMap: "Mapa Topologii (14 węzłów)",
    tabLabs: "Laboratoria Intuicji (4 symulacje)",
    tabProtocol: "Status Epistemiczny i Rdzeń",
    audioOn: "Dźwięk / Symfonia WŁ.",
    audioOff: "Dźwięk WYŁ.",
    narratorOn: "Lektor WŁ.",
    narratorOff: "Lektor WYŁ.",
    loadCapsuleBtn: "Wczytaj .capsule.jsonld",
    crossModelBtn: "Audyt Modeli AI",
    downloadCapsule: "Pobierz capsule.jsonld",
    downloadIr: "Pobierz formal-core-ir.json",
    zoomHeading: "Rozdzielczość Semantyczna",
    zoomHint: "Klawisze 1–5 zmieniają soczewkę bez naruszania grafu prawdy",
    tourHeading: "Ścieżka Przewodnia",
    tourPlay: "Auto-Przewodnik",
    tourPause: "Pauza",
    tourPrev: "Wstecz",
    tourNext: "Dalej",
    tourStepOf: "Krok",
    architectBadge: "Zalecana ścieżka startowa",
    globalCutsHeading: "Globalne Cięcia Architektury (Global Cuts)",
    clickToInspectCut: "Kliknij, aby otworzyć cięcie",
    upstreamTitle: "Zasilanie (Wymagania wstępne)",
    downstreamTitle: "Przekazuje wynik do",
    lossMeterTitle: "Licznik Straty Kompresji",
    fidelityLabel: "Wierność strukturalna",
    compressionLabel: "Kompresja gęstości",
    statusLabel: "Reżim odwzorowania",
    omittedLabel: "Co ta soczewka celowo pomija",
    breaksLabel: "Gdzie metafora zaczyna pękać",
    leanAnchorsTitle: "Kotwice Formalne Lean 4 (przypięty commit)",
    subjectsFootprintTitle: "Odcisk Dyscyplin arXiv (647 905 deklaracji w riemannHypothesis)",
    epistemicTitle: "Rejestr Uczciwości Epistemicznej",
    machineCheckLabel: "Kompilacja maszynowa i jądra",
    humanReviewLabel: "Recenzja ludzka (Peer Review)",
    axiomsLabel: "Aksjomaty",
    embeddedLabPrompt: "Interaktywne Laboratorium dla tego węzła",
    statusNames: {
      lossy_analogy: "Analogia stratna (metafora)",
      faithful_projection: "Wierna projekcja topologiczna",
      exact_isomorphism: "Dokładna kotwica formalna",
    },
    labsIntroTitle: "Laboratoria Intuicji Audiowizualnej",
    labsIntroDesc:
      "Cztery żywe symulatory sprzężone z syntezą Web Audio i prawdziwymi obliczeniami (akceleracja Borweina dla ζ(s), sito Eratostenesa dla sum pierwszych, choreografia wykładników oraz most Stiepanow → theta).",
    crossModelTitle: "Egalitaryzm Krzemu: Audyt Krzyżowy Modeli AI",
    crossModelDesc:
      "Każdy model AI otrzymał wyłącznie czysty Rdzeń Formalny IR (formal-core-ir.json) — bez jakichkolwiek opisowych soczewek — i musiał niezależnie odtworzyć topologię, cięcia, budżet wykładników oraz granice metafory.",
    copyPromptBtn: "Kopiuj prompt Audytu IR dla dowolnego AI",
    copiedBtn: "Skopiowano!",
    uploadTitle: "Przenośność OSZP: Wczytaj dowolną kapsułę (.capsule.jsonld)",
    uploadDesc:
      "Mikroskop jest uniwersalnym czytnikiem protokołu ect-capsule/1.0. Wczytaj własny plik JSON-LD z dowolnej dziedziny — walidator sprawdzi wszystkie 8 Praw Zachowania Topologii po stronie przeglądarki.",
    uploadDrop: "Wybierz plik .jsonld / .json",
    resetDefaultBtn: "Przywróć kapsułę RH 2026",
    closeBtn: "Zamknij",
  },
  en: {
    brandTitle: "Egalitarian Complexity Translator",
    brandSubtitle: "OSZP 1.0 • Audiovisual Semantic Microscope",
    tabMap: "Topology Map (14 nodes)",
    tabLabs: "Intuition Labs (4 sims)",
    tabProtocol: "Epistemic Ledger & IR",
    audioOn: "Audio / Symphony ON",
    audioOff: "Audio OFF",
    narratorOn: "Voice ON",
    narratorOff: "Voice OFF",
    loadCapsuleBtn: "Load .capsule.jsonld",
    crossModelBtn: "Cross-Model AI Audit",
    downloadCapsule: "Download capsule.jsonld",
    downloadIr: "Download formal-core-ir.json",
    zoomHeading: "Semantic Zoom Resolution",
    zoomHint: "Keys 1–5 switch lenses without altering the underlying truth DAG",
    tourHeading: "Guided Itinerary",
    tourPlay: "Auto-Tour",
    tourPause: "Pause",
    tourPrev: "Prev",
    tourNext: "Next",
    tourStepOf: "Step",
    architectBadge: "Recommended starting path",
    globalCutsHeading: "Global Architectural Cuts",
    clickToInspectCut: "Click to inspect cut",
    upstreamTitle: "Upstream Inputs (Prerequisites)",
    downstreamTitle: "Feeds Downstream Into",
    lossMeterTitle: "Compression Loss Meter",
    fidelityLabel: "Structural fidelity",
    compressionLabel: "Density compression",
    statusLabel: "Projection mode",
    omittedLabel: "What this lens intentionally omits",
    breaksLabel: "Where the Metaphor Breaks",
    leanAnchorsTitle: "Pinned Lean 4 Formal Anchors",
    subjectsFootprintTitle: "arXiv Subject Footprint (647,905 reachable declarations)",
    epistemicTitle: "Epistemic Honesty Ledger",
    machineCheckLabel: "Machine compilation & kernels",
    humanReviewLabel: "Human peer review status",
    axiomsLabel: "Axioms",
    embeddedLabPrompt: "Interactive Intuition Lab for this node",
    statusNames: {
      lossy_analogy: "Lossy Analogy",
      faithful_projection: "Faithful Topological Projection",
      exact_isomorphism: "Exact Formal Anchor",
    },
    labsIntroTitle: "Audiovisual Intuition Laboratories",
    labsIntroDesc:
      "Four real-time mathematical instruments coupling live numerical computation (Borwein-accelerated ζ(s), Sieve of Eratosthenes prime sums, quantifier choreography, Stepanov-to-theta chains) with Web Audio synthesis.",
    crossModelTitle: "Silicon Egalitarianism: Cross-Model AI Audit",
    crossModelDesc:
      "Each AI architecture received ONLY the stripped Formal Core IR (formal-core-ir.json) with zero narrative prose lenses and independently reconstructed the dependency DAG, global cuts, exponent algebra, and metaphor fractures.",
    copyPromptBtn: "Copy IR Audit Prompt for Any AI",
    copiedBtn: "Copied!",
    uploadTitle: "OSZP Portability: Load Any Capsule (.capsule.jsonld)",
    uploadDesc:
      "This microscope is a universal ect-capsule/1.0 protocol reader. Load any valid capsule from any domain — the client validator enforces all 8 Topology Preservation Laws live.",
    uploadDrop: "Choose .jsonld / .json file",
    resetDefaultBtn: "Restore RH 2026 Capsule",
    closeBtn: "Close",
  },
};
