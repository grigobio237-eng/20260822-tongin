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

export interface RoomData {
  items: Record<string, RoomItemState>;
  note: string;
  images: string[];
}

export type AllRoomsState = Record<RoomCategory, RoomData>;

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
  roomItems: AllRoomsState; // RoomData 객체로 유지
  totalCbm: number;
  calculatedVehicles: VehicleRecommendation; 
  
  options: OptionsState;
  sttMemo: string;          // Step 3 종합 협의사항
  resources: ResourceState;
  
  setStep: (step: number) => void;
  updateCustomerInfo: (info: Partial<CustomerInfo>) => void;
  updateRoomItemQuantity: (room: RoomCategory, itemName: string, quantity: number) => void;
  changeItemVariant: (room: RoomCategory, itemName: string, variantName: string, customCbm: number) => void;
  updateRoomNote: (room: RoomCategory, note: string) => void;
  addRoomImage: (room: RoomCategory, url: string) => void;
  removeRoomImage: (room: RoomCategory, url: string) => void;
  
  updateOption: (optionName: string, quantity: number) => void;
  setSttMemo: (memo: string) => void;
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
  acc[room] = { items: {}, note: '', images: [] };
  return acc;
}, {} as AllRoomsState);

const initialResources: ResourceState = {
  vehicles: { fiveTon: 0, twoHalfTon: 0, oneTon: 0 },
  workerMale: 3,
  workerFemale: 1,
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
      resources: initialResources,
      
      setStep: (step) => set({ currentStep: step }),
      
      updateCustomerInfo: (info) => set((state) => ({ 
        customerInfo: { ...state.customerInfo, ...info } 
      })),
      
      updateRoomItemQuantity: (room, itemName, quantity) => {
        set((state) => {
          const newRoomItems = { ...state.roomItems };
          let currentItem = newRoomItems[room].items[itemName];
          
          if (!currentItem) {
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
          
          newRoomItems[room].items = {
            ...newRoomItems[room].items,
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
          let currentItem = newRoomItems[room].items[itemName] || { quantity: 0 };
          
          newRoomItems[room].items = {
            ...newRoomItems[room].items,
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

      updateRoomNote: (room, note) => set((state) => ({
        roomItems: {
          ...state.roomItems,
          [room]: { ...state.roomItems[room], note }
        }
      })),

      addRoomImage: (room, url) => set((state) => ({
        roomItems: {
          ...state.roomItems,
          [room]: { ...state.roomItems[room], images: [...state.roomItems[room].images, url] }
        }
      })),

      removeRoomImage: (room, url) => set((state) => ({
        roomItems: {
          ...state.roomItems,
          [room]: { ...state.roomItems[room], images: state.roomItems[room].images.filter(img => img !== url) }
        }
      })),

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
        
        Object.values(roomItems).forEach(roomData => {
          Object.values(roomData.items).forEach(item => { totalCbm += item.cbm; });
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
        resources: initialResources,
      })
    }),
    {
      name: 'tongin-wizard-storage-v2', // 로컬스토리지 충돌 방지용 키 변경
      storage: createJSONStorage(() => localStorage),
    }
  )
);
