export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // Cloudflare Edge 컨텍스트 안전 추출
    let db: any = (globalThis as any).__env__?.DB || (process.env as any)?.DB;
    
    if (!db) {
      try {
        const { getRequestContext } = await import('@cloudflare/next-on-pages');
        db = (getRequestContext()?.env as any)?.DB;
      } catch (e) {}
    }

    if (!db) {
      return new Response(
        JSON.stringify({ success: false, error: 'D1 DB 바인딩을 가져올 수 없습니다.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = (await req.json()) as any;
    const customer = body.customerInfo || {};
    const resources = body.resources || {};
    const contractId = body.id || `CT_${Date.now()}`;
    const now = Math.floor(Date.now() / 1000);

    const departureAddress = customer.departureAddress || '출발지 미입력';
    const arrivalAddress = customer.arrivalAddress || '도착지 미입력';

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

    await db.prepare(sql).bind(
      contractId,
      String(customer.name || '미입력'),
      String(customer.phone || '010-0000-0000'),
      String(customer.contractDate || '2026-08-23'),
      String(customer.packingDate || '2026-08-23'),
      String(customer.movingDate || '2026-08-23'),
      departureAddress,
      Number(customer.departureFloor) || 1,
      JSON.stringify(customer.departureConditions || []),
      arrivalAddress,
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

    return new Response(
      JSON.stringify({ success: true, message: '계약 저장 성공', contractId }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || '알 수 없는 서버 에러' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
