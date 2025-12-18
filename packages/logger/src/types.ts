/**
 * Log levels similar to Loguru
 */
export type LogLevel = 'TRACE' | 'DEBUG' | 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'CRITICAL';

export const LOG_LEVELS: Record<LogLevel, number> = {
  TRACE: 5,
  DEBUG: 10,
  INFO: 20,
  SUCCESS: 25,
  WARNING: 30,
  ERROR: 40,
  CRITICAL: 50,
};

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  module?: string;
  function?: string;
  line?: number;
  file?: string;
  extra?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export interface LoggerConfig {
  level: LogLevel;
  format: 'json' | 'pretty' | 'simple';
  colorize: boolean;
  timestamp: boolean;
  module?: string;
  outputs: LogOutput[];
}

export interface LogOutput {
  type: 'console' | 'file';
  level?: LogLevel;
  format?: 'json' | 'pretty' | 'simple';
  path?: string; // for file output
  rotation?: {
    maxSize?: string; // e.g., '10MB'
    maxFiles?: number;
    maxAge?: string; // e.g., '7d'
  };
}

export interface LogFilter {
  level?: LogLevel;
  module?: string;
  search?: string;
  regex?: string;
  from?: Date;
  to?: Date;
  limit?: number;
}

export interface LogStats {
  total: number;
  byLevel: Record<LogLevel, number>;
  errors: number;
  warnings: number;
  timeRange: {
    from?: string;
    to?: string;
  };
}
