export interface DistanceColumnDef {
  key: string;
  subHeader: string;
  description: string;
  male: number;
  female: number;
  altMale?: number;
  altFemale?: number;
}

export interface DistanceGroupDef {
  tonnage: string;
  tonnageNum: number;
  headerBg: string;
  subHeaderBg: string;
  headerColor: string;
  subHeaderColor: string;
  columns: DistanceColumnDef[];
}

export const DISTANCE_GROUPS: DistanceGroupDef[] = [
  {
    tonnage: '2.5톤',
    tonnageNum: 2.5,
    headerBg: 'bg-[#2E75B6]',
    subHeaderBg: 'bg-[#1F4E79]',
    headerColor: '#2E75B6',
    subHeaderColor: '#1F4E79',
    columns: [
      { key: 'twoHalfTon_2_0', subHeader: '2명', description: '남2 여0', male: 2, female: 0 },
      { key: 'twoHalfTon_2_1', subHeader: '2+1', description: '남2 여1', male: 2, female: 1 },
    ],
  },
  {
    tonnage: '5톤',
    tonnageNum: 5,
    headerBg: 'bg-[#C00000]',
    subHeaderBg: 'bg-[#8B0000]',
    headerColor: '#C00000',
    subHeaderColor: '#8B0000',
    columns: [
      { key: 'fiveTon_2_1', subHeader: '2+1', description: '남2 여1', male: 2, female: 1 },
      { key: 'fiveTon_3_1', subHeader: '3+1', description: '남3 여1', male: 3, female: 1 },
      { key: 'fiveTon_4_1', subHeader: '4+1', description: '남4 여1', male: 4, female: 1 },
    ],
  },
  {
    tonnage: '6톤',
    tonnageNum: 6,
    headerBg: 'bg-[#A67C00]',
    subHeaderBg: 'bg-[#7E5E00]',
    headerColor: '#A67C00',
    subHeaderColor: '#7E5E00',
    columns: [
      { key: 'sixTon_3_1', subHeader: '3+1', description: '남3 여1', male: 3, female: 1 },
      { key: 'sixTon_4_1', subHeader: '4+1', description: '남4 여1', male: 4, female: 1 },
      { key: 'sixTon_5_1', subHeader: '5+1', description: '남5 여1', male: 5, female: 1 },
    ],
  },
  {
    tonnage: '7.5톤',
    tonnageNum: 7.5,
    headerBg: 'bg-[#385723]',
    subHeaderBg: 'bg-[#273D18]',
    headerColor: '#385723',
    subHeaderColor: '#273D18',
    columns: [
      { key: 'sevenHalfTon_4_1', subHeader: '4+1', description: '남4 여1', male: 4, female: 1 },
      { key: 'sevenHalfTon_5_1', subHeader: '5+1', description: '남5 여1', male: 5, female: 1 },
      { key: 'sevenHalfTon_5_2', subHeader: '5+2 / 6+1', description: '남5 여2 (남6 여1)', male: 5, female: 2, altMale: 6, altFemale: 1 },
    ],
  },
  {
    tonnage: '10톤',
    tonnageNum: 10,
    headerBg: 'bg-[#C55A11]',
    subHeaderBg: 'bg-[#833C0C]',
    headerColor: '#C55A11',
    subHeaderColor: '#833C0C',
    columns: [
      { key: 'tenTon_5_1', subHeader: '5+1 / 4+2', description: '남5 여1 (남4 여2)', male: 5, female: 1, altMale: 4, altFemale: 2 },
      { key: 'tenTon_6_1', subHeader: '6+1 / 5+2', description: '남6 여1 (남5 여2)', male: 6, female: 1, altMale: 5, altFemale: 2 },
      { key: 'tenTon_7_1', subHeader: '7+1 / 6+2', description: '남7 여1 (남6 여2)', male: 7, female: 1, altMale: 6, altFemale: 2 },
    ],
  },
  {
    tonnage: '11톤',
    tonnageNum: 11,
    headerBg: 'bg-[#1F4E79]',
    subHeaderBg: 'bg-[#163857]',
    headerColor: '#1F4E79',
    subHeaderColor: '#163857',
    columns: [
      { key: 'elevenTon_6_1', subHeader: '6+1 / 5+2', description: '남6 여1 (남5 여2)', male: 6, female: 1, altMale: 5, altFemale: 2 },
      { key: 'elevenTon_7_1', subHeader: '7+1 / 6+2', description: '남7 여1 (남6 여2)', male: 7, female: 1, altMale: 6, altFemale: 2 },
      { key: 'elevenTon_8_1', subHeader: '8+1 / 7+2', description: '남8 여1 (남7 여2)', male: 8, female: 1, altMale: 7, altFemale: 2 },
    ],
  },
];


