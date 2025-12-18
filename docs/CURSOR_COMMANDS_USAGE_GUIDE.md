# 🚀 Przewodnik Użycia Komend Cursor

## Wprowadzenie

Komendy Cursor (`/sc:*`) to potężne narzędzia do automatyzacji typowych zadań w projekcie. Oto praktyczny przewodnik, jak z nich korzystać w codziennej pracy.

---

## 📋 Kiedy używać której komendy?

### 🔍 `/sc:analyze` - Analiza Kodu

**Kiedy używać:**
- Przed refaktoryzacją - zrozumienie obecnego stanu kodu
- Po dodaniu nowych funkcji - sprawdzenie jakości
- Przy problemach z wydajnością - identyfikacja wąskich gardeł
- Przed code review - przygotowanie do przeglądu

**Przykłady dla Twojego projektu:**

```bash
# Analiza całego projektu
/sc:analyze

# Analiza bezpieczeństwa autentykacji (Clerk)
/sc:analyze apps/functions/src/modules/auth --focus security

# Analiza wydajności frontendu
/sc:analyze apps/web-app/src --focus performance

# Szybka kontrola jakości komponentów
/sc:analyze apps/web-app/src/components --focus quality --depth quick
```

**Co otrzymasz:**
- Listę problemów z priorytetami
- Rekomendacje napraw
- Metryki jakości kodu
- Raport z wąskimi gardłami

---

### 📚 `/sc:index` - Indeks Dokumentacji

**Kiedy używać:**
- Po dodaniu nowej dokumentacji
- Gdy dokumentacja jest nieaktualna
- Przed onboardingiem nowych developerów
- Do utrzymania spójności dokumentacji

**Przykłady:**

```bash
# Zaktualizuj indeks dokumentacji
/sc:index

# Automatycznie:
# - Skanuje folder docs/
# - Aktualizuje PROJECT_INDEX.md
# - Tworzy linki do wszystkich dokumentów
```

**Co otrzymasz:**
- Zaktualizowany `docs/PROJECT_INDEX.md`
- Spis wszystkich dokumentów z kategoryzacją
- Linki do dokumentacji
- Status każdego dokumentu (✅ Complete, 📝 In Progress)

---

### 🧪 `/sc:test` - Testowanie

**Kiedy używać:**
- Po napisaniu nowego kodu - wygeneruj testy
- Przed commitowaniem - uruchom testy
- Przy dodawaniu nowych funkcji - sprawdź pokrycie
- Gdy testy nie przechodzą - znajdź problemy

**Przykłady dla Twojego projektu:**

```bash
# Uruchom wszystkie testy
/sc:test

# Wygeneruj testy dla nowego komponentu
/sc:test apps/web-app/src/components/Subscriptions --generate

# Sprawdź pokrycie testami
/sc:test --coverage

# Testy integracyjne dla API
/sc:test apps/functions/src/modules/userFinances --type integration
```

**Co otrzymasz:**
- Wyniki testów
- Nowe pliki testowe (jeśli --generate)
- Raport pokrycia testami
- Listę nieprzetestowanych obszarów

---

### 🔧 `/sc:refactor` - Refaktoryzacja

**Kiedy używać:**
- Gdy kod jest trudny do utrzymania
- Po zidentyfikowaniu duplikacji
- Przy poprawie wydajności
- Gdy chcesz zastosować wzorce projektowe

**Przykłady:**

```bash
# Refaktoryzacja komponentu Subscriptions
/sc:refactor apps/web-app/src/pages/Subscriptions

# Poprawa wydajności API clienta
/sc:refactor apps/web-app/src/services/apiClient --focus performance

# Podgląd zmian przed refaktoryzacją
/sc:refactor apps/functions/src/modules/auth --dry-run

# Poprawa czytelności
/sc:refactor apps/web-app/src/components --focus readability
```

**Co otrzymasz:**
- Zrefaktoryzowany kod
- Wyjaśnienie zmian
- Weryfikację, że funkcjonalność się nie zmieniła
- Sugestie dalszych ulepszeń

---

### 👀 `/sc:review` - Code Review

**Kiedy używać:**
- Przed merge requestem
- Po zmianach w kodzie
- Do sprawdzenia zgodności z best practices
- Przed wdrożeniem na produkcję

**Przykłady:**

```bash
# Przegląd ostatnich zmian
/sc:review

# Przegląd bezpieczeństwa (ważne dla Clerk/auth)
/sc:review apps/functions/src/modules/auth --focus security

# Szybki przegląd (podsumowanie)
/sc:review apps/web-app/src/pages/Subscriptions --format summary

# Pełny przegląd z rekomendacjami
/sc:review apps/web-app/src --focus best-practices
```

