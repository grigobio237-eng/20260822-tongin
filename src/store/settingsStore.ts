import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { OPTION_ITEMS, MasterItem, RoomCategory, ROOM_CATEGORIES, ROOM_ITEMS, LIVING_ROOM_ITEMS, KITCHEN_ITEMS, VERANDA_ITEMS, REAR_BALCONY_ITEMS, UTILITY_ROOM_ITEMS } from '@/lib/constants/items';


export interface DistanceRateTier {
  label: string;
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
}

export interface LadderRateTier {
  label: string;
  fiveTon: number;
  sixTon: number;
  sevenHalfTon: number;
  tenTon: number;
}

export interface PartnerContact {
  companyName: string;
  phone: string;
  memo: string;
}

export interface SettingsState {
  companyName: string; // 동적 회사명
  vehiclePrices: {
    fiveTon: number;
    twoHalfTon: number;
    oneTon: number;
  };
  vehicleCbmLimits: {
    fiveTon: number;
    twoHalfTon: number;
    oneTon: number;
  };
  defaultPackingMaterials: {
    fiveTon: Record<string, number>;
    twoHalfTon: Record<string, number>;
    oneTon: Record<string, number>;
  };
  workerPrices: {
    male: number;
    female: number;
  };
  optionPrices: Record<string, number>;
  materialCbmSettings: Record<string, number>;
  itemCbmSettings: Record<string, number>; // 가전/가구 기본 CBM 사용자 재정의
  itemPackingSettings: Record<string, { materialName: string, count: number, materialName2?: string, count2?: number }>;
  customMasterItems: MasterItem[];
  roomItemMapping: Record<RoomCategory, string[]>;
  
  // 사다리차 층수/톤수별 단가 테이블 (단위: 원)
  ladderRates: Record<string, LadderRateTier>;
  distanceRates: Record<string, DistanceRateTier>;
  
  // 부가서비스 협력업체 정보
  partnerContacts: {
    cleaning: PartnerContact;
    organizing: PartnerContact;
  };

  isLoading: boolean;
  
  fetchSettings: () => Promise<void>;
  updateSettings: (
    newSettings: Partial<Omit<SettingsState, 'isLoading' | 'fetchSettings' | 'updateSettings'>>
  ) => Promise<void>;
}

// 초기 옵션 단가는 items.ts의 defaultPrice를 기본값으로 함
const initialOptionPrices = OPTION_ITEMS.reduce((acc, item) => {
  acc[item.name] = item.defaultPrice;
  return acc;
}, {} as Record<string, number>);



