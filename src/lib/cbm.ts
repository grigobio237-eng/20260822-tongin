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

export interface WorkerRecommendation {
  male: number;
  female: number;
}

/**
 * 총 CBM과 설정된 티어표를 기반으로 기본 추천 작업인원(남/여)을 계산합니다.
 */
export function calculateWorkers(
  totalCbm: number,
  tiers?: Array<{ minCbm: number; maxCbm: number; male: number; female: number }>
): WorkerRecommendation {
  if (!tiers || tiers.length === 0) {
    // 기본 폴백
    if (totalCbm < 20) return { male: 2, female: 1 };
    if (totalCbm <= 30) return { male: 3, female: 1 };
    if (totalCbm <= 40) return { male: 4, female: 1 };
    if (totalCbm <= 50) return { male: 5, female: 2 };
    return { male: 6, female: 2 };
  }

  // 매칭되는 구간 탐색 (minCbm <= totalCbm < maxCbm 또는 마지막 구간)
  const sortedTiers = [...tiers].sort((a, b) => a.minCbm - b.minCbm);
  for (let i = 0; i < sortedTiers.length; i++) {
    const tier = sortedTiers[i];
    const isLast = i === sortedTiers.length - 1;
    if (totalCbm >= tier.minCbm && (totalCbm < tier.maxCbm || isLast)) {
      return { male: tier.male, female: tier.female };
    }
  }

  // 범위 밖일 경우 최상위 티어 반환
  const highest = sortedTiers[sortedTiers.length - 1];
  return { male: highest?.male ?? 3, female: highest?.female ?? 1 };
}

