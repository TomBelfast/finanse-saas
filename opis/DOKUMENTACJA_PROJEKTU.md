# Dokumentacja Projektu - Finanse SaaS

## Przegląd Projektu

**Akademia SaaS** to zaawansowana aplikacja SaaS (Software as a Service) do zarządzania finansami osobistymi i biznesowymi, zbudowana w architekturze monorepo z wykorzystaniem Firebase, React i TypeScript.

### Główne Funkcjonalności
- **Zarządzanie subskrypcjami** - śledzenie i analiza wszystkich subskrypcji użytkownika
- **Zarządzanie ubezpieczeniami** - monitoring polis ubezpieczeniowych
- **Zarządzanie pożyczkami** - śledzenie kredytów i zobowiązań
- **Wsparcie wielowalutowe** - PLN, EUR, USD, GBP
- **System płatności** - integracja ze Stripe
- **Powiadomienia w czasie rzeczywistym** - informacje o transakcjach i terminach
- **Panel administracyjny** - zarządzanie użytkownikami i systemem
- **API dla integracji** - tokeny API do łączenia z zewnętrznymi systemami

## Architektura Monorepo

Projekt wykorzystuje architekturę monorepo zarządzaną przez **Lerna**, **pnpm** i **Turbo**:

```
/
├── apps/
│   ├── functions/          # Firebase Cloud Functions (Backend)
│   └── web-app/           # React Web Application (Frontend)
├── packages/
│   └── shared/            # Wspólna biblioteka typów i logiki biznesowej
└── docs/                  # Dokumentacja projektu
```

### Technologie Główne
- **Frontend**: React 18.2, TypeScript, Ant Design, Tailwind CSS, Vite
- **Backend**: Firebase Cloud Functions, Node.js 22, TypeScript
- **Baza danych**: Cloud Firestore (NoSQL)
- **Autentykacja**: Firebase Auth
- **Płatności**: Stripe
- **Zarządzanie stanem**: Redux Toolkit
- **Internacjonalizacja**: i18next (PL/EN)

## Dokumentacja Modułów

### 1. Shared Package (`@akademiasaas/shared`)

**Wspólna biblioteka** zawierająca typy, utilitki i logikę biznesową współdzieloną między aplikacjami.

#### Główne eksporty:
- **Constants**: Konfiguracja aplikacji, nazwy kolekcji, URL-e
- **Enums**: Typy płatności, statusy, rodzaje wydarzeń biznesowych
- **Models**: Modele dokumentów i domenowe (User, Subscription, Order, itp.)
- **Store**: Struktura Redux z reducerami dla użytkowników, subskrypcji, powiadomień
- **Services**: Serwis analityki, formatowanie walut
- **Utils**: Pomocnicze funkcje, walidatory, parsery
- **Translations**: Tłumaczenia PL/EN

#### Kluczowe modele danych:
```typescript
interface UserDocument {
  email: string;
  uid: string;
  subscription?: ShortSubscriptionInfo;
  features?: UserFeatures[];
  defaultCurrency?: Currency;
}

interface UserSubscriptionDocument {
  userId: string;
  name: string;
  amount: number;
  currency: string;
  status: UserSubscriptionStatus;
  isAutomaticRenewal: boolean;
  billingCycle: 'monthly' | 'yearly';
}
```

#### Redux Store:
- **user**: Autentykacja i profil użytkownika
- **notifications**: Powiadomienia w czasie rzeczywistym
- **integrationApiTokens**: Zarządzanie tokenami API
- **subscription**: Zarządzanie subskrypcją użytkownika
- **statistics**: Statystyki i analizy

### 2. Firebase Functions (`@akademiasaas/functions`)

**Serverless backend** implementujący Clean Architecture z modułami domenowymi.

#### Architektura Clean Architecture:
- **Controllers**: Obsługa HTTP requests i responses
- **Use Cases**: Logika biznesowa aplikacji
- **Repositories**: Dostęp do danych
- **Services**: Integracje z zewnętrznymi serwisami

#### Główne moduły:

##### Admin Module
- `BroadcastMessage` - Wysyłanie systemowych powiadomień do wszystkich użytkowników

##### Subscriptions Module (Kluczowy moduł biznesowy)
```typescript
// Główne przypadki użycia:
- CreateSubscriptionForUser     // Tworzenie nowej subskrypcji
- ChangeSubscriptionPlan        // Zmiana planu subskrypcji
- HandleSubscriptionCycle       // Obsługa cyklu rozliczeniowego
- HandleFailedPayment          // Obsługa nieudanych płatności
- HandleSubscriptionStatusUpdate // Zmiany statusu (anulowanie, pauza)
- CreateBillingCustomerPortal   // Portal klienta do zarządzania płatnościami
- CheckSubscriptionInvoice      // Weryfikacja faktur
```

