# 🐳 Docker Deployment - Quick Reference

## ✅ Gotowe do uruchomienia w kontenerze!

Aplikacja jest przygotowana do uruchomienia w Dockerze i na Coolify. Utworzono następujące pliki:

### Pliki Docker:
- ✅ `apps/functions/Dockerfile` - Backend API
- ✅ `apps/web-app/Dockerfile` - Frontend (React + Vite + Nginx)
- ✅ `docker-compose.yml` - Pełny stack (Backend + Frontend + MariaDB)
- ✅ `.dockerignore` - Ignorowane pliki
- ✅ `apps/functions/.dockerignore`
- ✅ `apps/web-app/.dockerignore`
- ✅ `apps/web-app/nginx.conf` - Konfiguracja Nginx dla SPA

### Dokumentacja:
- 📚 `COOLIFY_DEPLOYMENT.md` - Pełna instrukcja deploymentu na Coolify

---

## 🚀 Szybki start lokalnie (docker-compose)

```bash
# 1. Skopiuj .env.example i ustaw zmienne (jeśli nie istnieje)
cp apps/functions/.env.local.example apps/functions/.env.local

# 2. Edytuj docker-compose.yml i ustaw zmienne środowiskowe

# 3. Uruchom cały stack
docker-compose up -d

# 4. Sprawdź logi
docker-compose logs -f

# 5. Sprawdź health
curl http://localhost:3015/health
```

---

## 📦 Build obrazów Docker lokalnie

### Backend:
```bash
docker build -f apps/functions/Dockerfile -t finanse-backend:latest .
docker run -p 3015:3015 --env-file apps/functions/.env.local finanse-backend:latest
```

### Frontend:
```bash
docker build -f apps/web-app/Dockerfile \
  --build-arg VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx \
  --build-arg VITE_API_URL=http://localhost:3015/api \
  -t finanse-frontend:latest .
docker run -p 3005:80 finanse-frontend:latest
```

---

## ⚠️ Ważne przed deploymentem

1. **Environment Variables**: Ustaw wszystkie wymagane zmienne w Coolify (patrz `COOLIFY_DEPLOYMENT.md`)
2. **Database**: Utwórz bazę danych MariaDB i wykonaj migrację (`database/schema.sql`)
3. **CORS**: Ustaw `CORS_ALLOWED_ORIGINS` na produkcyjne URL-e
4. **HTTPS**: Coolify automatycznie obsługuje HTTPS przez Let's Encrypt

---

## 🔍 Weryfikacja

### Backend Health Check:
```bash
curl https://twoj-backend.com/health
# Powinno zwrócić: {"status":"ok","database":"connected"}
```

### Frontend:
Otwórz w przeglądarce i sprawdź konsolę (F12) czy nie ma błędów połączenia z API.

---

## 📚 Pełna dokumentacja

Zobacz `COOLIFY_DEPLOYMENT.md` dla szczegółowej instrukcji deploymentu na Coolify.

