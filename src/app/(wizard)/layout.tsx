'use client';

import React from 'react';
import { useWizardStore } from '@/store/wizardStore';
import { useSettingsStore } from '@/store/settingsStore';
import { Settings, ChevronRight } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header / Step Indicator */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm w-full">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          
          {/* Left: Company Name (Dynamic) */}
          <div className="hidden md:flex items-center w-1/4">
            <span className="font-black text-xl text-blue-900 tracking-tight">
              {companyName || '통인익스프레스'}
            </span>
          </div>

          {/* Center: Steps with Arrows */}
          <div className="flex-1 flex items-center justify-center">
            {steps.map((step, idx) => (
              <React.Fragment key={step.num}>
                <button 
                  type="button"
                  onClick={() => {
                    useWizardStore.getState().setStep(step.num);
                    router.push(`/step${step.num}`);
                  }}
                  className="flex flex-col items-center focus:outline-none"
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
                  <div className="px-2 sm:px-4 mb-4 text-gray-300">
                    <ChevronRight size={18} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
          
          {/* Right: Action Buttons */}
          <div className="flex items-center justify-end gap-2 w-1/4">
            <NotificationBell />
            <button 
              onClick={() => router.push('/settings')}
              className="text-gray-500 hover:text-blue-600 p-2 bg-gray-50 hover:bg-blue-50 rounded-full border border-gray-200 transition-colors"
              aria-label="단가 설정"
            >
              <Settings size={20} />
            </button>
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
