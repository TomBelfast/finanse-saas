# Playwright API Examples

## Overview

Playwright ma bardzo rozbudowane API do testowania aplikacji webowych. Ten folder zawiera przykłady użycia różnych funkcji API.

## Główne Komponenty API

### 1. Page API
Interakcje z stroną internetową:
- `page.goto()` - Nawigacja
- `page.click()` - Kliknięcie
- `page.fill()` - Wypełnienie formularza
- `page.screenshot()` - Screenshot
- `page.evaluate()` - Wykonanie JavaScript

### 2. Network API
Intercepcja i mockowanie requestów:
- `page.route()` - Intercept requests
- `page.waitForResponse()` - Czekaj na response
- `request.get()` / `request.post()` - Bezpośrednie HTTP requests

### 3. Browser Context API
Zarządzanie kontekstem przeglądarki:
- `browser.newContext()` - Nowy context
- `context.newPage()` - Nowa strona
- `context.storageState()` - Authentication state

### 4. Locators API
Selektory i lokalizatory elementów:
- `page.locator()` - Główny sposób selekcji
- `locator.filter()` - Filtrowanie
- `locator.first()` / `locator.nth()` - Wybór elementu

### 5. Assertions API
Asercje i weryfikacje:
- `expect(locator).toBeVisible()`
- `expect(locator).toContainText()`
- `expect(page).toHaveURL()`

## Przykłady Użycia

Zobacz `api-examples.spec.ts` dla szczegółowych przykładów każdego komponentu API.

## Dokumentacja

- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Page API](https://playwright.dev/docs/api/class-page)
- [Locator API](https://playwright.dev/docs/api/class-locator)
- [Network API](https://playwright.dev/docs/api/class-request)

