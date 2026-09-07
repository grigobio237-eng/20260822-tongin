import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { OPTION_ITEMS } from '@/lib/constants/items';

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
  
  // 사다리차 층수/톤수별 단가 테이블 (단위: 원)
  ladderRates: Record<string, LadderRateTier>;
  
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
  partnerContacts: {
    cleaning: { companyName: '', phone: '', memo: '' },
    organizing: { companyName: '', phone: '', memo: '' },
  },
  itemCbmSettings: {}
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
              optionPrices: data.optionPrices || get().optionPrices,
              materialCbmSettings: data.materialCbmSettings || get().materialCbmSettings,
              ladderRates: data.ladderRates || get().ladderRates,
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
