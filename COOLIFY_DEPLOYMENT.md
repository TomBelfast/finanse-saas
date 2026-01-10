# 🚀 Deployment na Coolify - Instrukcja

## 📋 Wymagania wstępne

- Konto na Coolify
- Dostęp do repozytorium Git (GitHub/GitLab)
- Klucze API:
  - Clerk Secret Key i Publishable Key
  - (Opcjonalnie) Stripe, Postmark, Redis

---

## 🔧 Opcja 1: Deployment jako osobne aplikacje (ZALECANE dla Coolify)

Coolify działa najlepiej z osobnymi aplikacjami. Zalecamy deployment backendu i frontendu jako osobnych aplikacji.

### 1. Backend API

#### Konfiguracja w Coolify:

1. **Nowa aplikacja** → **Docker Image / Dockerfile**
2. **Build Pack**: Dockerfile
3. **Dockerfile Path**: `apps/functions/Dockerfile`
4. **Root Directory**: `.` (katalog główny repozytorium)

#### Environment Variables (WYMAGANE):

```env
# Database - ZEWNĘTRZNA BAZA DANYCH (istniejąca)
USE_MARIADB=true
DB_HOST=192.168.0.9  # IP/host zewnętrznej bazy danych (ZMIEŃ NA SWÓJ!)
DB_PORT=3306
DB_USER=Saas
DB_PASSWORD=Finanse2025
DB_NAME=Finanse
DB_CONNECTION_LIMIT=10

# Server
PORT=3015
NODE_ENV=production

# Clerk (WYMAGANE)
CLERK_SECRET_KEY=sk_test_xxx...
CLERK_PUBLISHABLE_KEY=pk_test_xxx...

# CORS - ustaw URL frontendu
CORS_ALLOWED_ORIGINS=https://twoj-frontend.com,https://www.twoj-frontend.com

# Optional - Redis Cache
# Option 1: Standard Redis (from Coolify or external Redis instance)
REDIS_URL=redis://username:password@host:port/db
# Example: redis://default:password@redis-host:6379/0

# Option 2: Upstash Redis REST API (alternative)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx...

# Other optional services
STRIPE_API_KEY=sk_live_xxx...
POSTMARK_API_KEY=xxx...
```

#### Port:

- **Public Port**: 3015 (lub inny, jaki chcesz)
- **Container Port**: 3015

---

### 2. Frontend

#### Konfiguracja w Coolify:

1. **Nowa aplikacja** → **Docker Image / Dockerfile**
2. **Build Pack**: Dockerfile
3. **Dockerfile Path**: `apps/web-app/Dockerfile`
4. **Root Directory**: `.` (katalog główny repozytorium)

#### Build Arguments (w sekcji Build):

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx...
VITE_API_URL=https://twoj-backend.com/api
VITE_DEBUG=false
```

#### Environment Variables:

```env
# Te zmienne są używane podczas build time (jako build args)
# Ustaw je w sekcji "Build Arguments" w Coolify
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx...
VITE_API_URL=https://api.twoja-domena.com/api
VITE_DEBUG=false
```

#### Port:

- **Public Port**: 80 (lub 3005 jeśli chcesz)
- **Container Port**: 80

---

### 3. MariaDB Database

#### ⚠️ WAŻNE: Używasz istniejącej bazy danych

Jeśli aplikacja ma działać na **tej samej bazie danych** (zewnętrznej), pomiń tworzenie nowej bazy.

#### Konfiguracja połączenia z zewnętrzną bazą danych:

W **Environment Variables** backendu ustaw:

```env
# Zewnętrzna baza danych (już istniejąca)
USE_MARIADB=true
DB_HOST=192.168.0.9  # IP/host zewnętrznej bazy danych
DB_PORT=3306
DB_USER=Saas
DB_PASSWORD=Finanse2025
DB_NAME=Finanse
DB_CONNECTION_LIMIT=10
```

**Uwagi:**
- `DB_HOST` - ustaw IP lub hostname zewnętrznej bazy danych
- Jeśli baza jest w innej sieci, upewnij się, że port 3306 jest dostępny z Coolify
- Możesz potrzebować skonfigurować firewall, aby pozwolić na połączenia z IP Coolify

#### Opcja A: Zarządzana baza danych Coolify (jeśli chcesz nową)

1. W Coolify: **Resources** → **Database** → **MariaDB**
2. Utwórz nową bazę danych
3. Skopiuj connection string i użyj w `DB_HOST` backendu

#### Opcja B: Docker Compose (jeśli Coolify to obsługuje)

Użyj `docker-compose.yml` z tego repozytorium (tylko jeśli chcesz lokalną bazę).

---

## 🔧 Opcja 2: Deployment jako Docker Compose

Jeśli Coolify obsługuje Docker Compose:

1. W Coolify: **Nowa aplikacja** → **Docker Compose**
2. **Compose File Path**: `docker-compose.yaml` (lub `docker-compose.yml` - oba formaty działają, ale `.yaml` jest preferowany przez Coolify)
3. **Root Directory**: `.`

### Environment Variables dla całego stacku:

Ustaw wszystkie zmienne wymienione powyżej w sekcji Environment Variables.

---

## 📝 Kroki deploymentu

### 1. Przygotowanie repozytorium

Upewnij się, że wszystkie pliki Docker są w repozytorium:

```bash
git add apps/functions/Dockerfile apps/web-app/Dockerfile docker-compose.yml
git commit -m "Add Dockerfiles for Coolify deployment"
git push
```

### 2. Konfiguracja w Coolify - Backend

1. **Repository**: Wybierz swoje repozytorium
2. **Branch**: `main` lub `master`
3. **Build Pack**: Dockerfile
4. **Dockerfile Location**: `apps/functions/Dockerfile`
5. **Root Directory**: `.`
6. **Port**: `3015`
7. **Environment Variables**: Ustaw wszystkie wymagane zmienne (patrz wyżej)

### 3. Konfiguracja w Coolify - Frontend

1. **Repository**: Wybierz swoje repozytorium
2. **Branch**: `main` lub `master`
3. **Build Pack**: Dockerfile
4. **Dockerfile Location**: `apps/web-app/Dockerfile`
5. **Root Directory**: `.`
6. **Build Arguments**:
   - `VITE_CLERK_PUBLISHABLE_KEY`: Twój Clerk publishable key
   - `VITE_API_URL`: URL backendu (np. `https://api.twoja-domena.com/api`)
   - `VITE_DEBUG`: `false`