export const DISTANCE_TIERS_DEF = [
  { key: 'tier_30_under', label: '30km이하' },
  { key: 'tier_60', label: '~60km' },
  { key: 'tier_90', label: '~90km' },
  { key: 'tier_120', label: '~120km' },
  { key: 'tier_150', label: '~150km' },
  { key: 'tier_180', label: '~180km' },
  { key: 'tier_210', label: '~210km' },
  { key: 'tier_240', label: '~240km' },
  { key: 'tier_270', label: '~270km' },
  { key: 'tier_300', label: '~300km' },
  { key: 'tier_330', label: '~330km' },
  { key: 'tier_360', label: '~360km' },
  { key: 'tier_390', label: '~390km' },
  { key: 'tier_410', label: '~410km' },
  { key: 'tier_440', label: '~440km' },
  { key: 'tier_470', label: '~470km' },
  { key: 'tier_470_plus', label: '470km 초과' },
] as const;

export interface DistanceRateTier {
  label: string;
  // 2.5톤
  twoHalfTon_2_0?: number;
  twoHalfTon_2_1?: number;
  // 5톤
  fiveTon_2_1?: number;
  fiveTon_3_1?: number;
  fiveTon_4_1?: number;
  // 6톤
  sixTon_3_1?: number;
  sixTon_4_1?: number;
  sixTon_5_1?: number;
  // 7.5톤
  sevenHalfTon_4_1?: number;
  sevenHalfTon_5_1?: number;
  sevenHalfTon_5_2?: number;
  // 10톤
  tenTon_5_1?: number;
  tenTon_6_1?: number;
  tenTon_7_1?: number;
  // 11톤
  elevenTon_6_1?: number;
  elevenTon_7_1?: number;
  elevenTon_8_1?: number;

  // Backwards compatibility aliases
  fiveTon: number;
  fiveTonMarket?: number;
  fiveTonRate?: number;
  sixTon: number;
  sixTonMarket?: number;
  sixTonRate?: number;
  sevenHalfTon: number;
  sevenHalfTonMarket?: number;
  sevenHalfTonRate?: number;
  tenTon: number;
  tenTonMarket?: number;
  tenTonRate?: number;
  twoHalfTon?: number;
  elevenTon?: number;

  [key: string]: any;
}

const BASE_ROW_VALUES: Record<string, number> = {
  twoHalfTon_2_0: 900000,
  twoHalfTon_2_1: 1200000,
  fiveTon_2_1: 1300000,
  fiveTon_3_1: 1500000,
  fiveTon_4_1: 1800000,
  sixTon_3_1: 1700000,
  sixTon_4_1: 1900000,
  sixTon_5_1: 2300000,
  sevenHalfTon_4_1: 2200000,
  sevenHalfTon_5_1: 2300000,
  sevenHalfTon_5_2: 2500000,
  tenTon_5_1: 2600000,
  tenTon_6_1: 2800000,
  tenTon_7_1: 3000000,
  elevenTon_6_1: 3800000,
  elevenTon_7_1: 0,
  elevenTon_8_1: 0,
};

