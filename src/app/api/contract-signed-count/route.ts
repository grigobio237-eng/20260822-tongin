import { getCloudflareContext } from '@opennextjs/cloudflare';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = env.DB;
    if (!db) throw new Error('DB not found');

    const result = await (db as any).prepare(`
      SELECT COUNT(*) as count 
      FROM contracts 
      WHERE signature_url IS NOT NULL 
    `).first();

    return new Response(JSON.stringify({ success: true, count: result?.count || 0 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
