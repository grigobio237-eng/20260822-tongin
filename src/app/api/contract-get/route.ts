import { getCloudflareContext } from '@opennextjs/cloudflare';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = env.DB;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!db || !id) {
      return Response.json({ success: false, error: 'DB 연결 또는 계약 ID 누락' }, { status: 400 });
    }

    const contract = await db.prepare('SELECT * FROM contracts WHERE id = ?').bind(id).first();

    if (!contract) {
      return Response.json({ success: false, error: '계약서를 찾을 수 없습니다.' }, { status: 404 });
    }

    return Response.json({ success: true, data: contract });
  } catch (err: any) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
