# 🔒 Blokada dostępu do plików .env w Cursor

## Problem

Cursor może blokować dostęp do plików `.env` z powodów bezpieczeństwa. Błąd `EPERM: operation not permitted` oznacza, że nie można zapisać pliku.

## Możliwe lokalizacje blokady

### 1. Ustawienia Cursor IDE

**Lokalizacja:** Ustawienia Cursor → Security/Privacy

Sprawdź:
- `File: Protected Files` - lista plików chronionych przed edycją
- `Files: Exclude` - wykluczone pliki z edycji
- `Security: Block Sensitive Files` - automatyczna blokada plików z wrażliwymi danymi

**Jak sprawdzić:**
1. Otwórz ustawienia: `Ctrl+,` (Windows) lub `Cmd+,` (Mac)
2. Wyszukaj: `protected files` lub `exclude`
3. Sprawdź czy `.env*` jest na liście

### 2. Plik `.cursorignore`

**Lokalizacja:** Root projektu lub `apps/web-app/.cursorignore`

Jeśli istnieje, może zawierać:
```
.env*
.env.local
.env.*
```

**Jak sprawdzić:**
```bash
# W root projektu
cat .cursorignore

# W katalogu aplikacji
cat apps/web-app/.cursorignore
```

### 3. Ustawienia Workspace

**Lokalizacja:** `.vscode/settings.json` (Cursor używa ustawień VS Code)

Sprawdź:
```json
{
  "files.exclude": {
    "**/.env*": true
  },
  "files.watcherExclude": {
    "**/.env*": true
  }
}
```

### 4. Uprawnienia Windows

**Problem:** Plik może być tylko do odczytu lub zablokowany przez inny proces

**Jak sprawdzić:**
```powershell
# Sprawdź atrybuty pliku
Get-Item apps/web-app/.env.local | Select-Object Attributes, IsReadOnly

# Sprawdź czy plik jest otwarty
Get-Process | Where-Object {$_.Path -like "*cursor*"}
```

### 5. Ustawienia bezpieczeństwa Windows

**Lokalizacja:** Windows Security → Virus & threat protection

Może blokować zapis do plików `.env` jako potencjalnie niebezpieczne.

## Rozwiązania

### Rozwiązanie 1: Edycja ręczna

Najprostsze - edytuj plik `.env.local` ręcznie w Cursor:
1. Otwórz plik `apps/web-app/.env.local`
2. Dodaj klucz Clerk na początku
3. Zapisz (`Ctrl+S`)

### Rozwiązanie 2: Wyłączenie ochrony plików

W ustawieniach Cursor:
1. `Ctrl+,` → Settings
2. Wyszukaj: `protected files`
3. Usuń `.env*` z listy chronionych plików

### Rozwiązanie 3: Edycja przez terminal

Użyj terminala w Cursor:
```bash
cd apps/web-app
echo "VITE_CLERK_PUBLISHABLE_KEY=pk_test_..." >> .env.local
```

### Rozwiązanie 4: Utworzenie pliku przez PowerShell

```powershell
cd apps/web-app
Add-Content .env.local "`nVITE_CLERK_PUBLISHABLE_KEY=pk_test_..."
```

### Rozwiązanie 5: Sprawdzenie uprawnień

```powershell
# Usuń atrybut tylko do odczytu
Set-ItemProperty -Path "apps/web-app/.env.local" -Name IsReadOnly -Value $false
```

## Sprawdzenie aktualnej konfiguracji

### 1. Sprawdź ustawienia Cursor

```bash
# W Cursor: Ctrl+Shift+P → "Preferences: Open Settings (JSON)"
# Sprawdź czy są ustawienia dotyczące .env
```

### 2. Sprawdź pliki konfiguracyjne

```bash
# .cursorignore
cat .cursorignore 2>/dev/null || echo "Brak .cursorignore"

# .vscode/settings.json
cat .vscode/settings.json 2>/dev/null || echo "Brak settings.json"
```

### 3. Sprawdź uprawnienia pliku

```powershell
Get-Item apps/web-app/.env.local -ErrorAction SilentlyContinue | 
  Select-Object FullName, Attributes, IsReadOnly, LastWriteTime
```

## Rekomendacja

**Najlepsze rozwiązanie:** Edytuj plik `.env.local` ręcznie w Cursor IDE. To najbezpieczniejsza metoda i nie wymaga zmiany ustawień bezpieczeństwa.

Jeśli nadal masz problemy:
1. Sprawdź czy plik nie jest otwarty w innym edytorze
2. Sprawdź uprawnienia Windows
3. Zrestartuj Cursor
4. Sprawdź logi Cursor (Help → Toggle Developer Tools → Console)

---

**Ostatnia aktualizacja:** 2024-12-19

