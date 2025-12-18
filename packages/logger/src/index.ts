/**
 * @akademiasaas/logger
 *
 * Universal logging system (Loguru-style) with MCP Server for AI-powered log analysis
 *
 * @example
 * ```typescript
 * import { Logger, logger } from '@akademiasaas/logger';
 *
 * // Use default logger
 * logger.info('Hello world');
 *
 * // Or create custom instance
 * const log = new Logger({
 *   level: 'DEBUG',
 *   format: 'pretty',
 *   outputs: [
 *     { type: 'console' },
 *     { type: 'file', path: './logs/app.log' }
 *   ]
 * });
 *
 * log.info('Application started');
 * log.error('Something failed', new Error('Oops'));
 * ```
 */

export { Logger, logger } from './logger.js';
export type {
  LogLevel,
  LogEntry,
  LoggerConfig,
  LogOutput,
  LogFilter,
  LogStats,
} from './types.js';
export { LOG_LEVELS } from './types.js';
export { parseLogLine, formatLogEntry } from './formatter.js';
