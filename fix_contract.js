const fs=require('fs'); 
let c=fs.readFileSync('src/components/pdf/ContractPrintDocument.tsx','utf8'); 
c=c.replace(/leading-tight/g, 'leading-[1.4]'); 
c=c.replace(/className="font-bold text-blue-900 mb-1 border-l-2 border-blue-900 pl-2"/g, 'className="font-bold text-blue-900 mb-1 border-l-2 border-blue-900 pl-2 pb-[2px]"'); 
c=c.replace('className="grid grid-cols-2 gap-4"','className="flex flex-row flex-wrap gap-4"'); 
c=c.replace(/className="border border-slate-300 p-2 rounded break-inside-avoid[^"]*"/g, 'className="border border-slate-300 p-2 rounded break-inside-avoid w-[calc(50%-0.5rem)] flex-none bg-white shadow-sm"'); 
fs.writeFileSync('src/components/pdf/ContractPrintDocument.tsx',c); 
