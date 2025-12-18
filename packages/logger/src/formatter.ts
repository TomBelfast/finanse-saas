import dayjs from 'dayjs';
import type { LogEntry, LoggerConfig } from './types.js';
import {
  formatLevel,
  formatTimestamp,
  formatModule,
  formatMessage,
  formatStack,
} from './colors.js';

/**
 * Format log entry for output
 */
export function formatLogEntry(entry: LogEntry, config: LoggerConfig): string {
  switch (config.format) {
    case 'json':
      return formatJson(entry);
    case 'pretty':
      return formatPretty(entry, config.colorize);
    case 'simple':
    default:
      return formatSimple(entry, config.colorize);
  }
}

function formatJson(entry: LogEntry): string {
  return JSON.stringify(entry);
}

function formatPretty(entry: LogEntry, colorize: boolean): string {
  const parts: string[] = [];

  // Timestamp
  const timestamp = dayjs(entry.timestamp).toDate();
  parts.push(formatTimestamp(timestamp, colorize));

  // Level with icon
  parts.push(formatLevel(entry.level, colorize));

  // Module (if present)
  if (entry.module) {
    parts.push(formatModule(entry.module, colorize));
  }

  // Location (file:line)
  if (entry.file && entry.line) {
    const location = `${entry.file}:${entry.line}`;
    parts.push(colorize ? `\x1b[90m${location}\x1b[0m` : location);
  }

  // Separator
  parts.push('|');

  // Message
  parts.push(formatMessage(entry.message, entry.level, colorize));

  let output = parts.join(' ');

  // Extra data
  if (entry.extra && Object.keys(entry.extra).length > 0) {
    const extraStr = JSON.stringify(entry.extra, null, 2);
    output += `\n${colorize ? '\x1b[90m' : ''}${extraStr}${colorize ? '\x1b[0m' : ''}`;
  }

  // Error stack
  if (entry.error?.stack) {
    output += '\n' + formatStack(entry.error.stack, colorize);
  }

  return output;
}

function formatSimple(entry: LogEntry, colorize: boolean): string {
  const parts: string[] = [];

  // Short timestamp (HH:mm:ss)
  const time = dayjs(entry.timestamp).format('HH:mm:ss');
  parts.push(colorize ? `\x1b[90m${time}\x1b[0m` : time);

  // Level (short)
  parts.push(formatLevel(entry.level, colorize));

  // Message
  parts.push(formatMessage(entry.message, entry.level, colorize));

  return parts.join(' ');
}

/**
 * Parse a log line back into LogEntry (for reading log files)
 */
export function parseLogLine(line: string): LogEntry | null {
  // Try JSON format first
  try {
    const parsed = JSON.parse(line);
    if (parsed.timestamp && parsed.level && parsed.message) {
      return parsed as LogEntry;
    }
  } catch {
    // Not JSON, try to parse as text
  }

  // Try to parse pretty/simple format
  const timestampMatch = line.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}|\d{2}:\d{2}:\d{2})/);
  const levelMatch = line.match(/\b(TRACE|DEBUG|INFO|SUCCESS|WARNING|ERROR|CRITICAL)\b/);

  if (levelMatch) {
    const level = levelMatch[1] as LogEntry['level'];
    const messageStart = line.indexOf('|');
    const message = messageStart > -1 ? line.slice(messageStart + 1).trim() : line;

    return {
      timestamp: timestampMatch ? timestampMatch[1] : new Date().toISOString(),
      level,
      message,
    };
  }

  return null;
}
