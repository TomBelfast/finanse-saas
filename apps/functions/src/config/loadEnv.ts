// Load environment variables from .env.local
// This must be imported BEFORE any modules that use Clerk SDK
import * as fs from 'fs';
import * as path from 'path';

export function loadEnvLocal(): void {
  // Try multiple possible paths for .env.local
  const possiblePaths = [
    path.resolve(process.cwd(), 'apps/functions/.env.local'),
    path.resolve(process.cwd(), '.env.local'),
    path.resolve(__dirname, '../.env.local'),
    path.resolve(__dirname, '../../.env.local'),
  ];

  let envLocalPath: string | null = null;
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      envLocalPath = possiblePath;
      break;
    }
  }

  if (envLocalPath) {
    const envContent = fs.readFileSync(envLocalPath, 'utf-8');
    let loadedCount = 0;
    envContent.split('\n').forEach((line) => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, ''); // Remove quotes
          if (!process.env[key]) {
            process.env[key] = value;
            loadedCount++;
          }
        }
      }
    });
    console.log(`✅ Loaded ${loadedCount} environment variables from ${envLocalPath}`);
    if (process.env.CLERK_SECRET_KEY) {
      console.log(`✅ CLERK_SECRET_KEY: SET (${process.env.CLERK_SECRET_KEY.substring(0, 20)}...)`);
    } else {
      console.warn(`⚠️  CLERK_SECRET_KEY: NOT SET in ${envLocalPath}`);
    }
    if (process.env.CLERK_PUBLISHABLE_KEY) {
      console.log(`✅ CLERK_PUBLISHABLE_KEY: SET (${process.env.CLERK_PUBLISHABLE_KEY.substring(0, 20)}...)`);
    } else {
      console.warn(`⚠️  CLERK_PUBLISHABLE_KEY: NOT SET in ${envLocalPath} - Clerk Core 2 requires this!`);
    }
  } else {
    console.warn(`⚠️  .env.local not found. Tried paths:`, possiblePaths);
  }
}

// Auto-load on import
loadEnvLocal();
