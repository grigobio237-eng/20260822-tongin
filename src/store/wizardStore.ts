import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { RoomCategory, ROOM_CATEGORIES, OPTION_ITEMS } from '../lib/constants/items';
import { calculateVehicles, VehicleRecommendation } from '../lib/cbm';

export interface CustomerInfo {
  name: string;
  phone: string;
  contractDate: string;
  packingDate: string;
  movingDate: string;
  departureAddress: string;
  departureFloor: string;
  departureConditions: string[]; 
  arrivalAddress: string;
  arrivalFloor: string;
  arrivalConditions: string[];
  arrivalStatus: string;
}

export interface RoomItemState {
  quantity: number;
  variantName: string; // "10자 (3통, 기본)" 등
  unitCbm: number;     // 4.5
  cbm: number;         // quantity * unitCbm
}

export type RoomItems = Record<string, RoomItemState>;
export type AllRoomsState = Record<RoomCategory, RoomItems>;

export interface OptionState {
  quantity: number;
  totalPrice: number;
}
export type OptionsState = Record<string, OptionState>;

export interface ResourceState {
  vehicles: VehicleRecommendation;
  workerMale: number;
  workerFemale: number;
  materials: Record<string, number>;
}

interface WizardState {
  currentStep: number;
  customerInfo: CustomerInfo;
  roomItems: AllRoomsState;
  totalCbm: number;
  calculatedVehicles: VehicleRecommendation; 
  
  options: OptionsState;
  sttMemo: string;
  images: string[];
  resources: ResourceState;
  
  setStep: (step: number) => void;
  updateCustomerInfo: (info: Partial<CustomerInfo>) => void;
  updateRoomItemQuantity: (room: RoomCategory, itemName: string, quantity: number) => void;
  changeItemVariant: (room: RoomCategory, itemName: string, variantName: string, customCbm: number) => void;
  updateOption: (optionName: string, quantity: number) => void;
  setSttMemo: (memo: string) => void;
  addImage: (url: string) => void;
  removeImage: (url: string) => void;
  updateResources: (info: Partial<ResourceState>) => void;
  updateMaterial: (materialName: string, quantity: number) => void;
  recalculateCbm: () => void;
  reset: () => void;
}

const initialCustomerInfo: CustomerInfo = {
  name: '', phone: '', contractDate: '', packingDate: '', movingDate: '',
  departureAddress: '', departureFloor: '', departureConditions: [],
  arrivalAddress: '', arrivalFloor: '', arrivalConditions: [], arrivalStatus: '',
};

const initialRoomItems: AllRoomsState = (Object.keys(ROOM_CATEGORIES) as RoomCategory[]).reduce((acc, room) => {
  acc[room] = {};
  return acc;
}, {} as AllRoomsState);

const initialResources: ResourceState = {
  vehicles: { fiveTon: 0, twoHalfTon: 0, oneTon: 0 },
  workerMale: 0,
  workerFemale: 0,
  materials: {}
};

export const useWizardStore = create<WizardState>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      customerInfo: initialCustomerInfo,
      roomItems: initialRoomItems,
      totalCbm: 0,
      calculatedVehicles: { fiveTon: 0, twoHalfTon: 0, oneTon: 0 },
      options: {},
      sttMemo: '',
      images: [],
      resources: initialResources,
      
      setStep: (step) => set({ currentStep: step }),
      
      updateCustomerInfo: (info) => set((state) => ({ 
        customerInfo: { ...state.customerInfo, ...info } 
      })),
      
      updateRoomItemQuantity: (room, itemName, quantity) => {
        set((state) => {
          const newRoomItems = { ...state.roomItems };
          let currentItem = newRoomItems[room][itemName];
          
          if (!currentItem) {
            // Find default variant
            const masterItem = ROOM_CATEGORIES[room].find(i => i.name === itemName);
            if (!masterItem) return state;
            const defaultVariant = masterItem.variants.find(v => v.isDefault) || masterItem.variants[1] || masterItem.variants[0];
            
            currentItem = {
              quantity: 0,
              variantName: defaultVariant.name,
              unitCbm: defaultVariant.cbm,
              cbm: 0,
            };
          }
          
          newRoomItems[room] = {
            ...newRoomItems[room],
            [itemName]: {
              ...currentItem,
              quantity,
              cbm: quantity * currentItem.unitCbm
            }
          };
          
          return { roomItems: newRoomItems };
        });
        get().recalculateCbm();
      },

      changeItemVariant: (room, itemName, variantName, customCbm) => {
        set((state) => {
          const newRoomItems = { ...state.roomItems };
          let currentItem = newRoomItems[room][itemName] || { quantity: 0 };
          
          newRoomItems[room] = {
            ...newRoomItems[room],
            [itemName]: {
              ...currentItem,
              variantName,
              unitCbm: customCbm,
              cbm: currentItem.quantity * customCbm
            }
          };
          
          return { roomItems: newRoomItems };
        });
        get().recalculateCbm();
      },

      updateOption: (optionName, quantity) => {
        set((state) => {
          const optionDef = OPTION_ITEMS.find(o => o.name === optionName);
          if (!optionDef) return state;
          
          const newOptions = { ...state.options };
          if (quantity <= 0) {
            delete newOptions[optionName];
          } else {
            newOptions[optionName] = {
              quantity,
              totalPrice: quantity * optionDef.defaultPrice
            };
          }
          return { options: newOptions };
        });
      },

      setSttMemo: (memo) => set({ sttMemo: memo }),
      
      addImage: (url) => set((state) => ({ images: [...state.images, url] })),
      removeImage: (url) => set((state) => ({ images: state.images.filter(img => img !== url) })),
      
      updateResources: (info) => set((state) => ({
        resources: { ...state.resources, ...info }
      })),

      updateMaterial: (materialName, quantity) => set((state) => ({
        resources: { 
          ...state.resources, 
          materials: { ...state.resources.materials, [materialName]: quantity } 
        }
      })),
      
      recalculateCbm: () => {
        const { roomItems, resources } = get();
        let totalCbm = 0;
        
        Object.values(roomItems).forEach(room => {
          Object.values(room).forEach(item => { totalCbm += item.cbm; });
        });
        
        totalCbm = Math.round(totalCbm * 10) / 10;
        const calculated = calculateVehicles(totalCbm);
        
        set({ 
          totalCbm, 
          calculatedVehicles: calculated,
          resources: { ...resources, vehicles: calculated } 
        });
      },

      reset: () => set({
        currentStep: 1,
        customerInfo: initialCustomerInfo,
        roomItems: initialRoomItems,
        totalCbm: 0,
        calculatedVehicles: { fiveTon: 0, twoHalfTon: 0, oneTon: 0 },
        options: {},
        sttMemo: '',
        images: [],
        resources: initialResources,
      })
    }),
    {
      name: 'tongin-wizard-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
