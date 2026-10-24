'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, ChevronRight, X, FileText, Loader2, Home, Edit, 
  Truck, CalendarCheck, CheckCircle2, Clock, ExternalLink, Copy, Check 
} from 'lucide-react';
import { WorkOrderPrintDocument } from '@/components/pdf/WorkOrderPrintDocument';
import { useWizardStore } from '@/store/wizardStore';
import clsx from 'clsx';

// Types
interface ContractOverview {
  id: string;
  customer_name: string;
  customer_phone: string;
  secondary_phone?: string;
  contract_date?: string;
  packing_date: string;
  moving_date: string;
  total_cost: number;
  status: string;
  signature_url: string;
  created_at?: number;
}

export default function SchedulePage() {
  const router = useRouter();
  const hydrateContract = useWizardStore((state) => state.hydrateContract);
  
  // Tab state: 'moving' (계약 이사 일정) vs 'consultation' (견적 상담 일정)
  const [activeTab, setActiveTab] = useState<'moving' | 'consultation'>('moving');
  const [consultationFilter, setConsultationFilter] = useState<'all' | 'pending' | 'signed'>('all');
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [allContracts, setAllContracts] = useState<ContractOverview[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/contract-list');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAllContracts(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/contract-get?id=${id}`);
      const json = await res.json();
      if (json.success && json.data) {
        hydrateContract(json.data);
        router.push('/step1');
      } else {
        alert('견적서 정보를 불러오는데 실패했습니다.');
      }
    } catch(e) {
      alert('오류가 발생했습니다.');
    }
  };

  // Month navigation
  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  // Filtered lists
  // 1. 계약 성사된 이사 일정 (서명 완료 건)
  const movingContracts = useMemo(() => {
    return allContracts.filter(c => !!c.signature_url && (c.packing_date || c.moving_date));
  }, [allContracts]);

  // 2. 견적 상담 건
  const consultationContracts = useMemo(() => {
    return allContracts.filter(c => {
      if (!c.customer_name) return false;
      if (consultationFilter === 'pending') return !c.signature_url;
      if (consultationFilter === 'signed') return !!c.signature_url;
      return true;
    });
  }, [allContracts, consultationFilter]);

  // Counts
  const movingCount = movingContracts.length;
  const pendingCount = useMemo(() => allContracts.filter(c => !c.signature_url).length, [allContracts]);
  const signedCount = useMemo(() => allContracts.filter(c => !!c.signature_url).length, [allContracts]);
  const totalConsultationCount = allContracts.length;

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
  }, [daysInMonth, firstDayOfMonth]);

  // Group events by date based on activeTab
  const eventsByDate = useMemo(() => {
    const map: Record<string, {
      id: string;
      name: string;
      type: 'same-day' | 'packing' | 'moving' | 'consultation-pending' | 'consultation-signed';
      badgeText: string;
      cost?: number;
    }[]> = {};
    
    const addEvent = (date: string, event: {
      id: string;
      name: string;
      type: 'same-day' | 'packing' | 'moving' | 'consultation-pending' | 'consultation-signed';
      badgeText: string;
      cost?: number;
    }) => {
      if (!date || !date.includes('-')) return;
      if (!map[date]) map[date] = [];
      map[date].push(event);
    };

    if (activeTab === 'moving') {
      // 계약 성사된 이사 일정 (포장일 / 운송일)
      movingContracts.forEach(c => {
        const hasPacking = !!c.packing_date;
        const hasMoving = !!c.moving_date;

        if (hasPacking && hasMoving && c.packing_date !== c.moving_date) {
          addEvent(c.packing_date, { id: c.id, name: c.customer_name, type: 'packing', badgeText: `[포장] ${c.customer_name}` });
          addEvent(c.moving_date, { id: c.id, name: c.customer_name, type: 'moving', badgeText: `[운송] ${c.customer_name}` });
        } else if (hasPacking) {
          addEvent(c.packing_date, { id: c.id, name: c.customer_name, type: 'same-day', badgeText: c.customer_name });
        } else if (hasMoving) {
          addEvent(c.moving_date, { id: c.id, name: c.customer_name, type: 'same-day', badgeText: c.customer_name });
        }
      });
    } else {
      // 견적 상담 일정 (견적상담일 contract_date 기준)
      consultationContracts.forEach(c => {
        let targetDate = c.contract_date;
        if (!targetDate && c.created_at) {
          try {
            targetDate = new Date(c.created_at * 1000).toISOString().split('T')[0];
          } catch (e) {}
        }
        if (!targetDate) targetDate = c.moving_date;

        if (targetDate) {
          const isSigned = !!c.signature_url;
          addEvent(targetDate, {
            id: c.id,
            name: c.customer_name,
            type: isSigned ? 'consultation-signed' : 'consultation-pending',
            badgeText: isSigned ? `[성사] ${c.customer_name}` : `[상담] ${c.customer_name}`,
            cost: c.total_cost
          });
        }
      });
    }

    return map;
  }, [activeTab, movingContracts, consultationContracts]);

  const handleContractClick = async (id: string) => {
    setSelectedId(id);
    setDetailLoading(true);
    setDetailData(null);
    setCopiedLink(false);
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
            departureConditions: contract.departure_conditions ? contract.departure_conditions.split(',').filter(Boolean) : [],
            departureLadderCount: contract.departure_ladder_count || 1,
            arrivalConditions: contract.arrival_conditions ? contract.arrival_conditions.split(',').filter(Boolean) : [],
            arrivalLadderCount: contract.arrival_ladder_count || 1
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
          middlePayment: contract.middle_payment || 0,
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
    setCopiedLink(false);
  };

  const handleCopySignLink = () => {
    if (!selectedId) return;
    const url = `${window.location.origin}/sign/${selectedId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  const handleDownloadWorkOrder = async () => {
    if (!detailData) return;
    setPdfLoading(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('workorder-print-root');
      if (!element) throw new Error('DOM element not found');

      const opt: any = {
        margin: [12, 0, 12, 0],
        filename: `통인익스프레스_작업지시서_${detailData.customerInfo.name}_${detailData.id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (e) {
      console.error(e);
      alert('PDF 생성 중 오류가 발생했습니다.');
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 pb-12">
      {/* Top Header */}
      <header className="bg-white border-b sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-blue-600">통인익스프레스</h1>
            <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
              일정 관리
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/admin/contracts')}
              className="hidden sm:flex items-center gap-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
            >
              <FileText size={16} />
              <span>계약 목록</span>
            </button>
            <button
              onClick={() => router.push('/step1')}
              className="flex items-center gap-1.5 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
            >
              <Home size={16} />
              <span>새 견적 / 홈</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-6 space-y-4">
        {/* Diary Tab Switcher */}
        <div className="bg-white rounded-2xl shadow-sm border p-1.5 flex gap-2">
          <button
            onClick={() => setActiveTab('moving')}
            className={clsx(
              "flex-1 py-3 px-4 rounded-xl font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2",
              activeTab === 'moving'
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            )}
          >
            <Truck size={19} />
            <span>계약 이사 일정</span>
            <span className={clsx(
              "text-xs px-2 py-0.5 rounded-full font-bold transition-colors",
              activeTab === 'moving' ? "bg-white text-blue-700" : "bg-gray-200 text-gray-700"
            )}>
              {movingCount}건
            </span>
          </button>

          <button
            onClick={() => setActiveTab('consultation')}
            className={clsx(
              "flex-1 py-3 px-4 rounded-xl font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2",
              activeTab === 'consultation'
                ? "bg-amber-600 text-white shadow-md shadow-amber-500/20"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            )}
          >
            <CalendarCheck size={19} />
            <span>견적 상담 일정</span>
            <span className={clsx(
              "text-xs px-2 py-0.5 rounded-full font-bold transition-colors",
              activeTab === 'consultation' ? "bg-white text-amber-700" : "bg-gray-200 text-gray-700"
            )}>
              {totalConsultationCount}건
            </span>
          </button>
        </div>

        {/* Sub Filter & Legend Area */}
        <div className="bg-white rounded-xl shadow-sm border p-3 md:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          {activeTab === 'moving' ? (
            <div className="flex items-center gap-2 flex-wrap text-xs text-gray-600">
              <span className="font-bold text-gray-700 mr-1">일정 구분:</span>
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium">
                ■ 당일 이사
              </span>
              <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 px-2 py-0.5 rounded font-medium">
                ■ [포장] 보관/포장일
              </span>
              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium">
                ■ [운송] 운송일
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-gray-700 mr-1">상담 필터:</span>
              <button
                onClick={() => setConsultationFilter('all')}
                className={clsx(
                  "text-xs px-2.5 py-1 rounded-full font-semibold transition-colors",
                  consultationFilter === 'all'
                    ? "bg-amber-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                전체 상담 ({totalConsultationCount})
              </button>
              <button
                onClick={() => setConsultationFilter('pending')}
                className={clsx(
                  "text-xs px-2.5 py-1 rounded-full font-semibold transition-colors",
                  consultationFilter === 'pending'
                    ? "bg-amber-600 text-white"
                    : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
                )}
              >
                상담 진행중/미서명 ({pendingCount})
              </button>
              <button
                onClick={() => setConsultationFilter('signed')}
                className={clsx(
                  "text-xs px-2.5 py-1 rounded-full font-semibold transition-colors",
                  consultationFilter === 'signed'
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                )}
              >
                계약 성사 ({signedCount})
              </button>
            </div>
          )}

          <div className="text-xs text-gray-400">
            {activeTab === 'moving' ? '* 서명 완료된 실제 계약 건만 표시됩니다.' : '* 견적(상담)일자 기준으로 일정이 표시됩니다.'}
          </div>
        </div>

        {/* Calendar Card */}
        <div className="bg-white rounded-2xl shadow-sm border p-4 md:p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl md:text-2xl font-black text-gray-900">
                {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
              </h2>
              <button
                onClick={handleToday}
                className="text-xs font-bold px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                오늘
              </button>
            </div>
            <div className="flex gap-1.5">
              <button 
                onClick={handlePrevMonth} 
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-700 transition-colors"
                title="이전 달"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={handleNextMonth} 
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-700 transition-colors"
                title="다음 달"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-24 flex justify-center items-center">
              <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
          ) : (
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="grid grid-cols-7 bg-gray-100/70 border-b border-gray-200">
                {dayNames.map((day, idx) => (
                  <div key={day} className={`py-2.5 text-center text-xs md:text-sm font-bold ${idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : 'text-gray-700'}`}>
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 auto-rows-[115px] sm:auto-rows-[125px] bg-gray-200 gap-[1px]">
                {calendarDays.map((day, idx) => {
                  if (day === null) {
                    return <div key={`empty-${idx}`} className="bg-gray-50/50"></div>;
                  }

                  const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const dayEvents = eventsByDate[dateStr] || [];
                  
                  const isSunday = idx % 7 === 0;
                  const isSaturday = idx % 7 === 6;

                  const isTodayCell = 
                    new Date().getFullYear() === currentDate.getFullYear() &&
                    new Date().getMonth() === currentDate.getMonth() &&
                    new Date().getDate() === day;

                  return (
                    <div 
                      key={day} 
                      className={clsx(
                        "p-1 md:p-1.5 overflow-y-auto hover:bg-gray-50 transition-colors flex flex-col group relative",
                        isTodayCell ? "bg-blue-50/40" : "bg-white"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={clsx(
                          "text-xs md:text-sm font-bold inline-flex items-center justify-center rounded-full w-5 h-5",
                          isTodayCell ? "bg-blue-600 text-white font-black" : (isSunday ? 'text-red-500' : isSaturday ? 'text-blue-500' : 'text-gray-700')
                        )}>
                          {day}
                        </span>
                        {dayEvents.length > 0 && (
                          <span className="text-[10px] text-gray-400 font-semibold md:hidden">
                            {dayEvents.length}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        {dayEvents.map((e, eIdx) => {
                          let badgeClass = 'bg-blue-100 hover:bg-blue-200 text-blue-800 border border-blue-200';

                          if (e.type === 'packing') {
                            badgeClass = 'bg-orange-100 hover:bg-orange-200 text-orange-800 border border-orange-200';
                          } else if (e.type === 'moving') {
                            badgeClass = 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-200';
                          } else if (e.type === 'consultation-pending') {
                            badgeClass = 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold';
                          } else if (e.type === 'consultation-signed') {
                            badgeClass = 'bg-teal-100 hover:bg-teal-200 text-teal-900 border border-teal-300 font-medium';
                          }

                          return (
                            <button
                              key={`${e.id}-${e.type}-${eIdx}`}
                              onClick={() => handleContractClick(e.id)}
                              className={`text-left w-full ${badgeClass} text-[10px] md:text-xs rounded px-1.5 py-1 truncate transition-colors shadow-2xs`}
                            >
                              {e.badgeText}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal for detail and actions */}
      {selectedId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex justify-center items-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">
                  {detailData?.signatureBase64 ? '계약 및 이사 상세' : '견적 상담 상세'}
                </h2>
                {detailData && (
                  detailData.signatureBase64 ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                      <CheckCircle2 size={13} />
                      계약 완료 (서명됨)
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                      <Clock size={13} />
                      견적 상담/검토 중
                    </span>
                  )
                )}
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                <X size={22} />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              {detailLoading ? (
                <div className="py-16 flex justify-center items-center">
                  <Loader2 className="animate-spin text-blue-500" size={32} />
                </div>
              ) : detailData ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-3.5 rounded-xl border flex justify-between items-center">
                    <div>
                      <label className="text-xs font-bold text-gray-500 block mb-0.5">고객명</label>
                      <p className="text-base font-bold text-gray-900">{detailData.customerInfo.name} 님</p>
                    </div>
                    <div className="text-right">
                      <label className="text-xs font-bold text-gray-500 block mb-0.5">총 견적 금액</label>
                      <p className="text-base font-extrabold text-blue-600">
                        {Number(detailData.totalCost || 0).toLocaleString()} <span className="text-sm font-normal text-gray-600">원</span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500">연락처</label>
                    <p className="text-sm font-medium text-gray-800">
                      {detailData.customerInfo.phone}
                      {detailData.customerInfo.secondaryPhone ? ` / ${detailData.customerInfo.secondaryPhone}` : ''}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-blue-50/50 p-3 rounded-xl border border-blue-100 text-center">
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 block">견적(상담)일</label>
                      <p className="text-xs font-bold text-gray-800 mt-0.5">{detailData.customerInfo.contractDate || '-'}</p>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 block">포장일</label>
                      <p className="text-xs font-bold text-gray-800 mt-0.5">{detailData.customerInfo.packingDate || '-'}</p>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 block">운송일</label>
                      <p className="text-xs font-bold text-gray-800 mt-0.5">{detailData.customerInfo.movingDate || '-'}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="text-xs font-bold text-gray-500">출발지</label>
                      <p className="text-xs sm:text-sm font-medium text-gray-800 break-words bg-gray-50 p-2 rounded border">
                        {detailData.customerInfo.departureAddress} {detailData.customerInfo.departureDetailAddress || ''}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500">도착지</label>
                      <p className="text-xs sm:text-sm font-medium text-gray-800 break-words bg-gray-50 p-2 rounded border">
                        {detailData.customerInfo.arrivalAddress} {detailData.customerInfo.arrivalDetailAddress || ''}
                      </p>
                    </div>
                  </div>

                  {/* Electron Signature Link button if unsigned */}
                  {!detailData.signatureBase64 && (
                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 flex items-center justify-between gap-2">
                      <div className="text-xs text-amber-900">
                        <p className="font-bold">아직 서명되지 않은 견적입니다.</p>
                        <p className="text-[11px] text-amber-700">고객 전자서명 링크를 복사해 전송할 수 있습니다.</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopySignLink}
                        className="shrink-0 flex items-center gap-1 text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                        {copiedLink ? '복사됨!' : '서명링크 복사'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-red-500 text-center py-4">데이터를 불러오지 못했습니다.</p>
              )}
            </div>

            <div className="px-6 py-4 border-t bg-gray-50 flex flex-wrap gap-2">
              <button
                onClick={() => handleEdit(selectedId!)}
                disabled={detailLoading || !detailData}
                className="flex-1 min-w-[130px] bg-white border border-indigo-600 text-indigo-700 hover:bg-indigo-50 py-2.5 rounded-xl font-bold flex justify-center items-center gap-1.5 disabled:opacity-50 transition-colors text-sm"
              >
                <Edit size={16} />
                견적 수정/열기
              </button>

              {detailData?.signatureBase64 ? (
                <button
                  onClick={handleDownloadWorkOrder}
                  disabled={detailLoading || pdfLoading || !detailData}
                  className="flex-1 min-w-[150px] bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-bold flex justify-center items-center gap-1.5 disabled:opacity-50 transition-colors text-sm"
                >
                  {pdfLoading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                  {pdfLoading ? '생성 중...' : '작업지시서 PDF'}
                </button>
              ) : (
                <button
                  onClick={() => router.push(`/sign/${selectedId}`)}
                  disabled={detailLoading || !detailData}
                  className="flex-1 min-w-[150px] bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-xl font-bold flex justify-center items-center gap-1.5 disabled:opacity-50 transition-colors text-sm"
                >
                  <ExternalLink size={16} />
                  전자서명 진행하기
                </button>
              )}
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
