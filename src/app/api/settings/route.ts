import { getCloudflareContext } from '@opennextjs/cloudflare';

export const dynamic = 'force-dynamic';

async function initDB(db: any) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
}

export async function GET() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = env.DB;
    if (!db) throw new Error('DB not found');

    await initDB(db);

    const result = await db.prepare("SELECT data FROM settings WHERE id = 'global_settings'").first();
    
    if (result && result.data) {
      return Response.json(JSON.parse(result.data as string));
    } else {
      return Response.json({});
    }
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = env.DB;
    if (!db) throw new Error('DB not found');

    await initDB(db);

    const body = await req.json();
    
    await db.prepare(`
      INSERT INTO settings (id, data, updated_at) 
      VALUES ('global_settings', ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET 
        data = excluded.data,
        updated_at = excluded.updated_at
    `).bind(JSON.stringify(body)).run();

    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
