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
  departureLadderCount?: number;
  arrivalAddress: string;
  arrivalFloor: string;
  arrivalConditions: string[];
  arrivalLadderCount?: number;
  arrivalStatus: string;
}

export interface RoomItemInstance {
  id: string;
  quantity: number;
  variantName: string;
  unitCbm: number;
  cbm: number;
}

export interface RoomData {
  items: Record<string, RoomItemInstance[]>;
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
  tvBoxInches?: string;
}

export interface WizardState {
  currentStep: number;
  customerInfo: CustomerInfo;
  roomItems: AllRoomsState; // RoomData 객체로 유지
  totalCbm: number;
  calculatedVehicles: VehicleRecommendation; 
  
  options: OptionsState;
  sttMemo: string;          // Step 3 종합 협의사항
  
  resources: ResourceState;
  surcharge: { noEvilSpirits: boolean; endOfMonth: boolean };
  discount: number;

  setStep: (step: number) => void;
  updateCustomerInfo: (info: Partial<CustomerInfo>) => void;
  
  // 배열 기반 액션들
  addRoomItemInstance: (room: RoomCategory, itemName: string) => void;
  removeRoomItemInstance: (room: RoomCategory, itemName: string, id: string) => void;
  updateRoomItemQuantity: (room: RoomCategory, itemName: string, id: string, quantity: number) => void;
  changeItemVariant: (room: RoomCategory, itemName: string, id: string, variantName: string, customCbm: number) => void;
  
  updateRoomNote: (room: RoomCategory, note: string) => void;
  addRoomImage: (room: RoomCategory, url: string) => void;
  removeRoomImage: (room: RoomCategory, url: string) => void;
  updateOption: (optionName: string, quantity: number, price: number) => void;
  setSttMemo: (memo: string) => void;
  
  updateResources: (info: Partial<ResourceState>) => void;
  updateMaterial: (materialName: string, quantity: number) => void;
  updateSurcharge: (key: 'noEvilSpirits' | 'endOfMonth', value: boolean) => void;
  setDiscount: (amount: number) => void;
  recalculateCbm: () => void;
  reset: () => void;
}

const initialCustomerInfo: CustomerInfo = {
  name: '', phone: '', contractDate: '', packingDate: '', movingDate: '',
  departureAddress: '', departureFloor: '', departureConditions: [], departureLadderCount: 1,
  arrivalAddress: '', arrivalFloor: '', arrivalConditions: [], arrivalLadderCount: 1, arrivalStatus: '',
};

const initialRoomItems: AllRoomsState = (Object.keys(ROOM_CATEGORIES) as RoomCategory[]).reduce((acc, room) => {
  acc[room] = { items: {}, note: '', images: [] };
  return acc;
}, {} as AllRoomsState);

