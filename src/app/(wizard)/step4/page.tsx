'use client';

import React, { useState, useEffect } from 'react';
import { useWizardStore } from '@/store/wizardStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useRouter } from 'next/navigation';
import { ContractPrintDocument, ContractPrintData } from '@/components/pdf/ContractPrintDocument';
import { WorkOrderPrintDocument } from '@/components/pdf/WorkOrderPrintDocument';
import { Loader2, CheckCircle, FileText } from 'lucide-react';
import clsx from 'clsx';

export default function Step4Page() {
  const store = useWizardStore();
  const settingsStore = useSettingsStore();
  const { contractId, setContractId, customerInfo, options, reset, setStep } = store;
  const { partnerContacts } = settingsStore;
  const router = useRouter();
  
  const [deposit, setDeposit] = useState(0);
  const [middlePayment, setMiddlePayment] = useState(0);
  const [includeVat, setIncludeVat] = useState(false);
  const [editableBaseCost, setEditableBaseCost] = useState<number | null>(store.manualBaseCost || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedContract, setCompletedContract] = useState<{ id: string, pdfUrl: string } | null>(null);

  useEffect(() => {
    if (store.manualBaseCost !== undefined && store.manualBaseCost !== null) {
      setEditableBaseCost(store.manualBaseCost);
    }
  }, [store.manualBaseCost]);

  const calculatedBaseCost = 
    (store.resources.vehicles.fiveTon * settingsStore.vehiclePrices.fiveTon) +
    (store.resources.vehicles.twoHalfTon * settingsStore.vehiclePrices.twoHalfTon) +
    (store.resources.vehicles.oneTon * settingsStore.vehiclePrices.oneTon) +
    (store.resources.workerMale * settingsStore.workerPrices.male) +
    (store.resources.workerFemale * settingsStore.workerPrices.female);

  
  const totalTonnage = (store.resources.vehicles.fiveTon * 5) + (store.resources.vehicles.twoHalfTon * 2.5) + (store.resources.vehicles.oneTon * 1);
  let tonnageKey = 'fiveTon';
  if (totalTonnage >= 10) tonnageKey = 'tenTon';
  else if (totalTonnage >= 7.5) tonnageKey = 'sevenHalfTon';
  else if (totalTonnage >= 6) tonnageKey = 'sixTon';
  else tonnageKey = 'fiveTon';

  let distanceValue = customerInfo.distanceKm ? parseFloat(customerInfo.distanceKm) : 0;
  const getDistanceTier = (dist: number) => {
    if (dist <= 30) return 'tier_30_under';
    if (dist <= 60) return 'tier_60';
    if (dist <= 90) return 'tier_90';
    if (dist <= 120) return 'tier_120';
    if (dist <= 150) return 'tier_150';
    if (dist <= 180) return 'tier_180';
    if (dist <= 210) return 'tier_210';
    if (dist <= 240) return 'tier_240';
    if (dist <= 270) return 'tier_270';
    if (dist <= 300) return 'tier_300';
    if (dist <= 330) return 'tier_330';
    if (dist <= 360) return 'tier_360';
    if (dist <= 390) return 'tier_390';
    if (dist <= 410) return 'tier_410';
    if (dist <= 440) return 'tier_440';
    if (dist <= 470) return 'tier_470';
    return 'tier_470_plus';
  };
  
  const currentDistanceTier = getDistanceTier(distanceValue);
  const distanceMatrixPrice = (settingsStore.distanceRates?.[currentDistanceTier] as any)?.[tonnageKey] || 0;

  const finalBaseCost = customerInfo.applyDistancePrice ? distanceMatrixPrice : calculatedBaseCost;

  // editableBaseCost가 null이면 자동계산값, 아니면 수정된 값 사용
  const baseCost = editableBaseCost !== null ? editableBaseCost : finalBaseCost;



  const totalWorkers = store.resources.workerMale + store.resources.workerFemale;

  let optionsCost = 0;

  const calculatedOptions = Object.entries(options).map(([name, opt]) => {
    const basePrice = opt.totalPrice / Math.max(1, opt.quantity);
    let price = opt.totalPrice;
    let displayName = name;
    
    if (name.includes(' (1일)')) {
      let dateStr = '';
      if (opt.startDate && opt.endDate) {
        dateStr = ` (${opt.startDate.slice(5)} ~ ${opt.endDate.slice(5)})`;
      }
      displayName = name.replace(' (1일)', ' (' + opt.quantity + '일)' + dateStr);
    } else if (name.includes('대기료')) {
      price = basePrice * opt.quantity * totalWorkers;
      displayName = `${name} (${totalWorkers}명)`;
    } else if (name === '사다리·출발지') {
      const count = customerInfo.departureLadderCount || 1;
      price = basePrice * opt.quantity * count;
      if (count > 1) displayName = `${name} (${count}대)`;
    } else if (name === '사다리·도착지') {
      const count = customerInfo.arrivalLadderCount || 1;
      price = basePrice * opt.quantity * count;
      if (count > 1) displayName = `${name} (${count}대)`;
    }
    
    optionsCost += price;
    return { name: displayName, price };
  });

  const depLadderOpt = calculatedOptions.find(o => o.name.startsWith('사다리·출발지'));
  const arrLadderOpt = calculatedOptions.find(o => o.name.startsWith('사다리·도착지'));
  
  const subTotal = baseCost + optionsCost;
  
  const surchargeRatio = (store.surcharge?.noEvilSpirits ? 0.2 : 0) + (store.surcharge?.endOfMonth ? 0.6 : 0);
  const surchargeAmount = subTotal * surchargeRatio;
  
  const totalCost = subTotal + surchargeAmount - (store.discount || 0);
  const vatAmount = includeVat ? Math.round(totalCost * 0.1) : 0;
  const finalTotal = totalCost + vatAmount;
  const autoDeposit = Math.round(finalTotal * 0.1);
  const isStorageMove = customerInfo.packingDate && customerInfo.movingDate && customerInfo.packingDate !== customerInfo.movingDate;
  const balance = finalTotal - deposit - (isStorageMove ? middlePayment : 0);


  const handlePrev = () => {
    setStep(3);
    router.push('/step3');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const newContractId = contractId || `CT_${Date.now()}`;
    try {
      const res = await fetch('/api/contract-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newContractId,
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
            items: Object.entries(data?.items || {}).flatMap(([itemName, instances]: [string, any]) => 
              (Array.isArray(instances) ? instances : [instances]).map((itemState: any) => ({
                name: itemState.variantName ? `${itemName} (${itemState.variantName})` : itemName,
                quantity: itemState.quantity,
                cbm: itemState.cbm || 0
              }))
            ),
            memo: data?.note || '',
            images: data?.images || []
          })),
          totalCost,
          deposit,
          balance,
          totalCbm: store.totalCbm,
          resources: {
            vehicles: store.resources?.vehicles || {},
            workerMale: store.resources?.workerMale || 0,
            workerFemale: store.resources?.workerFemale || 0,
            materials: store.resources?.materials || {}
          },
          sttMemo: store.sttMemo,
          optionCost: optionsCost
        })
      });

      const text = await res.text();
      try {
        const json = JSON.parse(text);
        if (json.success) {
          setContractId(newContractId);
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
        margin: [12, 0, 12, 0],
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

  const exportWorkOrderToPdf = async (contractId: string, customerName: string) => {
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('workorder-print-root');
      if (!element) return;

      const opt = {
        margin: [12, 0, 12, 0],
        filename: `통인익스프레스_작업지시서_${customerName}_${contractId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] }
      };

      await html2pdf().set(opt as any).from(element).save();
    } catch (e) {
      console.error('작업지시서 PDF 다운로드 실패:', e);
      alert('PDF 생성 중 오류가 발생했습니다.');
    }
  };

  const getPartnerText = () => {
    if (!settingsStore.partnerContacts) return '';
    let text = '';
    const cl = settingsStore.partnerContacts.cleaning;
    const org = settingsStore.partnerContacts.organizing;
    
    if (cl?.companyName || cl?.phone) {
      text += `\n\n[제휴 이사청소 업체]\n${cl.companyName} (${cl.phone})`;
      if (cl.memo) text += `\n${cl.memo}`;
    }
    if (org?.companyName || org?.phone) {
      text += `\n\n[제휴 정리수납 업체]\n${org.companyName} (${org.phone})`;
      if (org.memo) text += `\n${org.memo}`;
    }
    return text;
  };

  const handleCopySignLink = () => {
    if (!completedContract) return;
    const customerName = customerInfo?.name || '고객';
    const signUrl = `${window.location.origin}/sign/${completedContract.id}`;
    
    let message = `[통인익스프레스]\n${customerName} 고객님, 요청하신 이사 견적서가 도착했습니다.\n\n아래 링크를 통해 세부 내역을 확인하시고 서명을 진행해 주세요.\n\n▶ 견적 확인 및 서명하기:\n${signUrl}`;
    message += getPartnerText();
    
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

    let message = `[통인익스프레스]\n${customerName} 고객님, 요청하신 이사 견적서가 도착했습니다.\n\n아래 링크를 통해 세부 내역을 확인하시고 서명을 진행해 주세요.\n\n▶ 견적 확인 및 서명하기:\n${signUrl}`;
    message += getPartnerText();

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
        items: Object.entries(data?.items || {}).flatMap(([itemName, instances]: [string, any]) => 
          (Array.isArray(instances) ? instances : [instances]).map((itemState: any) => ({
            name: itemState.variantName ? `${itemName} (${itemState.variantName})` : itemName,
            quantity: itemState.quantity,
            cbm: itemState.cbm || 0
          }))
        ),
        memo: data?.note || '',
        images: data?.images || []
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
      middlePayment,
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
            onClick={() => exportWorkOrderToPdf(completedContract.id, customerInfo.name || '고객')}
            className="flex justify-center items-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold shadow-md transition-colors"
          >
            <FileText size={20} />
            작업지시서 PDF 다운로드
          </button>
          <div className="flex gap-2 w-full">
            <button 
              onClick={() => setCompletedContract(null)}
              className="flex-1 bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-bold shadow-sm hover:bg-gray-50 transition-colors"
            >
              내용 수정하기
            </button>
            <button 
              onClick={handleFinish}
              className="flex-1 bg-gray-800 text-white py-3 rounded-xl font-bold shadow-md hover:bg-gray-900 transition-colors"
            >
              새 견적서 작성
            </button>
          </div>
        </div>

        {/* PDF 생성용 Hidden 렌더링 영역 */}
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <ContractPrintDocument data={fullContractData} />
          <WorkOrderPrintDocument data={{...fullContractData, materials: store.resources.materials}} />
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
                      <span key={c} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                        {c}
                        {c === '사다리' && depLadderOpt ? ` (${depLadderOpt.price.toLocaleString()}원)` : ''}
                      </span>
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
                      <span key={c} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                        {c}
                        {c === '사다리' && arrLadderOpt ? ` (${arrLadderOpt.price.toLocaleString()}원)` : ''}
                      </span>
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
                  {(() => {
                    const fixedItems = useSettingsStore.getState().fixedPackingMaterials || [];
                    const mats: [string, number][] = [];
                    fixedItems.forEach(item => {
                      if (store.resources.materials[item] > 0) {
                        mats.push([item, store.resources.materials[item]]);
                      }
                    });
                    const remainingMats = Object.entries(store.resources.materials)
                      .filter(([k, v]) => !fixedItems.includes(k) && v > 0)
                      .sort((a, b) => a[0].localeCompare(b[0]));
                    mats.push(...remainingMats);
                    
                    return mats.map(([mat, qty]) => (
                      <span key={mat} className="px-2 py-1 bg-gray-100 rounded text-xs font-semibold">{mat} : {qty}</span>
                    ));
                  })()}
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
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">비용 정산</h2>
          <label className="flex items-center gap-2 cursor-pointer bg-blue-50 text-blue-700 px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-sm">
            <input 
              type="checkbox" 
              className="w-4 h-4 text-blue-600"
              checked={customerInfo.applyDistancePrice || false}
              onChange={(e) => {
                store.updateCustomerInfo({ applyDistancePrice: e.target.checked });
                setEditableBaseCost(null);
              }}
            />
            <span className="font-semibold">장거리(구간별) 단가표 적용</span>
          </label>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-5 space-y-4">
          {/* 이사 기본비용 — 수정 가능 */}
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-600">이사 기본비용</span>
            <div className="relative">
              <input
                type="text"
                className="border rounded px-2 py-1 w-36 pr-6 text-right font-semibold outline-none focus:ring-1 focus:ring-blue-500"
                value={(editableBaseCost !== null ? editableBaseCost : finalBaseCost).toLocaleString()}
                onChange={(e) => {
                  const val = Number(e.target.value.replace(/,/g, ''));
                  if (!isNaN(val)) setEditableBaseCost(val);
                }}
                onFocus={(e) => { if (editableBaseCost === null) setEditableBaseCost(finalBaseCost); }}
              />
              <span className="absolute right-2 top-1.5 text-xs text-gray-400">원</span>
            </div>
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
                  type="text"
                  className="border rounded px-2 py-1 w-28 pr-6 text-right font-semibold text-blue-600 outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="0"
                  value={store.discount ? store.discount.toLocaleString() : ''}
                  onChange={(e) => {
                    const val = Number(e.target.value.replace(/,/g, ''));
                    if (!isNaN(val)) store.setDiscount(val);
                  }}
                />
                <span className="absolute right-2 top-1.5 text-xs text-gray-400">원</span>
              </div>
            </div>
          </div>

          {/* 총계 */}
          <div className="flex justify-between items-center py-2 bg-gray-50 rounded px-3">
            <span className="font-bold text-gray-800">총계 (VAT 별도)</span>
            <span className="text-xl font-bold text-blue-600">{totalCost.toLocaleString()}원</span>
          </div>

          {/* VAT 체크박스 */}
          <div className="flex items-center justify-between py-2 border-t">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600"
                checked={includeVat}
                onChange={(e) => {
                  setIncludeVat(e.target.checked);
                  setDeposit(0); // VAT 변경 시 계약금 초기화
                }}
              />
              <span className="text-sm font-medium text-gray-700">부가가치세(VAT 10%) 별도 적용</span>
            </label>
            {includeVat && (
              <span className="text-sm font-semibold text-orange-600">+{vatAmount.toLocaleString()}원</span>
            )}
          </div>

          {/* 최종 금액 (VAT 포함 시) */}
          {includeVat && (
            <div className="flex justify-between items-center py-2 bg-orange-50 rounded px-3 border border-orange-200">
              <span className="font-bold text-orange-800">최종 금액 (VAT 포함)</span>
              <span className="text-xl font-bold text-orange-600">{finalTotal.toLocaleString()}원</span>
            </div>
          )}

          {/* 계약금 / 잔금 */}
          <div className={`grid gap-4 mt-2 ${isStorageMove ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2"}`}>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                계약금 <span className="text-xs text-gray-400 font-normal">(10% 자동계산: {autoDeposit.toLocaleString()}원)</span>
              </label>
              <div className="relative">
                <input 
                  type="text"
                  className="w-full border rounded-lg p-3 pr-8 text-right font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  value={deposit ? deposit.toLocaleString() : ''}
                  onChange={e => {
                    const val = Number(e.target.value.replace(/,/g, ''));
                    if (!isNaN(val)) setDeposit(val);
                  }}
                  placeholder={autoDeposit.toLocaleString()}
                />
                <span className="absolute right-3 top-3.5 text-gray-500">원</span>
              </div>
              <button
                className="mt-1 text-xs text-blue-500 underline"
                onClick={() => setDeposit(autoDeposit)}
              >
                10% 자동입력
              </button>
            </div>
            {isStorageMove && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                포장일 결제액 (중도금)
              </label>
              <div className="relative">
                <input 
                  type="text"
                  className="w-full border rounded-lg p-3 pr-8 text-right font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  value={middlePayment ? middlePayment.toLocaleString() : ''}
                  onChange={e => {
                    const val = Number(e.target.value.replace(/,/g, ''));
                    if (!isNaN(val)) setMiddlePayment(val);
                  }}
                  placeholder="0"
                />
                <span className="absolute right-3 top-3.5 text-gray-500">원</span>
              </div>
            </div>
            )}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">잔금 ({isStorageMove ? '운송일 결제액' : '자동계산'})</label>
              <div className="w-full border bg-gray-50 rounded-lg p-3 text-right font-bold text-red-600">
                {balance.toLocaleString()} 원
              </div>
            </div>
          </div>
        </div>
      </section>


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




