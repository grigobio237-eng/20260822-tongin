const fs = require('fs');
let code = fs.readFileSync('src/lib/constants/items.ts', 'utf8');

const targetRegex = /export const KITCHEN_ITEMS: MasterItem\[\] = \[\s*([\s\S]*?)\];/;

const replacement = `export const KITCHEN_ITEMS: MasterItem[] = [
  { name: '도서/소형물품(소박스용)', variants: [{ name: '소박스', cbm: 0, isDefault: true }] },
  { name: '생활물품/잔짐류(중박스용)', variants: [{ name: '중박스', cbm: 0, isDefault: true }] },
  {
    name: '식탁',
    variants: [
      { name: '2인용', cbm: 0.4 },
      { name: '4인용 (의자 포함, 기본)', cbm: 0.8, isDefault: true },
      { name: '6인용 / 8인용 대형', cbm: 1.3 },
    ]
  },
  { name: '의자', variants: ROOM_ITEMS.find(i => i.name === '의자')!.variants },
  { name: '장식장', variants: ROOM_ITEMS.find(i => i.name === '장식장')!.variants },
  { name: '수납장', variants: createStandardVariants(0.2, 0.4, 0.8) },
  {
    name: '냉장고',
    variants: [
      { name: '일반 2도어 (~500L)', cbm: 1.2 },
      { name: '4도어/양문형 (기본)', cbm: 1.6, isDefault: true },
      { name: '비스포크/오브제 4도어', cbm: 1.8 },
    ]
  },
  { name: '정수기', variants: createStandardVariants(0.05, 0.1, 0.2) },
  {
    name: '식기세척기',
    variants: [
      { name: '6인용/소형', cbm: 0.2 },
      { name: '12인용/빌트인 (기본)', cbm: 0.5, isDefault: true },
    ]
  },
  {
    name: '김치냉장고',
    variants: [
      { name: '1도어/소형', cbm: 0.4 },
      { name: '뚜껑식 2룸', cbm: 0.7 },
      { name: '스탠드형 4룸 (기본)', cbm: 1.1, isDefault: true },
    ]
  },
  { name: '가스렌지', variants: createStandardVariants(0.05, 0.1, 0.2) },
  { name: '식기류', variants: createStandardVariants(0.1, 0.3, 0.6) },
];`;

code = code.replace(targetRegex, replacement);

fs.writeFileSync('src/lib/constants/items.ts', code);
console.log('KITCHEN_ITEMS updated');