const initialResources: ResourceState = {
  vehicles: { fiveTon: 0, twoHalfTon: 0, oneTon: 0 },
  workerMale: 3,
  workerFemale: 1,
  materials: {},
  tvBoxInches: ''
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
      surcharge: { noEvilSpirits: false, endOfMonth: false },
      discount: 0,
      
      setStep: (step) => set({ currentStep: step }),
      
      updateCustomerInfo: (info) => set((state) => ({ 
        customerInfo: { ...state.customerInfo, ...info } 
      })),
      
      addRoomItemInstance: (room, itemName) => {
        set((state) => {
          const newRoomItems = { ...state.roomItems };
          const currentInstances = newRoomItems[room].items[itemName] || [];
          
          const masterItem = ROOM_CATEGORIES[room]?.find(i => i.name === itemName) || ROOM_CATEGORIES['방 1']?.find(i => i.name === itemName);
          
          let defaultVariantName = itemName;
          let defaultUnitCbm = 0.1;

          if (masterItem) {
            const defaultVariant = masterItem.variants.find(v => v.isDefault) || masterItem.variants[1] || masterItem.variants[0];
            defaultVariantName = defaultVariant.name;
            defaultUnitCbm = defaultVariant.cbm;
          }
          
          const newInstance: RoomItemInstance = {
            id: Math.random().toString(36).substring(2, 9),
            quantity: 1,
            variantName: defaultVariantName,
            unitCbm: defaultUnitCbm,
            cbm: defaultUnitCbm,
          };
          
          newRoomItems[room].items = {
            ...newRoomItems[room].items,
            [itemName]: [...currentInstances, newInstance]
          };
          return { roomItems: newRoomItems };
        });
        get().recalculateCbm();
      },

      removeRoomItemInstance: (room, itemName, id) => {
        set((state) => {
          const newRoomItems = { ...state.roomItems };
          const currentInstances = newRoomItems[room].items[itemName] || [];
          
          const filtered = currentInstances.filter(inst => inst.id !== id);
          
          if (filtered.length === 0) {
            const { [itemName]: removed, ...rest } = newRoomItems[room].items;
            newRoomItems[room].items = rest;
          } else {
            newRoomItems[room].items = {
              ...newRoomItems[room].items,
              [itemName]: filtered
            };
          }
          return { roomItems: newRoomItems };
        });
        get().recalculateCbm();
      },

      updateRoomItemQuantity: (room, itemName, id, quantity) => {
        set((state) => {
          const newRoomItems = { ...state.roomItems };
          const currentInstances = newRoomItems[room].items[itemName] || [];
          
          if (currentInstances.length === 0) {
             const masterItem = ROOM_CATEGORIES[room]?.find(i => i.name === itemName) || ROOM_CATEGORIES['방 1']?.find(i => i.name === itemName);
             
             let defaultVariantName = itemName;
             let defaultUnitCbm = 0.1;

             if (masterItem) {
               const defaultVariant = masterItem.variants.find(v => v.isDefault) || masterItem.variants[1] || masterItem.variants[0];
               defaultVariantName = defaultVariant.name;
               defaultUnitCbm = defaultVariant.cbm;
             }
             
             const newInstance: RoomItemInstance = {
               id: Math.random().toString(36).substring(2, 9),
               quantity,
               variantName: defaultVariantName,
               unitCbm: defaultUnitCbm,
               cbm: quantity * defaultUnitCbm,
             };
             newRoomItems[room].items = {
               ...newRoomItems[room].items,
               [itemName]: [newInstance]
             };
          } else {
             const index = currentInstances.findIndex(inst => inst.id === id);
             if (index !== -1) {
               const updatedInstance = { ...currentInstances[index] };
               updatedInstance.quantity = quantity;
               updatedInstance.cbm = quantity * updatedInstance.unitCbm;
               
               const newInstances = [...currentInstances];
               newInstances[index] = updatedInstance;
               
               newRoomItems[room].items = {
                 ...newRoomItems[room].items,
                 [itemName]: newInstances
               };
             }
          }
          
          return { roomItems: newRoomItems };
        });
        get().recalculateCbm();
      },

      changeItemVariant: (room, itemName, id, variantName, customCbm) => {
        set((state) => {
          const newRoomItems = { ...state.roomItems };
          const currentInstances = newRoomItems[room].items[itemName] || [];
          
          const index = currentInstances.findIndex(inst => inst.id === id);
          if (index !== -1) {
            const updatedInstance = { ...currentInstances[index] };
            updatedInstance.variantName = variantName;
            updatedInstance.unitCbm = customCbm;
            updatedInstance.cbm = updatedInstance.quantity * customCbm;
            
            const newInstances = [...currentInstances];
            newInstances[index] = updatedInstance;
            
            newRoomItems[room].items = {
              ...newRoomItems[room].items,
              [itemName]: newInstances
            };
          } else if (id === '') {
            // Create a new empty instance with quantity 0
            const newInstance: RoomItemInstance = {
               id: Math.random().toString(36).substring(2, 9),
               quantity: 0,
               variantName,
               unitCbm: customCbm,
               cbm: 0,
            };
            newRoomItems[room].items = {
              ...newRoomItems[room].items,
              [itemName]: [newInstance]
            };
          }
          
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

      updateOption: (optionName, quantity, price) => {
        set((state) => {
          const newOptions = { ...state.options };
          if (quantity <= 0) {
            delete newOptions[optionName];
          } else {
            newOptions[optionName] = {
              quantity,
              totalPrice: quantity * price
            };
          }
          return { options: newOptions };
        });
      },

      setSttMemo: (memo) => set({ sttMemo: memo }),
      
      updateResources: (info) => set((state) => {
        let newMaterials = state.resources.materials;
        
        if (info.vehicles) {
          const { useSettingsStore } = require('./settingsStore');
          const defaultMats = useSettingsStore.getState().defaultPackingMaterials;
          const autoMaterials: Record<string, number> = {};
          
          const addMats = (mats: Record<string, number>, count: number) => {
            if (!mats || count <= 0) return;
            Object.entries(mats).forEach(([key, val]) => {
              if (val > 0) {
                autoMaterials[key] = (autoMaterials[key] || 0) + (val * count);
              }
            });
          };
          
          addMats(defaultMats.fiveTon, info.vehicles.fiveTon || 0);
          addMats(defaultMats.twoHalfTon, info.vehicles.twoHalfTon || 0);
          addMats(defaultMats.oneTon, info.vehicles.oneTon || 0);
          
          newMaterials = autoMaterials;
        }

        return {
          resources: { ...state.resources, ...info, materials: newMaterials }
        };
      }),

      updateMaterial: (materialName, quantity) => set((state) => ({
        resources: { 
          ...state.resources, 
          materials: { ...state.resources.materials, [materialName]: quantity } 
        }
      })),
      
      updateSurcharge: (key, value) => set((state) => ({
        surcharge: { ...state.surcharge, [key]: value }
      })),

      setDiscount: (amount) => set({ discount: amount }),
      
      recalculateCbm: () => {
        const { roomItems, resources } = get();
        let totalCbm = 0;
        
        Object.values(roomItems).forEach(roomData => {
          Object.values(roomData.items).forEach(instances => { 
            instances.forEach(item => { totalCbm += item.cbm; });
          });
        });
        
        totalCbm = Math.round(totalCbm * 10) / 10;
        
        const { useSettingsStore } = require('./settingsStore');
        const settings = useSettingsStore.getState();
        const limits = settings.vehicleCbmLimits;
        const calculated = calculateVehicles(totalCbm, limits);
        
        const defaultMats = settings.defaultPackingMaterials;
        const autoMaterials: Record<string, number> = {};
        
        const addMats = (mats: Record<string, number>, count: number) => {
          if (!mats || count <= 0) return;
          Object.entries(mats).forEach(([key, val]) => {
            if (val > 0) {
              autoMaterials[key] = (autoMaterials[key] || 0) + (val * count);
            }
          });
        };
        
        addMats(defaultMats.fiveTon, calculated.fiveTon);
        addMats(defaultMats.twoHalfTon, calculated.twoHalfTon);
        addMats(defaultMats.oneTon, calculated.oneTon);
        
        set({ 
          totalCbm, 
          calculatedVehicles: calculated,
          resources: { 
            ...resources, 
            vehicles: calculated,
            materials: autoMaterials 
          } 
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
        surcharge: { noEvilSpirits: false, endOfMonth: false },
        discount: 0,
      })
    }),
    {
      name: 'tongin-wizard-storage-v3',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
