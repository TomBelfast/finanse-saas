/**
 * Console Logger - Automatically captures console logs and sends them to debug logging system
 * This allows real-time monitoring of browser console logs without manual copying
 */

const LOG_SERVER_ENDPOINT = 'http://127.0.0.1:7247/ingest/c64f34cb-8772-47e6-b6e2-3cac4f3a7de2';
const SESSION_ID = 'debug-session';

interface LogEntry {
  location: string;
  message: string;
  data?: any;
  timestamp: number;
  sessionId: string;
  runId: string;
  hypothesisId?: string;
  level: 'log' | 'warn' | 'error' | 'info' | 'debug';
}

class ConsoleLogger {
  private originalConsole: {
    log: typeof console.log;
    warn: typeof console.warn;
    error: typeof console.error;
    info: typeof console.info;
    debug: typeof console.debug;
  };
  private runId: string;
  // Disabled by default - enable only when debug logging server is running
  private enabled: boolean = false;

  constructor() {
    this.runId = `run-${Date.now()}`;
    // Store original console methods
    this.originalConsole = {
      log: console.log.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console),
      info: console.info.bind(console),
      debug: console.debug.bind(console),
    };

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Intercept console.log
    console.log = (...args: any[]) => {
      this.originalConsole.log(...args);
      this.sendLog('log', this.formatMessage(args), args);
    };

    // Intercept console.warn
    console.warn = (...args: any[]) => {
      this.originalConsole.warn(...args);
      this.sendLog('warn', this.formatMessage(args), args);
    };

    // Intercept console.error
    console.error = (...args: any[]) => {
      this.originalConsole.error(...args);
      this.sendLog('error', this.formatMessage(args), args);
    };

    // Intercept console.info
    console.info = (...args: any[]) => {
      this.originalConsole.info(...args);
      this.sendLog('info', this.formatMessage(args), args);
    };

    // Intercept console.debug
    console.debug = (...args: any[]) => {
      this.originalConsole.debug(...args);
      this.sendLog('debug', this.formatMessage(args), args);
    };

    // Intercept unhandled errors
    window.addEventListener('error', (event) => {
      this.sendLog('error', `Unhandled Error: ${event.message}`, {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.toString(),
        stack: event.error?.stack,
      });
    });

    // Intercept unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.sendLog('error', `Unhandled Promise Rejection: ${event.reason}`, {
        reason: event.reason?.toString(),
        stack: event.reason?.stack,
      });
    });
  }

  private formatMessage(args: any[]): string {
    return args
      .map((arg) => {
        if (arg instanceof Error) {
          return `${arg.name}: ${arg.message}${arg.stack ? '\n' + arg.stack : ''}`;
        }
        if (typeof arg === 'object' && arg !== null) {
          try {
            // Check if it's a plain object that can be stringified
            if (Object.getPrototypeOf(arg) === Object.prototype || Array.isArray(arg)) {
              return JSON.stringify(arg);
            }
            // For Error-like objects or other non-serializable objects
            return String(arg);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      })
      .join(' ');
  }

  private sendLog(level: LogEntry['level'], message: string, data?: any) {
    if (!this.enabled) return;

    // Extract location from stack trace if available
    let location = 'unknown';
    try {
      const stack = new Error().stack;
      if (stack) {
        const lines = stack.split('\n');
        // Skip first 2 lines (Error and sendLog)
        if (lines.length > 2) {
          const callerLine = lines[2]?.trim();
          location = callerLine || 'unknown';
        }
      }
    } catch {
      // Ignore stack trace errors
    }

    // Format data for logging - handle Error objects specially
    let formattedData: any = data;
    if (data && typeof data === 'object') {
      if (Array.isArray(data)) {
        formattedData = data.map((item) => {
          if (item instanceof Error) {
            return {
              name: item.name,
              message: item.message,
              stack: item.stack,
            };
          }
          return item;
        });
      } else if (data instanceof Error) {
        formattedData = {
          name: data.name,
          message: data.message,
          stack: data.stack,
        };
      } else {
        // Try to serialize, but handle Error objects in nested structures
        try {
          formattedData = JSON.parse(JSON.stringify(data, (key, value) => {
            if (value instanceof Error) {
              return {
                name: value.name,
                message: value.message,
                stack: value.stack,
              };
            }
            return value;
          }));
        } catch {
          formattedData = { value: String(data) };
        }
      }
    } else {
      formattedData = { value: data };
    }

    const logEntry: LogEntry = {
      location,
      message,
      data: formattedData,
      timestamp: Date.now(),
      sessionId: SESSION_ID,
      runId: this.runId,
      level,
    };

    // Send to debug logging server (fire and forget)
    fetch(LOG_SERVER_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logEntry),
    }).catch(() => {
      // Silently fail - don't break the app if logging fails
    });
  }

  public disable() {
    this.enabled = false;
  }

  public enable() {
    this.enabled = true;
  }

  public setRunId(runId: string) {
    this.runId = runId;
  }
}

// Initialize console logger
export const consoleLogger = new ConsoleLogger();

// Export for manual control if needed
export default consoleLogger;
