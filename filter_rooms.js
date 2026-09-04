const fs = require('fs');
let c = fs.readFileSync('src/components/pdf/ContractPrintDocument.tsx', 'utf8');
c = c.replace(/{data\.rooms && data\.rooms\.length > 0 \? \(/, '{data.rooms && data.rooms.filter(r => r.items.length > 0 || r.memo).length > 0 ? (');
c = c.replace(/data\.rooms\.map\(\(room, idx\) => \(/, 'data.rooms.filter(r => r.items.length > 0 || r.memo).map((room, idx) => (');
fs.writeFileSync('src/components/pdf/ContractPrintDocument.tsx', c);
