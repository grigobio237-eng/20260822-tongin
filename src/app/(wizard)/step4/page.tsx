'use client';

import React, { useState, useEffect } from 'react';
import { useWizardStore } from '@/store/wizardStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useRouter } from 'next/navigation';
import { ContractPrintDocument, ContractPrintData } from '@/components/pdf/ContractPrintDocument';
import { Loader2, CheckCircle, FileText } from 'lucide-react';
import clsx from 'clsx';

export default function Step4Page() {
  const store = useWizardStore();
  const settingsStore = useSettingsStore();
  const { customerInfo, options, reset, setStep } = store;
  const router = useRouter();
  
  const [deposit, setDeposit] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedContract, setCompletedContract] = useState<{ id: string, pdfUrl: string } | null>(null);

  // Calculate base costs based on dynamic settings
  const baseCost = 
    (store.resources.vehicles.fiveTon * settingsStore.vehiclePrices.fiveTon) +
    (store.resources.vehicles.twoHalfTon * settingsStore.vehiclePrices.twoHalfTon) +
    (store.resources.vehicles.oneTon * settingsStore.vehiclePrices.oneTon) +
    (store.resources.workerMale * settingsStore.workerPrices.male) +
    (store.resources.workerFemale * settingsStore.workerPrices.female);

  const totalWorkers = store.resources.workerMale + store.resources.workerFemale;

  let optionsCost = 0;
  const calculatedOptions = Object.entries(options).map(([name, opt]) => {
    const basePrice = settingsStore.optionPrices[name] ?? (opt.totalPrice / Math.max(1, opt.quantity));
    let price = basePrice * opt.quantity;
    let displayName = name;
    
    if (name.includes('대기료')) {
      price = basePrice * opt.quantity * totalWorkers;
      displayName = `${name} (${totalWorkers}명)`;
    } else if (name === '사다리-출발지') {
      const count = customerInfo.departureLadderCount || 1;
      price = basePrice * opt.quantity * count;
      if (count > 1) displayName = `${name} (${count}대)`;
    } else if (name === '사다리-도착지') {
      const count = customerInfo.arrivalLadderCount || 1;
      price = basePrice * opt.quantity * count;
      if (count > 1) displayName = `${name} (${count}대)`;
    }
    
    optionsCost += price;
    return { name: displayName, price };
  });
  
  const subTotal = baseCost + optionsCost;
  
  const surchargeRatio = (store.surcharge?.noEvilSpirits ? 0.2 : 0) + (store.surcharge?.endOfMonth ? 0.6 : 0);
  const surchargeAmount = subTotal * surchargeRatio;
  
  const totalCost = subTotal + surchargeAmount - (store.discount || 0);
  const balance = totalCost - deposit;

  const handlePrev = () => {
    setStep(3);
    router.push('/step3');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/contract-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `CT_${Date.now()}`,
          customerInfo,
          options: calculatedOptions.map(opt => ({
            name: opt.name,
            quantity: 1,
            unitPrice: opt.price,
            totalPrice: opt.price
          })),
          rooms: Object.entries(store.roomItems || {}).map(([name, data]: [string, any]) => ({
            id: name,
            name: name,
            items: Object.entries(data.items || {}).map(([itemName, itemState]: [string, any]) => ({
              name: itemName,
              quantity: itemState.quantity,
              cbm: itemState.cbm || 0
            })),
            memo: data.note || '',
            images: data.images || []
          })),
          totalCost,
          deposit,
          balance,
          totalCbm: store.totalCbm,
          resources: {
            vehicles: store.resources?.vehicles || {},
            workerMale: store.resources?.workerMale || 0,
            workerFemale: store.resources?.workerFemale || 0
          },
          sttMemo: store.sttMemo,
          optionCost: optionsCost
        })
      });

      const text = await res.text();
      try {
        const json = JSON.parse(text);
        if (json.success) {
          setCompletedContract({ id: json.contractId, pdfUrl: json.pdfUrl || '' });
        } else {
          alert(`저장 결과: ${text}`);
        }
      } catch {
        alert(`서버 응답 내용:\n${text}`);
      }
    } catch (err: any) {
      alert(`네트워크 요청 오류: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    reset(); // 스토어(localStorage) 초기화
    router.push('/');
  };

  const exportToPdf = async (contractId: string, customerName: string) => {
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('contract-print-root');
      if (!element) return;

      const opt = {
        margin: 0,
        filename: `통인익스프레스_계약서_${customerName}_${contractId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] }
      };

      await html2pdf().set(opt as any).from(element).save();
    } catch (e) {
      console.error('PDF 다운로드 실패:', e);
      alert('PDF 생성 중 오류가 발생했습니다.');
    }
  };

  const handleCopySignLink = () => {
    if (!completedContract) return;
    const customerName = customerInfo?.name || '고객';
    const signUrl = `${window.location.origin}/sign/${completedContract.id}`;
    
    const message = `[통인익스프레스]\n${customerName} 고객님, 요청하신 이사 견적서가 도착했습니다.\n\n아래 링크를 통해 세부 내역을 확인하시고 서명을 진행해 주세요.\n\n▶ 견적 확인 및 서명하기:\n${signUrl}`;
    
    navigator.clipboard.writeText(message);
    alert(`견적 안내 문구와 링크가 클립보드에 복사되었습니다!\nPC 카카오톡이나 메신저에 바로 붙여넣기 하세요.`);
  };

  const handleSendSmsLink = () => {
    if (!completedContract) return;
    const customerPhone = customerInfo?.phone?.replace(/[^0-9]/g, '');
    const customerName = customerInfo?.name || '고객';
    const signUrl = `${window.location.origin}/sign/${completedContract.id}`;

    if (!customerPhone) {
      alert('고객 연락처가 입력되지 않았습니다.');
      return;
    }

    const message = `[통인익스프레스]\n${customerName} 고객님, 요청하신 이사 견적서가 도착했습니다.\n\n아래 링크를 통해 세부 내역을 확인하시고 서명을 진행해 주세요.\n\n▶ 견적 확인 및 서명하기:\n${signUrl}`;

    // 기기별 SMS 프로토콜 호환성 처리 (iOS/Android)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const smsScheme = isIOS ? `sms:${customerPhone}&body=${encodeURIComponent(message)}` : `sms:${customerPhone}?body=${encodeURIComponent(message)}`;

    window.location.href = smsScheme;
  };

  if (completedContract) {
    const fullContractData: ContractPrintData = {
      id: completedContract.id,
      customerInfo: customerInfo as any,
      rooms: Object.entries(store.roomItems || {}).map(([name, data]: [string, any]) => ({
        id: name,
        name: name,
        items: Object.entries(data.items || {}).map(([itemName, itemState]: [string, any]) => ({
          name: itemName,
          quantity: itemState.quantity,
          cbm: itemState.cbm || 0
        })),
        memo: data.note || '',
        images: data.images || []
      })),
      options: calculatedOptions.map(opt => ({
        name: opt.name,
        quantity: 1,
        unitPrice: opt.price,
        totalPrice: opt.price
      })),
      resources: store.resources as any,
      totalCbm: store.totalCbm,
      movingCost: baseCost,
      optionCost: optionsCost,
      totalCost: totalCost,
      deposit: deposit,
      balance: balance,
      sttMemo: store.sttMemo
    };

    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
          <CheckCircle size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">견적서가 생성되었습니다!</h2>
        <p className="text-gray-600">고객에게 보낼 견적서 링크가 안전하게 저장되었습니다.</p>
        
        <div className="flex flex-col gap-3 mt-8 w-full max-w-sm">
          <button 
            onClick={handleSendSmsLink}
            className="flex justify-center items-center gap-2 w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-bold shadow-md transition-colors"
          >
            <FileText size={20} />
            고객 폰으로 SMS 링크 전송
          </button>
          <button 
            onClick={handleCopySignLink}
            className="flex justify-center items-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold shadow-md transition-colors"
          >
            <FileText size={20} />
            문구와 함께 링크 복사 (PC 카톡용)
          </button>
          <button 
            onClick={() => exportToPdf(completedContract.id, customerInfo.name || '고객')}
            className="flex justify-center items-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-md transition-colors"
          >
            <FileText size={20} />
            PDF 견적서 다운로드
          </button>
          <button 
            onClick={handleFinish}
            className="w-full bg-gray-800 text-white py-3 rounded-xl font-bold shadow-md"
          >
            새 견적서 작성하기
          </button>
        </div>

        {/* PDF 생성용 Hidden 렌더링 영역 */}
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <ContractPrintDocument data={fullContractData} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24">
      {/* 0. 계약 내용 최종 확인 */}
      <section>
        <h2 className="text-xl font-bold mb-4">계약 내용 최종 확인</h2>
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden text-sm">
          {/* 작업 조건 */}
          <div className="border-b p-4">
            <h3 className="font-bold text-gray-800 mb-2">작업 조건 및 도착지 상황</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg border">
                <span className="block text-xs text-gray-500 mb-1">이사 전 (출발지)</span>
                <p className="font-semibold">{customerInfo.departureFloor || '?'}층</p>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {customerInfo.departureConditions.length > 0 ? (
                    customerInfo.departureConditions.map(c => (
                      <span key={c} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{c}</span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-xs">조건 미선택</span>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border">
                <span className="block text-xs text-gray-500 mb-1">이사 후 (도착지)</span>
                <p className="font-semibold">{customerInfo.arrivalFloor || '?'}층</p>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {customerInfo.arrivalConditions.length > 0 ? (
                    customerInfo.arrivalConditions.map(c => (
                      <span key={c} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{c}</span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-xs">조건 미선택</span>
                  )}
                </div>
                {customerInfo.arrivalStatus && (
                  <div className="mt-2 pt-2 border-t">
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">{customerInfo.arrivalStatus}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* 자원 및 물량 */}
          <div className="p-4 grid grid-cols-2 gap-4">
            <div>
              <span className="block text-xs text-gray-500 mb-1">총 이사 물량</span>
              <p className="font-bold text-lg text-blue-600">{store.totalCbm} <span className="text-sm text-gray-800">CBM</span></p>
            </div>
            <div>
              <span className="block text-xs text-gray-500 mb-1">작업 인원</span>
              <p className="font-bold">남 {store.resources.workerMale}명 / 여 {store.resources.workerFemale}명</p>
            </div>
            <div className="col-span-2 border-t pt-3 mt-1">
              <span className="block text-xs text-gray-500 mb-1">투입 차량</span>
              <p className="font-bold">
                {store.resources.vehicles.fiveTon > 0 && `5톤 ${store.resources.vehicles.fiveTon}대 `}
                {store.resources.vehicles.twoHalfTon > 0 && `2.5톤 ${store.resources.vehicles.twoHalfTon}대 `}
                {store.resources.vehicles.oneTon > 0 && `1톤 ${store.resources.vehicles.oneTon}대`}
                {(store.resources.vehicles.fiveTon === 0 && store.resources.vehicles.twoHalfTon === 0 && store.resources.vehicles.oneTon === 0) && '선택 안됨'}
              </p>
            </div>
            {Object.keys(store.resources.materials).length > 0 && (
              <div className="col-span-2 border-t pt-3 mt-1">
                <span className="block text-xs text-gray-500 mb-1">포장 재료</span>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(store.resources.materials).map(([mat, qty]) => {
                    if (!qty) return null;
                    return <span key={mat} className="px-2 py-1 bg-gray-100 rounded text-xs font-semibold">{mat} : {qty}</span>;
                  })}
                </div>
              </div>
            )}
            {calculatedOptions.length > 0 && (
              <div className="col-span-2 border-t pt-3 mt-1">
                <span className="block text-xs text-gray-500 mb-1">추가 옵션 품목</span>
                <div className="flex gap-2 flex-wrap">
                  {calculatedOptions.map((opt) => (
                    <span key={opt.name} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold border border-blue-100">
                      {opt.name} {opt.name.includes('대기료') ? `(${totalWorkers}명)` : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* 할증 적용 */}
          <div className="p-4 border-t bg-gray-50 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <span className="block text-sm font-bold text-gray-800">이사 특수일 할증</span>
              <p className="text-xs text-gray-500">손없는 날이나 월말의 경우 기본 비용 및 옵션에 할증이 붙습니다.</p>
            </div>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 border rounded-lg hover:bg-blue-50 transition-colors">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-blue-600"
                  checked={store.surcharge?.noEvilSpirits || false}
                  onChange={(e) => store.updateSurcharge('noEvilSpirits', e.target.checked)}
                />
                <span className="text-sm font-medium">손없는 날 (20%)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 border rounded-lg hover:bg-blue-50 transition-colors">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-blue-600"
                  checked={store.surcharge?.endOfMonth || false}
                  onChange={(e) => store.updateSurcharge('endOfMonth', e.target.checked)}
                />
                <span className="text-sm font-medium">월말 (60%)</span>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* 1. 정산 금액 요약 */}
      <section>
        <h2 className="text-xl font-bold mb-4">비용 정산</h2>
        <div className="bg-white rounded-xl shadow-sm border p-5 space-y-4">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-600">이사 기본비용</span>
            <span className="font-semibold">{baseCost.toLocaleString()}원</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-600">옵션 추가비용</span>
            <span className="font-semibold">{optionsCost.toLocaleString()}원</span>
          </div>
          {surchargeAmount > 0 && (
            <div className="flex justify-between items-center py-2 border-b text-red-600">
              <span>특수일 할증 (+{surchargeRatio * 100}%)</span>
              <span className="font-semibold">+{surchargeAmount.toLocaleString()}원</span>
            </div>
          )}
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-600">수동 할인</span>
            <div className="flex items-center gap-2">
              <span className="text-blue-600 font-semibold">-</span>
              <div className="relative">
                <input 
                  type="number"
                  className="border rounded px-2 py-1 w-28 text-right font-semibold text-blue-600 outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="0"
                  value={store.discount || ''}
                  onChange={(e) => store.setDiscount(Number(e.target.value))}
                />
                <span className="absolute right-2 top-1.5 text-xs text-gray-400">원</span>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center py-2 bg-gray-50 rounded px-3">
            <span className="font-bold text-gray-800">총계 (VAT 별도)</span>
            <span className="text-xl font-bold text-blue-600">{totalCost.toLocaleString()}원</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">계약금 입력</label>
              <div className="relative">
                <input 
                  type="number"
                  className="w-full border rounded-lg p-3 pr-8 text-right font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  value={deposit || ''}
                  onChange={e => setDeposit(Number(e.target.value))}
                  placeholder="0"
                />
                <span className="absolute right-3 top-3.5 text-gray-500">원</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">잔금 (자동계산)</label>
              <div className="w-full border bg-gray-50 rounded-lg p-3 text-right font-bold text-red-600">
                {balance.toLocaleString()} 원
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto flex justify-between gap-4">
          <button 
            onClick={handlePrev}
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl font-bold border border-gray-300 bg-white text-gray-700 w-1/3 disabled:opacity-50"
          >
            이전
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={clsx(
              "flex items-center justify-center gap-2 text-white px-6 py-3 rounded-xl font-bold shadow-md w-2/3 transition-colors",
              isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            )}
          >
            {isSubmitting && <Loader2 size={20} className="animate-spin" />}
            {isSubmitting ? '저장 중...' : '견적 저장 (고객 전송용 링크 생성)'}
          </button>
        </div>
      </div>
    </div>
  );
}
