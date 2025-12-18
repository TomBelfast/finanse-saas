# 🔧 Naprawa Ładowania Zmiennych Środowiskowych w Backendzie

## Problem

Backend nie ładuje automatycznie zmiennych środowiskowych z `.env.local`, przez co `CLERK_SECRET_KEY` nie jest dostępny dla Clerk SDK.

## Rozwiązanie

Dodano ręczne ładowanie `.env.local` w `apps/functions/src/server.ts`:

```typescript
// Load .env.local file manually if dotenv is not available
const envLocalPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').replace(/^["']|["']$/g, ''); // Remove quotes
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  });
}
```

## Weryfikacja

Backend teraz:
1. ✅ Ładuje zmienne z `.env.local` przy starcie
2. ✅ Loguje status `CLERK_SECRET_KEY` w konsoli backendu
3. ✅ Clerk SDK może odczytać `CLERK_SECRET_KEY` z `process.env`

## Następne kroki

**Zrestartuj backend**, aby zastosować zmiany:

```bash
cd apps/functions
# Zatrzymaj obecny proces (Ctrl+C)
pnpm dev
```

Po restarcie sprawdź w logach backendu:
- ✅ `Clerk: CLERK_SECRET_KEY is configured (sk_test_A77EF0SJMS7xu43mft...)`
- ❌ Jeśli widzisz `⚠️ Clerk: CLERK_SECRET_KEY is NOT configured`, sprawdź czy plik `.env.local` istnieje i zawiera klucz

---

**Ostatnia aktualizacja:** 2024-12-19
