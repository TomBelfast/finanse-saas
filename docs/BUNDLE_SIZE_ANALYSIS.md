# 📦 Bundle Size Analysis - Przewodnik

## Co to jest Bundle Size Analysis?

**Bundle Size Analysis** to analiza rozmiaru plików JavaScript/CSS wygenerowanych podczas builda aplikacji. Pokazuje, które biblioteki i komponenty zajmują najwięcej miejsca w finalnym bundle'u.

## Do czego służy?

### 1. **Identyfikacja dużych zależności**
- Znajdowanie bibliotek, które znacząco zwiększają rozmiar bundle'a
- Przykłady: Ant Design, Recharts, EditorJS, Clerk

### 2. **Optymalizacja wydajności**
- Mniejszy bundle = szybsze ładowanie strony
- Lepsze doświadczenie użytkownika (szczególnie na wolnych połączeniach)
- Lepsze SEO (Google preferuje szybkie strony)

### 3. **Code Splitting**
- Identyfikacja komponentów, które można ładować lazy
- Podział bundle'a na mniejsze chunki
- Ładowanie tylko tego, co jest potrzebne

### 4. **Tree Shaking**
- Usuwanie nieużywanych części bibliotek
- Przykład: Importowanie tylko potrzebnych komponentów z Ant Design zamiast całej biblioteki

### 5. **Monitoring**
- Śledzenie zmian rozmiaru bundle'a w czasie
- Wykrywanie regresji (nagły wzrost rozmiaru)

## Jak działa w tym projekcie?

### Konfiguracja

W projekcie używamy **`rollup-plugin-visualizer`** zintegrowanego z Vite:

```typescript
// apps/web-app/vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    // ...
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,      // Rozmiar po kompresji gzip
      brotliSize: true,    // Rozmiar po kompresji brotli
      template: 'treemap', // Wizualizacja: 'treemap' | 'sunburst' | 'network'
    }),
  ],
});
```

### Script w package.json

```json
{
  "scripts": {
    "build:analyze": "tsc && vite build && echo 'Bundle analysis available at dist/stats.html'"
  }
}
```

## Jak uruchomić?

### Krok 1: Uruchom build z analizą

```bash
cd apps/web-app
pnpm build:analyze
```

### Krok 2: Otwórz raport

Po zakończeniu builda, otwórz plik:
```
apps/web-app/dist/stats.html
```

W przeglądarce zobaczysz interaktywną wizualizację (treemap) pokazującą:
- Rozmiar każdej biblioteki
- Rozmiar każdego komponentu
- Rozmiar po kompresji (gzip, brotli)
- Procentowy udział w całym bundle'u

## Co można zobaczyć w raporcie?

### 1. **Treemap Visualization**
- Każdy prostokąt reprezentuje plik/bibliotekę
- Większy prostokąt = większy rozmiar
- Kolory pokazują kategorie (node_modules, src, itp.)

### 2. **Metryki**
- **Raw Size**: Oryginalny rozmiar pliku
- **Gzip Size**: Rozmiar po kompresji gzip (używany przez większość serwerów)
- **Brotli Size**: Rozmiar po kompresji brotli (najlepsza kompresja)

### 3. **Top Contributors**
- Lista największych bibliotek
- Procentowy udział w bundle'u
- Możliwość sortowania po różnych metrykach

## Przykładowe problemy, które można znaleźć

### 1. **Duże biblioteki UI**
```
antd: 2.5 MB (raw) → 500 KB (gzip)
```
**Rozwiązanie:** Tree-shaking, importowanie tylko potrzebnych komponentów

### 2. **Duplikacja zależności**
```
react: 2x (w różnych chunkach)
```
**Rozwiązanie:** Optymalizacja deduplication

### 3. **Duże komponenty nieużywane**
```
EditorJS: 800 KB (używany tylko w 1 miejscu)
```
**Rozwiązanie:** Lazy loading dla tego komponentu

### 4. **Brak code splitting**
```
Wszystko w 1 pliku: 5 MB
```
**Rozwiązanie:** Code splitting dla routes

## Rekomendacje dla tego projektu

### Potencjalnie duże zależności:

1. **Ant Design** (`antd`)
   - Rozmiar: ~2-3 MB (raw)
   - Rozwiązanie: Tree-shaking, importowanie tylko potrzebnych komponentów
   - Przykład: `import { Button } from 'antd'` zamiast `import * from 'antd'`

