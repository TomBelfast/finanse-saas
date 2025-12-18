# 📦 Eksport Komend Cursor

## Status: ✅ Wszystkie komendy wyeksportowane

Wszystkie komendy Cursor zostały wyeksportowane do plików w `.cursor/commands/`.

---

## 📁 Lokalizacja

**Folder:** `.cursor/commands/`

**Pliki:**
- `analyze.md` - Komenda `/sc:analyze` (analiza kodu)
- `index.md` - Komenda `/sc:index` (generowanie indeksu dokumentacji)
- `test.md` - Komenda `/sc:test` (testowanie)
- `refactor.md` - Komenda `/sc:refactor` (refaktoryzacja)
- `review.md` - Komenda `/sc:review` (code review)
- `docs.md` - Komenda `/sc:docs` (generowanie dokumentacji)
- `fix.md` - Komenda `/sc:fix` (naprawa błędów)
- `setup.md` - Komenda `/sc:setup` (konfiguracja projektu)
- `deploy.md` - Komenda `/sc:deploy` (deployment)
- `build.md` - Komenda `/sc:build` (buildowanie projektu)
- `lint.md` - Komenda `/sc:lint` (linting kodu)
- `format.md` - Komenda `/sc:format` (formatowanie kodu)
- `check.md` - Komenda `/sc:check` (sprawdzanie typów)
- `clean.md` - Komenda `/sc:clean` (czyszczenie projektu)
- `install.md` - Komenda `/sc:install` (instalacja zależności)
- `generate.md` - Komenda `/sc:generate` (generowanie kodu)
- `search.md` - Komenda `/sc:search` (wyszukiwanie w kodzie)
- `optimize.md` - Komenda `/sc:optimize` (optymalizacja)
- `validate.md` - Komenda `/sc:validate` (walidacja projektu)
- `migrate.md` - Komenda `/sc:migrate` (migracje bazy danych)
- `replace.md` - Komenda `/sc:replace` (znajdź i zamień)
- `verify.md` - Komenda `/sc:verify` (weryfikacja kodu)

---

## 📋 Lista Komend

### Podstawowe Komendy

### 1. `/sc:analyze` - Code Analysis

**Plik:** `.cursor/commands/analyze.md`

**Opis:** Kompleksowa analiza kodu w zakresie jakości, bezpieczeństwa, wydajności i architektury.

**Użycie:**
```bash
/sc:analyze [target] [--focus quality|security|performance|architecture] [--depth quick|deep]
```

**Funkcje:**
- Analiza jakości kodu
- Skanowanie podatności bezpieczeństwa
- Identyfikacja wąskich gardeł wydajności
- Przegląd architektury i dług techniczny

---

### 2. `/sc:index` - Documentation Index Generator

**Plik:** `.cursor/commands/index.md`

**Opis:** Generowanie kompleksowego indeksu dokumentacji projektu.

**Użycie:**
```bash
/sc:index
/sc/index
```

**Funkcje:**
- Skanowanie struktury projektu
- Kategoryzacja dokumentacji
- Generowanie indeksu z linkami
- Aktualizacja `PROJECT_INDEX.md`

---

### 3. `/sc:test` - Testing

**Plik:** `.cursor/commands/test.md`

**Opis:** Uruchamianie testów, generowanie przypadków testowych i walidacja funkcjonalności.

**Użycie:**
```bash
/sc:test [target] [--type unit|integration|e2e] [--generate] [--coverage]
```

**Funkcje:**
- Uruchamianie istniejących testów
- Generowanie nowych przypadków testowych
- Analiza pokrycia testami
- Walidacja funkcjonalności

---

### 4. `/sc:refactor` - Code Refactoring

**Plik:** `.cursor/commands/refactor.md`

**Opis:** Refaktoryzacja kodu w celu poprawy struktury, czytelności i utrzymywalności.

**Użycie:**
```bash
/sc:refactor [target] [--focus structure|performance|readability|patterns] [--dry-run]
```

**Funkcje:**
- Poprawa struktury kodu
- Redukcja duplikacji
- Zastosowanie wzorców projektowych
- Poprawa czytelności

---

### 5. `/sc:review` - Code Review

**Plik:** `.cursor/commands/review.md`

**Opis:** Przegląd kodu z szczegółową oceną i rekomendacjami.

**Użycie:**
```bash
/sc:review [target] [--focus security|performance|best-practices|all] [--format detailed|summary]
```

**Funkcje:**
- Analiza jakości kodu
- Wykrywanie błędów i problemów
- Sprawdzanie zgodności z best practices
- Konstruktywna informacja zwrotna

---

### 6. `/sc:docs` - Documentation Generation

**Plik:** `.cursor/commands/docs.md`

