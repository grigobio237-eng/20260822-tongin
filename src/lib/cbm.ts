export interface VehicleRecommendation {
  fiveTon: number;
  twoHalfTon: number;
  oneTon: number;
}

export interface VehicleCbmLimits {
  fiveTon: number;
  twoHalfTon: number;
  oneTon: number;
}

/**
 * 총 CBM을 기반으로 권장 차량 대수를 계산합니다.
 */
export function calculateVehicles(totalCbm: number, limits?: VehicleCbmLimits): VehicleRecommendation {
  let remainingCbm = totalCbm;
  
  const fiveLimit = limits?.fiveTon || 15;
  const twoHalfLimit = limits?.twoHalfTon || 7.5;
  const oneLimit = limits?.oneTon || 3;
  
  const fiveTon = Math.floor(remainingCbm / fiveLimit);
  remainingCbm -= fiveTon * fiveLimit;
  
  const twoHalfTon = Math.floor(remainingCbm / twoHalfLimit);
  remainingCbm -= twoHalfTon * twoHalfLimit;
  
  const oneTon = Math.ceil(remainingCbm / oneLimit);
  
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
