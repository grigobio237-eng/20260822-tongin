'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, X, FileText, Loader2, Home } from 'lucide-react';
import { WorkOrderPrintDocument } from '@/components/pdf/WorkOrderPrintDocument';

// Types
interface ContractOverview {
  id: string;
  customer_name: string;
  customer_phone: string;
  packing_date: string;
  moving_date: string;
  total_cost: number;
  status: string;
  signature_url: string;
}

export default function SchedulePage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [contracts, setContracts] = useState<ContractOverview[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/contract-list');
      const json = await res.json();
      if (json.success) {
        // 서명이 완료되어 signature_url이 존재하는 진짜 계약 성사 건만 필터링
        const valid = json.data.filter((c: any) => c.status === 'CONFIRMED' && c.signature_url && c.packing_date);
        setContracts(valid);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  // Calendar logic
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 (Sun) to 6 (Sat)
  
  const monthNames = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [currentDate, daysInMonth, firstDayOfMonth]);

  // Group contracts by packing_date
  const contractsByDate = useMemo(() => {
    const map: Record<string, ContractOverview[]> = {};
    contracts.forEach(c => {
      if (!c.packing_date) return;
      if (!map[c.packing_date]) map[c.packing_date] = [];
      map[c.packing_date].push(c);
    });
    return map;
  }, [contracts]);

  const handleContractClick = async (id: string) => {
    setSelectedId(id);
    setDetailLoading(true);
    setDetailData(null);
    try {
      const res = await fetch(`/api/contract-get?id=${id}`);
      const json = await res.json();
      if (json.success && json.data) {
        const contract = json.data;
        const parsedData = {
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
          sttMemo: contract.stt_memo,
          signatureBase64: contract.signature_url || undefined,
        };
        setDetailData(parsedData);
      }
    } catch (e) {
      console.error(e);
      alert('상세 정보를 불러오지 못했습니다.');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedId(null);
    setDetailData(null);
  };

  const handleDownloadWorkOrder = async () => {
    if (!detailData) return;
    setPdfLoading(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('workorder-print-root');
      if (!element) throw new Error('DOM element not found');

      const opt = {
        margin: 0,
        filename: `통인익스프레스_작업지시서_${detailData.customerInfo.name}_${detailData.id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] }
      };

      await html2pdf().set(opt as any).from(element).save();
    } catch (e) {
      console.error('작업지시서 PDF 다운로드 실패:', e);
      alert('PDF 생성 중 오류가 발생했습니다.');
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white border-b shadow-sm w-full sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-black text-xl text-blue-900 tracking-tight">통인익스프레스</span>
            <span className="text-gray-500 font-bold ml-2">일정 관리</span>
          </div>
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors"
          >
            <Home size={18} />
            <span className="text-sm font-bold">홈으로</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-6">
        <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
            </h1>
            <div className="flex gap-2">
              <button onClick={handlePrevMonth} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                <ChevronLeft size={20} />
              </button>
              <button onClick={handleNextMonth} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center items-center">
              <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                {dayNames.map((day, idx) => (
                  <div key={day} className={`py-3 text-center text-sm font-bold ${idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : 'text-gray-600'}`}>
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 auto-rows-[120px] bg-gray-200 gap-[1px]">
                {calendarDays.map((day, idx) => {
                  if (day === null) {
                    return <div key={`empty-${idx}`} className="bg-gray-50/50"></div>;
                  }

                  const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const dayContracts = contractsByDate[dateStr] || [];
                  
                  const isSunday = idx % 7 === 0;
                  const isSaturday = idx % 7 === 6;

                  return (
                    <div key={day} className="bg-white p-1 md:p-2 overflow-y-auto hover:bg-gray-50 transition-colors flex flex-col group relative">
                      <span className={`text-xs md:text-sm font-bold mb-1 ${isSunday ? 'text-red-500' : isSaturday ? 'text-blue-500' : 'text-gray-700'}`}>
                        {day}
                      </span>
                      <div className="flex flex-col gap-1">
                        {dayContracts.map(c => (
                          <button
                            key={c.id}
                            onClick={() => handleContractClick(c.id)}
                            className="text-left w-full bg-blue-100 hover:bg-blue-200 text-blue-800 text-[10px] md:text-xs rounded px-1.5 py-1 truncate font-medium transition-colors"
                          >
                            {c.customer_name}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal for detail and download */}
      {selectedId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800">계약 상세 및 출력</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              {detailLoading ? (
                <div className="py-12 flex justify-center items-center">
                  <Loader2 className="animate-spin text-blue-500" size={32} />
                </div>
              ) : detailData ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500">고객명</label>
                    <p className="text-base font-medium">{detailData.customerInfo.name}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500">연락처</label>
                    <p className="text-base font-medium">{detailData.customerInfo.phone}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500">포장일</label>
                      <p className="text-base font-medium">{detailData.customerInfo.packingDate}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500">운송일</label>
                      <p className="text-base font-medium">{detailData.customerInfo.movingDate}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500">출발지</label>
                    <p className="text-sm font-medium break-words">{detailData.customerInfo.departureAddress}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500">도착지</label>
                    <p className="text-sm font-medium break-words">{detailData.customerInfo.arrivalAddress}</p>
                  </div>
                </div>
              ) : (
                <p className="text-red-500 text-center py-4">데이터를 불러오지 못했습니다.</p>
              )}
            </div>

            <div className="px-6 py-4 border-t bg-gray-50">
              <button
                onClick={handleDownloadWorkOrder}
                disabled={detailLoading || pdfLoading || !detailData}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 disabled:opacity-50 transition-colors"
              >
                {pdfLoading ? <Loader2 size={20} className="animate-spin" /> : <FileText size={20} />}
                {pdfLoading ? '작업지시서 생성 중...' : '작업지시서 PDF 다운로드'}
              </button>
            </div>
          </div>

          {/* Hidden PDF Render Target */}
          {detailData && (
            <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
              <WorkOrderPrintDocument data={{...detailData, materials: detailData.resources?.materials}} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
