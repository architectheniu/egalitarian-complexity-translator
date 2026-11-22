**Język:** [English](OSZP-SPEC.md) | **Polski**

# Otwarty Protokół Przybliżenia Semantycznego (OSZP / `ect-capsule/1.0`)

## 1. Cel protokołu

**Otwarty Protokół Przybliżenia Semantycznego (OSZP — Open Semantic Zoom Protocol)** definiuje przenośny, niezależny od dostawcy AI format kontenera (`capsule.jsonld`) oraz pośrednią reprezentację Rdzenia Formalnego (`formal-core-ir.json`). Służy do tłumaczenia hipergęstych obiektów formalnych (dowodów zweryfikowanych przez kompilatory, złożonych teorii fizycznych, wielkich architektur systemowych) na skalibrowaną ludzką intuicję bez utraty topologii przyczynowej i bez ukrywania błędów uproszczenia.

OSZP wymusza dwa niezmienniki architektoniczne:
1. **Egalitaryzm Krzemu**: Graf zależności przyczynowych, zakotwiczone identyfikatory formalne i rejestr statusu epistemicznego znajdują się wewnątrz `formal_core_ir`, w pełni odizolowane od soczewek opisowych. Dowolny model AI może badać, audytować i renderować dokładnie ten sam szkielet.
2. **Egalitaryzm Biologii**: Każdy komponent oraz każde cięcie logiczne jest odwzorowane na pięciu dyskretnych poziomach przybliżenia (`L0`–`L4`), z których każdy jest obowiązkowo sprzężony z **Licznikiem Straty Kompresji** (`loss_meter`).

---

## 2. Cztery warstwy

| Warstwa | Obiekt w kapsule | Właściciel | Niezmiennik |
|---|---|---|---|
| **1. Rdzeń Formalny IR** | `formal_core_ir` | Źródło formalne / weryfikator | Niezmienny przy zmianie zoomu; przypięty przez hashe SHA-256 i ID commitów |
| **2. Silnik Soczewek Semantycznych** | `lenses.strata`, `lenses.components`, `lenses.cuts`, `lenses.interfaces`, `lenses.itineraries` | Dwujęzyczni tłumacze (człowiek + AI) | Pięć poziomów (`L0`–`L4`) zachowujących kierunek grafu i zależności |
| **3. Licznik Straty Kompresji** | `loss_meter` w każdym węźle i cięciu | Tłumacz + Walidator Schematu | Obowiązkowe `fidelity_score`, `compression_ratio`, `topology_status`, `what_is_omitted`, `where_metaphor_breaks` |
| **4. Interfejs Ludzki** | Mikroskop Audiowizualny + Laboratoria Intuicji | Środowisko przeglądarkowe | Renderowanie wyłącznie po stronie klienta, zdolne wczytać dowolną poprawną kapsułę `.capsule.jsonld` |

---

## 3. Taksonomia poziomów zoomu (`L0`–`L4`)

- **`L0` — Opowieść / Dziecko (~10 lat)**  
  Namacalne metafory zmysłowe, przestrzenne, muzyczne lub z codziennego życia. Zero równań symbolicznych i żargonu technicznego. Musi jednak zachować prawdziwy kierunek strzałki przyczynowo-skutkowej.
- **`L1` — Architekt Intuicji**  
  Wysokorozdzielcza mechanika pojęciowa: punkty równowagi, wąskie gardła, analogie sygnału i ciśnienia, sprzężenia ograniczające oraz przejścia fazowe. Projektowana z myślą o osobach operujących intuicją strukturalną bez aparatu formalnego.
- **`L2` — Inżynier Systemów / Praktyk**  
  Modułowe wejścia i wyjścia, niezmienniki, wykładniki skalowania, kolejność wyboru parametrów (choreografia kwantyfikatorów) i uzasadnienie architektoniczne.
- **`L3` — Badacz Dziedzinowy**  
  Pełny aparat pojęciowy dziedziny, konkretne obiekty matematyczne, strategie dowodowe i twierdzenia (np. podniesienia theta na grupach unitarnych, transformaty Mellina, zlokalizowane twierdzenie Landaua, okna kohomologii Galois).
- **`L4` — Rdzeń Formalny / Kotwica Jądra**  
  Dokładne nazwy eksportowanych twierdzeń, moduły Lean, piny commitów Git, sumy kontrolne SHA-256, lista aksjomatów oraz jawna **Granica Specyfikacji / Luka Formalizacji** (oddzielająca kompilację maszynową od recenzji ludzkiej).

---

## 4. Specyfikacja Licznika Straty Kompresji (`loss_meter`)

Każda soczewka komponentu na każdym poziomie przybliżenia (`L0`–`L4`) MUSI zawierać obiekt `loss_meter`:

```json
{
  "fidelity_score": 0.48,
  "compression_ratio": "~25,000:1",
  "topology_status": "faithful_projection",
  "what_is_omitted": [
    "Jawna dekompozycja na grupy adeleowe",
    "Ilościowe stałe błędu w wieży Behrenda"
  ],
  "where_metaphor_breaks": "Fizyczna lina drga lokalnie pod wpływem wiatru; prosta krytyczna Re(s) = 1/2 to globalna symetria przedłużenia analitycznego, gdzie przesunięcie choćby jednego zera zaburza oscylacje błędu liczb pierwszych w całym wszechświecie arytmetycznym."
}
```

Zasady:
- `fidelity_score`: liczba zmiennoprzecinkowa z `[0.0, 1.0]`, monotonicznie niemalejąca wzdłuż `L0 <= L1 <= L2 <= L3 < L4` przy `L4.fidelity_score == 1.0`.
- `topology_status`:
  - `"lossy_analogy"` — metafora ilustracyjna; pomija wewnętrzny mechanizm (`L0`, czasem `L1`)
  - `"faithful_projection"` — zachowuje zależności przyczynowe i kluczowe niezmienniki, odrzucając detale techniczne (`L1`–`L3`)
  - `"exact_isomorphism"` — dokładne dopasowanie do specyfikacji formalnej (wyłącznie `L4`)
- `what_is_omitted`: niepusta lista konkretnych pominiętych mechanizmów na `L0`–`L3`; pusta tablica `[]` jest dopuszczalna wyłącznie na `L4`.
- `where_metaphor_breaks`: **niepusty ciąg znaków na WSZYSTKICH poziomach `L0`–`L4`**. Na poziomie `L4` rejestruje *Lukę Formalizacji*: czego nie załatwia nawet czysta kompilacja (zaufanie do jądra weryfikatora, zgodność definicji w Mathlib, ludzka recenzja i zrozumienie).

---

## 5. Przenośność i interoperacyjność JSON-LD

Plik kapsuły (`capsule.jsonld`) jest samowystarczalnym dokumentem JSON-LD (`@type: "ect:ComplexityCapsule"`). Każdy zgodny z protokołem mikroskop MUSI potrafić wczytać dowolny plik `.capsule.jsonld` dostarczony przez użytkownika, zwalidować go względem `spec/ect-capsule.schema.json` oraz 8 Praw Zachowania Topologii (`spec/TOPOLOGY-LAWS.pl.md`), a następnie wyrenderować jego interaktywną mapę bez zmian w kodzie aplikacji.
