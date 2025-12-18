# 💰 Finanse SaaS

Kompleksowa platforma SaaS do zarządzania finansami osobistymi i biznesowymi. Aplikacja oferuje zaawansowane funkcje zarządzania subskrypcjami, płatnościami, ubezpieczeniami i kredytami.

## 🚀 Funkcje

### 👤 Zarządzanie użytkownikami
- Rejestracja i autoryzacja użytkowników
- Profile użytkowników z pełną konfiguracją
- System ról i uprawnień
- Panel administracyjny

### 💳 Płatności i subskrypcje
- Integracja ze Stripe
- Zarządzanie planami subskrypcji
- Automatyczne faktury
- Historia płatności

### 🏦 Finanse
- Zarządzanie ubezpieczeniami
- Śledzenie kredytów i pożyczek
- Generowanie raportów finansowych
- Dashboard z statystykami

### 🔧 Integracje
- Firebase (Authentication, Firestore, Functions)
- Stripe (Płatności)
- Fakturownia (Faktury)
- Slack (Powiadomienia)
- Email (Postmark)

## 🛠️ Stack technologiczny

### Frontend
- **React 18** - Nowoczesna biblioteka UI
- **TypeScript** - Typowanie statyczne
- **Vite** - Szybki bundler
- **Ant Design** - Komponenty UI
- **Redux Toolkit** - Zarządzanie stanem
- **SCSS** - Stylowanie

### Backend
- **Firebase Functions** - Serverless
- **Node.js** - Runtime
- **TypeScript** - Typowanie
- **Firestore** - Baza danych NoSQL
- **Firebase Auth** - Autoryzacja

### DevOps
- **pnpm** - Package manager
- **ESLint** - Linting
- **Prettier** - Formatowanie kodu
- **Husky** - Git hooks
- **Lerna** - Monorepo

## 📦 Struktura projektu

```
finanse-saas/
├── apps/
│   ├── web-app/          # Frontend React
│   └── functions/        # Firebase Functions
├── packages/
│   └── shared/          # Wspólne biblioteki
├── docs/               # Dokumentacja
└── scripts/           # Skrypty pomocnicze
```

## 🚀 Szybki start

> 📖 **Kompletne instrukcje uruchomienia:** Zobacz [QUICK_START.md](./QUICK_START.md) dla szczegółowych instrukcji krok po kroku.

### ⚡ Szybkie polecenia

```bash
# Pełne uruchomienie od zera (pierwsza instalacja)
pnpm quick-start

# Szybkie uruchomienie (gdy już jest skonfigurowane)
pnpm quick-dev
```

### 📋 Minimalne wymagania
- Node.js 18+
- pnpm 8+
- Dostęp do projektu Firebase
- Pliki `.env.local` skonfigurowane

### 🔗 Przydatne linki
- [Szczegółowe instrukcje uruchomienia](./QUICK_START.md)
- [Konfiguracja zmiennych środowiskowych](./docs/06-environment-variables.md)
- [Konfiguracja Firebase](./docs/03-firebase-configuration.md)

## 🔑 Konfiguracja

### Firebase
1. Utwórz projekt w [Firebase Console](https://console.firebase.google.com)
2. Włącz Authentication, Firestore, Functions
3. Pobierz klucze konfiguracyjne
4. Skonfiguruj `.env.local`

### Stripe
1. Utwórz konto w [Stripe](https://stripe.com)
2. Pobierz klucze API (test/production)
3. Skonfiguruj webhooks
4. Dodaj klucze do `.env.local`

### Inne integracje
- **Fakturownia**: Klucz API dla generowania faktur
- **Postmark**: SMTP dla emaili
- **Slack**: Webhook dla powiadomień

## 📝 Skrypty

```bash
# Rozwój
pnpm dev              # Uruchom aplikację w trybie dev
pnpm emulator         # Uruchom emulatory Firebase
pnpm build            # Zbuduj wszystkie pakiety

# Deployment
pnpm deploy           # Wdróż functions i hosting
pnpm deploy:functions # Tylko functions
pnpm deploy:hosting   # Tylko hosting

# Utrzymanie
pnpm lint             # Sprawdź kod
pnpm format           # Sformatuj kod
pnpm test             # Uruchom testy
```

## 🌍 Deployment

### Firebase Hosting + Functions
```bash
# Zbuduj aplikację
pnpm build

# Wdróż na Firebase
firebase deploy
```

### Zmienne środowiskowe (Production)
```bash
# Ustaw zmienne dla functions
firebase functions:config:set stripe.api_key="sk_live_..."
firebase functions:config:set postmark.api_key="..."
```

## 📄 Licencja

MIT License - zobacz [LICENSE](LICENSE) dla szczegółów.

## 🤝 Contributing

1. Fork projektu
2. Utwórz branch dla feature (`git checkout -b feature/amazing-feature`)
3. Commit zmian (`git commit -m 'Add amazing feature'`)
4. Push branch (`git push origin feature/amazing-feature`)
5. Otwórz Pull Request

## 📞 Kontakt

- **Email**: [email]
- **GitHub**: [github-profile]
- **LinkedIn**: [linkedin-profile]

## 🙏 Podziękowania

- Firebase team za amazing platform
- Stripe za payment processing
- React team za fantastic library
- Wszystkim contributors!

---

⭐ **Jeśli projekt Ci się podoba, zostaw gwiazdkę!** ⭐
