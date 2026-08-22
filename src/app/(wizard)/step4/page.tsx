'use client';

import React, { useState, useEffect } from 'react';
import { useWizardStore } from '@/store/wizardStore';
import { useRouter } from 'next/navigation';
import SignaturePad from '@/components/wizard/SignaturePad';
import { pdf } from '@react-pdf/renderer';
import { ContractPdfDocument } from '@/components/pdf/ContractPdfDocument';
import { Loader2, CheckCircle, FileText } from 'lucide-react';
import clsx from 'clsx';

export default function Step4Page() {
  const store = useWizardStore();
  const { customerInfo, options, reset, setStep } = store;
  const router = useRouter();
  
  const [agreed, setAgreed] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  
  const [deposit, setDeposit] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedContract, setCompletedContract] = useState<{ id: string, pdfUrl: string } | null>(null);

  // Calculate base costs (demo logic)
  const baseCost = 1000000; // 100만원 임시 책정 (실제로는 차량/인원 기반 산출)
  const optionsCost = Object.values(options).reduce((sum, opt) => sum + opt.totalPrice, 0);
  const totalCost = baseCost + optionsCost;
  const balance = totalCost - deposit;

  const handlePrev = () => {
    setStep(3);
    router.push('/step3');
  };

  const dataURLtoBlob = (dataurl: string) => {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const handleSubmit = async () => {
    if (!agreed) return alert('약관 및 주의사항에 동의해주세요.');
    if (!signatureData) return alert('전자서명이 필요합니다.');
    
    setIsSubmitting(true);
    try {
      // 1. Generate PDF Blob
      const pdfBlob = await pdf(
        <ContractPdfDocument data={store} signatureUrl={signatureData} />
      ).toBlob();

      // 2. Prepare FormData
      const formData = new FormData();
      formData.append('data', JSON.stringify({
        customerInfo,
        options,
        totalCost,
        deposit,
        balance,
        // ... include other necessary fields for DB
      }));
      
      const sigBlob = dataURLtoBlob(signatureData);
      formData.append('signature', sigBlob, 'signature.png');
      formData.append('pdf', pdfBlob, 'contract.pdf');

      // 3. API Call
      const res = await fetch('/api/contracts', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('계약 저장 실패');
      const result = await res.json();
      
      setCompletedContract({ id: result.contractId, pdfUrl: result.pdfUrl });
    } catch (err) {
      console.error(err);
      alert('처리 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    reset(); // 스토어(localStorage) 초기화
    router.push('/');
  };

  if (completedContract) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
          <CheckCircle size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">계약이 체결되었습니다!</h2>
        <p className="text-gray-600">견적서 및 계약서 PDF가 안전하게 저장되었습니다.</p>
        
        <div className="flex flex-col gap-3 mt-8 w-full max-w-sm">
          <a 
            href={completedContract.pdfUrl} 
            target="_blank" rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-blue-50 text-blue-700 py-3 rounded-xl font-bold border border-blue-200"
          >
            <FileText size={20} />
            PDF 계약서 보기
          </a>
          <button 
            onClick={handleFinish}
            className="w-full bg-gray-800 text-white py-3 rounded-xl font-bold shadow-md"
          >
            새 견적서 작성하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24">
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

      {/* 2. 약관 및 동의 */}
      <section>
        <h2 className="text-xl font-bold mb-4">고지사항 확인</h2>
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4 space-y-2">
          <p className="text-xs text-yellow-800 leading-relaxed">
            ▶ 현금·유가증권, 귀금속은 고객이 직접 관리하며 사업자는 책임지지 않습니다.<br/>
            ▶ 도배/잔금 및 대기시 대기료 별도, 에어컨 설치시 부·자재비 별도<br/>
            ▶ 도착지환경에 따라 추가비용이 발생할 수 있습니다. (차량진입 불가시, 계단작업 및 이송작업시)
          </p>
          <label className="flex items-center gap-2 mt-4 pt-4 border-t border-yellow-200 cursor-pointer">
            <input 
              type="checkbox" 
              className="w-5 h-5 rounded text-blue-600"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
            />
            <span className="font-bold text-sm">위 약관 및 중요 고지사항을 모두 확인하고 동의합니다.</span>
          </label>
        </div>
      </section>

      {/* 3. 전자서명 */}
      <section>
        <h2 className="text-xl font-bold mb-4">고객 전자서명</h2>
        <SignaturePad onSign={(dataUrl) => setSignatureData(dataUrl)} />
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
            disabled={isSubmitting || !agreed || !signatureData}
            className={clsx(
              "flex items-center justify-center gap-2 text-white px-6 py-3 rounded-xl font-bold shadow-md w-2/3 transition-colors",
              isSubmitting || !agreed || !signatureData ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            )}
          >
            {isSubmitting && <Loader2 size={20} className="animate-spin" />}
            {isSubmitting ? '계약 처리 중...' : '계약 완료 및 PDF 생성'}
          </button>
        </div>
      </div>
    </div>
  );
}
