// Cloudflare D1 및 R2 바인딩 타입 선언
// @opennextjs/cloudflare의 CloudflareEnv 인터페이스를 확장

interface CloudflareEnv {
  DB: D1Database;
  BUCKET: R2Bucket;
  NEXT_PUBLIC_API_URL: string;
}
