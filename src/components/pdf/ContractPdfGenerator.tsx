'use client';
import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useWizardStore } from '@/store/wizardStore';

interface Props {
  onGenerated?: (pdfBlob: string) => void;
  totalCost: number;
  deposit: number;
  balance: number;
}

export function ContractPdfGenerator({ onGenerated, totalCost, deposit, balance }: Props) {
  const { customerInfo, totalCbm, resources, sttMemo } = useWizardStore();
  const pdfRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    if (!pdfRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(pdfRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/jpeg', 0.8);
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      
      // Save directly to device
      const fileName = `통인익스프레스_계약서_${customerInfo.name || '고객'}.pdf`;
      pdf.save(fileName);
      
      if (onGenerated) {
        // Return base64 URL so it can be viewed if needed
        const dataUri = pdf.output('datauristring');
        onGenerated(dataUri);
      }
    } catch (error) {
      console.error('PDF generation error', error);
      alert('PDF 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <button 
        onClick={generatePDF} 
        disabled={isGenerating}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-md flex justify-center items-center gap-2"
      >
        {isGenerating ? (
          <span>생성 중...</span>
        ) : (
          <>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            PDF 계약서 다운로드
          </>
        )}
      </button>

      {/* Hidden PDF Layout */}
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', width: '210mm', backgroundColor: '#fff' }}>
        <div ref={pdfRef} style={{ width: '210mm', minHeight: '297mm', position: 'relative', fontFamily: 'sans-serif', backgroundColor: '#fff' }}>
          {/* Background Template Image */}
          <img 
            src="/images/contract-template.png" 
            alt="Contract Template" 
            style={{ width: '100%', height: 'auto', display: 'block' }} 
            crossOrigin="anonymous" 
          />
          
          {/* Absolute Overlays for Data */}
          {/* NOTE: These coordinates (top, left) are approximations based on the uploaded template image. 
              They might need fine-tuning, but they will print actual user data on the PDF! */}
          
          <div style={{ position: 'absolute', top: '10.5%', left: '8%', fontSize: '14px', fontWeight: 'bold' }}>
            {customerInfo.name}
          </div>
          <div style={{ position: 'absolute', top: '10.5%', left: '30%', fontSize: '14px' }}>
            {customerInfo.phone}
          </div>
          
          <div style={{ position: 'absolute', top: '10.5%', left: '85%', fontSize: '14px' }}>
            {customerInfo.contractDate}
          </div>
          <div style={{ position: 'absolute', top: '12.5%', left: '85%', fontSize: '14px' }}>
            {customerInfo.packingDate}
          </div>
          <div style={{ position: 'absolute', top: '14.5%', left: '85%', fontSize: '14px' }}>
            {customerInfo.movingDate}
          </div>
          
          <div style={{ position: 'absolute', top: '12.5%', left: '8%', fontSize: '12px', width: '40%' }}>
            {customerInfo.departureAddress} ({customerInfo.departureFloor}층)
          </div>
          <div style={{ position: 'absolute', top: '14.5%', left: '8%', fontSize: '12px', width: '40%' }}>
            {customerInfo.arrivalAddress} ({customerInfo.arrivalFloor}층)
          </div>
          
          <div style={{ position: 'absolute', top: '69%', left: '38%', fontSize: '16px', fontWeight: 'bold' }}>
            {totalCbm} CBM
          </div>
          
          <div style={{ position: 'absolute', top: '74%', left: '88%', fontSize: '14px', fontWeight: 'bold', color: 'red' }}>
            {totalCost?.toLocaleString()} 원
          </div>
          <div style={{ position: 'absolute', top: '76.5%', left: '88%', fontSize: '14px', fontWeight: 'bold' }}>
            {deposit?.toLocaleString()} 원
          </div>
          <div style={{ position: 'absolute', top: '79%', left: '88%', fontSize: '14px', fontWeight: 'bold' }}>
            {balance?.toLocaleString()} 원
          </div>

          {/* Memo */}
          <div style={{ position: 'absolute', top: '85%', left: '5%', fontSize: '12px', width: '90%', height: '60px', overflow: 'hidden' }}>
            특이사항: {sttMemo || '없음'}
          </div>
        </div>
      </div>
    </div>
  );
}