**Opis:** Generowanie i aktualizacja dokumentacji dla kodu, API i komponentów.

**Użycie:**
```bash
/sc:docs [target] [--type api|code|readme|guide] [--format markdown|html]
```

**Funkcje:**
- Generowanie dokumentacji API
- Dokumentacja komponentów i funkcji
- Tworzenie README
- Aktualizacja istniejącej dokumentacji

---

### 7. `/sc:fix` - Bug Fixing

**Plik:** `.cursor/commands/fix.md`

**Opis:** Identyfikacja i naprawa błędów, błędów i problemów w kodzie.

**Użycie:**
```bash
/sc:fix [target] [--error "error message"] [--type runtime|linter|type|test]
```

**Funkcje:**
- Naprawa błędów runtime
- Rozwiązywanie błędów lintera i typów
- Naprawa nieudanych testów
- Walidacja poprawek

---

### 8. `/sc:setup` - Project Setup

**Plik:** `.cursor/commands/setup.md`

**Opis:** Konfiguracja projektu, przygotowanie środowiska i instalacja zależności.

**Użycie:**
```bash
/sc:setup [--env development|production|test] [--dependencies] [--config]
```

**Funkcje:**
- Konfiguracja środowiska
- Instalacja zależności
- Tworzenie plików konfiguracyjnych
- Walidacja konfiguracji

---

### 9. `/sc:deploy` - Deployment

**Plik:** `.cursor/commands/deploy.md`

**Opis:** Przygotowanie, walidacja i wykonanie deploymentu.

**Użycie:**
```bash
/sc:deploy [--env staging|production] [--validate] [--build] [--dry-run]
```

**Funkcje:**
- Walidacja przed deploymentem
- Tworzenie buildów produkcyjnych
- Wykonanie deploymentu
- Planowanie rollbacku

---

### 10. `/sc:build` - Build

**Plik:** `.cursor/commands/build.md`

**Opis:** Buildowanie projektu dla produkcji lub developmentu.

**Użycie:**
```bash
/sc:build [--env production|development] [--optimize] [--validate] [--clean]
```

**Funkcje:**
- Tworzenie buildów produkcyjnych
- Optymalizacja buildów
- Walidacja buildów
- Czyszczenie przed buildem

---

### 11. `/sc:lint` - Linting

**Plik:** `.cursor/commands/lint.md`

**Opis:** Linting kodu pod kątem stylu, błędów i best practices.

**Użycie:**
```bash
/sc:lint [target] [--fix] [--format] [--strict]
```

**Funkcje:**
- Sprawdzanie stylu kodu
- Automatyczne naprawy
- Wymuszanie best practices
- Raportowanie błędów

---

### 12. `/sc:format` - Formatowanie

**Plik:** `.cursor/commands/format.md`

**Opis:** Formatowanie kodu zgodnie z wytycznymi projektu.

**Użycie:**
```bash
/sc:format [target] [--check] [--write]
```

**Funkcje:**
- Formatowanie kodu
- Sprawdzanie formatowania
- Zastosowanie stylu
- Raportowanie zmian

---

### 13. `/sc:check` - Sprawdzanie Typów

**Plik:** `.cursor/commands/check.md`

**Opis:** Sprawdzanie typów TypeScript i walidacja.

**Użycie:**
```bash
/sc:check [target] [--type typescript|linter|all] [--strict]
```

**Funkcje:**
- Sprawdzanie typów TypeScript
- Wykrywanie błędów
- Sugestie napraw
- Walidacja poprawności

---

### 14. `/sc:clean` - Czyszczenie

**Plik:** `.cursor/commands/clean.md`

**Opis:** Czyszczenie artefaktów buildów, cache i plików tymczasowych.

**Użycie:**
```bash
/sc:clean [--build] [--cache] [--node-modules] [--all]
```

**Funkcje:**
- Usuwanie buildów
- Czyszczenie cache
- Usuwanie plików tymczasowych
- Pełne czyszczenie projektu

---

### 15. `/sc:install` - Instalacja

**Plik:** `.cursor/commands/install.md`

**Opis:** Instalacja zależności i pakietów projektu.

**Użycie:**
```bash
/sc:install [package] [--dev] [--peer] [--update]
```

**Funkcje:**
- Instalacja zależności
- Aktualizacja lock files
- Weryfikacja instalacji
- Instalacja pakietów

---

### 16. `/sc:generate` - Generowanie Kodu

**Plik:** `.cursor/commands/generate.md`

**Opis:** Generowanie kodu, komponentów i boilerplate.

**Użycie:**
```bash
/sc:generate [type] [name] [--template template-name] [--path path]
```

**Funkcje:**
- Generowanie komponentów
- Tworzenie struktur plików
- Zastosowanie szablonów
- Walidacja wygenerowanego kodu

