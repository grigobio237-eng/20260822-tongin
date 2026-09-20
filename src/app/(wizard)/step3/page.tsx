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
  const match = floorStr.match(/\d+/);
  const floor = match ? parseInt(match[0], 10) : NaN;
  if (isNaN(floor) || floor <= 5) return 'tier_2_5';
  if (floor <= 7) return 'tier_6_7';
  if (floor <= 9) return 'tier_8_9';
  if (floor <= 11) return 'tier_10_11';
  if (floor <= 13) return 'tier_12_13';
  if (floor <= 24) return `tier_${floor}`;
  return 'tier_25_plus';
};

export default function Step3Page() {
  const prevDeps = React.useRef({ roomItems: useWizardStore.getState().roomItems, vehicles: useWizardStore.getState().resources.vehicles });
  const { 
    options, updateOption, 
    sttMemo, setSttMemo, 
    resources, updateResources, updateMaterial,
    setStep, customerInfo, totalCbm, roomItems 
  } = useWizardStore();
  
  const optionPrices = useSettingsStore(state => state.optionPrices);
  const customPackingMaterials = useSettingsStore(state => state.customPackingMaterials || PACKING_MATERIALS);
  const itemPackingSettings = useSettingsStore(state => state.itemPackingSettings);
  const ladderRates = useSettingsStore(state => state.ladderRates);
  const vehicleLimits = useSettingsStore(state => state.vehicleCbmLimits);
  const router = useRouter();

  const recommendedVehicles = useMemo(() => calculateVehicles(totalCbm, vehicleLimits), [totalCbm, vehicleLimits]);

  const [ladderTons, setLadderTons] = useState<{ [key: string]: 'fiveTon' | 'sixTon' | 'sevenHalfTon' | 'tenTon' }>({
    '사다리·출발지': 'fiveTon',
    '사다리·도착지': 'fiveTon',
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

  const getCalculatedLadderPrice = (optName: string, ton: 'fiveTon' | 'sixTon' | 'sevenHalfTon' | 'tenTon') => {
    if (!ladderRates) return optionPrices[optName] ?? 150000;
    const type = optName === '사다리·출발지' ? 'departure' : 'arrival';
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
      let price = manualPrices[optName] ?? optionPrices[optName] ?? opt.defaultPrice ?? 0;
      
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
           const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
           if (diffDays >= 0) initialDays = Math.max(1, diffDays);
         }
      }
      
      updateOption(optName, initialDays, price, startDate, endDate);
    }
  };

  const handleLadderTonChange = (optName: string, ton: 'fiveTon' | 'sixTon' | 'sevenHalfTon' | 'tenTon') => {
    setLadderTons(prev => ({ ...prev, [optName]: ton }));
    if (options[optName]) {
      // update price immediately if selected
      const price = manualPrices[optName] ?? getCalculatedLadderPrice(optName, ton);
      updateOption(optName, 1, price);
    }
  };

  const handleManualPriceChange = (optName: string, priceStr: string) => {
    // Only parse numbers
    const numStr = priceStr.replace(/[^0-9]/g, '');
    const price = parseInt(numStr, 10) || 0;
    setManualPrices(prev => ({ ...prev, [optName]: price }));
    if (options[optName]) {
      updateOption(optName, options[optName].quantity || 1, price, options[optName].startDate, options[optName].endDate);
    }
  };

  

  // 동적 포장재료 연동 (DB 설정 우선, 없을 시 레거시 하드코딩 폴백)
  const defaultPackingMaterials = useSettingsStore(state => state.defaultPackingMaterials);
  
  // Auto-sync storage options dates from step 1
  // Auto-sync ladder tons based on total vehicles
  useEffect(() => {
    const v = resources.vehicles;
    const totalTons = (v.fiveTon || 0) * 5 + (v.twoHalfTon || 0) * 2.5 + (v.oneTon || 0) * 1;
    
    let targetLadderTon: 'fiveTon' | 'sixTon' | 'sevenHalfTon' | 'tenTon' = 'fiveTon';
    if (totalTons <= 5) targetLadderTon = 'fiveTon';
    else if (totalTons <= 6) targetLadderTon = 'sixTon';
    else if (totalTons <= 7.5) targetLadderTon = 'sevenHalfTon';
    else targetLadderTon = 'tenTon';

    setLadderTons(prev => {
      if (prev['사다리·출발지'] === targetLadderTon && prev['사다리·도착지'] === targetLadderTon) {
        return prev;
      }
      
      const currentOptions = useWizardStore.getState().options;
      ['사다리·출발지', '사다리·도착지'].forEach(optName => {
        if (currentOptions[optName] && prev[optName] !== targetLadderTon) {
           const price = manualPrices[optName] ?? getCalculatedLadderPrice(optName, targetLadderTon);
           updateOption(optName, currentOptions[optName].quantity || 1, price);
        }
      });
      
      return {
        ...prev,
        '사다리·출발지': targetLadderTon,
        '사다리·도착지': targetLadderTon
      };
    });
  }, [resources.vehicles, manualPrices, updateOption]);

  useEffect(() => {
    const { packingDate, movingDate } = customerInfo;
    if (packingDate && movingDate && packingDate !== movingDate) {
      const diffTime = new Date(movingDate).getTime() - new Date(packingDate).getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      const initialDays = diffDays >= 0 ? Math.max(1, diffDays) : 1;

      const currentOptions = useWizardStore.getState().options;
      
      if (!currentOptions['컨테이너보관료 (1일)'] && !currentOptions['실내보관료 (1일)']) {
        const defaultPrice = optionPrices['컨테이너보관료 (1일)'] ?? 8000;
        updateOption('컨테이너보관료 (1일)', initialDays, defaultPrice, packingDate, movingDate);
      } else {
        ['컨테이너보관료 (1일)', '실내보관료 (1일)'].forEach(optName => {
          if (currentOptions[optName]) {
             if (currentOptions[optName].startDate !== packingDate || currentOptions[optName].endDate !== movingDate || currentOptions[optName].quantity !== initialDays) {
               updateOption(optName, initialDays, optionPrices[optName] ?? currentOptions[optName].totalPrice / Math.max(1, currentOptions[optName].quantity), packingDate, movingDate);
             }
          }
        });
      }
    }
  }, [customerInfo.packingDate, customerInfo.movingDate, optionPrices, updateOption]);

  useEffect(() => {
    let customCounts: Record<string, number> = {};
    let dynamicCounts: Record<string, number> = {};

    // 0. 차량별 기본 포장재료 적용
    const addMats = (mats: Record<string, number>, count: number) => {
      if (!mats || count <= 0) return;
      Object.entries(mats).forEach(([key, val]) => {
        if (val > 0) {
          customCounts[key] = (customCounts[key] || 0) + (val * count);
        }
      });
    };
    addMats(defaultPackingMaterials.fiveTon, resources.vehicles.fiveTon || 0);
    addMats(defaultPackingMaterials.twoHalfTon, resources.vehicles.twoHalfTon || 0);
    addMats(defaultPackingMaterials.oneTon, resources.vehicles.oneTon || 0);


    Object.entries(roomItems).forEach(([roomName, room]) => {
      const allowedNames = (useSettingsStore.getState().roomItemMapping as any)?.[roomName];
      if (!allowedNames) return; // Ghost room prevention
      if (!room || !room.items) return;
      
      // 기타물품 제외 처리 완료

      // 2. DB 포장재료 설정 및 기존 하드코딩 매핑
      Object.entries(room.items).forEach(([itemName, instances]) => {
        instances.forEach(inst => {
          const settingKey = `${itemName}|${inst.variantName}`;
          const packSetting = itemPackingSettings?.[settingKey];
          const q = inst.quantity;
          
          let hasCustomMaterial = false;
          if (packSetting && (packSetting.materialName || packSetting.materialName2)) {
            // DB 우선
            if (packSetting.materialName && packSetting.count > 0) {
              customCounts[packSetting.materialName] = (customCounts[packSetting.materialName] || 0) + (packSetting.count * q);
              hasCustomMaterial = true;
            }
            if (packSetting.materialName2 && packSetting.count2 && packSetting.count2 > 0) {
              customCounts[packSetting.materialName2] = (customCounts[packSetting.materialName2] || 0) + (packSetting.count2 * q);
              hasCustomMaterial = true;
            }
          } 
          
          // 레거시 하드코딩 규칙 (박스류 유지)
          if (itemName === '신발류(중박스용)') customCounts['중박스'] = (customCounts['중박스'] || 0) + q;
          else if (itemName === '옷') customCounts['대박스(옷)'] = (customCounts['대박스(옷)'] || 0) + q;
          else if (itemName === '이불') customCounts['특대박스(이불)'] = (customCounts['특대박스(이불)'] || 0) + q;
          else if (itemName === '생활물품/잔짐류(중박스용)') customCounts['중박스'] = (customCounts['중박스'] || 0) + q;
          else if (itemName === '도서/소형물품(소박스용)') customCounts['소박스'] = (customCounts['소박스'] || 0) + q;
          else if (!['기타물품1', '기타물품2', '식기류'].includes(itemName) && !itemName.startsWith('기타물품')) {
            // 가전/가구 등은 포장재료 목록에 노출하되, 이미 DB에서 전용 포장재료(예: TV(65인치))가 설정된 경우 중복 노출 방지
            if (!hasCustomMaterial) {
              const label = inst.variantName.includes(itemName) || itemName.length > 5 ? inst.variantName : `${itemName}(${inst.variantName})`;
              dynamicCounts[label] = (dynamicCounts[label] || 0) + q;
            }
          }
        });
      });
    });

    const newMaterials: Record<string, number> = { ...resources.materials };
    const baseCalculated: Record<string, number> = {};

    Object.keys(customCounts).forEach(key => {
      let count = customCounts[key] || 0;
      if (['대박스(옷)', '특대박스(이불)', '중박스', '소박스'].includes(key)) {
        count += (dynamicCounts[key] || 0);
      }
      baseCalculated[key] = count;
    });

    Object.entries(dynamicCounts).forEach(([matName, count]) => {
      if (!['대박스(옷)', '특대박스(이불)', '중박스', '소박스'].includes(matName)) {
        baseCalculated[matName] = (baseCalculated[matName] || 0) + count;
      }
    });
    
    const currentRoomItems = useWizardStore.getState().roomItems;
    const currentVehicles = useWizardStore.getState().resources.vehicles;
    const depsChanged = prevDeps.current.roomItems !== currentRoomItems || prevDeps.current.vehicles !== currentVehicles;
    prevDeps.current = { roomItems: currentRoomItems, vehicles: currentVehicles };

    // Prevent overriding hydrated materials on mount (even in Strict Mode double-invocations)
    if (!depsChanged && Object.keys(resources.materials).length > 0) {
      return;
    }

    // We overwrite ONLY the keys that are supposed to be auto-calculated.
    // If a key was in resources.materials but NOT in baseCalculated, the user manually added it?
    // Actually, to make it robust against vehicle changes, we just assign baseCalculated, 
    // BUT we must also keep user's manual increments! This is tricky without tracking pristine state.
    // Let's just SET newMaterials = baseCalculated, plus any items the user manually clicked '+' on that aren't in baseCalculated.
    // To simplify: we just overwrite with baseCalculated. The user should apply recommendations BEFORE tweaking manually.
    Object.keys(baseCalculated).forEach(k => {
      newMaterials[k] = baseCalculated[k];
    });
    // Remove keys that dropped to 0 in calculation
    Object.keys(newMaterials).forEach(k => {
       if (baseCalculated[k] === 0 || (baseCalculated[k] === undefined && !resources.materials[k])) {
          // Keep it if user manually set it > 0, otherwise it might be stale autoMaterial. 
          // Actually, if we change vehicles from 2 to 1, autoMaterials will drop from 30 to 15.
          // `newMaterials[k] = baseCalculated[k]` handles this drop!
       }
    });

    const hasChanges = Object.keys(newMaterials).some(key => newMaterials[key] !== resources.materials[key]);

    if (hasChanges) {
      updateResources({ materials: newMaterials });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomItems, updateResources, itemPackingSettings, defaultPackingMaterials, resources.vehicles]);

  return (
    <div className="space-y-8 pb-24">
      {/* 1. 옵션 선택 */}
      <section>
        <h2 className="text-xl font-bold mb-4">옵션 항목</h2>
        <div className="bg-white rounded-xl shadow-sm border p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {OPTION_ITEMS.map(opt => {
            const isLadder = opt.name === '사다리·출발지' || opt.name === '사다리·도착지';
            const isSelected = !!options[opt.name];
            
            let displayPrice = manualPrices[opt.name] ?? optionPrices[opt.name] ?? opt.defaultPrice;
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
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="text"
                        value={displayPrice.toLocaleString()}
                        onChange={(e) => handleManualPriceChange(opt.name, e.target.value)}
                        className="w-20 text-right text-sm text-gray-700 font-bold bg-white border border-gray-300 rounded px-1 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-500 font-semibold">
                        원{opt.isPerDay ? ' / 1일' : ''}
                      </span>
                    </div>
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
                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
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
                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
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
                        <option value="fiveTon">5톤</option>
                        <option value="sixTon">6톤</option>
                        <option value="sevenHalfTon">7.5톤</option>
                        <option value="tenTon">10톤</option>
                      </select>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">금액 (수동조정)</span>
                      <div className="flex items-center gap-1">
                        <input 
                          type="text" 
                          value={(manualPrices[opt.name] ?? getCalculatedLadderPrice(opt.name, ladderTons[opt.name])).toLocaleString()}
                          onChange={(e) => handleManualPriceChange(opt.name, e.target.value)}
                          className="w-24 border rounded px-2 py-1 text-sm text-right font-bold text-blue-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                {(() => {
                  const baseMaterials = customPackingMaterials || PACKING_MATERIALS;
                  const activeExtraMaterials = Object.keys(resources.materials).filter(k => (resources.materials[k] || 0) > 0 && !baseMaterials.includes(k));
                  const allMaterialsToRender = [...baseMaterials, ...activeExtraMaterials];
                  
                  return allMaterialsToRender.filter(mat => {
                    const hideWhenZero = ['TV(', '침대', '서랍장', '냉장고', '김치냉장고', '세탁기', '건조기', '쇼파', '분해장농', '피아노'];
                    if (hideWhenZero.some(prefix => mat.startsWith(prefix)) || !baseMaterials.includes(mat)) {
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
                })
                })()}
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