export const DEFAULT_DISTANCE_RATES: Record<string, DistanceRateTier> = {
  tier_30_under: { label: '30km이하 (시내)', fiveTon: 1130000, fiveTonMarket: 1290000, fiveTonRate: 14, sixTon: 1360000, sixTonMarket: 1550000, sixTonRate: 12, sevenHalfTon: 1700000, sevenHalfTonMarket: 1940000, sevenHalfTonRate: 12, tenTon: 2260000, tenTonMarket: 2580000, tenTonRate: 12 },
  tier_30: { label: '~30km', fiveTon: 1250000, fiveTonMarket: 1420000, fiveTonRate: 14, sixTon: 1500000, sixTonMarket: 1700000, sixTonRate: 12, sevenHalfTon: 1880000, sevenHalfTonMarket: 2130000, sevenHalfTonRate: 12, tenTon: 2500000, tenTonMarket: 2840000, tenTonRate: 12 },
  tier_60: { label: '~60km', fiveTon: 1440000, fiveTonMarket: 1650000, fiveTonRate: 14, sixTon: 1730000, sixTonMarket: 1980000, sixTonRate: 13, sevenHalfTon: 2160000, sevenHalfTonMarket: 2480000, sevenHalfTonRate: 13, tenTon: 2880000, tenTonMarket: 3300000, tenTonRate: 13 },
  tier_90: { label: '~90km', fiveTon: 1670000, fiveTonMarket: 1910000, fiveTonRate: 14, sixTon: 2000000, sixTonMarket: 2290000, sixTonRate: 13, sevenHalfTon: 2510000, sevenHalfTonMarket: 2870000, sevenHalfTonRate: 13, tenTon: 3340000, tenTonMarket: 3820000, tenTonRate: 13 },
  tier_120: { label: '~120km', fiveTon: 1870000, fiveTonMarket: 2160000, fiveTonRate: 15, sixTon: 2240000, sixTonMarket: 2590000, sixTonRate: 14, sevenHalfTon: 2810000, sevenHalfTonMarket: 3240000, sevenHalfTonRate: 13, tenTon: 3740000, tenTonMarket: 4320000, tenTonRate: 13 },
  tier_150: { label: '~150km', fiveTon: 2160000, fiveTonMarket: 2500000, fiveTonRate: 16, sixTon: 2590000, sixTonMarket: 3000000, sixTonRate: 14, sevenHalfTon: 3240000, sevenHalfTonMarket: 3750000, sevenHalfTonRate: 14, tenTon: 4320000, tenTonMarket: 5000000, tenTonRate: 14 },
  tier_180: { label: '~180km', fiveTon: 2350000, fiveTonMarket: 2730000, fiveTonRate: 16, sixTon: 2820000, sixTonMarket: 3280000, sixTonRate: 14, sevenHalfTon: 3530000, sevenHalfTonMarket: 4100000, sevenHalfTonRate: 14, tenTon: 4700000, tenTonMarket: 5460000, tenTonRate: 14 },
  tier_210: { label: '~210km', fiveTon: 2510000, fiveTonMarket: 2910000, fiveTonRate: 16, sixTon: 3010000, sixTonMarket: 3490000, sixTonRate: 14, sevenHalfTon: 3770000, sevenHalfTonMarket: 4370000, sevenHalfTonRate: 14, tenTon: 5020000, tenTonMarket: 5820000, tenTonRate: 14 },
  tier_240: { label: '~240km', fiveTon: 2710000, fiveTonMarket: 3610000, fiveTonRate: 17, sixTon: 3250000, sixTonMarket: 4330000, sixTonRate: 25, sevenHalfTon: 4070000, sevenHalfTonMarket: 5420000, sevenHalfTonRate: 25, tenTon: 5420000, tenTonMarket: 7220000, tenTonRate: 25 },
  tier_270: { label: '~270km', fiveTon: 2910000, fiveTonMarket: 3350000, fiveTonRate: 15, sixTon: 3490000, sixTonMarket: 4020000, sixTonRate: 13, sevenHalfTon: 4370000, sevenHalfTonMarket: 5030000, sevenHalfTonRate: 13, tenTon: 5820000, tenTonMarket: 6700000, tenTonRate: 13 },
  tier_300: { label: '~300km', fiveTon: 3070000, fiveTonMarket: 3540000, fiveTonRate: 15, sixTon: 3680000, sixTonMarket: 4250000, sixTonRate: 13, sevenHalfTon: 4610000, sevenHalfTonMarket: 5310000, sevenHalfTonRate: 13, tenTon: 6140000, tenTonMarket: 7080000, tenTonRate: 13 },
  tier_330: { label: '~330km', fiveTon: 3260000, fiveTonMarket: 3760000, fiveTonRate: 15, sixTon: 3910000, sixTonMarket: 4510000, sixTonRate: 13, sevenHalfTon: 4890000, sevenHalfTonMarket: 5640000, sevenHalfTonRate: 13, tenTon: 6520000, tenTonMarket: 7520000, tenTonRate: 13 },
  tier_360: { label: '~360km', fiveTon: 3480000, fiveTonMarket: 4030000, fiveTonRate: 16, sixTon: 4180000, sixTonMarket: 4840000, sixTonRate: 14, sevenHalfTon: 5220000, sevenHalfTonMarket: 6050000, sevenHalfTonRate: 14, tenTon: 6960000, tenTonMarket: 8060000, tenTonRate: 14 },
  tier_390: { label: '~390km', fiveTon: 3640000, fiveTonMarket: 4220000, fiveTonRate: 16, sixTon: 4370000, sixTonMarket: 5060000, sixTonRate: 14, sevenHalfTon: 5460000, sevenHalfTonMarket: 6330000, sevenHalfTonRate: 14, tenTon: 7280000, tenTonMarket: 8440000, tenTonRate: 14 },
  tier_410: { label: '~410km', fiveTon: 3800000, fiveTonMarket: 4410000, fiveTonRate: 16, sixTon: 4560000, sixTonMarket: 5290000, sixTonRate: 14, sevenHalfTon: 5700000, sevenHalfTonMarket: 6620000, sevenHalfTonRate: 14, tenTon: 7600000, tenTonMarket: 8820000, tenTonRate: 14 },
  tier_440: { label: '~440km', fiveTon: 4040000, fiveTonMarket: 4510000, fiveTonRate: 12, sixTon: 4850000, sixTonMarket: 5410000, sixTonRate: 10, sevenHalfTon: 6060000, sevenHalfTonMarket: 6770000, sevenHalfTonRate: 10, tenTon: 8080000, tenTonMarket: 9020000, tenTonRate: 10 },
  tier_470: { label: '~470km', fiveTon: 4280000, fiveTonMarket: 4780000, fiveTonRate: 12, sixTon: 5140000, sixTonMarket: 5740000, sixTonRate: 10, sevenHalfTon: 6420000, sevenHalfTonMarket: 7170000, sevenHalfTonRate: 10, tenTon: 8560000, tenTonMarket: 9560000, tenTonRate: 10 },
  tier_470_plus: { label: '470km 초과', fiveTon: 4570000, fiveTonMarket: 5060000, fiveTonRate: 11, sixTon: 5480000, sixTonMarket: 6070000, sixTonRate: 10, sevenHalfTon: 6860000, sevenHalfTonMarket: 7590000, sevenHalfTonRate: 10, tenTon: 9140000, tenTonMarket: 10120000, tenTonRate: 10 },
};

