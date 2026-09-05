const fs = require('fs');
let code = fs.readFileSync('src/lib/constants/items.ts', 'utf8');

const newRooms = `
export const REAR_BALCONY_ITEMS: MasterItem[] = [
  { name: '세탁기', variants: ROOM_ITEMS.find(i => i.name === '세탁기')!.variants },
  { name: '건조기', variants: ROOM_ITEMS.find(i => i.name === '건조기')!.variants },
  { name: '워시타워', variants: [{ name: '일체형 (기본)', cbm: 1.5, isDefault: true }] },
  { name: '생활물품/잔짐류(중박스용)', variants: [{ name: '중박스', cbm: 0, isDefault: true }] },
  { name: '도서/소형물품(소박스용)', variants: [{ name: '소박스', cbm: 0, isDefault: true }] },
  { name: '기타물품1', variants: PACKING_MATERIALS.map(m => ({ name: m, cbm: 0 })) },
  { name: '기타물품2', variants: PACKING_MATERIALS.map(m => ({ name: m, cbm: 0 })) },
];

export const UTILITY_ROOM_ITEMS: MasterItem[] = [
  { name: '신발류(중박스용)', variants: [{ name: '중박스', cbm: 0, isDefault: true }] },
  { name: '생활물품/잔짐류(중박스용)', variants: [{ name: '중박스', cbm: 0, isDefault: true }] },
  { name: '기타물품1', variants: PACKING_MATERIALS.map(m => ({ name: m, cbm: 0 })) },
  { name: '기타물품2', variants: PACKING_MATERIALS.map(m => ({ name: m, cbm: 0 })) },
];

export const ROOM_CATEGORIES`;

code = code.replace('export const ROOM_CATEGORIES', newRooms);

code = code.replace(
  "'앞 발코니': VERANDA_ITEMS,\r\n};",
  "'앞 발코니': VERANDA_ITEMS,\r\n  '뒤 발코니': REAR_BALCONY_ITEMS,\r\n  '다용도실 및 현관': UTILITY_ROOM_ITEMS,\r\n};"
);
code = code.replace(
  "'앞 발코니': VERANDA_ITEMS,\n};",
  "'앞 발코니': VERANDA_ITEMS,\n  '뒤 발코니': REAR_BALCONY_ITEMS,\n  '다용도실 및 현관': UTILITY_ROOM_ITEMS,\n};"
);

fs.writeFileSync('src/lib/constants/items.ts', code);
console.log('done');
