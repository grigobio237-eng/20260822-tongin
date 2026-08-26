'use client';

import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotificationBell() {
  const router = useRouter();
  const [hasNew, setHasNew] = useState(false);

  useEffect(() => {
    // 30초마다 서명된 계약서 개수를 체크합니다.
    const checkSignedContracts = async () => {
      try {
        const res = await fetch('/api/contract-signed-count');
        const json = await res.json();
        
        if (json.success) {
          const currentCount = json.count;
          const lastSeenCount = parseInt(localStorage.getItem('lastSeenSignedCount') || '0', 10);
          
          if (currentCount > lastSeenCount) {
            setHasNew(true);
          }
        }
      } catch (err) {
        console.error('Failed to fetch signed count', err);
      }
    };

    checkSignedContracts(); // 초기 로드 시 체크
    const interval = setInterval(checkSignedContracts, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    // 뱃지를 숨기고, 현재까지의 카운트를 localStorage에 저장하기 위해 다시 패치하거나 
    // 그냥 현재 빨간 점만 없앱니다. 
    // Admin 페이지 마운트 시 localStorage를 갱신하도록 하는 것이 가장 안전합니다.
    setHasNew(false);
    router.push('/admin/contracts');
  };

  return (
    <button 
      onClick={handleClick}
      className="relative p-2 text-gray-400 hover:text-gray-700 bg-white rounded-full shadow-sm border transition-colors"
      aria-label="알림"
    >
      <Bell size={20} />
      {hasNew && (
        <span className="absolute top-0 right-0 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      )}
    </button>
  );
}
