'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useWizardStore } from '@/store/wizardStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useRouter } from 'next/navigation';
import { OPTION_ITEMS, PACKING_MATERIALS } from '@/lib/constants/items';
import { calculateVehicles } from '@/lib/cbm';
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
    setStep, customerInfo, totalCbm, roomItems 
  } = useWizardStore();
  
  const optionPrices = useSettingsStore(state => state.optionPrices);
  const ladderRates = useSettingsStore(state => state.ladderRates);
  const vehicleLimits = useSettingsStore(state => state.vehicleCbmLimits);
  const router = useRouter();

  const recommendedVehicles = useMemo(() => calculateVehicles(totalCbm, vehicleLimits), [totalCbm, vehicleLimits]);

  const [ladderTons, setLadderTons] = useState<{ [key: string]: 'oneTon' | 'fiveTon' | 'heavyTon' }>({
    '사다리-출발지': 'fiveTon',
    '사다리-도착지': 'fiveTon',
  });

  const [manualPrices, setManualPrices] = useState<{ [key: string]: number }>({});

  const handleSttResult = React.useCallback((text: string) => {
    const currentMemo = useWizardStore.getState().sttMemo;
    useWizardStore.getState().setSttMemo(currentMemo ? `${currentMemo} ${text}` : text);
  }, []);

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

  const handleOptionToggle = (opt: any) => {
    const optName = opt.name;
    const isSelected = !!options[optName];
    
    if (isSelected) {
      updateOption(optName, 0, 0);
    } else {
      let price = optionPrices[optName] ?? opt.defaultPrice ?? 0;
      
      if (optName === '사다리·출발지' || optName === '사다리·도착지') {
        const ton = ladderTons[optName];
        price = manualPrices[optName] ?? getCalculatedLadderPrice(optName, ton);
      }
      
      let initialDays = 1;
      let startDate = '';
      let endDate = '';
      
      if (opt.isPerDay) {
         startDate = customerInfo.packingDate || '';
         endDate = customerInfo.movingDate || '';
         if (startDate && endDate) {
           const diffTime = new Date(endDate).getTime() - new Date(startDate).getTime();
           const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
           if (diffDays >= 0) initialDays = Math.max(1, diffDays);
         }
      }
      
      updateOption(optName, initialDays, price, startDate, endDate);
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

  

  // 동적 포장재료 연동 (TV, 대형가전/가구 등)
  useEffect(() => {
    let tv50 = 0, tv65 = 0, tv85 = 0;
    let bed = 0, drawer = 0, fridge = 0, kimchiL = 0, kimchiM = 0, washer = 0, dryer = 0;
    let sofa = 0, piano = 0, wardrobe = 0;
    let clothes = 0, blankets = 0;

    Object.values(roomItems).forEach(room => {
      // TV
      if (room.items['TV']) {
        room.items['TV'].forEach(inst => {
          if (inst.variantName.includes('50인치')) tv50 += inst.quantity;
          if (inst.variantName.includes('65~75')) tv65 += inst.quantity;
          if (inst.variantName.includes('85인치')) tv85 += inst.quantity;
        });
      }
      // 침대(W)
      if (room.items['침대(W)']) {
        room.items['침대(W)'].forEach(inst => bed += inst.quantity);
      }
      // 서랍장
      if (room.items['서랍장']) {
        room.items['서랍장'].forEach(inst => drawer += inst.quantity);
      }
      // 냉장고
      if (room.items['냉장고']) {
        room.items['냉장고'].forEach(inst => fridge += inst.quantity);
      }
      // 김치냉장고
      if (room.items['김치냉장고']) {
        room.items['김치냉장고'].forEach(inst => {
          if (inst.variantName.includes('4룸')) kimchiL += inst.quantity;
          else kimchiM += inst.quantity;
        });
      }
      // 세탁기
      if (room.items['세탁기']) {
        room.items['세탁기'].forEach(inst => washer += inst.quantity);
      }
      // 건조기
      if (room.items['건조기']) {
        room.items['건조기'].forEach(inst => dryer += inst.quantity);
      }
      // 쇼파
      if (room.items['쇼파']) {
        room.items['쇼파'].forEach(inst => sofa += inst.quantity);
      }
      // 피아노
      if (room.items['피아노']) {
        room.items['피아노'].forEach(inst => piano += inst.quantity);
      }
      // 장롱 -> 분해장농
      if (room.items['장롱']) {
        room.items['장롱'].forEach(inst => wardrobe += inst.quantity);
      }
      // 옷 -> 대박스(옷)
      if (room.items['옷']) {
        room.items['옷'].forEach(inst => clothes += inst.quantity);
      }
      // 이불 -> 특대박스(이불)
      if (room.items['이불']) {
        room.items['이불'].forEach(inst => blankets += inst.quantity);
      }
    });

    const newMaterials = { ...resources.materials };
    const sync = (key: string, count: number) => {
      if (count > 0 || newMaterials[key] !== undefined) {
        newMaterials[key] = count;
      }
    };

    sync('TV(50인치이하)', tv50);
    sync('TV(65~75인치)', tv65);
    sync('TV(85인치이상)', tv85);
    sync('침대비닐커버', bed);
    sync('침대', bed);
    sync('서랍장', drawer);
    sync('냉장고', fridge);
    sync('김치냉장고(대)', kimchiL);
    sync('김치냉장고(중)', kimchiM);
    sync('세탁기', washer);
    sync('건조기', dryer);
    sync('쇼파', sofa);
    sync('피아노', piano);
    sync('분해장농', wardrobe);
    sync('대박스(옷)', clothes);
    sync('특대박스(이불)', blankets);

    const hasChanges = Object.keys(newMaterials).some(key => newMaterials[key] !== resources.materials[key]);

    if (hasChanges) {
      updateResources({ materials: newMaterials });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomItems, updateResources]);

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
                <div className="flex items-center justify-between cursor-pointer" onClick={() => handleOptionToggle(opt)}>
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
                    <span className="text-sm text-gray-500 font-semibold">
                      {displayPrice.toLocaleString()}원{opt.isPerDay ? ' / 1일' : ''}
                    </span>
                  )}
                </div>

                {opt.isPerDay && isSelected && (
                  <div className="mt-3 pt-3 border-t border-blue-100 flex flex-col gap-3">
                    <div className="flex flex-col xl:flex-row gap-2 justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-12">시작일</span>
                        <input
                          type="date"
                          value={options[opt.name]?.startDate || ''}
                          onChange={(e) => {
                            const newStart = e.target.value;
                            const currentEnd = options[opt.name]?.endDate;
                            let days = options[opt.name]?.quantity || 1;
                            if (newStart && currentEnd) {
                              const diffTime = new Date(currentEnd).getTime() - new Date(newStart).getTime();
                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                              if (diffDays >= 0) days = Math.max(1, diffDays);
                            }
                            updateOption(opt.name, days, displayPrice, newStart, currentEnd);
                          }}
                          className="flex-1 border rounded px-2 py-1 text-sm focus:outline-blue-500"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-12">종료일</span>
                        <input
                          type="date"
                          value={options[opt.name]?.endDate || ''}
                          onChange={(e) => {
                            const newEnd = e.target.value;
                            const currentStart = options[opt.name]?.startDate;
                            let days = options[opt.name]?.quantity || 1;
                            if (currentStart && newEnd) {
                              const diffTime = new Date(newEnd).getTime() - new Date(currentStart).getTime();
                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                              if (diffDays >= 0) days = Math.max(1, diffDays);
                            }
                            updateOption(opt.name, days, displayPrice, currentStart, newEnd);
                          }}
                          className="flex-1 border rounded px-2 py-1 text-sm focus:outline-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center bg-blue-50 p-2 rounded">
                      <span className="text-xs text-gray-500">보관일수(일)</span>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number"
                          min="1"
                          value={options[opt.name]?.quantity || 1}
                          onChange={(e) => {
                            const days = parseInt(e.target.value, 10) || 1;
                            updateOption(opt.name, days, displayPrice, options[opt.name]?.startDate, options[opt.name]?.endDate);
                          }}
                          className="w-16 border rounded px-2 py-1 text-sm text-center focus:outline-blue-500"
                        />
                        <span className="text-xs font-semibold text-blue-700 w-24 text-right">총 {(displayPrice * (options[opt.name]?.quantity || 1)).toLocaleString()}원</span>
                      </div>
                    </div>
                  </div>
                )}

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
                <label className="flex items-center text-sm font-bold text-gray-700 mb-2">
                  투입 차량 <span className="font-normal text-gray-500 text-xs ml-1">(추천: {recommendedVehicles.fiveTon}대 / {recommendedVehicles.twoHalfTon}대 / {recommendedVehicles.oneTon}대 - 총 {totalCbm} CBM)</span>
                  <button 
                    onClick={() => updateResources({ vehicles: recommendedVehicles })}
                    className="ml-2 bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded border border-blue-200 hover:bg-blue-100 transition-colors"
                  >
                    추천 적용
                  </button>
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
                {PACKING_MATERIALS.filter(mat => {
                  const hideWhenZero = ['TV(', '침대', '서랍장', '냉장고', '김치냉장고', '세탁기', '건조기', '쇼파', '분해장농', '피아노'];
                  if (hideWhenZero.some(prefix => mat.startsWith(prefix))) {
                    return (resources.materials[mat] || 0) > 0;
                  }
                  return true;
                }).map(mat => {
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


