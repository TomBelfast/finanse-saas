# 🔥 Pozostałości Firebase w Pakiecie Shared

**Problem:** Pakiet `packages/shared` nadal zawiera kod używający Firebase, mimo że aplikacja została zmigrowana na REST API + MariaDB.

## 📍 Główne Miejsca z Firebase

### 1. `packages/shared/src/store/store.ts`
- **Problem:** Definiuje `StoreDependencies` z typami Firebase
- **Linie:** 20-30, 96-98, 103
- **Kod:**
```typescript
export interface StoreDependencies {
  firestore: typeof firebase.firestore;
  db: firebase.firestore.Firestore;
  auth: typeof firebase.auth;
  analytics: AnalyticsService;
  functions: firebase.functions.Functions;
  database?: typeof firebase.database;
}
```

### 2. `packages/shared/src/store/reducers/user/actions/getUserDetails.ts`
- **Problem:** Używa Firebase Firestore do pobierania danych użytkownika
- **Linie:** 4, 6, 10, 13, 24-58
- **Kod:**
```typescript
import firebase from 'firebase/compat';
import { COLLECTION } from '../../../../firestore';

const ref = db.collection(COLLECTION.USERS).doc(uid);
firestoreSubscriptions.userDetailsListener = ref.onSnapshot(...)
```

### 3. `packages/shared/src/store/reducers/integrationApiTokens/actions/subscribeToApiTokens.ts`
- **Problem:** Subskrybuje do Firebase Firestore dla tokenów API
- **Linie:** 9, 23-47
- **Kod:**
```typescript
import { COLLECTION, DOCUMENT } from '../../../../firestore';

const ref = db
  .collection(COLLECTION.USERS)
  .doc(user.uid)
  .collection(COLLECTION.SETTINGS)
  .doc(DOCUMENT.INTEGRATION_CONFIG)
  .collection(COLLECTION.API_TOKENS)
```

### 4. `packages/shared/src/store/reducers/notifications/actions/subscribeToNotifications.ts`
- **Problem:** Subskrybuje do Firebase Firestore dla powiadomień
- **Linie:** 3, 4, 36-66
- **Kod:**
```typescript
import firebase from 'firebase/compat';
import { COLLECTION } from '../../../../firestore/collectionNames';

const ref = db
  .collection(COLLECTION.USERS)
  .doc(user.uid)
  .collection(COLLECTION.NOTIFICATIONS)
```

## 🔧 Rozwiązanie

### Opcja 1: Wyłączyć Firebase Actions (Tymczasowe - Już Zrobione)
✅ Wyłączono wywołania w:
- `apps/web-app/src/pages/Settings/Settings.tsx`
- `apps/web-app/src/modules/NotificationsDrawer/NotificationsDrawer.tsx`

### Opcja 2: Zastąpić Firebase Actions API Calls (Rekomendowane)

#### 2.1. Utworzyć nowe API-based actions w `packages/shared`:

**Nowy plik:** `packages/shared/src/store/reducers/user/actions/getUserDetailsFromAPI.ts`
```typescript
import { AppThunk } from '../../../index';
import { getUserDetailsFailed, getUserDetailsStarted, getUserDetailsSuccess } from '../reducer';
import { UserDocument } from '../../../../models/documents';

export const getUserDetailsFromAPI =
  (uid: string, apiClient: any): AppThunk =>
  async (dispatch) => {
    dispatch(getUserDetailsStarted());
    try {
      const userData = await apiClient.getCurrentUser();
      if (userData) {
        dispatch(getUserDetailsSuccess({
          ...userData,
          systemRole: null,
          isImpersonated: false,
        } as any));
      } else {
        dispatch(getUserDetailsFailed());
      }
    } catch (error) {
      console.error('[getUserDetailsFromAPI] Error:', error);
      dispatch(getUserDetailsFailed());
    }
  };
```

**Nowy plik:** `packages/shared/src/store/reducers/integrationApiTokens/actions/fetchApiTokensFromAPI.ts`
```typescript
import { AppThunk } from '../../../index';
import {
  subscribeToApiTokensFailed,
  subscribeToApiTokensStarted,
  subscribeToApiTokensSuccess,
} from '../reducer';
import { ApiTokenDocument } from '../../../../models/documents';

export const fetchApiTokensFromAPI =
  (apiClient: any): AppThunk =>
  async (dispatch) => {
    try {
      dispatch(subscribeToApiTokensStarted());
      const tokens = await apiClient.getApiTokens();
      dispatch(subscribeToApiTokensSuccess(tokens || []));
    } catch (error: any) {
      dispatch(subscribeToApiTokensFailed(error.message || 'Failed to fetch API tokens'));
    }
  };
```

