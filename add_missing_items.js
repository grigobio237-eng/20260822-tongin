const fs = require('fs');
let code = fs.readFileSync('src/lib/constants/items.ts', 'utf8');

const target = `    variants: [
      { name: '벽걸이형', cbm: 0.2 },
      { name: '스탠드형 (기본)', cbm: 0.5, isDefault: true },
      { name: '2in1 (스탠드+벽걸이)', cbm: 1.1 },
    ]
  },
];`;

const replacement = `    variants: [
      { name: '벽걸이형', cbm: 0.2 },
      { name: '스탠드형 (기본)', cbm: 0.5, isDefault: true },
      { name: '2in1 (스탠드+벽걸이)', cbm: 1.1 },
    ]
  },
  { name: '공기청정기', variants: createStandardVariants(0.1, 0.2, 0.4) },
  { name: '고가구', variants: createStandardVariants(0.5, 1.0, 1.5) },
  {
    name: '탁자',
    variants: [
      { name: '소형/티테이블', cbm: 0.2 },
      { name: '일반 (기본)', cbm: 0.4, isDefault: true },
      { name: '대형', cbm: 0.8 },
    ]
  },
];`;

code = code.replace(target, replacement);

fs.writeFileSync('src/lib/constants/items.ts', code);
console.log('ROOM_ITEMS updated with 공기청정기, 고가구, 탁자');
