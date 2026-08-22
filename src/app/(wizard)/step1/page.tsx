'use client';

import React from 'react';
import { useWizardStore } from '@/store/wizardStore';
import { useRouter } from 'next/navigation';

export default function Step1Page() {
  const { customerInfo, updateCustomerInfo, setStep } = useWizardStore();
  const router = useRouter();

  const handleNext = () => {
    setStep(2);
    router.push('/step2');
  };

  const handleConditionToggle = (type: 'departure' | 'arrival', condition: string) => {
    const key = type === 'departure' ? 'departureConditions' : 'arrivalConditions';
    const current = customerInfo[key];
    const updated = current.includes(condition)
      ? current.filter(c => c !== condition)
      : [...current, condition];
    
    updateCustomerInfo({ [key]: updated });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">고객 및 기본 정보</h2>
      
      <div className="bg-white p-4 rounded-xl shadow-sm border space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">고객명</label>
            <input 
              type="text" 
              className="w-full border rounded-lg p-2.5"
              value={customerInfo.name}
              onChange={(e) => updateCustomerInfo({ name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">연락처</label>
            <input 
              type="tel" 
              className="w-full border rounded-lg p-2.5"
              value={customerInfo.phone}
              onChange={(e) => updateCustomerInfo({ phone: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">견적(계약)일</label>
            <input 
              type="date" 
              className="w-full border rounded-lg p-2.5"
              value={customerInfo.contractDate}
              onChange={(e) => updateCustomerInfo({ contractDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">포장일</label>
            <input 
              type="date" 
              className="w-full border rounded-lg p-2.5"
              value={customerInfo.packingDate}
              onChange={(e) => updateCustomerInfo({ packingDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">운송일</label>
            <input 
              type="date" 
              className="w-full border rounded-lg p-2.5"
              value={customerInfo.movingDate}
              onChange={(e) => updateCustomerInfo({ movingDate: e.target.value })}
            />
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold mt-8">출/도착지 환경</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 출발지 */}
        <div className="bg-white p-4 rounded-xl shadow-sm border space-y-4">
          <h3 className="font-semibold text-blue-600">출발지</h3>
          <div>
            <input 
              type="text" 
              placeholder="주소 입력"
              className="w-full border rounded-lg p-2.5 mb-2"
              value={customerInfo.departureAddress}
              onChange={(e) => updateCustomerInfo({ departureAddress: e.target.value })}
            />
            <input 
              type="text" 
              placeholder="층수 (예: 5층)"
              className="w-full border rounded-lg p-2.5"
              value={customerInfo.departureFloor}
              onChange={(e) => updateCustomerInfo({ departureFloor: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            {['사다리', '계단', '승강기'].map(cond => (
              <button
                key={cond}
                onClick={() => handleConditionToggle('departure', cond)}
                className={`px-4 py-2 rounded-full text-sm border ${
                  customerInfo.departureConditions.includes(cond) 
                    ? 'bg-blue-100 border-blue-500 text-blue-700' 
                    : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}
              >
                {cond}
              </button>
            ))}
          </div>
        </div>

        {/* 도착지 */}
        <div className="bg-white p-4 rounded-xl shadow-sm border space-y-4">
          <h3 className="font-semibold text-blue-600">도착지</h3>
          <div>
            <input 
              type="text" 
              placeholder="주소 입력"
              className="w-full border rounded-lg p-2.5 mb-2"
              value={customerInfo.arrivalAddress}
              onChange={(e) => updateCustomerInfo({ arrivalAddress: e.target.value })}
            />
            <input 
              type="text" 
              placeholder="층수 (예: 5층)"
              className="w-full border rounded-lg p-2.5"
              value={customerInfo.arrivalFloor}
              onChange={(e) => updateCustomerInfo({ arrivalFloor: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            {['사다리', '계단', '승강기'].map(cond => (
              <button
                key={cond}
                onClick={() => handleConditionToggle('arrival', cond)}
                className={`px-4 py-2 rounded-full text-sm border ${
                  customerInfo.arrivalConditions.includes(cond) 
                    ? 'bg-blue-100 border-blue-500 text-blue-700' 
                    : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}
              >
                {cond}
              </button>
            ))}
          </div>
          <div className="pt-2 border-t mt-2">
            <label className="block text-sm font-medium mb-2 text-gray-600">도착지 상황</label>
            <div className="flex gap-2">
              {['빈집', '당일이사', '도배대기'].map(status => (
                <button
                  key={status}
                  onClick={() => updateCustomerInfo({ arrivalStatus: status })}
                  className={`px-3 py-1.5 rounded text-sm border ${
                    customerInfo.arrivalStatus === status 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : 'bg-gray-50 border-gray-200 text-gray-600'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button 
          onClick={handleNext}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg w-full md:w-auto"
        >
          다음 단계로 (물품/CBM)
        </button>
      </div>
    </div>
  );
}
