'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSettingsStore, LadderRateTier, PartnerContact, DEFAULT_LADDER_RATES } from '@/store/settingsStore';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import { OPTION_ITEMS, PACKING_MATERIALS, ROOM_ITEMS, LIVING_ROOM_ITEMS, KITCHEN_ITEMS, VERANDA_ITEMS, REAR_BALCONY_ITEMS, UTILITY_ROOM_ITEMS, MasterItem, RoomCategory, ROOM_CATEGORIES } from '@/lib/constants/items';

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
  const [localVehiclePrices, setLocalVehiclePrices] = useState(store.vehiclePrices);
  const [localVehicleCbmLimits, setLocalVehicleCbmLimits] = useState(store.vehicleCbmLimits || { fiveTon: 15, twoHalfTon: 7.5, oneTon: 3 });
  const [localDefaultPackingMaterials, setLocalDefaultPackingMaterials] = useState(store.defaultPackingMaterials || { fiveTon: {}, twoHalfTon: {}, oneTon: {} });
  const [localWorkerPrices, setLocalWorkerPrices] = useState(store.workerPrices || { male: 200000, female: 150000 });
    const [localCustomMasterItems, setLocalCustomMasterItems] = useState<MasterItem[]>([]);
  const [localCustomPackingMaterials, setLocalCustomPackingMaterials] = useState<string[]>([]);
  const sortedMasterItems = useMemo(() => {
    return [...localCustomMasterItems].sort((a, b) => {
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
  const [localDistanceRates, setLocalDistanceRates] = useState<Record<string, any>>(store.distanceRates || {});
  const [localPartnerContacts, setLocalPartnerContacts] = useState(store.partnerContacts);
  
  const formatNum = (num: number | undefined | null) => num ? num.toLocaleString() : '';
const parseNum = (str: string) => Number(str.replace(/,/g, ''));
  const [activeTab, setActiveTab] = useState<'general' | 'db' | 'roomMapping' | 'distance' | 'packing' | 'ladder'>('general');
  const [localItemCbm, setLocalItemCbm] = useState(store.itemCbmSettings || {});
  const [localItemPacking, setLocalItemPacking] = useState(store.itemPackingSettings || {});
  
  
  const handleAddMasterItem = () => {
    const name = prompt('새로운 품목명(큰 타이틀)을 입력하세요:');
    if (name) {
      setLocalCustomMasterItems(prev => [...prev, { name, variants: [] }]);
    }
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
    if (store.distanceRates) setLocalDistanceRates(store.distanceRates);
  }, [store]);

  const handleSave = async () => {
    await store.updateSettings({
      companyName: localCompanyName,
      vehiclePrices: localVehiclePrices,
      vehicleCbmLimits: localVehicleCbmLimits,
      defaultPackingMaterials: localDefaultPackingMaterials,
      workerPrices: localWorkerPrices,
      optionPrices: localOptionPrices,
      materialCbmSettings: localMaterialCbm,
      ladderRates: localLadderRates,
      partnerContacts: localPartnerContacts,
      itemCbmSettings: localItemCbm,
      itemPackingSettings: localItemPacking,
      customMasterItems: localCustomMasterItems,
      roomItemMapping: localRoomItemMapping,
      customPackingMaterials: localCustomPackingMaterials,
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
          <button onClick={() => router.back()} className="p-2 bg-white rounded-full shadow-sm border hover:bg-gray-100">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">전역 단가 및 환경 설정</h1>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-8">
          
          <div className="flex border-b">
            <button
              className={`px-6 py-3 font-bold ${activeTab === 'general' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('general')}
            >
              기본 환경 설정
            </button>
            <button
              className={`px-6 py-3 font-bold ${activeTab === 'db' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('db')}
            >
              마스터 DB 관리
            </button>
            <button
              className={`px-6 py-3 font-bold ${activeTab === 'roomMapping' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('roomMapping')}
            >
              공간별 노출 셋팅
            </button>
            <button
              className={`px-6 py-3 font-bold ${activeTab === 'distance' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('distance')}
            >
              구간 단가 DB 설정
            </button>
            <button
              className={`px-6 py-3 font-bold ${activeTab === 'ladder' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('ladder')}
            >
              사다리차 DB 설정
            </button>
            <button
              className={`px-6 py-3 font-bold ${activeTab === 'packing' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('packing')}
            >
              포장재료 DB 설정
            </button>
</div>

          {activeTab === 'general' && (
            <div className="space-y-8">
              <section>
            <h2 className="text-lg font-bold text-blue-600 mb-4 border-b pb-2">기본 정보 설정</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">회사명 (브랜드명)</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={localCompanyName} 
                    onChange={(e) => setLocalCompanyName(e.target.value)} 
                    className="w-full border rounded-lg p-3 font-bold text-gray-800"
                    placeholder="예: 통인익스프레스" 
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">견적서 상단 및 고객 전송 메시지에 표시되는 이름입니다.</p>
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
                    <input type="text" value={localVehicleCbmLimits.fiveTon} onChange={(e) => setLocalVehicleCbmLimits({ ...localVehicleCbmLimits, fiveTon: parseNum(e.target.value) })} className="w-full border rounded p-2 text-right font-bold pr-10 text-sm" />
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
                    <input type="text" value={localVehicleCbmLimits.twoHalfTon} onChange={(e) => setLocalVehicleCbmLimits({ ...localVehicleCbmLimits, twoHalfTon: parseNum(e.target.value) })} className="w-full border rounded p-2 text-right font-bold pr-10 text-sm" />
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
                    <input type="text" value={localVehicleCbmLimits.oneTon} onChange={(e) => setLocalVehicleCbmLimits({ ...localVehicleCbmLimits, oneTon: parseNum(e.target.value) })} className="w-full border rounded p-2 text-right font-bold pr-10 text-sm" />
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

          <section>
            <h2 className="text-lg font-bold text-blue-600 mb-4 border-b pb-2">일반 부대 옵션 단가</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {OPTION_ITEMS.map((item) => (
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
                    <h4 className="font-bold text-gray-800 cursor-pointer hover:text-blue-600" onClick={() => handleEditMasterItemName(item.name)} title="이름 수정하기">{item.name} ✏️</h4>
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
                            <input
                              type="text"
                              step="0.01"
                              placeholder={v.cbm.toString()}
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
                              {localCustomPackingMaterials.map(m => <option key={m} value={m}>{m}</option>)}
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
                              {localCustomPackingMaterials.map(m => <option key={m} value={m}>{m}</option>)}
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
                    <th className="px-4 py-3 border-b font-bold w-1/3 text-right pr-12">CBM (체적)</th>
                    <th className="px-4 py-3 border-b font-bold w-1/6 text-center">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {localCustomPackingMaterials.map(mat => (
                    <tr key={mat} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-800">{mat}</span>
                          <button onClick={() => handleEditPackingMaterial(mat)} className="text-gray-400 hover:text-blue-600 text-xs" title="이름 수정">✏️</button>
                        </div>
                      </td>
                      <td className="px-4 py-3 flex justify-end">
                        <div className="relative w-28">
                          <input 
                            type="text"
                            step="0.01"
                            value={localMaterialCbm[mat] ?? 0}
                            onChange={(e) => handleMaterialCbmChange(mat, parseNum(e.target.value))}
                            className="w-full border rounded px-3 py-1.5 text-right pr-10 focus:ring-1 focus:ring-blue-500 outline-none"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">CBM</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => handleDeletePackingMaterial(mat)} className="text-red-400 hover:text-white font-bold px-3 py-1 rounded hover:bg-red-500 transition-colors">삭제</button>
                      </td>
                    </tr>
                  ))}
                  {localCustomPackingMaterials.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center py-8 text-gray-500">등록된 포장재료가 없습니다.</td>
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
          <div className="space-y-8">
            <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800">
              <strong>구간별 단가 (장거리) 매트릭스 설정</strong><br/>
              거리에 따른 기본 비용(차량+인건비 포함)을 설정합니다.
            </div>

            <section>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] border-collapse bg-white border text-sm">
                  <thead>
                    <tr className="bg-gray-100 border-b">
                      <th className="p-3 text-center border-r font-semibold">구분 (기준거리)</th>
                      <th className="p-3 text-center border-r font-semibold">5톤</th>
                      <th className="p-3 text-center border-r font-semibold">6톤</th>
                      <th className="p-3 text-center border-r font-semibold">7.5톤</th>
                      <th className="p-3 text-center font-semibold">10톤</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(localDistanceRates).map(([tierKey, tier]) => (
                      <tr key={tierKey} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium text-center border-r bg-gray-50 whitespace-nowrap">{tier.label}</td>
                        {['fiveTon', 'sixTon', 'sevenHalfTon', 'tenTon'].map(cap => (
                          <td key={cap} className="p-2 border-r align-top">
                            <div className="flex flex-col gap-1">
                              <div className="flex justify-between items-center text-xs text-gray-500">
                                <span>시중가</span>
                                <input 
                                  className="w-24 text-right border p-1 rounded" 
                                  value={(tier as any)[`${cap}Market`]?.toLocaleString() || ''}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value.replace(/,/g, ''), 10) || 0;
                                    setLocalDistanceRates(prev => {
                                      const newTier = { ...prev[tierKey] };
                                      newTier[`${cap}Market`] = val;
                                      const rate = newTier[`${cap}Rate`] || 0;
                                      newTier[cap] = Math.round(val * (1 - rate / 100) / 1000) * 1000;
                                      return { ...prev, [tierKey]: newTier };
                                    });
                                  }}
                                />
                              </div>
                              <div className="flex justify-between items-center text-xs text-gray-500">
                                <span>할인율(%)</span>
                                <input 
                                  className="w-16 text-right border p-1 rounded" 
                                  value={(tier as any)[`${cap}Rate`] || ''}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value, 10) || 0;
                                    setLocalDistanceRates(prev => {
                                      const newTier = { ...prev[tierKey] };
                                      newTier[`${cap}Rate`] = val;
                                      const market = newTier[`${cap}Market`] || 0;
                                      newTier[cap] = Math.round(market * (1 - val / 100) / 1000) * 1000;
                                      return { ...prev, [tierKey]: newTier };
                                    });
                                  }}
                                />
                              </div>
                              <div className="flex justify-between items-center text-sm font-bold text-blue-600 mt-1">
                                <span>할인가</span>
                                <span>{(tier as any)[cap]?.toLocaleString() || '0'}</span>
                              </div>
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

      </div>
    </div>
      
    
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
  );
}
