import { getRequestContext } from '@cloudflare/next-on-pages';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@/db/schema';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const ctx = getRequestContext() as { env?: any };
    const env = ctx?.env;

    if (!env || !env.DB) {
      return Response.json(
        { success: false, error: 'D1 데이터베이스 바인딩을 찾을 수 없습니다.' },
        { status: 500 }
      );
    }

    const db = drizzle(env.DB, { schema });
    const body = (await req.json()) as any;

    const contractId = body.id || `CT_${Date.now()}`;
    let pdfUrl = '';
    let signatureUrl = '';

    // R2 버킷 저장 (Base64 -> Uint8Array 변환)
    if (env.BUCKET) {
      if (body.pdfBase64) {
        const pdfKey = `contracts/${contractId}/contract.pdf`;
        const pdfBytes = Uint8Array.from(atob(body.pdfBase64.replace(/^data:application\/pdf;base64,/, '')), c => c.charCodeAt(0));
        await env.BUCKET.put(pdfKey, pdfBytes, {
          httpMetadata: { contentType: 'application/pdf' },
        });
        pdfUrl = `/api/files/${pdfKey}`;
      }

      if (body.signatureBase64) {
        const sigKey = `contracts/${contractId}/signature.png`;
        const sigBytes = Uint8Array.from(atob(body.signatureBase64.replace(/^data:image\/\w+;base64,/, '')), c => c.charCodeAt(0));
        await env.BUCKET.put(sigKey, sigBytes, {
          httpMetadata: { contentType: 'image/png' },
        });
        signatureUrl = `/api/files/${sigKey}`;
      }
    }

    const customer = body.customerInfo || {};
    const resources = body.resources || {};

    // D1 contracts 테이블 저장
    await db.insert(schema.contracts).values({
      id: contractId,
      customerName: customer.name || '미입력',
      customerPhone: customer.phone || '010-0000-0000',
      contractDate: customer.contractDate || new Date().toISOString().split('T')[0],
      packingDate: customer.packingDate || new Date().toISOString().split('T')[0],
      movingDate: customer.movingDate || new Date().toISOString().split('T')[0],
      departureAddress: customer.departureAddress || '',
      departureFloor: Number(customer.departureFloor) || 1,
      departureConditions: JSON.stringify(customer.departureConditions || []),
      arrivalAddress: customer.arrivalAddress || '',
      arrivalFloor: Number(customer.arrivalFloor) || 1,
      arrivalConditions: JSON.stringify(customer.arrivalConditions || []),
      arrivalStatus: customer.arrivalStatus || '당일이사',
      serviceType: customer.serviceType || '포장이사',
      totalCbm: Number(body.totalCbm) || 0,
      vehicleCount: JSON.stringify(resources.vehicles || {}),
      workerCountMale: Number(resources.workerMale) || 0,
      workerCountFemale: Number(resources.workerFemale) || 0,
      movingCost: Number(body.totalCost) - Number(body.optionCost || 0),
      optionCost: Number(body.optionCost) || 0,
      totalCost: Number(body.totalCost) || 0,
      deposit: Number(body.deposit) || 0,
      balance: Number(body.balance) || 0,
      sttMemo: body.sttMemo || '',
      signatureUrl,
      pdfUrl,
      status: 'CONFIRMED',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return Response.json(
      { success: true, message: '계약 저장 완료', contractId, pdfUrl },
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
