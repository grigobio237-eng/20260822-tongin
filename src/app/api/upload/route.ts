import { getCloudflareContext } from '@opennextjs/cloudflare';

export const dynamic = 'force-dynamic';

// 1. R2 이미지 조회 (GET /api/upload?key=파일명)
export async function GET(req: Request) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const bucket = env.BUCKET;
    
    if (!bucket) {
      return new Response('R2 BUCKET 바인딩이 누락되었습니다.', { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    if (!key) {
      return new Response('이미지 키가 지정되지 않았습니다.', { status: 400 });
    }

    const object = await bucket.get(key);
    if (!object) {
      return new Response('이미지를 찾을 수 없습니다.', { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=31536000');
    headers.set('Access-Control-Allow-Origin', '*');

    return new Response(object.body, { headers });
  } catch (err: any) {
    return new Response(`조회 오류: ${err.message}`, { status: 500 });
  }
}

// 2. R2 이미지 업로드 (POST /api/upload)
export async function POST(req: Request) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const bucket = env.BUCKET;
    
    if (!bucket) {
      return Response.json({ success: false, error: 'R2 BUCKET 바인딩이 누락되었습니다.' }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const roomId = formData.get('roomId') as string || 'common';

    if (!file) {
      return Response.json({ success: false, error: '업로드할 파일이 없습니다.' }, { status: 400 });
    }

    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const objectKey = `contracts/${roomId}_${timestamp}_${cleanFileName}`;

    const arrayBuffer = await file.arrayBuffer();
    await bucket.put(objectKey, arrayBuffer, {
      httpMetadata: {
        contentType: file.type || 'image/webp',
      },
    });

    // 앱 내부에서 바로 접근할 수 있는 상대 엔드포인트 URL 반환
    const imageUrl = `/api/upload?key=${encodeURIComponent(objectKey)}`;

    return Response.json({
      success: true,
      key: objectKey,
      url: imageUrl,
    });
  } catch (err: any) {
    return Response.json({ success: false, error: err.message || '업로드 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
