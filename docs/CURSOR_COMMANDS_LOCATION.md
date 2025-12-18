# 📍 Lokalizacja Komend Cursor (/sc/*)

## Gdzie są przechowywane komendy Cursor?

Komendy Cursor (np. `/sc/analyze`, `/sc/index`) mogą być przechowywane w dwóch miejscach:

### 1. **Lokalnie w projekcie** (zalecane dla komend specyficznych dla projektu)

**Lokalizacja:** `.cursor/commands/*.md`

**Struktura:**
```
.cursor/
└── commands/
    ├── analyze.md      # Komenda /sc:analyze
    ├── index.md        # Komenda /sc:index
    └── nowa.md         # Inne komendy
```

**Przykład pliku komendy:**
```markdown
---
name: analyze
description: "Comprehensive code analysis"
category: utility
---

# /sc:analyze - Code Analysis

## Usage
/sc:analyze [target] [--focus quality|security|performance]
...
```

### 2. **Globalnie** (dla wszystkich projektów)

**Lokalizacja:** `C:\Users\Tomasz\.cursor\commands\*.md`

**Uwaga:** Te komendy będą dostępne we wszystkich projektach Cursor.

---

## Aktualna lokalizacja w projekcie

✅ **Komendy znajdują się w:** `.cursor/commands/`

**Pliki:**
- `nowa.md` - (pusty, można użyć do nowych komend)
- `analyze.md` - (nowo utworzony, zawiera definicję `/sc:analyze`)

---

## Jak dodać nową komendę?

1. **Utwórz plik `.md` w `.cursor/commands/`**
   ```bash
   # Przykład:
   .cursor/commands/mycommand.md
   ```

2. **Dodaj frontmatter YAML:**
   ```markdown
   ---
   name: mycommand
   description: "Opis komendy"
   category: utility
   ---
   ```

3. **Zdefiniuj komendę:**
   ```markdown
   # /sc:mycommand - Opis
   
   ## Usage
   /sc:mycommand [opcje]
   
   ## Behavioral Flow
   1. Krok 1
   2. Krok 2
   ...
   ```

4. **Zrestartuj Cursor** aby załadować nową komendę

---

## Dostępne komendy w projekcie

| Komenda | Plik | Status |
|---------|------|--------|
| `/sc:analyze` | `.cursor/commands/analyze.md` | ✅ Utworzony |
| `/sc:index` | (brak) | ⚠️ Nie zdefiniowany lokalnie |
| Inne | `.cursor/commands/nowa.md` | 📝 Pusty |

---

## Uwagi

- Komendy zdefiniowane w projekcie mają priorytet nad globalnymi
- Jeśli komenda nie jest w `.cursor/commands/`, Cursor może używać wbudowanych komend lub globalnych
- Format plików komend to Markdown z frontmatter YAML
- Po dodaniu/zmianie komendy, **zrestartuj Cursor**

---

**Ostatnia aktualizacja:** 2024-12-19
