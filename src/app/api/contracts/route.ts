import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

function base64ToUint8Array(base64String: string): Uint8Array {
  const cleanBase64 = base64String.replace(/^data:[^;]+;base64,/, '');
  const binaryString = atob(cleanBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function POST(req: Request) {
  try {
    const ctx = getRequestContext() as { env?: any };
    const env = ctx?.env;

    if (!env?.DB) {
      return Response.json({ success: false, error: 'D1 DB 바인딩 누락' }, { status: 500 });
    }

    const body = (await req.json()) as any;
    const contractId = body.id || `CT_${Date.now()}`;
    let pdfUrl = '';
    let signatureUrl = '';

    // 1. R2 업로드
    if (env.BUCKET) {
      if (body.pdfBase64) {
        try {
          const pdfKey = `contracts/${contractId}/contract.pdf`;
          await env.BUCKET.put(pdfKey, base64ToUint8Array(body.pdfBase64), {
            httpMetadata: { contentType: 'application/pdf' },
          });
          pdfUrl = `https://20260822-tongin.pages.dev/api/files/${pdfKey}`;
        } catch (e) {
          console.warn('PDF R2 Error:', e);
        }
      }

      if (body.signatureBase64) {
        try {
          const sigKey = `contracts/${contractId}/signature.png`;
          await env.BUCKET.put(sigKey, base64ToUint8Array(body.signatureBase64), {
            httpMetadata: { contentType: 'image/png' },
          });
          signatureUrl = `https://20260822-tongin.pages.dev/api/files/${sigKey}`;
        } catch (e) {
          console.warn('Signature R2 Error:', e);
        }
      }
    }

    const customer = body.customerInfo || {};
    const resources = body.resources || {};
    const now = Math.floor(Date.now() / 1000);

    // 2. D1 네이티브 직접 INSERT (contracts)
    const stmt = env.DB.prepare(`
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
    `);

    const result = await stmt.bind(
      contractId,
      customer.name || '고객',
      customer.phone || '010-0000-0000',
      customer.contractDate || new Date().toISOString().split('T')[0],
      customer.packingDate || new Date().toISOString().split('T')[0],
      customer.movingDate || new Date().toISOString().split('T')[0],
      customer.departureAddress || '',
      Number(customer.departureFloor) || 1,
      JSON.stringify(customer.departureConditions || []),
      customer.arrivalAddress || '',
      Number(customer.arrivalFloor) || 1,
      JSON.stringify(customer.arrivalConditions || []),
      customer.arrivalStatus || '당일이사',
      customer.serviceType || '포장이사',
      Number(body.totalCbm) || 0,
      JSON.stringify(resources.vehicles || {}),
      Number(resources.workerMale) || 0,
      Number(resources.workerFemale) || 0,
      Number(body.totalCost || 0) - Number(body.optionCost || 0),
      Number(body.optionCost) || 0,
      Number(body.totalCost) || 0,
      Number(body.deposit) || 0,
      Number(body.balance) || 0,
      body.sttMemo || '',
      signatureUrl,
      pdfUrl,
      'CONFIRMED',
      now,
      now
    ).run();

    if (!result.success) {
      throw new Error(result.error || 'D1 쿼리 실행 실패');
    }

    return Response.json(
      { success: true, message: '계약 저장 성공', contractId, pdfUrl },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('API Error:', error);
    return Response.json(
      { success: false, error: error.message || '서버 오류', stack: error.stack },
      { status: 500 }
    );
  }
}
