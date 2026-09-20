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
  departureDetailAddress: string;
  departureFloor: string;
  departureConditions: string[]; 
  departureLadderCount?: number;
  arrivalAddress: string;
  arrivalDetailAddress: string;
  arrivalFloor: string;
  arrivalConditions: string[];
  arrivalLadderCount?: number;
  arrivalStatus: string;
  distanceKm?: string;
  durationMin?: string;
  applyDistancePrice?: boolean;
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
  startDate?: string;
  endDate?: string;
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
  contractId: string | null;
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
  manualBaseCost?: number;
  deposit?: number;
  middlePayment?: number;

  setContractId: (id: string | null) => void;
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
  updateOption: (optionName: string, quantity: number, price: number, startDate?: string, endDate?: string) => void;
  setSttMemo: (memo: string) => void;
  
  updateResources: (info: Partial<ResourceState>) => void;
  updateMaterial: (materialName: string, quantity: number) => void;
  updateSurcharge: (key: 'noEvilSpirits' | 'endOfMonth', value: boolean) => void;
  setDiscount: (amount: number) => void;
  setDeposit: (amount: number) => void;
  setMiddlePayment: (amount: number) => void;
  recalculateCbm: () => void;
  reset: () => void;
  hydrateContract: (contract: any) => void;
}

