const fs = require('fs');
let code = fs.readFileSync('src/lib/constants/items.ts', 'utf8');

// Update 냉장고
code = code.replace(
  /\{\s*name:\s*'냉장고',\s*variants:\s*\[[\s\S]*?\]\s*\}/,
  `{
    name: '냉장고',
    variants: [
      { name: '일반 소형/원룸 (1~2도어)', cbm: 0.5 },
      { name: '슬림 2도어 (300~400L, 기본)', cbm: 1, isDefault: true },
      { name: '키친핏/빌트인 (600L대)', cbm: 1.5 },
      { name: '4도어 패밀리형 대형 (800L+)', cbm: 2 },
    ]
  }`
);

// Update 김치냉장고
code = code.replace(
  /\{\s*name:\s*'김치냉장고',\s*variants:\s*\[[\s\S]*?\]\s*\}/,
  `{
    name: '김치냉장고',
    variants: [
      { name: '뚜껑형 (1~2룸)', cbm: 0.5 },
      { name: '스탠드 3도어 (300~400L, 기본)', cbm: 1, isDefault: true },
      { name: '스탠드 4도어 대형 (500L)', cbm: 1.5 },
    ]
  }`
);

fs.writeFileSync('src/lib/constants/items.ts', code);
console.log('냉장고 & 김치냉장고 updated');
