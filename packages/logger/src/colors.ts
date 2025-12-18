import chalk from 'chalk';
import type { LogLevel } from './types.js';

/**
 * Color configuration for each log level (Loguru-style)
 */
export const LEVEL_COLORS: Record<LogLevel, (text: string) => string> = {
  TRACE: chalk.dim.gray,
  DEBUG: chalk.blue,
  INFO: chalk.cyan,
  SUCCESS: chalk.green,
  WARNING: chalk.yellow,
  ERROR: chalk.red,
  CRITICAL: chalk.bgRed.white.bold,
};

export const LEVEL_ICONS: Record<LogLevel, string> = {
  TRACE: '⋯',
  DEBUG: '🔍',
  INFO: 'ℹ',
  SUCCESS: '✓',
  WARNING: '⚠',
  ERROR: '✗',
  CRITICAL: '💥',
};

export function colorize(level: LogLevel, text: string): string {
  return LEVEL_COLORS[level](text);
}

export function formatLevel(level: LogLevel, colorized: boolean = true): string {
  const icon = LEVEL_ICONS[level];
  const paddedLevel = level.padEnd(8);
  const formatted = `${icon} ${paddedLevel}`;
  return colorized ? colorize(level, formatted) : formatted;
}

export function formatTimestamp(date: Date, colorized: boolean = true): string {
  const timestamp = date.toISOString().replace('T', ' ').replace('Z', '');
  return colorized ? chalk.dim(timestamp) : timestamp;
}

export function formatModule(module: string, colorized: boolean = true): string {
  return colorized ? chalk.magenta(`[${module}]`) : `[${module}]`;
}

export function formatMessage(message: string, level: LogLevel, colorized: boolean = true): string {
  if (!colorized) return message;

  if (level === 'ERROR' || level === 'CRITICAL') {
    return chalk.red(message);
  }
  if (level === 'WARNING') {
    return chalk.yellow(message);
  }
  if (level === 'SUCCESS') {
    return chalk.green(message);
  }
  return message;
}

export function formatStack(stack: string, colorized: boolean = true): string {
  if (!colorized) return stack;

  return stack
    .split('\n')
    .map((line, i) => {
      if (i === 0) return chalk.red.bold(line);
      if (line.includes('node_modules')) return chalk.dim(line);
      return chalk.red(line);
    })
    .join('\n');
}
