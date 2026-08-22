'use client';

import React from 'react';
import { useWizardStore } from '@/store/wizardStore';
import clsx from 'clsx';

export default function WizardLayout({ children }: { children: React.ReactNode }) {
  const currentStep = useWizardStore(state => state.currentStep);
  
  const steps = [
    { num: 1, label: '기본정보' },
    { num: 2, label: '물품/CBM' },
    { num: 3, label: '옵션/메모' },
    { num: 4, label: '정산/서명' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header / Step Indicator */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <div key={step.num} className="flex flex-col items-center flex-1">
                <div 
                  className={clsx(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-1",
                    currentStep >= step.num ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
                  )}
                >
                  {step.num}
                </div>
                <span className={clsx(
                  "text-xs",
                  currentStep >= step.num ? "text-blue-600 font-semibold" : "text-gray-400"
                )}>
                  {step.label}
                </span>
                {idx < steps.length - 1 && (
                  <div className="hidden sm:block absolute w-full h-0.5 bg-gray-200 -z-10 top-4 left-1/2" />
                )}
              </div>
            ))}
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