2. **Recharts** (`recharts`)
   - Rozmiar: ~500 KB (raw)
   - Używany w: Reports, AI, Insurances, Loans
   - Rozwiązanie: Lazy loading dla komponentów z wykresami

3. **EditorJS** (`@editorjs/*`)
   - Rozmiar: ~800 KB (raw) - wiele pluginów
   - Używany w: Editor component
   - Rozwiązanie: Lazy loading dla Editor component

4. **Clerk** (`@clerk/clerk-react`)
   - Rozmiar: ~200 KB (raw)
   - Używany: Wszędzie (autentykacja)
   - Status: ✅ Już zoptymalizowany (w optimizeDeps)

5. **Radix UI** (`@radix-ui/*`)
   - Rozmiar: ~300 KB (raw) - wiele komponentów
   - Używany: Wszędzie (UI components)
   - Status: ✅ Dobrze - tree-shaking działa automatycznie

## Przykładowe optymalizacje

### 1. Tree-shaking dla Ant Design

**Przed:**
```typescript
import { Button, Table, Form, Input } from 'antd';
```

**Po (lepsze):**
```typescript
import Button from 'antd/es/button';
import Table from 'antd/es/table';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
```

### 2. Lazy Loading dla dużych komponentów

**Przed:**
```typescript
import Editor from '~/components/Editor/Editor';
```

**Po:**
```typescript
const Editor = lazy(() => import('~/components/Editor/Editor'));
```

### 3. Dynamic Imports dla bibliotek

**Przed:**
```typescript
import * as recharts from 'recharts';
```

**Po:**
```typescript
const { BarChart, LineChart } = await import('recharts');
```

## Benchmarki

### Dobry rozmiar bundle'a:

- **Initial bundle (gzip):** < 200 KB ✅
- **Total bundle (gzip):** < 500 KB ✅
- **Per route chunk (gzip):** < 100 KB ✅

### Ostrzeżenia:

- ⚠️ Initial bundle > 500 KB - rozważyć code splitting
- ⚠️ Pojedynczy chunk > 200 KB - rozważyć podział
- ⚠️ Duplikacja > 50 KB - rozważyć deduplication

## Jak interpretować wyniki?

### 1. **Znajdź największe pliki**
- Kliknij na największe prostokąty w treemap
- Zobacz, które biblioteki zajmują najwięcej miejsca

### 2. **Sprawdź duplikacje**
- Szukaj tej samej biblioteki w różnych chunkach
- Przykład: `react` w wielu miejscach

### 3. **Analizuj code splitting**
- Sprawdź, czy routes są podzielone na osobne chunki
- Sprawdź, czy duże komponenty są lazy loaded

### 4. **Porównaj gzip vs raw**
- Gzip size pokazuje rzeczywisty rozmiar transferowany
- Brotli size pokazuje najlepszą możliwą kompresję

## Następne kroki po analizie

1. **Zidentyfikuj największe biblioteki**
2. **Sprawdź, czy są wszystkie potrzebne**
3. **Zaimplementuj tree-shaking** (jeśli możliwe)
4. **Dodaj lazy loading** dla dużych komponentów
5. **Optymalizuj code splitting**
6. **Porównaj przed/po** optymalizacjami

---

## Przykładowe wyniki (oczekiwane)

Po uruchomieniu `pnpm build:analyze` możesz zobaczyć:

```
Top 10 największych bibliotek:
1. antd: 2.5 MB (raw) → 500 KB (gzip)
2. recharts: 800 KB (raw) → 200 KB (gzip)
3. @editorjs/*: 600 KB (raw) → 150 KB (gzip)
4. react-dom: 150 KB (raw) → 50 KB (gzip)
5. @clerk/clerk-react: 200 KB (raw) → 60 KB (gzip)
...
```

**Rekomendacja:** 
- Tree-shaking dla Ant Design może zmniejszyć bundle o ~1-2 MB
- Lazy loading dla EditorJS może zmniejszyć initial bundle o ~150 KB

---

**Data utworzenia:** 2025-01-18  
**Narzędzie:** rollup-plugin-visualizer  
**Konfiguracja:** `apps/web-app/vite.config.ts`

