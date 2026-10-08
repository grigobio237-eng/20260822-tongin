'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import SignatureCanvas from 'react-signature-canvas';
import { ContractPrintDocument, ContractPrintData } from '@/components/pdf/ContractPrintDocument';
import { fireConfetti } from '@/lib/confetti';
import { 
  CheckCircle2, 
  Download, 
  Copy, 
  Check, 
  X, 
  Calendar, 
  CreditCard, 
  Sparkles,
  PartyPopper
} from 'lucide-react';

export default function CustomerSignPage() {
  const { id } = useParams();
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isPadActive, setIsPadActive] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const sigPad = useRef<any>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/contract-get?id=${id}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setContract(json.data);
          if (json.data.status === 'CONFIRMED' && json.data.signature_url) {
            setIsSigned(true);
          }
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!loading && !isSigned && isPadActive && sigPad.current) {
      const canvas = sigPad.current.getCanvas();
      if (canvas) {
        const preventScroll = (e: TouchEvent) => {
          if (e.cancelable) {
            e.preventDefault();
          }
        };
        canvas.addEventListener('touchstart', preventScroll, { passive: false });
        canvas.addEventListener('touchmove', preventScroll, { passive: false });
        
        return () => {
          canvas.removeEventListener('touchstart', preventScroll);
          canvas.removeEventListener('touchmove', preventScroll);
        };
      }
    }
  }, [loading, isSigned, isPadActive]);

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('contract-print-root');
      if (!element) return;
      const opt = {
        margin: [12, 0, 12, 0],
        filename: `통인익스프레스_계약서_${parsedData?.customerInfo.name || '고객'}_${parsedData?.id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] }
      };
      await html2pdf().set(opt as any).from(element).save();
    } catch (e) {
      console.error('PDF 다운로드 실패:', e);
      alert('PDF 다운로드 중 오류가 발생했습니다.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleCopyAccount = async () => {
    const textToCopy = '신한은행 110-340-826378 (예금주: 김택형)';
    try {
      await navigator.clipboard.writeText(textToCopy);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = textToCopy;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2500);
  };

  const handleSubmitSignature = async () => {
    if (!agreed) {
      alert('약관 및 고지사항에 동의해 주세요.');
      return;
    }
    if (sigPad.current?.isEmpty()) {
      alert('서명을 진행해 주세요.');
      return;
    }

    try {
      setSubmitting(true);
      const signatureBase64 = sigPad.current.toDataURL('image/png');
      const res = await fetch('/api/contract-sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, signatureBase64 }),
      });
      const data = await res.json();
      if (data.success) {
        setIsSigned(true);
        // 서명 후 로컬 데이터 갱신
        setContract((prev: any) => ({ ...prev, signature_url: signatureBase64, status: 'CONFIRMED' }));
        fireConfetti();
        setShowCelebration(true);
      } else {
        alert(`서명 실패: ${data.error}`);
      }
    } catch (e: any) {
      alert(`오류 발생: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">견적서를 불러오는 중입니다...</div>;
  if (!contract) return <div className="p-8 text-center text-rose-500">유효하지 않은 견적서입니다.</div>;

  let parsedData: ContractPrintData | null = null;
  try {
    parsedData = {
      id: contract.id,
      customerInfo: {
        name: contract.customer_name,
        phone: contract.customer_phone,
        secondaryPhone: contract.secondary_phone,
        contractDate: contract.contract_date,
        packingDate: contract.packing_date,
        movingDate: contract.moving_date,
        departureAddress: contract.departure_address,
        departureDetailAddress: contract.departure_detail_address,
        departureFloor: contract.departure_floor,
        arrivalAddress: contract.arrival_address,
        arrivalDetailAddress: contract.arrival_detail_address,
        arrivalFloor: contract.arrival_floor,
        serviceType: contract.service_type,
        arrivalStatus: contract.arrival_status,
        departureConditions: contract.departure_conditions ? contract.departure_conditions.split(',') : undefined,
        departureLadderCount: contract.departure_ladder_count || 1,
        arrivalConditions: contract.arrival_conditions ? contract.arrival_conditions.split(',') : undefined,
        arrivalLadderCount: contract.arrival_ladder_count || 1,
        distanceKm: contract.distance_km,
        durationMin: contract.duration_min,
        applyDistancePrice: contract.apply_distance_price === 1,
      },
      rooms: contract.rooms_json ? JSON.parse(contract.rooms_json) : [],
      options: contract.options_json ? JSON.parse(contract.options_json) : [],
      resources: contract.resources_json ? JSON.parse(contract.resources_json) : {
        workerMale: contract.worker_count_male,
        workerFemale: contract.worker_count_female
      },
      totalCbm: contract.total_cbm,
      movingCost: contract.moving_cost,
      optionCost: contract.option_cost,
      totalCost: contract.total_cost,
      deposit: contract.deposit,
      middlePayment: contract.middle_payment,
      balance: contract.balance,
      sttMemo: contract.stt_memo,
      signatureBase64: contract.signature_url || undefined,
      includeVat: contract.include_vat === 1 || Boolean(contract.vat_amount && contract.vat_amount > 0),
      vatAmount: contract.vat_amount,
    };
  } catch (e) {
    console.error("데이터 파싱 에러", e);
  }

  return (
    <div className="w-full min-h-screen bg-slate-100 pb-12 flex flex-col items-center">
      <style>{`
        @media (max-width: 1280px) {
          .mobile-preview-wrapper {
            zoom: 0.45;
          }
        }
        @media (min-width: 768px) and (max-width: 1279px) {
          .mobile-preview-wrapper {
            zoom: 0.7;
          }
        }
      `}</style>
      {/* 헤더 */}
      <div className="bg-blue-900 text-white p-4 text-center shadow w-full">
        <h1 className="text-xl font-black">통인익스프레스 견적서 검토</h1>
        <p className="text-sm text-blue-200">내역을 확인하시고 서명을 진행해 주세요</p>
      </div>

      <div className="w-full mt-4 flex flex-col xl:flex-row gap-6 max-w-7xl px-4">
        {/* 왼쪽: 계약서 미리보기 (가로 스크롤 가능) */}
        <div className="flex-1 w-full bg-gray-300 rounded-xl overflow-hidden shadow-inner border border-gray-400">
          <div className="w-full overflow-x-auto p-4 flex flex-col gap-8 items-center bg-gray-200">
            {parsedData ? (
              <div className="mobile-preview-wrapper">
                <ContractPrintDocument data={parsedData} />
              </div>
            ) : (
              <p className="text-red-500 font-bold p-10">데이터를 불러오는 데 실패했습니다.</p>
            )}
          </div>
          <div className="bg-gray-800 text-gray-300 text-center py-2 text-xs">
            화면을 스와이프하거나 스크롤하여 계약서 전체 내용을 확인하세요.
          </div>
        </div>

        {/* 오른쪽: 고지사항 및 서명란 */}
        <div className="w-full xl:w-96 flex-shrink-0 space-y-4">
          {/* 고지사항 동의 */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 text-sm text-gray-600 space-y-3">
            <p className="font-bold text-slate-800 text-base">■ 고객 유의 및 고지사항</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>현금/귀금속 등 중요 물품은 고객이 직접 보관 관리합니다.</li>
              <li>도착지 현장 진입 불가 시 추가 작업비가 발생할 수 있습니다.</li>
            </ul>
            <label className="flex items-center gap-2 pt-3 border-t text-slate-900 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                disabled={isSigned}
                className="w-5 h-5 text-blue-600"
              />
              위 견적 내용 및 약관에 동의합니다.
            </label>
          </div>

          {/* 서명 패드 섹션 */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 text-base mb-3">고객 전자서명</h3>
            {isSigned ? (
              <div className="text-center py-6 px-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col items-center gap-3 shadow-xs">
                <div className="w-12 h-12 rounded-full border border-emerald-300 text-emerald-600 flex items-center justify-center bg-white shadow-sm">
                  <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                </div>
                <div>
                  <span className="text-emerald-900 font-bold block text-sm">전자서명이 정상 완료되었습니다.</span>
                  <span className="text-emerald-700 text-xs">안전하게 보관된 계약서를 확인하실 수 있습니다.</span>
                </div>
                
                <div className="w-full flex flex-col gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      fireConfetti();
                      setShowCelebration(true);
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-98"
                  >
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span>체결 확인증 다시보기</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={downloadingPdf}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-98"
                  >
                    <Download className="w-4 h-4" />
                    <span>{downloadingPdf ? 'PDF 생성 중...' : '계약서 PDF 다운로드'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="relative border border-dashed border-gray-300 rounded-lg bg-slate-50 overflow-hidden mb-3">
                  <SignatureCanvas
                    canvasProps={{
                      className: `w-full h-48 ${isPadActive ? 'touch-none' : 'pointer-events-none'}`,
                      style: { touchAction: isPadActive ? 'none' : 'auto' }
                    }}
                    backgroundColor="rgb(248, 250, 252)"
                    ref={sigPad}
                  />

                  {!isPadActive && (
                    <div 
                      className="absolute inset-0 bg-slate-100/95 backdrop-blur-[1px] flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all hover:bg-slate-100/90 z-10"
                      onClick={() => setIsPadActive(true)}
                    >
                      <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2 shadow-sm">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </div>
                      <p className="text-sm font-bold text-gray-800 mb-1">화면 스크롤 보호를 위해 패드가 잠겨있습니다</p>
                      <p className="text-xs text-gray-500 mb-3">서명하시려면 아래 버튼을 눌러주세요</p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsPadActive(true);
                        }}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
                      >
                        <span>✍️ 서명하기 (패드 활성화)</span>
                      </button>
                    </div>
                  )}

                  {isPadActive && (
                    <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        서명 작성 중
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsPadActive(false)}
                        className="px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
                        title="화면 스크롤을 위해 패드를 다시 잠급니다"
                      >
                        패드 잠금
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      sigPad.current?.clear();
                      setIsPadActive(true);
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                  >
                    다시 서명하기 (지우기)
                  </button>
                  {isPadActive && (
                    <button
                      type="button"
                      onClick={() => setIsPadActive(false)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      서명 완료 (패드 잠금)
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSubmitSignature}
                  disabled={submitting}
                  className="w-full py-4 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl shadow text-base disabled:opacity-50"
                >
                  {submitting ? '계약 체결 중...' : '동의 및 계약 확정하기'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 축하 및 체결 완료 모달 */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-blue-100 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-300">
            {/* 닫기 버튼 */}
            <button
              type="button"
              onClick={() => setShowCelebration(false)}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md transition-colors"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>

            {/* 헤더 배너 */}
            <div className="bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 text-white px-6 pt-7 pb-6 text-center relative overflow-hidden">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 mb-3 shadow-lg ring-8 ring-emerald-500/10">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-300 text-xs font-semibold mb-2 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>공식 계약 체결 완료</span>
              </div>

              <h2 className="text-xl font-black tracking-tight text-white mb-2">
                계약이 정상적으로 완료되었습니다!
              </h2>
              <p className="text-xs text-blue-100/90 leading-relaxed font-light max-w-sm mx-auto">
                <strong className="font-semibold text-amber-300">{parsedData?.customerInfo?.name || '고객'}</strong>님의 소중한 새 출발,<br />
                통인익스프레스가 품격과 정성을 다해 안전하게 모시겠습니다.
              </p>
            </div>

            {/* 모달 본문 */}
            <div className="p-5 overflow-y-auto space-y-3.5">
              {/* 핵심 일정 및 비용 요약 카드 */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 pb-1.5 border-b border-slate-200">
                  <Calendar className="w-3.5 h-3.5 text-blue-700" />
                  <span>주요 이사 일정 안내</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/60 shadow-xs">
                    <span className="text-slate-500 text-[11px] block mb-0.5">포장 작업일</span>
                    <span className="font-bold text-slate-900 text-xs">
                      {parsedData?.customerInfo?.packingDate || '협의/미정'}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/60 shadow-xs">
                    <span className="text-slate-500 text-[11px] block mb-0.5">운송/입주일</span>
                    <span className="font-bold text-blue-900 text-xs">
                      {parsedData?.customerInfo?.movingDate || '협의/미정'}
                    </span>
                  </div>
                </div>

                {(() => {
                  const totalSettled = Number(parsedData?.deposit || 0) + Number(parsedData?.balance || 0) + Number(parsedData?.middlePayment || 0);
                  const isVatIncluded = Boolean(
                    parsedData?.includeVat || 
                    (parsedData?.vatAmount && parsedData?.vatAmount > 0) || 
                    (totalSettled > Number(parsedData?.totalCost || 0) && totalSettled === Math.round(Number(parsedData?.totalCost || 0) * 1.1))
                  );
                  const finalTotalCost = isVatIncluded && totalSettled > 0 ? totalSettled : Number(parsedData?.totalCost || 0);

                  return (
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">
                        총 계약 금액 {isVatIncluded ? '(VAT 포함)' : '(VAT 별도)'}
                      </span>
                      <span className="font-extrabold text-blue-950 text-sm">
                        {finalTotalCost.toLocaleString()} 원
                      </span>
                    </div>
                  );
                })()}
              </div>

              {/* 계약금 & 계좌 입금 안내 카드 */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50/70 border border-amber-200 rounded-2xl p-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <CreditCard className="w-3.5 h-3.5 text-amber-700" />
                    <span>계약금(선납) 입금 안내</span>
                  </div>
                  <span className="text-sm font-black text-rose-600">
                    {Number(parsedData?.deposit || 0).toLocaleString()} 원
                  </span>
                </div>

                <p className="text-[11px] text-amber-800/80 mb-2.5 leading-tight">
                  원활한 배차 및 일정 확정을 위해 아래 전용 계좌로 계약금을 입금해 주시기 바랍니다.
                </p>

                <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-amber-200/80 shadow-xs">
                  <div className="text-xs">
                    <span className="font-bold text-slate-800 block text-xs">
                      신한은행 110-340-826378
                    </span>
                    <span className="text-slate-500 text-[10px]">예금주: 김택형 (통인익스프레스)</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyAccount}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all shadow-xs active:scale-95 ${
                      copiedAccount
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-500 hover:bg-amber-600 text-white'
                    }`}
                  >
                    {copiedAccount ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>복사됨!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>계좌 복사</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 text-center">
                전자서명된 원본 계약서는 통인익스프레스 본사 시스템에 공식 보관됩니다.
              </p>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="flex-1 py-3 px-4 bg-blue-900 hover:bg-blue-800 active:scale-98 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{downloadingPdf ? 'PDF 생성 중...' : '계약서 PDF 다운로드'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCelebration(false)}
                className="py-3 px-4 bg-white hover:bg-slate-100 active:scale-98 text-slate-700 border border-slate-300 rounded-xl font-bold text-xs transition-all text-center"
              >
                확인 (계약서 원본 보기)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
