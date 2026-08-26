'use client';

import React, { useState, useEffect } from 'react';
import { useSettingsStore, LadderRateTier, PartnerContact, DEFAULT_LADDER_RATES } from '@/store/settingsStore';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import { OPTION_ITEMS } from '@/lib/constants/items';

export default function SettingsPage() {
  const router = useRouter();
  const store = useSettingsStore();
  
  const [localCompanyName, setLocalCompanyName] = useState(store.companyName || '통인익스프레스');
  const [localVehiclePrices, setLocalVehiclePrices] = useState(store.vehiclePrices);
  const [localWorkerPrices, setLocalWorkerPrices] = useState(store.workerPrices);
  const [localOptionPrices, setLocalOptionPrices] = useState(store.optionPrices);
  const [localLadderRates, setLocalLadderRates] = useState<Record<string, LadderRateTier>>(store.ladderRates || DEFAULT_LADDER_RATES);
  const [localPartnerContacts, setLocalPartnerContacts] = useState(store.partnerContacts);

  useEffect(() => {
    setLocalCompanyName(store.companyName || '통인익스프레스');
    setLocalVehiclePrices(store.vehiclePrices);
    setLocalWorkerPrices(store.workerPrices);
    setLocalOptionPrices(store.optionPrices);
    if (store.ladderRates) setLocalLadderRates(store.ladderRates);
    if (store.partnerContacts) setLocalPartnerContacts(store.partnerContacts);
  }, [store]);

  const handleSave = async () => {
    await store.updateSettings({
      companyName: localCompanyName,
      vehiclePrices: localVehiclePrices,
      workerPrices: localWorkerPrices,
      optionPrices: localOptionPrices,
      ladderRates: localLadderRates,
      partnerContacts: localPartnerContacts,
    });
    router.back();
  };

  const handleOptionChange = (optionName: string, value: number) => {
    setLocalOptionPrices(prev => ({
      ...prev,
      [optionName]: value
    }));
  };

  const updateLadderRate = (tierKey: string, field: 'oneTon' | 'fiveTon' | 'heavyTon', value: number) => {
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
            <h2 className="text-lg font-bold text-blue-600 mb-4 border-b pb-2">차량별 단가 설정</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">5톤 차량 (기본)</label>
                <div className="relative">
                  <input type="number" value={localVehiclePrices.fiveTon} onChange={(e) => setLocalVehiclePrices({ ...localVehiclePrices, fiveTon: Number(e.target.value) })} className="w-full border rounded-lg p-3 text-right font-bold pr-10" />
                  <span className="absolute right-4 top-3 text-gray-500">원</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">2.5톤 차량</label>
                <div className="relative">
                  <input type="number" value={localVehiclePrices.twoHalfTon} onChange={(e) => setLocalVehiclePrices({ ...localVehiclePrices, twoHalfTon: Number(e.target.value) })} className="w-full border rounded-lg p-3 text-right font-bold pr-10" />
                  <span className="absolute right-4 top-3 text-gray-500">원</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">1톤 차량</label>
                <div className="relative">
                  <input type="number" value={localVehiclePrices.oneTon} onChange={(e) => setLocalVehiclePrices({ ...localVehiclePrices, oneTon: Number(e.target.value) })} className="w-full border rounded-lg p-3 text-right font-bold pr-10" />
                  <span className="absolute right-4 top-3 text-gray-500">원</span>
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
                  <input type="number" value={localWorkerPrices.male} onChange={(e) => setLocalWorkerPrices({ ...localWorkerPrices, male: Number(e.target.value) })} className="w-full border rounded-lg p-3 text-right font-bold pr-10" />
                  <span className="absolute right-4 top-3 text-gray-500">원</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">여자 작업자 (1인당)</label>
                <div className="relative">
                  <input type="number" value={localWorkerPrices.female} onChange={(e) => setLocalWorkerPrices({ ...localWorkerPrices, female: Number(e.target.value) })} className="w-full border rounded-lg p-3 text-right font-bold pr-10" />
                  <span className="absolute right-4 top-3 text-gray-500">원</span>
                </div>
              </div>
            </div>
          </section>

          {/* 사다리차 층수/톤수별 단가 테이블 */}
          <section>
            <h2 className="text-lg font-bold text-blue-600 mb-4 border-b pb-2">사다리차 층수/톤수별 단가 매트릭스</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-sm border-y">
                    <th className="p-3 text-left w-1/4">층수 구간</th>
                    <th className="p-3 text-right">1톤 (소형)</th>
                    <th className="p-3 text-right">5톤 (기본)</th>
                    <th className="p-3 text-right">6톤 이상 (대형)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(localLadderRates).map(([key, tier]) => (
                    <tr key={key} className="border-b">
                      <td className="p-3 font-semibold text-gray-700 bg-gray-50">{tier.label}</td>
                      <td className="p-2">
                        <input type="number" className="w-full border rounded p-2 text-right" value={tier.oneTon} onChange={(e) => updateLadderRate(key, 'oneTon', Number(e.target.value))} />
                      </td>
                      <td className="p-2">
                        <input type="number" className="w-full border rounded p-2 text-right" value={tier.fiveTon} onChange={(e) => updateLadderRate(key, 'fiveTon', Number(e.target.value))} />
                      </td>
                      <td className="p-2">
                        <input type="number" className="w-full border rounded p-2 text-right" value={tier.heavyTon} onChange={(e) => updateLadderRate(key, 'heavyTon', Number(e.target.value))} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

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
                      type="number"
                      value={localOptionPrices[item.name] ?? item.defaultPrice}
                      onChange={(e) => handleOptionChange(item.name, Number(e.target.value))}
                      className="w-full border rounded p-2 text-sm text-right pr-6"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
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
  );
}
