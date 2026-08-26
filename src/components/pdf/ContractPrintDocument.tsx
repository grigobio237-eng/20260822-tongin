import React from 'react';

export interface ContractPrintData {
  id: string;
  customerInfo: {
    name: string;
    phone: string;
    contractDate: string;
    packingDate: string;
    movingDate: string;
    departureAddress: string;
    departureFloor: number;
    arrivalAddress: string;
    arrivalFloor: number;
    serviceType: string;
    arrivalStatus: string;
    departureConditions?: string[];
    arrivalConditions?: string[];
  };
  rooms?: Array<{
    id: string;
    name: string;
    items: Array<{ name: string; quantity: number; cbm: number }>;
    memo?: string;
    images?: string[];
  }>;
  options?: Array<{ name: string; quantity: number; unitPrice: number; totalPrice: number }>;
  resources?: {
    vehicles?: Record<string, number>;
    workerMale?: number;
    workerFemale?: number;
  };
  totalCbm: number;
  movingCost: number;
  optionCost: number;
  totalCost: number;
  deposit: number;
  balance: number;
  signatureBase64?: string;
  sttMemo?: string;
}

export const ContractPrintDocument: React.FC<{ data: ContractPrintData }> = ({ data }) => {
  const { customerInfo: c, resources: r } = data;

  return (
    <div id="contract-print-root" className="bg-white text-slate-800 font-sans text-[11px] leading-tight select-none">
      
      {/* ================= PAGE 1: 계약 총괄 요약 / 정산 / 서명 ================= */}
      <div className="w-[210mm] h-[296mm] p-[12mm] mx-auto box-border flex flex-col justify-between" style={{ pageBreakAfter: 'always' }}>
        <div>
          {/* 헤더 */}
          <div className="flex justify-between items-end border-b-2 border-blue-900 pb-2 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-blue-900 tracking-tight">통인익스프레스</span>
                <span className="text-sm font-bold text-slate-700">이사견적·계약서</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-0.5">기분 좋은 프리미엄 이사 서비스</p>
            </div>
            <div className="text-right text-[10px]">
              <p className="text-gray-500">계약번호: <span className="font-mono font-bold text-slate-800">{data.id}</span></p>
              <p className="text-gray-500">발행일자: {c?.contractDate || '-'}</p>
            </div>
          </div>

          {/* 1. 계약 기본 정보 */}
          <table className="w-full border-collapse border border-slate-300 mb-3">
            <tbody>
              <tr className="bg-slate-50">
                <th className="border border-slate-300 p-1.5 w-20 text-center font-bold">고객명</th>
                <td className="border border-slate-300 p-1.5 font-semibold">{c?.name || '-'}</td>
                <th className="border border-slate-300 p-1.5 w-20 text-center font-bold">연락처</th>
                <td className="border border-slate-300 p-1.5 font-semibold">{c?.phone || '-'}</td>
              </tr>
              <tr>
                <th className="border border-slate-300 p-1.5 text-center bg-slate-50 font-bold">출발지</th>
                <td className="border border-slate-300 p-1.5">{c?.departureAddress || '-'} ({c?.departureFloor || 1}층)</td>
                <th className="border border-slate-300 p-1.5 text-center bg-slate-50 font-bold">도착지</th>
                <td className="border border-slate-300 p-1.5">{c?.arrivalAddress || '-'} ({c?.arrivalFloor || 1}층)</td>
              </tr>
              <tr>
                <th className="border border-slate-300 p-1.5 text-center bg-slate-50 font-bold">포장일시</th>
                <td className="border border-slate-300 p-1.5">{c?.packingDate || '-'}</td>
                <th className="border border-slate-300 p-1.5 text-center bg-slate-50 font-bold">운송일시</th>
                <td className="border border-slate-300 p-1.5">{c?.movingDate || '-'}</td>
              </tr>
              <tr>
                <th className="border border-slate-300 p-1.5 text-center bg-slate-50 font-bold">서비스구분</th>
                <td className="border border-slate-300 p-1.5">{c?.serviceType || '포장이사'}</td>
                <th className="border border-slate-300 p-1.5 text-center bg-slate-50 font-bold">도착지상황</th>
                <td className="border border-slate-300 p-1.5">{c?.arrivalStatus || '당일이사'}</td>
              </tr>
            </tbody>
          </table>

          {/* 2. 물량 및 리소스 계획 */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="border border-slate-300 p-2.5 rounded bg-slate-50/50">
              <h4 className="font-bold text-blue-900 border-b border-slate-200 pb-1 mb-1.5 text-[11px]">물량 및 공간 분석</h4>
              <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                <span>총 산출 물량 (부피)</span>
                <span className="font-bold text-blue-800 text-xs">{data.totalCbm || 0} CBM</span>
              </div>
              <div className="flex justify-between py-1">
                <span>작업 구역 구성</span>
                <span className="font-semibold">{data.rooms?.length || 0} 개 구역 (룸/거실/주방 등)</span>
              </div>
            </div>
            <div className="border border-slate-300 p-2.5 rounded bg-slate-50/50">
              <h4 className="font-bold text-blue-900 border-b border-slate-200 pb-1 mb-1.5 text-[11px]">작업 투입 인력 및 장비</h4>
              <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                <span>전문 패커/정리 인력</span>
                <span className="font-semibold">남 {r?.workerMale || 0}명 / 여 {r?.workerFemale || 0}명</span>
              </div>
              <div className="flex justify-between py-1">
                <span>투입 차량 규격</span>
                <span className="font-semibold">현장 견적 최적 배차</span>
              </div>
            </div>
          </div>

          {/* 3. 비용 정산 내역 */}
          <div className="border-2 border-blue-900 rounded p-2.5 bg-blue-50/20 mb-3">
            <h4 className="font-bold text-blue-900 border-b border-blue-200 pb-1 mb-1.5 text-[11px]">최종 비용 정산 (VAT 별도)</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <div className="flex justify-between border-b border-slate-200 py-0.5">
                <span>이사 기본 운송료</span>
                <span className="font-semibold">{Number(data.movingCost || 0).toLocaleString()} 원</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 py-0.5">
                <span>선택 부대 옵션 비용</span>
                <span className="font-semibold">{Number(data.optionCost || 0).toLocaleString()} 원</span>
              </div>
              <div className="flex justify-between border-b border-blue-400 py-1 text-blue-950 font-bold col-span-2 text-xs">
                <span>총 계약 합계 금액</span>
                <span>{Number(data.totalCost || 0).toLocaleString()} 원</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>계약금 (선납)</span>
                <span className="font-semibold text-emerald-700">{Number(data.deposit || 0).toLocaleString()} 원</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="font-bold text-rose-700">잔금 (작업완료 시)</span>
                <span className="font-bold text-rose-700 text-xs">{Number(data.balance || 0).toLocaleString()} 원</span>
              </div>
            </div>
          </div>

          {/* 4. 고지사항 안내 */}
          <div className="border border-slate-200 bg-slate-50 p-2 rounded text-[9.5px] text-slate-600 leading-relaxed mb-3">
            <p className="font-bold text-slate-800 mb-0.5">■ 계약 약관 및 주의사항</p>
            <ul className="list-disc pl-3.5 space-y-0.5">
              <li>현금, 유가증권, 귀금속 등 중요 귀중품은 고객 직접 운반이 원칙이며 사업자는 분실 책임을 지지 않습니다.</li>
              <li>도배/장판 대기 시 현장 대기료가 발생하며, 에어컨 배관 및 가스 연결 등의 부자재비는 별도 청구됩니다.</li>
              <li>현장 진입 불가(사다리차 작업 불가, 계단 이송 등) 시 환경에 따른 추가 인건비가 발생할 수 있습니다.</li>
            </ul>
          </div>
        </div>

        {/* 5. 견적담당자 및 전자서명란 */}
        <div className="border-t border-slate-300 pt-2 flex justify-between items-center">
          <div className="text-[10px] text-slate-600 space-y-0.5">
            <p className="font-semibold text-slate-800">통인익스프레스 견적 담당: 김택형 (010-4880-9424)</p>
            <p>입금 계좌: 신한은행 110-340-826378 (예금주: 김택형)</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs">고객 전자서명:</span>
            <div className="w-32 h-12 border border-slate-400 bg-white flex items-center justify-center rounded overflow-hidden">
              {data.signatureBase64 ? (
                <img src={data.signatureBase64} alt="고객서명" className="max-h-full max-w-full object-contain" />
              ) : (
                <span className="text-gray-400 text-[9px]">서명 완료</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= PAGE 2: 공간별 상세 물품 목록 및 특이사항 ================= */}
      <div className="w-[210mm] h-[296mm] p-[12mm] mx-auto box-border flex flex-col justify-between" style={{ pageBreakAfter: 'always' }}>
        <div>
          <div className="flex justify-between items-end border-b-2 border-blue-900 pb-2 mb-3">
            <div>
              <h2 className="text-base font-black text-blue-900">공간별 상세 이사 물품 목록</h2>
              <p className="text-[10px] text-gray-500">구역별 짐 목록 및 고객 요청사항</p>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">Page 2 / Item Details</span>
          </div>

          <div className="space-y-3">
            {data.rooms && data.rooms.length > 0 ? (
              data.rooms.map((room, idx) => (
                <div key={room.id || idx} className="border border-slate-300 rounded overflow-hidden">
                  <div className="bg-slate-100 px-2.5 py-1 flex justify-between items-center border-b border-slate-200">
                    <span className="font-bold text-blue-900 text-[11px]">{room.name}</span>
                    <span className="text-[10px] text-slate-500">등록 품목: {room.items?.length || 0}개</span>
                  </div>
                  
                  {room.items && room.items.length > 0 ? (
                    <div className="p-2">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                        {room.items.map((item, itemIdx) => (
                          <div key={itemIdx} className="flex justify-between border-b border-dotted border-slate-200 py-0.5">
                            <span className="text-slate-700">{item.name}</span>
                            <span className="font-semibold text-slate-900">{item.quantity}개 {item.cbm ? `(${Math.round(item.cbm * 10) / 10} CBM)` : ''}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400 p-2 text-[10px]">해당 공간에 등록된 품목이 없습니다.</p>
                  )}

                  {room.memo && (
                    <div className="bg-amber-50/70 border-t border-amber-200 px-2.5 py-1 text-[9.5px] text-amber-900">
                      <span className="font-bold mr-1">⚠️ 공간 주의/요청 메모:</span>
                      {room.memo}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-20 text-gray-400">등록된 공간별 물품 데이터가 없습니다.</div>
            )}
          </div>
        </div>

        <div className="border-t border-slate-200 pt-1.5 text-center text-[9px] text-gray-400">
          통인익스프레스 안심 이사 리포트 - 공간별 물품 세부 명세
        </div>
      </div>

      {/* ================= PAGE 3: 선택 옵션 & 현장 사진 갤러리 ================= */}
      <div className="w-[210mm] h-[296mm] p-[12mm] mx-auto box-border flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-end border-b-2 border-blue-900 pb-2 mb-3">
            <div>
              <h2 className="text-base font-black text-blue-900">선택 부대옵션 및 현장 사진 기록</h2>
              <p className="text-[10px] text-gray-500">분쟁 방지를 위한 사전 가구 상태 및 특이사항 기록</p>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">Page 3 / Photo & Options</span>
          </div>

          {/* 옵션 명세 */}
          {data.options && data.options.length > 0 && (
            <div className="mb-4">
              <h4 className="font-bold text-slate-800 text-[11px] mb-1">■ 선택 부대 옵션 명세</h4>
              <table className="w-full border-collapse border border-slate-300 text-[10px]">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-300 text-slate-600">
                    <th className="p-1 text-left">항목명</th>
                    <th className="p-1 text-center w-14">수량</th>
                    <th className="p-1 text-right w-24">단가</th>
                    <th className="p-1 text-right w-28">합계 금액</th>
                  </tr>
                </thead>
                <tbody>
                  {data.options.map((opt, i) => (
                    <tr key={i} className="border-b border-slate-200">
                      <td className="p-1">{opt.name}</td>
                      <td className="p-1 text-center font-semibold">{opt.quantity}</td>
                      <td className="p-1 text-right">{opt.unitPrice?.toLocaleString()} 원</td>
                      <td className="p-1 text-right font-semibold">{opt.totalPrice?.toLocaleString()} 원</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 사진 갤러리 (최대 6장 2열 배치) */}
          <div>
            <h4 className="font-bold text-slate-800 text-[11px] mb-1.5">■ 현장 가구 상태 및 특이사항 사진</h4>
            <div className="grid grid-cols-2 gap-3">
              {data.rooms?.flatMap(r => (r.images || []).map((imgUrl, i) => ({ roomName: r.name, url: imgUrl, key: `${r.id}-${i}` }))).slice(0, 6).map((photo) => (
                <div key={photo.key} className="border border-slate-300 rounded p-1.5 bg-slate-50">
                  <div className="h-32 w-full bg-slate-200 rounded overflow-hidden flex items-center justify-center mb-1">
                    <img src={photo.url} alt="현장사진" className="max-h-full max-w-full object-cover" crossOrigin="anonymous" />
                  </div>
                  <p className="text-[9px] text-slate-600 font-semibold">{photo.roomName} 현장 기록</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-1.5 text-center text-[9px] text-gray-400">
          본 리포트는 고객과의 신뢰를 바탕으로 작성된 공식 견적·계약 증빙 자료입니다.
        </div>
      </div>
    </div>
  );
};
