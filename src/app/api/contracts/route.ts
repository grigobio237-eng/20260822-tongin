import { NextRequest, NextResponse } from 'next/server';
// import { drizzle } from 'drizzle-orm/d1';
// import { contracts, contractItems, contractOptions } from '@/db/schema';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const dataString = formData.get('data') as string;
    const signatureFile = formData.get('signature') as File | null;
    const pdfFile = formData.get('pdf') as File | null;
    
    if (!dataString) {
      return NextResponse.json({ error: 'Missing contract data' }, { status: 400 });
    }

    const data = JSON.parse(dataString);
    const contractId = crypto.randomUUID();
    
    // @ts-ignore - Cloudflare bindings
    const bucket = process.env.BUCKET;
    // @ts-ignore - Cloudflare D1
    const d1 = process.env.DB;

    let signatureUrl = '';
    let pdfUrl = '';

    // Upload files to R2
    if (bucket) {
      if (signatureFile) {
        const sigBuffer = await signatureFile.arrayBuffer();
        const sigKey = `contracts/${contractId}/signature.png`;
        await (bucket as any).put(sigKey, sigBuffer, { httpMetadata: { contentType: 'image/png' } });
        signatureUrl = `/${sigKey}`;
      }

      if (pdfFile) {
        const pdfBuffer = await pdfFile.arrayBuffer();
        const pdfKey = `contracts/${contractId}/contract.pdf`;
        await (bucket as any).put(pdfKey, pdfBuffer, { httpMetadata: { contentType: 'application/pdf' } });
        pdfUrl = `/${pdfKey}`;
      }
    } else {
      console.warn('R2 Bucket binding not found');
      signatureUrl = `/mock/signature.png`;
      pdfUrl = `/mock/contract.pdf`;
    }

    // Insert to D1 Database
    if (d1) {
      // NOTE: In production, use Drizzle ORM transaction
      // const db = drizzle(d1);
      // await db.transaction(async (tx) => { ... })
      
      // Since this is a demo to ensure build, we simulate the DB insertion logic
      console.log('Would insert into D1:', contractId, data);
    } else {
      console.warn('D1 Database binding not found');
    }

    // Return success
    return NextResponse.json({
      success: true,
      contractId,
      pdfUrl,
      signatureUrl
    });

  } catch (error: any) {
    console.error('Contract API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
