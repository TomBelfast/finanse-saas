# 🐛 Plan Naprawy Błędów - Krok po Kroku

## Status: W trakcie naprawy

### ✅ Błędy zidentyfikowane:

1. **KRYTYCZNY: Brak CLERK_SECRET_KEY na backendzie**
   - **Błąd:** `Error: Publishable key is missing`
   - **Lokalizacja:** Backend API (`apps/functions/.env.local`)
   - **Status:** ⚠️ Wymaga ręcznej konfiguracji
   - **Rozwiązanie:** Dodaj `CLERK_SECRET_KEY` do `apps/functions/.env.local`
   - **Instrukcje:** Zobacz `docs/CLERK_BACKEND_SETUP.md`

2. **Warning: Ant Design message static function**
   - **Błąd:** `Warning: [antd: message] Static function can not consume context like dynamic theme`
   - **Lokalizacja:** `apps/web-app/src/pages/Subscriptions/Subscriptions.tsx`
   - **Status:** 🔄 Do naprawy
   - **Rozwiązanie:** Użyć `App` component z antd i `message` hook

3. **Warning: Clerk development keys**
   - **Błąd:** `Clerk: Clerk has been loaded with development keys`
   - **Status:** ℹ️ Informacyjny (nie jest błędem)
   - **Uwaga:** To jest normalne w środowisku deweloperskim

4. **Warning: Suffixed cookie failed**
   - **Błąd:** `Suffixed cookie failed due to Cannot read properties of undefined (reading 'digest')`
   - **Status:** ℹ️ Informacyjny (nie wpływa na funkcjonalność)
   - **Uwaga:** To jest warning z Clerk SDK w środowisku HTTP (nie HTTPS)

---

## 📋 Plan działania:

### Krok 1: Konfiguracja CLERK_SECRET_KEY (WYMAGANE)
**Użytkownik musi wykonać ręcznie:**
1. Otwórz `apps/functions/.env.local`
2. Dodaj linię:
   ```bash
   CLERK_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
   ```
3. Pobierz Secret Key z [Clerk Dashboard](https://dashboard.clerk.com) → API Keys → Secret Key
4. Zrestartuj backend: `cd apps/functions && pnpm dev`

### Krok 2: Naprawa Ant Design message (W TRAKCIE)
- [ ] Dodać `App` component z antd w `App.tsx`
- [ ] Zastąpić `message.error/success` statyczne funkcje hookiem `message`
- [ ] Zaktualizować wszystkie komponenty używające `message`

### Krok 3: Weryfikacja
- [ ] Sprawdzić czy wszystkie błędy zniknęły
- [ ] Przetestować funkcjonalność aplikacji
- [ ] Sprawdzić logi w MCP logger

---

**Ostatnia aktualizacja:** 2024-12-19
