import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js';

import {
  readLogFile,
  filterLogs,
  tailLogFile,
  analyzeErrors,
  getLogStats,
  ReadLogsSchema,
  TailLogsSchema,
  SearchLogsSchema,
  AnalyzeErrorsSchema,
  GetStatsSchema,
} from './tools.js';

const TOOLS: Tool[] = [
  {
    name: 'read_logs',
    description: `Read and filter log entries from a log file.
Returns parsed log entries with timestamp, level, message, and optional error details.
Supports filtering by level, text search, and regex patterns.`,
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Path to the log file' },
        level: {
          type: 'string',
          enum: ['TRACE', 'DEBUG', 'INFO', 'SUCCESS', 'WARNING', 'ERROR', 'CRITICAL'],
          description: 'Minimum log level to include',
        },
        limit: { type: 'number', description: 'Maximum number of entries to return' },
        search: { type: 'string', description: 'Text to search for in messages' },
        regex: { type: 'string', description: 'Regex pattern to match' },
      },
      required: ['path'],
    },
  },
  {
    name: 'tail_logs',
    description: `Get the last N lines from a log file (like tail -f).
Useful for seeing recent activity and errors.`,
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Path to the log file' },
        lines: { type: 'number', description: 'Number of lines to return (default: 50)' },
      },
      required: ['path'],
    },
  },
  {
    name: 'search_logs',
    description: `Search through logs with text or regex query.
Returns matching entries with optional context lines.`,
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Path to the log file' },
        query: { type: 'string', description: 'Search query (text or regex)' },
        regex: { type: 'boolean', description: 'Treat query as regex (default: false)' },
        caseSensitive: { type: 'boolean', description: 'Case sensitive search (default: false)' },
        context: { type: 'number', description: 'Number of context lines around matches' },
      },
      required: ['path', 'query'],
    },
  },
  {
    name: 'analyze_errors',
    description: `Analyze errors in log file and group by type.
Returns error statistics, patterns, and recent errors.
Helps identify recurring issues and root causes.`,
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Path to the log file' },
        since: { type: 'string', description: 'Only analyze errors since this time (ISO 8601)' },
      },
      required: ['path'],
    },
  },
  {
    name: 'get_log_stats',
    description: `Get statistics about a log file.
Returns total count, breakdown by level, error/warning counts, and time range.`,
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Path to the log file' },
      },
      required: ['path'],
    },
  },
];

export async function createServer(): Promise<Server> {
  const server = new Server(
    {
      name: 'logger-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: TOOLS };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case 'read_logs': {
          const params = ReadLogsSchema.parse(args);
          const entries = readLogFile(params.path);
          const filtered = filterLogs(entries, {
            level: params.level,
            limit: params.limit,
            search: params.search,
            regex: params.regex,
          });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(filtered, null, 2),
              },
            ],
          };
        }

        case 'tail_logs': {
          const params = TailLogsSchema.parse(args);
          const entries = tailLogFile(params.path, params.lines);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(entries, null, 2),
              },
            ],
          };
        }

        case 'search_logs': {
          const params = SearchLogsSchema.parse(args);
          const entries = readLogFile(params.path);

          let pattern: RegExp;
          if (params.regex) {
            pattern = new RegExp(params.query, params.caseSensitive ? '' : 'i');
          } else {
            const escaped = params.query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            pattern = new RegExp(escaped, params.caseSensitive ? '' : 'i');
          }

          const matches = entries.filter(e =>
            pattern.test(e.message) ||
            (e.error?.message && pattern.test(e.error.message)) ||
            (e.error?.stack && pattern.test(e.error.stack))
          );

          // Add context if requested
          if (params.context && params.context > 0) {
            const result: typeof entries = [];
            const matchIndices = new Set(
              matches.map(m => entries.indexOf(m))
            );

            for (const idx of matchIndices) {
              const start = Math.max(0, idx - params.context);
              const end = Math.min(entries.length - 1, idx + params.context);

              for (let i = start; i <= end; i++) {
                if (!result.includes(entries[i])) {
                  result.push(entries[i]);
                }
              }
            }

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(matches, null, 2),
              },
            ],
          };
        }

        case 'analyze_errors': {
          const params = AnalyzeErrorsSchema.parse(args);
          let entries = readLogFile(params.path);

          if (params.since) {
            const since = new Date(params.since);
            entries = entries.filter(e => new Date(e.timestamp) >= since);
          }

          const analysis = analyzeErrors(entries);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(analysis, null, 2),
              },
            ],
          };
        }

        case 'get_log_stats': {
          const params = GetStatsSchema.parse(args);
          const entries = readLogFile(params.path);
          const stats = getLogStats(entries);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(stats, null, 2),
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${message}`,
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}

export async function startServer(): Promise<void> {
  const server = await createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Logger MCP Server started');
}