##### Users Module
- `CreateApiToken`/`DeleteApiToken` - Zarządzanie tokenami API
- `GetUserMetadata` - Dane profilu użytkownika
- `SendLinkToLogin`/`SendResetPasswordEmail` - Procesy autentykacji

##### Invoices Module
- `IssueInvoiceToNewPayment` - Automatyczne generowanie faktur

##### System Module
- `AdminHandler` - Operacje administracyjne

#### Integracje zewnętrzne:
- **Stripe**: Pełna obsługa webhooków płatności
- **Postmark**: Transakcyjny email service
- **Slack**: Powiadomienia biznesowe
- **Upstash Redis**: Rate limiting i cache
- **Google Cloud Secret Manager**: Bezpieczna konfiguracja
- **Fakturownia**: Generowanie faktur
- **Meta Conversion API**: Śledzenie konwersji marketingowych

#### System zdarzeń biznesowych:
```typescript
enum BusinessEventType {
  USER_REGISTERED = 'UserRegistered',
  SUBSCRIPTION_TRIAL_ACTIVATED = 'SubscriptionTrialActivated',
  SUBSCRIPTION_PAYMENT_SUCCEEDED = 'SubscriptionPaymentSucceeded',
  SUBSCRIPTION_CANCELLED = 'SubscriptionCancelled'
}
```

### 3. React Web App (`@akademiasaas/web-app`)

**Nowoczesna aplikacja React SPA** z TypeScript i Vite.

#### Struktura komponentów:

##### Komponenty podstawowe (`/components`):
- `AuthChecker` - Zarządzanie stanem autentykacji
- `ProtectedRoute` - Zabezpieczenie tras
- `ErrorBoundary` - Obsługa błędów React
- `CreateApiTokenForm`, `SetPasswordForm` - Formularze
- `DatePicker`, `DraggableTable`, `UploadField` - Komponenty UI
- `Editor`, `MarkdownEditor` - Edytory treści

##### Strony (`/pages`):
```typescript
const routes = [
  '/home',           // Dashboard główny
  '/users',          // Zarządzanie użytkownikami
  '/reports',        // Raporty i analizy
  '/subscription',   // Zarządzanie subskrypcją systemu
  '/subscriptions',  // Subskrypcje użytkownika (finanse)
  '/insurances',     // Ubezpieczenia
  '/loans',          // Pożyczki
  '/settings',       // Ustawienia
  '/admin'           // Panel administracyjny
];
```

#### Funkcjonalności UI:
- **Responsive design** z Tailwind CSS
- **Ant Design** jako system komponentów
- **Rich text editor** z EditorJS
- **Drag & drop** dla tabel
- **Upload plików** do Firebase Storage
- **Internationalization** PL/EN
- **Dark/light theme** support

#### Integracja z backendem:
```typescript
// Firebase integration
const functions = firebase.app().functions(region);

// Real-time Firestore subscriptions
const unsubscribe = db.collection('user_subscriptions')
  .where('userId', '==', user.uid)
  .onSnapshot(snapshot => {
    const subscriptions = snapshot.docs.map(doc => doc.data());
    setSubscriptions(subscriptions);
  });
```

#### Zarządzanie stanem:
- **Redux Toolkit** ze wspólnego pakietu
- **Custom hooks** dla biznesowej logiki
- **Real-time synchronizacja** z Firestore
- **Lokalny cache** z persistencją

## Integracje i Zewnętrzne Serwisy

### Stripe Integration
- **Webhooks**: Pełna obsługa cyklu życia subskrypcji
- **Customer Portal**: Self-service dla użytkowników
- **Płatności**: Karty, SEPA, inne metody
- **Faktury**: Automatyczne generowanie i wysyłka

### Firebase Services
- **Firestore**: NoSQL baza danych z real-time synchronizacją
- **Auth**: Autentykacja użytkowników z tokenami JWT
- **Functions**: Serverless backend z automatycznym skalowaniem
- **Storage**: Przechowywanie plików z CDN
- **Hosting**: Statyczny hosting dla aplikacji web

### Email & Notifications
- **Postmark**: Transakcyjne emale (resetowanie hasła, faktury)
- **Slack**: Powiadomienia administracyjne
- **Push notifications**: Powiadomienia w aplikacji

