# 🗄️ Deployment z zewnętrzną bazą danych

## 📋 Scenariusz

Aplikacja będzie działać na **tej samej bazie danych**, która już istnieje (np. na serwerze lokalnym lub innym hostingu).

## ✅ Konfiguracja w Coolify

### Backend - Environment Variables

Ustaw następujące zmienne środowiskowe w aplikacji backendu w Coolify:

```env
# Database - zewnętrzna baza danych (istniejąca)
USE_MARIADB=true
DB_HOST=192.168.0.9        # ← ZMIEŃ NA IP/HOSTNAME TWOJEJ BAZY DANYCH
DB_PORT=3306               # Port bazy danych
DB_USER=Saas               # Użytkownik bazy danych
DB_PASSWORD=<YOUR_DB_PASSWORD>    # Hasło bazy danych
DB_NAME=Finanse            # Nazwa bazy danych
DB_CONNECTION_LIMIT=10     # Limit połączeń

# Server
PORT=3015
NODE_ENV=production

# Clerk (WYMAGANE)
CLERK_SECRET_KEY=sk_test_xxx...
CLERK_PUBLISHABLE_KEY=pk_test_xxx...

# CORS - URL frontendu
CORS_ALLOWED_ORIGINS=https://twoj-frontend.com,https://www.twoj-frontend.com
```

### Frontend - Build Arguments

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx...
VITE_API_URL=https://twoj-backend.com/api
VITE_DEBUG=false
```

## 🔒 Bezpieczeństwo i dostępność

### 1. Dostępność z Coolify

Upewnij się, że baza danych jest dostępna z sieci, gdzie działa Coolify:

- **Publiczna baza danych**: Ustaw `DB_HOST` na publiczny IP
- **Lokalna/prywatna baza**: 
  - Sprawdź, czy port 3306 jest otwarty
  - Skonfiguruj firewall, aby pozwolić połączenia z IP Coolify
  - Rozważ VPN lub tunel SSH, jeśli baza jest w sieci prywatnej

### 2. Firewall

Jeśli baza danych ma firewall, dodaj regułę:

```bash
# Przykład: Zezwól na połączenia z IP Coolify
# (Zastąp YOUR_COOLIFY_IP adresem IP serwera Coolify)
iptables -A INPUT -p tcp --dport 3306 -s YOUR_COOLIFY_IP -j ACCEPT
```

### 3. Użytkownik bazy danych

Upewnij się, że użytkownik bazy danych (`DB_USER`) ma uprawnienia do:
- SELECT, INSERT, UPDATE, DELETE
- Może łączyć się z IP Coolify (lub '%' dla wszystkich IP)

```sql
-- Przykład: Utworzenie użytkownika z dostępem z zewnątrz
CREATE USER 'Saas'@'%' IDENTIFIED BY '<YOUR_DB_PASSWORD>';
GRANT ALL PRIVILEGES ON Finanse.* TO 'Saas'@'%';
FLUSH PRIVILEGES;
```

## ✅ Weryfikacja połączenia

### Przed uruchomieniem aplikacji:

```bash
# Z serwera Coolify sprawdź, czy możesz połączyć się z bazą:
mysql -h 192.168.0.9 -P 3306 -u Saas -p$DB_PASSWORD Finanse -e "SELECT 1;"
```

### Po uruchomieniu aplikacji:

Sprawdź logi backendu w Coolify - powinieneś zobaczyć:

```
Database connection pool created
Database initialized: MariaDB
```

## 🔧 Troubleshooting

### Problem: "Connection refused" lub timeout

**Rozwiązanie:**
1. Sprawdź, czy baza danych nasłuchuje na wszystkich interfejsach (`bind-address = 0.0.0.0` w my.cnf)
2. Sprawdź firewall - port 3306 musi być otwarty
3. Sprawdź, czy IP Coolify ma dostęp do bazy

### Problem: "Access denied for user"

**Rozwiązanie:**
1. Sprawdź credentials (`DB_USER`, `DB_PASSWORD`)
2. Sprawdź, czy użytkownik ma uprawnienia do łączenia się z IP Coolify
3. Sprawdź, czy użytkownik ma uprawnienia do bazy danych

### Problem: "Unknown database"

**Rozwiązanie:**
1. Sprawdź `DB_NAME` - musi dokładnie odpowiadać nazwie bazy
2. Utwórz bazę danych, jeśli nie istnieje:
   ```sql
   CREATE DATABASE IF NOT EXISTS Finanse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

## 📊 Monitorowanie

### Sprawdź połączenia:

```sql
-- Zobacz aktywne połączenia z bazy danych
SHOW PROCESSLIST;

-- Zobacz status bazy danych
SHOW STATUS;
```

### Logi w Coolify:

Monitoruj logi backendu w Coolify, aby zobaczyć:
- Czy połączenie z bazą zostało nawiązane
- Czy są błędy połączenia
- Liczbę aktywnych połączeń

## 🎯 Checklist

- [ ] `DB_HOST` ustawiony na IP/hostname zewnętrznej bazy danych
- [ ] Port 3306 jest dostępny z sieci Coolify
- [ ] Firewall skonfigurowany (jeśli potrzebny)
- [ ] Użytkownik bazy danych ma odpowiednie uprawnienia
- [ ] Test połączenia zakończony powodzeniem
- [ ] Backend uruchomiony i łączy się z bazą
- [ ] Logi pokazują "Database initialized: MariaDB"
- [ ] Health check endpoint `/health` działa
- [ ] Frontend łączy się z backendem

---

**Gotowe!** Aplikacja działa na istniejącej bazie danych. 🎉

