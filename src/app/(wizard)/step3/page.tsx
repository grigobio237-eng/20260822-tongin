'use client';

import React, { useRef, useState } from 'react';
import { useWizardStore } from '@/store/wizardStore';
import { useRouter } from 'next/navigation';
import { OPTION_ITEMS } from '@/lib/constants/items';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import { Mic, MicOff } from 'lucide-react';
import clsx from 'clsx';

export default function Step3Page() {
  const { 
    options, updateOption, 
    sttMemo, setSttMemo, 
    resources, updateResources, updateMaterial,
    calculatedVehicles, setStep 
  } = useWizardStore();
  
  const router = useRouter();

  const handleSttResult = (text: string) => {
    setSttMemo(sttMemo ? `${sttMemo} ${text}` : text);
  };

  const { isListening, startListening, stopListening } = useSpeechToText(handleSttResult);

  const handleNext = () => {
    setStep(4);
    router.push('/step4');
  };

  const handlePrev = () => {
    setStep(2);
    router.push('/step2');
  };

  const handleOptionToggle = (optionName: string, defaultPrice: number) => {
    const isSelected = !!options[optionName];
    updateOption(optionName, isSelected ? 0 : 1);
  };

  const PACKING_MATERIALS = [
    '장농', '냉장고', '이불BOX', '中BOX', '팟도大', '쇼파', '랩', '침대',
    '분해장농', '김치냉장고大', '옷BOX', '小BOX', '팟도中', '세탁기', '에어캡',
    '5단서랍장', '김치냉장고中', '아이스BOX', '종이BOX', '담보루', '피아노', '테이프'
  ];

  return (
    <div className="space-y-8 pb-24">
      {/* 1. 옵션 선택 */}
      <section>
        <h2 className="text-xl font-bold mb-4">옵션 품목</h2>
        <div className="bg-white rounded-xl shadow-sm border p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {OPTION_ITEMS.map(opt => {
            const isSelected = !!options[opt.name];
            return (
              <label 
                key={opt.name} 
                className={clsx(
                  "flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors",
                  isSelected ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                )}
              >
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={isSelected}
                    onChange={() => handleOptionToggle(opt.name, opt.defaultPrice)}
                  />
                  <span className="font-medium text-gray-800">{opt.name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-600">
                  {opt.defaultPrice.toLocaleString()}원
                </span>
              </label>
            );
          })}
        </div>
      </section>

      {/* 2. 현장 메모 (STT) */}
      <section>
        <h2 className="text-xl font-bold mb-4">고객 협의사항 / 메모</h2>
        <div className="bg-white rounded-xl shadow-sm border p-4 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">마이크를 켜고 말씀하시면 텍스트로 변환됩니다.</span>
            <button
              onClick={isListening ? stopListening : startListening}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-colors",
                isListening 
                  ? "bg-red-100 text-red-600 hover:bg-red-200 animate-pulse" 
                  : "bg-blue-100 text-blue-600 hover:bg-blue-200"
              )}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              {isListening ? '녹음 중지' : '음성 입력'}
            </button>
          </div>
          <textarea
            className="w-full border rounded-lg p-3 min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="특이사항을 입력하거나 음성으로 입력하세요."
            value={sttMemo}
            onChange={(e) => setSttMemo(e.target.value)}
          />
        </div>
      </section>


      {/* 4. 리소스 및 포장재료 */}
      <section>
        <h2 className="text-xl font-bold mb-4">작업 인원 및 포장재료</h2>
        <div className="bg-white rounded-xl shadow-sm border p-4 space-y-6">
          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">투입 차량 (CBM 기반 추천)</label>
               <div className="flex gap-2">
                 <div className="flex-1 border rounded p-2 text-center bg-gray-50">
                    <span className="block text-xs text-gray-500">5T</span>
                    <span className="font-bold">{calculatedVehicles.fiveTon}대</span>
                 </div>
                 <div className="flex-1 border rounded p-2 text-center bg-gray-50">
                    <span className="block text-xs text-gray-500">2.5T</span>
                    <span className="font-bold">{calculatedVehicles.twoHalfTon}대</span>
                 </div>
                 <div className="flex-1 border rounded p-2 text-center bg-gray-50">
                    <span className="block text-xs text-gray-500">1T</span>
                    <span className="font-bold">{calculatedVehicles.oneTon}대</span>
                 </div>
               </div>
             </div>
             <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">작업 인원</label>
               <div className="flex gap-2">
                 <div className="flex-1 flex items-center border rounded overflow-hidden">
                   <span className="bg-gray-100 px-3 py-2 text-sm text-gray-600">남</span>
                   <input type="number" min="0" 
                     className="w-full p-2 outline-none text-center font-bold" 
                     value={resources.workerMale} 
                     onChange={e => updateResources({ workerMale: Number(e.target.value) })}
                   />
                 </div>
                 <div className="flex-1 flex items-center border rounded overflow-hidden">
                   <span className="bg-gray-100 px-3 py-2 text-sm text-gray-600">여</span>
                   <input type="number" min="0" 
                     className="w-full p-2 outline-none text-center font-bold" 
                     value={resources.workerFemale} 
                     onChange={e => updateResources({ workerFemale: Number(e.target.value) })}
                   />
                 </div>
               </div>
             </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">포장재료</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PACKING_MATERIALS.map(mat => (
                <div key={mat} className="flex items-center justify-between border rounded p-2">
                  <span className="text-sm font-medium">{mat}</span>
                  <input type="number" min="0" placeholder="0"
                    className="w-12 text-center border-b outline-none font-bold text-blue-600" 
                    value={resources.materials[mat] || ''}
                    onChange={e => updateMaterial(mat, Number(e.target.value))}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto flex justify-between gap-4">
          <button 
            onClick={handlePrev}
            className="px-6 py-3 rounded-xl font-bold border border-gray-300 bg-white text-gray-700 w-1/3"
          >
            이전
          </button>
          <button 
            onClick={handleNext}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-md w-2/3"
          >
            다음 (정산 및 서명)
          </button>
        </div>
      </div>
    </div>
  );
}
