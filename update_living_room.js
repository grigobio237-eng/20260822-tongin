const fs = require('fs');
let code = fs.readFileSync('src/lib/constants/items.ts', 'utf8');

const targetRegex = /export const LIVING_ROOM_ITEMS: MasterItem\[\] = \[\s*([\s\S]*?)\];/;

const replacement = `export const LIVING_ROOM_ITEMS: MasterItem[] = [
  { name: '도서/소형물품(소박스용)', variants: [{ name: '소박스', cbm: 0, isDefault: true }] },
  { name: '생활물품/잔짐류(중박스용)', variants: [{ name: '중박스', cbm: 0, isDefault: true }] },
  {
    name: '쇼파',
    variants: [
      { name: '1인용 / 리클라이너 1인', cbm: 0.5 },
      { name: '3인용 (기본)', cbm: 1.2, isDefault: true },
      { name: '4인용 카우치/코너형', cbm: 1.8 },
      { name: '리클라이너 4인 / 패밀리', cbm: 2.4 },
    ]
  },
  { name: '탁자', variants: ROOM_ITEMS.find(i => i.name === '탁자')!.variants },
  { name: '책장', variants: ROOM_ITEMS.find(i => i.name === '책장')!.variants },
  { name: '책상', variants: ROOM_ITEMS.find(i => i.name === '책상')!.variants },
  { name: '의자', variants: ROOM_ITEMS.find(i => i.name === '의자')!.variants },
  { name: 'TV', variants: ROOM_ITEMS.find(i => i.name === 'TV')!.variants },
  { name: '장식장', variants: ROOM_ITEMS.find(i => i.name === '장식장')!.variants },
  { name: '에어컨', variants: ROOM_ITEMS.find(i => i.name === '에어컨')!.variants },
  { name: '콘솔', variants: createStandardVariants(0.2, 0.4, 0.6) },
  { name: '거실장식장', variants: createStandardVariants(0.5, 1.0, 1.5) },
  { name: '에어드레서/스타일러', variants: ROOM_ITEMS.find(i => i.name === '에어드레서/스타일러')!.variants },
  { name: '공기청정기', variants: ROOM_ITEMS.find(i => i.name === '공기청정기')!.variants },
];`;

code = code.replace(targetRegex, replacement);

fs.writeFileSync('src/lib/constants/items.ts', code);
console.log('LIVING_ROOM_ITEMS updated');
