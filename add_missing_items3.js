const fs = require('fs');
let code = fs.readFileSync('src/lib/constants/items.ts', 'utf8');

const target = `  {
    name: '탁자',
    variants: [
      { name: '소형/티테이블', cbm: 0.2 },
      { name: '일반 (기본)', cbm: 0.4, isDefault: true },
      { name: '대형', cbm: 0.8 },
    ]
  },
];`;

const replacement = `  {
    name: '탁자',
    variants: [
      { name: '소형/티테이블', cbm: 0.2 },
      { name: '일반 (기본)', cbm: 0.4, isDefault: true },
      { name: '대형', cbm: 0.8 },
    ]
  },
  {
    name: '피아노',
    variants: [
      { name: '콘솔/디지털', cbm: 1.0 },
      { name: '일반/업라이트 (기본)', cbm: 2.0, isDefault: true },
      { name: '그랜드 피아노', cbm: 4.0 },
    ]
  },
  {
    name: '에어드레서/스타일러',
    variants: [
      { name: '3벌용/소형', cbm: 0.5 },
      { name: '5벌용/일반 (기본)', cbm: 0.8, isDefault: true },
      { name: '대용량', cbm: 1.2 },
    ]
  },
];`;

code = code.replace(target, replacement);
fs.writeFileSync('src/lib/constants/items.ts', code);
console.log('Added 피아노 and 에어드레서 to ROOM_ITEMS');