### Monitorowanie i Analytics
- **Sentry**: Monitoring błędów i wydajności
- **PostHog**: Analityka użytkowników
- **Meta Pixel**: Śledzenie konwersji marketingowych
- **Firebase Analytics**: Podstawowe metryki aplikacji

## Deployment i DevOps

### Environemnty:
- **Development**: Firebase emulators lokalnie
- **Staging**: Firebase project staging
- **Production**: Firebase project production

### CI/CD Pipeline:
```bash
# Scripts główne
npm run quick-start    # Szybkie uruchomienie z instalacją
npm run dev           # Development mode wszystkich aplikacji
npm run build         # Build wszystkich aplikacji
npm run test          # Testy jednostkowe
npm run check-types   # Weryfikacja TypeScript
npm run precommit     # Pre-commit hooks (linting, testy)
```

### Turbo Configuration:
```json
{
  "tasks": {
    "build": { "dependsOn": ["^build"] },
    "check-types": { "dependsOn": ["^check-types"] },
    "dev": { "persistent": true, "cache": false }
  }
}
```

## Bezpieczeństwo

### Autentykacja i Autoryzacja:
- **Firebase Auth** z tokenami JWT
- **Role-based access control** (user, admin)
- **API tokens** z rate limiting
- **Protected routes** na frontendzie
- **Firestore Security Rules** na backendzie

### Ochrona danych:
- **Google Cloud Secret Manager** dla konfiguracji
- **HTTPS everywhere** z Firebase Hosting
- **CORS** konfiguracja dla API
- **Input validation** z Zod na wszystkich endpoints

### Rate Limiting:
```typescript
// Redis-based rate limiting
const rateLimiter = new Ratelimit({
  redis: upstashRedis,
  limiter: Ratelimit.slidingWindow(100, "1 h")
});
```

## Struktura Bazy Danych (Firestore)

### Główne kolekcje:
```
/users/{userId}                    # Profile użytkowników
/user_subscriptions/{docId}        # Subskrypcje użytkowników
/user_insurances/{docId}           # Ubezpieczenia
/user_loans/{docId}                # Pożyczki
/user_reminders/{docId}            # Przypomnienia
/notifications/{docId}             # Powiadomienia
/business-events/{docId}           # Wydarzenia biznesowe
/api-tokens/{docId}                # Tokeny API
/reports/{docId}                   # Raporty i statystyki
```

