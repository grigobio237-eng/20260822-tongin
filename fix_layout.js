const fs = require('fs');
let c = fs.readFileSync('src/components/pdf/WorkOrderPrintDocument.tsx', 'utf8');

// 1. Remove truncate from item name spans to prevent overflow: hidden clipping
c = c.replace(/className="truncate flex-1"/g, 'className="flex-1 pb-[2px]"');

// 2. Filter empty rooms
c = c.replace(/{rooms\?\.map\(room => \(/g, '{rooms?.filter(r => r.items.length > 0 || r.memo).map(room => (');

// 3. Force page break before section 6
c = c.replace(/<div className="flex-1 html2pdf__page-break">/g, '<div className="flex-1" style={{ pageBreakBefore: \\"always\\" }}>');
// Let's also check if it was html2pdf__page-break on section 5? I swapped them.
// Let's just find the section 6 heading and change its wrapper.
// Actually, earlier I did c=c.replace(/className="border border-slate-300 p-2 rounded break-inside-avoid w-\[calc\(50%-0.5rem\)\] flex-none bg-white shadow-sm"/g, ...)

fs.writeFileSync('src/components/pdf/WorkOrderPrintDocument.tsx', c);
