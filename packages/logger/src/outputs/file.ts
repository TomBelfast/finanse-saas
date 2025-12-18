import * as fs from 'node:fs';
import * as path from 'node:path';
import type { LogEntry, LogOutput, LoggerConfig } from '../types.js';
import { LOG_LEVELS } from '../types.js';
import { formatLogEntry } from '../formatter.js';

export class FileOutput {
  private config: LogOutput;
  private loggerConfig: LoggerConfig;
  private stream: fs.WriteStream | null = null;
  private currentSize: number = 0;
  private fileIndex: number = 0;

  constructor(config: LogOutput, loggerConfig: LoggerConfig) {
    this.config = config;
    this.loggerConfig = {
      ...loggerConfig,
      colorize: false, // Never colorize file output
    };
    this.initStream();
  }

  private initStream(): void {
    if (!this.config.path) {
      throw new Error('File output requires a path');
    }

    // Ensure directory exists
    const dir = path.dirname(this.config.path);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Get current file size if exists
    if (fs.existsSync(this.config.path)) {
      const stats = fs.statSync(this.config.path);
      this.currentSize = stats.size;
    }

    this.stream = fs.createWriteStream(this.config.path, { flags: 'a' });
  }

  write(entry: LogEntry): void {
    if (!this.stream) return;

    const minLevel = this.config.level || this.loggerConfig.level;
    if (LOG_LEVELS[entry.level] < LOG_LEVELS[minLevel]) {
      return;
    }

    // Always use JSON format for file output (easier to parse)
    const formatted = JSON.stringify(entry) + '\n';

    // Check rotation
    if (this.shouldRotate(formatted.length)) {
      this.rotate();
    }

    this.stream.write(formatted);
    this.currentSize += formatted.length;
  }

  private shouldRotate(additionalBytes: number): boolean {
    if (!this.config.rotation?.maxSize) return false;

    const maxBytes = this.parseSize(this.config.rotation.maxSize);
    return this.currentSize + additionalBytes > maxBytes;
  }

  private parseSize(size: string): number {
    const match = size.match(/^(\d+)(KB|MB|GB)?$/i);
    if (!match) return Infinity;

    const value = parseInt(match[1], 10);
    const unit = (match[2] || 'B').toUpperCase();

    switch (unit) {
      case 'KB':
        return value * 1024;
      case 'MB':
        return value * 1024 * 1024;
      case 'GB':
        return value * 1024 * 1024 * 1024;
      default:
        return value;
    }
  }

  private rotate(): void {
    if (!this.stream || !this.config.path) return;

    this.stream.end();
    this.fileIndex++;

    const ext = path.extname(this.config.path);
    const base = this.config.path.slice(0, -ext.length);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const rotatedPath = `${base}.${timestamp}${ext}`;

    fs.renameSync(this.config.path, rotatedPath);

    // Clean old files if maxFiles is set
    if (this.config.rotation?.maxFiles) {
      this.cleanOldFiles();
    }

    this.currentSize = 0;
    this.initStream();
  }

  private cleanOldFiles(): void {
    if (!this.config.path || !this.config.rotation?.maxFiles) return;

    const dir = path.dirname(this.config.path);
    const base = path.basename(this.config.path);
    const ext = path.extname(base);
    const nameWithoutExt = base.slice(0, -ext.length);

    const files = fs.readdirSync(dir)
      .filter(f => f.startsWith(nameWithoutExt) && f !== base)
      .map(f => ({
        name: f,
        path: path.join(dir, f),
        mtime: fs.statSync(path.join(dir, f)).mtime.getTime(),
      }))
      .sort((a, b) => b.mtime - a.mtime);

    // Remove files exceeding maxFiles
    const toRemove = files.slice(this.config.rotation.maxFiles);
    for (const file of toRemove) {
      fs.unlinkSync(file.path);
    }
  }

  close(): void {
    if (this.stream) {
      this.stream.end();
      this.stream = null;
    }
  }
}
