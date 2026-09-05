const fs = require('fs');
let code = fs.readFileSync('src/lib/constants/items.ts', 'utf8');

// Move PACKING_MATERIALS up, right after createStandardVariants
const pmLine = "export const PACKING_MATERIALS = ['특대박스(이불)', '대박스(옷)', '중대박스', '중박스', '소박스', '바구니', '아이스박스', '담요(대)', '담요(중)', '침대비닐커버', '냉장고', '쇼파', '침대', '분해장농', '김치냉장고(대)', '김치냉장고(중)', '세탁기', '건조기', '서랍장', '피아노', '테이프', '에어캡', '랩', 'TV(50인치이하)', 'TV(65~75인치)', 'TV(85인치이상)'];\n";
code = code.replace(pmLine, ''); // remove from bottom

const insertTarget = "];\n\nexport const ROOM_ITEMS";
const insertText = "];\n\n" + pmLine + "\nexport const ROOM_ITEMS";
code = code.replace(insertTarget, insertText);

// Change RoomCategory
code = code.replace(
  "'안방' | '입구방' | '작은방1' | '작은방2' | '작은방3' | '거실' | '주방' | '앞 발코니'",
  "'안방' | '입구방' | '작은방1' | '작은방2' | '작은방3' | '거실' | '주방' | '앞 발코니' | '뒤 발코니' | '다용도실 및 현관'"
);

// Add REAR_BALCONY_ITEMS and UTILITY_ROOM_ITEMS
const newRooms = 
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
;

code = code.replace("export const ROOM_CATEGORIES", newRooms + "\nexport const ROOM_CATEGORIES");

// Update ROOM_CATEGORIES
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
