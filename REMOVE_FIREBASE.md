# Usuwanie Firebase z aplikacji - Postęp

## ✅ Co zostało zrobione:

1. **Backend (API Server)**
   - ✅ Utworzony standalone Express server (`apps/functions/src/server.ts`)
   - ✅ Utworzone REST API routes:
     - `/api/auth` - rejestracja, logowanie, weryfikacja tokenu
     - `/api/users` - zarządzanie użytkownikami
     - `/api/subscriptions` - subskrypcje, ubezpieczenia, kredyty
   - ✅ JWT Authentication zamiast Firebase Auth
   - ✅ Tabela `user_passwords` w MariaDB dla haseł

2. **Frontend - API Client**
   - ✅ Utworzony `apiClient.ts` z wszystkimi endpointami
   - ✅ Zaktualizowany komponent `Subscriptions.tsx` do używania API

## ⏳ Co jeszcze trzeba zrobić:

### Frontend - Komponenty do aktualizacji:
- [ ] `Insurances.tsx` - zastąpić Firestore przez API
- [ ] `Loans.tsx` - zastąpić Firestore przez API
- [ ] `Register.tsx` - użyć API zamiast Firebase Auth
- [ ] `Login.tsx` - użyć API zamiast Firebase Auth
- [ ] `LoginByEmail.tsx` - użyć API zamiast Firebase Auth
- [ ] `AuthChecker.tsx` - użyć JWT zamiast Firebase Auth
- [ ] `useUserDetails.ts` - użyć API zamiast Firestore
- [ ] `initializeStore.ts` - usunąć Firebase initialization

### Backend - Do ukończenia:
- [ ] Dodać endpoint dla przypomnień (reminders)
- [ ] Dodać endpoint dla raportów
- [ ] Dodać endpoint dla powiadomień
- [ ] Dodać endpoint dla ustawień

### Usunięcie zależności:
- [ ] Usunąć `firebase` z `apps/web-app/package.json`
- [ ] Usunąć `firebase-admin` z `apps/functions/package.json`
- [ ] Usunąć `firebase-functions` z `apps/functions/package.json`
- [ ] Usunąć wszystkie importy Firebase z kodu

### Konfiguracja:
- [ ] Dodać `VITE_API_URL` do `.env.local`
- [ ] Dodać `JWT_SECRET` do `apps/functions/.env.local`
- [ ] Zaktualizować skrypty uruchomieniowe

## 🚀 Jak uruchomić:

### Backend (API Server):
```bash
cd apps/functions
npm install
npm run build
node dist/server.js
```

### Frontend:
```bash
cd apps/web-app
npm install
npm run dev
```

## 📝 Uwagi:

1. **JWT Secret**: Zmień `JWT_SECRET` w produkcji na bezpieczny losowy string
2. **CORS**: Upewnij się, że CORS jest skonfigurowany dla frontendu
3. **HTTPS**: W produkcji użyj HTTPS dla bezpieczeństwa tokenów
4. **Refresh Tokens**: Rozważ dodanie refresh tokens dla lepszego UX

