# 🚀 Instrukcja uruchomienia aplikacji z MariaDB

## ✅ Status
Aplikacja jest uruchomiona i działa z bazą danych MariaDB!

## 📋 Szybkie uruchomienie

### 1. Upewnij się, że MariaDB działa
```bash
docker ps | grep mariadb-akademiasaas
```

Jeśli nie działa, uruchom:
```bash
docker start mariadb-akademiasaas
```

### 2. Sprawdź konfigurację
Upewnij się, że w `apps/functions/.env.local` są ustawione:
```env
USE_MARIADB=true
DB_HOST=192.168.0.9
DB_PORT=3306
DB_USER=Saas
DB_PASSWORD=<YOUR_DB_PASSWORD>  # Ustaw hasło z .env
DB_NAME=Finanse
```

### 3. Uruchom aplikację

**Opcja A - Pełne uruchomienie (zalecane):**
```bash
pnpm dev
```

**Opcja B - Szybkie uruchomienie (jeśli wszystko jest już zbudowane):**
```bash
pnpm quick-dev
```

**Opcja C - Tylko frontend:**
```bash
cd apps/web-app
pnpm dev
```

## 🌐 Dostęp do aplikacji

Po uruchomieniu aplikacja będzie dostępna pod adresem:
- **Local:** http://localhost:3002 (lub kolejny wolny port)
- **Network:** http://192.168.0.14:3002

## 🔧 Rozwiązywanie problemów

### Problem: Port zajęty
Aplikacja automatycznie znajdzie następny wolny port (3003, 3004, itd.)

### Problem: Błąd połączenia z bazą
1. Sprawdź czy MariaDB działa: `docker ps | grep mariadb`
2. Sprawdź połączenie: 
```bash
docker exec -i mariadb-akademiasaas mariadb -h 192.168.0.9 -P 3306 -u Saas -p$DB_PASSWORD Finanse -e "SELECT 1;"
```

### Problem: Shared package nie zbudowany
```bash
cd packages/shared
pnpm build
cd ../..
```

### Problem: Błędy TypeScript
```bash
pnpm check-types
```

## 📝 Logi

Logi aplikacji są zapisywane w:
- `app.log` - główne logi
- `apps/web-app/app.log` - logi frontendu

## 🛑 Zatrzymanie aplikacji

Naciśnij `Ctrl+C` w terminalu gdzie działa aplikacja.

Lub zatrzymaj procesy:
```bash
# Windows
taskkill /F /IM node.exe

# Linux/Mac
pkill -f "vite\|turbo"
```

## ✅ Weryfikacja działania

1. Otwórz http://localhost:3002 w przeglądarce
2. Sprawdź konsolę przeglądarki (F12) - nie powinno być błędów
3. Sprawdź logi w terminalu - powinny być informacje o połączeniu z bazą

## 🔄 Przełączanie między Firestore a MariaDB

**Użyj MariaDB:**
```env
USE_MARIADB=true
```

**Użyj Firestore (domyślnie):**
```env
USE_MARIADB=false
# lub usuń tę linię
```

## 📊 Status bazy danych

Sprawdź tabele w bazie:
```bash
docker exec -i mariadb-akademiasaas mariadb -h 192.168.0.9 -P 3306 -u Saas -p$DB_PASSWORD Finanse -e "SHOW TABLES;"
```