export const generateDefaultDistanceRates = (): Record<string, DistanceRateTier> => {
  const result: Record<string, DistanceRateTier> = {};

  DISTANCE_TIERS_DEF.forEach((tier, index) => {
    const tierData: any = {
      label: tier.label,
    };

    const stepAdd = index * 200000;

    Object.entries(BASE_ROW_VALUES).forEach(([key, baseVal]) => {
      if (key === 'elevenTon_7_1' || key === 'elevenTon_8_1') {
        // Excel column Q & R: empty in row 0, then 200k, 400k, ..., 3.2M
        tierData[key] = index === 0 ? 0 : stepAdd;
      } else {
        tierData[key] = baseVal + stepAdd;
      }
    });

    // Aliases for backward compatibility
    tierData.fiveTon = tierData.fiveTon_3_1;
    tierData.sixTon = tierData.sixTon_4_1;
    tierData.sevenHalfTon = tierData.sevenHalfTon_5_1;
    tierData.tenTon = tierData.tenTon_6_1;
    tierData.twoHalfTon = tierData.twoHalfTon_2_1;
    tierData.elevenTon = tierData.elevenTon_6_1;

    result[tier.key] = tierData;
  });

  return result;
};

export const DEFAULT_DISTANCE_RATES: Record<string, DistanceRateTier> = generateDefaultDistanceRates();

/**
 * Intelligent helper to lookup distance price based on distance, tonnage, and worker counts
 */
export function calculateDistanceRatePrice(
  rates: Record<string, DistanceRateTier> | undefined,
  distanceTierKey: string,
  totalTonnage: number,
  maleWorkers: number,
  femaleWorkers: number
): number {
  if (!rates) return 0;
  const tier = rates[distanceTierKey] || rates['tier_30_under'];
  if (!tier) return 0;

  // 1. 2.5톤 이하
  if (totalTonnage <= 3.5) {
    if (femaleWorkers === 0 && tier.twoHalfTon_2_0) {
      return tier.twoHalfTon_2_0;
    }
    return tier.twoHalfTon_2_1 || tier.twoHalfTon || tier.fiveTon || 0;
  }

  // 2. 5톤
  if (totalTonnage <= 5.5) {
    if (maleWorkers <= 2 && tier.fiveTon_2_1) return tier.fiveTon_2_1;
    if (maleWorkers >= 4 && tier.fiveTon_4_1) return tier.fiveTon_4_1;
    return tier.fiveTon_3_1 || tier.fiveTon || 0;
  }

  // 3. 6톤
  if (totalTonnage <= 6.5) {
    if (maleWorkers <= 3 && tier.sixTon_3_1) return tier.sixTon_3_1;
    if (maleWorkers >= 5 && tier.sixTon_5_1) return tier.sixTon_5_1;
    return tier.sixTon_4_1 || tier.sixTon || 0;
  }

  // 4. 7.5톤
  if (totalTonnage <= 8.5) {
    if (maleWorkers <= 4 && tier.sevenHalfTon_4_1) return tier.sevenHalfTon_4_1;
    if ((maleWorkers === 5 && femaleWorkers >= 2) || maleWorkers >= 6) {
      return tier.sevenHalfTon_5_2 || tier.sevenHalfTon_5_1 || tier.sevenHalfTon || 0;
    }
    return tier.sevenHalfTon_5_1 || tier.sevenHalfTon || 0;
  }

  // 5. 10톤
  if (totalTonnage <= 10.5) {
    if (maleWorkers <= 5 && femaleWorkers <= 1 && tier.tenTon_5_1) return tier.tenTon_5_1;
    if (maleWorkers >= 7 && tier.tenTon_7_1) return tier.tenTon_7_1;
    return tier.tenTon_6_1 || tier.tenTon || 0;
  }

  // 6. 11톤 이상
  const base11 = tier.elevenTon_6_1 || tier.elevenTon || tier.tenTon || 0;
  if (maleWorkers >= 8) {
    const rVal = tier.elevenTon_8_1 || 0;
    return rVal >= 3000000 ? rVal : base11 + rVal;
  }
  if (maleWorkers >= 7) {
    const qVal = tier.elevenTon_7_1 || 0;
    return qVal >= 3000000 ? qVal : base11 + qVal;
  }
  return base11;
}