---

### 17. `/sc:search` - Wyszukiwanie

**Plik:** `.cursor/commands/search.md`

**Opis:** Wyszukiwanie w kodzie wzorców, funkcji i referencji.

**Użycie:**
```bash
/sc:search [query] [--type function|variable|import|all] [--files pattern]
```

**Funkcje:**
- Wyszukiwanie semantyczne
- Znajdowanie wzorców
- Śledzenie referencji
- Wyniki z kontekstem

---

### 18. `/sc:optimize` - Optymalizacja

**Plik:** `.cursor/commands/optimize.md`

**Opis:** Optymalizacja kodu, rozmiaru bundla i wydajności.

**Użycie:**
```bash
/sc:optimize [target] [--focus bundle|performance|code] [--analyze]
```

**Funkcje:**
- Analiza bundla
- Optymalizacja wydajności
- Redukcja rozmiaru
- Pomiar wydajności

---

### 19. `/sc:validate` - Walidacja

**Plik:** `.cursor/commands/validate.md`

**Opis:** Walidacja kodu, konfiguracji i setupu projektu.

**Użycie:**
```bash
/sc:validate [--type code|config|setup|all] [--strict]
```

**Funkcje:**
- Walidacja kodu
- Sprawdzanie konfiguracji
- Weryfikacja setupu
- Raportowanie błędów

---

### 20. `/sc:migrate` - Migracje

**Plik:** `.cursor/commands/migrate.md`

**Opis:** Migracje bazy danych i aktualizacje schematu.

**Użycie:**
```bash
/sc:migrate [action] [name] [--up|--down] [--dry-run]
```

**Funkcje:**
- Tworzenie migracji
- Wykonywanie migracji
- Rollback migracji
- Walidacja migracji

---

### 21. `/sc:replace` - Znajdź i Zamień

**Plik:** `.cursor/commands/replace.md`

**Opis:** Znajdowanie i zamiana wzorców w całym kodzie.

**Użycie:**
```bash
/sc:replace [pattern] [replacement] [--files pattern] [--dry-run] [--regex]
```

**Funkcje:**
- Bezpieczna zamiana wzorców
- Aktualizacja wielu plików
- Walidacja zmian
- Tworzenie backupów

---

### 22. `/sc:verify` - Weryfikacja

**Plik:** `.cursor/commands/verify.md`

**Opis:** Weryfikacja poprawności kodu, testów i integralności projektu.

**Użycie:**
```bash
/sc:verify [--type code|tests|all] [--strict]
```

**Funkcje:**
- Weryfikacja poprawności kodu
- Wykonywanie testów
- Sprawdzanie integralności
- Raportowanie wyników

---

## 🔄 Jak używać

1. **Zrestartuj Cursor** po dodaniu nowych komend
2. Użyj komendy w czacie Cursor:
   - `/sc:analyze` - do analizy kodu
   - `/sc:index` - do generowania indeksu dokumentacji

---

## 📝 Format Plików Komend

Każdy plik komendy zawiera:

1. **Frontmatter YAML:**
   ```yaml
   ---
   name: nazwa_komendy
   description: "Opis komendy"
   category: kategoria
   complexity: basic|intermediate|advanced
   ---
   ```

2. **Sekcje:**
   - `# /sc:nazwa - Tytuł`
   - `## Triggers` - Kiedy używać
   - `## Usage` - Jak używać
   - `## Behavioral Flow` - Jak działa
   - `## Examples` - Przykłady
   - `## Boundaries` - Co robi, czego nie robi

---

## ➕ Dodawanie Nowych Komend

Aby dodać nową komendę:

1. Utwórz plik `.md` w `.cursor/commands/`
2. Skopiuj format z istniejących komend
3. Zaktualizuj frontmatter i zawartość
4. Zrestartuj Cursor

**Przykład:**
```markdown
---
name: mycommand
description: "Opis mojej komendy"
category: utility
---

# /sc:mycommand - Tytuł

## Usage
/sc:mycommand [opcje]

## Behavioral Flow
1. Krok 1
2. Krok 2
...
```

---

## 📚 Dokumentacja Powiązana

- [CURSOR_COMMANDS_LOCATION.md](./CURSOR_COMMANDS_LOCATION.md) - Gdzie są przechowywane komendy
- [CURSOR_COMMANDS_USAGE_GUIDE.md](./CURSOR_COMMANDS_USAGE_GUIDE.md) - **NOWY** - Praktyczny przewodnik użycia komend
- [PROJECT_INDEX.md](./PROJECT_INDEX.md) - Indeks dokumentacji projektu

---

**Ostatnia aktualizacja:** 2024-12-19
