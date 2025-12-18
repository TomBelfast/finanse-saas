import type { LogEntry, LogOutput, LoggerConfig, LogLevel } from '../types.js';
import { LOG_LEVELS } from '../types.js';
import { formatLogEntry } from '../formatter.js';

export class ConsoleOutput {
  private config: LogOutput;
  private loggerConfig: LoggerConfig;

  constructor(config: LogOutput, loggerConfig: LoggerConfig) {
    this.config = config;
    this.loggerConfig = loggerConfig;
  }

  write(entry: LogEntry): void {
    const minLevel = this.config.level || this.loggerConfig.level;
    if (LOG_LEVELS[entry.level] < LOG_LEVELS[minLevel]) {
      return;
    }

    const format = this.config.format || this.loggerConfig.format;
    const formatted = formatLogEntry(entry, {
      ...this.loggerConfig,
      format,
    });

    // Use appropriate console method based on level
    switch (entry.level) {
      case 'ERROR':
      case 'CRITICAL':
        console.error(formatted);
        break;
      case 'WARNING':
        console.warn(formatted);
        break;
      case 'DEBUG':
      case 'TRACE':
        console.debug(formatted);
        break;
      default:
        console.log(formatted);
    }
  }
}
