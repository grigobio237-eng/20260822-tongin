'use client';

import React, { useState, useEffect } from 'react';
import { useSettingsStore, SettingsState } from '@/store/settingsStore';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Save } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const store = useSettingsStore();
  const [localVehiclePrices, setLocalVehiclePrices] = useState(store.vehiclePrices);
  const [localWorkerPrices, setLocalWorkerPrices] = useState(store.workerPrices);

  useEffect(() => {
    // Only fetch if not already loaded from persist, or just fetch to sync
    store.fetchSettings().then(() => {
      setLocalVehiclePrices(useSettingsStore.getState().vehiclePrices);
      setLocalWorkerPrices(useSettingsStore.getState().workerPrices);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    await store.updateSettings(localVehiclePrices, localWorkerPrices);
    router.back();
  };

  if (store.isLoading && localVehiclePrices.fiveTon === 0) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-32">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4 py-4">
          <button onClick={() => router.back()} className="p-2 bg-white rounded-full shadow-sm border hover:bg-gray-100">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">전역 단가 설정 (관리자)</h1>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-8">
          
          <section>
            <h2 className="text-lg font-bold text-blue-600 mb-4 border-b pb-2">차량별 단가 설정</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">5톤 차량 (기본)</label>
                <div className="relative">
                  <input 
                    type="number"
                    value={localVehiclePrices.fiveTon}
                    onChange={(e) => setLocalVehiclePrices({ ...localVehiclePrices, fiveTon: Number(e.target.value) })}
                    className="w-full border rounded-lg p-3 text-right font-bold pr-10"
                  />
                  <span className="absolute right-4 top-3 text-gray-500">원</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">2.5톤 차량</label>
                <div className="relative">
                  <input 
                    type="number"
                    value={localVehiclePrices.twoHalfTon}
                    onChange={(e) => setLocalVehiclePrices({ ...localVehiclePrices, twoHalfTon: Number(e.target.value) })}
                    className="w-full border rounded-lg p-3 text-right font-bold pr-10"
                  />
                  <span className="absolute right-4 top-3 text-gray-500">원</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">1톤 차량</label>
                <div className="relative">
                  <input 
                    type="number"
                    value={localVehiclePrices.oneTon}
                    onChange={(e) => setLocalVehiclePrices({ ...localVehiclePrices, oneTon: Number(e.target.value) })}
                    className="w-full border rounded-lg p-3 text-right font-bold pr-10"
                  />
                  <span className="absolute right-4 top-3 text-gray-500">원</span>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-blue-600 mb-4 border-b pb-2">작업 인원 인건비 설정</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">남성 (패커/기사)</label>
                <div className="relative">
                  <input 
                    type="number"
                    value={localWorkerPrices.male}
                    onChange={(e) => setLocalWorkerPrices({ ...localWorkerPrices, male: Number(e.target.value) })}
                    className="w-full border rounded-lg p-3 text-right font-bold pr-10"
                  />
                  <span className="absolute right-4 top-3 text-gray-500">원</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">여성 (주방/정리)</label>
                <div className="relative">
                  <input 
                    type="number"
                    value={localWorkerPrices.female}
                    onChange={(e) => setLocalWorkerPrices({ ...localWorkerPrices, female: Number(e.target.value) })}
                    className="w-full border rounded-lg p-3 text-right font-bold pr-10"
                  />
                  <span className="absolute right-4 top-3 text-gray-500">원</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            onClick={handleSave}
            disabled={store.isLoading}
            className="flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-xl font-bold shadow hover:bg-black transition-colors disabled:opacity-50"
          >
            {store.isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            설정 저장 및 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
