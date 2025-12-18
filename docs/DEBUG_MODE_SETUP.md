# 🔍 Debug Mode - Automatyczne Przechwytywanie Logów

## ✅ Co zostało zaimplementowane

### 1. System Automatycznego Logowania ✅

Utworzono `apps/web-app/src/utils/consoleLogger.ts` który:
- ✅ Przechwytuje wszystkie logi z konsoli (`console.log`, `console.error`, `console.warn`, etc.)
- ✅ Przechwytuje nieobsłużone błędy (`window.onerror`)
- ✅ Przechwytuje nieobsłużone promise rejections
- ✅ Automatycznie wysyła logi do systemu debug logging
- ✅ Logi są zapisywane w `.cursor/debug.log` w formacie NDJSON

### 2. Instrumentacja Kodu ✅

Dodano logowanie w kluczowych miejscach:
- ✅ `apiClient.ts` - logowanie requestów API (start, response, errors)
- ✅ `AuthChecker.tsx` - logowanie procesu autentykacji (token, user details, errors)
- ✅ `Subscriptions.tsx` - logowanie ładowania danych

### 3. Import w `index.tsx` ✅

System logowania jest automatycznie inicjalizowany przy starcie aplikacji.

---

## 📊 Hipotezy Błędów (na podstawie logów)

### Hipoteza A: Backend nie ma CLERK_SECRET_KEY
**Status:** Prawdopodobna przyczyna  
**Dowód:** Błędy 500 z komunikatem "Publishable key is missing"  
**Rozwiązanie:** Dodaj `CLERK_SECRET_KEY` do `apps/functions/.env.local`

### Hipoteza B: Backend nie działa lub nie nasłuchuje na właściwym porcie
**Status:** Do weryfikacji  
**Dowód:** Błędy 404 Not Found, CORS errors  
**Rozwiązanie:** Sprawdź czy backend działa na `192.168.0.14:3001`

### Hipoteza C: Token nie jest ustawiany poprawnie w apiClient
**Status:** Do weryfikacji  
**Dowód:** Błędy "Publishable key is missing" w apiClient  
**Rozwiązanie:** Sprawdź czy `apiClient.setToken()` jest wywoływane w AuthChecker

### Hipoteza D: Błędy 500 z backendu powodują że requesty nie przechodzą
**Status:** Prawdopodobna przyczyna  
**Dowód:** Wszystkie requesty zwracają 500  
**Rozwiązanie:** Napraw konfigurację Clerk na backendzie

### Hipoteza E: CORS blokuje requesty
**Status:** Możliwa przyczyna  
**Dowód:** "Access-Control-Allow-Origin header is not present"  
**Rozwiązanie:** Sprawdź konfigurację CORS w `server.ts`

### Hipoteza F: Subscriptions endpoint zwraca błąd
**Status:** Do weryfikacji  
**Dowód:** Błędy podczas ładowania subskrypcji  
**Rozwiązanie:** Sprawdź logi backendu

### Hipoteza G: Token nie jest dostępny w apiClient.request()
**Status:** Do weryfikacji  
**Dowód:** Requesty bez tokenu w headers  
**Rozwiązanie:** Sprawdź czy token jest ustawiany przed requestami

---

## 🔧 Instrukcje Naprawy

### Krok 1: Dodaj CLERK_SECRET_KEY do backendu

1. Otwórz `apps/functions/.env.local`
2. Dodaj:
   ```bash
   CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
3. Pobierz Secret Key z [Clerk Dashboard](https://dashboard.clerk.com) → API Keys

### Krok 2: Zrestartuj backend

```bash
cd apps/functions
# Zatrzymaj obecny proces (Ctrl+C)
pnpm dev
```

### Krok 3: Sprawdź czy backend działa

```bash
# Health check
curl http://192.168.0.14:3001/health
```

---

## 📝 Jak używać systemu logowania

### Automatyczne logowanie

Wszystkie logi z konsoli przeglądarki są automatycznie przechwytywane i zapisywane w `.cursor/debug.log`.

### Odczytywanie logów

Logi są dostępne w czasie rzeczywistym w pliku `.cursor/debug.log` w formacie NDJSON (jeden JSON obiekt na linię).

### Format logów

```json
{
  "location": "apiClient.ts:68",
  "message": "API request start",
  "data": {
    "url": "http://192.168.0.14:3001/api/subscriptions",
    "endpoint": "/subscriptions",
    "method": "GET",
    "hasToken": true
  },
  "timestamp": 1735897867000,
  "sessionId": "debug-session",
  "runId": "run1",
  "hypothesisId": "A",
  "level": "log"
}
```

---

**Ostatnia aktualizacja:** 2024-12-19
