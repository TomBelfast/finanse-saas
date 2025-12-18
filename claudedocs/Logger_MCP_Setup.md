# Logger MCP Server - Konfiguracja

## Status: GOTOWY DO UŻYCIA

System logowania i MCP Server zostały utworzone w `packages/logger/`.

## Jak dodać do Cursor

Otwórz plik `C:\Users\Tomasz\.cursor\mcp.json` i dodaj na końcu sekcji `mcpServers`:

```json
"logger": {
  "command": "node",
  "args": ["K:/SSSAAAAAAS dzialajacy/packages/logger/dist/mcp/cli.js"]
}
```

**Pełna linia do dodania** (po `wordpress-mcp`):

```json
    },
    "logger": {
      "command": "node",
      "args": ["K:/SSSAAAAAAS dzialajacy/packages/logger/dist/mcp/cli.js"]
    }
```

Po dodaniu **zrestartuj Cursor**.

## Dostępne narzędzia MCP

| Narzędzie | Opis |
|-----------|------|
| `read_logs` | Czyta i filtruje logi z pliku |
| `tail_logs` | Ostatnie N linii (jak `tail -f`) |
| `search_logs` | Szuka w logach (tekst lub regex) |
| `analyze_errors` | Analizuje błędy, grupuje według typu |
| `get_log_stats` | Statystyki logów |

## Przykłady użycia w Cursor

Po skonfigurowaniu możesz pytać AI:

- "Przeczytaj ostatnie 50 linii z K:/SSSAAAAAAS dzialajacy/app.log"
- "Znajdź wszystkie błędy w logach"
- "Analizuj błędy z ostatniej godziny"
- "Pokaż statystyki logów"
- "Wyszukaj 'authentication' w logach"

## Użycie Logger w kodzie

```typescript
import { Logger } from '@akademiasaas/logger';

const log = new Logger({
  level: 'DEBUG',
  format: 'pretty',
  outputs: [
    { type: 'console' },
    {
      type: 'file',
      path: './logs/app.log',
      rotation: { maxSize: '10MB', maxFiles: 5 }
    }
  ]
});

log.info('Aplikacja wystartowała');
log.debug('Przetwarzam request', { userId: 123 });
log.error('Błąd połączenia', new Error('ECONNREFUSED'));
```

## Struktura plików

```
packages/logger/
├── src/
│   ├── index.ts        # Eksporty główne
│   ├── logger.ts       # Klasa Logger
│   ├── types.ts        # Typy TypeScript
│   ├── colors.ts       # Kolory (styl Loguru)
│   ├── formatter.ts    # Formatowanie logów
│   ├── outputs/        # Wyjścia (konsola, plik)
│   │   ├── console.ts
│   │   └── file.ts
│   └── mcp/           # MCP Server
│       ├── server.ts   # Serwer MCP
│       ├── tools.ts    # Narzędzia MCP
│       └── cli.ts      # Entry point CLI
├── dist/              # Skompilowane pliki
├── package.json
├── tsconfig.json
└── README.md
```

## Poziomy logowania

| Poziom | Ikona | Kolor | Użycie |
|--------|-------|-------|--------|
| TRACE | ⋯ | Szary | Bardzo szczegółowe debugowanie |
| DEBUG | 🔍 | Niebieski | Debugowanie w development |
| INFO | ℹ | Cyan | Informacje ogólne |
| SUCCESS | ✓ | Zielony | Pomyślne operacje |
| WARNING | ⚠ | Żółty | Potencjalne problemy |
| ERROR | ✗ | Czerwony | Błędy wymagające uwagi |
| CRITICAL | 💥 | Czerwone tło | Awarie systemu |
