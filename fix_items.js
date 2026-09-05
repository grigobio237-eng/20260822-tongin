const fs = require('fs');
let code = fs.readFileSync('src/lib/constants/items.ts', 'utf8');

const t1 = "export type RoomCategory = '规 1' | '规 2' | '规 3' | '规 4' | '规 5' | '芭角' | '林规' | '海鄂促';";
const t2 = "export type RoomCategory = '救规' | '涝备规' | '累篮规1' | '累篮规2' | '累篮规3' | '芭角' | '林规' | '海鄂促';";
code = code.replace(t1, t2);

const r1 = "export const ROOM_CATEGORIES: Record<RoomCategory, MasterItem[]> = {\r\n  '规 1': ROOM_ITEMS,\r\n  '规 2': ROOM_ITEMS,\r\n  '规 3': ROOM_ITEMS,\r\n  '规 4': ROOM_ITEMS,\r\n  '规 5': ROOM_ITEMS,";
const r2 = "export const ROOM_CATEGORIES: Record<RoomCategory, MasterItem[]> = {\r\n  '救规': ROOM_ITEMS,\r\n  '涝备规': ROOM_ITEMS,\r\n  '累篮规1': ROOM_ITEMS,\r\n  '累篮规2': ROOM_ITEMS,\r\n  '累篮规3': ROOM_ITEMS,";
code = code.replace(r1, r2);

const r1_n = "export const ROOM_CATEGORIES: Record<RoomCategory, MasterItem[]> = {\n  '规 1': ROOM_ITEMS,\n  '规 2': ROOM_ITEMS,\n  '规 3': ROOM_ITEMS,\n  '规 4': ROOM_ITEMS,\n  '规 5': ROOM_ITEMS,";
const r2_n = "export const ROOM_CATEGORIES: Record<RoomCategory, MasterItem[]> = {\n  '救规': ROOM_ITEMS,\n  '涝备规': ROOM_ITEMS,\n  '累篮规1': ROOM_ITEMS,\n  '累篮规2': ROOM_ITEMS,\n  '累篮规3': ROOM_ITEMS,";
code = code.replace(r1_n, r2_n);

fs.writeFileSync('src/lib/constants/items.ts', code);
console.log('done');
