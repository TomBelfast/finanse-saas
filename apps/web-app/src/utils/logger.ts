/**
 * Simple logger wrapper for consistent logging across the frontend application.
 * Can be extended to use external logging services or analytics.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogMeta {
    [key: string]: unknown
}

const LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
}

// Get log level from environment variable (Vite uses import.meta.env)
const getLogLevel = (): LogLevel => {
    const envLevel = import.meta.env.VITE_LOG_LEVEL as LogLevel | undefined;
    if (envLevel && ['debug', 'info', 'warn', 'error'].includes(envLevel)) {
        return envLevel;
    }
    // Default to 'info' in production, 'debug' in development
    return import.meta.env.PROD ? 'info' : 'debug';
}

const currentLevel = getLogLevel();

function shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function formatMessage(level: LogLevel, message: string, meta?: LogMeta): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level.toUpperCase()}] ${message}${metaStr}`;
}

export const logger = {
    debug(message: string, meta?: LogMeta): void {
        if (shouldLog('debug')) {
            // eslint-disable-next-line no-console
            console.debug(formatMessage('debug', message, meta));
        }
    },

    info(message: string, meta?: LogMeta): void {
        if (shouldLog('info')) {
            // eslint-disable-next-line no-console
            console.info(formatMessage('info', message, meta));
        }
    },

    warn(message: string, meta?: LogMeta): void {
        if (shouldLog('warn')) {
            // eslint-disable-next-line no-console
            console.warn(formatMessage('warn', message, meta));
        }
    },

    error(message: string, error?: Error | unknown, meta?: LogMeta): void {
        if (shouldLog('error')) {
            const errorMeta = error instanceof Error
                ? { error: error.message, stack: error.stack, ...meta }
                : { error, ...meta };
            // eslint-disable-next-line no-console
            console.error(formatMessage('error', message, errorMeta));
        }
    },
}

export default logger

