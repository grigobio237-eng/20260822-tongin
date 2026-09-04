// This file now acts as a client wrapper to call our internal Next.js API route
// This prevents CORS issues (403 Forbidden) when making direct client-to-Kakao requests.

export async function getRouteInfo(originAddress: string, destAddress: string) {
  if (!originAddress || !destAddress) {
    throw new Error('주소를 정확히 입력해주세요.');
  }

  try {
    const res = await fetch('/api/kakao-route', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ originAddress, destAddress })
    });
    
    const json = await res.json();
    
    if (!json.success) {
      throw new Error(json.error || '경로를 찾을 수 없습니다.');
    }
    
    return json.data;
  } catch (error) {
    console.error('Route error:', error);
    throw error;
  }
}