**Co otrzymasz:**
- Listę znalezionych problemów
- Konstruktywną informację zwrotną
- Sugestie ulepszeń
- Sprawdzenie zgodności z konwencjami projektu

---

### 📖 `/sc:docs` - Dokumentacja

**Kiedy używać:**
- Po dodaniu nowego API endpointu
- Gdy komponent nie ma dokumentacji
- Przy aktualizacji funkcjonalności
- Do generowania README

**Przykłady:**

```bash
# Dokumentacja API (ważne dla Twojego projektu!)
/sc:docs apps/functions/src/modules/userFinances --type api

# Dokumentacja komponentu
/sc:docs apps/web-app/src/components/Subscriptions --type code

# Aktualizacja README
/sc:docs --type readme

# Dokumentacja hooków
/sc:docs apps/web-app/src/hooks --type code
```

**Co otrzymasz:**
- Dokumentację API z przykładami
- JSDoc dla funkcji i komponentów
- Zaktualizowany README
- Linki między dokumentacją

---

### 🐛 `/sc:fix` - Naprawa Błędów

**Kiedy używać:**
- Gdy widzisz błąd w konsoli
- Przy błędach TypeScript
- Gdy linter zgłasza problemy
- Po nieudanych testach

**Przykłady:**

```bash
# Napraw błąd z komunikatem
/sc:fix --error "Cannot read property 'map' of undefined"

# Napraw wszystkie błędy TypeScript
/sc:fix apps/web-app/src --type type

# Napraw błędy lintera
/sc:fix apps/functions/src --type linter

# Napraw nieudane testy
/sc:fix tests/subscriptions.test.ts --type test
```

**Co otrzymasz:**
- Naprawiony kod
- Wyjaśnienie, co było nie tak
- Weryfikację, że błąd został naprawiony
- Sugestie zapobiegania podobnym błędom

---

### ⚙️ `/sc:setup` - Konfiguracja

**Kiedy używać:**
- Przy pierwszym setupie projektu
- Gdy brakuje zmiennych środowiskowych
- Po zmianie zależności
- Przy konfiguracji nowego środowiska

**Przykłady:**

```bash
# Pełna konfiguracja projektu
/sc:setup

# Konfiguracja środowiska deweloperskiego
/sc:setup --env development

# Tylko instalacja zależności
/sc:setup --dependencies

# Tylko konfiguracja (pliki .env)
/sc:setup --config
```

**Co otrzymasz:**
- Utworzone pliki `.env.local`
- Zainstalowane zależności
- Skonfigurowane narzędzia
- Walidację konfiguracji

---

### 🚀 `/sc:deploy` - Deployment

**Kiedy używać:**
- Przed wdrożeniem na produkcję
- Do walidacji przed deploymentem
- Przy tworzeniu builda produkcyjnego
- Do sprawdzenia gotowości do wdrożenia

**Przykłady:**

```bash
# Walidacja przed deploymentem
/sc:deploy --validate

# Build produkcyjny
/sc:deploy --env production --build

# Symulacja deploymentu (bez faktycznego wdrożenia)
/sc:deploy --env staging --dry-run

# Pełny deployment
/sc:deploy --env production
```

**Co otrzymasz:**
- Raport gotowości do wdrożenia
- Zbudowane pliki produkcyjne
- Listę rzeczy do sprawdzenia
- Potwierdzenie udanego deploymentu

---

## 🎯 Typowe Workflow dla Twojego Projektu

### Workflow 1: Dodanie Nowej Funkcjonalności

```bash
# 1. Sprawdź obecny stan
/sc:analyze apps/web-app/src/components

# 2. Napisz kod...

# 3. Wygeneruj testy
/sc:test apps/web-app/src/components/NewComponent --generate

# 4. Uruchom testy
/sc:test

# 5. Przegląd kodu
/sc:review apps/web-app/src/components/NewComponent

# 6. Napraw błędy (jeśli są)
/sc:fix apps/web-app/src/components/NewComponent --type type

# 7. Zaktualizuj dokumentację
/sc:docs apps/web-app/src/components/NewComponent --type code
```

### Workflow 2: Naprawa Błędu

