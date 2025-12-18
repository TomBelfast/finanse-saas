# 🔐 Konfiguracja Clerk na Backendzie

## Problem

Błędy 500 z backendu z komunikatem:
```
Publishable key is missing. Ensure that your publishable key is correctly configured.
```

## Przyczyna

Backend używa `ClerkExpressRequireAuth()` który wymaga **CLERK_SECRET_KEY** w zmiennych środowiskowych.

## Rozwiązanie

### 1. Dodaj CLERK_SECRET_KEY do `.env.local` w backendzie

Otwórz plik `apps/functions/.env.local` i dodaj:

```bash
# Clerk Configuration (Backend)
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Gdzie znaleźć CLERK_SECRET_KEY:**
1. Zaloguj się do [Clerk Dashboard](https://dashboard.clerk.com)
2. Wybierz swoją aplikację
3. Przejdź do **API Keys**
4. Skopiuj **Secret Key** (zaczyna się od `sk_test_` dla development lub `sk_live_` dla production)

### 2. Zrestartuj backend

Po dodaniu klucza, zrestartuj backend:

```bash
cd apps/functions
# Zatrzymaj obecny proces (Ctrl+C)
pnpm dev
```

### 3. Weryfikacja

Sprawdź czy backend działa poprawnie:

```bash
# Health check
curl http://192.168.0.14:3001/health

# Test z tokenem (wymaga zalogowania w przeglądarce)
curl -H "Authorization: Bearer YOUR_CLERK_TOKEN" http://192.168.0.14:3001/api/users/me
```

## Uwagi

- **CLERK_SECRET_KEY** jest różny od **VITE_CLERK_PUBLISHABLE_KEY** używanego w frontendzie
- **Secret Key** jest używany tylko na backendzie do weryfikacji tokenów
- **Publishable Key** jest używany w frontendzie do inicjalizacji Clerk SDK
- **NIE** commituj CLERK_SECRET_KEY do repozytorium - dodaj `.env.local` do `.gitignore`

---

**Ostatnia aktualizacja:** 2024-12-19
