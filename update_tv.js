const fs = require('fs');
let code = fs.readFileSync('src/lib/constants/items.ts', 'utf8');

// Replace TV variants
const tvPattern = /\{\s*name:\s*'TV',\s*variants:\s*\[[\s\S]*?\]\s*\}/;

const newTV = `{
    name: 'TV',
    variants: [
      { name: '55인치 이하', cbm: 0.5 },
      { name: '65인치 (표준, 기본)', cbm: 0.5, isDefault: true },
      { name: '75인치 (대형)', cbm: 1 },
      { name: '85인치 (특대형)', cbm: 1.5 },
      { name: '98인치 이상 (초대형)', cbm: 2 },
    ]
  }`;

code = code.replace(tvPattern, newTV);

fs.writeFileSync('src/lib/constants/items.ts', code);
console.log('TV variants updated');