```bash
# 1. Zidentyfikuj błąd (z konsoli/logów)
/sc:fix --error "Error: Unauthenticated"

# 2. Sprawdź kontekst
/sc:analyze apps/functions/src/modules/auth --focus security

# 3. Napraw błąd
/sc:fix apps/functions/src/modules/auth/infra/restRoutes.ts

# 4. Uruchom testy
/sc:test apps/functions/src/modules/auth

# 5. Przegląd zmian
/sc:review apps/functions/src/modules/auth
```

### Workflow 3: Refaktoryzacja

```bash
# 1. Analiza przed refaktoryzacją
/sc:analyze apps/web-app/src/pages/Subscriptions --focus quality

# 2. Podgląd zmian
/sc:refactor apps/web-app/src/pages/Subscriptions --dry-run

# 3. Refaktoryzacja
/sc:refactor apps/web-app/src/pages/Subscriptions --focus structure

# 4. Uruchom testy
/sc:test apps/web-app/src/pages/Subscriptions

# 5. Przegląd zmian
/sc:review apps/web-app/src/pages/Subscriptions
```

### Workflow 4: Przed Deploymentem

```bash
# 1. Uruchom wszystkie testy
/sc:test

# 2. Analiza jakości
/sc:analyze --focus security

# 3. Przegląd kodu
/sc:review --focus best-practices

# 4. Walidacja deploymentu
/sc:deploy --validate

# 5. Build produkcyjny
/sc:deploy --env production --build

# 6. Deployment (jeśli wszystko OK)
/sc:deploy --env production
```

---

## 💡 Wskazówki i Best Practices

### 1. **Używaj komend przed commitowaniem**
```bash
/sc:test          # Upewnij się, że testy przechodzą
/sc:review        # Sprawdź jakość kodu
/sc:fix --type linter  # Napraw błędy lintera
```

### 2. **Kombinuj komendy dla kompleksowej analizy**
```bash
# Pełna analiza przed refaktoryzacją
/sc:analyze src/components --focus quality
/sc:review src/components
/sc:refactor src/components --dry-run
```

### 3. **Używaj --dry-run do podglądu**
```bash
/sc:refactor src/utils --dry-run  # Zobacz co się zmieni
/sc:deploy --env production --dry-run  # Symulacja deploymentu
```

### 4. **Regularnie aktualizuj dokumentację**
```bash
/sc:index         # Po dodaniu nowej dokumentacji
/sc:docs src/api --type api  # Po zmianach w API
```

### 5. **Automatyzuj przed deploymentem**
```bash
/sc:deploy --validate  # Zawsze przed produkcją!
```

---

## 🔄 Integracja z Git Workflow

### Przed Commitem:
```bash
/sc:fix --type linter    # Napraw błędy lintera
/sc:test                 # Uruchom testy
/sc:review               # Szybki przegląd
```

### Przed Push:
```bash
/sc:test --coverage      # Sprawdź pokrycie
/sc:analyze --focus security  # Analiza bezpieczeństwa
```

### Przed Merge Request:
```bash
/sc:review --format detailed  # Pełny przegląd
/sc:docs --type api           # Zaktualizuj dokumentację API
/sc:deploy --validate         # Walidacja gotowości
```

---

## 📊 Przykłady dla Konkretnych Modułów Twojego Projektu

### Clerk Authentication:
```bash
# Analiza bezpieczeństwa
/sc:analyze apps/functions/src/modules/auth --focus security

# Przegląd implementacji
/sc:review apps/functions/src/modules/auth/infra/restRoutes.ts

# Dokumentacja API auth
/sc:docs apps/functions/src/modules/auth --type api
```

### Subscriptions Module:
```bash
# Analiza komponentu
/sc:analyze apps/web-app/src/pages/Subscriptions

# Refaktoryzacja (jeśli potrzebna)
/sc:refactor apps/web-app/src/pages/Subscriptions --focus structure

# Testy
/sc:test apps/web-app/src/pages/Subscriptions --generate
```

### API Client:
```bash
# Analiza wydajności
/sc:analyze apps/web-app/src/services/apiClient --focus performance

# Refaktoryzacja
/sc:refactor apps/web-app/src/services/apiClient
```

---

## 🎓 Podsumowanie

Komendy Cursor to Twoi asystenci w codziennej pracy. Używaj ich:

- **Regularnie** - przed commitowaniem, przed deploymentem
- **Proaktywnie** - do analizy i poprawy jakości
- **Systematycznie** - jako część workflow
- **Z rozwagą** - sprawdzaj zmiany przed akceptacją

**Zapamiętaj:** Komendy pomagają, ale Ty decydujesz o ostatecznych zmianach!

---

**Ostatnia aktualizacja:** 2024-12-19
