import { getCloudflareContext } from '@opennextjs/cloudflare';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { env } = await getCloudflareContext({ async: true });
  const db = env.DB;
  const result = await (db as any).prepare("PRAGMA table_info(contracts)").all();
  return new Response(JSON.stringify(result.results), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
