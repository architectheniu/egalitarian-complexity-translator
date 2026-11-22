**Język:** [English](TOPOLOGY-LAWS.md) | **Polski**

# Prawa Zachowania Topologii (Kontrakt Walidatora OSZP)

Każda kapsuła ETZ (`ect-capsule/1.0`) zostaje odrzucona przez `validator/ect_validate.py`, jeśli naruszy KTÓREKOLWIEK z poniższych 8 praw:

1. **Prawo Zgodności ze Schematem**: Kapsuła przechodzi ścisłą walidację względem `spec/ect-capsule.schema.json` (JSON Schema Draft 2020-12).
2. **Prawo Kompletności Językowej**: Każdy zadeklarowany język (`pl`, `en`, ...) dostarcza komplet pięciu soczewek (`L0`, `L1`, `L2`, `L3`, `L4`) dla każdej warstwy, każdego komponentu, każdego globalnego cięcia oraz każdego interfejsu obecnego w `formal_core_ir`.
3. **Prawo Monotonicznej Wierności**: Dla każdej pary `(component_id, lang)` wartości `fidelity_score` spełniają warunek:
   `0.0 < L0 <= L1 <= L2 <= L3 < L4 == 1.0`.
4. **Prawo Obowiązkowej Uczciwości Pęknięcia**: Dla każdej trójki `(component_id, lang, level)` oraz `(cut_id, lang, level)`:
   - Pole `loss_meter.where_metaphor_breaks` MUSI być niepustym opisem (`len >= 12`).
   - Dla poziomów `L0..L3` lista `loss_meter.what_is_omitted` MUSI zawierać co najmniej jeden jawny element.
5. **Prawo Kalibracji Statusu Topologii**: Wyłącznie poziom `L4` może deklarować `topology_status == "exact_isomorphism"`; poziomy `L0..L3` muszą deklarować `"lossy_analogy"` albo `"faithful_projection"`.
6. **Prawo Integralności Referencyjnej Grafu**:
   - Każdy komponent wskazuje istniejące ID warstwy w `formal_core_ir.strata`.
   - Każdy interfejs (`from`, `to`) wskazuje istniejące ID komponentów w `formal_core_ir.components` (bez pętli własnych).
   - Każda ścieżka (`itinerary.component_path`) wskazuje istniejące ID komponentów.
7. **Prawo Acykliczności DAG i Osiągalności Celu**: Graf zależności tworzony przez `formal_core_ir.interfaces` musi być acykliczny (DAG), a każdy węzeł źródłowy w warstwie początkowej musi posiadać ścieżkę prowadzącą do końcowego węzła docelowego (`endpoints`).
8. **Prawo Pochodzenia i Statusu Epistemicznego**: Obiekt `formal_core_ir.pins` musi wskazywać lustro/źródło, pin commita lub wersji oraz toolchain, a `epistemic_status` musi jawnie rozdzielać weryfikację maszynową od ludzkiej recenzji naukowej.