### Przykład dokumentu subskrypcji:
```typescript
interface UserSubscriptionDocument {
  id: string;
  userId: string;
  name: string;
  description?: string;
  amount: number;
  currency: 'pln' | 'eur' | 'usd' | 'gbp';
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: Date;
  status: 'active' | 'cancelled' | 'paused';
  isAutomaticRenewal: boolean;
  category?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

## Internacjonalizacja

### Obsługiwane języki:
- **Polski (PL)** - język główny
- **Angielski (EN)** - język alternatywny

### Struktura tłumaczeń:
```
/translations/
├── en/
│   ├── common.json      # Wspólne elementy UI
│   ├── auth.json        # Proces logowania
│   ├── dashboard.json   # Główny dashboard
│   ├── settings.json    # Ustawienia
│   └── subscription.json # Zarządzanie subskrypcjami
└── pl/ [analogicznie]
```

### Konfiguracja i18next:
```typescript
i18n.init({
  resources: translations,
  fallbackLng: ['en', 'pl'],
  defaultNS: 'common',
  ns: ['common', 'auth', 'dashboard', 'settings', 'subscription']
});
```

## Wielowalutowość

### Obsługiwane waluty:
- **PLN** (Polski złoty) - waluta podstawowa
- **EUR** (Euro)
- **USD** (Dolar amerykański)
- **GBP** (Funt brytyjski)

### Formatowanie walut:
```typescript
const currencyFormatter = {
  format: (amount: number, currency: Currency, locale?: string) => {
    return new Intl.NumberFormat(locale || 'pl-PL', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  }
};
```

## Metryki i Analizy

### Śledzenie użytkowników:
- **Rejestracje i logowania**
- **Aktywność w aplikacji**
- **Zarządzanie subskrypcjami**
- **Wykorzystanie funkcji**

### Business Intelligence:
- **Monthly Recurring Revenue (MRR)**
- **Customer Lifetime Value (CLV)**
- **Churn rate** użytkowników
- **Najpopularniejsze funkcje**

### Raporty finansowe:
- **Łączne koszty subskrypcji** (miesięczne/roczne)
- **Analiza kategorii wydatków**
- **Prognozowanie kosztów**
- **Porównania w czasie**

## Testowanie

### Frontend Testing:
```typescript
// Vitest + Testing Library
describe('SubscriptionCard', () => {
  it('displays subscription details correctly', () => {
    render(<SubscriptionCard subscription={mockSubscription} />);
    expect(screen.getByText('Netflix')).toBeInTheDocument();
    expect(screen.getByText('45,99 zł')).toBeInTheDocument();
  });
});
```

### Backend Testing:
```typescript
// Unit tests dla Use Cases
describe('CreateSubscriptionForUserUseCase', () => {
  it('should create subscription successfully', async () => {
    const result = await useCase.execute(validRequest);
    expect(result.isSuccess()).toBe(true);
    expect(result.getValue().subscriptionId).toBeDefined();
  });
});
```

### Integration Testing:
- **Firebase Emulators** dla pełnego stacka
- **Stripe Test Mode** dla płatności
- **E2E testing** z Cypress (planowane)

## Performance i Skalowanie

### Frontend Optimization:
- **Code splitting** z React.lazy()
- **Image optimization** z Firebase Storage
- **Memoization** z React.memo i useMemo
- **Virtual scrolling** dla długich list
- **Service Workers** dla cache (planowane)

### Backend Optimization:
- **Firestore indexes** dla szybkich zapytań
- **Redis caching** dla rate limiting
- **Batch operations** dla bulk updates
- **Background functions** dla heavy processing

### Monitoring wydajności:
```typescript
// Sentry Performance Monitoring
Sentry.addIntegration(new BrowserTracing({
  tracingOrigins: [location.hostname, /^\/api/]
}));
```

## Roadmap i Planowane Funkcjonalności

### Krótkoterminowe (Q1-Q2 2025):
- [ ] **Budżetowanie** - tworzenie i śledzenie budżetów
- [ ] **Cele finansowe** - oszczędzanie na konkretne cele
- [ ] **Raportowanie zaawansowane** - eksport do PDF/Excel
- [ ] **Mobilna aplikacja** - React Native lub Flutter
- [ ] **Integracje bankowe** - Open Banking API

### Średnioterminowe (Q3-Q4 2025):
- [ ] **AI Assistant** - automatyczne kategoryzowanie i doradztwo
- [ ] **Współdzielenie rodzinne** - shared budgets i subskrypcje
- [ ] **Marketplace integracji** - wtyczki i rozszerzenia
- [ ] **White-label solution** - możliwość rebrandingu
- [ ] **Advanced analytics** - predykcje i trendy

### Długoterminowe (2026+):
- [ ] **Blockchain integration** - crypto tracking
- [ ] **International expansion** - więcej walut i języków
- [ ] **B2B platform** - narzędzia dla firm
- [ ] **Open API ecosystem** - publiczne API dla deweloperów
- [ ] **Machine Learning** - personalizowane rekomendacje

## Compliance i Regulacje

### RODO/GDPR:
- **Zgodność z RODO** - prawo do usunięcia danych
- **Privacy Policy** - przejrzysta polityka prywatności
- **Consent management** - zarządzanie zgodami
- **Data portability** - eksport danych użytkownika

### PCI DSS:
- **Stripe compliance** - brak przechowywania danych karty
- **Secure tokenization** - bezpieczne tokeny płatności
- **Audit logging** - logi wszystkich transakcji

## Wsparcie i Dokumentacja

### Dokumentacja użytkownika:
- **Quick Start Guide** - szybkie wprowadzenie
- **User Manual** - pełna instrukcja obsługi
- **Video tutorials** - filmowe przewodniki
- **FAQ** - najczęściej zadawane pytania

### Dokumentacja deweloperska:
- **API Documentation** - OpenAPI/Swagger specs
- **SDK examples** - przykłady integracji
- **Architecture Decision Records** - decyzje architektoniczne
- **Contributing Guide** - guide dla kontrybutorów

## Kontakt i Zespół

### Zespół projektowy:
- **Backend Developer** - Firebase Functions, integrations
- **Frontend Developer** - React, UI/UX
- **DevOps Engineer** - deployment, monitoring
- **Product Manager** - roadmap, requirements

### Kanały komunikacji:
- **Slack workspace** - komunikacja zespołu
- **GitHub Issues** - bug tracking i feature requests
- **Figma** - design system i mockupy
- **Notion** - dokumentacja i knowledge base

---

*Dokumentacja wersja 1.0 - Grudzień 2024*
*Projekt: Akademia SaaS - Finanse*
*Status: Production Ready*