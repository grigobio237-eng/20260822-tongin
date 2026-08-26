'use client';

import React, { useState } from 'react';
import { useWizardStore } from '@/store/wizardStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useRouter } from 'next/navigation';
import { OPTION_ITEMS, PACKING_MATERIALS } from '@/lib/constants/items';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import { Mic, MicOff, Edit2 } from 'lucide-react';
import clsx from 'clsx';

const getLadderTierKey = (floorStr: string) => {
  const floor = parseInt(floorStr, 10);
  if (isNaN(floor) || floor <= 5) return 'tier_2_5';
  if (floor <= 9) return 'tier_6_9';
  if (floor <= 13) return 'tier_10_13';
  if (floor <= 17) return 'tier_14_17';
  if (floor <= 20) return 'tier_18_20';
  if (floor <= 25) return 'tier_21_25';
  return 'tier_26_plus';
};

export default function Step3Page() {
  const { 
    options, updateOption, 
    sttMemo, setSttMemo, 
    resources, updateResources, updateMaterial,
    calculatedVehicles, setStep, customerInfo, totalCbm 
  } = useWizardStore();
  
  const optionPrices = useSettingsStore(state => state.optionPrices);
  const ladderRates = useSettingsStore(state => state.ladderRates);
  const router = useRouter();

  const [ladderTons, setLadderTons] = useState<{ [key: string]: 'oneTon' | 'fiveTon' | 'heavyTon' }>({
    '사다리-출발지': 'fiveTon',
    '사다리-도착지': 'fiveTon',
  });

  const [manualPrices, setManualPrices] = useState<{ [key: string]: number }>({});

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

  const getCalculatedLadderPrice = (optName: string, ton: 'oneTon' | 'fiveTon' | 'heavyTon') => {
    if (!ladderRates) return optionPrices[optName] ?? 150000;
    const type = optName === '사다리-출발지' ? 'departure' : 'arrival';
    const floorStr = type === 'departure' ? customerInfo.departureFloor : customerInfo.arrivalFloor;
    const tierKey = getLadderTierKey(floorStr);
    return ladderRates[tierKey]?.[ton] ?? 150000;
  };

  const handleOptionToggle = (optName: string) => {
    const isSelected = !!options[optName];
    
    if (isSelected) {
      updateOption(optName, 0, 0);
    } else {
      let price = optionPrices[optName] ?? 0;
      
      if (optName === '사다리-출발지' || optName === '사다리-도착지') {
        const ton = ladderTons[optName];
        price = manualPrices[optName] ?? getCalculatedLadderPrice(optName, ton);
      }
      
      updateOption(optName, 1, price);
    }
  };

  const handleLadderTonChange = (optName: string, ton: 'oneTon' | 'fiveTon' | 'heavyTon') => {
    setLadderTons(prev => ({ ...prev, [optName]: ton }));
    if (options[optName]) {
      // update price immediately if selected
      const price = manualPrices[optName] ?? getCalculatedLadderPrice(optName, ton);
      updateOption(optName, 1, price);
    }
  };

  const handleManualPriceChange = (optName: string, priceStr: string) => {
    const price = parseInt(priceStr, 10) || 0;
    setManualPrices(prev => ({ ...prev, [optName]: price }));
    if (options[optName]) {
      updateOption(optName, 1, price);
    }
  };

  const PACKING_MATERIALS = [
    '장롱', '냉장고', '이불BOX', '잔짐BOX', '책도구류', '소파', '침대', '바구니',
    '분해장롱', '김치냉장고류', '옷BOX', '신발BOX', '주방도구류', '포장필름', '에어캡',
    '5단서랍장', '김치냉장고류', '아이스BOX', '종이BOX', '골판지', '테이프', '기타'
  ];

  return (
    <div className="space-y-8 pb-24">
      {/* 1. 옵션 선택 */}
      <section>
        <h2 className="text-xl font-bold mb-4">옵션 항목</h2>
        <div className="bg-white rounded-xl shadow-sm border p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {OPTION_ITEMS.map(opt => {
            const isLadder = opt.name === '사다리-출발지' || opt.name === '사다리-도착지';
            const isSelected = !!options[opt.name];
            
            let displayPrice = optionPrices[opt.name] ?? opt.defaultPrice;
            if (isLadder) {
              displayPrice = manualPrices[opt.name] ?? getCalculatedLadderPrice(opt.name, ladderTons[opt.name]);
            }
            
            return (
              <div 
                key={opt.name} 
                className={clsx(
                  "flex flex-col p-3 border rounded-lg transition-colors",
                  isSelected ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                )}
              >
                <div className="flex items-center justify-between cursor-pointer" onClick={() => handleOptionToggle(opt.name)}>
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="font-medium text-sm">{opt.name}</span>
                  </div>
                  {!isLadder && (
                    <span className="text-sm text-gray-500 font-semibold">{displayPrice.toLocaleString()}원</span>
                  )}
                </div>

                {isLadder && isSelected && (
                  <div className="mt-3 pt-3 border-t border-blue-100 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">차량 톤수</span>
                      <select 
                        value={ladderTons[opt.name]}
                        onChange={(e) => handleLadderTonChange(opt.name, e.target.value as any)}
                        className="border rounded px-2 py-1 text-sm bg-white"
                      >
                        <option value="oneTon">1톤 (소형)</option>
                        <option value="fiveTon">5톤 (기본)</option>
                        <option value="heavyTon">6톤 이상</option>
                      </select>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">금액 (수동조정)</span>
                      <div className="flex items-center gap-1">
                        <input 
                          type="number" 
                          value={manualPrices[opt.name] ?? getCalculatedLadderPrice(opt.name, ladderTons[opt.name])}
                          onChange={(e) => handleManualPriceChange(opt.name, e.target.value)}
                          className="w-24 border rounded px-2 py-1 text-sm text-right font-bold text-blue-700"
                        />
                        <span className="text-sm text-gray-500">원</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. 현장 메모 (STT) */}
      <section>
        <h2 className="text-xl font-bold mb-4">고객 특이사항 / 메모</h2>
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
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  투입 차량 <span className="font-normal text-gray-500 text-xs ml-1">(추천: {calculatedVehicles.fiveTon}대 / {calculatedVehicles.twoHalfTon}대 / {calculatedVehicles.oneTon}대 - 총 {totalCbm} CBM)</span>
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 border rounded p-1 text-center bg-white flex flex-col items-center">
                     <span className="block text-[10px] text-gray-500 mb-1">5T</span>
                     <input 
                       type="number" 
                       min="0"
                       className="w-full text-center font-bold outline-none"
                       value={resources.vehicles.fiveTon || 0}
                       onChange={(e) => updateResources({ 
                         vehicles: { ...resources.vehicles, fiveTon: Number(e.target.value) } 
                       })}
                     />
                  </div>
                  <div className="flex-1 border rounded p-1 text-center bg-white flex flex-col items-center">
                     <span className="block text-[10px] text-gray-500 mb-1">2.5T</span>
                     <input 
                       type="number" 
                       min="0"
                       className="w-full text-center font-bold outline-none"
                       value={resources.vehicles.twoHalfTon || 0}
                       onChange={(e) => updateResources({ 
                         vehicles: { ...resources.vehicles, twoHalfTon: Number(e.target.value) } 
                       })}
                     />
                  </div>
                  <div className="flex-1 border rounded p-1 text-center bg-white flex flex-col items-center">
                     <span className="block text-[10px] text-gray-500 mb-1">1T</span>
                     <input 
                       type="number" 
                       min="0"
                       className="w-full text-center font-bold outline-none"
                       value={resources.vehicles.oneTon || 0}
                       onChange={(e) => updateResources({ 
                         vehicles: { ...resources.vehicles, oneTon: Number(e.target.value) } 
                       })}
                     />
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
                {PACKING_MATERIALS.map(mat => {
                  const val = resources.materials[mat] || 0;
                  return (
                    <div key={mat} className="flex flex-col gap-1 border rounded p-2 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-700 truncate" title={mat}>{mat}</span>
                        <div className="flex items-center gap-1 bg-white border rounded">
                          <button 
                            className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100"
                            onClick={() => updateMaterial(mat, Math.max(0, val - 1))}
                          >
                            -
                          </button>
                          <input 
                            type="number" min="0" placeholder="0"
                            className="w-8 text-center outline-none font-bold text-blue-600 text-sm" 
                            value={val || ''}
                            onChange={e => updateMaterial(mat, Number(e.target.value))}
                          />
                          <button 
                            className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100"
                            onClick={() => updateMaterial(mat, val + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      {mat === 'TV박스 (인치)' && (
                        <input 
                          type="text" 
                          placeholder="인치 입력 (예: 65, 75)"
                          className="w-full text-xs p-1 border rounded mt-1"
                          value={resources.tvBoxInches || ''}
                          onChange={e => updateResources({ tvBoxInches: e.target.value })}
                        />
                      )}
                    </div>
                  );
                })}
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
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-md w-2/3 transition-colors"
          >
            다음 (정산 및 저장)
          </button>
        </div>
      </div>
    </div>
  );
}
