const fs=require('fs'); 
let c=fs.readFileSync('src/components/pdf/WorkOrderPrintDocument.tsx','utf8'); 
c = c.replace(/className="flex justify-between text-\[10px\]"/g, 'className="flex justify-between text-[10px] py-[1px]"');
fs.writeFileSync('src/components/pdf/WorkOrderPrintDocument.tsx', c);
