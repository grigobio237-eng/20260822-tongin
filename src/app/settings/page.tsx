'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSettingsStore, LadderRateTier, PartnerContact, DEFAULT_LADDER_RATES, CbmWorkerTier, DEFAULT_CBM_WORKER_TIERS, StorageRates, DEFAULT_STORAGE_RATES } from '@/store/settingsStore';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { OPTION_ITEMS, PACKING_MATERIALS, ROOM_ITEMS, LIVING_ROOM_ITEMS, KITCHEN_ITEMS, VERANDA_ITEMS, REAR_BALCONY_ITEMS, UTILITY_ROOM_ITEMS, MasterItem, RoomCategory, ROOM_CATEGORIES, ItemCategory, ITEM_CATEGORIES, getDefaultItemCategory } from '@/lib/constants/items';
import {
  DISTANCE_GROUPS,
  DISTANCE_TIERS_DEF,
  DistanceRateTier,
  DEFAULT_DISTANCE_RATES,
  generateDefaultDistanceRates
} from '@/lib/constants/distanceRates';

// 모든 가전/가구 리스트 병합 (중복 제거)
const allMasterItems = [
  ...ROOM_ITEMS,
  ...LIVING_ROOM_ITEMS,
  ...KITCHEN_ITEMS,
  ...VERANDA_ITEMS,
  ...REAR_BALCONY_ITEMS,
  ...UTILITY_ROOM_ITEMS
].filter((item, index, self) => 
  index === self.findIndex((t) => t.name === item.name)
).filter(item => !['옷', '이불', '생활물품/잔짐류(중박스용)', '도서/소형물품(소박스용)', '기타물품1', '기타물품2'].includes(item.name));


