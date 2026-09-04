'use client';

import React, { useState } from 'react';
import { useWizardStore } from '@/store/wizardStore';
import { useRouter } from 'next/navigation';
import { getRouteInfo } from '@/lib/kakaoApi';
import { MapPin, Loader2 } from 'lucide-react';

export default function Step1Page() {
  const { customerInfo, updateCustomerInfo, setStep } = useWizardStore();
  const router = useRouter();
  
  const [isCalculating, setIsCalculating] = useState(false);
  const [routeError, setRouteError] = useState('');

  const calculateRoute = async () => {
    if (!customerInfo.departureAddress || !customerInfo.arrivalAddress) {
      setRouteError('출발지와 도착지 주소를 모두 입력해주세요.');
      return;
    }
    setIsCalculating(true);
    setRouteError('');
    try {
      const route = await getRouteInfo(customerInfo.departureAddress, customerInfo.arrivalAddress);
      updateCustomerInfo({
        distanceKm: route.distanceKm,
        durationMin: route.durationMin
      });
    } catch (e: any) {
      setRouteError(e.message || '거리 계산 중 오류가 발생했습니다.');
    } finally {
      setIsCalculating(false);
    }
  };

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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, ''); // 숫자만 남기기
    if (value.length > 3 && value.length <= 7) {
      value = `${value.slice(0, 3)}-${value.slice(3)}`;
    } else if (value.length > 7) {
      value = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`;
    }
    updateCustomerInfo({ phone: value });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">고객 및 기본 정보</h2>
      
      <div className="bg-white p-4 rounded-xl shadow-sm border space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">고객명</label>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                className="w-full border rounded-lg p-2.5"
                placeholder="홍길동"
                value={customerInfo.name}
                onChange={(e) => updateCustomerInfo({ name: e.target.value })}
              />
              <span className="text-gray-600 font-medium whitespace-nowrap">님</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">연락처</label>
            <input 
              type="tel" 
              maxLength={13}
              placeholder="010-0000-0000"
              className="w-full border rounded-lg p-2.5"
              value={customerInfo.phone}
              onChange={handlePhoneChange}
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
          <div className="flex flex-wrap gap-2 items-center">
            {['사다리', '계단', '승강기'].map(cond => {
              const isSelected = customerInfo.departureConditions.includes(cond);
              return (
                <div key={cond} className="flex items-center gap-2">
                  <button
                    onClick={() => handleConditionToggle('departure', cond)}
                    className={`px-4 py-2 rounded-full text-sm border ${
                      isSelected
                        ? 'bg-blue-100 border-blue-500 text-blue-700' 
                        : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}
                  >
                    {cond}
                  </button>
                  {cond === '사다리' && isSelected && (
                    <div className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1">
                      <button 
                        onClick={() => updateCustomerInfo({ departureLadderCount: Math.max(1, (customerInfo.departureLadderCount || 1) - 1) })}
                        className="w-6 h-6 flex items-center justify-center bg-white rounded-full text-gray-600 border shadow-sm hover:bg-gray-50"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">{customerInfo.departureLadderCount || 1}</span>
                      <button 
                        onClick={() => updateCustomerInfo({ departureLadderCount: (customerInfo.departureLadderCount || 1) + 1 })}
                        className="w-6 h-6 flex items-center justify-center bg-white rounded-full text-gray-600 border shadow-sm hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
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
          <div className="flex flex-wrap gap-2 items-center">
            {['사다리', '계단', '승강기'].map(cond => {
              const isSelected = customerInfo.arrivalConditions.includes(cond);
              return (
                <div key={cond} className="flex items-center gap-2">
                  <button
                    onClick={() => handleConditionToggle('arrival', cond)}
                    className={`px-4 py-2 rounded-full text-sm border ${
                      isSelected
                        ? 'bg-blue-100 border-blue-500 text-blue-700' 
                        : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}
                  >
                    {cond}
                  </button>
                  {cond === '사다리' && isSelected && (
                    <div className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1">
                      <button 
                        onClick={() => updateCustomerInfo({ arrivalLadderCount: Math.max(1, (customerInfo.arrivalLadderCount || 1) - 1) })}
                        className="w-6 h-6 flex items-center justify-center bg-white rounded-full text-gray-600 border shadow-sm hover:bg-gray-50"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">{customerInfo.arrivalLadderCount || 1}</span>
                      <button 
                        onClick={() => updateCustomerInfo({ arrivalLadderCount: (customerInfo.arrivalLadderCount || 1) + 1 })}
                        className="w-6 h-6 flex items-center justify-center bg-white rounded-full text-gray-600 border shadow-sm hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
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

      {/* 거리 계산 UI */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold flex items-center gap-2 text-gray-800">
              <MapPin size={18} className="text-blue-500" />
              이동 거리 및 소요 시간 계산
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              카카오내비 화물차(트럭) 경로 기준으로 정확한 이동 거리를 계산합니다.
            </p>
          </div>
          <button
            onClick={calculateRoute}
            disabled={isCalculating}
            className="whitespace-nowrap px-4 py-2 bg-blue-50 text-blue-700 font-bold rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isCalculating ? <Loader2 size={16} className="animate-spin" /> : null}
            {isCalculating ? '계산 중...' : '거리 계산하기'}
          </button>
        </div>
        
        {routeError && (
          <p className="mt-3 text-sm text-red-500 bg-red-50 p-2 rounded">{routeError}</p>
        )}

        {customerInfo.distanceKm && !routeError && (
          <div className="mt-4 flex gap-4 bg-gray-50 p-3 rounded-lg border">
            <div>
              <span className="block text-xs text-gray-500">예상 이동 거리</span>
              <span className="font-bold text-lg text-blue-600">{customerInfo.distanceKm} km</span>
            </div>
            <div className="w-px bg-gray-200 my-1"></div>
            <div>
              <span className="block text-xs text-gray-500">예상 소요 시간</span>
              <span className="font-bold text-lg text-gray-800">{customerInfo.durationMin} 분</span>
            </div>
          </div>
        )}
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
