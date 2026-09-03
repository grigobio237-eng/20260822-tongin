import sys

with open('src/components/pdf/WorkOrderPrintDocument.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('<div>\n          <h4 className="font-bold text-blue-900 mb-1 border-l-2 border-blue-900 pl-2">1. 작업 개요</h4>', '<div className="break-inside-avoid">\n          <h4 className="font-bold text-blue-900 mb-1 border-l-2 border-blue-900 pl-2">1. 작업 개요</h4>')
content = content.replace('<div className="grid grid-cols-2 gap-4">', '<div className="grid grid-cols-2 gap-4 break-inside-avoid">', 1)
content = content.replace('<div>\n          <h4 className="font-bold text-blue-900 mb-1 border-l-2 border-blue-900 pl-2">4. 고객 특이사항 및 추가 옵션</h4>', '<div className="break-inside-avoid">\n          <h4 className="font-bold text-blue-900 mb-1 border-l-2 border-blue-900 pl-2">4. 고객 특이사항 및 추가 옵션</h4>')
content = content.replace('{rooms?.map(room => (\n              <div key={room.name} className="border border-slate-300 p-2 rounded">', '{rooms?.map(room => (\n              <div key={room.name} className="border border-slate-300 p-2 rounded break-inside-avoid">')
content = content.replace('<div>\n          <h4 className="font-bold text-blue-900 mb-1 border-l-2 border-blue-900 pl-2">6. 포장 재료 준비 목록</h4>', '<div className="break-inside-avoid">\n          <h4 className="font-bold text-blue-900 mb-1 border-l-2 border-blue-900 pl-2">6. 포장 재료 준비 목록</h4>')
content = content.replace('<div className="mt-2 border-2 border-slate-300 p-4 rounded bg-slate-50 flex justify-between items-center">', '<div className="mt-2 border-2 border-slate-300 p-4 rounded bg-slate-50 flex justify-between items-center break-inside-avoid">')

with open('src/components/pdf/WorkOrderPrintDocument.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
