import { getCloudflareContext } from '@opennextjs/cloudflare';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = env.DB;
    if (!db) {
      return Response.json({ success: false, error: 'D1 DB 바인딩이 없습니다.' }, { status: 500 });
    }

    const { id, signatureBase64 } = await req.json();
    if (!id || !signatureBase64) {
      return Response.json({ success: false, error: '계약 ID 또는 서명 데이터가 누락되었습니다.' }, { status: 400 });
    }

    const now = Math.floor(Date.now() / 1000);
    const sql = `
      UPDATE contracts
      SET signature_url = ?, status = 'CONFIRMED', updated_at = ?
      WHERE id = ?
    `;

    const result = await db.prepare(sql).bind(signatureBase64, now, id).run();

    if (!result.success) {
      throw new Error(result.error || '서명 업데이트 실패');
    }

    return Response.json({ success: true, message: '전자서명 및 계약 체결이 완료되었습니다.' });
  } catch (err: any) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
