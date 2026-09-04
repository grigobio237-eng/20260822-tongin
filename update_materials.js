const fs = require('fs');
const newArray = "export const PACKING_MATERIALS = ['특대박스(이불)', '대박스(옷)', '중대박스', '중박스', '소박스', '바구니', '아이스박스', '담요(대)', '담요(중)', '침대비닐커버', '냉장고', '쇼파', '침대', '분해장농', '김치냉장고(대)', '김치냉장고(중)', '세탁기', '서랍장', '피아노', '테이프', '에어캡', '랩'];";

// Update items.ts
let items = fs.readFileSync('src/lib/constants/items.ts', 'utf8');
items = items.replace(/export const PACKING_MATERIALS = \[.*?\];/s, newArray);
fs.writeFileSync('src/lib/constants/items.ts', items);

// Update step3/page.tsx (remove local definition, use imported)
let step3 = fs.readFileSync('src/app/(wizard)/step3/page.tsx', 'utf8');
step3 = step3.replace(/const PACKING_MATERIALS = \[\s*.*?\];/s, '');
fs.writeFileSync('src/app/(wizard)/step3/page.tsx', step3);
console.log('done');
