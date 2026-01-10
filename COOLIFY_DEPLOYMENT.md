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
# Database (użyj zarządzanej bazy danych lub docker-compose)
USE_MARIADB=true
DB_HOST=mariadb  # lub zewnętrzny host
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

# Optional
STRIPE_API_KEY=sk_live_xxx...
POSTMARK_API_KEY=xxx...
REDIS_URL=https://xxx.upstash.io
REDIS_TOKEN=xxx...
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

#### Opcja A: Zarządzana baza danych Coolify

1. W Coolify: **Resources** → **Database** → **MariaDB**
2. Utwórz nową bazę danych
3. Skopiuj connection string i użyj w `DB_HOST` backendu

#### Opcja B: Docker Compose (jeśli Coolify to obsługuje)

Użyj `docker-compose.yml` z tego repozytorium.

---

## 🔧 Opcja 2: Deployment jako Docker Compose

Jeśli Coolify obsługuje Docker Compose:

1. W Coolify: **Nowa aplikacja** → **Docker Compose**
2. **Compose File Path**: `docker-compose.yml`
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

#### Jeśli używasz zarządzanej bazy danych:

1. W Coolify: **Resources** → **Database** → **MariaDB**
2. Utwórz bazę danych
3. Zaktualizuj `DB_HOST`, `DB_USER`, `DB_PASSWORD` w backendzie
4. Uruchom migrację:
   ```sql
   -- Skopiuj zawartość database/schema.sql i wykonaj w bazie danych
   ```

#### Jeśli używasz docker-compose:

Baza danych zostanie utworzona automatycznie z `database/schema.sql`.

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

---

**Gotowe! 🎉** Aplikacja powinna działać na Coolify.

