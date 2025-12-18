# 🚀 Szybkie uruchomienie aplikacji Finanse SaaS

## ⚡ Wymagania wstępne
- Node.js 18+
- pnpm 8+
- Dostęp do projektu Firebase

---

## 📋 Instrukcja krok po kroku (Windows/PowerShell)

### 1. Instalacja zależności
```powershell
pnpm install
```

### 2. Budowanie shared package (WYMAGANE przed startem!)
```powershell
cd packages/shared
pnpm build
cd ../..
```

### 3. Konfiguracja Firebase
```powershell
firebase login           # Zaloguj się do Firebase (jeśli nie jesteś zalogowany)
firebase use develop     # Ustaw projekt na develop (prawdziwa baza danych)
```

### 4. Weryfikacja plików .env.local
- Upewnij się, że istnieje `apps/web-app/.env.local` oraz `apps/functions/.env.local`.
- Pliki mogą być ukryte! Użyj:
```powershell
Get-ChildItem apps\web-app\.env* -Force
Get-ChildItem apps\functions\.env* -Force
```
- Jeśli brakuje plików, skopiuj z szablonów:
```powershell
copy apps\web-app\.env.dist apps\web-app\.env.local
copy apps\functions\.env.dist apps\functions\.env.local
```

### 5. Budowanie functions (opcjonalnie, tylko jeśli zmieniasz backend)
```powershell
cd apps/functions
$env:GCLOUD_PROJECT="saas-d5a66"
pnpm build
cd ../..
```

### 6. Uruchomienie aplikacji (frontend)
```powershell
pnpm dev
```
- Jeśli pojawi się błąd z cross-env lub turbo, uruchom bezpośrednio frontend:
```powershell
cd apps/web-app
pnpm dev
```

---

## ✅ Sprawdzenie działania
1. Otwórz http://localhost:3000/ (lub http://localhost:3001/ jeśli port 3000 jest zajęty)
2. Sprawdź konsolę terminala – nie powinno być błędów importu ani 500
3. Jeśli pojawi się błąd importu shared, patrz sekcja FAQ

---

## 🚨 WAŻNE! Poprawne importy shared
- **Importuj tylko z głównego pakietu!**
- **NIE używaj:**
  ```typescript
  import { X } from '@akademiasaas/shared/src/constants/urls'; // ❌ BŁĄD
  ```
- **Używaj tylko:**
  ```typescript
  import { X } from '@akademiasaas/shared'; // ✅ POPRAWNIE
  ```
- Jeśli pojawi się błąd:
  `Failed to resolve import "@akademiasaas/shared/src/constants/urls" ... Does the file exist?`
  – popraw importy w kodzie!

---

## 🔧 Rozwiązywanie problemów (FAQ)

### Błąd "cross-env is not recognized"
- Uruchom PowerShell jako Administrator
- Wykonaj ponownie: `pnpm install`
- Jeśli nadal nie działa, uruchom bezpośrednio frontend:
  ```powershell
  cd apps/web-app
  pnpm dev
  ```

### Błąd "@sentry/vite-plugin" not found
- Sentry jest tymczasowo wyłączone w vite.config.ts (import i plugin są zakomentowane)
- Jeśli chcesz włączyć Sentry, zainstaluj brakujący pakiet i odkomentuj odpowiednie linie

### Błąd importu shared (500, dynamic import, nie ładuje Dashboard)
- Upewnij się, że:
  - Shared package jest zbudowany (`cd packages/shared; pnpm build`)
  - Importujesz tylko z `@akademiasaas/shared`, nigdy z podścieżek
  - Alias w vite.config.ts jest poprawny:
    ```typescript
    resolve: {
      alias: {
        '@akademiasaas/shared': path.resolve(__dirname, '../../packages/shared/lib'),
      },
    }
    ```
- Jeśli zmieniasz alias lub naprawiasz importy, ZRESTARTUJ serwer dev!

### Błąd "No project active"
```powershell
firebase use develop
```

### Błąd budowania functions
```powershell
$env:GCLOUD_PROJECT="saas-d5a66"
```

### Port 3000 zajęty
- Aplikacja automatycznie użyje następnego dostępnego portu (3001, 3002, ...)

### Brak plików .env.local
- Skopiuj z szablonów (patrz wyżej)

### Błędy uprawnień przy instalacji
- Uruchom PowerShell jako Administrator

---

## 🎯 Szybkie polecenia (all-in-one)
```powershell
pnpm install
cd packages/shared; pnpm build; cd ../..
firebase use develop
pnpm dev
```

---

## 📝 Najczęstsze przyczyny problemów
- Shared package nie został zbudowany po zmianach → zawsze buduj po zmianach w shared!
- Importy z podścieżek shared zamiast z głównego pakietu
- Brak plików .env.local lub złe środowisko Firebase
- Brak uprawnień administratora w PowerShell

---

💡 **Wskazówka:** Jeśli wystąpi jakikolwiek problem, sprawdź czy wszystkie kroki zostały wykonane w odpowiedniej kolejności. Jeśli nadal masz problem – sprawdź importy shared i zrestartuj serwer dev. 