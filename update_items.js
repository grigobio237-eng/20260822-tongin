const fs = require('fs');
let code = fs.readFileSync('src/lib/constants/items.ts', 'utf8');

code = code.split("{ name: '생활물품(잔짐류)', variants: [{ name: '중박스', cbm: 0, isDefault: true }] },").join(
  "{ name: '도서/소형물품(소박스용)', variants: [{ name: '소박스', cbm: 0, isDefault: true }] },\n  { name: '생활물품/잔짐류(중박스용)', variants: [{ name: '중박스', cbm: 0, isDefault: true }] },"
);

fs.writeFileSync('src/lib/constants/items.ts', code);
console.log('done');
