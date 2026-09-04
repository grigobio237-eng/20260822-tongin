import { NextResponse } from 'next/server';

const KAKAO_REST_API_KEY = '6a651ef097749982f3257be5855b3d56';

async function getCoordinates(address: string) {
  const res = await fetch(`https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`, {
    headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` }
  });
  if (!res.ok) throw new Error('Failed to fetch coordinates');
  const data = await res.json();
  if (data.documents && data.documents.length > 0) {
    return { x: data.documents[0].x, y: data.documents[0].y };
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const { originAddress, destAddress } = await req.json();
    if (!originAddress || !destAddress) {
      return NextResponse.json({ success: false, error: '주소가 누락되었습니다.' }, { status: 400 });
    }

    const origin = await getCoordinates(originAddress);
    const dest = await getCoordinates(destAddress);

    if (!origin || !dest) {
      return NextResponse.json({ success: false, error: '주소를 좌표로 변환할 수 없습니다. 주소를 정확히 입력해주세요.' }, { status: 400 });
    }

    const res = await fetch(`https://apis-navi.kakaomobility.com/v1/directions?origin=${origin.x},${origin.y}&destination=${dest.x},${dest.y}&car_type=2`, {
      headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` }
    });
    
    if (!res.ok) throw new Error('Failed to fetch route from Kakao API');
    
    const data = await res.json();
    if (data.routes && data.routes.length > 0) {
      const summary = data.routes[0].summary;
      return NextResponse.json({
        success: true,
        data: {
          distanceKm: (summary.distance / 1000).toFixed(1),
          durationMin: Math.ceil(summary.duration / 60).toString(),
          tollFare: summary.fare.toll,
        }
      });
    }

    return NextResponse.json({ success: false, error: '경로를 찾을 수 없습니다.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