**Nowy plik:** `packages/shared/src/store/reducers/notifications/actions/fetchNotificationsFromAPI.ts`
```typescript
import { AppThunk } from '../../../index';
import {
  subscribeToNotificationsFailed,
  subscribeToNotificationsStarted,
  subscribeToNotificationsSuccess,
} from '../reducer';
import { Notification } from '../../../../models/documents/notifications';

export const fetchNotificationsFromAPI =
  (apiClient: any, onlyUnread = false): AppThunk =>
  async (dispatch) => {
    try {
      dispatch(subscribeToNotificationsStarted());
      const notifications = await apiClient.getNotifications(onlyUnread);
      const totalUnread = notifications.filter((n: Notification) => n.status === 'unread').length;
      dispatch(subscribeToNotificationsSuccess({
        filter: onlyUnread ? 'unread' : 'all',
        list: notifications,
        totalUnread,
      }));
    } catch (error) {
      dispatch(subscribeToNotificationsFailed());
    }
  };
```

#### 2.2. Zaktualizować `packages/shared/src/store/store.ts`:

Usunąć zależności od Firebase i zastąpić je opcjonalnymi:
```typescript
export interface StoreDependencies {
  // Firebase removed - using REST API instead
  analytics: AnalyticsService;
  config?: {
    APP_FUNCTION_DOMAIN: string;
  };
  // Optional: API client can be passed if needed
  apiClient?: any;
}
```

#### 2.3. Zaktualizować `apps/web-app/src/initializeStore.ts`:

```typescript
import { apiClient } from '~/services/apiClient';

export const { store } = createStore({
  analytics: analyticsService,
  config: {
    APP_FUNCTION_DOMAIN: import.meta.env.VITE_FUNCTION_DOMAIN || import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  },
  apiClient, // Pass API client to store
});
```

### Opcja 3: Usunąć Firebase całkowicie (Długoterminowe)

1. **Usunąć zależności Firebase:**
   ```bash
   cd packages/shared
   pnpm remove firebase
   ```

2. **Usunąć pliki Firebase:**
   - `packages/shared/src/firestore/` (jeśli istnieje)
   - `packages/shared/src/config/firebase.ts`
   - Wszystkie actions używające Firebase

3. **Zaktualizować typy w `store.ts`:**
   - Usunąć wszystkie referencje do `firebase.*`
   - Zaktualizować `StoreDependencies`

4. **Zaktualizować wszystkie Redux actions:**
   - Zastąpić Firebase calls przez API calls
   - Usunąć `onSnapshot` subscriptions
   - Dodać polling lub WebSocket dla real-time updates

## 📋 Plan Działania

### Krótkoterminowe (Już Zrobione ✅):
- [x] Wyłączyć Firebase subscriptions w komponentach
- [x] Naprawić `AuthChecker` aby używał API zamiast `getUserDetails`

### Średnioterminowe:
- [ ] Utworzyć API endpoints dla:
  - [ ] `/api/notifications` - GET, POST, PUT, DELETE
  - [ ] `/api/api-tokens` - GET, POST, DELETE
- [ ] Utworzyć nowe Redux actions używające API
- [ ] Zaktualizować komponenty aby używały nowych actions

### Długoterminowe:
- [ ] Usunąć wszystkie importy Firebase z `packages/shared`
- [ ] Usunąć `firebase` z `package.json` w `packages/shared`
- [ ] Zaktualizować `StoreDependencies` aby nie wymagał Firebase
- [ ] Dodać WebSocket lub Server-Sent Events dla real-time updates

## 🚨 Obecny Stan

**Problem:** Redux actions w `packages/shared` próbują używać Firebase, ale:
1. Firebase nie jest zainicjalizowany w aplikacji
2. Mock functions w `initializeStore.ts` rzucają błędy
3. Actions kończą się błędami `subscribeToApiTokensFailed`, `subscribeToNotificationsFailed`

**Rozwiązanie Tymczasowe:** Wyłączono wywołania tych actions w komponentach.

**Rozwiązanie Trwałe:** Utworzyć nowe actions używające API zamiast Firebase.

---

**Ostatnia aktualizacja:** 2024-12-19