export const DEFAULT_LADDER_RATES: Record<string, LadderRateTier> = {
  tier_2_5: { label: '2~5층', fiveTon: 150000, sixTon: 180000, sevenHalfTon: 210000, tenTon: 240000 },
  tier_6_7: { label: '6~7층', fiveTon: 160000, sixTon: 190000, sevenHalfTon: 220000, tenTon: 250000 },
  tier_8_9: { label: '8~9층', fiveTon: 170000, sixTon: 200000, sevenHalfTon: 230000, tenTon: 260000 },
  tier_10_11: { label: '10~11층', fiveTon: 180000, sixTon: 210000, sevenHalfTon: 240000, tenTon: 270000 },
  tier_12_13: { label: '12~13층', fiveTon: 190000, sixTon: 220000, sevenHalfTon: 250000, tenTon: 280000 },
  tier_14: { label: '14층', fiveTon: 200000, sixTon: 230000, sevenHalfTon: 260000, tenTon: 290000 },
  tier_15: { label: '15층', fiveTon: 210000, sixTon: 240000, sevenHalfTon: 270000, tenTon: 300000 },
  tier_16: { label: '16층', fiveTon: 220000, sixTon: 250000, sevenHalfTon: 280000, tenTon: 310000 },
  tier_17: { label: '17층', fiveTon: 230000, sixTon: 260000, sevenHalfTon: 290000, tenTon: 320000 },
  tier_18: { label: '18층', fiveTon: 250000, sixTon: 280000, sevenHalfTon: 310000, tenTon: 340000 },
  tier_19: { label: '19층', fiveTon: 260000, sixTon: 290000, sevenHalfTon: 320000, tenTon: 350000 },
  tier_20: { label: '20층', fiveTon: 280000, sixTon: 310000, sevenHalfTon: 340000, tenTon: 370000 },
  tier_21: { label: '21층', fiveTon: 310000, sixTon: 340000, sevenHalfTon: 370000, tenTon: 400000 },
  tier_22: { label: '22층', fiveTon: 340000, sixTon: 370000, sevenHalfTon: 400000, tenTon: 430000 },
  tier_23: { label: '23층', fiveTon: 370000, sixTon: 400000, sevenHalfTon: 430000, tenTon: 460000 },
  tier_24: { label: '24층', fiveTon: 400000, sixTon: 430000, sevenHalfTon: 460000, tenTon: 490000 },
  tier_25_plus: { label: '25층이상', fiveTon: 0, sixTon: 0, sevenHalfTon: 0, tenTon: 0 },
};


