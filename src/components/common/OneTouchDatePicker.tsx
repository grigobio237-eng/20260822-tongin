'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react';
import { checkSpecialDate } from '@/lib/dateUtils';
import clsx from 'clsx';

interface OneTouchDatePickerProps {
  value?: string; // Format: 'YYYY-MM-DD'
  onChange: (dateStr: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  allowClear?: boolean;
}

export function OneTouchDatePicker({
  value,
  onChange,
  placeholder = '날짜 선택',
  className = '',
  label,
  allowClear = true,
}: OneTouchDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Initialize view month/year based on value or today
  const initialDate = useMemo(() => {
    if (value) {
      const parts = value.split('-').map(Number);
      if (parts.length === 3 && !parts.some(isNaN)) {
        return new Date(parts[0], parts[1] - 1, parts[2]);
      }
    }
    return new Date();
  }, [value]);

  const [viewDate, setViewDate] = useState<Date>(initialDate);

  // Sync viewDate when modal opens
  useEffect(() => {
    if (isOpen) {
      if (value) {
        const parts = value.split('-').map(Number);
        if (parts.length === 3 && !parts.some(isNaN)) {
          setViewDate(new Date(parts[0], parts[1] - 1, parts[2]));
          return;
        }
      }
      setViewDate(new Date());
    }
  }, [isOpen, value]);

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth(); // 0-indexed

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewYear, viewMonth + 1, 1));
  };

  // Days in month calculation
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 (Sun) to 6 (Sat)

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(d);
    }
    return days;
  }, [viewYear, viewMonth, daysInMonth, firstDayOfWeek]);

  // Formatted display text for input button
  const displayLabel = useMemo(() => {
    if (!value) return '';
    const parts = value.split('-').map(Number);
    if (parts.length === 3 && !parts.some(isNaN)) {
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      if (!isNaN(d.getTime())) {
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        const dayOfWeek = days[d.getDay()];
        return `${parts[0]}.${String(parts[1]).padStart(2, '0')}.${String(parts[2]).padStart(2, '0')} (${dayOfWeek})`;
      }
    }
    return value;
  }, [value]);

  // Quick select helper: immediately updates and closes!
  const handleSelectDay = (day: number) => {
    const formatted = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(formatted);
    setIsOpen(false);
  };

  // Quick select today
  const handleSelectToday = () => {
    const today = new Date();
    const formatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    onChange(formatted);
    setIsOpen(false);
  };

  // Clear date
  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  // Check if a day is today
  const now = new Date();
  const isToday = (day: number) => {
    return (
      now.getFullYear() === viewYear &&
      now.getMonth() === viewMonth &&
      now.getDate() === day
    );
  };

  // Check if a day is selected
  const isSelected = (day: number) => {
    if (!value) return false;
    const parts = value.split('-').map(Number);
    return (
      parts[0] === viewYear &&
      parts[1] === viewMonth + 1 &&
      parts[2] === day
    );
  };

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="relative">
      {/* Trigger Button styled like an input */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={clsx(
          "w-full flex items-center justify-between border rounded-lg px-2.5 py-2 sm:py-2.5 text-left bg-white transition-all text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
          displayLabel ? "text-gray-900 font-semibold" : "text-gray-400",
          isOpen ? "ring-2 ring-blue-500 border-blue-500" : "border-gray-300 hover:border-gray-400",
          className
        )}
      >
        <span className="truncate">{displayLabel || placeholder}</span>
        <CalendarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 shrink-0 ml-1.5 sm:ml-2" />
      </button>

      {/* One-Touch Calendar Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-150"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-[340px] overflow-hidden border border-gray-100 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-gray-900 text-sm">
                  {label ? `${label} 선택` : '날짜 선택'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                title="닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Action Buttons (오늘 / 내일 / 삭제) */}
            <div className="flex items-center justify-between gap-1.5 pt-3 pb-1">
              <button
                type="button"
                onClick={handleSelectToday}
                className="flex-1 py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-xs transition-colors"
              >
                오늘로 즉시 선택
              </button>
              {allowClear && value && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="py-1.5 px-3 bg-gray-100 hover:bg-rose-50 hover:text-rose-600 text-gray-600 font-medium rounded-lg text-xs transition-colors"
                >
                  날짜 삭제
                </button>
              )}
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-between py-2">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                aria-label="이전 달"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="font-extrabold text-base text-gray-800">
                {viewYear}년 {viewMonth + 1}월
              </div>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                aria-label="다음 달"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs pb-1 border-b border-gray-100">
              {dayNames.map((d, i) => (
                <div
                  key={d}
                  className={clsx(
                    "py-1",
                    i === 0 ? "text-red-500" : i === 6 ? "text-blue-600" : "text-gray-500"
                  )}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 pt-2">
              {calendarDays.map((day, idx) => {
                if (day === null) {
                  return <div key={`empty-${idx}`} className="h-10" />;
                }

                const dayOfWeek = (firstDayOfWeek + day - 1) % 7;
                const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const special = checkSpecialDate(dateStr);
                const selected = isSelected(day);
                const today = isToday(day);

                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => handleSelectDay(day)}
                    className={clsx(
                      "h-10 rounded-xl flex flex-col items-center justify-center relative transition-all active:scale-95 group",
                      selected
                        ? "bg-blue-600 text-white font-extrabold shadow-md shadow-blue-500/30 ring-2 ring-blue-300"
                        : today
                        ? "bg-blue-50 border border-blue-300 text-blue-700 font-bold hover:bg-blue-100"
                        : "hover:bg-gray-100 text-gray-800 font-semibold"
                    )}
                  >
                    <span
                      className={clsx(
                        "text-xs leading-none",
                        selected
                          ? "text-white"
                          : dayOfWeek === 0
                          ? "text-red-500"
                          : dayOfWeek === 6
                          ? "text-blue-600"
                          : "text-gray-800"
                      )}
                    >
                      {day}
                    </span>

                    {/* 손없는 날 / 금요일 / 월말 표시 */}
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {special.isSonDay && (
                        <span
                          className={clsx(
                            "text-[8px] leading-tight px-1 rounded-full font-bold",
                            selected
                              ? "bg-amber-300 text-amber-900"
                              : "bg-amber-100 text-amber-800 border border-amber-300"
                          )}
                          title="손없는 날"
                        >
                          손
                        </span>
                      )}
                      {!special.isSonDay && special.isFriday && (
                        <span
                          className={clsx(
                            "w-1 h-1 rounded-full",
                            selected ? "bg-white" : "bg-indigo-400"
                          )}
                          title="금요일"
                        />
                      )}
                      {!special.isSonDay && !special.isFriday && special.isEndOfMonth && (
                        <span
                          className={clsx(
                            "w-1 h-1 rounded-full",
                            selected ? "bg-white" : "bg-rose-400"
                          )}
                          title="월말"
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Helper Info Footer */}
            <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <span className="inline-block px-1 bg-amber-100 text-amber-800 rounded font-bold text-[9px] border border-amber-300">손</span>
                  손없는 날
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
                  금요일
                </span>
              </div>
              <span className="text-blue-600 font-bold">터치 즉시 반영</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
