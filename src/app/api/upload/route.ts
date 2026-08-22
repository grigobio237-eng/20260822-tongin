import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const contractId = formData.get('contractId') as string || 'draft';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // @ts-ignore - Cloudflare Pages environment binding
    const bucket = process.env.BUCKET;
    
    if (!bucket) {
      // 로컬 환경 등 바인딩이 없을 때 에러 방지용 모의 응답
      console.warn('R2 BUCKET binding not found. Returning mock URL.');
      return NextResponse.json({ 
        url: `https://mock-storage.local/images/${contractId}/${file.name}` 
      });
    }

    const buffer = await file.arrayBuffer();
    const ext = file.name.split('.').pop() || 'webp';
    const filename = `${crypto.randomUUID()}.${ext}`;
    const objectKey = `images/${contractId}/${filename}`;

    // R2 업로드
    await (bucket as any).put(objectKey, buffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });

    // Cloudflare Pages / Custom Domain URL
    const publicUrl = process.env.NEXT_PUBLIC_R2_URL 
      ? `${process.env.NEXT_PUBLIC_R2_URL}/${objectKey}`
      : `/${objectKey}`; // fallback for demonstration

    return NextResponse.json({ url: publicUrl, key: objectKey });
    
  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
