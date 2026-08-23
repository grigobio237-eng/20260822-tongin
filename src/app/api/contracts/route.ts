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
        { success: false, error: 'Cloudflare D1 바인딩(DB)이 연결되지 않았습니다.' },
        { status: 500 }
      );
    }

    const db = drizzle(env.DB, { schema });

    // FormData 파싱
    const formData = await req.formData();
    const dataString = formData.get('data') as string;
    if (!dataString) {
      return Response.json({ success: false, error: '계약 데이터(data)가 누락되었습니다.' }, { status: 400 });
    }

    const payload = JSON.parse(dataString);
    const contractId = payload.id || `CT_${Date.now()}`;

    // PDF 및 서명 파일 처리 (R2 업로드)
    let pdfUrl = '';
    let signatureUrl = '';

    const pdfFile = formData.get('pdf') as File | null;
    const signatureFile = formData.get('signature') as File | null;

    if (env.BUCKET) {
      if (pdfFile && typeof pdfFile.arrayBuffer === 'function') {
        const pdfKey = `contracts/${contractId}/contract.pdf`;
        await env.BUCKET.put(pdfKey, await pdfFile.arrayBuffer(), {
          httpMetadata: { contentType: 'application/pdf' },
        });
        pdfUrl = `https://20260822-tongin.pages.dev/api/files/${pdfKey}`;
      }

      if (signatureFile && typeof signatureFile.arrayBuffer === 'function') {
        const sigKey = `contracts/${contractId}/signature.png`;
        await env.BUCKET.put(sigKey, await signatureFile.arrayBuffer(), {
          httpMetadata: { contentType: 'image/png' },
        });
        signatureUrl = `https://20260822-tongin.pages.dev/api/files/${sigKey}`;
      }
    }

    const customer = payload.customerInfo || {};
    const resources = payload.resources || {};

    // 1. D1 contracts 마스터 저장
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
      totalCbm: Number(payload.totalCbm) || 0,
      vehicleCount: JSON.stringify(resources.vehicles || {}),
      workerCountMale: Number(resources.workerMale) || 0,
      workerCountFemale: Number(resources.workerFemale) || 0,
      movingCost: Number(payload.totalCost) - Number(payload.optionCost || 0),
      optionCost: Number(payload.optionCost) || 0,
      totalCost: Number(payload.totalCost) || 0,
      deposit: Number(payload.deposit) || 0,
      balance: Number(payload.balance) || 0,
      sttMemo: payload.sttMemo || '',
      signatureUrl: signatureUrl,
      pdfUrl: pdfUrl,
      status: 'CONFIRMED',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return Response.json(
      { 
        success: true, 
        message: '계약이 성공적으로 체결 및 저장되었습니다.',
        contractId,
        pdfUrl
      }, 
      { status: 200 }
    );
  } catch (error: any) {
    console.error('계약 저장 에러:', error);
    return Response.json(
      { 
        success: false, 
        error: error.message || '서버 처리 중 오류가 발생했습니다.',
        stack: error.stack 
      }, 
      { status: 500 }
    );
  }
}
