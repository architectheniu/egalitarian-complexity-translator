**Język:** [English](ARCHITECTURE.md) | **Polski**

# Architektura Techniczna: Egalitarny Translator Złożoności (ETZ v1.0)

Ten dokument opisuje wnętrze inżynierskie systemu ETZ — od deterministycznego poboru Rdzenia Formalnego IR i walidacji 8 Praw Zachowania Topologii aż po działający w przeglądarce Audiowizualny Mikroskop Semantyczny.

---

## 1. Pipeline poboru i składania kapsuł (`pipeline/`)

1. **`pipeline/ingest_riemann_2026.py`**  
   Pobiera przypięte źródła otwarte:
   - `nasqret/riemann-rev/data/model.json` (`riemann-rev-model/1`, licencja 0BSD): 4 warstwy, 14 komponentów architektonicznych, 14 formalnych interfejsów, 2 globalne cięcia, 109 węzłów Lean, 113 krawędzi, 5 ścieżek oraz rejestr weryfikacji.
   - `nasqret/riemann-proof-atlas/evidence/subjects.json` (0BSD): rozkład dyscyplin arXiv w obrębie 647 905 deklaracji osiągalnych z `riemannHypothesis`.
   - `leanprover-community/riemann-hypothesis`: dosłowne pliki `Challenge.lean`, `Main.lean` i `Statements.lean` (przypięty commit bazowy `40e56bab026552e089d7afcfeff08d2defb9c005`).

   Generuje `capsules/rh-2026-alpoege/formal-core-ir.json` oraz `sources-manifest.json` wraz z sumami SHA-256.

2. **`pipeline/generate_lenses.py`**  
   Steruje wielowątkowym generowaniem dwujęzycznych soczewek (`pl`, `en`) na poziomach `L0`–`L4` za pomocą `claude-opus-5-5` zakotwiczonym ściśle w `formal-core-ir.json`, tworząc:
   - `lenses/strata-cuts-interfaces.json`
   - `lenses/components-arith-est.json`
   - `lenses/components-ana-dest.json`

3. **`pipeline/build_capsule.py`**  
   Łączy Rdzeń Formalny IR z plikami soczewek w przenośną kapsułę JSON-LD (`capsules/rh-2026-alpoege/capsule.jsonld`) oraz kopiuje dane uruchomieniowe do `web/public/data/`.

---

## 2. Walidator Schematu i 8 Praw Topologii (`validator/`)

`validator/ect_validate.py` weryfikuje kapsuły względem `spec/ect-capsule.schema.json` (JSON Schema Draft 2020-12) i egzekwuje wszystkie 8 Praw Zachowania Topologii (`spec/TOPOLOGY-LAWS.pl.md`):
- Kompletność dwujęzyczna wszystkich warstw, komponentów, cięć, interfejsów i ścieżek.
- Monotoniczna wierność (`0 < L0 <= L1 <= L2 <= L3 < L4 == 1.0`).
- Obowiązkowe pole `where_metaphor_breaks` na każdym poziomie (`L0`–`L4`) i niepuste `what_is_omitted` dla `L0`–`L3`.
- Ścisła kalibracja `topology_status` (`exact_isomorphism` dozwolony wyłącznie na `L4`).
- Acykliczność grafu DAG (algorytm Kahna) oraz osiągalność końcowego celu `endpoints` z każdego źródła warstwy początkowej.

Dokładnie ta sama logika 8 Praw działa w TypeScript w `web/src/utils/capsuleValidator.ts`, sprawdzając na żywo w przeglądarce każdą kapsułę `.capsule.jsonld` wczytaną przez użytkownika.

---

## 3. Audyt Krzyżowy Egalitaryzmu Krzemu (`audits/`)

`audits/run_cross_model_audit.py` usuwa WSZYSTKIE ludzkie opisy z `formal-core-ir.json` i wystawia niezależne architektury AI (`Gemini 4 Neon`, `Claude Opus 5.5`, `Claude Fable 5.2`, `Claude Fable 5.1`) z zablokowanymi narzędziami (`--tools ""`) na ślepy test rekonstrukcji:
- Kolejności 4 warstw DAG (`arith -> est -> ana -> dest`)
- Obu globalnych cięć (`cut-zeta`, `cut-dirichlet`)
- Algebry budżetu strat wykładników ($e_D=2, e_L=0 \implies \frac{1}{2}+9\varepsilon \le \theta$)
- Dwujęzycznej syntezy intuicyjnej `L1`
- Jawnego rozróżnienia kompilacji maszynowej od recenzji ludzkiej oraz wskazania, gdzie pęka metafora Stiepanowa.

---

## 4. Dwuwarstwowy Interfejs Audiowizualny (`web/`)

Aplikacja zbudowana w Vite + React + TypeScript + Tailwind CSS (bez zewnętrznych plików audio i bez backendu):
- **Poziom 1 — Teatr Poznawczy (`src/components/theater/` + `src/audio/theaterAudio.ts`)**: Domyślne 6-scenowe doświadczenie bez żargonu matematycznego (*Fale*, *Zwierciadło*, *Detektor jednokierunkowy*, *Kamień i Kula*, *Gra 1 na 1 z auto-zoomem*, *Granice uczciwości i Raport Intuicji*) sprzężone z dedykowaną syntezą Web Audio (`playWaveBalanceTone`, `playMirrorEcho`, `playDetectorFlip`, `playClayPress`, `playStoneCrack`, `playTrapLock`).
- **Poziom 2 — Mikroskop Badacza (`src/components/ProofTopologyMap.tsx`, `src/components/labs/`)**:
  - **Akcelerowany ewaluator funkcji dzeta Borweina (`src/math/zeta.ts`)**: Liczy $|\zeta(\sigma + it)|$ dla $t \in [10, 45]$ bezpieczną numerycznie rekurencją 38-wyrazową (dokładność $\sim 10^{-7}$ na zerach nietrywialnych).
  - **Okno liczb pierwszych z sita Eratostenesa (`src/math/zeta.ts`)**: Wylicza prawdziwe oscylacje $\psi(y) - y$ na oknie $[Y, Y^{3/2}]$ względem sufitu $C y^\theta$ i wizualizuje sprzeczność od fałszywego zera $\beta > 0{,}5$.
  - **Czysta synteza Web Audio API (`src/audio/soundEngine.ts`)**: Wspólny kontekst audio oraz opcjonalny lektor `SpeechSynthesis` (`pl-PL` / `en-US`).
