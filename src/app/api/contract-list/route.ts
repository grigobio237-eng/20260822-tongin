import { getCloudflareContext } from '@opennextjs/cloudflare';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = env.DB;
    if (!db) throw new Error('DB not found');

    const result = await (db as any).prepare(`
      SELECT id, customer_name, customer_phone, moving_date, total_cost, status, signature_url, created_at 
      FROM contracts 
      ORDER BY created_at DESC
    `).all();

    return new Response(JSON.stringify({ success: true, data: result.results }), {
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
