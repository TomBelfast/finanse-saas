import * as fs from 'node:fs';
import * as path from 'node:path';
import { z } from 'zod';
import type { LogEntry, LogFilter, LogStats, LogLevel } from '../types.js';
import { LOG_LEVELS } from '../types.js';
import { parseLogLine } from '../formatter.js';

/**
 * Read log file and parse entries
 */
export function readLogFile(filePath: string): LogEntry[] {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Log file not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  const entries: LogEntry[] = [];

  for (const line of lines) {
    const entry = parseLogLine(line);
    if (entry) {
      entries.push(entry);
    }
  }

  return entries;
}

/**
 * Filter log entries based on criteria
 */
export function filterLogs(entries: LogEntry[], filter: LogFilter): LogEntry[] {
  let filtered = entries;

  if (filter.level) {
    const minLevel = LOG_LEVELS[filter.level];
    filtered = filtered.filter(e => LOG_LEVELS[e.level] >= minLevel);
  }

  if (filter.module) {
    filtered = filtered.filter(e => e.module?.includes(filter.module!));
  }

  if (filter.search) {
    const searchLower = filter.search.toLowerCase();
    filtered = filtered.filter(e =>
      e.message.toLowerCase().includes(searchLower) ||
      e.error?.message.toLowerCase().includes(searchLower) ||
      e.error?.stack?.toLowerCase().includes(searchLower)
    );
  }

  if (filter.regex) {
    const regex = new RegExp(filter.regex, 'i');
    filtered = filtered.filter(e =>
      regex.test(e.message) ||
      (e.error?.message && regex.test(e.error.message)) ||
      (e.error?.stack && regex.test(e.error.stack))
    );
  }

  if (filter.from) {
    filtered = filtered.filter(e => new Date(e.timestamp) >= filter.from!);
  }

  if (filter.to) {
    filtered = filtered.filter(e => new Date(e.timestamp) <= filter.to!);
  }

  if (filter.limit) {
    filtered = filtered.slice(-filter.limit);
  }

  return filtered;
}

/**
 * Calculate log statistics
 */
export function getLogStats(entries: LogEntry[]): LogStats {
  const byLevel: Record<LogLevel, number> = {
    TRACE: 0,
    DEBUG: 0,
    INFO: 0,
    SUCCESS: 0,
    WARNING: 0,
    ERROR: 0,
    CRITICAL: 0,
  };

  for (const entry of entries) {
    byLevel[entry.level]++;
  }

  const timestamps = entries.map(e => e.timestamp).sort();

  return {
    total: entries.length,
    byLevel,
    errors: byLevel.ERROR + byLevel.CRITICAL,
    warnings: byLevel.WARNING,
    timeRange: {
      from: timestamps[0],
      to: timestamps[timestamps.length - 1],
    },
  };
}

/**
 * Get tail of log file (last N lines)
 */
export function tailLogFile(filePath: string, lines: number = 50): LogEntry[] {
  const entries = readLogFile(filePath);
  return entries.slice(-lines);
}

/**
 * Watch log file for changes (returns cleanup function)
 */
export function watchLogFile(
  filePath: string,
  callback: (entries: LogEntry[]) => void,
  options: { debounce?: number } = {}
): () => void {
  const debounceMs = options.debounce ?? 100;
  let timeout: NodeJS.Timeout | null = null;
  let lastSize = 0;

  const watcher = fs.watch(filePath, (eventType) => {
    if (eventType === 'change') {
      if (timeout) clearTimeout(timeout);

      timeout = setTimeout(() => {
        try {
          const stats = fs.statSync(filePath);
          if (stats.size > lastSize) {
            // Read only new content
            const fd = fs.openSync(filePath, 'r');
            const buffer = Buffer.alloc(stats.size - lastSize);
            fs.readSync(fd, buffer, 0, buffer.length, lastSize);
            fs.closeSync(fd);

            const newContent = buffer.toString('utf-8');
            const lines = newContent.split('\n').filter(line => line.trim());
            const entries: LogEntry[] = [];

            for (const line of lines) {
              const entry = parseLogLine(line);
              if (entry) entries.push(entry);
            }

            if (entries.length > 0) {
              callback(entries);
            }

            lastSize = stats.size;
          }
        } catch (error) {
          console.error('Error watching log file:', error);
        }
      }, debounceMs);
    }
  });

  // Initialize lastSize
  if (fs.existsSync(filePath)) {
    lastSize = fs.statSync(filePath).size;
  }

  return () => {
    if (timeout) clearTimeout(timeout);
    watcher.close();
  };
}

/**
 * Analyze errors and group by type
 */
export function analyzeErrors(entries: LogEntry[]): {
  total: number;
  byType: Record<string, { count: number; examples: LogEntry[] }>;
  recent: LogEntry[];
  patterns: string[];
} {
  const errors = entries.filter(e => e.level === 'ERROR' || e.level === 'CRITICAL');
  const byType: Record<string, { count: number; examples: LogEntry[] }> = {};

  for (const error of errors) {
    const type = error.error?.name || 'Unknown';
    if (!byType[type]) {
      byType[type] = { count: 0, examples: [] };
    }
    byType[type].count++;
    if (byType[type].examples.length < 3) {
      byType[type].examples.push(error);
    }
  }

  // Detect patterns in error messages
  const patterns: string[] = [];
  const messageGroups = new Map<string, number>();

  for (const error of errors) {
    // Normalize message (remove numbers, UUIDs, etc.)
    const normalized = error.message
      .replace(/\d+/g, 'N')
      .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, 'UUID')
      .replace(/\/[^\s]+/g, '/PATH');

    messageGroups.set(normalized, (messageGroups.get(normalized) || 0) + 1);
  }

  for (const [pattern, count] of messageGroups) {
    if (count >= 3) {
      patterns.push(`"${pattern}" appears ${count} times`);
    }
  }

  return {
    total: errors.length,
    byType,
    recent: errors.slice(-10),
    patterns,
  };
}

// Zod schemas for MCP tool parameters
export const ReadLogsSchema = z.object({
  path: z.string().describe('Path to the log file'),
  level: z.enum(['TRACE', 'DEBUG', 'INFO', 'SUCCESS', 'WARNING', 'ERROR', 'CRITICAL']).optional()
    .describe('Minimum log level to include'),
  limit: z.number().optional().describe('Maximum number of entries to return'),
  search: z.string().optional().describe('Text to search for in messages'),
  regex: z.string().optional().describe('Regex pattern to match'),
});

export const TailLogsSchema = z.object({
  path: z.string().describe('Path to the log file'),
  lines: z.number().optional().default(50).describe('Number of lines to return'),
});

export const SearchLogsSchema = z.object({
  path: z.string().describe('Path to the log file'),
  query: z.string().describe('Search query (text or regex)'),
  regex: z.boolean().optional().default(false).describe('Treat query as regex'),
  caseSensitive: z.boolean().optional().default(false).describe('Case sensitive search'),
  context: z.number().optional().default(0).describe('Number of context lines around matches'),
});

export const AnalyzeErrorsSchema = z.object({
  path: z.string().describe('Path to the log file'),
  since: z.string().optional().describe('Only analyze errors since this time (ISO 8601)'),
});

export const GetStatsSchema = z.object({
  path: z.string().describe('Path to the log file'),
});

export const WatchLogsSchema = z.object({
  path: z.string().describe('Path to the log file'),
  level: z.enum(['TRACE', 'DEBUG', 'INFO', 'SUCCESS', 'WARNING', 'ERROR', 'CRITICAL']).optional()
    .describe('Minimum log level to watch'),
});
