import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { OPTION_ITEMS } from '@/lib/constants/items';

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
  isLoading: boolean;
  
  fetchSettings: () => Promise<void>;
  updateSettings: (
    vehiclePrices: SettingsState['vehiclePrices'], 
    workerPrices: SettingsState['workerPrices'],
    optionPrices: SettingsState['optionPrices']
  ) => Promise<void>;
}

// 초기 옵션 단가는 items.ts의 defaultPrice를 기본으로 함
const initialOptionPrices = OPTION_ITEMS.reduce((acc, item) => {
  acc[item.name] = item.defaultPrice;
  return acc;
}, {} as Record<string, number>);

const defaultValues = {
  vehiclePrices: { fiveTon: 300000, twoHalfTon: 200000, oneTon: 150000 },
  workerPrices: { male: 200000, female: 150000 },
  optionPrices: initialOptionPrices,
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
            const data = await res.json();
            set({
              vehiclePrices: data.vehiclePrices || get().vehiclePrices,
              workerPrices: data.workerPrices || get().workerPrices,
              optionPrices: data.optionPrices || get().optionPrices,
            });
          }
        } catch (error) {
          console.error('Failed to fetch global settings, falling back to cached or default values', error);
        } finally {
          set({ isLoading: false });
        }
      },

      updateSettings: async (vehiclePrices, workerPrices, optionPrices) => {
        set({ isLoading: true });
        try {
          // Optimistic update
          set({ vehiclePrices, workerPrices, optionPrices });
          
          const res = await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vehiclePrices, workerPrices, optionPrices })
          });
          
          if (!res.ok) {
            console.warn('DB update failed, but local settings were saved.');
          }
        } catch (error) {
          console.error('Network error during settings update:', error);
          // alert 제거: 로컬스토리지에는 저장되었으므로 사용자를 방해하지 않음
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