export default function SettingsPage() {
  const router = useRouter();
  const store = useSettingsStore();
  
  const [localCompanyName, setLocalCompanyName] = useState(store.companyName || '통인익스프레스');
  const [localBusinessNumber, setLocalBusinessNumber] = useState(store.businessNumber || '');
  const [localRepresentativeName, setLocalRepresentativeName] = useState(store.representativeName || '김택형');
  const [localContactPhone, setLocalContactPhone] = useState(store.contactPhone || '010-4880-9424');
  const [localBankAccount, setLocalBankAccount] = useState(store.bankAccount || '신한은행 110-340-826378 (예금주: 김택형)');
  const [localVehiclePrices, setLocalVehiclePrices] = useState(store.vehiclePrices);
  const [localVehicleCbmLimits, setLocalVehicleCbmLimits] = useState(store.vehicleCbmLimits || { fiveTon: 15, twoHalfTon: 7.5, oneTon: 3 });
  const [localDefaultPackingMaterials, setLocalDefaultPackingMaterials] = useState(store.defaultPackingMaterials || { fiveTon: {}, twoHalfTon: {}, oneTon: {} });
  const [localWorkerPrices, setLocalWorkerPrices] = useState(store.workerPrices || { male: 200000, female: 150000 });
    const [localCustomMasterItems, setLocalCustomMasterItems] = useState<MasterItem[]>([]);
  const [localCustomPackingMaterials, setLocalCustomPackingMaterials] = useState<string[]>([]);
  const [localFixedPackingMaterials, setLocalFixedPackingMaterials] = useState<string[]>([]);
  const sortedMasterItems = useMemo(() => {
    return localCustomMasterItems.map(item => ({
      ...item,
      variants: [...item.variants].sort((v1, v2) => v1.name.localeCompare(v2.name, undefined, { numeric: true }))
    })).sort((a, b) => {
      if (a.name.startsWith('기타물품') && !b.name.startsWith('기타물품')) return 1;
      if (!a.name.startsWith('기타물품') && b.name.startsWith('기타물품')) return -1;
      return a.name > b.name ? 1 : a.name < b.name ? -1 : 0;
    });
  }, [localCustomMasterItems]);
  const [localRoomItemMapping, setLocalRoomItemMapping] = useState<Record<string, string[]>>({});
const [localOptionPrices, setLocalOptionPrices] = useState(store.optionPrices);
  const [localMaterialCbm, setLocalMaterialCbm] = useState(store.materialCbmSettings || {
    '특대박스(이불)': 0, '대박스(옷)': 0, '중대박스': 0, '중박스': 0, '소박스': 0, '바구니': 0, '아이스박스': 0
  });
  const isOldLadderFormat = store.ladderRates && !store.ladderRates.tier_14;
  const [localLadderRates, setLocalLadderRates] = useState<Record<string, LadderRateTier>>(isOldLadderFormat ? DEFAULT_LADDER_RATES : (store.ladderRates || DEFAULT_LADDER_RATES));
  const [localDistanceRates, setLocalDistanceRates] = useState<Record<string, DistanceRateTier>>(() => {
    if (store.distanceRates && (store.distanceRates as any).tier_30_under?.twoHalfTon_2_0 !== undefined) {
      return store.distanceRates;
    }
    return DEFAULT_DISTANCE_RATES;
  });
  const [localPartnerContacts, setLocalPartnerContacts] = useState(store.partnerContacts);
  const [localStorageRates, setLocalStorageRates] = useState<StorageRates>(store.storageRates || DEFAULT_STORAGE_RATES);

  const handleDistanceRateChange = (tierKey: string, colKey: string, value: number) => {
    setLocalDistanceRates(prev => {
      const currentTier = prev[tierKey] || DEFAULT_DISTANCE_RATES[tierKey] || { label: '' };
      const updatedTier: any = {
        ...currentTier,
        [colKey]: value,
      };

      if (colKey === 'fiveTon_3_1') updatedTier.fiveTon = value;
      if (colKey === 'sixTon_4_1') updatedTier.sixTon = value;
      if (colKey === 'sevenHalfTon_5_1') updatedTier.sevenHalfTon = value;
      if (colKey === 'tenTon_6_1') updatedTier.tenTon = value;
      if (colKey === 'twoHalfTon_2_1') updatedTier.twoHalfTon = value;
      if (colKey === 'elevenTon_6_1') updatedTier.elevenTon = value;

      return {
        ...prev,
        [tierKey]: updatedTier,
      };
    });
  };

  const handleResetDistanceRates = () => {
    if (confirm('모든 구간단가를 엑셀 표준 기본값으로 초기화하시겠습니까?')) {
      setLocalDistanceRates(generateDefaultDistanceRates());
    }
  };

  const handleAutoFillDistanceRates = () => {
    if (!confirm('첫 번째 행(30km이하)의 입력값을 기준으로, 각 구간마다 +200,000원씩 자동으로 증가시켜 전체 표를 완성하시겠습니까?')) {
      return;
    }
    setLocalDistanceRates(prev => {
      const baseTier = prev['tier_30_under'] || DEFAULT_DISTANCE_RATES['tier_30_under'];
      const updated: Record<string, DistanceRateTier> = {};

      DISTANCE_TIERS_DEF.forEach((tier, index) => {
        const stepAdd = index * 200000;
        const tierObj: any = {
          label: tier.label,
        };

        DISTANCE_GROUPS.forEach(group => {
          group.columns.forEach(col => {
            const baseVal = (baseTier as any)[col.key] || 0;
            if (col.key === 'elevenTon_7_1' || col.key === 'elevenTon_8_1') {
              tierObj[col.key] = index === 0 ? 0 : stepAdd;
            } else {
              tierObj[col.key] = baseVal + stepAdd;
            }
          });
        });

        // Aliases
        tierObj.fiveTon = tierObj.fiveTon_3_1;
        tierObj.sixTon = tierObj.sixTon_4_1;
        tierObj.sevenHalfTon = tierObj.sevenHalfTon_5_1;
        tierObj.tenTon = tierObj.tenTon_6_1;
        tierObj.twoHalfTon = tierObj.twoHalfTon_2_1;
        tierObj.elevenTon = tierObj.elevenTon_6_1;

        updated[tier.key] = tierObj;
      });

      return updated;
    });
  };
  
  const handleStorageRateChange = (type: 'container' | 'indoor', ton: 'fiveTon' | 'sixTon' | 'sevenHalfTon' | 'tenTon', value: number) => {
    setLocalStorageRates(prev => {
      const updated = {
        ...prev,
        [type]: {
          ...prev[type],
          [ton]: value
        }
      };
      if (ton === 'fiveTon') {
        const optName = type === 'container' ? '컨테이너보관료 (1일)' : '실내보관료 (1일)';
        setLocalOptionPrices(opPrev => ({ ...opPrev, [optName]: value }));
      }
      return updated;
    });
  };
  
  const formatNum = (num: number | undefined | null) => num ? num.toLocaleString() : '';
const parseNum = (str: string) => Number(str.replace(/,/g, ''));
  const [activeTab, setActiveTab] = useState<'general' | 'db' | 'roomMapping' | 'cbmWorkers' | 'distance' | 'packing' | 'ladder'>('general');
  const [localCbmWorkerTiers, setLocalCbmWorkerTiers] = useState<CbmWorkerTier[]>(store.cbmWorkerTiers || DEFAULT_CBM_WORKER_TIERS);
  const [localItemCbm, setLocalItemCbm] = useState(store.itemCbmSettings || {});
  const [localItemPacking, setLocalItemPacking] = useState(store.itemPackingSettings || {});
  
  
  const handleAddMasterItem = () => {
    const name = prompt('새로운 품목명(큰 타이틀)을 입력하세요:');
    if (name) {
      setLocalCustomMasterItems(prev => [...prev, { name, category: '가구', variants: [] }]);
    }
  };

  const handleItemCategoryChange = (itemName: string, category: ItemCategory) => {
    setLocalCustomMasterItems(prev => prev.map(i => i.name === itemName ? { ...i, category } : i));
  };

  const handleDeleteMasterItem = (itemName: string) => {
    if (confirm(`'${itemName}' 품목을 정말 삭제하시겠습니까?`)) {
      setLocalCustomMasterItems(prev => prev.filter(i => i.name !== itemName));
    }
  };

  const handleEditMasterItemName = (oldName: string) => {
    const newName = prompt('수정할 품목명을 입력하세요:', oldName);
    if (newName && newName !== oldName) {
      setLocalCustomMasterItems(prev => prev.map(i => i.name === oldName ? { ...i, name: newName } : i));
    }
  };

  const handleAddVariant = (itemName: string) => {
    const name = prompt('새로운 세부 규격(옵션명)을 입력하세요:');
    if (name) {
      setLocalCustomMasterItems(prev => prev.map(i => {
        if (i.name === itemName) {
          return { ...i, variants: [...i.variants, { name, cbm: 1 }] };
        }
        return i;
      }));
    }
  };

  const handleDeleteVariant = (itemName: string, variantName: string) => {
    if (confirm(`'${variantName}' 규격을 정말 삭제하시겠습니까?`)) {
      setLocalCustomMasterItems(prev => prev.map(i => {
        if (i.name === itemName) {
          return { ...i, variants: i.variants.filter(v => v.name !== variantName) };
        }
        return i;
      }));
    }
  };

  const handleEditVariantName = (itemName: string, oldVarName: string) => {
    const newName = prompt('수정할 세부 규격명을 입력하세요:', oldVarName);
    if (newName && newName !== oldVarName) {
      setLocalCustomMasterItems(prev => prev.map(i => {
        if (i.name === itemName) {
          return { ...i, variants: i.variants.map(v => v.name === oldVarName ? { ...v, name: newName } : v) };
        }
        return i;
      }));
    }
  };

  const handleAddPackingMaterial = () => {
    const name = prompt('추가할 포장재료 이름을 입력하세요:');
    if (name && !localCustomPackingMaterials.includes(name)) {
      setLocalCustomPackingMaterials(prev => [...prev, name]);
    }
  };
  const handleDeletePackingMaterial = (name: string) => {
    if (confirm(`'${name}' 포장재료를 삭제하시겠습니까?`)) {
      setLocalCustomPackingMaterials(prev => prev.filter(m => m !== name));
    }
  };
  const handleEditPackingMaterial = (oldName: string) => {
    const newName = prompt('수정할 이름을 입력하세요:', oldName);
    if (newName && newName !== oldName && !localCustomPackingMaterials.includes(newName)) {
      setLocalCustomPackingMaterials(prev => prev.map(m => m === oldName ? newName : m));
    }
  };

  const toggleRoomMapping = (room: string, itemName: string) => {
    setLocalRoomItemMapping(prev => {
      const current = prev[room] || [];
      const updated = current.includes(itemName) 
        ? current.filter(i => i !== itemName)
        : [...current, itemName];
      return { ...prev, [room]: updated };
    });
  };

  const [activeRoomTab, setActiveRoomTab] = useState<string>('안방');
const handleItemCbmChange = (itemName: string, variantName: string, value: string) => {
    const key = `${itemName}|${variantName}`;
    setLocalItemCbm(prev => {
      const updated = { ...prev };
      if (value === '') {
        delete updated[key];
      } else {
        updated[key] = parseFloat(value);
      }
      return updated;
    });
  };

  
  const handleItemPackingChange = (itemName: string, variantName: string, field: 'materialName' | 'count' | 'materialName2' | 'count2', value: string) => {
    const key = `${itemName}|${variantName}`;
    setLocalItemPacking(prev => {
      const updated = { ...prev };
      if (!updated[key]) updated[key] = { materialName: '', count: 0 };
      
      if (field === 'materialName' || field === 'materialName2') {
        updated[key][field] = value;
      } else {
        updated[key][field] = parseInt(value, 10) || 0;
      }
      
      if (!updated[key].materialName && !updated[key].materialName2) {
        delete updated[key];
      }
      return updated;
    });
  };

  useEffect(() => {
    setLocalCompanyName(store.companyName || '통인익스프레스');
    setLocalBusinessNumber(store.businessNumber || '');
    setLocalRepresentativeName(store.representativeName || '김택형');
    setLocalContactPhone(store.contactPhone || '010-4880-9424');
    setLocalBankAccount(store.bankAccount || '신한은행 110-340-826378 (예금주: 김택형)');
    setLocalVehiclePrices(store.vehiclePrices);
    if (store.vehicleCbmLimits) setLocalVehicleCbmLimits(store.vehicleCbmLimits);
    if (store.defaultPackingMaterials) setLocalDefaultPackingMaterials(store.defaultPackingMaterials);
    setLocalWorkerPrices(store.workerPrices);
        setLocalOptionPrices(store.optionPrices);
    if (store.customMasterItems) {
      let items = Array.from(new Map(store.customMasterItems.map(i => [i.name, i])).values());
      
      // 복구 로직: TV, 공기청정기가 없으면 기본 배열(ROOM_ITEMS 등에서 가져온 rawMasterItems)에서 찾아서 추가
      const rawMasterItems = [...ROOM_ITEMS, ...LIVING_ROOM_ITEMS, ...KITCHEN_ITEMS, ...VERANDA_ITEMS, ...REAR_BALCONY_ITEMS, ...UTILITY_ROOM_ITEMS];
      
      const missingToRestore = ['TV', '공기청정기'];
      missingToRestore.forEach(name => {
        if (!items.some(i => i.name === name)) {
          const original = rawMasterItems.find(i => i.name === name);
          if (original) items.push(original);
        }
      });
      
      setLocalCustomMasterItems(items);
    }
    if (store.roomItemMapping) setLocalRoomItemMapping(store.roomItemMapping);
    if (store.customPackingMaterials) setLocalCustomPackingMaterials(store.customPackingMaterials);
    if (store.fixedPackingMaterials) setLocalFixedPackingMaterials(store.fixedPackingMaterials);
    if (store.materialCbmSettings) setLocalMaterialCbm(store.materialCbmSettings);
    if (store.ladderRates) {
      if (!store.ladderRates.tier_14) {
        setLocalLadderRates(DEFAULT_LADDER_RATES);
      } else {
        setLocalLadderRates(store.ladderRates);
      }
    }
    if (store.partnerContacts) setLocalPartnerContacts(store.partnerContacts);
    if (store.itemCbmSettings) setLocalItemCbm(store.itemCbmSettings);
    if (store.itemPackingSettings) setLocalItemPacking(store.itemPackingSettings);
    if (store.distanceRates) {
      if ((store.distanceRates as any).tier_30_under?.twoHalfTon_2_0 !== undefined) {
        setLocalDistanceRates(store.distanceRates);
      } else {
        setLocalDistanceRates(DEFAULT_DISTANCE_RATES);
      }
    }
    if (store.cbmWorkerTiers && store.cbmWorkerTiers.length > 0) {
      setLocalCbmWorkerTiers(store.cbmWorkerTiers);
    }
    if (store.storageRates) {
      setLocalStorageRates(store.storageRates);
    }
  }, [store]);

  const handleSave = async () => {
    await store.updateSettings({
      companyName: localCompanyName,
      businessNumber: localBusinessNumber,
      representativeName: localRepresentativeName,
      contactPhone: localContactPhone,
      bankAccount: localBankAccount,
      vehiclePrices: localVehiclePrices,
      vehicleCbmLimits: localVehicleCbmLimits,
      defaultPackingMaterials: localDefaultPackingMaterials,
      workerPrices: localWorkerPrices,
      cbmWorkerTiers: localCbmWorkerTiers,
      optionPrices: localOptionPrices,
      storageRates: localStorageRates,
      materialCbmSettings: localMaterialCbm,
      ladderRates: localLadderRates,
      partnerContacts: localPartnerContacts,
      itemCbmSettings: localItemCbm,
      itemPackingSettings: localItemPacking,
      customMasterItems: localCustomMasterItems,
      roomItemMapping: localRoomItemMapping,
      customPackingMaterials: [...localCustomPackingMaterials].sort((a, b) => a.localeCompare(b)),
      fixedPackingMaterials: localFixedPackingMaterials,
      distanceRates: localDistanceRates,
    });
    router.back();
  };

  const handleOptionChange = (optionName: string, value: number) => {
    setLocalOptionPrices(prev => ({
      ...prev,
      [optionName]: value
    }));
  };

  const handleMaterialCbmChange = (materialName: string, value: number) => {
    setLocalMaterialCbm(prev => ({
      ...prev,
      [materialName]: value
    }));
  };

  const updateLadderRate = (tierKey: string, field: 'fiveTon' | 'sixTon' | 'sevenHalfTon' | 'tenTon', value: number) => {
    setLocalLadderRates(prev => ({
      ...prev,
      [tierKey]: {
        ...prev[tierKey],
        [field]: value
      }
    }));
  };

  const updatePartner = (type: 'cleaning' | 'organizing', field: keyof PartnerContact, value: string) => {
    setLocalPartnerContacts(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-32">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 py-4">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
          </button>
          <h1 className="text-2xl font-black text-gray-800">전역 단가 및 환경 설정</h1>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-8">
          
          <div className="flex flex-wrap border-b mb-6">
            <button
              className={`px-6 py-3 font-bold transition-colors ${activeTab === 'general' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('general')}
            >
              기본 환경 설정
            </button>
            <button
              className={`px-6 py-3 font-bold transition-colors ${activeTab === 'db' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('db')}
            >
              마스터 DB 관리
            </button>
            <button
              className={`px-6 py-3 font-bold transition-colors ${activeTab === 'roomMapping' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('roomMapping')}
            >
              공간별 노출 셋팅
            </button>
            <button
              className={`px-6 py-3 font-bold transition-colors ${activeTab === 'packing' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('packing')}
            >
              포장재료 DB 설정
            </button>
            <button
              className={`px-6 py-3 font-bold transition-colors ${activeTab === 'cbmWorkers' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('cbmWorkers')}
            >
              CBM별 인원 DB 설정
            </button>
            <button
              className={`px-6 py-3 font-bold transition-colors ${activeTab === 'distance' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('distance')}
            >
              구간 단가 DB 설정
            </button>
            <button
              className={`px-6 py-3 font-bold transition-colors ${activeTab === 'ladder' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('ladder')}
            >
              사다리차 DB 설정
            </button>
          </div>

          {activeTab === 'general' && (
            <div className="space-y-8">
              <section>
                <div className="flex items-center justify-between border-b pb-2 mb-4">
                  <h2 className="text-lg font-bold text-blue-600">기본 정보 및 사업자 설정</h2>
                  <span className="text-xs text-gray-500 font-medium">견적서, 계약서, 고객 안내 메시지에 적용됩니다</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/70 p-5 rounded-xl border border-gray-200">
                  {/* 회사명 (브랜드명) */}
                  <div>
                    <label className="block text-sm font-semibold mb-1.5 text-gray-800">회사명 (브랜드명)</label>
                    <input 
                      type="text" 
                      value={localCompanyName} 
                      onChange={(e) => setLocalCompanyName(e.target.value)} 
                      className="w-full border rounded-lg p-2.5 font-bold text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="예: 통인익스프레스" 
                    />
                    <p className="text-xs text-gray-500 mt-1.5">견적서 상단 타이틀 및 고객 전송 메시지에 표시되는 이름입니다.</p>
                  </div>

                  {/* 대표자명 */}
                  <div>
                    <label className="block text-sm font-semibold mb-1.5 text-gray-800">대표자명</label>
                    <input 
                      type="text" 
                      value={localRepresentativeName} 
                      onChange={(e) => setLocalRepresentativeName(e.target.value)} 
                      className="w-full border rounded-lg p-2.5 font-bold text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="예: 김택형" 
                    />
                    <p className="text-xs text-gray-500 mt-1.5">계약서 견적 담당자 및 예금주 기본 명의로 활용됩니다.</p>
                  </div>

                  {/* 사업자등록번호 */}
                  <div>
                    <label className="block text-sm font-semibold mb-1.5 text-gray-800">사업자등록번호</label>
                    <input 
                      type="text" 
                      value={localBusinessNumber} 
                      onChange={(e) => setLocalBusinessNumber(e.target.value)} 
                      className="w-full border rounded-lg p-2.5 font-medium text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="예: 123-45-67890" 
                    />
                    <p className="text-xs text-gray-500 mt-1.5">사업자등록증에 기재된 등록번호입니다.</p>
                  </div>

                  {/* 대표 전화번호 */}
                  <div>
                    <label className="block text-sm font-semibold mb-1.5 text-gray-800">대표 전화번호 (연락처)</label>
                    <input 
                      type="text" 
                      value={localContactPhone} 
                      onChange={(e) => setLocalContactPhone(e.target.value)} 
                      className="w-full border rounded-lg p-2.5 font-medium text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="예: 010-4880-9424 또는 1588-0000" 
                    />
                    <p className="text-xs text-gray-500 mt-1.5">계약서 하단 담당자 연락처 및 안내에 표기됩니다.</p>
                  </div>

                  {/* 입금 계좌번호 */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-1.5 text-gray-800">입금 계좌번호 (은행명, 계좌번호, 예금주)</label>
                    <input 
                      type="text" 
                      value={localBankAccount} 
                      onChange={(e) => setLocalBankAccount(e.target.value)} 
                      className="w-full border rounded-lg p-2.5 font-bold text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="예: 신한은행 110-340-826378 (예금주: 김택형)" 
                    />
                    <p className="text-xs text-gray-500 mt-1.5">계약서 하단 및 서명 완료 페이지의 계약금 복사 기능에 적용됩니다.</p>
                  </div>
                </div>
              </section>

          <section>
            <h2 className="text-lg font-bold text-blue-600 mb-4 border-b pb-2">차량 단가 및 적재량(CBM) 설정</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="border rounded-xl p-4 bg-gray-50 space-y-4">
                <h3 className="font-bold text-gray-800">5톤 차량 (기본)</h3>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-600">단가</label>
                  <div className="relative">
                    <input type="text" value={formatNum(localVehiclePrices.fiveTon)} onChange={(e) => setLocalVehiclePrices({ ...localVehiclePrices, fiveTon: parseNum(e.target.value) })} className="w-full border rounded p-2 text-right font-bold pr-8 text-sm" />
                    <span className="absolute right-3 top-2 text-gray-500 text-sm">원</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-600">최대 적재량</label>
                  <div className="relative">
                    <input type="number" step="0.1" value={localVehicleCbmLimits.fiveTon} onChange={(e) => setLocalVehicleCbmLimits({ ...localVehicleCbmLimits, fiveTon: parseNum(e.target.value) })} className="w-full border rounded p-2 text-right font-bold pr-10 text-sm" />
                    <span className="absolute right-3 top-2 text-gray-500 text-sm">CBM</span>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-xl p-4 bg-gray-50 space-y-4">
                <h3 className="font-bold text-gray-800">2.5톤 차량</h3>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-600">단가</label>
                  <div className="relative">
                    <input type="text" value={formatNum(localVehiclePrices.twoHalfTon)} onChange={(e) => setLocalVehiclePrices({ ...localVehiclePrices, twoHalfTon: parseNum(e.target.value) })} className="w-full border rounded p-2 text-right font-bold pr-8 text-sm" />
                    <span className="absolute right-3 top-2 text-gray-500 text-sm">원</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-600">최대 적재량</label>
                  <div className="relative">
                    <input type="number" step="0.1" value={localVehicleCbmLimits.twoHalfTon} onChange={(e) => setLocalVehicleCbmLimits({ ...localVehicleCbmLimits, twoHalfTon: parseNum(e.target.value) })} className="w-full border rounded p-2 text-right font-bold pr-10 text-sm" />
                    <span className="absolute right-3 top-2 text-gray-500 text-sm">CBM</span>
                  </div>
                </div>
              </div>

              <div className="border rounded-xl p-4 bg-gray-50 space-y-4">
                <h3 className="font-bold text-gray-800">1톤 차량</h3>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-600">단가</label>
                  <div className="relative">
                    <input type="text" value={formatNum(localVehiclePrices.oneTon)} onChange={(e) => setLocalVehiclePrices({ ...localVehiclePrices, oneTon: parseNum(e.target.value) })} className="w-full border rounded p-2 text-right font-bold pr-8 text-sm" />
                    <span className="absolute right-3 top-2 text-gray-500 text-sm">원</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-600">최대 적재량</label>
                  <div className="relative">
                    <input type="number" step="0.1" value={localVehicleCbmLimits.oneTon} onChange={(e) => setLocalVehicleCbmLimits({ ...localVehicleCbmLimits, oneTon: parseNum(e.target.value) })} className="w-full border rounded p-2 text-right font-bold pr-10 text-sm" />
                    <span className="absolute right-3 top-2 text-gray-500 text-sm">CBM</span>
                  </div>
                </div>
              </div>

            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-blue-600 mb-4 border-b pb-2">인건비 설정</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">남자 작업자 (1인당)</label>
                <div className="relative">
                  <input type="text" value={formatNum(localWorkerPrices.male)} onChange={(e) => setLocalWorkerPrices({ ...localWorkerPrices, male: parseNum(e.target.value) })} className="w-full border rounded-lg p-3 text-right font-bold pr-10" />
                  <span className="absolute right-4 top-3 text-gray-500">원</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">여자 작업자 (1인당)</label>
                <div className="relative">
                  <input type="text" value={formatNum(localWorkerPrices.female)} onChange={(e) => setLocalWorkerPrices({ ...localWorkerPrices, female: parseNum(e.target.value) })} className="w-full border rounded-lg p-3 text-right font-bold pr-10" />
                  <span className="absolute right-4 top-3 text-gray-500">원</span>
                </div>
              </div>
            </div>
          </section>

          {/* 사다리차 층수/톤수별 단가 테이블 */}
          

          {/* 부가서비스 협력업체 설정 */}
          <section>
            <h2 className="text-lg font-bold text-blue-600 mb-4 border-b pb-2">부가서비스 협력업체 설정</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-xl p-4 bg-gray-50">
                <h3 className="font-bold mb-3 text-gray-800">🧹 이사/입주 청소 업체</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-600">업체명</label>
                    <input type="text" className="w-full border rounded p-2 text-sm" value={localPartnerContacts.cleaning.companyName} onChange={e => updatePartner('cleaning', 'companyName', e.target.value)} placeholder="예: 통인크린" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-600">대표 연락처</label>
                    <input type="text" className="w-full border rounded p-2 text-sm" value={localPartnerContacts.cleaning.phone} onChange={e => updatePartner('cleaning', 'phone', e.target.value)} placeholder="010-0000-0000" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-600">담당자 및 메모</label>
                    <input type="text" className="w-full border rounded p-2 text-sm" value={localPartnerContacts.cleaning.memo} onChange={e => updatePartner('cleaning', 'memo', e.target.value)} placeholder="안내사항 등" />
                  </div>
                </div>
              </div>

              <div className="border rounded-xl p-4 bg-gray-50">
                <h3 className="font-bold mb-3 text-gray-800">📦 정리수납 도우미 업체</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-600">업체명</label>
                    <input type="text" className="w-full border rounded p-2 text-sm" value={localPartnerContacts.organizing.companyName} onChange={e => updatePartner('organizing', 'companyName', e.target.value)} placeholder="예: 정리의 달인" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-600">대표 연락처</label>
                    <input type="text" className="w-full border rounded p-2 text-sm" value={localPartnerContacts.organizing.phone} onChange={e => updatePartner('organizing', 'phone', e.target.value)} placeholder="010-0000-0000" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-600">담당자 및 메모</label>
                    <input type="text" className="w-full border rounded p-2 text-sm" value={localPartnerContacts.organizing.memo} onChange={e => updatePartner('organizing', 'memo', e.target.value)} placeholder="안내사항 등" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 보관료 톤수별 일일 단가 설정 */}
          <section className="bg-white border rounded-xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 mb-4 gap-1">
              <div>
                <h2 className="text-lg font-bold text-blue-600 flex items-center gap-2">
                  <span>📦</span> 보관료 톤수별 단가 설정 (1일 기준)
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  보관이사 시 이사 물량(차량 톤수)에 따라 1일당 보관료가 자동 차등 적용됩니다.
                </p>
              </div>
              <span className="text-[11px] bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-full border border-blue-200 self-start sm:self-auto">
                견적서 Step 3 톤수별 자동 연동
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse text-center">
                <thead>
                  <tr className="bg-gray-100/80 border-y border-gray-200 text-gray-700 font-bold text-xs">
                    <th className="py-2.5 px-3 text-left w-44">보관 구분</th>
                    <th className="py-2.5 px-3">5톤 (1일)</th>
                    <th className="py-2.5 px-3">6톤 (1일)</th>
                    <th className="py-2.5 px-3">7.5톤 (1일)</th>
                    <th className="py-2.5 px-3">10톤 (1일)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {/* 컨테이너 보관 */}
                  <tr className="hover:bg-amber-50/30 transition-colors">
                    <td className="py-3 px-3 text-left font-bold text-gray-800">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                        <span className="text-sm">컨테이너 보관</span>
                      </div>
                      <span className="text-[11px] text-gray-400 block ml-4">야외 컨테이너 (5일 단위)</span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="relative">
                        <input
                          type="text"
                          value={formatNum(localStorageRates.container.fiveTon)}
                          onChange={(e) => handleStorageRateChange('container', 'fiveTon', parseNum(e.target.value))}
                          className="w-full border rounded-lg p-2 text-right pr-7 font-bold text-gray-800 focus:ring-1 focus:ring-blue-500 bg-white"
                        />
                        <span className="absolute right-2.5 top-2.5 text-xs text-gray-400">원</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="relative">
                        <input
                          type="text"
                          value={formatNum(localStorageRates.container.sixTon)}
                          onChange={(e) => handleStorageRateChange('container', 'sixTon', parseNum(e.target.value))}
                          className="w-full border rounded-lg p-2 text-right pr-7 font-bold text-gray-800 focus:ring-1 focus:ring-blue-500 bg-white"
                        />
                        <span className="absolute right-2.5 top-2.5 text-xs text-gray-400">원</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="relative">
                        <input
                          type="text"
                          value={formatNum(localStorageRates.container.sevenHalfTon)}
                          onChange={(e) => handleStorageRateChange('container', 'sevenHalfTon', parseNum(e.target.value))}
                          className="w-full border rounded-lg p-2 text-right pr-7 font-bold text-gray-800 focus:ring-1 focus:ring-blue-500 bg-white"
                        />
                        <span className="absolute right-2.5 top-2.5 text-xs text-gray-400">원</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="relative">
                        <input
                          type="text"
                          value={formatNum(localStorageRates.container.tenTon)}
                          onChange={(e) => handleStorageRateChange('container', 'tenTon', parseNum(e.target.value))}
                          className="w-full border rounded-lg p-2 text-right pr-7 font-bold text-gray-800 focus:ring-1 focus:ring-blue-500 bg-white"
                        />
                        <span className="absolute right-2.5 top-2.5 text-xs text-gray-400">원</span>
                      </div>
                    </td>
                  </tr>

                  {/* 실내 보관 */}
                  <tr className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3 px-3 text-left font-bold text-gray-800">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                        <span className="text-sm">실내 보관</span>
                      </div>
                      <span className="text-[11px] text-gray-400 block ml-4">항온·항습 실내창고</span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="relative">
                        <input
                          type="text"
                          value={formatNum(localStorageRates.indoor.fiveTon)}
                          onChange={(e) => handleStorageRateChange('indoor', 'fiveTon', parseNum(e.target.value))}
                          className="w-full border rounded-lg p-2 text-right pr-7 font-bold text-gray-800 focus:ring-1 focus:ring-blue-500 bg-white"
                        />
                        <span className="absolute right-2.5 top-2.5 text-xs text-gray-400">원</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="relative">
                        <input
                          type="text"
                          value={formatNum(localStorageRates.indoor.sixTon)}
                          onChange={(e) => handleStorageRateChange('indoor', 'sixTon', parseNum(e.target.value))}
                          className="w-full border rounded-lg p-2 text-right pr-7 font-bold text-gray-800 focus:ring-1 focus:ring-blue-500 bg-white"
                        />
                        <span className="absolute right-2.5 top-2.5 text-xs text-gray-400">원</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="relative">
                        <input
                          type="text"
                          value={formatNum(localStorageRates.indoor.sevenHalfTon)}
                          onChange={(e) => handleStorageRateChange('indoor', 'sevenHalfTon', parseNum(e.target.value))}
                          className="w-full border rounded-lg p-2 text-right pr-7 font-bold text-gray-800 focus:ring-1 focus:ring-blue-500 bg-white"
                        />
                        <span className="absolute right-2.5 top-2.5 text-xs text-gray-400">원</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="relative">
                        <input
                          type="text"
                          value={formatNum(localStorageRates.indoor.tenTon)}
                          onChange={(e) => handleStorageRateChange('indoor', 'tenTon', parseNum(e.target.value))}
                          className="w-full border rounded-lg p-2 text-right pr-7 font-bold text-gray-800 focus:ring-1 focus:ring-blue-500 bg-white"
                        />
                        <span className="absolute right-2.5 top-2.5 text-xs text-gray-400">원</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-blue-600 mb-4 border-b pb-2">일반 부대 옵션 단가</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {OPTION_ITEMS.filter(item => !item.name.includes('보관료')).map((item) => (
                <div key={item.name} className="flex flex-col">
                  <label className="block text-xs font-semibold mb-1 text-gray-600 truncate" title={item.name}>{item.name}</label>
                  <div className="relative">
                    <input 
                      type="text"
                      value={formatNum(localOptionPrices[item.name] ?? item.defaultPrice)}
                      onChange={(e) => handleOptionChange(item.name, parseNum(e.target.value))}
                      className="w-full border rounded p-2 text-sm text-right pr-6"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          
        </div>
        )}

        {activeTab === 'db' && (
          <div className="space-y-8">
            <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800">
              <strong>가전/가구 CBM (체적) 설정</strong><br/>
              프로그램에 하드코딩된 기본 권장 CBM을 덮어씁니다. 빈칸으로 두면 원래의 기본 권장 수치가 적용됩니다.
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {sortedMasterItems.map(item => (
                <div key={item.name} className="border rounded-xl p-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-3 border-b pb-2">
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-gray-800 cursor-pointer hover:text-blue-600" onClick={() => handleEditMasterItemName(item.name)} title="이름 수정하기">{item.name} ✏️</h4>
                      <select
                        value={item.category || getDefaultItemCategory(item.name)}
                        onChange={(e) => handleItemCategoryChange(item.name, e.target.value as ItemCategory)}
                        className="text-xs border border-gray-300 rounded px-2 py-1 bg-white font-medium text-gray-700 shadow-sm focus:ring-1 focus:ring-blue-500 outline-none"
                      >
                        {ITEM_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <button onClick={() => handleDeleteMasterItem(item.name)} className="text-red-500 text-xs px-2 py-1 border border-red-200 rounded hover:bg-red-50">삭제</button>
                  </div>
                  <div className="space-y-2">
                    {item.variants.map(v => {
                      const key = `${item.name}|${v.name}`;
                      const customVal = localItemCbm[key];
                      return (
                        <div key={v.name} className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-1 flex-1 min-w-0 pr-2">
                            <span className="text-gray-600 cursor-pointer hover:text-blue-600 truncate" onClick={() => handleEditVariantName(item.name, v.name)} title="규격명 수정">{v.name}</span>
                            <button onClick={() => handleDeleteVariant(item.name, v.name)} className="text-gray-400 hover:text-red-500 text-xs shrink-0">✕</button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 w-16 text-right">기본: {v.cbm}</span>
                            <input type="number" step="0.01" placeholder={v.cbm.toString()}
                              value={customVal !== undefined ? customVal : ''}
                              onChange={(e) => handleItemCbmChange(item.name, v.name, e.target.value)}
                              className="border rounded px-2 py-1 w-16 text-right focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                            />
                            <span className="text-gray-500 w-8 text-xs">CBM</span>
                            <div className="w-px h-6 bg-gray-200 mx-1"></div>
                            <select
                              value={localItemPacking[key]?.materialName || ''}
                              onChange={(e) => handleItemPackingChange(item.name, v.name, 'materialName', e.target.value)}
                              className="border rounded px-1 py-1 w-24 text-xs bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                            >
                              <option value="">재료선택</option>
                              {[...localCustomPackingMaterials].sort((a, b) => a.localeCompare(b)).map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                            <input
                              type="text"
                              placeholder="수량"
                              value={localItemPacking[key]?.count || ''}
                              onChange={(e) => handleItemPackingChange(item.name, v.name, 'count', e.target.value)}
                              className="border rounded px-2 py-1 w-12 text-right focus:ring-1 focus:ring-blue-500 outline-none bg-white text-xs"
                            />
                            <div className="w-px h-6 bg-gray-200 mx-1"></div>
                            <select
                              value={localItemPacking[key]?.materialName2 || ''}
                              onChange={(e) => handleItemPackingChange(item.name, v.name, 'materialName2', e.target.value)}
                              className="border rounded px-1 py-1 w-24 text-xs bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                            >
                              <option value="">재료선택2</option>
                              {[...localCustomPackingMaterials].sort((a, b) => a.localeCompare(b)).map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                            <input
                              type="text"
                              placeholder="수량"
                              value={localItemPacking[key]?.count2 || ''}
                              onChange={(e) => handleItemPackingChange(item.name, v.name, 'count2', e.target.value)}
                              className="border rounded px-2 py-1 w-12 text-right focus:ring-1 focus:ring-blue-500 outline-none bg-white text-xs"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 text-center">
                    <button onClick={() => handleAddVariant(item.name)} className="text-xs text-blue-600 hover:underline border border-blue-200 rounded px-3 py-1 bg-blue-50">+ 세부 항목 추가</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-6">
              <button onClick={handleAddMasterItem} className="px-6 py-3 bg-blue-100 text-blue-700 font-bold rounded-lg hover:bg-blue-200 shadow-sm">+ 새로운 큰 타이틀(품목) 추가하기</button>
            </div>
          </div>

        )}

        {activeTab === 'roomMapping' && (
          <div className="space-y-8">
            <div className="bg-green-50 p-4 rounded-xl text-sm text-green-800">
              <strong>공간별 노출 셋팅</strong><br/>
              각 방(공간)에 어떤 물품들이 나타날지 설정합니다. 불필요한 항목은 체크 해제하면 스텝 2 화면에서 숨겨집니다.
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {Object.keys(ROOM_CATEGORIES).map(room => (
                <button
                  key={room}
                  onClick={() => setActiveRoomTab(room)}
                  className={`px-4 py-2 rounded-full text-sm font-bold ${activeRoomTab === room ? 'bg-green-600 text-white shadow-md' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}
                >
                  {room}
                </button>
              ))}
            </div>

            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <h3 className="font-bold text-lg mb-4 pb-2 border-b">{activeRoomTab} 노출 항목</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {sortedMasterItems.map(item => {
                  const isChecked = (localRoomItemMapping[activeRoomTab] || []).includes(item.name);
                  return (
                    <label key={item.name} className={`flex items-center gap-2 p-2 rounded cursor-pointer border transition-colors ${isChecked ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-transparent hover:bg-gray-100'}`}>
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={() => toggleRoomMapping(activeRoomTab, item.name)}
                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                      />
                      <span className={`text-sm ${isChecked ? 'font-bold text-green-800' : 'text-gray-500'}`}>{item.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'packing' && (
          <div className="space-y-6">
            <div className="bg-yellow-50 p-4 rounded-xl text-sm text-yellow-800">
              <strong>포장재료 통합 관리</strong><br/>
              이곳에 등록된 모든 포장재료는 마스터 DB와 연동됩니다. 포장재료 이름 및 CBM을 리스트(엑셀 형식)로 한눈에 관리하세요.
            </div>

            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 border-b font-bold w-1/2">포장재료 이름</th>
                    <th className="px-4 py-3 border-b font-bold w-1/4 text-right pr-12">CBM (체적)</th>
                    <th className="px-4 py-3 border-b font-bold w-1/6 text-center" title="작업지시서 및 요약본의 포장재료 목록에 수량과 상관없이 항상 노출됩니다">상단 고정</th>
                    <th className="px-4 py-3 border-b font-bold w-1/6 text-center">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[...localCustomPackingMaterials].sort((a, b) => a.localeCompare(b)).map(mat => (
                    <tr key={mat} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-800">{mat}</span>
                          <button onClick={() => handleEditPackingMaterial(mat)} className="text-gray-400 hover:text-blue-600 text-xs" title="이름 수정">✏️</button>
                        </div>
                      </td>
                      <td className="px-4 py-3 flex justify-end">
                        <div className="relative w-28">
                          <input type="number" step="0.01" value={localMaterialCbm[mat] ?? 0}
                            onChange={(e) => handleMaterialCbmChange(mat, parseNum(e.target.value))}
                            className="w-full border rounded px-3 py-1.5 text-right pr-10 focus:ring-1 focus:ring-blue-500 outline-none"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">CBM</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={localFixedPackingMaterials.includes(mat)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setLocalFixedPackingMaterials(prev => [...prev, mat]);
                            } else {
                              setLocalFixedPackingMaterials(prev => prev.filter(m => m !== mat));
                            }
                          }}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => handleDeletePackingMaterial(mat)} className="text-red-400 hover:text-white font-bold px-3 py-1 rounded hover:bg-red-500 transition-colors">삭제</button>
                      </td>
                    </tr>
                  ))}
                  {localCustomPackingMaterials.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-gray-500">등록된 포장재료가 없습니다.</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="p-4 bg-gray-50 border-t flex justify-center">
                <button onClick={handleAddPackingMaterial} className="flex items-center gap-2 bg-blue-100 text-blue-700 rounded-lg px-6 py-2.5 hover:bg-blue-200 font-bold shadow-sm transition-colors">
                  + 새로운 포장재료 추가
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'distance' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-white border border-blue-200 p-5 rounded-2xl shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span className="text-xl">🛣️</span>
                    <span>구간 단가 DB 설정 (차량 톤수 & 투입 인원별 표준 엑셀 단가표)</span>
                  </h2>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    거리 구간별 차량 톤수 및 세부 작업 인원(남+여)에 따른 표준 견적 단가를 엑셀 표 형식으로 직접 조회 및 수정합니다.
                    <br />
                    <span className="text-blue-700 font-semibold">※ 인원 표기 안내: </span>
                    <span className="bg-white px-1.5 py-0.5 rounded border border-blue-200 text-blue-800 font-semibold mr-1">2+1</span> 총 3명 (남2 여1),&nbsp;
                    <span className="bg-white px-1.5 py-0.5 rounded border border-blue-200 text-blue-800 font-semibold mr-1">3+1</span> 총 4명 (남3 여1),&nbsp;
                    <span className="bg-white px-1.5 py-0.5 rounded border border-blue-200 text-blue-800 font-semibold mr-1">4+1</span> 총 5명 (남4 여1),&nbsp;
                    <span className="bg-white px-1.5 py-0.5 rounded border border-blue-200 text-blue-800 font-semibold mr-1">5+1</span> 총 6명 (남5 여1),&nbsp;
                    <span className="bg-white px-1.5 py-0.5 rounded border border-blue-200 text-blue-800 font-semibold mr-1">5+2 / 6+1</span> 총 7명
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <button
                    type="button"
                    onClick={handleAutoFillDistanceRates}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-lg hover:bg-emerald-100 font-bold text-xs transition-colors shadow-xs"
                    title="첫 번째 행(30km이하) 가격을 기준으로 아래 16개 구간을 20만원씩 자동 증가시킵니다"
                  >
                    <span>⚡ 30km 기준 +20만/구간 자동완성</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetDistanceRates}
                    className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 font-bold text-xs transition-colors"
                  >
                    <span>🔄 엑셀 표준값 복원</span>
                  </button>
                </div>
              </div>
            </div>

            <section className="bg-white border rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto max-h-[720px] overflow-y-auto">
                <table className="w-full text-xs border-collapse">
                  <thead className="sticky top-0 z-30 shadow-xs">
                    {/* Row 1: Tonnage Headers */}
                    <tr className="border-b border-gray-300">
                      <th
                        rowSpan={2}
                        style={{ backgroundColor: '#1e293b', color: '#ffffff' }}
                        className="sticky left-0 top-0 z-40 font-bold text-center px-4 py-3 min-w-[130px] border-r border-slate-700 shadow-[2px_0_5px_-1px_rgba(0,0,0,0.2)]"
                      >
                        구분(기준거리)
                      </th>
                      {DISTANCE_GROUPS.map(group => (
                        <th
                          key={group.tonnage}
                          colSpan={group.columns.length}
                          style={{ backgroundColor: group.headerColor, color: '#ffffff' }}
                          className="text-center font-bold px-3 py-2.5 border-r border-white/20 tracking-wider text-xs shadow-xs"
                        >
                          {group.tonnage}
                        </th>
                      ))}
                    </tr>

                    {/* Row 2: Worker Sub-headers */}
                    <tr className="border-b border-gray-300">
                      {DISTANCE_GROUPS.map(group =>
                        group.columns.map(col => (
                          <th
                            key={col.key}
                            style={{ backgroundColor: group.subHeaderColor, color: '#ffffff' }}
                            className="text-center px-2 py-2 border-r border-white/10 min-w-[105px]"
                          >
                            <div className="font-extrabold text-xs text-white">{col.subHeader}</div>
                            <div className="text-[10px] text-white/90 font-medium mt-0.5">{col.description}</div>
                          </th>
                        ))
                      )}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200 bg-white">
                    {DISTANCE_TIERS_DEF.map((tier, idx) => {
                      const tierData = localDistanceRates[tier.key] || DEFAULT_DISTANCE_RATES[tier.key] || {};
                      const isEven = idx % 2 === 0;

                      return (
                        <tr
                          key={tier.key}
                          className={clsx(
                            "hover:bg-blue-50/50 transition-colors",
                            isEven ? "bg-white" : "bg-slate-50/50"
                          )}
                        >
                          <td className="sticky left-0 z-20 bg-slate-100 font-bold text-slate-800 text-center px-3 py-2 border-r border-slate-300 whitespace-nowrap shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                            {tier.label}
                          </td>

                          {DISTANCE_GROUPS.map(group =>
                            group.columns.map(col => {
                              const rawVal = tierData[col.key] ?? 0;
                              return (
                                <td key={col.key} className="p-1 border-r border-gray-200 text-right">
                                  <input
                                    type="text"
                                    value={rawVal ? formatNum(rawVal) : ''}
                                    placeholder="0"
                                    onChange={(e) => handleDistanceRateChange(tier.key, col.key, parseNum(e.target.value))}
                                    className="w-full border border-gray-200 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-400 rounded px-2 py-1.5 text-right font-medium text-xs text-gray-800 bg-white"
                                  />
                                </td>
                              );
                            })
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}


        {activeTab === 'cbmWorkers' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-sm text-blue-900 leading-relaxed">
              <div className="font-bold flex items-center gap-1.5 mb-1">
                <span>📋 CBM 구간별 기본 투입 인원 DB 설정</span>
              </div>
              <p className="text-xs text-blue-700">
                총 CBM 규모에 따라 스텝3에 기본 추천되는 <strong>남자/여자 작업인원</strong>을 셋팅합니다.
                <br />
                기본 20 CBM부터 5 CBM 단위로 구간이 구분되어 있으며, 구간 범위를 수정하거나 행을 추가/삭제할 수 있습니다.
              </p>
            </div>

            <div className="bg-white border rounded-xl overflow-hidden shadow-xs">
              <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-800 text-base">CBM 구간별 인원 매트릭스</h3>
                  <p className="text-xs text-gray-500 mt-0.5">최소 CBM 이상 ~ 최대 CBM 미만 기준 (마지막 행은 이상 기준)</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const last = localCbmWorkerTiers[localCbmWorkerTiers.length - 1];
                    const nextMin = last ? (last.maxCbm === 999 ? last.minCbm + 5 : last.maxCbm) : 20;
                    const nextMax = nextMin + 5;
                    const newTier: CbmWorkerTier = {
                      id: `tier_${Date.now()}`,
                      minCbm: nextMin,
                      maxCbm: nextMax,
                      male: last ? last.male : 3,
                      female: last ? last.female : 1,
                      memo: `${nextMin}~${nextMax} CBM`
                    };
                    setLocalCbmWorkerTiers(prev => [...prev, newTier]);
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>구간 추가</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 border-b text-xs font-semibold">
                      <th className="p-3 text-center w-14">순번</th>
                      <th className="p-3 text-center w-36">최소 CBM</th>
                      <th className="p-3 text-center w-36">최대 CBM</th>
                      <th className="p-3 text-center w-28">남성 인원</th>
                      <th className="p-3 text-center w-28">여성 인원</th>
                      <th className="p-3 text-center w-24">합계</th>
                      <th className="p-3 text-left">참고/메모</th>
                      <th className="p-3 text-center w-16">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {localCbmWorkerTiers.map((tier, idx) => (
                      <tr key={tier.id || idx} className="hover:bg-blue-50/30 transition-colors">
                        <td className="p-3 text-center text-xs font-bold text-gray-400">
                          {idx + 1}
                        </td>
                        <td className="p-2 text-center">
                          <div className="inline-flex items-center gap-1">
                            <input
                              type="number"
                              step="1"
                              min="0"
                              value={tier.minCbm}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setLocalCbmWorkerTiers(prev => prev.map((t, i) => i === idx ? { ...t, minCbm: val } : t));
                              }}
                              className="w-20 border rounded p-1.5 text-center font-bold text-gray-800 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                            <span className="text-xs text-gray-500 font-medium">CBM</span>
                          </div>
                        </td>
                        <td className="p-2 text-center">
                          <div className="inline-flex items-center gap-1">
                            <input
                              type="number"
                              step="1"
                              min="0"
                              value={tier.maxCbm}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setLocalCbmWorkerTiers(prev => prev.map((t, i) => i === idx ? { ...t, maxCbm: val } : t));
                              }}
                              className="w-20 border rounded p-1.5 text-center font-bold text-gray-800 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                            <span className="text-xs text-gray-500 font-medium">{tier.maxCbm >= 999 ? '이상' : 'CBM'}</span>
                          </div>
                        </td>
                        <td className="p-2 text-center">
                          <div className="inline-flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              value={tier.male}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 0;
                                setLocalCbmWorkerTiers(prev => prev.map((t, i) => i === idx ? { ...t, male: val } : t));
                              }}
                              className="w-16 border rounded p-1.5 text-center font-black text-blue-700 text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-blue-50/40"
                            />
                            <span className="text-xs text-gray-600 font-semibold">명</span>
                          </div>
                        </td>
                        <td className="p-2 text-center">
                          <div className="inline-flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              value={tier.female}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 0;
                                setLocalCbmWorkerTiers(prev => prev.map((t, i) => i === idx ? { ...t, female: val } : t));
                              }}
                              className="w-16 border rounded p-1.5 text-center font-black text-rose-700 text-sm focus:ring-1 focus:ring-rose-500 outline-none bg-rose-50/40"
                            />
                            <span className="text-xs text-gray-600 font-semibold">명</span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold text-xs">
                            총 {tier.male + tier.female}명
                          </span>
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={tier.memo || ''}
                            placeholder="예: 5톤 기본 / 6톤"
                            onChange={(e) => {
                              const val = e.target.value;
                              setLocalCbmWorkerTiers(prev => prev.map((t, i) => i === idx ? { ...t, memo: val } : t));
                            }}
                            className="w-full border rounded p-1.5 text-xs text-gray-700 focus:ring-1 focus:ring-blue-500 outline-none"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              if (localCbmWorkerTiers.length <= 1) {
                                alert('최소 1개 이상의 구간이 필요합니다.');
                                return;
                              }
                              setLocalCbmWorkerTiers(prev => prev.filter((_, i) => i !== idx));
                            }}
                            className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors"
                            title="구간 삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-gray-50 border-t flex justify-between items-center text-xs text-gray-500">
                <span>* 견적 작성 시 스텝2에서 계산된 총 CBM에 해당하는 구간의 작업인원이 스텝3에 기본 추천됩니다.</span>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('CBM별 기본 인원 설정을 초기 기본값으로 재설정하시겠습니까?')) {
                      setLocalCbmWorkerTiers(DEFAULT_CBM_WORKER_TIERS);
                    }
                  }}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  기본값 복원
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ladder' && (
          <div className="space-y-8">
            <div className="bg-indigo-50 p-4 rounded-xl text-sm text-indigo-800">
              <strong>사다리차 DB 설정</strong><br/>
              사다리차의 층수 및 톤수별 단가를 설정합니다.
            </div>
            <section>
            <h2 className="text-lg font-bold text-blue-600 mb-4 border-b pb-2">사다리차 층수/톤수별 단가 매트릭스</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-sm border-y">
                    <th className="p-3 text-left w-1/5">층수 구간</th>
                    <th className="p-3 text-right w-1/5">5톤</th>
                    <th className="p-3 text-right w-1/5">6톤</th>
                    <th className="p-3 text-right w-1/5">7.5톤</th>
                    <th className="p-3 text-right w-1/5">10톤</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(localLadderRates).map(([key, tier]) => (
                    <tr key={key} className="border-b">
                      <td className="p-3 font-semibold text-gray-700 bg-gray-50">{tier.label}</td>
                      <td className="p-2">
                        <input type="text" placeholder="협의" className="w-full border rounded p-2 text-right focus:ring-1 focus:ring-blue-500 outline-none" 
                          value={(tier.fiveTon || 0) === 0 ? '' : (tier.fiveTon || 0).toLocaleString()} 
                          onChange={(e) => {
                            const valStr = e.target.value.replace(/,/g, '');
                            const parsed = parseInt(valStr, 10);
                            updateLadderRate(key, 'fiveTon', isNaN(parsed) ? 0 : parsed);
                          }} 
                        />
                      </td>
                      <td className="p-2">
                        <input type="text" placeholder="협의" className="w-full border rounded p-2 text-right focus:ring-1 focus:ring-blue-500 outline-none" 
                          value={(tier.sixTon || 0) === 0 ? '' : (tier.sixTon || 0).toLocaleString()} 
                          onChange={(e) => {
                            const valStr = e.target.value.replace(/,/g, '');
                            const parsed = parseInt(valStr, 10);
                            updateLadderRate(key, 'sixTon', isNaN(parsed) ? 0 : parsed);
                          }} 
                        />
                      </td>
                      <td className="p-2">
                        <input type="text" placeholder="협의" className="w-full border rounded p-2 text-right focus:ring-1 focus:ring-blue-500 outline-none" 
                          value={(tier.sevenHalfTon || 0) === 0 ? '' : (tier.sevenHalfTon || 0).toLocaleString()} 
                          onChange={(e) => {
                            const valStr = e.target.value.replace(/,/g, '');
                            const parsed = parseInt(valStr, 10);
                            updateLadderRate(key, 'sevenHalfTon', isNaN(parsed) ? 0 : parsed);
                          }} 
                        />
                      </td>
                      <td className="p-2">
                        <input type="text" placeholder="협의" className="w-full border rounded p-2 text-right focus:ring-1 focus:ring-blue-500 outline-none" 
                          value={(tier.tenTon || 0) === 0 ? '' : (tier.tenTon || 0).toLocaleString()} 
                          onChange={(e) => {
                            const valStr = e.target.value.replace(/,/g, '');
                            const parsed = parseInt(valStr, 10);
                            updateLadderRate(key, 'tenTon', isNaN(parsed) ? 0 : parsed);
                          }} 
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          </div>
        )}

        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="max-w-4xl mx-auto">
            <button 
              onClick={handleSave}
              disabled={store.isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
            >
              {store.isLoading ? <Loader2 className="animate-spin" /> : <Save />}
              {store.isLoading ? '저장 중...' : '설정 저장하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
