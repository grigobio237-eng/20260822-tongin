import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const ctx = getRequestContext() as { env?: any };
    const env = ctx?.env;

    if (!env?.DB) {
      return Response.json({ success: false, error: 'D1 DB 바인딩이 연결되지 않았습니다.' }, { status: 500 });
    }

    const body = (await req.json()) as any;
    const contractId = body.id || `CT_${Date.now()}`;
    const customer = body.customerInfo || {};
    const resources = body.resources || {};
    const now = Math.floor(Date.now() / 1000);

    // D1 네이티브 직접 INSERT
    const query = `
      INSERT INTO contracts (
        id, customer_name, customer_phone, contract_date, packing_date, moving_date,
        departure_address, departure_floor, departure_conditions,
        arrival_address, arrival_floor, arrival_conditions, arrival_status,
        service_type, total_cbm, vehicle_count,
        worker_count_male, worker_count_female,
        moving_cost, option_cost, total_cost, deposit, balance,
        stt_memo, signature_url, pdf_url, status, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?
      )
    `;

    const result = await env.DB.prepare(query).bind(
      contractId,
      String(customer.name || '미입력'),
      String(customer.phone || '010-0000-0000'),
      String(customer.contractDate || new Date().toISOString().split('T')[0]),
      String(customer.packingDate || new Date().toISOString().split('T')[0]),
      String(customer.movingDate || new Date().toISOString().split('T')[0]),
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

    if (!result.success) {
      throw new Error(result.error || 'D1 실행 실패');
    }

    return Response.json(
      { success: true, message: '계약서가 D1 DB에 정상 저장되었습니다.', contractId },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('D1 Insert Error:', error);
    return Response.json(
      { success: false, error: error.message || '서버 오류', stack: error.stack },
      { status: 500 }
    );
  }
}
