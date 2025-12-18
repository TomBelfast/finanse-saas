# @akademiasaas/logger

Universal logging system (Loguru-style) with MCP Server for AI-powered log analysis.

## Features

- **Loguru-style logging** - colorful console output with icons
- **Multiple outputs** - console + file with rotation
- **MCP Server** - AI can read and analyze your logs
- **Universal** - works with any application that writes logs

## Installation

```bash
pnpm add @akademiasaas/logger
```

## Usage

### Basic Logging

```typescript
import { Logger, logger } from '@akademiasaas/logger';

// Use default logger
logger.info('Hello world');
logger.error('Something failed', new Error('Oops'));

// Or create custom instance
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

log.info('Application started');
log.debug('Processing request', { userId: 123 });
log.success('Operation completed');
log.warn('This is deprecated');
log.error('Failed to connect', new Error('Connection refused'));
log.critical('System failure!');
```

### Module-based Logging

```typescript
const authLog = log.module('auth');
authLog.info('User logged in'); // Shows [auth] prefix

const dbLog = log.module('database');
dbLog.error('Connection lost');
```

### Timing Operations

```typescript
// Manual timing
const done = log.time('Database query');
await db.query('SELECT * FROM users');
done(); // Logs duration

// Automatic timing with error handling
const result = await log.wrap('API call', async () => {
  return fetch('/api/data');
});
```

## MCP Server for Cursor

The logger includes an MCP Server that allows AI assistants to read and analyze your logs.

### Setup in Cursor

Add to your `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "logger": {
      "command": "node",
      "args": ["./packages/logger/dist/mcp/cli.js"],
      "cwd": "K:/SSSAAAAAAS dzialajacy"
    }
  }
}
```

Or for global use, add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "logger": {
      "command": "node",
      "args": ["K:/SSSAAAAAAS dzialajacy/packages/logger/dist/mcp/cli.js"]
    }
  }
}
```

### Available MCP Tools

| Tool | Description |
|------|-------------|
| `read_logs` | Read and filter log entries |
| `tail_logs` | Get last N lines (like tail -f) |
| `search_logs` | Search with text or regex |
| `analyze_errors` | Group errors by type, find patterns |
| `get_log_stats` | Get statistics (counts by level, time range) |

### Example AI Queries

After setup, you can ask Cursor:

- "Read the last 50 lines from app.log"
- "Search for authentication errors in the logs"
- "Analyze all errors from the last hour"
- "What are the most common error types?"
- "Show me warnings related to database"

## Log Levels

| Level | Icon | Color | Use Case |
|-------|------|-------|----------|
| TRACE | ⋯ | Gray | Very detailed debugging |
| DEBUG | 🔍 | Blue | Development debugging |
| INFO | ℹ | Cyan | General information |
| SUCCESS | ✓ | Green | Successful operations |
| WARNING | ⚠ | Yellow | Potential issues |
| ERROR | ✗ | Red | Errors that need attention |
| CRITICAL | 💥 | Red BG | System failures |

## Configuration

```typescript
interface LoggerConfig {
  level: LogLevel;           // Minimum level to log
  format: 'json' | 'pretty' | 'simple';
  colorize: boolean;         // Enable colors in console
  timestamp: boolean;        // Include timestamps
  module?: string;           // Module name prefix
  outputs: LogOutput[];      // Output destinations
}

interface LogOutput {
  type: 'console' | 'file';
  level?: LogLevel;          // Override minimum level
  path?: string;             // File path (for file output)
  rotation?: {
    maxSize?: string;        // e.g., '10MB'
    maxFiles?: number;       // Keep N rotated files
  };
}
```

## File Output Format

File output always uses JSON format for easy parsing:

```json
{"timestamp":"2024-12-16T15:30:00.000Z","level":"INFO","message":"Server started","module":"app"}
{"timestamp":"2024-12-16T15:30:01.000Z","level":"ERROR","message":"Connection failed","error":{"name":"Error","message":"ECONNREFUSED","stack":"..."}}
```
