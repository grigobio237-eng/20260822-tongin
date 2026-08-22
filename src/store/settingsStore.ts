import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
  isLoading: boolean;
  
  fetchSettings: () => Promise<void>;
  updateSettings: (vehiclePrices: SettingsState['vehiclePrices'], workerPrices: SettingsState['workerPrices']) => Promise<void>;
}

const defaultValues = {
  vehiclePrices: { fiveTon: 300000, twoHalfTon: 200000, oneTon: 150000 },
  workerPrices: { male: 200000, female: 150000 },
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
              vehiclePrices: data.vehiclePrices,
              workerPrices: data.workerPrices
            });
          }
        } catch (error) {
          console.error('Failed to fetch global settings, falling back to cached or default values', error);
        } finally {
          set({ isLoading: false });
        }
      },

      updateSettings: async (vehiclePrices, workerPrices) => {
        set({ isLoading: true });
        try {
          // Optimistic update
          set({ vehiclePrices, workerPrices });
          
          const res = await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vehiclePrices, workerPrices })
          });
          
          if (!res.ok) {
            throw new Error('Failed to update DB');
          }
        } catch (error) {
          console.error(error);
          alert('설정을 저장하는 데 실패했습니다. 다시 시도해주세요.');
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
