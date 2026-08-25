'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import SignatureCanvas from 'react-signature-canvas';

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

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 pb-12">
      {/* 헤더 */}
      <div className="bg-blue-900 text-white p-4 text-center shadow">
        <h1 className="text-lg font-black">통인익스프레스 견적서 검토</h1>
        <p className="text-xs text-blue-200">내역을 확인하시고 서명을 진행해 주세요</p>
      </div>

      <div className="p-4 space-y-4">
        {/* 기본 정보 카드 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 space-y-2 text-sm">
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500">고객명</span>
            <span className="font-bold text-slate-800">{contract.customer_name}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500">이사일시</span>
            <span className="font-semibold text-slate-800">{contract.moving_date}</span>
          </div>
          <div className="border-b pb-2">
            <p className="text-gray-500 text-xs">출발지</p>
            <p className="font-medium text-slate-800">{contract.departure_address} ({contract.departure_floor}층)</p>
          </div>
          <div className="border-b pb-2">
            <p className="text-gray-500 text-xs">도착지</p>
            <p className="font-medium text-slate-800">{contract.arrival_address} ({contract.arrival_floor}층)</p>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">서비스 유형</span>
            <span className="font-semibold text-blue-700">{contract.service_type}</span>
          </div>
        </div>

        {/* 정산 요약 카드 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border-2 border-blue-900 space-y-2 text-sm">
          <h3 className="font-bold text-blue-950 border-b pb-1">정산 내역 (VAT 별도)</h3>
          <div className="flex justify-between text-gray-600">
            <span>기본 운송비</span>
            <span>{Number(contract.moving_cost || 0).toLocaleString()} 원</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>부대 옵션비</span>
            <span>{Number(contract.option_cost || 0).toLocaleString()} 원</span>
          </div>
          <div className="flex justify-between font-black text-base text-blue-900 border-t pt-1">
            <span>총 견적금액</span>
            <span>{Number(contract.total_cost || 0).toLocaleString()} 원</span>
          </div>
          <div className="flex justify-between text-rose-600 font-bold">
            <span>잔금 (작업완료 후)</span>
            <span>{Number(contract.balance || 0).toLocaleString()} 원</span>
          </div>
        </div>

        {/* 고지사항 동의 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 text-xs text-gray-600 space-y-2">
          <p className="font-bold text-slate-800">■ 고객 유의 및 고지사항</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>현금/귀금속 등 중요 물품은 고객이 직접 보관 관리합니다.</li>
            <li>도착지 현장 진입 불가 시 추가 작업비가 발생할 수 있습니다.</li>
          </ul>
          <label className="flex items-center gap-2 pt-2 text-slate-900 font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              disabled={isSigned}
              className="w-4 h-4 text-blue-600"
            />
            위 견적 내용 및 약관에 동의합니다.
          </label>
        </div>

        {/* 서명 패드 섹션 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 text-sm mb-2">고객 전자서명</h3>
          {isSigned ? (
            <div className="text-center py-6 bg-emerald-50 rounded-lg border border-emerald-200">
              <span className="text-emerald-700 font-bold text-sm">✓ 전자서명이 정상 완료되었습니다.</span>
            </div>
          ) : (
            <div>
              <div className="border border-dashed border-gray-300 rounded-lg bg-slate-50 overflow-hidden mb-2">
                <SignatureCanvas canvasProps={{ className: 'w-full h-40' }} backgroundColor="rgb(248, 250, 252)" ref={sigPad} />
              </div>
              <button
                type="button"
                onClick={() => sigPad.current?.clear()}
                className="text-xs text-gray-500 underline mb-4 block"
              >
                다시 서명하기
              </button>
              <button
                type="button"
                onClick={handleSubmitSignature}
                disabled={submitting}
                className="w-full py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl shadow text-sm disabled:opacity-50"
              >
                {submitting ? '계약 체결 중...' : '동의 및 계약 확정하기'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
