import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { OPTION_ITEMS } from '@/lib/constants/items';

export interface LadderRateTier {
  label: string;
  oneTon: number;
  fiveTon: number;
  heavyTon: number;
}

export interface PartnerContact {
  companyName: string;
  phone: string;
  memo: string;
}

export interface SettingsState {
  vehiclePrices: {
    fiveTon: number;
    twoHalfTon: number;
    oneTon: number;
  };
  workerPrices: {
    male: number;
    female: number;
  };
  optionPrices: Record<string, number>;
  
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
  tier_2_5: { label: '2층 ~ 5층', oneTon: 100000, fiveTon: 140000, heavyTon: 190000 },
  tier_6_9: { label: '6층 ~ 9층', oneTon: 120000, fiveTon: 170000, heavyTon: 220000 },
  tier_10_13: { label: '10층 ~ 13층', oneTon: 140000, fiveTon: 200000, heavyTon: 250000 },
  tier_14_17: { label: '14층 ~ 17층', oneTon: 170000, fiveTon: 230000, heavyTon: 280000 },
  tier_18_20: { label: '18층 ~ 20층', oneTon: 200000, fiveTon: 270000, heavyTon: 330000 },
  tier_21_25: { label: '21층 ~ 25층', oneTon: 240000, fiveTon: 330000, heavyTon: 400000 },
  tier_26_plus: { label: '26층 이상', oneTon: 300000, fiveTon: 420000, heavyTon: 500000 },
};

const defaultValues = {
  vehiclePrices: { fiveTon: 300000, twoHalfTon: 200000, oneTon: 150000 },
  workerPrices: { male: 200000, female: 150000 },
  optionPrices: initialOptionPrices,
  ladderRates: DEFAULT_LADDER_RATES,
  partnerContacts: {
    cleaning: { companyName: '', phone: '', memo: '' },
    organizing: { companyName: '', phone: '', memo: '' },
  }
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
              vehiclePrices: data.vehiclePrices || get().vehiclePrices,
              workerPrices: data.workerPrices || get().workerPrices,
              optionPrices: data.optionPrices || get().optionPrices,
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
