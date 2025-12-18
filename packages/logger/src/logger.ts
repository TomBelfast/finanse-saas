import dayjs from 'dayjs';
import type { LogEntry, LogLevel, LoggerConfig, LogOutput } from './types.js';
import { LOG_LEVELS } from './types.js';
import { ConsoleOutput } from './outputs/console.js';
import { FileOutput } from './outputs/file.js';

type OutputHandler = ConsoleOutput | FileOutput;

/**
 * Universal Logger - Loguru-style logging for TypeScript/Node.js
 *
 * @example
 * ```typescript
 * import { Logger } from '@akademiasaas/logger';
 *
 * const log = new Logger({
 *   level: 'DEBUG',
 *   format: 'pretty',
 *   outputs: [
 *     { type: 'console' },
 *     { type: 'file', path: './logs/app.log', rotation: { maxSize: '10MB', maxFiles: 5 } }
 *   ]
 * });
 *
 * log.info('Application started');
 * log.debug('Processing request', { userId: 123 });
 * log.error('Failed to connect', new Error('Connection refused'));
 * ```
 */
export class Logger {
  private config: LoggerConfig;
  private outputs: OutputHandler[] = [];
  private context: Record<string, unknown> = {};

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: config.level || 'INFO',
      format: config.format || 'pretty',
      colorize: config.colorize ?? true,
      timestamp: config.timestamp ?? true,
      module: config.module,
      outputs: config.outputs || [{ type: 'console' }],
    };

    this.initOutputs();
  }

  private initOutputs(): void {
    for (const outputConfig of this.config.outputs) {
      if (outputConfig.type === 'console') {
        this.outputs.push(new ConsoleOutput(outputConfig, this.config));
      } else if (outputConfig.type === 'file') {
        this.outputs.push(new FileOutput(outputConfig, this.config));
      }
    }
  }

  /**
   * Create a child logger with additional context
   */
  bind(context: Record<string, unknown>): Logger {
    const child = new Logger(this.config);
    child.context = { ...this.context, ...context };
    return child;
  }

  /**
   * Create a child logger with a specific module name
   */
  module(name: string): Logger {
    const child = new Logger({ ...this.config, module: name });
    child.context = { ...this.context };
    return child;
  }

  private log(level: LogLevel, message: string, extra?: Record<string, unknown> | Error): void {
    if (LOG_LEVELS[level] < LOG_LEVELS[this.config.level]) {
      return;
    }

    const entry: LogEntry = {
      timestamp: dayjs().toISOString(),
      level,
      message,
      module: this.config.module,
    };

    // Handle Error objects
    if (extra instanceof Error) {
      entry.error = {
        name: extra.name,
        message: extra.message,
        stack: extra.stack,
      };
    } else if (extra) {
      entry.extra = { ...this.context, ...extra };
    } else if (Object.keys(this.context).length > 0) {
      entry.extra = this.context;
    }

    // Try to capture call site
    const stack = new Error().stack;
    if (stack) {
      const lines = stack.split('\n');
      // Find the first line that's not from logger itself
      for (const line of lines.slice(2)) {
        if (!line.includes('logger.') && !line.includes('Logger.')) {
          const match = line.match(/at\s+(?:(.+?)\s+)?\(?(.+?):(\d+):(\d+)\)?/);
          if (match) {
            entry.function = match[1] || undefined;
            entry.file = match[2];
            entry.line = parseInt(match[3], 10);
          }
          break;
        }
      }
    }

    for (const output of this.outputs) {
      output.write(entry);
    }
  }

  // Log level methods
  trace(message: string, extra?: Record<string, unknown>): void {
    this.log('TRACE', message, extra);
  }

  debug(message: string, extra?: Record<string, unknown>): void {
    this.log('DEBUG', message, extra);
  }

  info(message: string, extra?: Record<string, unknown>): void {
    this.log('INFO', message, extra);
  }

  success(message: string, extra?: Record<string, unknown>): void {
    this.log('SUCCESS', message, extra);
  }

  warn(message: string, extra?: Record<string, unknown>): void {
    this.log('WARNING', message, extra);
  }

  warning(message: string, extra?: Record<string, unknown>): void {
    this.log('WARNING', message, extra);
  }

  error(message: string, error?: Error | Record<string, unknown>): void {
    this.log('ERROR', message, error);
  }

  critical(message: string, error?: Error | Record<string, unknown>): void {
    this.log('CRITICAL', message, error);
  }

  /**
   * Log with timing - returns a function to call when done
   */
  time(message: string): () => void {
    const start = performance.now();
    this.debug(`${message} - started`);

    return () => {
      const duration = performance.now() - start;
      this.debug(`${message} - completed`, { duration_ms: Math.round(duration * 100) / 100 });
    };
  }

  /**
   * Wrap an async function with automatic timing and error logging
   */
  async wrap<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const done = this.time(name);
    try {
      const result = await fn();
      done();
      return result;
    } catch (error) {
      this.error(`${name} - failed`, error as Error);
      throw error;
    }
  }

  /**
   * Close all file outputs
   */
  close(): void {
    for (const output of this.outputs) {
      if (output instanceof FileOutput) {
        output.close();
      }
    }
  }
}

// Default logger instance
export const logger = new Logger();
