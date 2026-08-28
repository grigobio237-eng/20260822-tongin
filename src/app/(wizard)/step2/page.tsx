'use client';

import { useState } from 'react';
import { useWizardStore } from '@/store/wizardStore';
import { useRouter } from 'next/navigation';
import { ROOM_CATEGORIES, RoomCategory, MasterItem } from '@/lib/constants/items';
import clsx from 'clsx';
import { Check, ChevronDown, Plus, Minus, X } from 'lucide-react';

interface ModalState {
  room: RoomCategory;
  item: MasterItem;
  instanceId?: string;
}

export default function Step2Page() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<RoomCategory>('방 1');
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [customCbmInput, setCustomCbmInput] = useState<string>('');
  
  const setStep = useWizardStore((state) => state.setStep);
  const roomItems = useWizardStore((state) => state.roomItems);
  const updateRoomItemQuantity = useWizardStore((state) => state.updateRoomItemQuantity);
  const changeItemVariant = useWizardStore((state) => state.changeItemVariant);
  const addRoomItemInstance = useWizardStore((state) => state.addRoomItemInstance);
  const removeRoomItemInstance = useWizardStore((state) => state.removeRoomItemInstance);
  const totalCbm = useWizardStore((state) => state.totalCbm);
  const calculatedVehicles = useWizardStore((state) => state.calculatedVehicles);

  const handleOpenModal = (room: RoomCategory, item: MasterItem, instanceId?: string) => {
    setModalState({ room, item, instanceId });
    setCustomCbmInput('');
  };

  const handleCloseModal = () => {
    setModalState(null);
  };

  const handleVariantSelect = (variantName: string, cbm: number) => {
    if (modalState) {
      changeItemVariant(modalState.room, modalState.item.name, modalState.instanceId || '', variantName, cbm);
      handleCloseModal();
    }
  };

  const handleCustomCbmSave = () => {
    const parsed = parseFloat(customCbmInput);
    if (modalState && !isNaN(parsed) && parsed > 0) {
      changeItemVariant(modalState.room, modalState.item.name, modalState.instanceId || '', '직접 입력', parsed);
      handleCloseModal();
    }
  };

  return (
    <div className="space-y-6 pb-24 relative">
      <div className="text-center">
        <h2 className="text-xl font-bold">공간별 물품 체크</h2>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto pb-2 gap-2 snap-x scrollbar-hide">
        {(Object.keys(ROOM_CATEGORIES) as RoomCategory[]).map((room) => (
          <button
            key={room}
            onClick={() => setActiveTab(room)}
            className={clsx(
              "px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors snap-start border",
              activeTab === room 
                ? "bg-blue-600 text-white border-blue-600" 
                : "bg-white text-gray-600 hover:bg-gray-50"
            )}
          >
            {room}
          </button>
        ))}
      </div>

      {/* Items Grid Header */}
      <div className="flex justify-between items-center px-1">
        <h3 className="font-bold text-gray-800">{activeTab} 물품 목록</h3>
        <div className="text-sm font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
          소계: {Object.values(roomItems[activeTab]?.items || {}).flat().reduce((acc, inst) => acc + (inst.cbm || 0), 0).toFixed(1)} CBM
        </div>
      </div>

      {/* Items Grid */}
      <div className="bg-white rounded-xl shadow-sm border p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ROOM_CATEGORIES[activeTab].map((item) => {
          const instances = roomItems[activeTab]?.items?.[item.name] || [];
          
          return (
            <div key={item.name} className="flex flex-col p-3 border rounded-lg hover:border-blue-200 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-gray-800">{item.name}</p>
                <button
                  onClick={() => addRoomItemInstance(activeTab, item.name)}
                  className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 font-medium flex items-center"
                >
                  <Plus className="w-3 h-3 mr-1" /> 추가
                </button>
              </div>

              <div className="space-y-2">
                {instances.length === 0 ? (
                  // 빈 껍데기 렌더링 (추가하지 않았을 때)
                  (() => {
                    const def = item.variants.find(v => v.isDefault) || item.variants[1] || item.variants[0];
                    return (
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <button 
                            onClick={() => handleOpenModal(activeTab, item, '')}
                            className="flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors text-left"
                          >
                            {def.name} ({def.cbm} CBM) <ChevronDown className="w-3 h-3 ml-1 shrink-0" />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-3 ml-2 bg-gray-50 p-1 rounded-lg border shrink-0">
                          <button
                            onClick={() => updateRoomItemQuantity(activeTab, item.name, '', 0)}
                            className="w-8 h-8 flex items-center justify-center rounded-md bg-white shadow-sm text-gray-600 active:scale-95 opacity-50 cursor-not-allowed"
                            disabled
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-6 text-center font-bold text-lg">0</span>
                          <button
                            onClick={() => updateRoomItemQuantity(activeTab, item.name, '', 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-50 text-blue-600 shadow-sm active:scale-95"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  instances.map((inst, idx) => (
                    <div key={inst.id} className="flex items-center justify-between border-t border-dashed pt-2 first:border-0 first:pt-0">
                      <div className="flex-1">
                        <button 
                          onClick={() => handleOpenModal(activeTab, item, inst.id)}
                          className="flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors text-left"
                        >
                          {inst.variantName} ({inst.unitCbm} CBM) <ChevronDown className="w-3 h-3 ml-1 shrink-0" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-2">
                        <div className="flex items-center gap-3 bg-gray-50 p-1 rounded-lg border">
                          <button
                            onClick={() => updateRoomItemQuantity(activeTab, item.name, inst.id, Math.max(0, inst.quantity - 1))}
                            className="w-8 h-8 flex items-center justify-center rounded-md bg-white shadow-sm text-gray-600 active:scale-95"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-6 text-center font-bold text-lg">{inst.quantity}</span>
                          <button
                            onClick={() => updateRoomItemQuantity(activeTab, item.name, inst.id, inst.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-50 text-blue-600 shadow-sm active:scale-95"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        {instances.length > 1 && (
                          <button
                            onClick={() => removeRoomItemInstance(activeTab, item.name, inst.id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}

        {/* 기타 항목 2개 추가 */}
        {[1, 2].map(num => {
          const customKey = `기타 ${num}`;
          const instances = roomItems[activeTab].items[customKey] || [];
          const itemState = instances[0];
          const qty = itemState?.quantity || 0;
          
          return (
            <div key={customKey} className="flex items-center justify-between p-3 border rounded-lg hover:border-blue-200 transition-colors">
              <div className="flex-1 mr-4">
                <input 
                  type="text"
                  placeholder={`기타 물품 ${num}`}
                  className="w-full text-sm font-semibold text-gray-800 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent mb-2 pb-1 transition-colors"
                  value={itemState?.variantName || ''}
                  onChange={(e) => changeItemVariant(activeTab, customKey, itemState?.id || '', e.target.value, itemState?.unitCbm || 0.1)}
                />
                <div className="flex items-center gap-2">
                  <input 
                    type="number"
                    step="0.1"
                    min="0.1"
                    className="w-20 text-xs text-blue-600 bg-blue-50 px-2 py-1.5 rounded-md text-center focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                    value={itemState?.unitCbm || ''}
                    placeholder="0.1"
                    onChange={(e) => changeItemVariant(activeTab, customKey, itemState?.id || '', itemState?.variantName || `기타 ${num}`, parseFloat(e.target.value) || 0)}
                  />
                  <span className="text-xs text-gray-500 font-medium">CBM</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-gray-50 p-1 rounded-lg border shrink-0">
                <button
                  onClick={() => updateRoomItemQuantity(activeTab, customKey, itemState?.id || '', Math.max(0, qty - 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-md bg-white shadow-sm text-gray-600 active:scale-95"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-6 text-center font-bold text-lg">{qty}</span>
                <button
                  onClick={() => {
                    if (!itemState?.variantName) changeItemVariant(activeTab, customKey, '', `기타 ${num}`, 0.1);
                    // Wait, changeItemVariant with empty id creates it! 
                    // But we don't have the id yet, it's generated. We can't immediately update quantity using that id.
                    // Let's just use updateRoomItemQuantity which handles empty id!
                    updateRoomItemQuantity(activeTab, customKey, itemState?.id || '', qty + 1);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-50 text-blue-600 shadow-sm active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Room specific Notes and Images */}
      <div className="bg-white rounded-xl shadow-sm border p-4 space-y-4">
        <h3 className="font-bold text-gray-800 border-b pb-2">{activeTab} 현장 사진 및 특이사항</h3>
        
        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">현장 사진</label>
          <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
            {roomItems[activeTab]?.images?.map((imgUrl, idx) => (
              <div key={idx} className="relative w-24 h-24 shrink-0 snap-start border rounded-lg overflow-hidden group">
                <img src={imgUrl} alt={`Room photo ${idx}`} className="w-full h-full object-cover" />
                <button 
                  onClick={() => useWizardStore.getState().removeRoomImage(activeTab, imgUrl)}
                  className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <label className="w-24 h-24 shrink-0 flex flex-col items-center justify-center border-2 border-dashed rounded-lg text-gray-400 hover:text-blue-500 hover:border-blue-500 cursor-pointer transition-colors">
              <Plus className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">사진 추가</span>
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                className="hidden" 
                onChange={async (e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    const { compressToWebP } = await import('@/lib/imageCompression');
                    try {
                      const { blob } = await compressToWebP(file);
                      const formData = new FormData();
                      formData.append('file', blob);
                      formData.append('roomId', activeTab);
                      const res = await fetch('/api/upload', { method: 'POST', body: formData });
                      if (res.ok) {
                        const data = (await res.json()) as { url: string };
                        if (data?.url) {
                          useWizardStore.getState().addRoomImage(activeTab, data.url);
                        }
                      }
                    } catch (e) {
                      console.error("Upload failed", e);
                    }
                  }
                }}
              />
            </label>
          </div>
        </div>

        {/* Note (STT) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">공간 특이사항 (음성/수기)</label>
          <div className="flex gap-2 items-start">
            <textarea 
              value={roomItems[activeTab]?.note || ''}
              onChange={(e) => useWizardStore.getState().updateRoomNote(activeTab, e.target.value)}
              placeholder="예: 장롱 우측 하단 스크래치 있음, 문틀 파손 주의 등"
              className="flex-1 border rounded-lg p-3 min-h-[80px] text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button 
              onClick={async () => {
                if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
                  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                  const recognition = new SpeechRecognition();
                  recognition.lang = 'ko-KR';
                  recognition.interimResults = false;
                  recognition.onresult = (e: any) => {
                    const text = e.results[0][0].transcript;
                    const currentNote = useWizardStore.getState().roomItems[activeTab]?.note || '';
                    useWizardStore.getState().updateRoomNote(activeTab, currentNote ? `${currentNote} ${text}` : text);
                  };
                  recognition.start();
                } else {
                  alert('음성 인식을 지원하지 않는 브라우저입니다.');
                }
              }}
              className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0 border border-blue-100 hover:bg-blue-100 active:bg-blue-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
            </button>
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">총 부피 산출</p>
            <p className="text-2xl font-bold text-blue-600">{totalCbm} <span className="text-lg text-gray-800">CBM</span></p>
            <p className="text-xs text-gray-500 mt-1">
              추천 차량: {calculatedVehicles.fiveTon > 0 && `5톤 ${calculatedVehicles.fiveTon}대 `}
              {calculatedVehicles.twoHalfTon > 0 && `2.5톤 ${calculatedVehicles.twoHalfTon}대 `}
              {calculatedVehicles.oneTon > 0 && `1톤 ${calculatedVehicles.oneTon}대`}
              {totalCbm === 0 && '차량 없음'}
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              className="px-4 py-2 border rounded-lg hover:bg-gray-50" 
              onClick={() => { setStep(1); router.push('/step1'); }}
            >
              이전
            </button>
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" 
              onClick={() => { setStep(3); router.push('/step3'); }}
            >
              다음 (옵션)
            </button>
          </div>
        </div>
      </div>

      {/* Variant Selection Modal */}
      {modalState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">{modalState.item.name} 규격 선택</h3>
              <button onClick={handleCloseModal} className="p-2 bg-white rounded-full text-gray-500 hover:bg-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto space-y-3">
              {modalState.item.variants.map((v) => {
                const currentVariantName = roomItems[modalState.room]?.items?.[modalState.item.name]?.find(inst => inst.id === modalState.instanceId)?.variantName;
                const isSelected = currentVariantName === v.name || (!currentVariantName && v.isDefault);
                
                return (
                  <button
                    key={v.name}
                    onClick={() => handleVariantSelect(v.name, v.cbm)}
                    className={clsx(
                      "w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all active:scale-95",
                      isSelected 
                        ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500" 
                        : "bg-white border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                    )}
                  >
                    <div>
                      <p className={clsx("font-semibold text-base", isSelected ? "text-blue-700" : "text-gray-800")}>
                        {v.name}
                      </p>
                      <p className="text-sm text-gray-500">{v.cbm} CBM</p>
                    </div>
                    {isSelected && <Check className="w-6 h-6 text-blue-600" />}
                  </button>
                );
              })}

              <div className="mt-6 pt-4 border-t">
                <label className="block text-sm font-medium text-gray-700 mb-2">직접 CBM 입력 (특수 가구용)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="예: 3.5"
                    value={customCbmInput}
                    onChange={(e) => setCustomCbmInput(e.target.value)}
                    className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button 
                    onClick={handleCustomCbmSave} 
                    disabled={!customCbmInput} 
                    className="bg-gray-800 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    적용
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
