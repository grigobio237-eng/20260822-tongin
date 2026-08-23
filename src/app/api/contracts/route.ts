import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    let db: any = null;

    // 1. Cloudflare D1 바인딩 안전 획득 (Fallback 체인)
    try {
      const ctx = getRequestContext();
      if ((ctx as any)?.env?.DB) {
        db = (ctx as any).env.DB;
      }
    } catch (e) {
      console.warn('getRequestContext failed, fallbacking...', e);
    }

    if (!db && (process.env as any)?.DB) {
      db = (process.env as any).DB;
    }

    if (!db) {
      return Response.json(
        { success: false, error: 'Cloudflare D1 바인딩(DB)을 찾을 수 없습니다.' },
        { status: 500 }
      );
    }

    // 2. 요청 Body 파싱
    const body = (await req.json()) as any;
    const customer = body.customerInfo || {};
    const resources = body.resources || {};
    const contractId = body.id || `CT_${Date.now()}`;
    const now = Math.floor(Date.now() / 1000);

    // 3. D1 네이티브 직접 INSERT (D1 SQL)
    const sql = `
      INSERT INTO contracts (
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
      String(customer.departureAddress || ''),
      Number(customer.departureFloor) || 1,
      JSON.stringify(customer.departureConditions || []),
      String(customer.arrivalAddress || ''),
      Number(customer.arrivalFloor) || 1,
      JSON.stringify(customer.arrivalConditions || []),
      String(customer.arrivalStatus || '당일이사'),
      String(customer.serviceType || '포장이사'),
      Number(body.totalCbm) || 0,
      JSON.stringify(resources.vehicles || {}),
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

    return Response.json(
      { success: true, message: '계약서가 성공적으로 저장되었습니다.', contractId },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Final API Handler Error:', error);
    return Response.json(
      { 
        success: false, 
        error: error.message || '알 수 없는 서버 에러', 
        stack: error.stack 
      }, 
      { status: 500 }
    );
  }
}