const allMasterItems = [...ROOM_ITEMS, ...LIVING_ROOM_ITEMS, ...KITCHEN_ITEMS, ...VERANDA_ITEMS, ...REAR_BALCONY_ITEMS, ...UTILITY_ROOM_ITEMS];
// 초기 룸 매핑 생성 함수
const generateDefaultRoomMapping = () => {
  const mapping: Record<string, string[]> = {};
  (Object.entries(ROOM_CATEGORIES) as [RoomCategory, MasterItem[]][]).forEach(([room, items]) => {
    mapping[room] = items.map(i => i.name);
  });
  return mapping as Record<RoomCategory, string[]>;
};

const defaultValues = {
  companyName: '통인익스프레스',
  vehiclePrices: { fiveTon: 300000, twoHalfTon: 200000, oneTon: 150000 },
  vehicleCbmLimits: { fiveTon: 15, twoHalfTon: 7.5, oneTon: 3 },
  defaultPackingMaterials: {
    fiveTon: {},
    twoHalfTon: {},
    oneTon: {}
  },
  workerPrices: { male: 200000, female: 150000 },
  optionPrices: initialOptionPrices,
  materialCbmSettings: {
    '특대박스(이불)': 0,
    '대박스(옷)': 0,
    '중대박스': 0,
    '중박스': 0,
    '소박스': 0,
    '바구니': 0,
    '아이스박스': 0
  },
  ladderRates: DEFAULT_LADDER_RATES,
  distanceRates: DEFAULT_DISTANCE_RATES,
  partnerContacts: {
    cleaning: { companyName: '', phone: '', memo: '' },
    organizing: { companyName: '', phone: '', memo: '' },
  },
  itemCbmSettings: {},
  itemPackingSettings: {},
  customMasterItems: allMasterItems,
  roomItemMapping: generateDefaultRoomMapping()
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...defaultValues,
      isLoading: false,

      fetchSettings: async () => {
        set({ isLoading: true });
        try {
          const res = await fetch('/api/settings');
          if (res.ok) {
            const data = (await res.json()) as Partial<SettingsState>;
            set({
              companyName: data.companyName || get().companyName,
              vehiclePrices: data.vehiclePrices || get().vehiclePrices,
              vehicleCbmLimits: data.vehicleCbmLimits || get().vehicleCbmLimits,
              defaultPackingMaterials: data.defaultPackingMaterials || get().defaultPackingMaterials,
              workerPrices: data.workerPrices || get().workerPrices,
              itemCbmSettings: data.itemCbmSettings || get().itemCbmSettings,
              itemPackingSettings: data.itemPackingSettings || get().itemPackingSettings,
              optionPrices: data.optionPrices || get().optionPrices,
              materialCbmSettings: data.materialCbmSettings || get().materialCbmSettings,
              distanceRates: (data.distanceRates && (data.distanceRates as any).tier_30_under?.fiveTonMarket !== undefined) ? data.distanceRates : ((get().distanceRates as any)?.tier_30_under?.fiveTonMarket !== undefined ? get().distanceRates : DEFAULT_DISTANCE_RATES),
              ladderRates: (data.ladderRates && data.ladderRates.tier_14) ? data.ladderRates : (get().ladderRates?.tier_14 ? get().ladderRates : DEFAULT_LADDER_RATES),
              partnerContacts: data.partnerContacts || get().partnerContacts,
            });
          }
        } catch (error) {
          console.error('Failed to fetch global settings, falling back to cached or default values', error);
        } finally {
          set({ isLoading: false });
        }
      },

      updateSettings: async (newSettings) => {
        set({ isLoading: true });
        try {
          set({ ...newSettings });
          
          const res = await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newSettings)
          });
          
          if (!res.ok) {
            console.warn('DB update failed, but local settings were saved.');
          }
        } catch (error) {
          console.error('Network error during settings update:', error);
        } finally {
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'tongin-global-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
