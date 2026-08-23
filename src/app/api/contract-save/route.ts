import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const ctx = getRequestContext() as any;
    const db = ctx?.env?.DB;

    if (!db) {
      return new Response('D1 DB 바인딩 누락: env.DB가 존재하지 않습니다.', { status: 200 });
    }

    const body = (await req.json()) as any;
    const customer = body.customerInfo || {};
    const resources = body.resources || {};
    const contractId = body.id || `CT_${Date.now()}`;
    const now = Math.floor(Date.now() / 1000);

    // D1 SQL 실행 (모든 필드를 기본 타입으로 안전 변환)
    const sql = `
      INSERT OR REPLACE INTO contracts (
        id, customer_name, customer_phone, contract_date, packing_date, moving_date,
        departure_address, departure_floor, departure_conditions,
        arrival_address, arrival_floor, arrival_conditions, arrival_status,
        service_type, total_cbm, vehicle_count,
        worker_count_male, worker_count_female,
        moving_cost, option_cost, total_cost, deposit, balance,
        stt_memo, signature_url, pdf_url, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await db.prepare(sql).bind(
      contractId,
      String(customer.name || '미입력'),
      String(customer.phone || '010-0000-0000'),
      String(customer.contractDate || '2026-08-23'),
      String(customer.packingDate || '2026-08-23'),
      String(customer.movingDate || '2026-08-23'),
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
      now
    ).run();

    if (!result.success) {
      return new Response(`D1 실행 실패: ${result.error}`, { status: 200 });
    }

    return new Response(
      JSON.stringify({ success: true, message: '저장 완료', contractId }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    // 500 대신 200으로 실제 에러 스택을 브라우저에 바로 노출
    return new Response(`서버 런타임 예외 발생: ${err.message}\n${err.stack}`, { status: 200 });
  }
}
