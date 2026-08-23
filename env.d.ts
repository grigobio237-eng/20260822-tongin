import type { D1Database, R2Bucket } from '@cloudflare/workers-types';

interface CloudflareEnv {
  DB: D1Database;
  BUCKET: R2Bucket;
  NEXT_PUBLIC_R2_URL: string;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string | undefined;
    }
  }
}
