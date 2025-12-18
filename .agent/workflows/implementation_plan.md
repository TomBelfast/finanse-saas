---
description: Aktualny plan implementacji migracji UI
---

# Plan implementacji (stan na 2025‑12‑17 14:10 UTC)

## ✅ Zakończone
- **Subscriptions page** – pełna migracja z Ant Design na shadcn/ui (tabela, formularz, modal, karty, filtry, upload). 
- **GenericIntegrationForm** – naprawiono obsługę `Switch` (użycie `onChange`/`onCheckedChange`) i typy `react‑hook‑form`. 
- **Subscription page** – zamieniono importy Ant Design na shadcn/ui (`Alert`, `Badge`, `Button`, `Card`, `Select`, `Input`, `Switch`) oraz zastąpiono `message` z `antd` przez `sonner` toast. 
- **UploadField** – już kompatybilny z shadcn/ui (native file input + dialog). 
- **TableFiltersPanel** – używa shadcn/ui komponentów (`Input`, `Select`, `DatePickerWithRange`). 
- **Typy TypeScript** – dodano trzeci generyk w `useForm` w `Subscriptions.tsx` i `BroadcastMessageForm.tsx`. 
- **Plan aktualizacji** – utworzono i zaktualizowano plik `implementation_plan.md` z bieżącym stanem. 

## ⏳ W toku
- **Subscription.tsx** – dalsza migracja UI (zastąpienie `Descriptions`, `Empty`, `Grid`, `Space`, `Tag`, `Typography` komponentami shadcn/ui). 
- **DraggableTable** – poprawki typów przy dostępie do pól (`record[col.dataIndex]`). 
- **Testy** – uruchomienie `npm run check-types` po każdej grupie zmian oraz testy jednostkowe. 

## 📌 Do zrobienia
1. Dokończyć migrację `Subscription.tsx` (layout, responsywność, dostępność). 
2. Naprawić typy w `DraggableTable` (dynamiczny dostęp do kolumn). 
3. Dodać brakujące shadcn/ui komponenty (`Checkbox`, `Calendar`, `Popover`) jeśli będą potrzebne w innych widokach. 
4. Przeprowadzić pełny test TypeScript (`npm run check-types`) i naprawić ewentualne błędy. 
5. Uruchomić testy UI (`npm test` lub `npm run test`) i zweryfikować poprawność działania formularzy i modali. 
6. Zaktualizować dokumentację w `MIGRATION_SUMMARY.md` o nowe zmiany. 

---

*Plan będzie aktualizowany na bieżąco po kolejnych commitach i uruchomieniach testów.*