const initialCustomerInfo: CustomerInfo = {
  name: '', phone: '', contractDate: '', packingDate: '', movingDate: '',
  departureAddress: '', departureDetailAddress: '', departureFloor: '', departureConditions: [], departureLadderCount: 1,
  arrivalAddress: '', arrivalDetailAddress: '', arrivalFloor: '', arrivalConditions: [], arrivalLadderCount: 1, arrivalStatus: '',
  applyDistancePrice: false,
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
      contractId: null,
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
      
      setContractId: (id) => set({ contractId: id }),
      setStep: (step) => set({ currentStep: step }),
      
      updateCustomerInfo: (info) => set((state) => ({ 
        customerInfo: { ...state.customerInfo, ...info } 
      })),
      
      addRoomItemInstance: (room, itemName) => {
        set((state) => {
          const newRoomItems = { ...state.roomItems };
          if (room && !newRoomItems[room]) {
            newRoomItems[room] = { items: {}, note: '', images: [] };
          }
          if (!newRoomItems[room]) newRoomItems[room] = { items: {}, note: '', images: [] };
          const currentInstances = newRoomItems[room].items[itemName] || [];
          
          const masterItem = ROOM_CATEGORIES[room]?.find(i => i.name === itemName) || ROOM_CATEGORIES['안방']?.find(i => i.name === itemName);
          
          let defaultVariantName = itemName;
          let defaultUnitCbm = 0.1;

          if (masterItem) {
            const defaultVariant = masterItem.variants.find(v => v.isDefault) || masterItem.variants[1] || masterItem.variants[0];
            defaultVariantName = defaultVariant.name;
            defaultUnitCbm = defaultVariant.cbm;
          }

          const { useSettingsStore } = require('./settingsStore');
          const settings = useSettingsStore.getState();
          const materialCbmSettings = settings.materialCbmSettings;
          const overrideKey = `${itemName}|${defaultVariantName}`;

          if (itemName === '기타물품1' || itemName === '기타물품2') {
            defaultUnitCbm = materialCbmSettings[defaultVariantName] || 0;
          } else if (settings.itemCbmSettings && settings.itemCbmSettings[overrideKey] !== undefined) {
            defaultUnitCbm = settings.itemCbmSettings[overrideKey];
          } else if (itemName === '옷') {
            defaultUnitCbm = materialCbmSettings['대박스(옷)'] || 0;
          } else if (itemName === '이불') {
            defaultUnitCbm = materialCbmSettings['특대박스(이불)'] || 0;
          } else if (itemName === '생활물품/잔짐류(중박스용)') {
            defaultUnitCbm = materialCbmSettings['중박스'] || 0;
          } else if (itemName === '도서/소형물품(소박스용)') {
            defaultUnitCbm = materialCbmSettings['소박스'] || 0;
          } else if (itemName === '식기류') {
            defaultUnitCbm = materialCbmSettings['바구니'] || 0;
          } else if (itemName === '신발류(중박스용)') {
            defaultUnitCbm = materialCbmSettings['중박스'] || 0;
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
          if (room && !newRoomItems[room]) {
            newRoomItems[room] = { items: {}, note: '', images: [] };
          }
          if (!newRoomItems[room]) newRoomItems[room] = { items: {}, note: '', images: [] };
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
          if (room && !newRoomItems[room]) {
            newRoomItems[room] = { items: {}, note: '', images: [] };
          }
          if (!newRoomItems[room]) newRoomItems[room] = { items: {}, note: '', images: [] };
          const currentInstances = newRoomItems[room].items[itemName] || [];
          
          if (currentInstances.length === 0) {
             const masterItem = ROOM_CATEGORIES[room]?.find(i => i.name === itemName) || ROOM_CATEGORIES['안방']?.find(i => i.name === itemName);
             
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
          if (room && !newRoomItems[room]) {
            newRoomItems[room] = { items: {}, note: '', images: [] };
          }
          if (!newRoomItems[room]) newRoomItems[room] = { items: {}, note: '', images: [] };
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

      updateOption: (optionName, quantity, price, startDate, endDate) => {
        set((state) => {
          const newOptions = { ...state.options };
          if (quantity <= 0) {
            delete newOptions[optionName];
          } else {
            newOptions[optionName] = {
              quantity,
              totalPrice: quantity * price,
              startDate,
              endDate
            };
          }
          return { options: newOptions };
        });
      },

      setSttMemo: (memo) => set({ sttMemo: memo }),
      
      updateResources: (info) => set((state) => {
        let newMaterials = state.resources.materials;
        if (info.materials) {
          newMaterials = info.materials;
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
      setDeposit: (amount) => set({ deposit: amount }),
      setMiddlePayment: (amount) => set({ middlePayment: amount }),
      
      recalculateCbm: () => {
        const { roomItems, resources } = get();
        const { useSettingsStore } = require('./settingsStore');
        const settings = useSettingsStore.getState();
        const materialCbmSettings = settings.materialCbmSettings;
        
        const newRoomItems = JSON.parse(JSON.stringify(roomItems));
        let totalCbm = 0;
        
        Object.keys(newRoomItems).forEach(roomName => {
          const allowedNames = (settings.roomItemMapping as any)?.[roomName];
          if (!allowedNames) {
            delete newRoomItems[roomName as RoomCategory];
            return;
          }
          if (newRoomItems[roomName as RoomCategory]?.items) {
            Object.keys(newRoomItems[roomName as RoomCategory].items).forEach(itemName => {
              if (!allowedNames.includes(itemName) && !itemName.startsWith('기타 ')) {
                delete newRoomItems[roomName as RoomCategory].items[itemName];
                return;
              }
              const instances = newRoomItems[roomName as RoomCategory].items[itemName];
              instances.forEach((item: any) => {
                let cbm = item.cbm;
                const overrideKey = `${itemName}|${item.variantName}`;
                
                if (itemName === '기타물품1' || itemName === '기타물품2') {
                  cbm = (materialCbmSettings[item.variantName] || 0) * item.quantity;
                } else if (settings.itemCbmSettings && settings.itemCbmSettings[overrideKey] !== undefined) {
                  cbm = settings.itemCbmSettings[overrideKey] * item.quantity;
                } else if (itemName === '옷') {
                  cbm = (materialCbmSettings['대박스(옷)'] || 0) * item.quantity;
                } else if (itemName === '이불') {
                  cbm = (materialCbmSettings['특대박스(이불)'] || 0) * item.quantity;
                } else if (itemName === '생활물품/잔짐류(중박스용)') {
                  cbm = (materialCbmSettings['중박스'] || 0) * item.quantity;
                } else if (itemName === '도서/소형물품(소박스용)') {
                  cbm = (materialCbmSettings['소박스'] || 0) * item.quantity;
                } else if (itemName === '식기류') {
                  cbm = (materialCbmSettings['바구니'] || 0) * item.quantity;
                } else if (itemName === '신발류(중박스용)') {
                  cbm = (materialCbmSettings['중박스'] || 0) * item.quantity;
                }
                item.cbm = cbm;
                if (item.quantity > 0) {
                  item.unitCbm = cbm / item.quantity;
                }
                totalCbm += cbm;
              });
            });
          }
        });
        
        totalCbm = Math.round(totalCbm * 100) / 100;
        
        const limits = settings.vehicleCbmLimits;
        const calculated = calculateVehicles(totalCbm, limits);
        
        set({ 
          roomItems: newRoomItems,
          totalCbm, 
          calculatedVehicles: calculated,
          resources: { 
            ...resources, 
            vehicles: calculated
          } 
        });
      },

      hydrateContract: (contract: any) => {
        let rooms = [];
        try { rooms = contract.rooms_json ? JSON.parse(contract.rooms_json) : []; } catch(e){}
        let options = [];
        try { options = contract.options_json ? JSON.parse(contract.options_json) : []; } catch(e){}
        let resources: any = {};
        try { resources = contract.resources_json ? JSON.parse(contract.resources_json) : {}; } catch(e){}

        const roomItems: any = {};
        rooms.forEach((r: any) => {
          const rName = r.roomName || r.name;
          if (!rName) return;
          roomItems[rName] = { items: {}, note: r.memo || r.note || '', images: r.images || [] };
          if (r.items) {
            r.items.forEach((item: any) => {
              let itemName = item.name;
              let variantName = item.name;
              const match = item.name.match(/^(.*?) \((.*)\)$/);
              if (match) {
                 itemName = match[1].trim();
                 variantName = match[2].trim();
              }
              if (!roomItems[rName].items[itemName]) {
                 roomItems[rName].items[itemName] = [];
              }
              let cbm = item.cbm || 0;
              // Recalculate CBM on hydration to fix legacy corrupted data
              const settings = require('./settingsStore').useSettingsStore.getState();
              if (settings && settings.materialCbmSettings) {
                const overrideKey = `${itemName}|${variantName}`;
                if (itemName === '기타물품1' || itemName === '기타물품2') {
                  cbm = (settings.materialCbmSettings[variantName] || 0) * item.quantity;
                } else if (settings.itemCbmSettings && settings.itemCbmSettings[overrideKey] !== undefined) {
                  cbm = settings.itemCbmSettings[overrideKey] * item.quantity;
                } else if (itemName === '옷') cbm = (settings.materialCbmSettings['대박스(옷)'] || 0) * item.quantity;
                else if (itemName === '이불') cbm = (settings.materialCbmSettings['특대박스(이불)'] || 0) * item.quantity;
                else if (itemName === '생활물품/잔짐류(중박스용)') cbm = (settings.materialCbmSettings['중박스'] || 0) * item.quantity;
                else if (itemName === '도서/소형물품(소박스용)') cbm = (settings.materialCbmSettings['소박스'] || 0) * item.quantity;
                else if (itemName === '식기류') cbm = (settings.materialCbmSettings['바구니'] || 0) * item.quantity;
                else if (itemName === '신발류(중박스용)') cbm = (settings.materialCbmSettings['중박스'] || 0) * item.quantity;
              }

              roomItems[rName].items[itemName].push({
                id: Math.random().toString(36).substring(7),
                quantity: item.quantity,
                variantName: variantName,
                cbm: cbm,
                unitCbm: item.quantity > 0 ? cbm / item.quantity : (item.unitCbm || 0.1)
              });
            });
          }
        });

        const optionsState: Record<string, any> = {};
        options.forEach((opt: any) => {
          let baseName = opt.name;
          if (baseName.includes('보관료')) {
             if (baseName.includes('실내')) baseName = '실내보관료 (1일)';
             if (baseName.includes('컨테이너')) baseName = '컨테이너보관료 (1일)';
          } else if (baseName.includes('대기료')) {
             baseName = '대기료 (1시간 이상 지연 시)';
          } else if (baseName.includes('사다리·출발지')) {
             baseName = '사다리·출발지';
          } else if (baseName.includes('사다리·도착지')) {
             baseName = '사다리·도착지';
          }
          optionsState[baseName] = {
            quantity: opt.quantity || 1,
            price: opt.unitPrice || opt.price || opt.totalPrice || 0,
            totalPrice: opt.totalPrice || opt.price || 0,
            startDate: opt.startDate || undefined,
            endDate: opt.endDate || undefined
          };
        });

        set({
          contractId: contract.id,
          currentStep: 1,
          customerInfo: {
            name: contract.customer_name || '',
            phone: contract.customer_phone || '',
            contractDate: contract.contract_date || '',
            packingDate: contract.packing_date || '',
            movingDate: contract.moving_date || '',
            departureAddress: contract.departure_address || '',
            departureDetailAddress: contract.departure_detail_address || '',
            departureFloor: contract.departure_floor?.toString() || '',
            departureConditions: contract.departure_conditions ? contract.departure_conditions.split(',').filter(Boolean) : [],
            departureLadderCount: contract.departure_ladder_count || 1,
            arrivalAddress: contract.arrival_address || '',
            arrivalDetailAddress: contract.arrival_detail_address || '',
            arrivalFloor: contract.arrival_floor?.toString() || '',
            arrivalConditions: contract.arrival_conditions ? contract.arrival_conditions.split(',').filter(Boolean) : [],
            arrivalLadderCount: 1,
            arrivalStatus: contract.arrival_status || '',
            distanceKm: contract.distance_km || '',
            durationMin: contract.duration_min || '',
            applyDistancePrice: contract.apply_distance_price === 1,
          },
          roomItems: roomItems,
          totalCbm: contract.total_cbm || 0,
          options: optionsState,
          sttMemo: contract.stt_memo || '',
          manualBaseCost: contract.moving_cost,
          deposit: contract.deposit || 0,
          middlePayment: contract.middle_payment || 0,
          calculatedVehicles: require('./settingsStore').useSettingsStore.getState()?.vehicleCbmLimits 
            ? calculateVehicles(contract.total_cbm || 0, require('./settingsStore').useSettingsStore.getState().vehicleCbmLimits)
            : { fiveTon: 0, twoHalfTon: 0, oneTon: 0 },
          resources: {
            vehicles: resources.vehicles || { fiveTon: 0, twoHalfTon: 0, oneTon: 0 },
            materials: resources.materials || {},
            workerMale: contract.worker_count_male || 0,
            workerFemale: contract.worker_count_female || 0
          },
          discount: 0,
          surcharge: { noEvilSpirits: false, endOfMonth: false }
        });
      },
      reset: () => set({
        contractId: null,
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

