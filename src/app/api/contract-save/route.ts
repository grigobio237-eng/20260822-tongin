// OpenNext + Cloudflare Pages: D1은 getCloudflareContext()로 접근
import { getCloudflareContext } from '@opennextjs/cloudflare';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = env.DB;
    return new Response(
      JSON.stringify({ status: 'online', hasDB: !!db, ts: Date.now() }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ status: 'error', error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = env.DB;

    if (!db) {
      return new Response(
        JSON.stringify({ success: false, error: 'D1 DB 바인딩이 없습니다.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = (await req.json()) as any;
    const customer = body.customerInfo || {};
    const resources = body.resources || {};
    const contractId = body.id || `CT_${Date.now()}`;
    const now = Math.floor(Date.now() / 1000);

    // 동적으로 컬럼 추가 시도 (이미 있으면 에러 무시)
    try {
      await (db as any).prepare("ALTER TABLE contracts ADD COLUMN rooms_json TEXT").run();
    } catch (e) {}
    try {
      await (db as any).prepare("ALTER TABLE contracts ADD COLUMN options_json TEXT").run();
    } catch (e) {}

    const sql = `
      INSERT OR REPLACE INTO contracts (
        id, customer_name, customer_phone, contract_date, packing_date, moving_date,
        departure_address, departure_floor, departure_conditions,
        arrival_address, arrival_floor, arrival_conditions, arrival_status,
        service_type, total_cbm, vehicle_count,
        worker_count_male, worker_count_female,
        moving_cost, option_cost, total_cost, deposit, balance,
        stt_memo, signature_url, pdf_url, status, created_at, updated_at,
        rooms_json, options_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await (db as any).prepare(sql).bind(
      contractId,
      String(customer.name || '미입력'),
      String(customer.phone || '010-0000-0000'),
      String(customer.contractDate || '2026-08-25'),
      String(customer.packingDate || '2026-08-25'),
      String(customer.movingDate || '2026-08-25'),
      String(customer.departureAddress || '출발지 미입력'),
      Number(customer.departureFloor) || 1,
      null,
      String(customer.arrivalAddress || '도착지 미입력'),
      Number(customer.arrivalFloor) || 1,
      null,
      String(customer.arrivalStatus || '당일이사'),
      String(customer.serviceType || '포장이사'),
      Number(body.totalCbm) || 0,
      '{}',
      Number(resources.workerMale) || 0,
      Number(resources.workerFemale) || 0,
      Number(body.totalCost || 0) - Number(body.optionCost || 0),
      Number(body.optionCost) || 0,
      Number(body.totalCost) || 0,
      Number(body.deposit) || 0,
      Number(body.balance) || 0,
      String(body.sttMemo || ''),
      '',
      '',
      'CONFIRMED',
      now,
      now,
      JSON.stringify(body.rooms || []),
      JSON.stringify(body.options || [])
    ).run();

    if (!result.success) {
      throw new Error('D1 쿼리 실패: ' + JSON.stringify(result));
    }

    return new Response(
      JSON.stringify({ success: true, message: '저장 완료', contractId }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || '서버 오류' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
