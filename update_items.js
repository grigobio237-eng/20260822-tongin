const fs = require('fs');
let code = fs.readFileSync('src/lib/constants/items.ts', 'utf8');

code = code.replace(
  "export type RoomCategory = '规 1' | '规 2' | '规 3' | '规 4' | '规 5' | '芭角' | '林规' | '海鄂促';",
  "export type RoomCategory = '救规' | '涝备规' | '累篮规1' | '累篮规2' | '累篮规3' | '芭角' | '林规' | '海鄂促';"
);

code = code.replace(
  "'规 1': ROOM_ITEMS,\n  '规 2': ROOM_ITEMS,\n  '规 3': ROOM_ITEMS,\n  '规 4': ROOM_ITEMS,\n  '规 5': ROOM_ITEMS,",
  "'救规': ROOM_ITEMS,\n  '涝备规': ROOM_ITEMS,\n  '累篮规1': ROOM_ITEMS,\n  '累篮规2': ROOM_ITEMS,\n  '累篮规3': ROOM_ITEMS,"
);

code = code.replace(
  "'规 1': ROOM_ITEMS,\r\n  '规 2': ROOM_ITEMS,\r\n  '规 3': ROOM_ITEMS,\r\n  '规 4': ROOM_ITEMS,\r\n  '规 5': ROOM_ITEMS,",
  "'救规': ROOM_ITEMS,\r\n  '涝备规': ROOM_ITEMS,\r\n  '累篮规1': ROOM_ITEMS,\r\n  '累篮规2': ROOM_ITEMS,\r\n  '累篮规3': ROOM_ITEMS,"
);

fs.writeFileSync('src/lib/constants/items.ts', code);
console.log('done');
