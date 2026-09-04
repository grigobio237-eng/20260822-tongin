export const KAKAO_REST_API_KEY = '6a651ef097749982f3257be5855b3d56';

export async function getCoordinates(address: string): Promise<{ x: string; y: string } | null> {
  if (!address) return null;
  
  try {
    const res = await fetch(`https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`, {
      headers: {
        Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`
      }
    });
    
    if (!res.ok) throw new Error('Failed to fetch coordinates');
    
    const data = await res.json();
    if (data.documents && data.documents.length > 0) {
      // x: 경도(longitude), y: 위도(latitude)
      return {
        x: data.documents[0].x,
        y: data.documents[0].y
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

export async function getRouteInfo(originAddress: string, destAddress: string) {
  const origin = await getCoordinates(originAddress);
  const dest = await getCoordinates(destAddress);

  if (!origin || !dest) {
    throw new Error('주소를 좌표로 변환할 수 없습니다. 주소를 정확히 입력해주세요.');
  }

  try {
    // car_type=2 화물차 (트럭) 기준 탐색
    const res = await fetch(`https://apis-navi.kakaomobility.com/v1/directions?origin=${origin.x},${origin.y}&destination=${dest.x},${dest.y}&car_type=2`, {
      headers: {
        Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`
      }
    });
    
    if (!res.ok) throw new Error('Failed to fetch route');
    
    const data = await res.json();
    if (data.routes && data.routes.length > 0) {
      const summary = data.routes[0].summary;
      return {
        distanceKm: (summary.distance / 1000).toFixed(1), // 미터를 km로
        durationMin: Math.ceil(summary.duration / 60).toString(), // 초를 분으로
        tollFare: summary.fare.toll,
      };
    }
    throw new Error('경로를 찾을 수 없습니다.');
  } catch (error) {
    console.error('Route error:', error);
    throw error;
  }
}
