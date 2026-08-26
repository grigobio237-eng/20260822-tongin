'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, CheckCircle, Clock } from 'lucide-react';

export default function AdminContractsPage() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/contract-list')
      .then(res => res.json())
      .then(json => {
        if (json.success) setContracts(json.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">불러오는 중...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 py-8">
      <h1 className="text-2xl font-black text-slate-800 mb-6">견적 및 계약 관리 대시보드</h1>
      
      <div className="grid gap-4">
        {contracts.map(contract => {
          const isSigned = !!contract.signature_url;
          return (
            <div key={contract.id} className="bg-white p-5 rounded-xl border shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-bold text-slate-800">{contract.customer_name} 고객님</h2>
                  <span className="text-xs text-gray-400">({contract.customer_phone})</span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>이사 예정일: {contract.moving_date}</p>
                  <p>총 견적금액: <span className="font-semibold">{Number(contract.total_cost).toLocaleString()} 원</span></p>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-3">
                {isSigned ? (
                  <span className="flex items-center gap-1 text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    <CheckCircle size={16} />
                    계약 체결 완료 (서명됨)
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-sm font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                    <Clock size={16} />
                    견적 검토 중 (미서명)
                  </span>
                )}
                <Link 
                  href={`/sign/${contract.id}`} 
                  target="_blank"
                  className="flex items-center gap-1 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  <FileText size={16} />
                  문서 열람하기
                </Link>
              </div>
            </div>
          );
        })}
        {contracts.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed">
            아직 생성된 견적서가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
