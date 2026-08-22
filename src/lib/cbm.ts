export interface VehicleRecommendation {
  fiveTon: number;
  twoHalfTon: number;
  oneTon: number;
}

/**
 * 총 CBM을 기반으로 권장 차량 대수를 계산합니다.
 * 5T = 15 CBM, 2.5T = 7.5 CBM, 1T = 3 CBM 기준으로 대략 산정
 */
export function calculateVehicles(totalCbm: number): VehicleRecommendation {
  let remainingCbm = totalCbm;
  
  const fiveTon = Math.floor(remainingCbm / 15);
  remainingCbm -= fiveTon * 15;
  
  const twoHalfTon = Math.floor(remainingCbm / 7.5);
  remainingCbm -= twoHalfTon * 7.5;
  
  const oneTon = Math.ceil(remainingCbm / 3);
  
  return {
    fiveTon,
    twoHalfTon,
    oneTon,
  };
}

export function formatVehicleString(vehicles: VehicleRecommendation): string {
  const parts = [];
  if (vehicles.fiveTon > 0) parts.push(`5T ${vehicles.fiveTon}대`);
  if (vehicles.twoHalfTon > 0) parts.push(`2.5T ${vehicles.twoHalfTon}대`);
  if (vehicles.oneTon > 0) parts.push(`1T ${vehicles.oneTon}대`);
  return parts.join(', ') || '차량 없음';
}
