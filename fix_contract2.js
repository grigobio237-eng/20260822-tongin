const fs=require('fs'); 
let c=fs.readFileSync('src/components/pdf/ContractPrintDocument.tsx','utf8'); 
c = c.replace(/className="flex justify-between border-b border-dotted border-slate-200 py-0.5"/g, 'className="flex justify-between border-b border-dotted border-slate-200 py-[2px]"');
fs.writeFileSync('src/components/pdf/ContractPrintDocument.tsx', c);
