'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import SignatureCanvas from 'react-signature-canvas';
import { ContractPrintDocument, ContractPrintData } from '@/components/pdf/ContractPrintDocument';

export default function CustomerSignPage() {
  const { id } = useParams();
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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
        alert('계약 서명이 완료되었습니다! 감사합니다.');
        setIsSigned(true);
        // 서명 후 로컬 데이터 갱신
        setContract((prev: any) => ({ ...prev, signature_url: signatureBase64 }));
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
        contractDate: contract.contract_date,
        packingDate: contract.packing_date,
        movingDate: contract.moving_date,
        departureAddress: contract.departure_address,
        departureFloor: contract.departure_floor,
        arrivalAddress: contract.arrival_address,
        arrivalFloor: contract.arrival_floor,
        serviceType: contract.service_type,
        arrivalStatus: contract.arrival_status
      },
      rooms: contract.rooms_json ? JSON.parse(contract.rooms_json) : [],
      options: contract.options_json ? JSON.parse(contract.options_json) : [],
      resources: {
        workerMale: contract.worker_count_male,
        workerFemale: contract.worker_count_female
      },
      totalCbm: contract.total_cbm,
      movingCost: contract.moving_cost,
      optionCost: contract.option_cost,
      totalCost: contract.total_cost,
      deposit: contract.deposit,
      balance: contract.balance,
      signatureBase64: contract.signature_url
    };
  } catch (e) {
    console.error("데이터 파싱 에러", e);
  }

  return (
    <div className="w-full min-h-screen bg-slate-100 pb-12 flex flex-col items-center">
      {/* 헤더 */}
      <div className="bg-blue-900 text-white p-4 text-center shadow w-full">
        <h1 className="text-xl font-black">통인익스프레스 견적서 검토</h1>
        <p className="text-sm text-blue-200">내역을 확인하시고 하단에서 서명을 진행해 주세요</p>
      </div>

      <div className="w-full mt-4 flex flex-col xl:flex-row gap-6 max-w-7xl px-4">
        {/* 왼쪽: 계약서 미리보기 (가로 스크롤 가능) */}
        <div className="flex-1 w-full bg-gray-300 rounded-xl overflow-hidden shadow-inner border border-gray-400">
          <div className="w-full h-[600px] xl:h-[800px] overflow-auto p-4 flex flex-col gap-8 items-center bg-gray-200">
            {parsedData ? (
              <ContractPrintDocument data={parsedData} />
            ) : (
              <p className="text-red-500 font-bold p-10">데이터를 불러오는 데 실패했습니다.</p>
            )}
          </div>
          <div className="bg-gray-800 text-gray-300 text-center py-2 text-xs">
            ▲ 화면을 스와이프하거나 스크롤하여 계약서 전체 내용을 확인하세요.
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
              <div className="text-center py-6 bg-emerald-50 rounded-lg border border-emerald-200">
                <span className="text-emerald-700 font-bold">✓ 전자서명이 정상 완료되었습니다.</span>
              </div>
            ) : (
              <div>
                <div className="border border-dashed border-gray-300 rounded-lg bg-slate-50 overflow-hidden mb-3">
                  <SignatureCanvas canvasProps={{ className: 'w-full h-48' }} backgroundColor="rgb(248, 250, 252)" ref={sigPad} />
                </div>
                <button
                  type="button"
                  onClick={() => sigPad.current?.clear()}
                  className="text-sm text-gray-500 underline mb-4 block"
                >
                  다시 서명하기
                </button>
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
    </div>
  );
}
