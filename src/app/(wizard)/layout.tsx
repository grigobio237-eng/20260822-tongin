'use client';

import React from 'react';
import { useWizardStore } from '@/store/wizardStore';
import { useSettingsStore } from '@/store/settingsStore';
import { Settings, ChevronRight, CalendarDays, FilePlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import NotificationBell from '@/components/layout/NotificationBell';

export default function WizardLayout({ children }: { children: React.ReactNode }) {
  const currentStep = useWizardStore(state => state.currentStep);
  const companyName = useSettingsStore(state => state.companyName);
  const router = useRouter();
  
  const steps = [
    { num: 1, label: '기본정보' },
    { num: 2, label: '물품/CBM' },
    { num: 3, label: '옵션/메모' },
    { num: 4, label: '정산/서명' },
  ];

  const renderActionButtons = (isMobile = false) => (
    <div className={clsx("flex items-center gap-1.5", !isMobile && "justify-end gap-2 w-full")}>
      <button
        onClick={() => {
          if (window.confirm('새 계약서를 작성하시겠습니까? 현재 작성 중인 내용은 초기화됩니다.')) {
            useWizardStore.getState().reset();
            router.push('/step1');
          }
        }}
        className={clsx(
          "flex items-center gap-1 font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-full hover:bg-blue-100 transition-colors shrink-0",
          isMobile ? "text-[11px] px-2.5 py-1" : "text-[11px] px-3 py-1.5 mr-1"
        )}
      >
        <FilePlus size={isMobile ? 13 : 14} />
        <span>새 계약</span>
      </button>
      <button 
        onClick={() => router.push('/schedule')}
        className={clsx(
          "text-gray-500 hover:text-blue-600 rounded-full border border-gray-200 transition-colors",
          isMobile ? "p-1.5 bg-white" : "p-2 bg-gray-50 hover:bg-blue-50"
        )}
        aria-label="일정 관리"
      >
        <CalendarDays size={isMobile ? 18 : 20} />
      </button>
      <NotificationBell />
      <button 
        onClick={() => router.push('/settings')}
        className={clsx(
          "text-gray-500 hover:text-blue-600 rounded-full border border-gray-200 transition-colors",
          isMobile ? "p-1.5 bg-white" : "p-2 bg-gray-50 hover:bg-blue-50"
        )}
        aria-label="환경 설정"
      >
        <Settings size={isMobile ? 18 : 20} />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header / Step Indicator */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm w-full">
        {/* 모바일 상단 바 (Row 1): 회사명 & 빠른 액션 버튼들 */}
        <div className="flex md:hidden items-center justify-between px-3 py-1.5 border-b border-gray-100 bg-slate-50/80">
          <span className="font-extrabold text-sm text-blue-900 tracking-tight">
            {companyName || '통인익스프레스'}
          </span>
          {renderActionButtons(true)}
        </div>

        {/* 메인 헤더 (데스크톱 1줄 / 모바일 스텝 전용 Row 2) */}
        <div className="max-w-5xl mx-auto px-4 py-2.5 md:py-3 flex items-center justify-between">
          
          {/* Left: Company Name (Dynamic, Desktop Only) */}
          <div className="hidden md:flex items-center w-1/4">
            <span className="font-black text-xl text-blue-900 tracking-tight">
              {companyName || '통인익스프레스'}
            </span>
          </div>

          {/* Center: Steps with Arrows (모바일에서는 가로 폭 100%를 활용하여 겹침 없음) */}
          <div className="flex-1 flex items-center justify-center">
            {steps.map((step, idx) => (
              <React.Fragment key={step.num}>
                <button 
                  type="button"
                  onClick={() => {
                    useWizardStore.getState().setStep(step.num);
                    router.push(`/step${step.num}`);
                  }}
                  className="flex flex-col items-center focus:outline-none px-1"
                >
                  <div 
                    className={clsx(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-1 transition-colors hover:ring-2 hover:ring-blue-300 cursor-pointer",
                      currentStep >= step.num ? "bg-blue-600 text-white shadow-md" : "bg-gray-200 text-gray-500"
                    )}
                  >
                    {step.num}
                  </div>
                  <span className={clsx(
                    "text-[11px] whitespace-nowrap transition-colors",
                    currentStep >= step.num ? "text-blue-700 font-bold" : "text-gray-400 font-medium"
                  )}>
                    {step.label}
                  </span>
                </button>
                
                {idx < steps.length - 1 && (
                  <div className="px-1.5 sm:px-4 mb-4 text-gray-300">
                    <ChevronRight size={16} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
          
          {/* Right: Action Buttons (Desktop Only) */}
          <div className="hidden md:flex items-center justify-end w-1/4">
            {renderActionButtons(false)}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 pb-32">
        {children}
      </main>
    </div>
  );
}
