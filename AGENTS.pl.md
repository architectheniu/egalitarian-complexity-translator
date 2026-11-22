**Język:** [English](AGENTS.md) | **Polski**

# AGENTS.pl.md — Kontrakt Maszynowy dla Architektur AI

Ten plik stanowi **kontrakt Egalitaryzmu Krzemu** dla dowolnego systemu AI (`Gemini`, `Claude`, `GPT`, `Grok`, `DeepSeek`, modeli lokalnych przez `llama.cpp`/`koboldcpp` oraz przyszłych architektur) pracującego z kapsułami **Egalitarnego Translatora Złożoności (ETZ / ECT)**.

## 1. Podstawowy niezmiennik: Oddzielenie Szkieletu Prawdy od Soczewek Narracyjnych

Każda kapsuła ETZ (`ect-capsule/1.0`) składa się z dwóch ściśle rozdzielonych warstw:
1. **`formal_core_ir`** (lub osobny plik `formal-core-ir.json`): Autorytatywny graf zależności (`strata`, `components`, `interfaces`, `cuts`, `nodes`, `edges`, `pins`, `epistemic_status`).
2. **`lenses`**: Wielorozdzielcze tłumaczenia dla ludzi (`L0`, `L1`, `L2`, `L3`, `L4`) w każdym zadeklarowanym języku (`pl`, `en`, ...).

### Twarde reguły dla wszystkich agentów
1. **Nigdy nie zmyślaj topologii**: Nie wolno wymyślać komponentów, krawędzi zależności, nazw twierdzeń, hashy commitów ani tez dowodowych nieobecnych w `formal_core_ir`.
2. **Szanuj status epistemiczny**: Rozróżniaj wyraźnie między:
   - *Maszynową kompilacją formalną i powtórzeniem weryfikacji w jądrach* (np. jądro Lean + niezależne jądro Rust `con-leche` / `nanoda` + `comparator` względem Mathlib), a
   - *Ludzką recenzją naukową (peer review) i zrozumieniem pojęciowym* (które mogą być nadal w toku).
3. **Nigdy nie pomijaj `loss_meter`**: Każda soczewka na każdym poziomie (`L0`–`L4`) MUSI deklarować:
   - `fidelity_score` w przedziale `[0.0, 1.0]`, monotonicznie niemalejące (`L0 <= L1 <= L2 <= L3 < L4 == 1.0`).
   - `compression_ratio` (tekst, np. `"~10^6:1"` → `"1:1"`).
   - `topology_status` (`"lossy_analogy" | "faithful_projection" | "exact_isomorphism"`).
   - `what_is_omitted` (niepusta lista pominiętych mechanizmów na `L0..L3`; pusta tablica `[]` dozwolona wyłącznie na `L4`).
   - `where_metaphor_breaks` (OBOWIĄZKOWY niepusty opis na WSZYSTKICH poziomach `L0..L4`; na `L4` dokumentuje *Lukę Formalizacji / Granicę Specyfikacji*).
4. **Zachowuj osiągalność w grafie**: Każde uproszczenie na `L0` lub `L1` musi monotonicznie odpowiadać dokładnej roli przyczynowej danego węzła w grafie DAG od zaplecza ku celowi (`arith -> est -> ana -> dest`). Nigdy nie odwracaj kierunku przyczynowego ani nie przedstawiaj założenia otwartego jako udowodnionego lematu.

## 2. Kalibracja poziomów przybliżenia (`L0`–`L4`)

| Poziom | Odbiorca | Zasada kompresji |
|---|---|---|
| `L0` | Opowieść / Dziecko (~10 lat) | Konkretne metafory zmysłowe, fizyczne lub muzyczne. Zero równań i żargonu. Zachowuje kierunek przyczynowości. |
| `L1` | Architekt Intuicji | Wysokorozdzielcza intuicja strukturalna: bilanse, sygnały, ograniczenia, przejścia fazowe, wąskie gardła. Dla myślących obrazowo bez żargonu formalnego. |
| `L2` | Inżynier Systemów / Praktyk | Modułowe wejścia, wyjścia, niezmienniki, wykładniki skalowania, kolejność wyboru parametrów i rola warstwy w maszynie. |
| `L3` | Badacz Dziedzinowy | Precyzyjny słownik dziedziny, strategie dowodowe, obiekty algebraiczne i analityczne, oszacowania i warunki matematyczne. |
| `L4` | Rdzeń Formalny / Kotwica Jądra | Dokładne identyfikatory twierdzeń, ścieżki plików/linii/commitów, aksjomaty, stan weryfikacji i jawna Granica Specyfikacji. |

## 3. Weryfikacja i audyty krzyżowe między modelami

- Walidacja dowolnej kapsuły:
  ```bash
  python validator/ect_validate.py capsules/rh-2026-alpoege/capsule.jsonld
  ```
- Czysty Rdzeń Formalny IR (bez soczewek narracyjnych):
  `capsules/rh-2026-alpoege/formal-core-ir.json`
- Dowolny model AI może przejść test rekonstrukcji `strata`, `cuts`, `exponent budget`, `L1 metaphor` oraz `where_metaphor_breaks` wyłącznie z `formal-core-ir.json` i dopisać swój wynik zgodnie ze strukturą `audits/cross-model-rh-2026.json`.
