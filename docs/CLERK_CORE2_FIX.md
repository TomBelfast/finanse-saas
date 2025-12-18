# 🔧 Naprawa Błędu "Publishable key is missing" - Clerk Core 2

## Problem

Błędy w konsoli przeglądarki:
```
Error: Publishable key is missing. Ensure that your publishable key is correctly configured.
```

## Przyczyna

W **Clerk Core 2**, `ClerkExpressRequireAuth()` wymaga **zarówno** `CLERK_SECRET_KEY` jak i `CLERK_PUBLISHABLE_KEY`!

To jest zmiana w stosunku do poprzednich wersji Clerk SDK, gdzie wystarczył tylko `CLERK_SECRET_KEY`.

## Rozwiązanie

### 1. Dodaj `CLERK_PUBLISHABLE_KEY` do backendu

Otwórz `apps/functions/.env.local` i dodaj:

```bash
# Clerk Configuration (Backend) - REQUIRED for authentication
# Clerk Core 2 requires BOTH CLERK_SECRET_KEY and CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY=sk_test_A77EF0SJMS7xu43mftAbhOZLs3TJNcqOXQYdcUIQsY
CLERK_PUBLISHABLE_KEY=pk_test_bWlnaHR5LWRvYmVybWFuLTUzLmNsZXJrLmFjY291bnRzLmRldiQ
```

**Uwaga:** `CLERK_PUBLISHABLE_KEY` w backendzie powinien być taki sam jak `VITE_CLERK_PUBLISHABLE_KEY` w frontendzie.

### 2. Zaktualizowano `ClerkExpressRequireAuth()`

W `apps/functions/src/modules/auth/infra/restRoutes.ts`:

```typescript
// Clerk Core 2 requires both secretKey and publishableKey
export const verifyClerkToken = ClerkExpressRequireAuth({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
}) as unknown as RequestHandler;
```

### 3. Zrestartuj backend

```bash
cd apps/functions
# Zatrzymaj obecny proces (Ctrl+C)
pnpm dev
```

### 4. Weryfikacja

Po restarcie sprawdź w logach backendu:
- ✅ `✅ CLERK_SECRET_KEY: SET (sk_test_A77EF0SJMS7xu43mft...)`
- ✅ `✅ CLERK_PUBLISHABLE_KEY: SET (pk_test_bWlnaHR5LWRvYmVyb...)`
- ✅ `✅ Clerk: CLERK_SECRET_KEY is configured`
- ✅ `✅ Clerk: CLERK_PUBLISHABLE_KEY is configured`

## Dokumentacja Clerk

- [Clerk Core 2 Upgrade Guide](https://clerk.com/docs/upgrade-guides/core-2/node)
- [Clerk API Keys](https://clerk.com/docs/upgrade-guides/api-keys)

---

**Ostatnia aktualizacja:** 2024-12-19
