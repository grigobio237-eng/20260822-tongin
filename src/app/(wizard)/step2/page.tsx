'use client';

import React, { useState } from 'react';
import { useWizardStore } from '@/store/wizardStore';
import { ROOM_CATEGORIES, RoomCategory } from '@/lib/constants/items';
import { formatVehicleString } from '@/lib/cbm';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

export default function Step2Page() {
  const { roomItems, updateRoomItem, totalCbm, calculatedVehicles: vehicles, setStep } = useWizardStore();
  const [activeTab, setActiveTab] = useState<RoomCategory>('방 1');
  const router = useRouter();

  const handleNext = () => {
    setStep(3);
    router.push('/step3');
  };
  
  const handlePrev = () => {
    setStep(1);
    router.push('/step1');
  };

  const handleQuantity = (itemName: string, delta: number) => {
    const current = roomItems[activeTab]?.[itemName]?.quantity || 0;
    const next = Math.max(0, current + delta);
    updateRoomItem(activeTab, itemName, next);
  };

  const tabs = Object.keys(ROOM_CATEGORIES) as RoomCategory[];

  return (
    <div className="space-y-6 pb-24">
      <h2 className="text-xl font-bold">공간별 물품 체크</h2>
      
      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              "whitespace-nowrap px-4 py-2 rounded-lg font-medium text-sm transition-colors",
              activeTab === tab 
                ? "bg-blue-600 text-white shadow-sm" 
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Item Grid */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ROOM_CATEGORIES[activeTab].map((item) => {
            const qty = roomItems[activeTab]?.[item.name]?.quantity || 0;
            return (
              <div key={item.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-gray-500">기본 {item.defaultCbm} CBM</div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleQuantity(item.name, -1)}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-600 active:bg-gray-200"
                  >
                    -
                  </button>
                  <span className="w-6 text-center font-bold text-lg">{qty}</span>
                  <button 
                    onClick={() => handleQuantity(item.name, 1)}
                    className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-600 active:bg-blue-200"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 font-medium">총 부피 산출</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-blue-600">{totalCbm}</span>
              <span className="font-semibold text-gray-700">CBM</span>
            </div>
            <div className="mt-1">
              <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded font-medium border border-blue-100">
                추천 차량: {formatVehicleString(vehicles)}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handlePrev}
              className="px-4 py-3 rounded-xl font-bold border border-gray-300 bg-white text-gray-700"
            >
              이전
            </button>
            <button 
              onClick={handleNext}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-md"
            >
              다음 (옵션)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
