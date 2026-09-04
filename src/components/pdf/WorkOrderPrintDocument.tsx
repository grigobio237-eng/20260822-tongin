import React from 'react';
import { ContractPrintData } from './ContractPrintDocument';

export interface WorkOrderPrintData extends ContractPrintData {
  materials?: Record<string, number>;
}

export const WorkOrderPrintDocument: React.FC<{ data: WorkOrderPrintData }> = ({ data }) => {
  const { customerInfo: c, resources: r, rooms, sttMemo, materials, deposit, balance, options } = data;

  const totalWorkers = (r?.workerMale || 0) + (r?.workerFemale || 0);
  
  return (
    <div id="workorder-print-root" className="bg-white text-slate-800 font-sans text-[11px] leading-[1.4] select-none">
      <div className="w-[210mm] min-h-[273mm] px-[12mm] mx-auto box-border flex flex-col gap-4">
        {/* 헤더 */}
        <div className="flex justify-between items-end border-b-2 border-blue-900 pb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-blue-900 tracking-tight">통인익스프레스</span>
              <span className="text-sm font-bold text-slate-700">작업 지시서</span>
            </div>
          </div>
          <div className="text-right text-[10px]">
            <p className="text-gray-500">발행일자: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* 1. 작업 개요 (주소 및 일정) */}
        <div className="break-inside-avoid">
          <h4 className="font-bold text-blue-900 mb-1 border-l-2 border-blue-900 pl-2 pb-[2px]">1. 작업 개요</h4>
          <table className="w-full border-collapse border border-slate-300">
            <tbody>
              <tr>
                <th className="border border-slate-300 p-1.5 w-24 text-center bg-slate-50 font-bold">출발지</th>
                <td className="border border-slate-300 p-1.5">{c?.departureAddress || '-'} ({c?.departureFloor || 1}층)</td>
                <th className="border border-slate-300 p-1.5 w-24 text-center bg-slate-50 font-bold">도착지</th>
                <td className="border border-slate-300 p-1.5">{c?.arrivalAddress || '-'} ({c?.arrivalFloor || 1}층)</td>
              </tr>
              <tr>
                <th className="border border-slate-300 p-1.5 text-center bg-slate-50 font-bold">포장일</th>
                <td className="border border-slate-300 p-1.5">{c?.packingDate || '-'}</td>
                <th className="border border-slate-300 p-1.5 text-center bg-slate-50 font-bold">운송일</th>
                <td className="border border-slate-300 p-1.5">{c?.movingDate || '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 2. 작업 조건 및 자원 */}
        <div className="grid grid-cols-2 gap-4 break-inside-avoid">
          <div>
            <h4 className="font-bold text-blue-900 mb-1 border-l-2 border-blue-900 pl-2 pb-[2px]">2. 작업 조건</h4>
            <table className="w-full border-collapse border border-slate-300">
              <tbody>
                <tr>
                  <th className="border border-slate-300 p-1.5 w-24 text-center bg-slate-50 font-bold">출발지 조건</th>
                  <td className="border border-slate-300 p-1.5">{c?.departureConditions?.join(', ') || '-'}</td>
                </tr>
                <tr>
                  <th className="border border-slate-300 p-1.5 text-center bg-slate-50 font-bold">도착지 조건</th>
                  <td className="border border-slate-300 p-1.5">{c?.arrivalConditions?.join(', ') || '-'}</td>
                </tr>
                <tr>
                  <th className="border border-slate-300 p-1.5 text-center bg-slate-50 font-bold">작업 인원</th>
                  <td className="border border-slate-300 p-1.5">
                    남 {r?.workerMale || 0}명, 여 {r?.workerFemale || 0}명 (총 {totalWorkers}명)
                  </td>
                </tr>
                <tr>
                  <th className="border border-slate-300 p-1.5 text-center bg-slate-50 font-bold">투입 차량</th>
                  <td className="border border-slate-300 p-1.5">
                    {[
                      r?.vehicles?.fiveTon ? `5톤 ${r.vehicles.fiveTon}대` : null,
                      r?.vehicles?.twoHalfTon ? `2.5톤 ${r.vehicles.twoHalfTon}대` : null,
                      r?.vehicles?.oneTon ? `1톤 ${r.vehicles.oneTon}대` : null,
                    ].filter(Boolean).join(', ') || '차량 없음'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <h4 className="font-bold text-blue-900 mb-1 border-l-2 border-blue-900 pl-2 pb-[2px]">3. 수금 현황</h4>
            <table className="w-full border-collapse border border-slate-300">
              <tbody>
                <tr>
                  <th className="border border-slate-300 p-1.5 w-24 text-center bg-slate-50 font-bold text-blue-700">계약금</th>
                  <td className="border border-slate-300 p-1.5 text-blue-700 font-bold text-right">{deposit?.toLocaleString()}원</td>
                </tr>
                <tr>
                  <th className="border border-slate-300 p-1.5 text-center bg-slate-50 font-bold text-red-700">현장수금액 (잔금)</th>
                  <td className="border border-slate-300 p-1.5 text-red-700 font-bold text-right">{balance?.toLocaleString()}원</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. 고객 특이사항 및 협의사항 */}
        <div className="break-inside-avoid">
          <h4 className="font-bold text-blue-900 mb-1 border-l-2 border-blue-900 pl-2 pb-[2px]">4. 고객 특이사항 및 추가 옵션</h4>
          <div className="border border-slate-300 p-2 min-h-[50px] bg-yellow-50/50">
            <p className="font-bold mb-1">■ 현장 특이사항 (메모)</p>
            <p className="text-gray-700 whitespace-pre-wrap">{sttMemo || '입력된 특이사항이 없습니다.'}</p>
            {options && options.length > 0 && (
              <>
                <p className="font-bold mt-2 mb-1 border-t pt-1 border-slate-200">■ 고객 협의 추가 옵션</p>
                <div className="flex gap-2 flex-wrap">
                  {options.map((opt, i) => (
                    <span key={i} className="bg-white border rounded px-1.5 py-0.5 text-[10px] font-semibold">{opt.name}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* 5. 포장 재료 준비 목록 */}
        <div className="break-inside-avoid">
          <h4 className="font-bold text-blue-900 mb-1 border-l-2 border-blue-900 pl-2 pb-[2px]">5. 포장 재료 준비 목록</h4>
          <div className="border border-slate-300 p-2 min-h-[50px] bg-gray-50 rounded">
            {materials && Object.keys(materials).length > 0 ? (
              <div className="flex gap-2 flex-wrap">
                {Object.entries(materials)
                  .filter(([k, v]) => v > 0)
                  .map(([k, v]) => (
                    <span key={k} className="bg-white border border-slate-300 rounded px-2 py-1 text-[11px] font-bold shadow-sm">
                      {k}: <span className="text-blue-700">{v}</span>
                    </span>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500 text-[11px]">기본 재료만 준비</p>
            )}
          </div>
        </div>

        {/* 6. 공간별 상세 이사 물품 목록과 주의사항 */}
        <div className="flex-1 w-full" style={{ pageBreakBefore: 'always' }}>
          <h4 className="font-bold text-blue-900 mb-1 border-l-2 border-blue-900 pl-2 pb-[2px]">6. 공간별 상세 물품 목록 및 주의사항</h4>
          <div className="flex flex-row flex-wrap gap-4">
            {rooms?.filter(r => r.items.length > 0 || r.memo).map(room => (
              <div key={room.name} className="border border-slate-300 p-2 rounded break-inside-avoid w-[calc(50%-0.5rem)] flex-none bg-white shadow-sm">
                <div className="flex justify-between items-end border-b border-slate-200 pb-1 mb-1">
                  <h5 className="font-bold text-slate-800 text-sm">{room.name}</h5>
                </div>
                <div className="space-y-1">
                  {room.items.length > 0 ? (
                    room.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-[10px] py-[1px]">
                        <span className="flex-1 pb-[2px]">{item.name}</span>
                        <span className="font-bold w-12 text-right">{item.quantity}개</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-[10px]">물품 없음</p>
                  )}
                </div>
                {room.memo && (
                  <div className="mt-2 bg-red-50 p-1.5 border border-red-100 rounded">
                    <span className="font-bold text-red-600 text-[10px]">주의/메모:</span>
                    <p className="text-[10px] text-red-800 whitespace-pre-wrap mt-0.5">{room.memo}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 7. 고객 확인 서명란 */}
        <div className="mt-2 border-2 border-slate-300 p-4 rounded bg-slate-50 flex justify-between items-center break-inside-avoid">
          <div className="flex-1">
            <p className="font-bold text-slate-800 text-[12px] mb-1">■ 고객 작업 완료 확인</p>
            <p className="text-[11px] text-gray-700">
              위 명시된 이사 물품 목록 및 상태를 이상 없이 확인하였으며,<br />
              모든 작업이 성공적으로 완료되었음을 확인합니다.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 w-64">
            <div className="flex justify-between w-full text-[11px]">
              <span className="text-gray-600">작업 완료일(운송일):</span>
              <span className="font-bold text-slate-800">{c?.movingDate || '-'}</span>
            </div>
            <div className="flex justify-between items-end w-full">
              <span className="text-gray-600 text-[11px]">고객 성명:</span>
              <div className="flex items-end gap-2 border-b border-slate-400 pb-1 w-48 justify-end">
                <span className="font-bold text-slate-800 text-[13px]">{c?.name || ''}</span>
                <span className="text-gray-500 text-[11px]">(서명/인)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-[10px] text-gray-500 border-t pt-2 mt-2">
          본 작업지시서는 현장 작업자용으로 고객에게 배포하지 마십시오. / 통인익스프레스
        </div>
      </div>
    </div>
  );
};
