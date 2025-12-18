# 🔐 Konfiguracja Clerk - Autoryzacja

## ✅ Co zostało zrobione:

1. **Frontend:**
   - ✅ Dodano `@clerk/clerk-react` do `package.json`
   - ✅ Zaktualizowano `App.tsx` - dodano `ClerkProvider`
   - ✅ Zaktualizowano `AuthChecker.tsx` - używa Clerk hooks
   - ✅ Zaktualizowano `Login.tsx` - używa komponentu `<SignIn />` z Clerk
   - ✅ Zaktualizowano `Register.tsx` - używa komponentu `<SignUp />` z Clerk
   - ✅ Zaktualizowano `ProtectedRoute.tsx` - używa `useAuth()` z Clerk

2. **Backend:**
   - ✅ Dodano `@clerk/clerk-sdk-node` do `package.json`
   - ✅ Zaktualizowano `restRoutes.ts` - używa `ClerkExpressRequireAuth()`
   - ✅ Wszystkie endpointy używają weryfikacji Clerk tokenów

## 📋 Konfiguracja:

### 1. Utwórz konto Clerk:
1. Przejdź na https://clerk.com
2. Utwórz konto (darmowe dla developmentu)
3. Utwórz nową aplikację

### 2. Skonfiguruj zmienne środowiskowe:

**Frontend (`.env.local` w `apps/web-app/`):**
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

**Backend (`apps/functions/.env.local`):**
```env
CLERK_SECRET_KEY=sk_test_...
```

### 3. Skonfiguruj Clerk Dashboard:
1. W Clerk Dashboard → API Keys → skopiuj:
   - **Publishable Key** → `VITE_CLERK_PUBLISHABLE_KEY`
   - **Secret Key** → `CLERK_SECRET_KEY`

2. W Clerk Dashboard → Paths → ustaw:
   - Sign-in path: `/auth/login`
   - Sign-up path: `/auth/register`

## 🚀 Uruchomienie:

```bash
# Frontend
cd apps/web-app
pnpm install
pnpm dev

# Backend
cd apps/functions
pnpm install
pnpm build
pnpm start
```

## 📝 Uwagi:

1. **Automatyczne tworzenie użytkowników**: Gdy użytkownik loguje się przez Clerk, automatycznie tworzy się rekord w MariaDB (jeśli nie istnieje)

2. **Synchronizacja danych**: `AuthChecker` synchronizuje dane użytkownika z Clerk do Redux store

3. **Tokeny**: Clerk automatycznie zarządza tokenami - nie trzeba ręcznie obsługiwać JWT

4. **Stylowanie**: Komponenty Clerk można stylować przez `appearance` prop

## 🔄 Migracja z JWT na Clerk:

- ✅ Usunięto kod JWT z backendu
- ✅ Wszystkie endpointy używają `verifyClerkToken`
- ✅ Frontend używa Clerk komponentów zamiast własnych formularzy

## 📚 Dokumentacja Clerk:

- Frontend: https://clerk.com/docs/references/react/overview
- Backend: https://clerk.com/docs/backend-requests/overview












