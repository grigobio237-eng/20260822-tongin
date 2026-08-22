'use client';

import { useState } from 'react';
import { useWizardStore } from '@/store/wizardStore';
import { ROOM_CATEGORIES, RoomCategory, MasterItem } from '@/lib/constants/items';
import clsx from 'clsx';
import { Check, ChevronDown, Plus, Minus, X } from 'lucide-react';

interface ModalState {
  room: RoomCategory;
  item: MasterItem;
}

export default function Step2Page() {
  const [activeTab, setActiveTab] = useState<RoomCategory>('방 1');
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [customCbmInput, setCustomCbmInput] = useState<string>('');
  
  const setStep = useWizardStore((state) => state.setStep);
  const roomItems = useWizardStore((state) => state.roomItems);
  const updateRoomItemQuantity = useWizardStore((state) => state.updateRoomItemQuantity);
  const changeItemVariant = useWizardStore((state) => state.changeItemVariant);
  const totalCbm = useWizardStore((state) => state.totalCbm);
  const calculatedVehicles = useWizardStore((state) => state.calculatedVehicles);

  const handleOpenModal = (room: RoomCategory, item: MasterItem) => {
    setModalState({ room, item });
    setCustomCbmInput('');
  };

  const handleCloseModal = () => {
    setModalState(null);
  };

  const handleVariantSelect = (variantName: string, cbm: number) => {
    if (modalState) {
      changeItemVariant(modalState.room, modalState.item.name, variantName, cbm);
      handleCloseModal();
    }
  };

  const handleCustomCbmSave = () => {
    const parsed = parseFloat(customCbmInput);
    if (modalState && !isNaN(parsed) && parsed > 0) {
      changeItemVariant(modalState.room, modalState.item.name, '직접 입력', parsed);
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

      {/* Items Grid */}
      <div className="bg-white rounded-xl shadow-sm border p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ROOM_CATEGORIES[activeTab].map((item) => {
          const itemState = roomItems[activeTab]?.[item.name];
          const qty = itemState?.quantity || 0;
          
          // 표시할 기본 variant 찾기
          let displayVariant = itemState?.variantName;
          let displayCbm = itemState?.unitCbm;
          
          if (!displayVariant) {
            const def = item.variants.find(v => v.isDefault) || item.variants[1] || item.variants[0];
            displayVariant = def.name;
            displayCbm = def.cbm;
          }

          return (
            <div key={item.name} className="flex items-center justify-between p-3 border rounded-lg hover:border-blue-200 transition-colors">
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{item.name}</p>
                <button 
                  onClick={() => handleOpenModal(activeTab, item)}
                  className="mt-1 flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors"
                >
                  {displayVariant} ({displayCbm} CBM) <ChevronDown className="w-3 h-3 ml-1" />
                </button>
              </div>
              
              <div className="flex items-center gap-3 ml-4 bg-gray-50 p-1 rounded-lg border">
                <button
                  onClick={() => updateRoomItemQuantity(activeTab, item.name, Math.max(0, qty - 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-md bg-white shadow-sm text-gray-600 active:scale-95"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-6 text-center font-bold text-lg">{qty}</span>
                <button
                  onClick={() => updateRoomItemQuantity(activeTab, item.name, qty + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-50 text-blue-600 shadow-sm active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer sticky bar */}
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
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-50" onClick={() => setStep(1)}>이전</button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" onClick={() => setStep(3)}>다음 (옵션)</button>
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
                const currentVariantName = roomItems[modalState.room]?.[modalState.item.name]?.variantName;
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