7. **Port**: `80`

### 4. Konfiguracja bazy danych

#### ⚠️ Używasz istniejącej bazy danych - pomiń tworzenie nowej!

Jeśli aplikacja ma działać na **tej samej bazie danych**, która już istnieje:

1. **Nie twórz nowej bazy** w Coolify
2. **Ustaw tylko `DB_HOST`** na IP/hostname zewnętrznej bazy danych w Environment Variables backendu
3. **Sprawdź dostępność** - upewnij się, że baza danych jest dostępna z sieci Coolify (firewall, port 3306)
4. **Upewnij się, że schema jest aktualna** - jeśli potrzebujesz migracji, wykonaj je ręcznie w istniejącej bazie

#### Przykładowa konfiguracja:

```env
# W Coolify Environment Variables dla backendu:
DB_HOST=192.168.0.9  # IP twojej istniejącej bazy danych
DB_PORT=3306
DB_USER=Saas
DB_PASSWORD=Finanse2025
DB_NAME=Finanse
```

#### Jeśli chcesz utworzyć nową bazę (opcjonalne):

1. W Coolify: **Resources** → **Database** → **MariaDB**
2. Utwórz bazę danych
3. Zaktualizuj `DB_HOST`, `DB_USER`, `DB_PASSWORD` w backendzie
4. Uruchom migrację:
   ```sql
   -- Skopiuj zawartość database/schema.sql i wykonaj w bazie danych
   ```

---

## ✅ Weryfikacja deploymentu

### Backend:

```bash
curl https://twoj-backend.com/health
```

Powinno zwrócić status 200.

### Frontend:

Otwórz w przeglądarce:
```
https://twoj-frontend.com
```

Sprawdź w konsoli przeglądarki (F12), czy nie ma błędów połączenia z API.

---

## 🔒 Bezpieczeństwo

### Ważne ustawienia:

1. **CORS**: Ustaw `CORS_ALLOWED_ORIGINS` tylko na swoje domeny produkcyjne
2. **Environment Variables**: Nigdy nie commituj `.env.local` do repozytorium
3. **HTTPS**: Coolify automatycznie obsługuje HTTPS przez Let's Encrypt
4. **Database**: Używaj silnych haseł dla bazy danych

---

## 🐛 Rozwiązywanie problemów

### Backend nie startuje:

1. Sprawdź logi w Coolify
2. Sprawdź czy wszystkie environment variables są ustawione
3. Sprawdź połączenie z bazą danych
4. Sprawdź czy port 3015 jest dostępny

### Frontend nie łączy się z backendem:

1. Sprawdź `VITE_API_URL` w build arguments
2. Sprawdź `CORS_ALLOWED_ORIGINS` w backendzie
3. Sprawdź logi backendu w Coolify

### Baza danych:

1. Sprawdź czy baza danych jest uruchomiona
2. Sprawdź credentials (DB_USER, DB_PASSWORD, DB_NAME)
3. Sprawdź czy schema.sql został wykonany

### Redis Cache:

1. **Standard Redis (REDIS_URL)**: 
   - Upewnij się, że connection string jest w formacie `redis://username:password@host:port/db`
   - Jeśli używasz Redis z Coolify, użyj connection stringa dostarczonego przez Coolify
   - Sprawdź czy Redis jest dostępny z kontenera backendu (firewall, sieć)

2. **Upstash Redis (UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN)**:
   - Upewnij się, że URL zawiera `upstash.io` lub `upstash.com`
   - Sprawdź czy token jest poprawny i nie wygasł

3. **Cache nie działa (opcjonalne)**:
   - Jeśli Redis nie jest skonfigurowany, aplikacja będzie działać bez cache (z ostrzeżeniem w logach)
   - Cache jest opcjonalny - aplikacja działa również bez niego

---

## 📚 Dodatkowe zasoby

- [Coolify Documentation](https://coolify.io/docs)
- [Docker Documentation](https://docs.docker.com/)
- [Clerk Documentation](https://clerk.com/docs)

---

## 🎯 Quick Start Checklist

- [ ] Repozytorium zawiera Dockerfile dla backendu
- [ ] Repozytorium zawiera Dockerfile dla frontendu
- [ ] Utworzono aplikację Backend w Coolify
- [ ] Utworzono aplikację Frontend w Coolify
- [ ] Ustawiono wszystkie environment variables
- [ ] Ustawiono build arguments dla frontendu
- [ ] Skonfigurowano bazę danych MariaDB
- [ ] Wykonano migrację schematu bazy danych
- [ ] Zweryfikowano działanie `/health` endpoint
- [ ] Zweryfikowano działanie frontendu
- [ ] Skonfigurowano HTTPS (automatycznie przez Coolify)
- [ ] Skonfigurowano CORS dla produkcji
- [ ] (Opcjonalnie) Skonfigurowano Redis cache (REDIS_URL lub UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN)

---

**Gotowe! 🎉** Aplikacja powinna działać na Coolify.

